/* Foreign Resource — product-form.js
   Variant selection for [data-product-form]. Maps selected option pills to a
   variant, updates the hidden id input, price, button state and ?variant= URL.
   Add to cart submits as a standard POST to /cart/add (cart page flow). */
(function () {
  'use strict';

  /* ---------- Money formatting ---------- */
  function formatWithDelimiters(cents, precision, thousands, decimal) {
    if (isNaN(cents) || cents == null) return '0';
    thousands = thousands || ',';
    decimal = decimal || '.';
    var fixed = (cents / 100).toFixed(precision);
    var parts = fixed.split('.');
    var whole = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    return parts[1] ? whole + decimal + parts[1] : whole;
  }

  function formatMoney(cents) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    cents = parseInt(cents, 10) || 0;

    var format = (window.FR && window.FR.moneyFormat) || '';
    var placeholder = /\{\{\s*(\w+)\s*\}\}/;
    var match = format.match(placeholder);
    if (!match) return (cents / 100).toFixed(2);

    var value;
    switch (match[1]) {
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount':
      default:
        value = formatWithDelimiters(cents, 2);
        break;
    }
    return format.replace(placeholder, value);
  }

  /* ---------- Product form ---------- */
  function getVariantOption(variant, index) {
    if (variant.options && variant.options.length) return variant.options[index];
    return variant['option' + (index + 1)];
  }

  function initProductForm(root) {
    if (root.dataset.productFormReady === 'true') return;
    root.dataset.productFormReady = 'true';

    var jsonEl = root.querySelector('[data-variants-json]');
    if (!jsonEl) return;

    var variants;
    try {
      variants = JSON.parse(jsonEl.textContent);
    } catch (error) {
      return;
    }
    if (!Array.isArray(variants) || !variants.length) return;

    var idInput = root.querySelector('input[name="id"]');
    var priceEl = root.querySelector('[data-price]');
    var compareEl = root.querySelector('[data-compare-price]');
    var addButton = root.querySelector('[data-add-button]');
    var addText = root.querySelector('[data-add-text]');
    var optionGroups = Array.prototype.slice.call(root.querySelectorAll('[data-option-index]'));

    var texts = {
      add: (addButton && addButton.getAttribute('data-text-add')) || '',
      soldOut: (addButton && addButton.getAttribute('data-text-sold-out')) || '',
      unavailable: (addButton && addButton.getAttribute('data-text-unavailable')) || ''
    };

    function selectedOptions() {
      var options = [];
      optionGroups.forEach(function (group) {
        var index = parseInt(group.getAttribute('data-option-index'), 10);
        var checked = group.querySelector('input[data-option-input]:checked');
        options[index] = checked ? checked.value : null;
        var valueLabel = group.querySelector('[data-selected-value]');
        if (valueLabel && checked) valueLabel.textContent = checked.value;
      });
      return options;
    }

    function findVariant() {
      if (!optionGroups.length) return variants[0];
      var options = selectedOptions();
      for (var i = 0; i < variants.length; i += 1) {
        var matches = true;
        for (var j = 0; j < options.length; j += 1) {
          if (getVariantOption(variants[i], j) !== options[j]) {
            matches = false;
            break;
          }
        }
        if (matches) return variants[i];
      }
      return null;
    }

    function setButton(disabled, label) {
      if (!addButton) return;
      addButton.disabled = disabled;
      if (addText && label) addText.textContent = label;
    }

    function updateUrl(variant) {
      if (root.dataset.updateUrl === 'false') return;
      if (!variant || !window.history || !window.history.replaceState) return;
      try {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.pathname + url.search);
      } catch (error) {
        /* Leave the URL untouched if it cannot be parsed. */
      }
    }

    function updateState(replaceUrl) {
      var variant = findVariant();

      if (!variant) {
        setButton(true, texts.unavailable);
        return;
      }

      if (idInput) idInput.value = variant.id;

      if (priceEl) priceEl.textContent = formatMoney(variant.price);
      if (compareEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          compareEl.textContent = formatMoney(variant.compare_at_price);
          compareEl.hidden = false;
        } else {
          compareEl.hidden = true;
        }
      }

      if (variant.available) {
        setButton(false, texts.add);
      } else {
        setButton(true, texts.soldOut);
      }

      if (replaceUrl) updateUrl(variant);
    }

    root.addEventListener('change', function (event) {
      if (!event.target.hasAttribute('data-option-input')) return;
      updateState(true);
    });

    /* Sync once on load without rewriting the URL. */
    updateState(false);
  }

  function initAll(scope) {
    var roots = (scope || document).querySelectorAll('[data-product-form]');
    Array.prototype.forEach.call(roots, initProductForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll(document);
    });
  } else {
    initAll(document);
  }

  /* Theme editor: re-init when a section reloads. */
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
