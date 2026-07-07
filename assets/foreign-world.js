/* Foreign Resource — foreign-world.js
   Wires the Foreign World globe section: markers from section blocks,
   filter tabs, accessible index list, detail card, and the visitor's own
   profile pin (saved by the account portal in localStorage). */
(function () {
  'use strict';

  var PROFILE_KEY = 'fr:profile';
  var instances = [];

  function readJSON(element, fallback) {
    if (!element) return fallback;
    try {
      return JSON.parse(element.textContent);
    } catch (error) {
      return fallback;
    }
  }

  function readProfile() {
    try {
      var raw = window.localStorage.getItem(PROFILE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function setup(section) {
    if (!window.FRGlobe) return null;
    var canvas = section.querySelector('[data-globe-canvas]');
    if (!canvas) return null;

    var strings = readJSON(section.querySelector('[data-globe-strings]'), {});
    var rawMarkers = readJSON(section.querySelector('[data-globe-markers]'), []);

    var markers = rawMarkers
      .map(function (m) {
        return {
          id: m.id,
          type: m.type,
          name: m.name || '',
          lat: parseFloat(m.lat),
          lng: parseFloat(m.lng),
          meta: {
            location: m.location || '',
            eyebrow: m.eyebrow || '',
            description: m.description || '',
            image: m.image || null,
            link: m.link || null,
            linkLabel: m.linkLabel || ''
          }
        };
      })
      .filter(function (m) {
        return isFinite(m.lat) && isFinite(m.lng);
      });

    /* Visitor's own pin, saved by the account portal */
    var arcs = [];
    if (section.getAttribute('data-show-customer-pin') === 'true') {
      var profile = readProfile();
      if (profile && profile.home && isFinite(profile.home.la) && isFinite(profile.home.lo)) {
        var visited = Array.isArray(profile.visited) ? profile.visited : [];
        markers.push({
          id: 'fr-you',
          type: 'you',
          name: profile.name || strings.you || 'You',
          lat: profile.home.la,
          lng: profile.home.lo,
          meta: {
            location: profile.home.n,
            eyebrow: strings.you || 'You',
            description: profile.bio || '',
            visited: visited.map(function (city) { return city.n; }),
            image: null,
            link: null
          }
        });
        visited.forEach(function (city) {
          if (isFinite(city.la) && isFinite(city.lo)) {
            arcs.push({ from: { lat: profile.home.la, lng: profile.home.lo }, to: { lat: city.la, lng: city.lo } });
          }
        });
        var youLegend = section.querySelector('[data-globe-you-legend]');
        if (youLegend) youLegend.hidden = false;
      }
    }

    /* Detail card */
    var card = section.querySelector('[data-globe-card]');
    var cardMedia = section.querySelector('[data-globe-card-media]');
    var cardImage = section.querySelector('[data-globe-card-image]');
    var cardEyebrow = section.querySelector('[data-globe-card-eyebrow]');
    var cardTitle = section.querySelector('[data-globe-card-title]');
    var cardLocation = section.querySelector('[data-globe-card-location]');
    var cardText = section.querySelector('[data-globe-card-text]');
    var cardChips = section.querySelector('[data-globe-card-chips]');
    var cardLink = section.querySelector('[data-globe-card-link]');

    function typeLabel(type) {
      if (type === 'person') return strings.people || 'People';
      if (type === 'place') return strings.places || 'Places';
      if (type === 'property') return strings.properties || 'Properties';
      return strings.you || 'You';
    }

    function closeCard() {
      if (card) card.hidden = true;
      controller.select(null);
    }

    function openCard(marker) {
      if (!card) return;
      if (!marker) {
        card.hidden = true;
        return;
      }

      var meta = marker.meta || {};

      if (meta.image && cardImage) {
        cardImage.src = meta.image;
        cardImage.alt = marker.name;
        cardMedia.hidden = false;
      } else if (cardMedia) {
        cardMedia.hidden = true;
        if (cardImage) cardImage.removeAttribute('src');
      }

      if (cardEyebrow) cardEyebrow.textContent = meta.eyebrow || typeLabel(marker.type);
      if (cardTitle) cardTitle.textContent = marker.name;
      if (cardLocation) {
        var locationText = meta.location || '';
        if (marker.type === 'you' && strings.homeBase) {
          locationText = strings.homeBase + ' · ' + locationText;
        }
        cardLocation.textContent = locationText;
      }
      if (cardText) {
        cardText.textContent = meta.description || '';
        cardText.hidden = !meta.description;
      }

      if (cardChips) {
        cardChips.innerHTML = '';
        var visitedNames = meta.visited || [];
        if (visitedNames.length) {
          var label = document.createElement('li');
          label.className = 'portal-profile__chip foreign-world__chip-label';
          label.textContent = strings.visited || 'Been to';
          cardChips.appendChild(label);
          visitedNames.forEach(function (name) {
            var chip = document.createElement('li');
            chip.className = 'portal-profile__chip';
            chip.textContent = name;
            cardChips.appendChild(chip);
          });
          cardChips.hidden = false;
        } else {
          cardChips.hidden = true;
        }
      }

      if (cardLink) {
        if (meta.link) {
          cardLink.href = meta.link;
          cardLink.textContent = meta.linkLabel || strings.discover || 'Discover';
          cardLink.hidden = false;
        } else {
          cardLink.hidden = true;
        }
      }

      card.hidden = false;
    }

    var controller = window.FRGlobe.create(canvas, {
      autoRotate: section.getAttribute('data-auto-rotate') === 'true',
      onSelect: function (marker) {
        if (marker) {
          controller.focus(marker.lat, marker.lng);
          openCard(marker);
        } else {
          closeCard();
        }
      }
    });

    controller.setMarkers(markers);
    controller.setArcs(arcs);

    /* Hide the drag hint after the first interaction */
    var hint = section.querySelector('[data-globe-hint]');
    if (hint) {
      canvas.addEventListener(
        'pointerdown',
        function () {
          hint.classList.add('is-hidden');
        },
        { once: true }
      );
    }

    /* Filters */
    var currentFilter = 'all';
    var filterButtons = section.querySelectorAll('[data-globe-filter]');

    function applyFilter(filter) {
      currentFilter = filter;
      filterButtons.forEach(function (button) {
        var active = button.getAttribute('data-globe-filter') === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      var filtered = markers.filter(function (marker) {
        if (marker.type === 'you') return true;
        return filter === 'all' || marker.type === filter;
      });
      controller.setMarkers(filtered);
      controller.setArcs(filter === 'all' ? arcs : []);

      section.querySelectorAll('[data-globe-index-group]').forEach(function (group) {
        var groupType = group.getAttribute('data-globe-index-group');
        group.hidden = filter !== 'all' && groupType !== filter;
      });

      closeCard();
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyFilter(button.getAttribute('data-globe-filter'));
      });
    });

    /* Index list -> spin the globe there */
    section.querySelectorAll('[data-globe-goto]').forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-globe-goto');
        var marker = controller.getMarker(id);
        if (!marker) {
          /* marker may be filtered out — reset to All first */
          applyFilter('all');
          marker = controller.getMarker(id);
        }
        if (!marker) return;
        controller.select(id);
        openCard(marker);
        var frame = section.querySelector('.foreign-world__globe-frame');
        if (frame && frame.getBoundingClientRect().top < 0) {
          frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    var closeButton = section.querySelector('[data-globe-card-close]');
    if (closeButton) closeButton.addEventListener('click', closeCard);

    return { destroy: controller.destroy };
  }

  function initAll() {
    document.querySelectorAll('[data-foreign-world]').forEach(function (section) {
      var instance = setup(section);
      if (instance) instances.push({ section: section, instance: instance });
    });
  }

  /* Theme editor support */
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('[data-foreign-world]');
    if (section) {
      var instance = setup(section);
      if (instance) instances.push({ section: section, instance: instance });
    }
  });

  document.addEventListener('shopify:section:unload', function (event) {
    instances = instances.filter(function (entry) {
      if (event.target.contains(entry.section)) {
        entry.instance.destroy();
        return false;
      }
      return true;
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
