/* Olympost site: language, partner ref, video, motion, forms. */
(function () {
  var root = document.documentElement;
  var base = root.getAttribute('data-base') || '';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- partner ref: first code wins, sent with every form ---------- */
  var REF = store.get('olympost-ref') || '';
  var refParam = (new URLSearchParams(location.search).get('ref') || '').trim();
  if (!REF && /^[A-Za-z0-9_-]{1,40}$/.test(refParam)) { REF = refParam; store.set('olympost-ref', REF); }

  /* ---------- traffic source: first visit wins, sent with every form ---------- */
  var SRC = store.get('olympost-src') || '';
  if (!SRC) {
    var q = new URLSearchParams(location.search), rh = '';
    try { rh = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    if (rh === location.hostname) rh = '';
    SRC = [q.get('utm_source'), q.get('utm_medium'), q.get('utm_campaign'), rh].filter(Boolean).join(' / ').slice(0, 120);
    if (SRC) store.set('olympost-src', SRC);
  }

  /* ---------- language ---------- */
  var ruData = JSON.parse($('#i18n-ru').textContent);
  var enData = { t: {}, p: {}, title: document.title };
  $$('[data-t]').forEach(function (e) { enData.t[e.getAttribute('data-t')] = e.innerHTML; });
  $$('[data-tp]').forEach(function (e) { enData.p[e.getAttribute('data-tp')] = e.getAttribute('placeholder'); });
  var LANG = 'en';
  var STR = {
    en: { making: 'Making video', pub: 'Publishing', done: 'Published', approve: 'Waiting for your approval', thanks: 'Request received.', fail: 'That did not go through. Please try again.',
      bookDone: function (c) { return 'We will message you at ' + c + ' within 4 hours to pick a time. On the call: the platform, more videos, your launch sized for your volume.'; },
      tdDone: function (h, m) { return 'The teardown of ' + h + ' goes to ' + m + '.'; },
      partnerDone: 'We will message you with the next steps.', int: { network: 'Request: the Network plan.' } },
    ru: { making: 'Создаётся видео', pub: 'Публикуется', done: 'Опубликовано', approve: 'Ждёт вашего утверждения', thanks: 'Заявка у нас.', fail: 'Заявка не отправилась. Попробуйте ещё раз.',
      bookDone: function (c) { return 'Напишем вам на ' + c + ' в течение 4 часов, чтобы выбрать время. На созвоне: платформа, ещё видео, запуск под ваш объём.'; },
      tdDone: function (h, m) { return 'Разбор ' + h + ' придёт на ' + m + '.'; },
      partnerDone: 'Напишем и расскажем, что дальше.', int: { network: 'Запрос: тариф Network.' } }
  };
  function setLang(lang, remember) {
    lang = lang === 'ru' ? 'ru' : 'en';
    LANG = lang; root.lang = lang;
    var d = lang === 'ru' ? ruData : enData;
    $$('[data-t]').forEach(function (e) { var k = e.getAttribute('data-t'); if (d.t[k] != null) e.innerHTML = d.t[k]; });
    $$('[data-tp]').forEach(function (e) { var k = e.getAttribute('data-tp'); if (d.p && d.p[k] != null) e.setAttribute('placeholder', d.p[k]); });
    document.title = d.title;
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    if (remember) store.set('olympost-lang', lang);
    $$('[data-count]').forEach(function (e) { e.textContent = fmtCount(e, 1); });
    if (window.__netRefresh) window.__netRefresh();
    showInterest();
  }
  function fmtCount(e, p) {
    var n = Math.round(+e.getAttribute('data-count') * p);
    var s = n.toLocaleString(LANG === 'ru' ? 'ru-RU' : 'en-US');
    return s + (e.getAttribute(LANG === 'ru' ? 'data-suf-ru' : 'data-suf') || '');
  }
  var interest = '';
  function showInterest() {
    var el = $('#bk-interest'); if (!el) return;
    el.hidden = !interest; el.textContent = interest ? STR[LANG].int[interest] : '';
  }
  var saved = store.get('olympost-lang');
  var navLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); }); });
  var langParam = new URLSearchParams(location.search).get('lang');
  setLang(/^(ru|en)$/.test(langParam || '') ? langParam : saved || (/^(ru|uk|be|kk)$/.test(navLang) ? 'ru' : 'en'), false);

  /* ---------- header ---------- */
  var top = $('.top');
  var onScroll = function () { top.classList.toggle('solid', window.scrollY > 40); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = $('.burger'), nav = $('.nav');
  if (burger) {
    burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  /* ---------- reveal ---------- */
  var rv = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); rio.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e) { rio.observe(e); });
  }

  /* ---------- count up ---------- */
  var cnt = $$('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return;
        cio.unobserve(x.target);
        var e = x.target, t0 = performance.now();
        (function tick(t) {
          var p = Math.min(1, (t - t0) / 1500); p = 1 - Math.pow(1 - p, 4);
          e.textContent = fmtCount(e, p);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: .4 });
    cnt.forEach(function (e) { cio.observe(e); });
  }

  /* ---------- video: posters first, play only what is on screen ---------- */
  var V = base + 'assets/videos/';
  function tile(n, play, eager) {
    var d = document.createElement('div'); d.className = 'tile';
    d.innerHTML = '<img src="' + V + n + '.jpg" alt="" decoding="async" width="480" height="854"' + (eager ? '' : ' loading="lazy"') + '>';
    if (play) d.setAttribute('data-v', n);
    return d;
  }
  var wall = $('#wall');
  if (wall) {
    var small = innerWidth < 700;
    var cols = small
      ? [['g10', 'g03', 'r8'], ['r1', 'g11', 'g07'], ['g09', 'g05', 'g08']]
      : [['g10', 'g03', 'r8'], ['g04', 'g11', 'g07'], ['g09', 'r1', 'g05'], ['r3', 'g08', 'r2'], ['g03', 'g06', 'g09'], ['r8', 'g05', 'g04'], ['g07', 'g10', 'r1']];
    var live = small ? { g03: 1, g11: 1, g05: 1 } : { g11: 1, r1: 1, g03: 1, g10: 1, r8: 1, g09: 1, g05: 1 };
    cols.forEach(function (c) {
      var col = document.createElement('div'); col.className = 'wall-col';
      c.forEach(function (n) { var on = live[n]; if (on) delete live[n]; col.appendChild(tile(n, !!on, true)); });
      wall.appendChild(col);
    });
  }
  $$('[data-reel]').forEach(function (e) { e.parentNode.replaceChild(tile(e.getAttribute('data-reel'), true), e); });
  $$('[data-reel-go]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = $('.reel'); r.scrollBy({ left: +b.getAttribute('data-reel-go') * r.clientWidth * .7, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  var videosOn = !reduce && !saveData && 'IntersectionObserver' in window;
  function attach(t) {
    if (t.__v) return t.__v;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.preload = 'metadata'; v.src = V + t.getAttribute('data-v') + '.mp4';
    v.style.opacity = 0; v.style.transition = 'opacity .6s';
    v.addEventListener('playing', function () { v.style.opacity = 1; });
    t.appendChild(v); t.__v = v; return v;
  }
  if (videosOn) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (x.isIntersecting) { var p = attach(x.target).play(); if (p && p.catch) p.catch(function () {}); }
        else if (x.target.__v) x.target.__v.pause();
      });
    }, { rootMargin: '120px', threshold: .15 });
    var startVideos = function () { $$('[data-v]').forEach(function (t) { vio.observe(t); }); };
    if (document.readyState === 'complete') setTimeout(startVideos, 300);
    else addEventListener('load', function () { setTimeout(startVideos, 300); });
    document.addEventListener('visibilitychange', function () {
      $$('[data-v]').forEach(function (t) { if (t.__v && document.hidden) t.__v.pause(); });
      if (!document.hidden) $$('[data-v]').forEach(function (t) { vio.unobserve(t); vio.observe(t); });
    });
  }

  /* ---------- network demo: example accounts, sped up ---------- */
  var board = $('#board');
  if (board) {
    var A = [['nadia.dxb.homes', 'g03', 'Real estate · AE', 'Недвижимость · AE'], ['glowlab.daily', 'g10', 'Skincare · US', 'Уход за кожей · US'], ['smile.studio.ldn', 'r8', 'Dental · UK', 'Стоматология · UK'],
      ['fitwithkai', 'g09', 'Fitness · DE', 'Фитнес · DE'], ['luca.trades', 'g07', 'Trading · ES', 'Трейдинг · ES'], ['mesa.kitchen', 'r1', 'Restaurant · MX', 'Ресторан · MX'],
      ['aria.learns.en', 'g05', 'Language course · SA', 'Языковой курс · SA'], ['sara.skin.ae', 'g04', 'Skincare · AE', 'Уход за кожей · AE'], ['nomad.visas', 'g08', 'Relocation · ID', 'Релокация · ID']];
    var seq = ['approve', 'make', 'pub', 'done'], dur = { approve: 3600, make: 7000, pub: 2200, done: 5200 };
    var pubEl = $('#net-pub'), makeEl = $('#net-make'), published = 23;
    var cards = A.map(function (a, i) {
      var c = document.createElement('article'); c.className = 'acct';
      c.innerHTML = '<img src="' + V + a[1] + '.jpg" alt="" loading="lazy" decoding="async"><div class="acct-b"><div class="acct-h">@' + a[0] + '</div><div class="acct-n"></div><div class="acct-s"><i></i><span></span></div></div><div class="acct-p"></div>';
      board.appendChild(c);
      return { el: c, a: a, step: reduce ? (i * 3 + 1) % 4 : (i * 5 + 1) % 4, t0: 0, off: -(i * 913) % 4000 };
    });
    var NEXT = { make: 0, approve: 2, pub: 3, done: 1 };
    var map = { approve: 'approve', make: 'making', pub: 'pub', done: 'done' };
    var paint = function (c) {
      var s = seq[c.step];
      c.el.setAttribute('data-s', s === 'done' ? 'done' : s);
      $('.acct-s span', c.el).textContent = STR[LANG][map[s]];
      $('.acct-n', c.el).textContent = c.a[LANG === 'ru' ? 3 : 2];
    };
    var counts = function () {
      var n = 0; cards.forEach(function (c) { if (seq[c.step] === 'make' && c.el.offsetParent) n++; });
      if (makeEl) makeEl.textContent = n;
      if (pubEl) pubEl.textContent = published;
    };
    window.__netRefresh = function () { cards.forEach(paint); counts(); };
    window.__netRefresh();
    if (!reduce && 'IntersectionObserver' in window) {
      var running = false, last = 0;
      var loop = function (t) {
        if (!running) return;
        requestAnimationFrame(loop);
        if (t - last < 90) return; last = t;
        cards.forEach(function (c) {
          if (!c.t0) c.t0 = t + c.off;
          var s = seq[c.step], p = (t - c.t0) / dur[s];
          $('.acct-p', c.el).style.transform = 'scaleX(' + ((s === 'make' || s === 'pub') ? Math.max(0, Math.min(1, p)) : 0) + ')';
          if (p >= 1) {
            c.step = NEXT[seq[c.step]]; c.t0 = t;
            if (seq[c.step] === 'done' && c.el.offsetParent) published++;
            paint(c); counts();
          }
        });
      };
      new IntersectionObserver(function (es) {
        running = es[0].isIntersecting;
        if (running) { requestAnimationFrame(loop); }
      }).observe(board);
    }
  }

  /* ---------- mobile call bar ---------- */
  var mbar = $('.mbar'), hero = $('.hero, .p-hero'), target = $('[data-book]');
  if (mbar && hero && 'IntersectionObserver' in window) {
    var past = false, at = false, upd = function () { mbar.classList.toggle('on', past && !at); };
    new IntersectionObserver(function (e) { past = !e[0].isIntersecting; upd(); }).observe(hero);
    var quiet = [target, $('.entries')].filter(Boolean), on = [];
    quiet.forEach(function (el, i) { new IntersectionObserver(function (e) { on[i] = e[0].isIntersecting; at = on.some(Boolean); upd(); }).observe(el); });
  }

  /* ---------- entry buttons say what the person came for ---------- */
  $$('[data-interest]').forEach(function (a) {
    a.addEventListener('click', function () { interest = a.getAttribute('data-interest'); showInterest(); });
  });

  $$('a[href="#book"]:not([data-interest])').forEach(function (a) {
    a.addEventListener('click', function () { interest = ''; showInterest(); });
  });

  /* ---------- forms ---------- */
  var ENDPOINT = 'https://olympost-leads.victorpsycho7.workers.dev';
  var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
  function parseContact(raw) {
    var v = raw.trim().replace(/^(https?:\/\/)?(www\.)?(t|telegram)\.me\//i, '').replace(/[/?#].*$/, '');
    var d = v.replace(/[\s().+-]/g, '');
    if (/^\d{7,15}$/.test(d)) return '+' + d;
    if (/^@?[A-Za-z][A-Za-z0-9_]{3,31}$/.test(v)) return '@' + v.replace(/^@/, '');
    return null;
  }
  function showErr(input, bad) {
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    var e = $('#' + input.id + '-err'); if (e) e.hidden = !bad;
  }
  function wire(form, read) {
    var inputs = $$('input:not([name=website]),textarea', form);
    inputs.forEach(function (i) { i.addEventListener('input', function () { if (i.getAttribute('aria-invalid') === 'true') showErr(i, false); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return;
      var r = read();
      var bad = r.check.filter(function (c) { showErr(c[0], !c[1]); return !c[1]; });
      if (bad.length) { bad[0][0].focus(); return; }
      var btn = $('button[type=submit]', form), msg = $('.form-msg', form);
      btn.disabled = true; if (msg) msg.textContent = '';
      var body = r.payload; body.lang = LANG; if (REF) body.ref = REF; if (SRC) body.src = SRC;
      var ctl = window.AbortController ? new AbortController() : null, tm = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : 0;
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
        .then(function (x) { clearTimeout(tm); if (!x.ok) throw 0; })
        .then(function () {
          btn.disabled = false; form.reset();
          var d = $('#' + form.id + '-done');
          $('p', d).textContent = r.done();
          $('h3', d).textContent = STR[LANG].thanks;
          form.hidden = true; d.hidden = false; d.setAttribute('tabindex', '-1'); d.focus({ preventScroll: true }); d.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
        })
        .catch(function () { clearTimeout(tm); btn.disabled = false; if (msg) msg.textContent = STR[LANG].fail; });
    });
  }
  var bk = $('#book-form');
  if (bk) wire(bk, function () {
    var c = $('#bk-contact'), m = $('#bk-email'), pc = parseContact(c.value), em = m.value.trim();
    return { check: [[c, !!pc], [m, isEmail(em)]],
      payload: { contact: pc || '', email: em, source: 'call', interest: interest || undefined, brand: $('#bk-brand').value.trim().slice(0, 120), referred: $('#bk-referred').value.trim().slice(0, 120) },
      done: function () { return STR[LANG].bookDone(pc); } };
  });
  var td = $('#td-form');
  if (td) wire(td, function () {
    var m = $('#td-email'), h = $('#td-handle'), em = m.value.trim();
    var hv = h.value.trim().replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '').replace(/^@/, '');
    var ok = /^[A-Za-z0-9._]{1,30}$/.test(hv);
    return { check: [[m, isEmail(em)], [h, ok]], payload: { email: em, handle: '@' + hv, source: 'teardown' },
      done: function () { return STR[LANG].tdDone('@' + hv, em); } };
  });
  var pt = $('#partner-form');
  if (pt) wire(pt, function () {
    var n = $('#pt-name'), c = $('#pt-contact'), a = $('#pt-access'), pc = parseContact(c.value), name = n.value.trim();
    return { check: [[n, !!name], [c, !!pc]], payload: { name: name, contact: pc || '', access: a.value.trim(), source: 'partner' },
      done: function () { return STR[LANG].partnerDone; } };
  });

  window.__olympost = { ref: function () { return REF; } };
})();
