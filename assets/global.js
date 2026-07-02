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
  };

  /* --- Header Scroll Behavior --- */
  const initStickyHeader = () => {
    const header = document.querySelector('[data-header]');
    if (!header || !header.dataset.sticky) return;
    let lastScroll = 0;
    const onScroll = () => {
      const current = window.scrollY;
      header.classList.toggle('is-scrolled', current > 50);
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

  /* --- Product Variant Selector --- */
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

          const variantId = btn.dataset.variantOption;
          const form = btn.closest('form');
          if (form) {
            const input = form.querySelector('input[name="id"]');
            if (input) input.value = variantId;
          }

          const event = new CustomEvent('variant:change', {
            detail: { variantId, button: btn },
            bubbles: true
          });
          container.dispatchEvent(event);
        });
      });
    });
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

    document.querySelectorAll('[data-cart-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        drawer.classList.toggle('is-active');
        document.body.style.overflow = drawer.classList.contains('is-active') ? 'hidden' : '';
      });
    });

    const closeBtn = drawer.querySelector('[data-cart-drawer-close]');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      drawer.classList.remove('is-active');
      document.body.style.overflow = '';
    });
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

        // Update only the text label so icon/price markup is preserved
        const label = btn.querySelector('.pdp__add-text') || btn;
        const original = label.textContent;
        const setLabel = (txt) => { label.textContent = txt; };

        btn.disabled = true;
        setLabel('Adding...');

        try {
          const formData = new FormData(form);
          const res = await fetch('/cart/add.js', {
            method: 'POST',
            body: formData
          });

          if (res.ok) {
            setLabel('Added');
            // Update cart count
            const cartRes = await fetch('/cart.js');
            const cart = await cartRes.json();
            document.querySelectorAll('[data-cart-count]').forEach(el => {
              el.textContent = cart.item_count;
              el.style.display = cart.item_count > 0 ? '' : 'none';
            });
            // Open cart drawer if present
            const drawer = document.querySelector('[data-cart-drawer]');
            if (drawer) {
              drawer.classList.add('is-active');
              document.body.style.overflow = 'hidden';
            }
          } else {
            const data = await res.json();
            setLabel(data.description || 'Error');
          }
        } catch (err) {
          setLabel('Error');
        }

        setTimeout(() => {
          setLabel(original);
          btn.disabled = false;
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

  /* --- PDP Tabs --- */
  const initPdpTabs = () => {
    document.querySelectorAll('[data-pdp-tabs]').forEach(container => {
      const tabs = container.querySelectorAll('[data-tab]');
      const panels = container.querySelectorAll('[data-tab-panel]');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
          panels.forEach(p => p.classList.remove('is-active'));
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
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

    const goTo = (idx) => {
      current = Math.max(0, Math.min(total - 1, idx));
      main.scrollTo({ left: main.offsetWidth * current, behavior: 'smooth' });
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
        const idx = Math.round(main.scrollLeft / main.offsetWidth);
        if (idx !== current) {
          current = idx;
          dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
        }
      }, 100);
    }, { passive: true });
  };

  /* --- Footer accordions (newsletter + menu columns) --- */
  const initFooterAccordions = () => {
    document.querySelectorAll('.footer__accordion-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const content = trigger.nextElementSibling;
        if (!content) return;
        const open = content.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  };

  /* --- Newsletter -> Klaviyo profile properties --- */
  const initNewsletterForms = () => {
    const sendToKlaviyo = (props) => {
      if (!props || !props['$email']) return;
      try {
        window.klaviyo = window.klaviyo || [];
        window.klaviyo.push(['identify', props]);
      } catch (e) {}
      try {
        window._learnq = window._learnq || [];
        window._learnq.push(['identify', props]);
      } catch (e) {}
    };

    document.querySelectorAll('[data-nl-form]').forEach((wrap) => {
      const form = wrap.closest('form');
      if (!form) return;
      form.addEventListener('submit', (e) => {
        if (form.dataset.nlSent) return;
        const getVal = (sel) => {
          const el = form.querySelector(sel);
          return el ? el.value.trim() : '';
        };
        const em = getVal('[name="contact[email]"]');
        if (!em) return;
        const props = { '$email': em };
        const fn = getVal('[name="contact[first_name]"]');
        if (fn) props['$first_name'] = fn;
        const ln = getVal('[name="contact[last_name]"]');
        if (ln) props['$last_name'] = ln;
        const gender = form.querySelector('[name="nl_gender"]:checked');
        if (gender && gender.value) props['Title'] = gender.value;
        const bday = getVal('[data-birthday]');
        if (bday) props['Birthday'] = bday;

        // Send to Klaviyo, then let the native form submit.
        e.preventDefault();
        form.dataset.nlSent = '1';
        sendToKlaviyo(props);
        setTimeout(() => form.submit(), 400);
      });
    });
  };

  /* --- PDP Mobile Band ATC button --- */
  const initPdpMobileBand = () => {
    const mobileBtn = document.querySelector('[data-mobile-submit]');
    const form = document.querySelector('[data-add-to-cart]');
    if (!mobileBtn || !form) return;
    mobileBtn.addEventListener('click', () => form.requestSubmit());
  };

  /* --- Initialize Everything --- */
  const init = () => {
    initReveal();
    initMobileMenu();
    initStickyHeader();
    initCarousels();
    initVariantSelectors();
    initQuantitySelectors();
    initAccordions();
    initModals();
    initCartDrawer();
    initProductGallery();
    initFilters();
    initAddToCart();
    initWishlist();
    initWishlistDrawer();
    initPdpTabs();
    initPdpGallery();
    initPdpMobileBand();
    initFooterAccordions();
    initNewsletterForms();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
