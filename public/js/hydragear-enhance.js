/*!
 * Hydragear enhancement layer
 * Smooth scrolling, page transitions, scroll reveals, shopping polish and
 * GA4 tracking for the Amazon hand-off. Plain JS with no jQuery dependency,
 * so it runs on every page, including ones without webflow.js.
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var supportsCrossDocVT = 'onpagereveal' in window;
  var lenis = null;

  /* ------------------------------------------------------------------------
   * Analytics (GA4 via gtag.js / dataLayer)
   * --------------------------------------------------------------------- */

  window.dataLayer = window.dataLayer || [];

  function track(eventName, params) {
    params = params || {};
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      } else {
        window.dataLayer.push(Object.assign({ event: eventName }, params));
      }
    } catch (e) { /* analytics must never break the page */ }
  }

  window.hydragearTrack = track;

  function asinFromUrl(url) {
    var m = /\/dp\/([A-Z0-9]{10})/i.exec(url || '');
    return m ? m[1].toUpperCase() : null;
  }

  function isAmazon(url) {
    return /(^|\.)amazon\.[a-z.]+$/i.test(url.hostname) || /(^|\.)amzn\.to$/i.test(url.hostname);
  }

  function socialPlatform(url) {
    var h = url.hostname.replace(/^www\./, '');
    if (/instagram\.com$/.test(h)) return 'instagram';
    if (/tiktok\.com$/.test(h)) return 'tiktok';
    if (/youtube\.com$|youtu\.be$/.test(h)) return 'youtube';
    if (/facebook\.com$/.test(h)) return 'facebook';
    if (/pinterest\.com$/.test(h)) return 'pinterest';
    return null;
  }

  function textOf(el) {
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function priceOf(el) {
    var n = parseFloat(textOf(el).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? undefined : n;
  }

  function titleCase(s) {
    return s.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  var pageName = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';

  /* Build GA4 ecommerce items from the product cards on the page */
  var products = [];
  doc.querySelectorAll('.product-card').forEach(function (card, i) {
    var btn = card.querySelector('a.product-shop-btn');
    if (!btn) return;
    var name = titleCase(textOf(card.querySelector('.product-title')));
    var item = {
      item_id: asinFromUrl(btn.href) || name,
      item_name: name,
      item_brand: 'Hydragear',
      affiliation: 'Amazon',
      item_list_id: pageName + '_products',
      item_list_name: pageName === 'shop' ? 'Shop' : 'Home Product Grid',
      index: i,
      price: priceOf(card.querySelector('.price')),
      quantity: 1
    };
    products.push({ card: card, btn: btn, item: item });
    if (!btn.getAttribute('aria-label') && name) {
      btn.setAttribute('aria-label', 'Shop ' + name + ' on Amazon (opens in a new tab)');
    }
  });

  /* Outbound / shopping click tracking (capture phase so it always runs) */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin === location.origin || !/^https?:$/.test(url.protocol)) {
      if (url.protocol === 'mailto:') {
        track('contact_email_click', { link_url: a.href, page_location: location.href });
      }
      return;
    }

    if (isAmazon(url)) {
      var product = null;
      for (var i = 0; i < products.length; i++) {
        if (products[i].btn === a) { product = products[i]; break; }
      }
      if (product) {
        track('select_item', {
          item_list_id: product.item.item_list_id,
          item_list_name: product.item.item_list_name,
          items: [product.item]
        });
      }
      track('amazon_click', {
        link_url: a.href,
        link_text: textOf(a).slice(0, 100),
        item_id: product ? product.item.item_id : asinFromUrl(a.href) || 'storefront',
        item_name: product ? product.item.item_name : undefined,
        value: product ? product.item.price : undefined,
        currency: 'USD',
        page_location: location.href,
        outbound: true
      });
      return;
    }

    var platform = socialPlatform(url);
    if (platform) {
      track('social_click', { social_platform: platform, link_url: a.href, outbound: true });
      return;
    }

    track('outbound_click', { link_url: a.href, link_domain: url.hostname, outbound: true });
  }, true);

  /* view_item_list once the product grid is actually seen */
  if (products.length && 'IntersectionObserver' in window) {
    var listSent = false;
    var listObserver = new IntersectionObserver(function (entries) {
      if (listSent) return;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          listSent = true;
          listObserver.disconnect();
          track('view_item_list', {
            item_list_id: products[0].item.item_list_id,
            item_list_name: products[0].item.item_list_name,
            items: products.map(function (p) { return p.item; })
          });
          break;
        }
      }
    }, { threshold: 0.25 });
    products.forEach(function (p) { listObserver.observe(p.card); });
  }

  /* Form tracking: newsletter sign-ups and contact leads */
  doc.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    var isNewsletter = /sign-up/.test(form.className) || form.querySelectorAll('input:not([type=submit]), textarea').length === 1;
    if (isNewsletter) {
      track('sign_up', { method: 'newsletter', form_id: form.id || form.name || '' });
    } else {
      track('generate_lead', { form_id: form.id || form.name || '', form_name: form.getAttribute('data-name') || '' });
    }
  }, true);

  /* ------------------------------------------------------------------------
   * Clean links
   * --------------------------------------------------------------------- */

  doc.querySelectorAll('a[target="_blank"]').forEach(function (a) {
    var rel = (a.getAttribute('rel') || '').split(/\s+/);
    if (rel.indexOf('noopener') === -1) {
      rel.push('noopener');
      a.setAttribute('rel', rel.join(' ').trim());
    }
  });

  /* Placeholder links (href="#") shouldn't jump the page to the top */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#"]');
    if (a && !a.hasAttribute('data-w-id') && !a.closest('.w-tab-menu, .w-dropdown, .w-slider')) {
      e.preventDefault();
    }
  });

  /* ------------------------------------------------------------------------
   * Smooth scrolling
   * --------------------------------------------------------------------- */

  function headerOffset() {
    var nav = doc.querySelector('.header-nav');
    if (nav && getComputedStyle(nav).position === 'fixed') {
      return nav.getBoundingClientRect().height + 12;
    }
    return 0;
  }

  function scrollToTarget(target) {
    var y = target === 0 ? 0 : target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    if (lenis) {
      lenis.scrollTo(y, { duration: 1.2 });
    } else {
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  /* In-page anchors: offset for the fixed header, works with or without Lenis.
     Runs in capture phase so Webflow's jQuery scroll doesn't fight it. */
  doc.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.pathname !== location.pathname || url.origin !== location.origin || !url.hash || url.hash === '#') return;
    var id = decodeURIComponent(url.hash.slice(1));
    var target = doc.getElementById(id);
    if (!target) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    scrollToTarget(target);
    if (history.pushState) history.pushState(null, '', url.hash);
  }, true);

  /* Lenis inertia scrolling on desktop pointers only; touch keeps native momentum */
  function initLenis() {
    if (!window.Lenis || lenis) return;
    lenis = new window.Lenis({
      lerp: 0.11,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false
    });
    doc.querySelectorAll('.menu-open, .nav-overlay, [data-lenis-prevent], textarea, .w-dropdown-list')
      .forEach(function (el) { el.setAttribute('data-lenis-prevent', ''); });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.hydragearLenis = lenis;
  }

  if (finePointer && !reduceMotion) {
    if (window.Lenis) {
      initLenis();
    } else {
      var s = doc.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
      s.async = true;
      s.onload = initLenis;
      doc.head.appendChild(s);
    }
  }

  /* ------------------------------------------------------------------------
   * Scroll progress bar
   * --------------------------------------------------------------------- */

  var progress = doc.createElement('div');
  progress.className = 'hg-progress';
  progress.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(progress);

  var ticking = false;
  function updateProgress() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.pageYOffset / max)) : 0;
    progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  /* ------------------------------------------------------------------------
   * Scroll reveals
   * Only for elements Webflow interactions don't already animate.
   * --------------------------------------------------------------------- */

  var revealSelectors = [
    '.product-card',
    '.intro-section .text-center',
    '.blog-card-wrapper',
    '.blog-card:not(.empty)',
    '.form-field-wrapper',
    '.contact-hero',
    '.footer-column:not(.hide)',
    '.post-info-box',
    '.blog-body .text-box'
  ];

  function animatedByWebflow(el) {
    if (el.closest('[data-w-id]') && !el.matches('.product-card')) return true;
    if (el.querySelector('[data-w-id]:not(.product-card)')) return true;
    var st = el.getAttribute('style') || '';
    return /opacity|transform/.test(st);
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('hg-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    var vh = window.innerHeight;
    doc.querySelectorAll(revealSelectors.join(',')).forEach(function (el) {
      if (el.classList.contains('hg-reveal') || animatedByWebflow(el)) return;
      // Leave anything already on screen alone so nothing flickers on load
      var rect = el.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) return;
      // Stagger siblings in the same grid row for a cascading entrance
      var parent = el.parentElement;
      var idx = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
      var cols = 1;
      if (parent) {
        var tpl = getComputedStyle(parent).gridTemplateColumns;
        if (tpl && tpl !== 'none') cols = tpl.split(' ').length;
      }
      el.style.setProperty('--hg-delay', ((idx % cols) * 90) + 'ms');
      el.classList.add('hg-reveal');
      revealObserver.observe(el);
    });

    // Safety: Webflow sections revealed later (e.g. after the home intro) can
    // reflow content; re-check positions once the page settles.
    window.addEventListener('load', function () {
      doc.querySelectorAll('.hg-reveal:not(.hg-in)').forEach(function (el) {
        revealObserver.unobserve(el);
        revealObserver.observe(el);
      });
    });
  }

  /* ------------------------------------------------------------------------
   * Shopping polish
   * --------------------------------------------------------------------- */

  products.forEach(function (p) {
    var wrap = p.card.querySelector('.product-image-wrapper');
    var img = p.card.querySelector('.product-image');

    // Soft shimmer + fade-in while product photos load
    if (img && !img.complete) {
      img.classList.add('hg-img-pending');
      if (wrap) wrap.classList.add('hg-loading');
      var done = function () {
        img.classList.remove('hg-img-pending');
        if (wrap) wrap.classList.remove('hg-loading');
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });

  /* Warm up the connection to Amazon as soon as a shopper shows intent */
  var warmed = false;
  function warmAmazon() {
    if (warmed) return;
    warmed = true;
    ['https://www.amazon.com', 'https://m.media-amazon.com'].forEach(function (href) {
      var l = doc.createElement('link');
      l.rel = 'preconnect';
      l.href = href;
      doc.head.appendChild(l);
    });
  }
  doc.querySelectorAll('a[href*="amazon.com"]').forEach(function (a) {
    a.addEventListener('pointerenter', warmAmazon, { once: true, passive: true });
    a.addEventListener('touchstart', warmAmazon, { once: true, passive: true });
    a.addEventListener('focus', warmAmazon, { once: true });
  });

  /* ------------------------------------------------------------------------
   * Page transitions (fallback for browsers without view transitions)
   * --------------------------------------------------------------------- */

  if (!supportsCrossDocVT && !reduceMotion) {
    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      if (!/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      doc.body.classList.add('hg-leaving');
      setTimeout(function () { location.href = url.href; }, 220);
    });
  }

  // Coming back via the back button (bfcache) must never show a faded page
  window.addEventListener('pageshow', function (e) {
    doc.body.classList.remove('hg-leaving');
    if (e.persisted) updateProgress();
  });
})();
