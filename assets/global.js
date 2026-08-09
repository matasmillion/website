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
    const lowStockEl = pdp.querySelector('[data-low-stock]');
    const threshold = parseInt(pdp.dataset.lowStockThreshold, 10) || 5;

    let inventory = {};
    const invEl = pdp.querySelector('[data-inventory-json]');
    if (invEl) {
      try { inventory = JSON.parse(invEl.textContent); } catch (e) { inventory = {}; }
    }

    // Instalments keep their cents; prices drop a trailing .00
    const moneyExact = (cents) =>
      (cents / 100).toLocaleString(undefined, { style: 'currency', currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD' });

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

      // No colour label to sync — the PDP never names the colour. The chip's
      // is-selected rule is the whole indication.

      const setState = (btn, textEl, priceSel) => {
        if (!btn) return;
        const priceEl = pdp.querySelector(priceSel);
        if (variant) {
          if (idInput) idInput.value = variant.id;
          if (priceEl) {
            // Rebuild the sale markup so a variant with a different compare-at
            // shows (or drops) the struck-through original.
            if (variant.compare_at_price && variant.compare_at_price > variant.price) {
              priceEl.innerHTML =
                '<s class="price-was">' + money(variant.compare_at_price) + '</s>' +
                '<span class="price-now">' + money(variant.price) + '</span>';
            } else {
              priceEl.textContent = money(variant.price);
            }
          }
          if (variant.available) { btn.disabled = false; if (textEl) textEl.textContent = 'Add to cart'; }
          else { btn.disabled = true; if (textEl) textEl.textContent = 'Sold out'; }
        } else {
          btn.disabled = true;
          if (textEl) textEl.textContent = 'Unavailable';
        }
      };
      setState(addBtn, addText, '[data-price]');
      setState(mobileBtn, mobileText, '[data-mobile-price]');

      // Low stock — only for variants Shopify actually tracks
      if (lowStockEl) {
        const left = variant ? inventory[variant.id] : undefined;
        if (variant && variant.available && typeof left === 'number' && left > 0 && left <= threshold) {
          lowStockEl.textContent = left === 1 ? 'Last one left' : `Only ${left} left`;
          lowStockEl.hidden = false;
        } else {
          lowStockEl.hidden = true;
        }
      }

      // Back in stock replaces the disabled button when a variant is sold out
      // Pay-in-4 figure follows the variant price
      const inst = pdp.querySelector('[data-installment]');
      if (inst && variant) inst.textContent = moneyExact(variant.price / 4);
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

    // Instalments keep their cents; prices drop a trailing .00
    const moneyExact = (cents) =>
      (cents / 100).toLocaleString(undefined, { style: 'currency', currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD' });

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

    // Instalments keep their cents; prices drop a trailing .00
    const moneyExact = (cents) =>
      (cents / 100).toLocaleString(undefined, { style: 'currency', currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD' });

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

    // Instalments keep their cents; prices drop a trailing .00
    const moneyExact = (cents) =>
      (cents / 100).toLocaleString(undefined, { style: 'currency', currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD' });

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

  /* --- PDP detail rows (Fabric / Colour / Packaging dropdowns) --- */
  const initPdpRows = () => {
    document.querySelectorAll('[data-pdp-rows]').forEach(group => {
      group.querySelectorAll('[data-row-trigger]').forEach(trigger => {
        const panel = trigger.parentElement.querySelector('[data-row-panel]');
        if (!panel) return;
        trigger.addEventListener('click', () => {
          const open = trigger.getAttribute('aria-expanded') === 'true';
          // One row open at a time keeps the column from running away
          group.querySelectorAll('[data-row-trigger]').forEach(t => t.setAttribute('aria-expanded', 'false'));
          group.querySelectorAll('[data-row-panel]').forEach(p => { p.hidden = true; });
          if (!open) {
            trigger.setAttribute('aria-expanded', 'true');
            panel.hidden = false;
          }
        });
      });
    });
  };

  /* --- PDP Content panels (Engineering / Fabric / Colour / Packaging) --- */
  const initContentPanels = () => {
    document.querySelectorAll('[data-panel-media]').forEach(panel => {
      const slides = panel.querySelectorAll('[data-panel-slide]');
      const thumbs = panel.querySelectorAll('[data-panel-thumb]');
      if (slides.length < 2) return;

      thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          const idx = thumb.dataset.panelThumb;
          slides.forEach(s => s.classList.toggle('is-active', s.dataset.panelSlide === idx));
          thumbs.forEach(t => t.classList.toggle('is-active', t === thumb));
        });
      });
    });
  };

  /* --- PDP Delivery estimator + rolling urgency --- */
  // Renamed with the switch from postcodes to countries; the old key is left
  // behind deliberately so a stored zip cannot be read back as a country code.
  const ZIP_KEY = 'fr_delivery_country';

  // The market country as of the last page we rendered. The footer's Shipping
  // Country picker submits Shopify's localization form and reloads the page
  // under a new market, so a change down there surfaces up here as this value
  // moving between loads.
  const MARKET_KEY = 'fr_market_country';

  /* --- Which country the Shipping and Returns tabs open on ---
     The footer's Shipping Country is the default, and moving it moves both
     tabs. Choosing a country inside either tab overrides that, and the override
     survives navigation until the shopper changes it again — or until they move
     the footer picker, which is the more deliberate statement of the two and
     therefore wins.

     Telling those apart needs memory: the market country is stamped on every
     load, so if it has moved since we last looked, the footer is what moved it
     and the stale override is dropped. Without that stamp a saved country
     outranks the footer forever, which is the bug this fixes. */
  const resolveCountry = (market, isOption) => {
    const now = (market || '').toUpperCase();
    let saved = null;
    let seen = null;
    try {
      saved = localStorage.getItem(ZIP_KEY);
      seen = localStorage.getItem(MARKET_KEY);
    } catch (e) { return now; }

    if (now && seen !== now) {
      try {
        localStorage.setItem(MARKET_KEY, now);
        localStorage.removeItem(ZIP_KEY);
      } catch (e) {}
      return now;
    }

    // Shape-checked before it reaches a selector: storage is user-writable, and
    // an ISO country code is only ever two letters. Still has to be a country
    // the market actually offers — markets change under saved state.
    if (saved && /^[A-Za-z]{2}$/.test(saved)) {
      const code = saved.toUpperCase();
      if (!isOption || isOption(code)) return code;
    }
    return now;
  };

  // Adds whole business days, skipping weekends.
  const addBusinessDays = (from, days) => {
    const d = new Date(from.getTime());
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) added += 1;
    }
    return d;
  };

  // The cutoff belongs to the warehouse, not the visitor. A shopper in New York
  // at 3pm is at noon in Los Angeles and still inside a 1pm cutoff — reading the
  // browser clock would tell them they missed a window they still have an hour of.
  // The returned Date carries the store's wall clock in its local fields, so
  // getDay/getHours and the business-day arithmetic below all agree on one zone.
  const zonedNow = (tz) => {
    const now = new Date();
    if (!tz) return now;
    try {
      const shifted = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      return isNaN(shifted.getTime()) ? now : shifted;
    } catch (e) {
      // An unrecognised zone must not take the estimator — or the PDP — down.
      return now;
    }
  };

  // Orders placed after the cutoff, or at a weekend, dispatch the next business day.
  const dispatchStart = (cutoffHour, tz) => {
    const now = zonedNow(tz);
    let start = new Date(now.getTime());
    const day = start.getDay();
    if (now.getHours() >= cutoffHour || day === 0 || day === 6) {
      start = addBusinessDays(start, 1);
    }
    return start;
  };

  // Whole minutes until the cutoff of the day the order actually dispatches —
  // today's before the cutoff, the next business day's after it. Past 1pm the
  // clock restarts against tomorrow rather than dying at "order today", and
  // because the arrival date is derived from the same dispatch day, beating
  // this countdown is exactly what earns the date shown beside it.
  // Both instants sit in the same shifted frame, so the difference is real
  // elapsed time. Rounding up keeps the tail honest: 30s out reads "1m".
  const minsToCutoff = (now, start, cutoffHour) => {
    const target = new Date(start.getTime());
    target.setHours(cutoffHour, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / 60000);
  };

  // Deriving every part from one total is what stops the old "1h 60m" on the
  // hour. Days appear because a Friday-afternoon order counts down to Monday's
  // cutoff, and "71h" is not a number anyone parses at a glance.
  const fmtCountdown = (totalMins) => {
    const d = Math.floor(totalMins / 1440);
    const h = Math.floor((totalMins % 1440) / 60);
    const m = totalMins % 60;
    if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`;
    if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
    return `${m}m`;
  };

  const fmtDate = (d) =>
    d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  // Calendar days from the shopper's today to an arrival date. Both ends are
  // flattened to midnight because arrival is a date, not an instant, and
  // rounding absorbs the 23/25-hour days either side of a DST switch.
  const daysUntil = (target) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const t = new Date(target.getTime());
    t.setHours(0, 0, 0, 0);
    return Math.round((t.getTime() - today.getTime()) / 86400000);
  };

  // Phrase arrival the way Shop Promise does — "tomorrow" lands faster than
  // "Tue, Aug 4". Measured against the SHOPPER's calendar, not the warehouse's:
  // tomorrow has to mean tomorrow to whoever is reading it.
  const fmtRelative = (d) => {
    const days = daysUntil(d);
    // Only reachable if the shopper's zone runs ahead of the warehouse's.
    // "Today" is too strong a claim to make on a timezone artefact.
    if (days <= 0) return fmtDate(d);
    if (days === 1) return 'tomorrow';
    const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
    if (days < 7) return weekday;
    if (days < 14) return 'next ' + weekday;
    // Past a fortnight "next Tuesday" stops carrying information, and ROW
    // windows run 10–20 days, so those resolve to a real date.
    return fmtDate(d);
  };

  // Assembled as nodes, never innerHTML — the zip is read back from
  // localStorage, which is shopper-supplied and tamperable.
  const setLine = (el, parts) => {
    el.textContent = '';
    parts.forEach((part) => {
      const str = part[0];
      if (!str) return;
      if (part[1]) {
        const strong = document.createElement('strong');
        strong.textContent = str;
        el.appendChild(strong);
      } else {
        el.appendChild(document.createTextNode(str));
      }
    });
  };

  // Arrival windows drop the weekday — two of them side by side with the tier
  // label is already a lot of characters for a 390px viewport.
  const fmtShort = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const fmtWindow = (from, lo, hi) => {
    const a = addBusinessDays(from, lo);
    const b = addBusinessDays(from, hi);
    // A one-day window would otherwise read "Aug 5 – Aug 5".
    return a.getTime() === b.getTime() ? fmtShort(a) : fmtShort(a) + ' – ' + fmtShort(b);
  };

  // One line per country: CODE|std_lo|std_hi|exp_lo|exp_hi|std_price|exp_price.
  // "-" in a day column disables that tier for that country — plenty of lanes
  // have no express option worth quoting.
  const parseRates = (text) => {
    const table = {};
    (text || '').split('\n').forEach((line) => {
      const p = line.split('|').map((s) => s.trim());
      if (p.length < 5 || !p[0]) return;
      const num = (v) => (v === '-' || v === '' ? null : parseInt(v, 10));
      table[p[0].toUpperCase()] = {
        sl: num(p[1]), sh: num(p[2]),
        el: num(p[3]), eh: num(p[4]),
        sp: p[5] || '', ep: p[6] || '',
      };
    });
    return table;
  };

  const initDeliveryEstimator = () => {
    const root = document.querySelector('[data-delivery-estimator]');
    const urgency = document.querySelector('[data-delivery-urgency]');
    if (!root && !urgency) return;

    const cfg = root ? root.dataset : {};
    const cutoff = parseInt(cfg.cutoffHour, 10) || 13;
    const tz = cfg.timezone || '';
    const country = cfg.country || 'US';

    const ratesEl = root ? root.querySelector('[data-delivery-rates]') : null;
    const rates = parseRates(ratesEl ? ratesEl.textContent : '');
    // An explicit country wins; a ROW line, if the merchant wrote one, catches
    // the rest; otherwise the lane genuinely cannot be quoted.
    const ratesFor = (code) => rates[(code || '').toUpperCase()] || rates.ROW || null;

    const CHOSEN = () => {
      try { return localStorage.getItem(ZIP_KEY) || country; } catch (e) { return country; }
    };
    // Recomputed rather than captured: a cutoff that passes mid-session has to
    // roll the dispatch day for the urgency line and the zip results alike.
    const startFor = () => dispatchStart(cutoff, tz);

    // Rolling urgency renders immediately — it needs no zip.
    if (urgency) {
      const text = urgency.querySelector('[data-urgency-text]');
      let timer = null;

      const renderUrgency = () => {
        if (!text) return 0;
        // The fastest lane the shopper could pick, not the slowest — the line
        // says "as early as". Express is the paid tier; lanes without one fall
        // back to the quick end of standard. A country we cannot quote gets no
        // line at all rather than a borrowed date from somewhere else.
        const r = ratesFor(CHOSEN());
        if (!r || (!r.eh && !r.sl)) { urgency.hidden = true; return 0; }
        const fastest = r.eh || r.sl || 2;
        // One dispatch day drives both halves of the line: the countdown is the
        // deadline to make it, the date is what making it earns.
        const start = startFor();
        const by = addBusinessDays(start, fastest);
        // The destination suffix is gone with the zip: naming the country here
        // would read "…as early as Tuesday to US" on a storefront already
        // scoped to that country. The picker below states it better.
        const dest = '';

        // Always positive: the target rolls with the dispatch day, so passing
        // 1pm restarts the clock against tomorrow instead of stalling the line.
        const left = minsToCutoff(zonedNow(tz), start, cutoff);
        // The countdown and the arrival both render bold — they are the only
        // two values on the line a shopper actually acts on.
        const arrival = fmtRelative(by);

        // Beside Shop Promise the line is a deadline and nothing else. Shopify's
        // own line sits directly above it and already states the arrival date,
        // and the two dates come from different places — ours from the rates
        // table in the theme settings, theirs from carrier data. Printing both
        // only invites the shopper to notice they disagree.
        if (urgency.classList.contains('is-with-promise')) {
          if (left > 0) {
            setLine(text, [['Order within ', false], [fmtCountdown(left), true]]);
            urgency.hidden = false;
            return left;
          }
          // Past the cutoff there is no deadline worth quoting, and the arrival
          // date belongs to Shopify's line here, so there is nothing to fall
          // back to. Say nothing rather than pad the page.
          urgency.hidden = true;
          return 0;
        }

        if (left > 0) {
          setLine(text, [
            ['Order within ', false],
            [fmtCountdown(left), true],
            [' to receive as early as ', false],
            [arrival, true],
            [dest, false],
          ]);
        } else {
          // Unreachable while dispatchStart and the target share a cutoff, but
          // a clock that cannot be trusted should drop the deadline, not guess.
          setLine(text, [
            ['Order today to receive as early as ', false],
            [arrival, true],
            [dest, false],
          ]);
        }
        urgency.hidden = false;
        return left;
      };

      // A countdown that doesn't count reads as decoration. Only wind the clock
      // if there is actually time left to show — a page opened after the cutoff
      // gets the static line and no interval at all.
      const tick = () => {
        if (renderUrgency() > 0 && !timer) timer = setInterval(renderUrgency, 60000);
      };
      tick();
      // Shop Promise resolves long after this first render, and it decides which
      // of the two wordings above is the right one. Re-render when it lands
      // rather than leaving the full line on screen until the next minute ticks.
      document.addEventListener('fr:promise', tick);
      // Without this a backgrounded tab is restored with a stale number frozen
      // on screen, which is worse than showing no countdown in the first place.
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) tick();
      });
    }

    if (!root) return;

    const select = root.querySelector('[data-dest-country]');
    const results = root.querySelector('[data-dest-results]');
    const error = root.querySelector('[data-dest-error]');
    const rowFor = (k) => root.querySelector('[data-dest-row="' + k + '"]');

    // A tier renders only when it has both a window and a price for this
    // country. Half a row — a service name with an empty date beside it —
    // reads as broken rather than as unavailable.
    const tier = (key, lo, hi, price, dateSel, priceSel) => {
      const row = rowFor(key);
      if (!row) return false;
      const dateEl = root.querySelector(dateSel);
      const priceEl = root.querySelector(priceSel);
      if (lo == null || hi == null) { row.hidden = true; return false; }
      if (dateEl) dateEl.textContent = fmtWindow(startFor(), lo, hi);
      if (priceEl) priceEl.textContent = price || '';
      row.hidden = false;
      return true;
    };

    const render = (code) => {
      const r = ratesFor(code);
      // No zone covers this country, so there is no rate to quote and no
      // checkout to reach. Saying so beats inventing a date.
      if (!r) {
        results.hidden = true;
        if (error) error.hidden = false;
        return;
      }
      if (error) error.hidden = true;
      // Both calls must run — each owns its row's visibility — so the results
      // are collected before being combined rather than short-circuited.
      const hasStd = tier('standard', r.sl, r.sh, r.sp, '[data-dest-standard]', '[data-dest-standard-price]');
      const hasExp = tier('express', r.el, r.eh, r.ep, '[data-dest-express]', '[data-dest-express-price]');
      const shown = hasStd || hasExp;
      results.hidden = !shown;
      if (!shown && error) error.hidden = false;
      // No longer persists here. render() runs on load as well as on change, so
      // writing the country from inside it stamped an override the shopper had
      // never chosen — after which the footer's picker could never win. The
      // write moved to the change handler, where an actual choice happens.
    };

    if (select) {
      // data-country is localization.country.iso_code — the footer's Shipping
      // Country. resolveCountry decides whether it or a saved override applies.
      const initial = resolveCountry(country, (code) =>
        !!select.querySelector('option[value="' + code + '"]'));
      select.value = initial;
      // Resolves on load rather than behind an Apply click: the country is
      // already known from the market, so there is nothing to wait for.
      render(initial);

      select.addEventListener('change', () => {
        // Persisted here and only here — this is the shopper actually choosing.
        try { localStorage.setItem(ZIP_KEY, select.value); } catch (e) {}
        render(select.value);
        // Keeps the Returns picker in step — one shopper, one country.
        document.dispatchEvent(new CustomEvent('fr:country', { detail: select.value }));
      });

      document.addEventListener('fr:country', (e) => {
        if (e.detail && e.detail !== select.value) {
          select.value = e.detail;
          render(e.detail);
        }
      });
    }
  };

  /* --- PDP Returns resolved against the shopper's country --- */
  // The refund policy is regional — offered in the USA, "soon" for EU/UK/CA/AUS,
  // unavailable elsewhere — so the panel cannot state one set of terms and be
  // right. A country with no line is treated as not-yet-offered rather than
  // falling back to the US terms, which would promise a return that isn't there.
  const initReturnsByCountry = () => {
    const panel = document.querySelector('[data-returns-panel]');
    if (!panel) return;

    const select = panel.querySelector('[data-returns-country]');
    const rulesEl = panel.querySelector('[data-returns-rules]');
    const terms = panel.querySelector('[data-returns-terms]');
    const intro = panel.querySelector('[data-returns-intro]');
    const none = panel.querySelector('[data-returns-none]');
    const start = panel.querySelector('[data-returns-start]');

    // CODE|window days|exchange|store credit|to card
    const rules = {};
    ((rulesEl && rulesEl.textContent) || '').split('\n').forEach((line) => {
      const p = line.split('|').map((s) => s.trim());
      if (p.length < 5 || !p[0]) return;
      rules[p[0].toUpperCase()] = { days: p[1], ex: p[2], cr: p[3], cd: p[4] };
    });
    const ruleFor = (c) => rules[(c || '').toUpperCase()] || rules.ROW || null;

    const set = (sel, val) => {
      const el = panel.querySelector(sel);
      if (el) el.textContent = val || '';
    };

    const render = (code) => {
      const r = ruleFor(code);
      if (terms) terms.hidden = !r;
      if (intro) intro.hidden = !r;
      if (none) none.hidden = !!r;
      // The primary action goes with the terms: offering "Start a return" to a
      // region that cannot return is the one link worse than no link. The
      // policy link stays — it is what explains the regional difference.
      if (start) start.hidden = !r;
      if (!r) return;
      set('[data-returns-exchange]', r.ex);
      set('[data-returns-credit]', r.cr);
      set('[data-returns-card]', r.cd);
      if (intro) {
        // Carries the fallback because Liquid cannot: a literal {days} inside a
        // {{ }} output tag fails to parse, so the section ships the setting
        // bare and the default belongs here.
        const tpl = intro.dataset.template ||
          'You have {days} days from the date of delivery to return or exchange items.';
        intro.textContent = tpl.replace('{days}', r.days);
      }
    };

    if (select) {
      // Read before anything overrides it: the option Liquid marked selected is
      // localization.country.iso_code, i.e. the footer's Shipping Country.
      const market = select.value;
      const initial = resolveCountry(market, (code) =>
        !!select.querySelector('option[value="' + code + '"]'));
      select.value = initial;
      render(initial);

      select.addEventListener('change', () => {
        try { localStorage.setItem(ZIP_KEY, select.value); } catch (e) {}
        render(select.value);
        // Shipping and Returns answer the same question about the same person.
        // Setting the country in one tab has to move the other, or the page
        // quietly holds two different answers.
        document.dispatchEvent(new CustomEvent('fr:country', { detail: select.value }));
      });

      document.addEventListener('fr:country', (e) => {
        if (e.detail && e.detail !== select.value) {
          select.value = e.detail;
          render(e.detail);
        }
      });
    } else {
      render((document.documentElement.lang || 'US').slice(-2).toUpperCase());
    }
  };

  /* --- Shop Promise: the few rules the document cannot reach --- */
  // Everything tokens and inheritance can do is in component-product-page.css.
  // What is left needs a stylesheet INSIDE the shadow root, because it either
  // targets an internal class or has to outrank an inline style the widget's
  // own JS writes:
  //
  //   padding    — .ContainerCommon__Container reads --p-space-350, which is
  //                also the expanded zip form's row gap. Zeroing the token
  //                would flatten the form; zeroing the class leaves it alone.
  //   alignment  — the rows are flex, aligned by --ui-*-align written inline.
  //                Only !important beats an inline declaration.
  //
  // Selectors match on the component half of each class ([class*=]) rather than
  // the full string. These are webpack module names — stable in shape, not
  // guaranteed verbatim across Shopify's rebuilds — so matching the half that
  // carries the meaning survives a rehash of the rest.
  const PROMISE_SKIN = `
    [class*="ContainerCommon__Container"] {
      padding: 0 !important;
      font-size: inherit !important;
    }
    [class*="Text__Text"] {
      font-size: inherit !important;
      letter-spacing: inherit !important;
    }
    [class*="ShopPromiseLogo__Logo"] { vertical-align: middle; }

    /* ONE LINE: arrival, zip, then the Shop mark to the right of it.
       Shopify stacks these — arrival on the first row, and the mark on a second
       row next to "Free shipping over $150". Turning the stack into a wrapping
       row lifts the mark up beside the zip, and giving the zip form a full
       basis keeps it on a row of its own when it expands. */
    [class*="ContainerCommon__Container"] > [class*="BlockStack__BlockStack"] {
      flex-direction: row !important;
      flex-wrap: wrap !important;
      align-items: center !important;
      column-gap: 0.45em !important;
      justify-content: center !important;
    }
    [class*="ContainerCommon__Container"] > [class*="BlockStack__BlockStack"] > [class*="ExpansionBlock__ExpansionBlock"] {
      flex-basis: 100% !important;
    }

    /* "Free shipping over $150" — dropped, so nothing sits between the zip and
       the mark.

       The adjacent sibling is load-bearing, not decoration. It only matches an
       inline row that FOLLOWS an arrival line, which is the two-row layout this
       is meant for. On the products where Shopify writes the whole promise
       sentence into that row instead — "Free delivery tomorrow to 10001" — there
       is no preceding line, so the rule does not match and the sentence stays.
       Without the guard, those products would lose their only line of copy and
       render as a bare Shop mark. */
    [class*="BlockStack__BlockStack"] > [class*="Text__Text"] + [class*="InlineStack__InlineStack"] > [class*="Text__Text"] {
      display: none !important;
    }

    /* A pencil after the zip, so "editable" is stated rather than implied by an
       underline nobody reads as a control.

       Drawn as a pseudo-element on the TEXT NODE that contains the zip, never on
       the <u> itself: an ancestor's underline is painted straight through its
       descendants, pseudo-elements included, so a pencil inside the <u> would
       have a line ruled across it. Sitting just outside, it ends up in the same
       place — the zip closes both layouts' sentences — with no underline on it.

       It is masked rather than set as a background image, so the glyph takes
       currentColor and cannot drift from the text it belongs to. The whole row
       is already Shopify's click target, so the pencil is live without being
       wired to anything. */
    [class*="ContainerCommon__Container"] > [class*="BlockStack__BlockStack"] > [class*="Text__Text"]:has(> u)::after,
    [class*="ContainerCommon__Container"] > [class*="BlockStack__BlockStack"] > [class*="InlineStack__InlineStack"] > [class*="Text__Text"]:has(> u)::after {
      content: "";
      display: inline-block;
      width: 0.95em;
      height: 0.95em;
      margin-left: 0.3em;
      vertical-align: -0.12em;
      background-color: currentColor;
      -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E") center / contain no-repeat;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E") center / contain no-repeat;
    }

    /* The widget's outermost element carries margin: 20px 0. Being the first and
       last in-flow child of a host with no padding or border, those margins
       collapse straight out through the host, so 20px of air lands below the box
       that no rule in the theme can see or reach. That is the gap that kept the
       countdown reading as a separate note rather than as this line's deadline.

       Only the bottom is cleared. The top margin is the separation from the
       add-to-cart button above, which is already right. */
    [class*="ProductPageContainer__Spacer"] { margin-bottom: 0 !important; }

    /* The expanded zip form is a form: left-aligned, and keeping its own gaps. */
    [class*="ExpansionBlock__ExpansionBlock"] [class*="BlockStack__BlockStack"],
    [class*="ExpansionBlock__ExpansionBlock"] [class*="InlineStack__InlineStack"] {
      --ui-block-stack-align: start !important;
      --ui-inline-stack-align: start !important;
    }

    /* Centred at every width, deliberately — no desktop flush-left override.
       The buy column this sits in is centre-aligned all the way up, so the line
       was the one element breaking ranks with the add-to-cart bar above it and
       the tab row below. */
  `;

  /* --- "Aug 13" -> "Thu, Aug 13" --- */
  // The one thing here that is not styling. Shopify writes the arrival date
  // without a weekday, and a weekday is the part a shopper actually plans
  // around, so it is inserted into the text node.
  //
  // The year is not in the string, so it is inferred: the widget only ever
  // quotes arrivals ahead of today, so a date reading as past belongs to next
  // year. The week of slack covers a shopper whose clock or timezone puts them
  // a day behind the warehouse — without it, an arrival quoted for today could
  // be thrown a full year forward and named the wrong day.
  const SP_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const SP_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // English abbreviations to match the English month already in the sentence.
  // Localising only the weekday would produce "jeu, Aug 13".
  const SP_DATE = new RegExp('\\b(' + SP_MONTHS.join('|') + ')\\s+(\\d{1,2})\\b');
  const SP_HAS_DAY = new RegExp('\\b(' + SP_DAYS.join('|') + '),');

  const nameTheDay = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    // Collected first, written after: editing text nodes mid-walk mutates the
    // tree the walker is standing in.
    const edits = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      // Idempotence is what stops the observer below looping on its own writes.
      if (!text || SP_HAS_DAY.test(text)) continue;
      const m = text.match(SP_DATE);
      if (!m) continue;
      const now = new Date();
      let when = new Date(now.getFullYear(), SP_MONTHS.indexOf(m[1]), parseInt(m[2], 10));
      if (when.getTime() < now.getTime() - 7 * 86400000) {
        when = new Date(now.getFullYear() + 1, SP_MONTHS.indexOf(m[1]), parseInt(m[2], 10));
      }
      edits.push([node, text.replace(m[0], SP_DAYS[when.getDay()] + ', ' + m[0])]);
    }
    edits.forEach((edit) => { edit[0].nodeValue = edit[1]; });
    return edits.length;
  };

  // The box carries a live carrier estimate; our urgency line is derived from
  // the theme's rates table. Two delivery dates on one page invites the shopper
  // to notice they disagree, so when Shopify's resolves, ours steps aside.
  const initShopPromise = () => {
    const host = () => document.querySelector('delivery-promise-wc');
    if (!host() && !document.querySelector('.delivery-promise__promise-container')) return;
    const urgency = document.querySelector('[data-delivery-urgency]');

    // Appended last so it follows the widget's own stylesheets; every rule that
    // has to win says so explicitly anyway.
    const skin = () => {
      const el = host();
      const sr = el && el.shadowRoot;
      if (!sr || sr.querySelector('[data-fr-skin]')) return;
      const style = document.createElement('style');
      style.setAttribute('data-fr-skin', '');
      style.textContent = PROMISE_SKIN;
      sr.appendChild(style);
    };

    // Presence is not enough on either count. <delivery-promise-wc> mounts empty
    // and stays empty on products no promise covers, so hiding our line on the
    // element alone would drop it from PDPs that never get a box at all.
    //
    // Nor is shadowRoot.textContent: the widget ships nineteen <style> elements
    // inside the shadow root, so that string is never blank and the check it
    // backed was only ever passing by way of the offsetHeight test beside it.
    // Read the rendered leaves instead.
    const resolved = () => {
      const el = host();
      if (!el || !el.offsetHeight) return false;
      const sr = el.shadowRoot;
      if (!sr) return false;
      return [...sr.querySelectorAll('*')].some(
        (n) => !/^(style|script)$/i.test(n.tagName) && n.childElementCount === 0 && n.textContent.trim()
      );
    };

    // The weekday has to be reapplied whenever the widget rewrites its own copy
    // — changing the postcode re-renders the line — and the observer below is
    // watching document.body, which does NOT see mutations inside a shadow root.
    // So the shadow root gets an observer of its own, attached once it exists.
    let watching = false;
    const nameDays = () => {
      const el = host();
      const sr = el && el.shadowRoot;
      if (!sr) return;
      nameTheDay(sr);
      if (watching) return;
      watching = true;
      // Our own write lands as a characterData mutation and re-enters here;
      // nameTheDay is idempotent, so the second pass edits nothing and stops.
      new MutationObserver(() => nameTheDay(sr)).observe(sr, {
        childList: true, subtree: true, characterData: true,
      });
    };

    // Our line no longer stands down for Shopify's — it sits under it as the
    // deadline for the date Shopify quotes, carrying the pulse and the
    // countdown. The class is what tells the estimator to drop its own arrival
    // date and render the countdown alone; see renderUrgency.
    //
    // The event fires only on a real change. sync() runs on every body mutation
    // on the page, and re-rendering the countdown on each of those would be a
    // lot of work to arrive at the same string.
    const sync = () => {
      skin();
      nameDays();
      if (!urgency) return;
      const before = urgency.classList.contains('is-with-promise');
      const now = resolved();
      if (before === now) return;
      urgency.classList.toggle('is-with-promise', now);
      document.dispatchEvent(new CustomEvent('fr:promise'));
    };

    sync();
    // The bundle is deferred and resolves well after this runs, so a one-shot
    // check would almost always miss it.
    new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
  };

  /* --- Foreign Engineering: pick salt or slate per card from the image --- */
  const initOverlayContrast = () => {
    // Every place copy is laid over an image. `band` is the strip the copy
    // actually sits over — Foreign Engineering writes into the bottom-left,
    // Complete the Look's heading into the top-left — and sampling the wrong
    // end is how white text ends up on a pale sky.
    const targets = [
      { host: '.fre__card', img: '.fre__img', band: 'bottom' },
      { host: '.ctl__lookbook', img: '.ctl__lookbook-img', band: 'top' },
    ];

    // Sample that corner and measure its luminance, so the text flips to slate
    // on pale imagery and stays salt on dark.
    const measure = (host, imgSel, band) => {
      const img = host.querySelector(imgSel);
      if (!img) return;

      const sample = () => {
        try {
          const c = document.createElement('canvas');
          const w = 24, h = 24;
          c.width = w; c.height = h;
          const ctx = c.getContext('2d');
          const bandH = img.naturalHeight * 0.3;
          const sy = band === 'top' ? 0 : Math.max(0, img.naturalHeight - bandH);
          ctx.drawImage(img, 0, sy, img.naturalWidth * 0.5, bandH, 0, 0, w, h);
          const d = ctx.getImageData(0, 0, w, h).data;
          let sum = 0;
          for (let i = 0; i < d.length; i += 4) {
            sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          }
          const avg = sum / (d.length / 4);
          host.classList.toggle('is-light-bg', avg > 140);
        } catch (e) {
          // Tainted canvas or a blocked image: keep the salt default
        }
      };

      img.crossOrigin = 'anonymous';
      if (img.complete && img.naturalWidth) sample();
      else img.addEventListener('load', sample, { once: true });
    };

    targets.forEach((t) => {
      document.querySelectorAll(t.host).forEach((host) => measure(host, t.img, t.band));
    });
  };

  /* --- Klaviyo back-in-stock: tag whatever it injects so CSS can reach it --- */
  const initKlaviyoBisSkin = () => {
    const pdp = document.querySelector('[data-pdp]');
    if (!pdp) return;

    const band = document.querySelector('[data-sticky-band]');
    // The band is display:none above 768px — moving the button into it on
    // desktop is what made "Notify me" vanish there entirely. Desktop leaves it
    // where Klaviyo rendered it, inside the buy column.
    const onMobile = () => window.matchMedia('(max-width: 768px)').matches;

    const isBis = (el) => {
      const cls = (el.getAttribute('class') || '') + ' ' + (el.id || '');
      const txt = (el.textContent || el.value || '').trim().toLowerCase();
      return /klaviyo[-_]?bis|bis[-_]?trigger|back[-_]?in[-_]?stock/i.test(cls) ||
             /^notify me/.test(txt);
    };

    // tag() removes nodes, which the observer would see as another mutation.
    let syncing = false;

    const tag = () => {
      if (syncing) return;
      syncing = true;

      // Collect every match INCLUDING ones already moved into the band. The old
      // version skipped those, so each in-stock → sold-out → in-stock cycle
      // appended a fresh button beside the untouched previous ones and they
      // stacked until they filled the page.
      const found = [];
      pdp.querySelectorAll('button, a, input[type="button"], input[type="submit"]').forEach((el) => {
        if (el.hasAttribute('data-mobile-submit')) return;
        if (isBis(el)) found.push(el);
      });

      if (found.length) {
        // Klaviyo's newest render is the live one; the rest are strays.
        const keep = found[found.length - 1];
        found.slice(0, -1).forEach((el) => el.remove());
        keep.classList.add('fr-bis');

        if (onMobile()) {
          if (band && keep.parentElement !== band) band.appendChild(keep);
        } else if (band && keep.parentElement === band) {
          // Resized up from mobile: pull it out of the hidden band so it is
          // visible again rather than stranded inside a display:none parent.
          band.parentElement.insertBefore(keep, band);
        }
      }

      requestAnimationFrame(() => { syncing = false; });
    };

    tag();
    // Klaviyo injects late and can re-render, so keep watching the PDP subtree.
    new MutationObserver(tag).observe(pdp, { childList: true, subtree: true });
    // Crossing the breakpoint changes which parent the button belongs to.
    window.addEventListener('resize', tag, { passive: true });
  };

  /* --- PDP sticky band (mobile): hide once past Foreign Engineering --- */
  const initPdpStickyBand = () => {
    const band = document.querySelector('[data-sticky-band]');
    if (!band) return;

    // The band must never sit on top of full-bleed imagery, and a fixed element
    // cannot both cross a section and stay clear of it — so it retires the
    // moment its boundary reaches the viewport and returns if you scroll back
    // up into the product details.
    //
    // The resting-area section is that boundary when present, which keeps the
    // handover a placeable decision rather than one wired to whichever section
    // happens to come first. The named sections remain as a fallback for
    // templates that predate it.
    const boundary =
      document.querySelector('[data-band-rest]') ||
      document.querySelector('.section-fr-engineering') ||
      document.querySelector('.section-pdp-complete-the-look');
    if (!boundary) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty('--pdp-band-h', band.offsetHeight + 'px');
    };
    syncHeight();
    if (window.ResizeObserver) new ResizeObserver(syncHeight).observe(band);

    let ticking = false;
    const place = () => {
      ticking = false;
      // Hide as soon as the section's first pixel crosses the viewport bottom,
      // which is exactly where the band's own top edge sits.
      const top = boundary.getBoundingClientRect().top;
      band.classList.toggle('is-hidden', top <= window.innerHeight);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(place);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    place();
  };

  /* --- PDP zoom: in-place on desktop, fullscreen lightbox on touch --- */
  const initPdpZoom = () => {
    const gallery = document.querySelector('[data-product-gallery]');
    const zoom = document.querySelector('[data-pdp-zoom]');
    if (!gallery || !zoom) return;

    const img = zoom.querySelector('[data-zoom-img]');
    const stage = zoom.querySelector('[data-zoom-stage]');
    const cursor = gallery.querySelector('[data-zoom-cursor]');
    const main = gallery.querySelector('[data-gallery-main]');

    // Re-evaluated per call, not cached: a resize or a hybrid device must not
    // get stuck on whichever path happened to be true at load.
    const isDesktop = () => window.matchMedia('(min-width: 769px) and (pointer: fine)').matches;

    /* ---- Desktop: magnify inside the gallery frame, pan with the pointer.
       The page is never covered and there is nothing to exit out of. ---- */
    let zoomedSlide = null;

    // The point under the cursor is the one that stays put as the image scales,
    // which is what makes the pan feel like moving a loupe over the fabric.
    const originFromEvent = (slide, e) => {
      const r = slide.getBoundingClientRect();
      const clamp = (n) => Math.max(0, Math.min(100, n));
      return clamp(((e.clientX - r.left) / r.width) * 100) + '% '
           + clamp(((e.clientY - r.top) / r.height) * 100) + '%';
    };

    const slideImg = (slide) => slide && slide.querySelector('.pdp__gallery-img');

    const zoomIn = (slide, e) => {
      const el = slideImg(slide);
      if (!el) return;
      // 2x over a ~58vw column needs the 2048 source. srcset has to go or the
      // browser re-picks the 1200w candidate and the detail stays mush. Flagged
      // rather than compared against el.src: image_url emits a protocol-relative
      // URL, so el.src (resolved, absolute) would never match it.
      if (slide.dataset.zoomSrc && !el.dataset.zoomLoaded) {
        el.dataset.zoomLoaded = '1';
        el.srcset = '';
        el.src = slide.dataset.zoomSrc;
      }
      el.style.transformOrigin = originFromEvent(slide, e);
      slide.classList.add('is-zoomed');
      zoomedSlide = slide;
      if (cursor) cursor.textContent = '−';
    };

    const zoomOut = () => {
      if (!zoomedSlide) return;
      const el = slideImg(zoomedSlide);
      // The hi-res src stays put — it is already downloaded, and swapping back
      // would flash on every re-zoom.
      if (el) el.style.transformOrigin = '';
      zoomedSlide.classList.remove('is-zoomed');
      zoomedSlide = null;
      if (cursor) cursor.textContent = '+';
    };

    // Cursor-following +/- over the gallery, and the pan while zoomed
    // (desktop, fine pointers only)
    if (window.matchMedia('(min-width: 769px) and (pointer: fine)').matches) {
      gallery.addEventListener('pointermove', (e) => {
        if (cursor) {
          const r = gallery.getBoundingClientRect();
          cursor.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px)';
        }
        if (zoomedSlide) {
          const el = slideImg(zoomedSlide);
          if (el) el.style.transformOrigin = originFromEvent(zoomedSlide, e);
        }
      }, { passive: true });

      // Fetch the 2048 ahead of the click so the first zoom doesn't stutter.
      gallery.addEventListener('pointerover', (e) => {
        const slide = e.target.closest('[data-gallery-slide]');
        if (!slide || slide.dataset.zoomPreloaded || !slide.dataset.zoomSrc) return;
        slide.dataset.zoomPreloaded = '1';
        new Image().src = slide.dataset.zoomSrc;
      }, { passive: true });
    }

    /* ---- Touch: the fullscreen viewer, since there is no hover to pan with ---- */
    // inset: open as a panel floating over a dimmed page rather than replacing
    // the page outright. The gallery's touch viewer wants the full bleed — it
    // is a pan-and-zoom surface — but a fabric swatch is being compared against
    // the product it belongs to, so the page has to stay visible behind it.
    const open = (slide, inset) => {
      if (!slide || !img) return;
      img.src = slide.dataset.zoomSrc || '';
      img.alt = slide.dataset.zoomAlt || '';
      zoom.classList.toggle('pdp-zoom--inset', !!inset);
      zoom.classList.add('is-active');
      zoom.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      zoom.classList.remove('is-active', 'is-zoomed');
      zoom.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    // Mobile swipes share this surface, so a drag must not count as a click.
    let downX = 0, downY = 0;
    gallery.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; }, { passive: true });
    gallery.addEventListener('click', (e) => {
      const slide = e.target.closest('[data-gallery-slide]');
      if (!slide) return;
      if (Math.abs(e.clientX - downX) > 10 || Math.abs(e.clientY - downY) > 10) return;
      if (!isDesktop()) { open(slide); return; }
      if (zoomedSlide === slide) { zoomOut(); return; }
      zoomOut();
      zoomIn(slide, e);
    });

    // Anything else on the page that wants the full-screen viewer: the fabric
    // swatches in the Fabric tab today. Same contract as a gallery slide —
    // data-zoom-src and data-zoom-alt — so nothing new has to be taught here.
    //
    // Straight to open(), never the isDesktop() fork above: that branch runs
    // the in-place magnifier, which needs a .pdp__gallery-img child and
    // gallery-relative pointer geometry a fabric swatch does not have.
    //
    // Bound on document, so it also covers nodes moved between panels after
    // load. It does inherit this function's early return — no gallery on the
    // page means no lightbox markup either, so there is nothing to open.
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-zoom-open]');
      if (!trigger) return;
      e.preventDefault();
      open(trigger, true);
    });

    // Release the zoom rather than let a magnified frame snap past.
    gallery.addEventListener('pointerleave', zoomOut);
    if (main) main.addEventListener('scroll', zoomOut, { passive: true });

    // Lightbox-internal zoom. It must not touch the gallery's cursor chip \u2014
    // that belongs to the in-place zoom now, and a hybrid device using the
    // lightbox would otherwise be left showing a stale minus over the gallery.
    const setZoomed = (on) => {
      zoom.classList.toggle('is-zoomed', on);
      if (on && stage) {
        // Centre the pan on the point that was zoomed into
        stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
        stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
      }
    };

    const zin = zoom.querySelector('[data-zoom-in]');
    const zout = zoom.querySelector('[data-zoom-out]');
    if (zin) zin.addEventListener('click', () => setZoomed(true));
    if (zout) zout.addEventListener('click', () => setZoomed(false));
    if (stage) stage.addEventListener('click', (e) => {
      if (e.target === img) { setZoomed(!zoom.classList.contains('is-zoomed')); return; }
      // Everything around the image is scrim in inset mode, and a scrim you can
      // see the page through reads as dismissable — so it is. The full-bleed
      // viewer has no "outside" to click, which is why this is scoped.
      if (zoom.classList.contains('pdp-zoom--inset')) close();
    });

    zoom.querySelectorAll('[data-zoom-close]').forEach(b => b.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (zoom.classList.contains('is-active')) close();
      zoomOut();
    });
  };

  /* --- PDP Gallery (swipe/scroll + progress bar) --- */
  const initPdpGallery = () => {
    const gallery = document.querySelector('[data-product-gallery]');
    if (!gallery) return;
    const main = gallery.querySelector('[data-gallery-main]');
    const slides = gallery.querySelectorAll('[data-gallery-slide]');
    const fill = gallery.querySelector('[data-gallery-progress]');
    if (!main || !slides.length) return;

    let current = 0;
    const total = slides.length;

    // Desktop stacks the images and scrolls vertically; mobile swipes horizontally.
    const isVertical = () => window.matchMedia('(min-width: 769px)').matches;

    // One bar, two orientations. The CSS swaps which axis is 2px and where the
    // fill is anchored; this has to swap the matching axis or the bar sits at 0
    // forever — scaleX on a 2px-wide track changes nothing visible.
    const setFill = (frac) => {
      if (!fill) return;
      const clamped = Math.min(1, Math.max(0, frac));
      fill.style.transform = (isVertical() ? 'scaleY(' : 'scaleX(') + clamped + ')';
    };

    const syncUI = (idx) => setFill((idx + 1) / total);

    const goTo = (idx) => {
      current = Math.max(0, Math.min(total - 1, idx));
      main.scrollTo(
        isVertical()
          ? { top: main.offsetHeight * current, behavior: 'smooth' }
          : { left: main.offsetWidth * current, behavior: 'smooth' }
      );
      syncUI(current);
    };

    // The bar tracks the gesture continuously, so it gets its own undebounced
    // listener rather than waiting on the 100ms settle below.
    if (fill) {
      main.addEventListener('scroll', () => {
        setFill(isVertical()
          ? (main.scrollTop + main.offsetHeight) / main.scrollHeight
          : (main.scrollLeft + main.offsetWidth) / main.scrollWidth);
      }, { passive: true });
    }

    // Crossing the breakpoint leaves the fill scaled on the wrong axis, which
    // reads as a bar stuck empty. Re-assert it against the new orientation.
    window.matchMedia('(min-width: 769px)').addEventListener('change', () => syncUI(current));

    // Reflect position 1 of n at load rather than an empty bar.
    syncUI(0);

    // Track the settled index. The continuous handler above already paints the
    // bar mid-gesture; this is what keeps `current` honest for goTo and for the
    // breakpoint change, and snaps the fill onto an exact 1/n at rest.
    let scrollTimeout;
    main.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const idx = isVertical()
          ? Math.round(main.scrollTop / main.offsetHeight)
          : Math.round(main.scrollLeft / main.offsetWidth);
        if (idx !== current) {
          current = idx;
          syncUI(current);
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

  /* --- SmartSize: park the injected size links in the Sizing tab ---
     SIZE GUIDE and FIND MY SIZE come from SmartSize APP EMBEDS, not from the
     section's app block. An embed is injected and positioned by the app's own
     JS, so Liquid cannot place it — moving the {% render block %} slot moved
     the block and left the embeds where they were. They are reparented here
     instead, once they exist, into the Sizing panel where the fit information
     belongs. The section app block already renders into .pdp__size-guide-slot
     inside that panel and needs no move.

     Buttons only. The app also appends its size-chart modal to <body>; that has
     to stay there, because a modal inside a display:none panel cannot open.

     Each node is moved once and stamped. If the app relocates one back we let
     it be rather than trading moves with it for the life of the page. */
  const initSmartSizePlacement = () => {
    const panel = document.querySelector('[data-tab-panel="sizing"]');
    if (!panel) return;

    // Both buttons arrive inside one wrapper the app injects into
    // .pdp__details-inner, so this is a single move, not a hunt:
    //   #smartrecom-triggers
    //     #smartrecom-sizechart-injected-button > #smartrecom-sizechart-trigger  SIZE GUIDE
    //     #smartrecom-inline-button-injected    > #smartrecom-button             FIND MY SIZE
    // The app's size-chart modal is appended to <body> separately and is left
    // there — a modal inside a display:none panel could not open.
    let moves = 0;

    const park = () => {
      const triggers = document.getElementById('smartrecom-triggers');
      if (!triggers || panel.contains(triggers)) return;
      // If the app insists on putting it back, let it have the last word rather
      // than trading moves for the life of the page.
      if (moves >= 5) return;
      moves += 1;
      // prepend, not appendChild: the buttons lead the panel and the sizing
      // copy sits under them. Someone opening Sizing is picking a size, not
      // reading.
      panel.prepend(triggers);
    };

    park();
    // The wrapper lands after this file runs, so watch for it.
    const mo = new MutationObserver(park);
    mo.observe(document.body, { childList: true, subtree: true });
    // Not left running for the life of the page — it is in within seconds or
    // it is not coming.
    setTimeout(() => mo.disconnect(), 15000);
  };

  /* --- Initialize Everything (each isolated so one failure can't break others) --- */
  const init = () => {
    [
      initReveal, initMobileMenu, initChrome, initAnnouncement, initStickyHeader,
      initCarousels, initVariantSelectors, initQuantitySelectors, initAccordions,
      initModals, initCartDrawer, initProductGallery, initFilters, initAddToCart,
      initWishlist, initWishlistDrawer, initSearchDrawer, initPdpTabs, initPdpGallery,
      initPdpMobileBand, initPdpVariants, initDeliveryEstimator, initContentPanels, initPdpRows, initPdpZoom, initPdpStickyBand, initKlaviyoBisSkin, initSmartSizePlacement, initShopPromise, initReturnsByCountry, initOverlayContrast,
      initFooterAccordions, initNewsletterForms, initLocalization,
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
