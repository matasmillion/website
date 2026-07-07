/* Foreign Resource — global.js
   Menu overlay, scroll reveals, quantity steppers. Vanilla JS only. */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  function initFadeIns() {
    var nodes = document.querySelectorAll('[data-fade-in]');
    if (!nodes.length) return;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (node) { node.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    nodes.forEach(function (node) { observer.observe(node); });
  }

  /* ---------- Full-screen menu overlay ---------- */
  var menuState = { open: false, lastFocus: null };

  function menuElements() {
    return {
      overlay: document.querySelector('[data-menu-overlay]'),
      openers: document.querySelectorAll('[data-menu-open]'),
      closers: document.querySelectorAll('[data-menu-close]')
    };
  }

  function focusables(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function openMenu() {
    var els = menuElements();
    if (!els.overlay || menuState.open) return;
    menuState.open = true;
    menuState.lastFocus = document.activeElement;
    els.overlay.hidden = false;
    requestAnimationFrame(function () {
      els.overlay.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    els.openers.forEach(function (btn) { btn.setAttribute('aria-expanded', 'true'); });
    var targets = focusables(els.overlay);
    if (targets.length) targets[0].focus();
  }

  function closeMenu() {
    var els = menuElements();
    if (!els.overlay || !menuState.open) return;
    menuState.open = false;
    els.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    els.openers.forEach(function (btn) { btn.setAttribute('aria-expanded', 'false'); });
    window.setTimeout(function () {
      if (!menuState.open) els.overlay.hidden = true;
    }, reducedMotion ? 0 : 450);
    if (menuState.lastFocus) menuState.lastFocus.focus();
  }

  function initMenu() {
    var els = menuElements();
    if (!els.overlay) return;

    els.openers.forEach(function (btn) {
      btn.addEventListener('click', openMenu);
    });
    els.closers.forEach(function (btn) {
      btn.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (!menuState.open) return;
      if (event.key === 'Escape') {
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;
      var targets = focusables(els.overlay);
      if (!targets.length) return;
      var first = targets[0];
      var last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Quantity steppers ---------- */
  function initQtySteppers() {
    document.addEventListener('click', function (event) {
      var minus = event.target.closest('[data-qty-minus]');
      var plus = event.target.closest('[data-qty-plus]');
      if (!minus && !plus) return;
      var wrap = (minus || plus).closest('[data-qty]');
      if (!wrap) return;
      var input = wrap.querySelector('[data-qty-input]');
      if (!input) return;
      var value = parseInt(input.value, 10) || 1;
      var min = parseInt(input.min, 10) || 1;
      value = plus ? value + 1 : Math.max(min, value - 1);
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* ---------- Sticky header shadow ---------- */
  function initHeaderState() {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function init() {
    initFadeIns();
    initMenu();
    initQtySteppers();
    initHeaderState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
