/* Foreign Resource — customer.js
   Portal behaviors: hearted-products grid, Foreign World profile editor
   (+ mini globe), address forms. Depends on wishlist.js; optionally on
   cities.js / globe.js / globe-land.js when their features are on the page. */
(function () {
  'use strict';

  var PROFILE_KEY = 'fr:profile';
  var root = (window.routes && window.routes.root) || '/';
  if (root.charAt(root.length - 1) !== '/') root += '/';

  /* ---------- money ---------- */
  function formatMoney(cents) {
    var format = (window.FR && window.FR.moneyFormat) || '${{amount}}';
    var amount = (cents / 100).toFixed(2);
    var withComma = amount.replace('.', ',');
    var noDecimals = String(Math.round(cents / 100));
    return format
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, withComma)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, noDecimals)
      .replace(/\{\{\s*amount\s*\}\}/g, amount);
  }

  /* ---------- profile storage ---------- */
  function readProfile() {
    try {
      var raw = window.localStorage.getItem(PROFILE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeProfile(profile) {
    try {
      if (profile) {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      } else {
        window.localStorage.removeItem(PROFILE_KEY);
      }
    } catch (error) {
      /* private mode — profile lives for the page only */
    }
  }

  /* ---------- hearted products grid ---------- */
  function initWishlistGrid() {
    var grid = document.querySelector('[data-wishlist-grid]');
    var template = document.querySelector('[data-wishlist-card-template]');
    if (!grid || !template || !window.FRWishlist) return;

    var empty = document.querySelector('[data-wishlist-empty]');
    var meta = document.querySelector('[data-wishlist-meta]');
    var metaCount = document.querySelector('[data-wishlist-meta-count]');
    var cache = {};

    function fetchProduct(handle) {
      if (cache[handle]) return cache[handle];
      cache[handle] = fetch(root + 'products/' + encodeURIComponent(handle) + '.js', {
        headers: { Accept: 'application/json' }
      }).then(function (response) {
        if (!response.ok) throw new Error('not found');
        return response.json();
      });
      return cache[handle];
    }

    function cardFor(handle, product) {
      var fragment = template.content.cloneNode(true);
      var card = fragment.querySelector('.product-card');
      var image = fragment.querySelector('[data-card-image]');
      var title = fragment.querySelector('[data-card-title]');
      var price = fragment.querySelector('[data-card-price]');
      var heart = fragment.querySelector('[data-heart-button]');

      fragment.querySelectorAll('[data-card-link]').forEach(function (link) {
        link.href = product.url;
      });
      if (product.featured_image) {
        var separator = product.featured_image.indexOf('?') === -1 ? '?' : '&';
        image.src = product.featured_image + separator + 'width=540';
        image.alt = product.title;
      } else {
        image.remove();
      }
      title.textContent = product.title;
      price.textContent = formatMoney(product.price);
      heart.setAttribute('data-product-handle', handle);
      card.setAttribute('data-wishlist-item', handle);
      return fragment;
    }

    var renderToken = 0;

    function render(handles) {
      var token = ++renderToken;
      var hasItems = handles.length > 0;

      if (empty) empty.hidden = hasItems;
      if (meta) meta.hidden = !hasItems;
      if (metaCount) {
        var labelOne = metaCount.getAttribute('data-label-one') || 'COUNT piece';
        var labelOther = metaCount.getAttribute('data-label-other') || 'COUNT pieces';
        var label = handles.length === 1 ? labelOne : labelOther;
        metaCount.textContent = label.replace(/COUNT/g, handles.length);
      }

      if (!hasItems) {
        grid.innerHTML = '';
        return;
      }

      /* Remove cards no longer hearted */
      grid.querySelectorAll('[data-wishlist-item]').forEach(function (card) {
        if (handles.indexOf(card.getAttribute('data-wishlist-item')) === -1) card.remove();
      });

      handles.forEach(function (handle) {
        if (grid.querySelector('[data-wishlist-item="' + handle + '"]')) return;
        var placeholder = document.createElement('div');
        placeholder.className = 'product-card';
        placeholder.setAttribute('data-wishlist-item', handle);
        placeholder.innerHTML = '<div class="product-card__media skeleton"></div>';
        grid.appendChild(placeholder);

        fetchProduct(handle)
          .then(function (product) {
            if (token !== renderToken) return;
            if (!window.FRWishlist.has(handle)) return;
            var current = grid.querySelector('[data-wishlist-item="' + handle + '"]');
            if (!current) return;
            var card = cardFor(handle, product);
            grid.replaceChild(card, current);
          })
          .catch(function () {
            /* product deleted/hidden — drop it quietly */
            var current = grid.querySelector('[data-wishlist-item="' + handle + '"]');
            if (current) current.remove();
            window.FRWishlist.remove(handle);
          });
      });
    }

    window.FRWishlist.subscribe(render);
    render(window.FRWishlist.all());
  }

  /* ---------- city lookup ---------- */
  function cityByName(name) {
    var cities = window.FR_CITIES || [];
    var query = (name || '').trim().toLowerCase();
    if (!query) return null;
    for (var i = 0; i < cities.length; i++) {
      if (cities[i].n.toLowerCase() === query) return cities[i];
    }
    /* forgiving: match on city part before the comma */
    for (var j = 0; j < cities.length; j++) {
      var cityPart = cities[j].n.split(',')[0].trim().toLowerCase();
      if (cityPart === query) return cities[j];
    }
    return null;
  }

  function populateDatalist() {
    var datalist = document.querySelector('[data-city-datalist]');
    if (!datalist || !window.FR_CITIES) return;
    var fragment = document.createDocumentFragment();
    window.FR_CITIES.forEach(function (city) {
      var option = document.createElement('option');
      option.value = city.n;
      fragment.appendChild(option);
    });
    datalist.appendChild(fragment);
  }

  /* ---------- profile editor + mini globe ---------- */
  function initProfileEditor() {
    var form = document.querySelector('[data-profile-form]');
    if (!form) return;

    populateDatalist();

    var nameInput = form.querySelector('[data-profile-name]');
    var bioInput = form.querySelector('[data-profile-bio]');
    var homeInput = form.querySelector('[data-profile-home]');
    var visitedInput = form.querySelector('[data-profile-visited-input]');
    var visitedAdd = form.querySelector('[data-profile-visited-add]');
    var visitedList = form.querySelector('[data-visited-list]');
    var status = form.querySelector('[data-profile-status]');
    var removeButton = form.querySelector('[data-profile-remove]');

    var visited = [];
    var globeController = null;

    function setStatus(message, isError) {
      if (!status) return;
      status.textContent = message || '';
      status.classList.toggle('is-error', Boolean(isError));
    }

    function renderChips() {
      if (!visitedList) return;
      visitedList.innerHTML = '';
      visited.forEach(function (city, index) {
        var li = document.createElement('li');
        li.className = 'portal-profile__chip';
        var label = document.createElement('span');
        label.textContent = city.n;
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'portal-profile__chip-remove';
        remove.setAttribute('aria-label', 'Remove ' + city.n);
        remove.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>';
        remove.addEventListener('click', function () {
          visited.splice(index, 1);
          renderChips();
          renderGlobe();
        });
        li.appendChild(label);
        li.appendChild(remove);
        visitedList.appendChild(li);
      });
    }

    function currentProfile() {
      var home = cityByName(homeInput && homeInput.value);
      return {
        name: (nameInput && nameInput.value.trim()) || '',
        bio: (bioInput && bioInput.value.trim()) || '',
        home: home ? { n: home.n, la: home.la, lo: home.lo } : null,
        visited: visited.slice(),
        updatedAt: new Date().toISOString()
      };
    }

    function profileMarkers(profile) {
      var markers = [];
      if (profile && profile.home) {
        markers.push({
          id: 'you-home',
          type: 'you',
          name: profile.name || 'You',
          lat: profile.home.la,
          lng: profile.home.lo,
          meta: { location: profile.home.n }
        });
      }
      (profile && profile.visited ? profile.visited : []).forEach(function (city, index) {
        markers.push({
          id: 'you-visited-' + index,
          type: 'place',
          name: city.n,
          lat: city.la,
          lng: city.lo,
          meta: {}
        });
      });
      return markers;
    }

    function renderGlobe() {
      var canvas = document.querySelector('[data-profile-globe]');
      var emptyOverlay = document.querySelector('[data-profile-globe-empty]');
      if (!canvas || !window.FRGlobe) return;

      var profile = currentProfile();
      var hasPin = Boolean(profile.home) || profile.visited.length > 0;
      if (emptyOverlay) emptyOverlay.hidden = hasPin;

      if (!globeController) {
        globeController = window.FRGlobe.create(canvas, { autoRotate: !hasPin });
      }
      globeController.setMarkers(profileMarkers(profile));
      globeController.setAutoRotate(!hasPin);
      if (profile.home) {
        globeController.focus(profile.home.la, profile.home.lo);
      } else if (profile.visited.length) {
        globeController.focus(profile.visited[0].la, profile.visited[0].lo);
      }
    }

    function load() {
      var profile = readProfile();
      if (!profile) {
        renderChips();
        renderGlobe();
        return;
      }
      if (nameInput && profile.name) nameInput.value = profile.name;
      if (bioInput && profile.bio) bioInput.value = profile.bio;
      if (homeInput && profile.home) homeInput.value = profile.home.n;
      visited = Array.isArray(profile.visited)
        ? profile.visited.filter(function (c) {
            return c && typeof c.n === 'string' && isFinite(c.la) && isFinite(c.lo);
          })
        : [];
      if (removeButton) removeButton.hidden = false;
      renderChips();
      renderGlobe();
    }

    function addVisited() {
      if (!visitedInput) return;
      var city = cityByName(visitedInput.value);
      if (!city) {
        setStatus(form.getAttribute('data-unknown-city') || 'Pick a city from the suggestions so we can pin it.', true);
        return;
      }
      var exists = visited.some(function (c) { return c.n === city.n; });
      if (!exists) {
        visited.push({ n: city.n, la: city.la, lo: city.lo });
        renderChips();
        renderGlobe();
      }
      visitedInput.value = '';
      setStatus('');
      visitedInput.focus();
    }

    if (visitedAdd) visitedAdd.addEventListener('click', addVisited);
    if (visitedInput) {
      visitedInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          addVisited();
        }
      });
    }

    if (homeInput) {
      homeInput.addEventListener('change', function () {
        if (cityByName(homeInput.value)) {
          setStatus('');
          renderGlobe();
        }
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var homeValue = homeInput && homeInput.value.trim();
      if (homeValue && !cityByName(homeValue)) {
        setStatus(form.getAttribute('data-unknown-city') || 'Pick a city from the suggestions so we can pin it.', true);
        homeInput.focus();
        return;
      }
      var profile = currentProfile();
      writeProfile(profile);
      if (removeButton) removeButton.hidden = false;
      setStatus(form.getAttribute('data-saved-message') || 'Profile saved. See you on the map.');
      renderGlobe();
    });

    if (removeButton) {
      removeButton.addEventListener('click', function () {
        writeProfile(null);
        visited = [];
        if (homeInput) homeInput.value = '';
        if (bioInput) bioInput.value = '';
        renderChips();
        renderGlobe();
        removeButton.hidden = true;
        setStatus(form.getAttribute('data-removed-message') || 'Profile removed from this browser.');
      });
    }

    load();
  }

  /* ---------- address forms ---------- */
  function initAddressForms() {
    /* show/hide add & edit forms */
    document.querySelectorAll('[data-address-toggle]').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var target = document.getElementById(toggle.getAttribute('data-address-toggle'));
        if (!target) return;
        var willShow = target.hidden;
        target.hidden = !willShow;
        toggle.setAttribute('aria-expanded', willShow ? 'true' : 'false');
        if (willShow) {
          var firstInput = target.querySelector('input, select');
          if (firstInput) firstInput.focus();
        }
      });
    });

    /* delete confirmation */
    document.querySelectorAll('[data-address-delete]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        var message = button.getAttribute('data-confirm-message') || 'Delete this address?';
        if (!window.confirm(message)) event.preventDefault();
      });
    });

    /* country → province pairing */
    document.querySelectorAll('[data-address-country-select]').forEach(function (countrySelect) {
      var scope = countrySelect.closest('form') || document;
      var provinceSelect = scope.querySelector('[data-address-province-select]');
      var provinceWrap = scope.querySelector('[data-address-province-wrap]');

      function updateProvinces() {
        if (!provinceSelect) return;
        var option = countrySelect.options[countrySelect.selectedIndex];
        var raw = option ? option.getAttribute('data-provinces') : null;
        var provinces = [];
        try {
          provinces = raw ? JSON.parse(raw) : [];
        } catch (error) {
          provinces = [];
        }
        provinceSelect.innerHTML = '';
        if (!provinces.length) {
          if (provinceWrap) provinceWrap.hidden = true;
          return;
        }
        if (provinceWrap) provinceWrap.hidden = false;
        provinces.forEach(function (pair) {
          var opt = document.createElement('option');
          opt.value = pair[0];
          opt.textContent = pair[1];
          provinceSelect.appendChild(opt);
        });
        var defaultProvince = provinceSelect.getAttribute('data-default');
        if (defaultProvince) provinceSelect.value = defaultProvince;
      }

      var defaultCountry = countrySelect.getAttribute('data-default');
      if (defaultCountry) countrySelect.value = defaultCountry;
      countrySelect.addEventListener('change', updateProvinces);
      updateProvinces();
    });
  }

  function init() {
    initWishlistGrid();
    initProfileEditor();
    initAddressForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
