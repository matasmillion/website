/* Foreign Resource — wishlist.js
   localStorage-backed "hearted products". Exposes window.FRWishlist.
   Buttons: <button data-heart-button data-product-handle="..."> */
(function () {
  'use strict';

  var STORAGE_KEY = 'fr:wishlist';

  function read() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter(function (h) { return typeof h === 'string' && h.length; })
        : [];
    } catch (error) {
      return [];
    }
  }

  function write(handles) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(handles));
    } catch (error) {
      /* storage unavailable (private mode) — wishlist lives for the page only */
    }
  }

  var handles = read();
  var listeners = [];

  function emit() {
    write(handles);
    syncButtons();
    syncCounters();
    listeners.forEach(function (fn) {
      try { fn(handles.slice()); } catch (error) { /* listener errors are theirs */ }
    });
    document.dispatchEvent(new CustomEvent('fr:wishlist:change', { detail: { handles: handles.slice() } }));
  }

  var api = {
    all: function () { return handles.slice(); },
    count: function () { return handles.length; },
    has: function (handle) { return handles.indexOf(handle) !== -1; },
    add: function (handle) {
      if (!handle || api.has(handle)) return;
      handles.unshift(handle);
      emit();
    },
    remove: function (handle) {
      var index = handles.indexOf(handle);
      if (index === -1) return;
      handles.splice(index, 1);
      emit();
    },
    toggle: function (handle) {
      if (api.has(handle)) {
        api.remove(handle);
      } else {
        api.add(handle);
      }
    },
    subscribe: function (fn) {
      if (typeof fn === 'function') listeners.push(fn);
      return function () {
        var index = listeners.indexOf(fn);
        if (index !== -1) listeners.splice(index, 1);
      };
    }
  };

  function syncButtons(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-heart-button]').forEach(function (button) {
      var active = api.has(button.getAttribute('data-product-handle'));
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function syncCounters() {
    document.querySelectorAll('[data-wishlist-count]').forEach(function (badge) {
      badge.textContent = handles.length;
      badge.classList.toggle('is-empty', handles.length === 0);
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-heart-button]');
    if (!button) return;
    event.preventDefault();
    var handle = button.getAttribute('data-product-handle');
    if (handle) api.toggle(handle);
  });

  /* Keep multiple tabs in sync */
  window.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY) return;
    handles = read();
    syncButtons();
    syncCounters();
    listeners.forEach(function (fn) {
      try { fn(handles.slice()); } catch (error) { /* noop */ }
    });
    document.dispatchEvent(new CustomEvent('fr:wishlist:change', { detail: { handles: handles.slice() } }));
  });

  function init() {
    syncButtons();
    syncCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.FRWishlist = api;
})();
