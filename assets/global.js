/* ============================================
   FOREIGN RESOURCE — Global JavaScript
   ============================================ */

(function() {
  'use strict';

  /* --- Scroll Reveal (Intersection Observer) --- */
  const initReveal = () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  };

  /* --- Mobile Menu --- */
  const initMobileMenu = () => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const close = document.querySelector('[data-menu-close]');
    const overlay = document.querySelector('[data-menu-overlay]');
    if (!toggle || !overlay) return;

    const open = () => {
      overlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      const firstLink = overlay.querySelector('a');
      if (firstLink) firstLink.focus();
    };

    const shut = () => {
      overlay.classList.remove('is-active');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    };

    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) shut();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-active')) shut();
    });

    // Shop group expands to reveal collections
    const shopBtn = overlay.querySelector('[data-mm-shop]');
    const shopPanel = overlay.querySelector('[data-mm-shop-panel]');
    if (shopBtn && shopPanel) {
      shopBtn.addEventListener('click', () => {
        const open = shopPanel.hidden;
        shopPanel.hidden = !open;
        shopBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  };

  /* --- Chrome: stack header below the announcement bar; expose offset --- */
  const initChrome = () => {
    const ann = document.querySelector('[data-announcement]');
    const header = document.querySelector('[data-header]');
    const setChrome = () => {
      const annH = ann ? ann.offsetHeight : 0;
      const headerH = header ? header.offsetHeight : 0;
      if (header) header.style.top = annH + 'px';
      document.documentElement.style.setProperty('--chrome-h', (annH + headerH) + 'px');
    };
    setChrome();
    window.addEventListener('resize', setChrome, { passive: true });
  };

  /* --- Announcement bar: cycle messages --- */
  const initAnnouncement = () => {
    const bar = document.querySelector('[data-announcement]');
    if (!bar) return;
    const msgs = bar.querySelectorAll('[data-ann-msg]');
    if (msgs.length < 2) return;
    const speed = (parseFloat(bar.dataset.rotate) || 4) * 1000;
    let i = 0;
    setInterval(() => {
      msgs[i].classList.remove('is-active');
      i = (i + 1) % msgs.length;
      msgs[i].classList.add('is-active');
    }, speed);
  };

  /* --- Header Scroll Behavior --- */
  const initStickyHeader = () => {
    const header = document.querySelector('[data-header]');
    if (!header || !header.dataset.sticky) return;

    // PDP immersive: on the product page, hide the header ~1s after load so the
    // large image fills the screen; reveal it again the moment the user scrolls.
    const isProduct = document.body.classList.contains('template-product');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    let pdpHidden = false;
    if (isProduct && isMobile) {
      setTimeout(() => {
        if (window.scrollY < 20) { header.classList.add('is-hidden'); pdpHidden = true; }
      }, 1000);
    }

    let lastScroll = 0;
    const onScroll = () => {
      const current = window.scrollY;
      header.classList.toggle('is-scrolled', current > 50);
      if (pdpHidden) { header.classList.remove('is-hidden'); pdpHidden = false; lastScroll = current; return; }
      if (current > 300) {
        header.classList.toggle('is-hidden', current > lastScroll);
      } else {
        header.classList.remove('is-hidden');
      }
      lastScroll = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* --- Product Image Carousel / Swipe --- */
  const initCarousels = () => {
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
      const track = carousel.querySelector('[data-carousel-track]');
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      if (!track) return;

      const scrollAmount = () => track.firstElementChild ? track.firstElementChild.offsetWidth + parseInt(getComputedStyle(track).gap || 0) : 300;

      if (prev) prev.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
      });
      if (next) next.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
      });
    });
  };

  /* --- Product Variant Selector (option toggle only) --- */
  const initVariantSelectors = () => {
    document.querySelectorAll('[data-variant-select]').forEach(container => {
      const buttons = container.querySelectorAll('[data-variant-option]');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => {
            b.classList.remove('is-selected');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('is-selected');
          btn.setAttribute('aria-pressed', 'true');
          container.dispatchEvent(new CustomEvent('variant:change', { bubbles: true }));
        });
      });
    });
  };

  /* --- PDP: resolve selected options to a real variant --- */
  const initPdpVariants = () => {
    const pdp = document.querySelector('[data-pdp]');
    if (!pdp) return;
    const dataEl = pdp.querySelector('[data-variant-json]');
    if (!dataEl) return;
    let variants = [];
    try { variants = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!variants.length) return;

    const groups = pdp.querySelectorAll('[data-variant-select][data-option-position]');
    const idInput = pdp.querySelector('[data-variant-id]');
    const addBtn = pdp.querySelector('[data-add-btn]');
    const addText = pdp.querySelector('.pdp__add-text');
    const mobileBtn = pdp.querySelector('[data-mobile-submit]');
    const mobileText = mobileBtn ? mobileBtn.querySelector('span') : null;
    const swatchLabel = pdp.querySelector('.pdp__swatch-label');

    const money = (cents) =>
      (cents / 100).toLocaleString(undefined, { style: 'currency', currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD' }).replace(/\.00$/, '');

    const selectedValues = () => {
      const vals = [];
      groups.forEach((g) => {
        const pos = parseInt(g.dataset.optionPosition, 10) - 1;
        const sel = g.querySelector('.is-selected') || g.querySelector('[aria-pressed="true"]');
        vals[pos] = sel ? sel.dataset.variantOption : null;
      });
      return vals;
    };

    const resolve = () => {
      const vals = selectedValues();
      const variant = variants.find((v) =>
        vals.every((val, i) => val == null || v['option' + (i + 1)] === val));

      // Colour label reflects the chosen colour
      if (swatchLabel) {
        const colorGroup = pdp.querySelector('.pdp__swatch-list .is-selected');
        if (colorGroup) swatchLabel.textContent = colorGroup.getAttribute('title') || colorGroup.dataset.variantOption;
      }

      const setState = (btn, textEl, priceSel) => {
        if (!btn) return;
        const priceEl = pdp.querySelector(priceSel);
        if (variant) {
          if (idInput) idInput.value = variant.id;
          if (priceEl) priceEl.textContent = money(variant.price);
          if (variant.available) { btn.disabled = false; if (textEl) textEl.textContent = 'Add to cart'; }
          else { btn.disabled = true; if (textEl) textEl.textContent = 'Sold out'; }
        } else {
          btn.disabled = true;
          if (textEl) textEl.textContent = 'Unavailable';
        }
      };
      setState(addBtn, addText, '[data-price]');
      setState(mobileBtn, mobileText, '[data-mobile-price]');
    };

    groups.forEach((g) => g.addEventListener('variant:change', resolve));
    resolve();
  };

  /* --- Quantity Selector --- */
  const initQuantitySelectors = () => {
    document.querySelectorAll('[data-quantity]').forEach(container => {
      const input = container.querySelector('[data-quantity-input]');
      const minus = container.querySelector('[data-quantity-minus]');
      const plus = container.querySelector('[data-quantity-plus]');
      if (!input) return;

      const update = (val) => {
        const min = parseInt(input.min) || 1;
        const max = parseInt(input.max) || 99;
        input.value = Math.max(min, Math.min(max, val));
      };

      if (minus) minus.addEventListener('click', () => update(parseInt(input.value) - 1));
      if (plus) plus.addEventListener('click', () => update(parseInt(input.value) + 1));
      input.addEventListener('change', () => update(parseInt(input.value)));
    });
  };

  /* --- Accordion --- */
  const initAccordions = () => {
    document.querySelectorAll('[data-accordion]').forEach(accordion => {
      const items = accordion.querySelectorAll('[data-accordion-item]');
      items.forEach(item => {
        const trigger = item.querySelector('[data-accordion-trigger]');
        const content = item.querySelector('[data-accordion-content]');
        if (!trigger || !content) return;

        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');

          // Close all others in same accordion
          items.forEach(other => {
            other.classList.remove('is-open');
            const otherContent = other.querySelector('[data-accordion-content]');
            const otherTrigger = other.querySelector('[data-accordion-trigger]');
            if (otherContent) otherContent.style.maxHeight = '0';
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          });

          if (!isOpen) {
            item.classList.add('is-open');
            content.style.maxHeight = content.scrollHeight + 'px';
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });
  };

  /* --- Modal --- */
  const initModals = () => {
    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modalOpen;
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
        const closeBtns = modal.querySelectorAll('[data-modal-close]');
        closeBtns.forEach(btn => btn.addEventListener('click', () => {
          modal.classList.remove('is-active');
          document.body.style.overflow = '';
          trigger.focus();
        }));
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('is-active');
            document.body.style.overflow = '';
          }
        });
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const active = document.querySelector('.modal.is-active');
        if (active) {
          active.classList.remove('is-active');
          document.body.style.overflow = '';
        }
      }
    });
  };

  /* --- Cart Drawer --- */
  const initCartDrawer = () => {
    const drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    const content = drawer.querySelector('#cart-drawer-content');

    const money = (cents) =>
      (cents / 100).toLocaleString(undefined, { style: 'currency', currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD' });

    const render = async () => {
      if (!content) return;
      try {
        const cart = await (await fetch('/cart.js', { cache: 'no-store' })).json();
        // keep header counts in sync
        document.querySelectorAll('[data-cart-count]').forEach((el) => {
          el.textContent = cart.item_count;
          el.classList.toggle('is-active', cart.item_count > 0);
        });
        if (!cart.item_count) {
          content.innerHTML = '<p class="cart-drawer__empty">Your cart is empty</p>';
          return;
        }
        const threshold = (window.FRTheme && window.FRTheme.freeShippingThreshold) || 0;
        let shipNote = '';
        if (threshold > 0) {
          const remaining = threshold - cart.total_price;
          shipNote = '<p class="cart-drawer__shipnote">' +
            (remaining > 0
              ? 'You’re ' + money(remaining) + ' away from complimentary shipping'
              : 'Complimentary shipping is on us') +
            '</p>';
        }
        content.innerHTML = shipNote + cart.items.map((item) =>
          '<div class="cart-drawer__item">' +
            '<img src="' + (item.image ? item.image.replace(/(\.[^.]+)$/, '_120x$1') : '') + '" alt="" width="60" height="75" loading="lazy">' +
            '<div class="cart-drawer__item-info">' +
              '<p class="cart-drawer__item-title">' + item.product_title + '</p>' +
              (item.variant_title ? '<p class="cart-drawer__item-variant">' + item.variant_title + '</p>' : '') +
              '<p class="cart-drawer__item-price">' + money(item.final_line_price) + '</p>' +
            '</div>' +
          '</div>').join('') +
          '<div class="cart-drawer__footer"><div class="cart-drawer__subtotal"><span>Subtotal</span><span>' + money(cart.total_price) + '</span></div>' +
          '<form action="/cart" method="post"><button type="submit" name="checkout" class="btn btn--primary btn--full">Checkout</button></form>' +
          '<a href="/cart" class="cart-drawer__view-cart">View cart</a></div>';
      } catch (e) {}
    };

    const open = () => {
      render();
      drawer.classList.add('is-active');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      drawer.classList.remove('is-active');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-cart-toggle]').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        // "Dedicated page" cart type: follow the link to /cart instead
        if (window.FRTheme && window.FRTheme.cartType === 'page') return;
        e.preventDefault();
        open();
      }));
    drawer.querySelectorAll('[data-cart-drawer-close]').forEach((b) => b.addEventListener('click', close));
    const overlay = drawer.querySelector('.cart-drawer__overlay');
    if (overlay) overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-active')) close();
    });

    // Let other code open the drawer after an AJAX add
    window.FROpenCart = open;
  };

  /* --- Product Gallery --- */
  const initProductGallery = () => {
    const gallery = document.querySelector('[data-product-gallery]');
    if (!gallery) return;

    const mainImage = gallery.querySelector('[data-gallery-main]');
    const thumbnails = gallery.querySelectorAll('[data-gallery-thumb]');

    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbnails.forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
        if (mainImage) {
          const img = mainImage.querySelector('img');
          if (img) {
            img.src = thumb.dataset.galleryThumb;
            img.srcset = thumb.dataset.thumbSrcset || '';
          }
        }
      });
    });
  };

  /* --- Collection Filters --- */
  const initFilters = () => {
    const toggles = document.querySelectorAll('[data-filter-toggle]');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = document.querySelector(toggle.dataset.filterToggle);
        if (!target) return;
        const willOpen = !target.classList.contains('is-open');
        // Close any other open menus
        document.querySelectorAll('.jc-collection__menu.is-open').forEach(m => {
          if (m !== target) m.classList.remove('is-open');
        });
        target.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.jc-collection__menu.is-open').forEach(menu => {
        if (!menu.closest('[data-sort-wrap], [data-filters-wrap]').contains(e.target)) {
          menu.classList.remove('is-open');
        }
      });
    });
  };

  /* --- Add to Cart (AJAX) --- */
  const initAddToCart = () => {
    document.querySelectorAll('[data-add-to-cart]').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('[data-add-btn]');
        if (!btn || btn.disabled) return;

        // Feedback on both the desktop button and the mobile sticky band.
        // Update only the text labels so icon/price markup is preserved.
        const mobileBtn = document.querySelector('[data-mobile-submit]');
        const labels = [btn.querySelector('.pdp__add-text') || btn];
        if (mobileBtn) labels.push(mobileBtn.querySelector('span') || mobileBtn);
        const originals = labels.map((el) => el.textContent);
        const setLabel = (txt) => labels.forEach((el) => { el.textContent = txt; });
        const setDisabled = (state) => {
          btn.disabled = state;
          if (mobileBtn) mobileBtn.disabled = state;
        };

        setDisabled(true);
        setLabel('Adding...');

        try {
          const formData = new FormData(form);
          const res = await fetch('/cart/add.js', {
            method: 'POST',
            body: formData
          });

          if (res.ok) {
            setLabel('Added');
            if (window.FRTheme && window.FRTheme.cartType === 'page') {
              window.location.href = '/cart';
              return;
            }
            if (window.FROpenCart) {
              // Re-renders drawer contents and cart count badge, then opens it
              window.FROpenCart();
            } else {
              const cart = await (await fetch('/cart.js', { cache: 'no-store' })).json();
              document.querySelectorAll('[data-cart-count]').forEach((el) => {
                el.textContent = cart.item_count;
                el.classList.toggle('is-active', cart.item_count > 0);
              });
            }
          } else {
            const data = await res.json();
            setLabel(data.description || 'Error');
          }
        } catch (err) {
          setLabel('Error');
        }

        setTimeout(() => {
          labels.forEach((el, i) => { el.textContent = originals[i]; });
          setDisabled(false);
        }, 2000);
      });
    });
  };

  /* --- Wishlist (localStorage) --- */
  const Wishlist = {
    key: 'fr_wishlist',
    get() {
      try { return JSON.parse(localStorage.getItem(this.key)) || []; }
      catch { return []; }
    },
    save(items) {
      localStorage.setItem(this.key, JSON.stringify(items));
      this.updateCounts();
      this.updateButtons();
    },
    toggle(handle) {
      const items = this.get();
      const idx = items.indexOf(handle);
      if (idx > -1) { items.splice(idx, 1); }
      else { items.push(handle); }
      this.save(items);
      return idx === -1; // true if added
    },
    has(handle) {
      return this.get().includes(handle);
    },
    updateCounts() {
      const count = this.get().length;
      document.querySelectorAll('[data-wishlist-count]').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? '' : 'none';
      });
    },
    updateButtons() {
      document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
        const handle = btn.dataset.wishlistToggle;
        const isSaved = this.has(handle);
        btn.classList.toggle('is-saved', isSaved);
        btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', isSaved ? 'currentColor' : 'none');
      });
    }
  };

  const initWishlist = () => {
    Wishlist.updateCounts();
    Wishlist.updateButtons();

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-wishlist-toggle]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const handle = btn.dataset.wishlistToggle;
      const added = Wishlist.toggle(handle);
      // Brief animation feedback
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => { btn.style.transform = ''; }, 200);
    });
  };

  /* --- Wishlist Drawer (opens from the heart icon) --- */
  const initWishlistDrawer = () => {
    const drawer = document.querySelector('[data-wishlist-drawer]');
    if (!drawer) return;
    const grid = drawer.querySelector('[data-wishlist-grid]');
    const empty = drawer.querySelector('[data-wishlist-empty]');

    const money = (cents) =>
      (cents / 100).toLocaleString(undefined, { style: 'currency', currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD' })
        .replace(/\.00$/, '');

    const render = async () => {
      const items = window.FRWishlist ? window.FRWishlist.get() : [];
      if (!items.length) {
        empty.style.display = '';
        grid.innerHTML = '';
        return;
      }
      empty.style.display = 'none';
      const products = await Promise.all(items.map(async (h) => {
        try { const r = await fetch('/products/' + h + '.js'); if (r.ok) return r.json(); } catch (e) {}
        return null;
      }));
      const valid = products.filter(Boolean);
      if (!valid.length) { empty.style.display = ''; grid.innerHTML = ''; return; }
      grid.innerHTML = valid.map((p) => {
        const img = p.featured_image || (p.images && p.images[0]) || '';
        return '<div class="wl-item">' +
          '<button class="wl-item__remove" data-wishlist-remove="' + p.handle + '" aria-label="Remove">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
          '<a href="/products/' + p.handle + '" class="wl-item__link">' +
            '<div class="wl-item__img">' + (img ? '<img src="' + img + '" alt="" loading="lazy">' : '') + '</div>' +
            '<div class="wl-item__info">' +
              '<span class="wl-item__title">' + p.title + '</span>' +
              '<span class="wl-item__price">' + money(p.price) + '</span>' +
            '</div>' +
          '</a>' +
        '</div>';
      }).join('');
    };

    const open = () => {
      render();
      drawer.classList.add('is-active');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      drawer.classList.remove('is-active');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-wishlist-open]').forEach((b) =>
      b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    drawer.querySelectorAll('[data-wishlist-close]').forEach((b) =>
      b.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-active')) close();
    });

    grid.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-wishlist-remove]');
      if (!rm) return;
      e.preventDefault();
      if (window.FRWishlist) window.FRWishlist.toggle(rm.dataset.wishlistRemove);
      render();
    });
  };

  // Expose globally for wishlist page
  window.FRWishlist = Wishlist;

  /* --- Search Drawer (swipe up) with predictive results + most viewed --- */
  const initSearchDrawer = () => {
    const drawer = document.querySelector('[data-search-drawer]');
    if (!drawer) return;
    const input = drawer.querySelector('[data-search-input]');
    const results = drawer.querySelector('[data-search-results]');
    const dflt = drawer.querySelector('[data-search-default]');
    const mv = drawer.querySelector('[data-search-mostviewed]');

    const money = (cents) =>
      (cents / 100).toLocaleString(undefined, { style: 'currency', currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD' }).replace(/\.00$/, '');

    const priceHTML = (p) => {
      const price = parseFloat(p.price);
      if (isNaN(price)) return '';
      const cmpRaw = p.compare_at_price_max || p.compare_at_price_min || p.compare_at_price;
      const cmp = cmpRaw != null ? parseFloat(cmpRaw) : NaN;
      if (!isNaN(cmp) && cmp > price) {
        return '<s class="sd-item__price-compare">' + money(Math.round(cmp * 100)) + '</s> ' +
               '<span class="sd-item__price-sale">' + money(Math.round(price * 100)) + '</span>';
      }
      return money(Math.round(price * 100));
    };

    const itemHTML = (url, image, title, priceStr) =>
      '<a href="' + url + '" class="sd-item">' +
        '<div class="sd-item__img">' + (image ? '<img src="' + image + '" alt="" loading="lazy">' : '') + '</div>' +
        '<div class="sd-item__title">' + title + '</div>' +
        '<div class="sd-item__price">' + (priceStr || '') + '</div>' +
      '</a>';

    // Most viewed = the shopper's recently viewed items (per-user, on device)
    const renderMostViewed = async () => {
      if (!mv) return;
      let items = [];
      try { items = JSON.parse(localStorage.getItem('fr_recently_viewed')) || []; } catch (e) {}
      const label = mv.previousElementSibling;
      if (!items.length) { if (label) label.style.display = 'none'; return; }
      const products = await Promise.all(items.slice(0, 4).map(async (h) => {
        try { const r = await fetch('/products/' + h + '.js'); if (r.ok) return r.json(); } catch (e) {}
        return null;
      }));
      const valid = products.filter(Boolean);
      if (!valid.length) { if (label) label.style.display = 'none'; return; }
      if (label) label.style.display = '';
      mv.innerHTML = valid.map((p) => itemHTML('/products/' + p.handle, p.featured_image || (p.images && p.images[0]), p.title, money(p.price))).join('');
    };

    const open = () => {
      renderMostViewed();
      drawer.classList.add('is-active');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input && input.focus(), 250);
    };
    const close = () => {
      drawer.classList.remove('is-active');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-search-open]').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.preventDefault();
        const mm = document.querySelector('[data-menu-overlay]');
        if (mm) mm.classList.remove('is-active');
        open();
      }));
    drawer.querySelectorAll('[data-search-close]').forEach((b) => b.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-active')) close();
    });

    // Predictive search
    let t;
    if (input) input.addEventListener('input', () => {
      clearTimeout(t);
      const q = input.value.trim();
      if (q.length < 2) { results.hidden = true; results.innerHTML = ''; if (dflt) dflt.hidden = false; return; }
      t = setTimeout(async () => {
        try {
          const r = await fetch('/search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=8');
          if (!r.ok) return;
          const data = await r.json();
          const products = (data.resources && data.resources.results && data.resources.results.products) || [];
          if (dflt) dflt.hidden = true;
          results.hidden = false;
          results.innerHTML = products.length
            ? products.map((p) => itemHTML(p.url, p.image || p.featured_image, p.title, priceHTML(p))).join('')
            : '<p class="search-drawer__label" style="grid-column:1/-1">No results — press enter to search.</p>';
        } catch (e) {}
      }, 250);
    });
  };

  /* --- PDP Tabs --- */
  const initPdpTabs = () => {
    document.querySelectorAll('[data-pdp-tabs]').forEach(container => {
      const tabs = container.querySelectorAll('[data-tab]');
      const panels = container.querySelectorAll('[data-tab-panel]');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Clicking the open tab closes it, so the panels stay hidden by default.
          const wasOpen = tab.classList.contains('is-active');
          tabs.forEach(t => {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('aria-expanded', 'false');
          });
          panels.forEach(p => p.classList.remove('is-active'));
          if (wasOpen) return;
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
          tab.setAttribute('aria-expanded', 'true');
          const panel = container.querySelector(`[data-tab-panel="${tab.dataset.tab}"]`);
          if (panel) panel.classList.add('is-active');
        });
      });
    });
  };

  /* --- PDP Gallery (swipe + dots + arrows) --- */
  const initPdpGallery = () => {
    const gallery = document.querySelector('[data-product-gallery]');
    if (!gallery) return;
    const main = gallery.querySelector('[data-gallery-main]');
    const dots = gallery.querySelectorAll('[data-gallery-dot]');
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const slides = gallery.querySelectorAll('[data-gallery-slide]');
    if (!main || !slides.length) return;

    let current = 0;
    const total = slides.length;

    // Desktop stacks the images and scrolls vertically; mobile swipes horizontally.
    const isVertical = () => window.matchMedia('(min-width: 769px)').matches;

    const goTo = (idx) => {
      current = Math.max(0, Math.min(total - 1, idx));
      main.scrollTo(
        isVertical()
          ? { top: main.offsetHeight * current, behavior: 'smooth' }
          : { left: main.offsetWidth * current, behavior: 'smooth' }
      );
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    };

    dots.forEach(dot => dot.addEventListener('click', () => goTo(parseInt(dot.dataset.galleryDot))));
    if (prev) prev.addEventListener('click', () => goTo(current - 1));
    if (next) next.addEventListener('click', () => goTo(current + 1));

    // Sync dots on scroll
    let scrollTimeout;
    main.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const idx = isVertical()
          ? Math.round(main.scrollTop / main.offsetHeight)
          : Math.round(main.scrollLeft / main.offsetWidth);
        if (idx !== current) {
          current = idx;
          dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
        }
      }, 100);
    }, { passive: true });
  };

  /* --- Localization selectors (country + language) --- */
  const initLocalization = () => {
    document.querySelectorAll('[data-loc-select]').forEach((select) => {
      select.addEventListener('change', () => {
        const form = select.closest('form');
        if (form) form.submit();
      });
    });
  };

  /* --- Footer accordions (menu columns only) --- */
  const initFooterAccordions = () => {
    document.querySelectorAll('.footer__menu-group .footer__accordion-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const content = trigger.nextElementSibling;
        if (!content) return;
        const open = content.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  };

  /* --- Newsletter: expandable fields + Klaviyo profile properties --- */
  const initNewsletterForms = () => {
    const sendToKlaviyo = (props) => {
      if (!props || !props['$email']) return;
      try { window.klaviyo = window.klaviyo || []; window.klaviyo.push(['identify', props]); } catch (e) {}
      try { window._learnq = window._learnq || []; window._learnq.push(['identify', props]); } catch (e) {}
    };

    const bind = (scope) => {
      const form = scope.tagName === 'FORM' ? scope : scope.querySelector('form');
      if (!form || form.dataset.nlBound) return;
      form.dataset.nlBound = '1';

      const fields = scope.querySelector('[data-nl-fields]'); // collapsible (footer) or null
      const expanders = scope.querySelectorAll('[data-nl-expand]');
      const reqs = scope.querySelectorAll('[data-nl-required]');
      const trigger = scope.querySelector('[data-nl-expand]');

      const setReq = (on) => reqs.forEach((el) => (on ? el.setAttribute('required', '') : el.removeAttribute('required')));
      const expand = () => { if (fields) { fields.hidden = false; setReq(true); if (trigger) trigger.setAttribute('aria-expanded', 'true'); } };
      const collapse = () => { if (fields) { fields.hidden = true; setReq(false); if (trigger) trigger.setAttribute('aria-expanded', 'false'); } };

      expanders.forEach((b) => b.addEventListener('click', () => (fields && fields.hidden ? expand() : collapse())));

      form.addEventListener('submit', (e) => {
        // Clicking Register while collapsed just opens the form.
        if (fields && fields.hidden) { e.preventDefault(); expand(); return; }
        if (form.dataset.nlSent) return;
        const getVal = (sel) => { const el = form.querySelector(sel); return el ? el.value.trim() : ''; };
        const em = getVal('[name="contact[email]"]');
        if (!em) return;
        const props = { '$email': em };
        const fn = getVal('[name="contact[first_name]"]'); if (fn) props['$first_name'] = fn;
        const ln = getVal('[name="contact[last_name]"]'); if (ln) props['$last_name'] = ln;
        const gender = form.querySelector('[name="nl_gender"]:checked'); if (gender && gender.value) props['Title'] = gender.value;
        const bday = getVal('[data-birthday]'); if (bday) props['Birthday'] = bday;
        // Foreign World join = opt-in to be featured on the globe (delineates
        // globe members from plain email subscribers).
        if (form.closest('[data-globe-optin]')) props['globe_opt_in'] = true;
        e.preventDefault();
        form.dataset.nlSent = '1';
        sendToKlaviyo(props);
        setTimeout(() => form.submit(), 400);
      });
    };

    document.querySelectorAll('[data-nl-section]').forEach(bind);
    document.querySelectorAll('[data-nl-form]').forEach((el) => {
      if (el.closest('[data-nl-section]')) return;
      const form = el.closest('form');
      if (form) bind(form);
    });
  };

  /* --- PDP Mobile Band ATC button --- */
  const initPdpMobileBand = () => {
    const mobileBtn = document.querySelector('[data-mobile-submit]');
    const form = document.querySelector('[data-add-to-cart]');
    if (!mobileBtn || !form) return;
    mobileBtn.addEventListener('click', () => form.requestSubmit());
  };

  /* --- Initialize Everything (each isolated so one failure can't break others) --- */
  const init = () => {
    [
      initReveal, initMobileMenu, initChrome, initAnnouncement, initStickyHeader,
      initCarousels, initVariantSelectors, initQuantitySelectors, initAccordions,
      initModals, initCartDrawer, initProductGallery, initFilters, initAddToCart,
      initWishlist, initWishlistDrawer, initSearchDrawer, initPdpTabs, initPdpGallery,
      initPdpMobileBand, initPdpVariants, initFooterAccordions, initNewsletterForms, initLocalization,
    ].forEach((fn) => {
      try { fn(); } catch (e) { console.error('[FR init]', fn.name, e); }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
