/* Aroma Limeño · Lima viva */
(() => {
  'use strict';
  const { $, $$, CARTA, reduce, fino, esc, precio, fotoSec } = window.AL;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (e0, e1, v) => { const x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const topOffset = () => { const n = $('.l-nav'); return (n ? n.getBoundingClientRect().bottom : 128); };

  /* ---------------- nav: menú móvil y sección activa ---------------- */
  const nav = $('.l-nav'), burger = $('.l-burger'), links = $$('.l-nav__links a');
  function menu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => menu(!nav.classList.contains('is-open')));
  links.forEach(a => a.addEventListener('click', () => menu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { menu(false); burger.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 860 && nav.classList.contains('is-open')) menu(false); });
  const secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
  function navActive() {
    const y = innerHeight * .4;
    let on = -1;
    secs.forEach((s, i) => { if (s) { const r = s.getBoundingClientRect(); if (r.top < y && r.bottom > y) on = i; } });
    links.forEach((a, i) => a.classList.toggle('is-here', i === on));
  }

  /* ---------------- hero: parallax suave ---------------- */
  const art = $('.l-hero__art');
  function hero() {
    if (reduce) return;
    const y = Math.min(scrollY, innerHeight);
    art.style.setProperty('--hy', (y * -.08).toFixed(1) + 'px');
    art.style.setProperty('--hl', (y * .05).toFixed(1) + 'px');
  }

  /* ---------------- manifiesto: palabras que se encienden ---------------- */
  const mani = $('.l-mani__txt');
  mani.innerHTML = mani.textContent.trim().split(/\s+/).map(w => `<span class="w2">${esc(w)}</span>`).join(' ');
  const words = $$('.w2', mani);
  function manifiesto() {
    if (reduce) return;
    const r = mani.getBoundingClientRect();
    if (r.bottom < -100 || r.top > innerHeight + 100) return;
    const h = innerHeight;
    words.forEach(w => {
      const t = w.getBoundingClientRect().top;
      w.style.opacity = (.16 + .84 * clamp((h * .82 - t) / (h * .32))).toFixed(3);
    });
  }

  /* ---------------- siete tiempos (signature) ---------------- */
  const tiempos = $('.l-tiempos'), stage = $('.l-tiempos__stage');
  const ts = $$('.l-t', tiempos), N = ts.length, last = N - 1;
  const plates = ts.map(t => $('.l-t__plate', t)), imgs = ts.map(t => $('.l-t__plate img, .l-t__plate svg', t));
  const now = $('.l-tiempos__now'), rail = $$('.l-rail button'), ring = $('.l-ring');
  const ticksG = $('.l-ring__ticks');
  const pinned = !reduce;
  let pT = 0, pS = 0, pInit = false, activo = -1, raf = 0;
  if (pinned) {
    tiempos.classList.add('is-pinned');
    tiempos.style.setProperty('--n', N);
    ticksG.innerHTML = ts.map((_, i) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(50 + 48 * Math.cos(a)).toFixed(2)}" cy="${(50 + 48 * Math.sin(a)).toFixed(2)}" r="1"/>`; }).join('');
    plates.forEach((p, i) => p.style.setProperty('--z', i));
  }
  const ticks = $$('circle', ticksG);
  function rango() { return Math.max(1, tiempos.offsetHeight - stage.offsetHeight); }
  function tiemposTarget() {
    const r = tiempos.getBoundingClientRect();
    return clamp((topOffset() - r.top) / rango()) * last;
  }
  function pintarTiempos(p) {
    plates.forEach((pl, i) => {
      if (i === 0) { imgs[0].style.setProperty('--r', (p * 22).toFixed(2) + 'deg'); return; }
      const e = smooth(i - .62, i - .08, p);
      pl.style.setProperty('--e', e.toFixed(4));
      pl.style.visibility = e <= 0.001 ? 'hidden' : '';
      if (e > 0.001 && (p < i + 1.2)) {
        imgs[i].style.setProperty('--r', ((1 - e) * -16 + (p - i) * 4).toFixed(2) + 'deg');
        imgs[i].style.setProperty('--s', (1.04 - .04 * e).toFixed(4));
      }
    });
    ring.style.setProperty('--ro', (1 - p / N - .0001).toFixed(4));
    const ra = (p / N) * 360;
    ring.style.setProperty('--ra', ra.toFixed(2) + 'deg');
    ticks.forEach((c, i) => { const d = Math.abs(ra - (i / N) * 360); c.style.opacity = d < 4 ? '0' : '1'; });
    const idx = clamp(Math.floor(p + .4), 0, last);
    if (idx !== activo) {
      activo = idx;
      ts.forEach((t, i) => t.classList.toggle('is-on', i === idx));
      rail.forEach((b, i) => { b.classList.toggle('is-on', i === idx); b.setAttribute('aria-current', i === idx ? 'step' : 'false'); });
      ticks.forEach((c, i) => c.classList.toggle('is-on', i <= idx));
      now.textContent = String(idx + 1).padStart(2, '0');
    }
  }
  function tiemposTick() {
    raf = 0;
    pT = tiemposTarget();
    pS = pInit ? lerp(pS, pT, .14) : pT; pInit = true;
    if (Math.abs(pS - pT) < .0008) pS = pT;
    pintarTiempos(pS);
    if (pS !== pT) raf = requestAnimationFrame(tiemposTick);
  }
  function tiemposKick() { if (pinned && !raf) raf = requestAnimationFrame(tiemposTick); }
  rail.forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.go;
    const top = tiempos.getBoundingClientRect().top + scrollY - topOffset();
    scrollTo({ top: top + (i / last) * rango() + 2, behavior: 'smooth' });
  }));
  if (!pinned) ts.forEach(t => t.classList.add('is-on'));

  /* ---------------- galería: filas opuestas ---------------- */
  const gal = $('.l-gal'), rows = $$('.l-gal__row');
  function galeria() {
    if (reduce) return;
    const r = gal.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const pr = clamp((innerHeight - r.top) / (innerHeight + r.height));
    rows.forEach(row => {
      const max = Math.max(0, row.scrollWidth - innerWidth);
      const x = row.dataset.dir === '-1' ? -pr * max : -(1 - pr) * max;
      row.style.setProperty('--x', x.toFixed(1) + 'px');
    });
  }

  /* ---------------- la casa: el marco se abre ---------------- */
  const casa = $('.l-casa__frame');
  function laCasa() {
    if (reduce) return;
    const r = casa.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const k = smooth(0, 1, (innerHeight - r.top) / (innerHeight * .85));
    const m = innerWidth < 760 ? .5 : 1;
    casa.style.setProperty('--cy', ((1 - k) * 8 * m).toFixed(2) + '%');
    casa.style.setProperty('--cx', ((1 - k) * 10 * m).toFixed(2) + '%');
    casa.style.setProperty('--cr', ((1 - k) * 40).toFixed(1) + 'px');
    casa.style.setProperty('--cs', (1.14 - k * .1).toFixed(4));
  }

  /* ---------------- celebrar: fichas en parallax ---------------- */
  const prints = $('.l-cel__prints');
  function celebrar() {
    if (reduce) return;
    const r = prints.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    prints.style.setProperty('--pa', (c * 50).toFixed(1) + 'px');
    prints.style.setProperty('--pb', (c * -40).toFixed(1) + 'px');
  }

  /* ---------------- bucle de scroll ---------------- */
  let tick = false;
  function frame() { tick = false; navActive(); hero(); manifiesto(); galeria(); laCasa(); celebrar(); }
  function onScroll() { if (!tick) { tick = true; requestAnimationFrame(frame); } tiemposKick(); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { pInit = false; onScroll(); });
  frame(); tiemposKick();

  /* ---------------- carta ---------------- */
  const groups = $('.l-groups'), lineaG = $('.l-groups__line'), subs = $('.l-subs'), list = $('.l-list'), empty = $('.l-empty');
  const input = $('.l-search input'), sum = $('.l-carta__sum'), status = $('.l-status');
  const title = $('.l-menu__h'), count = $('.l-menu__n');
  const arch = $('.l-menu__arch'), img1 = $('.l-menu__img'), img2 = $('.l-menu__img--next'), glyph = $('.l-menu__glyph'), cap = $('.l-menu__cap');
  const modal = $('.l-modal'), deli = $('.l-modal__acts .l-pill', modal), resv = $('.l-modal__acts a[href^="tel:"]', modal);
  const total = CARTA.reduce((n, g) => n + g.s.reduce((m, s) => m + s.items.length, 0), 0);
  sum.textContent = `${total} opciones entre cocina, sushi, barra, vinos y postres.`;
  let grupo = 0, sub = 0, q = '', lista = [];
  const cuenta = n => `${n} ${n === 1 ? 'opción' : 'opciones'}`;
  groups.insertAdjacentHTML('beforeend', CARTA.map((g, i) => {
    const n = g.s.reduce((m, s) => m + s.items.length, 0);
    return `<button class="l-group" type="button" role="tab" data-i="${i}" aria-selected="false" tabindex="-1">${esc(g.n)}<sup>${n}</sup></button>`;
  }).join(''));
  const gbtns = $$('.l-group', groups);
  function moverLinea() {
    const b = gbtns[grupo]; if (!b || !b.offsetWidth) return;
    lineaG.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop + b.offsetHeight - groups.clientHeight}px) scaleX(${b.offsetWidth / 10})`;
  }
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* arco lateral: muestra la foto de la sección o del plato bajo el cursor */
  let archSrc = '', archTok = 0;
  function archShow(src, letra, texto) {
    cap.textContent = texto || '';
    if (!src) { arch.classList.add('is-type'); glyph.textContent = letra || ''; archSrc = ''; return; }
    arch.classList.remove('is-type');
    if (src === archSrc) return;
    archSrc = src;
    const tok = ++archTok;
    if (reduce) { img1.src = src; return; }
    img2.classList.remove('is-in');
    img2.src = src;
    const go = () => {
      if (tok !== archTok) return;
      void img2.offsetWidth;
      img2.classList.add('is-in');
      setTimeout(() => { if (tok === archTok) { img1.src = src; img2.classList.remove('is-in'); } }, 720);
    };
    (img2.decode ? img2.decode() : Promise.resolve()).then(go, go);
  }
  function archSeccion() {
    if (q) { const c = lista.find(x => x.it.f); if (c) archShow(c.it.f, '', c.it.n); else archShow('', 'A', ''); return; }
    const s = CARTA[grupo].s[sub];
    archShow(fotoSec(s) || '', s.n.replace(/^(el|la|los|las|nuestras)\s+/i, '').charAt(0), s.n);
  }

  function pintarSubs() {
    subs.innerHTML = CARTA[grupo].s.map((s, i) => `<button class="l-sub" type="button" data-s="${i}" aria-pressed="${i === sub && !q}">${esc(s.n)}</button>`).join('');
  }
  function pintar(animar = true) {
    gbtns.forEach((b, i) => { const on = i === grupo && !q; b.setAttribute('aria-selected', String(on)); b.tabIndex = i === grupo ? 0 : -1; });
    moverLinea();
    lineaG.style.opacity = q ? '0' : '1';
    subs.hidden = !!q;
    if (q) {
      const nq = norm(q);
      lista = CARTA.flatMap(g => g.s.flatMap(s => s.items.filter(it => norm(it.n + ' ' + (it.d || '') + ' ' + s.n).includes(nq)).map(it => ({ it, sec: s.n, g: g.k }))));
      title.textContent = 'Resultados';
    } else {
      const s = CARTA[grupo].s[sub];
      lista = s.items.map(it => ({ it, sec: s.n, g: CARTA[grupo].k }));
      title.textContent = s.n;
    }
    count.textContent = cuenta(lista.length);
    status.textContent = q ? `${cuenta(lista.length)} para «${q}»` : '';
    list.innerHTML = lista.map(({ it, sec }, i) => `
      <li style="--i:${Math.min(i, 20)}"><button class="l-row${it.f ? ' has-f' : ''}${q ? ' l-row--q' : ''}" type="button" data-idx="${i}" aria-haspopup="dialog">
        ${it.f ? `<span class="l-row__thumb" aria-hidden="true"><img src="${it.f}" alt="" loading="lazy"></span>` : ''}
        ${q ? `<span class="l-row__sec">${esc(sec)}</span>` : ''}
        <span class="l-row__name">${esc(it.n)}${it.f ? '<i aria-hidden="true"></i>' : ''}</span>
        <span class="l-row__lead" aria-hidden="true"></span>
        <span class="l-row__price">${precio(it)}</span>
        ${it.d ? `<span class="l-row__desc">${esc(it.d)}</span>` : ''}
      </button></li>`).join('');
    empty.hidden = lista.length > 0;
    if (animar && !reduce) $$('li', list).forEach(li => li.classList.add('enter'));
    archSeccion();
  }
  function irGrupo(i, foco) {
    grupo = i; sub = 0; q = ''; input.value = '';
    pintarSubs(); pintar();
    if (foco) gbtns[i].focus();
  }
  groups.addEventListener('click', e => { const b = e.target.closest('.l-group'); if (b) irGrupo(+b.dataset.i); });
  groups.addEventListener('keydown', e => {
    if (!e.target.closest('.l-group')) return;
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (d) { e.preventDefault(); irGrupo((grupo + d + CARTA.length) % CARTA.length, true); }
  });
  subs.addEventListener('click', e => {
    const b = e.target.closest('.l-sub'); if (!b) return;
    sub = +b.dataset.s; q = ''; input.value = '';
    $$('.l-sub', subs).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    pintar();
    const m = $('.l-menu');
    if (m.getBoundingClientRect().top < topOffset()) m.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
  let tq;
  input.addEventListener('input', () => {
    clearTimeout(tq);
    tq = setTimeout(() => {
      q = input.value.trim();
      $$('.l-sub', subs).forEach(x => x.setAttribute('aria-pressed', String(!q && +x.dataset.s === sub)));
      pintar();
    }, 160);
  });
  const hoverRow = e => {
    const r = e.target.closest('.l-row'); if (!r) return;
    const { it, sec } = lista[+r.dataset.idx];
    if (it.f) archShow(it.f, '', it.n); else if (!q) archSeccion();
  };
  if (fino) list.addEventListener('pointerover', hoverRow);
  list.addEventListener('focusin', hoverRow);
  list.addEventListener('pointerleave', () => { if (!q) archSeccion(); });
  list.addEventListener('click', e => {
    const r = e.target.closest('.l-row'); if (!r) return;
    const { it, sec, g } = lista[+r.dataset.idx];
    const im = $('img', modal), gl = $('.l-modal__glyph', modal);
    modal.classList.toggle('is-type', !it.f);
    const bebida = g === 'vinos' || g === 'barra';
    deli.hidden = bebida;
    resv.className = bebida ? 'l-pill l-pill--sm' : 'l-link';
    im.hidden = !it.f; gl.hidden = !!it.f;
    if (it.f) { im.src = it.f; im.alt = it.n; } else { im.removeAttribute('src'); gl.textContent = it.n.charAt(0); }
    $('.l-modal__sec', modal).textContent = sec;
    $('h3', modal).textContent = it.n;
    $('.l-modal__desc', modal).textContent = [it.d, it.x].filter(Boolean).join('. ');
    $('.l-modal__price', modal).textContent = precio(it);
    modal.showModal();
  });
  $('.l-modal__x').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => {
    if (e.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
  });
  addEventListener('resize', moverLinea);
  pintarSubs(); pintar(false);
  document.fonts && document.fonts.ready.then(() => { moverLinea(); pInit = false; onScroll(); });
})();
