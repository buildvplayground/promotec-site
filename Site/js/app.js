/* ============================================================================
   Promotec — app.js
   Scripts proprios da pagina (nao fazem parte do motor de movimento, que fica
   inteiro em motion.js): WhatsApp CTA, dropdown do menu, lightbox do portfolio
   (por projeto — NAO usa o lightbox generico do motor, ver brief-pack.md §3),
   cookie notice + modal de privacidade (LGPD), CTA final "como funciona".
   Carregar DEPOIS de motion.js.
   ============================================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* 1) WHATSAPP — fonte unica do numero                                  */
  /* ------------------------------------------------------------------ */
  var WHATSAPP_NUMBER = '5511999999999';
  var DEFAULT_WA_TEXT = 'Olá! Gostaria de solicitar um orçamento com a Promotec.';

  document.querySelectorAll('[data-wa-btn]').forEach(function (a) {
    var msg = a.getAttribute('data-wa-text') || DEFAULT_WA_TEXT;
    a.setAttribute('href', 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  /* ------------------------------------------------------------------ */
  /* 2) DROPDOWN "Serviços" — hover cobre mouse/foco; clique cobre toque   */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('.has-dropdown').forEach(function (li) {
    var btn = li.querySelector('.dropdown-toggle');
    if (!btn) return;
    function close() { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    function open() { li.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = li.classList.contains('is-open');
      document.querySelectorAll('.has-dropdown.is-open').forEach(function (o) { if (o !== li) o.classList.remove('is-open'); });
      isOpen ? close() : open();
    });
    li.addEventListener('focusin', open);
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) close();
    });
    document.addEventListener('click', function (e) {
      if (!li.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  });

  /* ------------------------------------------------------------------ */
  /* 3) LIGHTBOX DO PORTFOLIO — 1 galeria por projeto (data-gallery)      */
  /* ------------------------------------------------------------------ */
  (function () {
    var lb = document.querySelector('[data-lightbox]');
    var cards = [].slice.call(document.querySelectorAll('[data-gallery]'));
    if (!lb || !cards.length) return;

    var img = lb.querySelector('[data-lb-img]');
    var closeBtn = lb.querySelector('[data-lb-close]');
    var prevBtn = lb.querySelector('[data-lb-prev]');
    var nextBtn = lb.querySelector('[data-lb-next]');
    var counter = lb.querySelector('[data-lb-count]');

    var currentList = [];
    var currentAlt = '';
    var cur = 0;
    var lastFocus = null;

    function isOpen() { return lb.getAttribute('data-open') === 'true'; }

    function show(i) {
      if (!currentList.length) return;
      cur = ((i % currentList.length) + currentList.length) % currentList.length;
      var src = currentList[cur];
      if (counter) counter.textContent = (cur + 1) + ' / ' + currentList.length;
      var alt = currentAlt + ' — foto ' + (cur + 1) + ' de ' + currentList.length;
      if (reduceMotion) { img.setAttribute('src', src); img.setAttribute('alt', alt); return; }
      img.style.opacity = '0';
      var pre = new Image();
      pre.onload = swap; pre.onerror = swap; pre.src = src;
      function swap() {
        img.setAttribute('src', src);
        img.setAttribute('alt', alt);
        requestAnimationFrame(function () { img.style.opacity = '1'; });
      }
      if (pre.complete) { pre.onload = null; swap(); }
    }

    function open(list, alt, startIndex) {
      currentList = list; currentAlt = alt;
      lastFocus = document.activeElement;
      lb.setAttribute('data-open', 'true');
      lb.setAttribute('aria-hidden', 'false');
      lb.setAttribute('data-single', list.length < 2 ? 'true' : 'false');
      document.body.style.overflow = 'hidden';
      show(startIndex || 0);
      requestAnimationFrame(function () { requestAnimationFrame(function () { lb.classList.add('is-visible'); }); });
      if (closeBtn) { try { closeBtn.focus(); } catch (e) {} }
    }

    function close() {
      lb.classList.remove('is-visible');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      var finish = function (e) {
        if (e && e.target !== lb) return;
        lb.setAttribute('data-open', 'false');
        img.setAttribute('src', ''); img.style.opacity = '';
        lb.removeEventListener('transitionend', finish);
      };
      if (reduceMotion) { finish(); } else {
        lb.addEventListener('transitionend', finish);
        setTimeout(finish, 420);
      }
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    }

    cards.forEach(function (card) {
      var list = (card.getAttribute('data-gallery') || '').split('|').filter(Boolean);
      var title = card.getAttribute('data-gallery-title') || '';
      if (!list.length) return;
      card.addEventListener('click', function () { open(list, title, 0); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(list, title, 0); }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    });

    /* toque (swipe horizontal) */
    var sx = 0, sy = 0, swiping = false;
    lb.addEventListener('touchstart', function (e) {
      if (!isOpen() || e.touches.length !== 1) { swiping = false; return; }
      swiping = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (!swiping) return; swiping = false;
      if (currentList.length < 2) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) show(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  })();

  /* ------------------------------------------------------------------ */
  /* 4) CTA FINAL "Como funciona" — linha vertical + passos escalonados   */
  /* ------------------------------------------------------------------ */
  (function () {
    var wrap = document.querySelector('.how-steps');
    if (!wrap) return;
    if (reduceMotion || !('IntersectionObserver' in window)) return; /* fica 100% visivel por padrao */
    wrap.classList.add('how-armed');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { wrap.classList.add('is-on'); io.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    io.observe(wrap);
  })();

  /* ------------------------------------------------------------------ */
  /* 5) LGPD — cookie notice + modal de politica de privacidade           */
  /* ------------------------------------------------------------------ */
  (function () {
    function openModal(id) {
      var el = document.getElementById(id);
      if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
    }
    function closeModal(id) {
      var el = document.getElementById(id);
      if (el) {
        el.classList.remove('open');
        if (!document.querySelectorAll('.privacy-overlay.open').length) document.body.style.overflow = '';
      }
    }
    document.querySelectorAll('[data-modal]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openModal(el.getAttribute('data-modal')); });
    });
    var privClose = document.getElementById('privacyClose');
    var privOverlay = document.getElementById('privacyOverlay');
    if (privClose) privClose.addEventListener('click', function () { closeModal('privacyOverlay'); });
    if (privOverlay) privOverlay.addEventListener('click', function (e) { if (e.target === privOverlay) closeModal('privacyOverlay'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal('privacyOverlay'); });

    var COOKIE_KEY = 'promotec_cookie_consent';
    var notice = document.getElementById('cookieNotice');
    if (notice && !localStorage.getItem(COOKIE_KEY)) {
      setTimeout(function () { notice.classList.add('show'); }, 1200);
    }
    function pushConsent(value) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'cookie_consent', consent: value });
    }
    function dismissCookie(value) {
      if (notice) notice.classList.remove('show');
      localStorage.setItem(COOKIE_KEY, value);
      pushConsent(value);
    }
    var acceptBtn = document.getElementById('cookieAccept');
    var declineBtn = document.getElementById('cookieDecline');
    if (acceptBtn) acceptBtn.addEventListener('click', function () { dismissCookie('accepted'); });
    if (declineBtn) declineBtn.addEventListener('click', function () { dismissCookie('declined'); });
  })();
})();
