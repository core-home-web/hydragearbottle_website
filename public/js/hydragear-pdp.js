/*!
 * Hydragear product detail pop-up + bottle-matched background colours
 * Needs js/hydragear-products.js (catalog) loaded first. Optional:
 * js/hydragear-enhance.js (analytics helper and Lenis smooth scroll).
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var catalog = window.HYDRAGEAR_PRODUCTS || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function asinFromUrl(url) {
    var m = /\/dp\/([A-Z0-9]{10})/i.exec(url || '');
    return m ? m[1].toUpperCase() : null;
  }

  function track(name, params) {
    if (typeof window.hydragearTrack === 'function') return window.hydragearTrack(name, params);
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  }

  function money(n) {
    return typeof n === 'number' ? '$' + n.toFixed(2) : '';
  }

  /* ------------------------------------------------------------------------
   * Collect products from the cards on the page
   * --------------------------------------------------------------------- */

  var items = [];
  doc.querySelectorAll('.product-card').forEach(function (card) {
    var btn = card.querySelector('a.product-shop-btn');
    if (!btn) return;
    var asin = asinFromUrl(btn.href);
    var data = asin && catalog[asin];
    if (!data) return;
    var cardImg = card.querySelector('.product-image');
    var priceText = card.querySelector('.price');
    items.push({
      asin: asin,
      card: card,
      btn: btn,
      url: 'https://www.amazon.com/dp/' + asin,
      data: data,
      // The price shown on the card is the source of truth on the page
      price: priceText ? parseFloat(priceText.textContent.replace(/[^0-9.]/g, '')) || data.price : data.price,
      cover: cardImg ? (cardImg.currentSrc || cardImg.src) : null
    });
  });

  if (!items.length) return;

  function gaItem(it, listName) {
    return {
      item_id: it.asin,
      item_name: it.data.name,
      item_brand: 'Hydragear',
      affiliation: 'Amazon',
      item_list_name: listName,
      price: it.price,
      quantity: 1
    };
  }

  /* ------------------------------------------------------------------------
   * Bottle-matched background colours
   * Overrides the Webflow hover interaction, which only changed the base
   * colour (and had the Chugger and Breaker colours swapped).
   * --------------------------------------------------------------------- */

  var gradients = Array.prototype.slice.call(doc.querySelectorAll('.section-hero-gradient.background'));
  var currentTint = null;
  var untintTimer = null;

  gradients.forEach(function (g) { g.classList.add('hg-tintable'); });

  function tint(it) {
    clearTimeout(untintTimer);
    if (!it || currentTint === it.asin) return;
    currentTint = it.asin;
    var c = it.data.colors;
    root.style.setProperty('--hg-tint-base', c.base);
    root.style.setProperty('--hg-tint-deep', c.deep);
    root.style.setProperty('--hg-tint-accent', c.accent);
    root.style.setProperty('--hg-tint-glow', c.glow);
    root.classList.add('hg-tint-on');
    items.forEach(function (x) { x.card.classList.toggle('hg-tinted', x === it); });
  }

  function untint(delay) {
    clearTimeout(untintTimer);
    untintTimer = setTimeout(function () {
      if (modalOpen) return;
      currentTint = null;
      root.classList.remove('hg-tint-on');
      items.forEach(function (x) { x.card.classList.remove('hg-tinted'); });
    }, delay || 0);
  }

  items.forEach(function (it) {
    // Hover (desktop) and keyboard focus
    it.card.addEventListener('mouseenter', function () { if (canHover) tint(it); });
    it.card.addEventListener('mouseleave', function () { if (canHover) untint(260); });
    it.card.addEventListener('focusin', function () { tint(it); });
    it.card.addEventListener('focusout', function (e) {
      if (!it.card.contains(e.relatedTarget)) untint(260);
    });
  });

  // Touch screens: the bottle crossing the middle of the screen is "in focus"
  if (!canHover && 'IntersectionObserver' in window) {
    var inBand = [];
    var bandObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var it = items.filter(function (x) { return x.card === entry.target; })[0];
        if (!it) return;
        var i = inBand.indexOf(it);
        if (entry.isIntersecting && i === -1) inBand.push(it);
        if (!entry.isIntersecting && i !== -1) inBand.splice(i, 1);
      });
      if (inBand.length) {
        // When two cards in a row share the band, prefer the most recent one
        tint(inBand[inBand.length - 1]);
      } else {
        untint(400);
      }
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
    items.forEach(function (it) { bandObserver.observe(it.card); });
  }

  /* ------------------------------------------------------------------------
   * Product detail pop-up
   * --------------------------------------------------------------------- */

  var modalOpen = false;
  var current = -1;
  var lastTrigger = null;
  var pushedState = false;

  var modal = doc.createElement('div');
  modal.className = 'hg-pdp';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'hg-pdp-title');
  modal.hidden = true;
  modal.innerHTML =
    '<div class="hg-pdp-backdrop" data-hg-close></div>' +
    '<div class="hg-pdp-panel" tabindex="-1" data-lenis-prevent>' +
      '<div class="hg-pdp-grab" aria-hidden="true"><span></span></div>' +
      '<button type="button" class="hg-pdp-close" aria-label="Close product details" data-hg-close>' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="hg-pdp-media">' +
        '<div class="hg-pdp-stage"><img class="hg-pdp-img" alt="" decoding="async"></div>' +
        '<div class="hg-pdp-thumbs" role="list"></div>' +
      '</div>' +
      '<div class="hg-pdp-info">' +
        '<p class="hg-pdp-eyebrow">Hydragear</p>' +
        '<h2 id="hg-pdp-title" class="hg-pdp-title"></h2>' +
        '<div class="hg-pdp-price"></div>' +
        '<ul class="hg-pdp-tags" aria-label="Highlights"></ul>' +
        '<p class="hg-pdp-desc"></p>' +
        '<div class="hg-pdp-details">' +
          '<h3 class="hg-pdp-subtitle">About this item</h3>' +
          '<ul class="hg-pdp-bullets"></ul>' +
        '</div>' +
        '<div class="hg-pdp-cta">' +
          '<a class="hg-pdp-shop" target="_blank" rel="noopener">Shop on Amazon</a>' +
          '<p class="hg-pdp-note">Opens the Amazon listing in a new tab</p>' +
        '</div>' +
        '<div class="hg-pdp-nav">' +
          '<button type="button" class="hg-pdp-prev" aria-label="Previous bottle">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
          '<span class="hg-pdp-count" aria-live="polite"></span>' +
          '<button type="button" class="hg-pdp-next" aria-label="Next bottle">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  doc.body.appendChild(modal);

  var el = {
    panel: modal.querySelector('.hg-pdp-panel'),
    img: modal.querySelector('.hg-pdp-img'),
    stage: modal.querySelector('.hg-pdp-stage'),
    thumbs: modal.querySelector('.hg-pdp-thumbs'),
    title: modal.querySelector('.hg-pdp-title'),
    price: modal.querySelector('.hg-pdp-price'),
    tags: modal.querySelector('.hg-pdp-tags'),
    desc: modal.querySelector('.hg-pdp-desc'),
    details: modal.querySelector('.hg-pdp-details'),
    bullets: modal.querySelector('.hg-pdp-bullets'),
    shop: modal.querySelector('.hg-pdp-shop'),
    count: modal.querySelector('.hg-pdp-count'),
    prev: modal.querySelector('.hg-pdp-prev'),
    next: modal.querySelector('.hg-pdp-next'),
    grab: modal.querySelector('.hg-pdp-grab'),
    media: modal.querySelector('.hg-pdp-media')
  };

  function galleryFor(it) {
    var list = (it.data.gallery || []).slice();
    if (!list.length && it.cover) list.push(it.cover);
    return list;
  }

  function showImage(src, alt) {
    if (el.img.getAttribute('src') === src) return;
    el.stage.classList.add('hg-swapping');
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      el.img.src = src;
      el.img.alt = alt;
      requestAnimationFrame(function () { el.stage.classList.remove('hg-swapping'); });
    };
    pre.src = src;
  }

  function render(i, direction) {
    var it = items[i];
    var d = it.data;
    var c = d.colors;
    current = i;

    modal.style.setProperty('--pdp-base', c.base);
    modal.style.setProperty('--pdp-deep', c.deep);
    modal.style.setProperty('--pdp-accent', c.accent);
    modal.style.setProperty('--pdp-glow', c.glow);

    if (direction) {
      el.panel.classList.remove('hg-from-left', 'hg-from-right');
      void el.panel.offsetWidth;
      el.panel.classList.add(direction > 0 ? 'hg-from-right' : 'hg-from-left');
    }

    var gallery = galleryFor(it);
    showImage(gallery[0], d.name);
    el.thumbs.innerHTML = '';
    if (gallery.length > 1) {
      gallery.forEach(function (src, gi) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'hg-pdp-thumb' + (gi === 0 ? ' is-active' : '');
        b.setAttribute('role', 'listitem');
        b.setAttribute('aria-label', d.name + ' photo ' + (gi + 1) + ' of ' + gallery.length);
        b.innerHTML = '<img src="' + src + '" alt="" decoding="async">';
        b.addEventListener('click', function () {
          el.thumbs.querySelectorAll('.hg-pdp-thumb').forEach(function (t) { t.classList.remove('is-active'); });
          b.classList.add('is-active');
          showImage(src, d.name);
        });
        el.thumbs.appendChild(b);
      });
    }

    el.title.textContent = d.name;
    el.price.textContent = money(it.price);

    el.tags.innerHTML = '';
    (d.highlights || []).forEach(function (h) {
      var li = doc.createElement('li');
      li.textContent = h;
      el.tags.appendChild(li);
    });

    el.desc.textContent = d.description || '';
    el.desc.hidden = !d.description;

    el.bullets.innerHTML = '';
    (d.amazonBullets || []).forEach(function (b) {
      var li = doc.createElement('li');
      li.textContent = b;
      el.bullets.appendChild(li);
    });
    el.details.hidden = !(d.amazonBullets && d.amazonBullets.length);

    el.shop.href = it.url;
    el.shop.setAttribute('data-asin', it.asin);
    el.shop.setAttribute('aria-label', 'Shop ' + d.name + ' on Amazon (opens in a new tab)');

    el.count.textContent = (i + 1) + ' / ' + items.length;
    el.prev.hidden = el.next.hidden = items.length < 2;

    el.panel.scrollTop = 0;
    tint(it);

    track('view_item', {
      currency: 'USD',
      value: it.price,
      items: [gaItem(it, 'Product Detail Popup')]
    });
  }

  function lockScroll(lock) {
    var lenis = window.hydragearLenis;
    if (lenis) { lock ? lenis.stop() : lenis.start(); }
    root.classList.toggle('hg-pdp-open', lock);
  }

  function open(i, trigger, fromHistory) {
    if (i < 0 || i >= items.length) return;
    lastTrigger = trigger || doc.activeElement;
    if (!modalOpen) {
      modalOpen = true;
      modal.hidden = false;
      lockScroll(true);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { modal.classList.add('is-open'); });
      });
    }
    render(i);
    if (!fromHistory && history.pushState) {
      var hash = '#' + items[i].data.slug;
      if (pushedState) {
        history.replaceState({ hgPdp: items[i].asin }, '', hash);
      } else {
        history.pushState({ hgPdp: items[i].asin }, '', hash);
        pushedState = true;
      }
    }
    setTimeout(function () { el.panel.focus({ preventScroll: true }); }, 30);
  }

  function close(fromHistory) {
    if (!modalOpen) return;
    modalOpen = false;
    modal.classList.remove('is-open');
    el.panel.style.transform = '';
    lockScroll(false);
    var done = function () {
      if (!modalOpen) modal.hidden = true;
    };
    if (reduceMotion) done(); else setTimeout(done, 420);
    if (canHover) untint(0);
    if (!fromHistory && pushedState) {
      pushedState = false;
      history.back();
    } else if (fromHistory) {
      pushedState = false;
    } else if (history.replaceState && location.hash) {
      // Opened from a deep link: drop the product hash without a reload
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (lastTrigger && lastTrigger.focus) {
      lastTrigger.focus({ preventScroll: true });
    }
  }

  function step(dir) {
    var n = (current + dir + items.length) % items.length;
    render(n, dir);
    if (pushedState && history.replaceState) {
      history.replaceState({ hgPdp: items[n].asin }, '', '#' + items[n].data.slug);
    }
  }

  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-hg-close]')) close();
  });
  el.prev.addEventListener('click', function () { step(-1); });
  el.next.addEventListener('click', function () { step(1); });

  el.shop.addEventListener('click', function () {
    var it = items[current];
    track('select_item', {
      item_list_name: 'Product Detail Popup',
      items: [gaItem(it, 'Product Detail Popup')]
    });
  });

  doc.addEventListener('keydown', function (e) {
    if (!modalOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowRight' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { step(1); return; }
    if (e.key === 'ArrowLeft' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { step(-1); return; }
    if (e.key === 'Tab') {
      // Keep keyboard focus inside the dialog
      var f = Array.prototype.filter.call(
        el.panel.querySelectorAll('a[href], button:not([hidden])'),
        function (n) { return n.offsetParent !== null; }
      );
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && (doc.activeElement === first || doc.activeElement === el.panel)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  // Swipe down to dismiss the mobile bottom sheet; swipe sideways for next/prev
  (function () {
    var sx = 0, sy = 0, dy = 0, dx = 0, dragging = false, axis = null;
    function start(e) {
      if (!modalOpen || e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
      dx = dy = 0; axis = null;
      dragging = e.target.closest('.hg-pdp-grab, .hg-pdp-media') !== null || el.panel.scrollTop <= 0;
    }
    function move(e) {
      if (!dragging) return;
      dx = e.touches[0].clientX - sx;
      dy = e.touches[0].clientY - sy;
      if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'x' && !e.target.closest('.hg-pdp-media')) dragging = false;
      }
      if (axis === 'y' && dy > 0 && el.panel.scrollTop <= 0) {
        el.panel.style.transition = 'none';
        el.panel.style.transform = 'translateY(' + dy + 'px)';
        e.preventDefault();
      }
    }
    function end() {
      if (!dragging) return;
      dragging = false;
      el.panel.style.transition = '';
      if (axis === 'y' && dy > 110) {
        close();
      } else {
        el.panel.style.transform = '';
        if (axis === 'x' && Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
      }
    }
    el.panel.addEventListener('touchstart', start, { passive: true });
    el.panel.addEventListener('touchmove', move, { passive: false });
    el.panel.addEventListener('touchend', end);
    el.panel.addEventListener('touchcancel', end);
  })();

  window.addEventListener('popstate', function (e) {
    var asin = e.state && e.state.hgPdp;
    var idx = -1;
    items.forEach(function (it, i) { if (it.asin === asin) idx = i; });
    if (idx > -1) {
      pushedState = true;
      open(idx, null, true);
    } else if (modalOpen) {
      close(true);
    }
  });

  /* ------------------------------------------------------------------------
   * Triggers: whole card, a "Learn more" button on each card
   * --------------------------------------------------------------------- */

  items.forEach(function (it, i) {
    it.card.classList.add('hg-has-pdp');

    var wrap = it.card.querySelector('.prosuct-detail-wrapper') || it.card.querySelector('.product-detail-vertical-flex');
    var learn = doc.createElement('button');
    learn.type = 'button';
    learn.className = 'hg-learn-more';
    learn.textContent = 'Learn more';
    learn.setAttribute('aria-haspopup', 'dialog');
    learn.setAttribute('aria-label', 'Learn more about the ' + it.data.name);
    if (wrap) wrap.appendChild(learn);

    it.card.addEventListener('click', function (e) {
      // Shop Now still goes straight to Amazon
      if (e.target.closest('a.product-shop-btn')) return;
      e.preventDefault();
      open(i, e.target.closest('button') || learn);
    });

    // Warm the gallery images on hover/touch so the pop-up opens instantly
    var warmed = false;
    function warm() {
      if (warmed) return;
      warmed = true;
      galleryFor(it).forEach(function (src) { var im = new Image(); im.src = src; });
    }
    it.card.addEventListener('pointerenter', warm, { passive: true });
    it.card.addEventListener('touchstart', warm, { passive: true });
  });

  // Deep links: index.html#juno-tumbler opens that bottle
  function openFromHash() {
    var slug = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!slug) return;
    items.forEach(function (it, i) {
      if (it.data.slug === slug) {
        if (history.replaceState) history.replaceState({ hgPdp: it.asin }, '', location.hash);
        pushedState = false;
        open(i, null, true);
      }
    });
  }
  window.addEventListener('hashchange', function () {
    if (!modalOpen) openFromHash();
  });
  if (doc.readyState === 'complete') {
    setTimeout(openFromHash, 300);
  } else {
    window.addEventListener('load', function () { setTimeout(openFromHash, 300); });
  }

  window.hydragearPDP = { open: function (asin) {
    items.forEach(function (it, i) { if (it.asin === asin) open(i); });
  }, close: close };
})();
