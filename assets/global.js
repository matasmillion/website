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
  const ZIP_KEY = 'fr_delivery_zip';

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

  // Orders placed after the cutoff, or at a weekend, dispatch the next business day.
  const dispatchStart = (cutoffHour) => {
    const now = new Date();
    let start = new Date(now.getTime());
    const day = start.getDay();
    if (now.getHours() >= cutoffHour || day === 0 || day === 6) {
      start = addBusinessDays(start, 1);
    }
    return start;
  };

  const fmtDate = (d) =>
    d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  // Arrival windows drop the weekday — two of them side by side with the tier
  // label is already a lot of characters for a 390px viewport.
  const fmtShort = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const fmtWindow = (from, lo, hi) => {
    const a = addBusinessDays(from, lo);
    const b = addBusinessDays(from, hi);
    // A one-day window would otherwise read "Aug 5 – Aug 5".
    return a.getTime() === b.getTime() ? fmtShort(a) : fmtShort(a) + ' – ' + fmtShort(b);
  };

  const validZip = (zip, country) =>
    country === 'US' ? /^\d{5}(-\d{4})?$/.test(zip) : /^[A-Za-z0-9 -]{3,10}$/.test(zip);

  const initDeliveryEstimator = () => {
    const root = document.querySelector('[data-delivery-estimator]');
    const urgency = document.querySelector('[data-delivery-urgency]');
    if (!root && !urgency) return;

    const cfg = root ? root.dataset : {};
    const cutoff = parseInt(cfg.cutoffHour, 10) || 14;
    const country = cfg.country || 'US';
    const start = dispatchStart(cutoff);

    // Rolling urgency renders immediately — it needs no zip.
    if (urgency) {
      const by = addBusinessDays(start, parseInt(cfg.standardMax, 10) || 5);
      const now = new Date();
      const text = urgency.querySelector('[data-urgency-text]');
      if (text) {
        if (now.getHours() < cutoff) {
          const hrs = cutoff - now.getHours() - 1;
          const mins = 60 - now.getMinutes();
          const within = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
          text.textContent = `Order within ${within} to receive by ${fmtDate(by)}`;
        } else {
          text.textContent = `Order today to receive by ${fmtDate(by)}`;
        }
        urgency.hidden = false;
      }
    }

    if (!root) return;

    const input = root.querySelector('[data-dest-zip]');
    const apply = root.querySelector('[data-dest-apply]');
    const results = root.querySelector('[data-dest-results]');
    const error = root.querySelector('[data-dest-error]');
    const stdOut = root.querySelector('[data-dest-standard]');
    const expOut = root.querySelector('[data-dest-express]');

    const render = (zip) => {
      if (!validZip(zip, country)) {
        results.hidden = true;
        error.hidden = false;
        return;
      }
      error.hidden = true;
      // Guarded: the snippet has shipped both a one-line and a two-tier shape.
      if (stdOut) {
        stdOut.textContent = fmtWindow(
          start,
          parseInt(cfg.standardMin, 10) || 3,
          parseInt(cfg.standardMax, 10) || 5
        );
      }
      if (expOut) {
        expOut.textContent = fmtWindow(
          start,
          parseInt(cfg.expressMin, 10) || 1,
          parseInt(cfg.expressMax, 10) || 2
        );
      }
      results.hidden = false;
      try { localStorage.setItem(ZIP_KEY, zip); } catch (e) {}
    };

    if (apply) apply.addEventListener('click', () => render(input.value.trim()));
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); render(input.value.trim()); }
      });
      // Remembered zip resolves on load, so returning visitors see dates straight away.
      try {
        const saved = localStorage.getItem(ZIP_KEY);
        if (saved) { input.value = saved; render(saved); }
      } catch (e) {}
    }
  };

  /* --- Foreign Engineering: pick salt or slate per card from the image --- */
  const initFreContrast = () => {
    const cards = document.querySelectorAll('.fre__card');
    if (!cards.length) return;

    // Sample the corner the copy sits over and measure its luminance, so the
    // text flips to slate on pale imagery and stays salt on dark.
    const measure = (card) => {
      const img = card.querySelector('.fre__img');
      if (!img) return;

      const sample = () => {
        try {
          const c = document.createElement('canvas');
          const w = 24, h = 24;
          c.width = w; c.height = h;
          const ctx = c.getContext('2d');
          // Bottom-left region — where the title and subtitle sit
          const sx = 0;
          const sy = Math.max(0, img.naturalHeight - img.naturalHeight * 0.3);
          ctx.drawImage(img, sx, sy, img.naturalWidth * 0.5, img.naturalHeight * 0.3, 0, 0, w, h);
          const d = ctx.getImageData(0, 0, w, h).data;
          let sum = 0;
          for (let i = 0; i < d.length; i += 4) {
            sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          }
          const avg = sum / (d.length / 4);
          card.classList.toggle('is-light-bg', avg > 140);
        } catch (e) {
          // Tainted canvas or a blocked image: keep the salt default
        }
      };

      img.crossOrigin = 'anonymous';
      if (img.complete && img.naturalWidth) sample();
      else img.addEventListener('load', sample, { once: true });
    };

    cards.forEach(measure);
  };

  /* --- Klaviyo back-in-stock: tag whatever it injects so CSS can reach it --- */
  const initKlaviyoBisSkin = () => {
    const pdp = document.querySelector('[data-pdp]');
    if (!pdp) return;

    const band = document.querySelector('[data-sticky-band]');

    const tag = () => {
      pdp.querySelectorAll('button, a, input[type="button"], input[type="submit"]').forEach((el) => {
        if (el.closest('[data-sticky-band]')) return;
        const cls = (el.getAttribute('class') || '') + ' ' + (el.id || '');
        const txt = (el.textContent || el.value || '').trim().toLowerCase();
        const isBis = /klaviyo[-_]?bis|bis[-_]?trigger|back[-_]?in[-_]?stock/i.test(cls) ||
                      /^notify me/.test(txt);
        if (!isBis) return;
        el.classList.add('fr-bis');
        // Belongs with the buy controls, directly under the sold-out bar —
        // not stranded below the size selector where Klaviyo drops it.
        if (band && el.parentElement !== band) band.appendChild(el);
      });
    };

    tag();
    // Klaviyo injects late and can re-render, so keep watching the PDP subtree.
    new MutationObserver(tag).observe(pdp, { childList: true, subtree: true });
  };

  /* --- PDP sticky band (mobile): hide once past Foreign Engineering --- */
  const initPdpStickyBand = () => {
    const band = document.querySelector('[data-sticky-band]');
    if (!band) return;

    // FOREIGN ENGINEERING is full-bleed imagery and the band must never sit on
    // top of it. A fixed element cannot both cross that section and stay clear
    // of it, so the band retires the moment the section reaches the viewport
    // and returns if you scroll back up into the product details.
    const boundary =
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

  /* --- PDP zoom lightbox + cursor-following affordance --- */
  const initPdpZoom = () => {
    const gallery = document.querySelector('[data-product-gallery]');
    const zoom = document.querySelector('[data-pdp-zoom]');
    if (!gallery || !zoom) return;

    const img = zoom.querySelector('[data-zoom-img]');
    const stage = zoom.querySelector('[data-zoom-stage]');
    const cursor = gallery.querySelector('[data-zoom-cursor]');

    // Cursor-following +/- over the gallery (desktop, fine pointers only)
    if (cursor && window.matchMedia('(min-width: 769px) and (pointer: fine)').matches) {
      gallery.addEventListener('pointermove', (e) => {
        const r = gallery.getBoundingClientRect();
        cursor.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px)';
      }, { passive: true });
    }

    const open = (slide) => {
      if (!slide || !img) return;
      img.src = slide.dataset.zoomSrc || '';
      img.alt = slide.dataset.zoomAlt || '';
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
      open(slide);
    });

    const setZoomed = (on) => {
      zoom.classList.toggle('is-zoomed', on);
      if (cursor) cursor.textContent = on ? '\u2212' : '+';
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
      if (e.target === img) setZoomed(!zoom.classList.contains('is-zoomed'));
    });

    zoom.querySelectorAll('[data-zoom-close]').forEach(b => b.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && zoom.classList.contains('is-active')) close();
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
    const fill = gallery.querySelector('[data-gallery-progress]');
    if (!main || !slides.length) return;

    let current = 0;
    const total = slides.length;

    // Desktop stacks the images and scrolls vertically; mobile swipes horizontally.
    const isVertical = () => window.matchMedia('(min-width: 769px)').matches;

    // Desktop shows discrete dots, mobile a continuous bar. Both are updated
    // unconditionally — writing to a display:none node costs nothing.
    const syncUI = (idx) => {
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
      if (fill) fill.style.transform = 'scaleX(' + ((idx + 1) / total) + ')';
    };

    const goTo = (idx) => {
      current = Math.max(0, Math.min(total - 1, idx));
      main.scrollTo(
        isVertical()
          ? { top: main.offsetHeight * current, behavior: 'smooth' }
          : { left: main.offsetWidth * current, behavior: 'smooth' }
      );
      syncUI(current);
    };

    dots.forEach(dot => dot.addEventListener('click', () => goTo(parseInt(dot.dataset.galleryDot))));
    if (prev) prev.addEventListener('click', () => goTo(current - 1));
    if (next) next.addEventListener('click', () => goTo(current + 1));

    // The bar tracks the swipe continuously, so it gets its own undebounced
    // listener rather than waiting on the 100ms dot settle.
    if (fill) {
      main.addEventListener('scroll', () => {
        if (isVertical()) return;
        const frac = (main.scrollLeft + main.offsetWidth) / main.scrollWidth;
        fill.style.transform = 'scaleX(' + Math.min(1, Math.max(0, frac)) + ')';
      }, { passive: true });
    }

    // Reflect position 1 of n at load rather than an empty bar.
    syncUI(0);

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

  /* --- Initialize Everything (each isolated so one failure can't break others) --- */
  const init = () => {
    [
      initReveal, initMobileMenu, initChrome, initAnnouncement, initStickyHeader,
      initCarousels, initVariantSelectors, initQuantitySelectors, initAccordions,
      initModals, initCartDrawer, initProductGallery, initFilters, initAddToCart,
      initWishlist, initWishlistDrawer, initSearchDrawer, initPdpTabs, initPdpGallery,
      initPdpMobileBand, initPdpVariants, initDeliveryEstimator, initContentPanels, initPdpRows, initPdpZoom, initPdpStickyBand, initKlaviyoBisSkin, initFreContrast,
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
