/* Aroma Limeño · Noir y oro · "Una noche en cinco tiempos" */
(() => {
  'use strict';
  const { $, $$, CARTA, reduce, fino, esc, precio } = window.AL;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const ROM = ['I', 'II', 'III', 'IV', 'V'];

  /* ---------- buscar platos reales en la carta ---------- */
  function buscar(nombre) {
    for (let g = 0; g < CARTA.length; g++) {
      const ss = CARTA[g].s;
      for (let s = 0; s < ss.length; s++) {
        const it = ss[s].items.find(i => i.n === nombre);
        if (it) return { g, s, it };
      }
    }
    return null;
  }

  /* =====================================================================
     CARTA
     ===================================================================== */
  const tabs = $('.n-tabs'), bar = $('.n-tabs__bar'), index = $('.n-index'), panel = $('.n-panel');
  let grupo = 0, spy;
  tabs.insertAdjacentHTML('beforeend', CARTA.map((g, i) => {
    const n = g.s.reduce((a, s) => a + s.items.length, 0);
    return `<button class="n-tab" role="tab" id="n-tab-${i}" aria-controls="n-panel" data-i="${i}">${esc(g.n)}<sup>${n}</sup></button>`;
  }).join(''));
  const tabBtns = $$('.n-tab', tabs);

  function moverBarra() {
    const b = tabBtns[grupo]; if (!b) return;
    bar.style.transform = `translateX(${b.offsetLeft}px) scaleX(${b.offsetWidth / 10})`;
  }
  /* fotos de estudio con mucho fondo blanco: se acercan para que el plato llene el círculo */
  const BLANCAS = new Set(['img/p10_63.webp', 'img/p11_73.webp', 'img/p11_74.webp', 'img/p12_84.webp', 'img/p15_105.webp', 'img/p17_125.webp', 'img/p17_126.webp', 'img/p18_135.webp', 'img/p18_136.webp', 'img/p23_175.webp', 'img/p23_176.webp']);
  const ZOOM = { 'img/p10_63.webp': 2.1, 'img/p11_74.webp': 1.8, 'img/p23_176.webp': 1.8 };
  const lit = (f, cls = '') => `<div class="n-lit${BLANCAS.has(f) ? ' is-blanca' : ''}${cls}"${ZOOM[f] ? ` style="--z:${ZOOM[f]}"` : ''}><img src="${f}" alt="" loading="lazy"></div>`;
  const movil = matchMedia('(max-width: 860px)');
  function pintar() {
    const g = CARTA[grupo];
    tabBtns.forEach((b, i) => { b.setAttribute('aria-selected', String(i === grupo)); b.tabIndex = i === grupo ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'n-tab-' + grupo);
    moverBarra();
    index.innerHTML = g.s.map((s, i) => `<button type="button" data-to="n-s-${i}">${esc(s.n)}</button>`).join('');
    let k = 0;
    panel.innerHTML = g.s.map((s, i) => {
      const fotos = s.items.filter(it => it.f);
      const prev = fotos.length ? `<figure class="n-prev" aria-hidden="true"><div class="n-prev__frame">${lit(fotos[0].f)}</div>
        <figcaption class="n-prev__cap"><span>${esc(fotos[0].n)}</span><b>${precio(fotos[0])}</b></figcaption>${fotos.length > 1 ? `<p class="n-prev__hint">${fotos.length} fotos · pasa el cursor</p>` : ''}</figure>` : '';
      const lista = s.items.map(it => `
        <li class="n-item${it.f ? ' has-foto' : ''}${it === fotos[0] ? ' is-prev' : ''}" style="--i:${Math.min(k++, 24)}"${it.f ? ` data-foto="${it.f}"` : ''}>
          ${it.f ? `<span class="n-item__ph" aria-hidden="true">${lit(it.f)}</span>` : ''}
          <div class="n-item__txt"><div class="n-item__row"><span class="n-item__name">${esc(it.n)}</span><span class="n-item__dots" aria-hidden="true"></span><span class="n-item__price">${precio(it)}</span></div>
          ${it.d || it.x ? `<p class="n-item__desc">${esc([it.d, it.x].filter(Boolean).join('. '))}</p>` : ''}</div>
        </li>`).join('');
      const abierta = !movil.matches || i === 0;
      return `<details class="n-sec${fotos.length ? ' has-prev' : ''}" id="n-s-${i}"${abierta ? ' open' : ''}><summary class="n-sec__sum"${movil.matches ? '' : ' tabindex="-1"'}><h3 class="n-sec__title">${esc(s.n)}<span>${s.items.length} ${s.items.length === 1 ? 'preparación' : 'preparaciones'}</span></h3><span class="n-sec__chev" aria-hidden="true"></span></summary><div class="n-sec__body">${prev}<ul class="n-list">${lista}</ul></div></details>`;
    }).join('');
    espiar();
    finFila(index);
  }
  /* en escritorio las secciones no se cierran */
  panel.addEventListener('click', e => { if (!movil.matches && e.target.closest('.n-sec__sum')) e.preventDefault(); });
  movil.addEventListener('change', () => {
    $$('.n-sec', panel).forEach((d, i) => {
      if (!movil.matches) d.open = true;
      const sm = $('summary', d); movil.matches ? sm.removeAttribute('tabindex') : sm.setAttribute('tabindex', '-1');
    });
  });
  function abrir(id) { const el = document.getElementById(id); if (el && el.tagName === 'DETAILS') el.open = true; return el; }

  /* vista previa: al pasar por un plato con foto, el círculo de la derecha cambia con un iris */
  panel.addEventListener('pointerover', e => {
    if (movil.matches) return;
    const li = e.target.closest('.n-item.has-foto'); if (!li || li.classList.contains('is-prev')) return;
    const sec = li.closest('.n-sec'), pv = $('.n-prev', sec); if (!pv) return;
    $$('.n-item.is-prev', sec).forEach(x => x.classList.remove('is-prev'));
    li.classList.add('is-prev');
    const fr = $('.n-prev__frame', pv), f = li.dataset.foto;
    fr.insertAdjacentHTML('beforeend', lit(f, reduce ? '' : ' is-new'));
    const capas = $$('.n-lit', fr);
    capas.slice(0, -1).forEach(c => { if (reduce) c.remove(); else setTimeout(() => c.remove(), 950); });
    $('.n-prev__cap span', pv).textContent = $('.n-item__name', li).textContent;
    $('.n-prev__cap b', pv).textContent = $('.n-item__price', li).textContent;
    pv.classList.toggle('is-swap');
  });

  /* filas que se deslizan: el desvanecido desaparece al llegar al final */
  function finFila(el) { el.classList.toggle('is-end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 4); }
  [tabs, index].forEach(el => el.addEventListener('scroll', () => finFila(el), { passive: true }));
  function cambiarGrupo(i, luego) {
    if (i === grupo) { luego && luego(); return; }
    grupo = i;
    if (reduce) { pintar(); luego && luego(); return; }
    panel.classList.add('is-swap');
    setTimeout(() => { pintar(); requestAnimationFrame(() => panel.classList.remove('is-swap')); luego && luego(); }, 260);
  }
  tabs.addEventListener('click', e => {
    const b = e.target.closest('.n-tab'); if (!b) return;
    cambiarGrupo(+b.dataset.i);
    if (movil.matches) tabs.scrollTo({ left: b.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
    const top = $('#n-carta').getBoundingClientRect().top;
    if (top >= 0) return;
    if (movil.matches) {
      const tope = tabs.parentElement.getBoundingClientRect().bottom + index.parentElement.offsetHeight + 8;
      scrollTo({ top: scrollY + panel.getBoundingClientRect().top - tope, behavior: reduce ? 'auto' : 'smooth' });
    } else $('#n-carta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  tabs.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let i = grupo + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0);
    if (e.key === 'Home') i = 0; if (e.key === 'End') i = CARTA.length - 1;
    i = (i + CARTA.length) % CARTA.length;
    cambiarGrupo(i); tabBtns[i].focus();
  });
  index.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    abrir(b.dataset.to).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  function espiar() {
    spy && spy.disconnect();
    spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('button', index).forEach(b => b.setAttribute('aria-current', String(b.dataset.to === e.target.id)));
      const act = $('[aria-current="true"]', index);
      if (act && innerWidth < 860) index.scrollTo({ left: act.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
    }), { rootMargin: '-35% 0px -60% 0px' });
    $$('.n-sec', panel).forEach(s => spy.observe(s));
  }
  pintar();
  addEventListener('resize', () => { moverBarra(); finFila(tabs); finFila(index); });
  document.fonts && document.fonts.ready.then(moverBarra);

  /* luz ambiente que sigue al cursor en la carta */
  const glow = $('.n-glow'), carta = $('#n-carta');
  if (fino && !reduce) {
    carta.addEventListener('pointermove', e => {
      const r = carta.getBoundingClientRect();
      glow.style.setProperty('--gx', (e.clientX - r.left) + 'px'); glow.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* =====================================================================
     CINCO TIEMPOS (signature)
     ===================================================================== */
  const TIEMPOS = [
    { t: 'Para abrir', est: 'Cocina y barra', plato: 'Ceviche Limeño', extra: 'Pisco Sour Acholado', extraTxt: 'Con un' },
    { t: 'Nikkei', est: 'Sushi', plato: 'Aroma Rolls' },
    { t: 'Del mar', est: 'Cocina', plato: 'Corvina Arcoiris' },
    { t: 'Al fuego', est: 'Parrilla', plato: 'Parrilla Especial' },
    { t: 'Final dulce', est: 'Postres', plato: 'Esfera Blanca de Chocohelado' },
  ].map(x => Object.assign(x, { ref: buscar(x.plato), ex: x.extra ? buscar(x.extra) : null })).filter(x => x.ref && x.ref.it.f);

  const sec = $('.n-tiempos'), stage = $('.n-stage'), stack = $('.n-plate__stack'), copy = $('.n-stage__copy');
  const steps = $('.n-steps'), ticks = $('.n-ring__ticks'), ghost = $('.n-ghost'), N = TIEMPOS.length;
  stack.innerHTML = TIEMPOS.map((x, i) => `<figure class="n-lit" style="z-index:${i + 1}"><img src="${x.ref.it.f}" alt="${esc(x.plato)}"${i > 1 ? ' loading="lazy"' : ''}></figure>`).join('');
  steps.innerHTML = TIEMPOS.map((x, i) => `<li><button type="button" data-j="${i}" aria-label="Tiempo ${ROM[i]}: ${esc(x.t)}"><b>${ROM[i]}</b><span>${esc(x.t)}</span></button></li>`).join('');
  ticks.innerHTML = TIEMPOS.map((x, i) => {
    const a = (i / N) * Math.PI * 2;
    return `<circle r="3.2" cx="${(100 + 98 * Math.cos(a)).toFixed(2)}" cy="${(100 + 98 * Math.sin(a)).toFixed(2)}"/>`;
  }).join('');
  const figs = $$('.n-lit', stack), tickEls = $$('circle', ticks), stepBtns = $$('button', steps);
  const ringProg = $('.n-ring__prog');

  function textoDe(i) {
    const x = TIEMPOS[i], it = x.ref.it;
    return {
      eye: `Tiempo ${ROM[i]} · ${x.est}`,
      name: it.n,
      desc: it.d || '',
      meta: `<b>${precio(it)}</b>` + (x.ex ? `<i>${esc(x.extraTxt)} ${esc(x.ex.it.n)} · ${precio(x.ex.it)}</i>` : ''),
    };
  }
  function ponerTexto(i) {
    const t = textoDe(i), m = $$('.n-mask > span', copy);
    m[0].textContent = t.eye; m[1].textContent = t.name; m[2].textContent = t.desc; m[3].innerHTML = t.meta;
    ghost.textContent = ROM[i];
  }
  let activo = -1, swapT = 0;
  function activar(i) {
    if (i === activo) return;
    const primero = activo < 0;
    activo = i;
    stepBtns.forEach((b, j) => j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'));
    tickEls.forEach((c, j) => c.classList.toggle('is-on', j <= i));
    if (primero || reduce) { ponerTexto(i); return; }
    clearTimeout(swapT);
    copy.classList.add('is-out');
    swapT = setTimeout(() => {
      ponerTexto(activo);
      copy.classList.add('is-pre'); copy.classList.remove('is-out');
      void copy.offsetWidth;
      copy.classList.remove('is-pre');
    }, 380);
  }

  function rango() {
    const r = sec.getBoundingClientRect();
    const total = sec.offsetHeight - stage.offsetHeight;
    return { r, total, p: clamp(-r.top / Math.max(1, total)) };
  }
  function escena() {
    const { p } = rango();
    const f = p * N;
    for (let j = 0; j < N; j++) {
      // cada plato se abre con un iris durante f ∈ [j-0.34, j]
      let o = j === 0 ? 1 : clamp((f - (j - .34)) / .34);
      if (reduce) o = j === 0 || f >= j - .17 ? 1 : 0;
      const e = ease(o);
      const next = j + 1 < N ? ease(clamp((f - (j + 1 - .34)) / .34)) : 0;
      const fig = figs[j];
      fig.style.clipPath = `circle(${(e * 72).toFixed(2)}% at 50% 50%)`;
      if (!reduce) {
        fig.style.transform = `scale(${(1.14 - .14 * e - .08 * next).toFixed(4)}) rotate(${(-12 * (1 - e)).toFixed(2)}deg)`;
        fig.style.opacity = (1 - .75 * next).toFixed(3);
      } else fig.style.opacity = next >= 1 ? 0 : 1;
      fig.style.visibility = e <= 0 || next >= 1 ? 'hidden' : 'visible';
    }
    ringProg.style.setProperty('--prog', p.toFixed(4));
    activar(Math.min(N - 1, Math.floor(f + .2)));
  }
  steps.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const j = +b.dataset.j, { r, total } = rango();
    const top = r.top + scrollY;
    scrollTo({ top: top + total * Math.min(1, (j + .02) / N) + (j ? 0 : 2), behavior: reduce ? 'auto' : 'smooth' });
  });
  $('.n-t-go').addEventListener('click', () => {
    const x = TIEMPOS[activo < 0 ? 0 : activo];
    cambiarGrupo(x.ref.g, () => {
      const el = abrir('n-s-' + x.ref.s);
      (el || carta).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* =====================================================================
     PRÓLOGO: palabras que se encienden con el scroll
     ===================================================================== */
  const mani = $('[data-mani]');
  const ESTS = /^(cocina|sushi|parrilla|barra|postres)[,]?$/i;
  mani.innerHTML = mani.textContent.trim().split(/\s+/).map(w => `<span class="w${ESTS.test(w) ? ' gold' : ''}">${esc(w)}</span>`).join(' ');
  const words = $$('.w', mani);
  function manifiesto() {
    const r = mani.getBoundingClientRect(), vh = innerHeight;
    const p = clamp((vh * .88 - r.top) / (r.height + vh * .4));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('is-on', i < n));
  }

  /* =====================================================================
     SALONES: el salón se abre como un iris
     ===================================================================== */
  const salon = $('.n-salones__media');
  function salones() {
    const r = salon.getBoundingClientRect(), vh = innerHeight;
    const p = clamp((vh - r.top) / (vh * .85));
    salon.style.setProperty('--sp', (1 - ease(p)).toFixed(4));
  }

  /* ---------- bucle de scroll ---------- */
  let pend = false;
  function frame() {
    pend = false;
    escena();
    if (!reduce) { manifiesto(); salones(); }
  }
  const pedir = () => { if (!pend) { pend = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir);
  frame();

  /* ---------- nav: sección actual ---------- */
  const navLinks = $$('.n-nav nav a');
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-cur', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['n-tiempos', 'n-carta', 'n-celebrar', 'n-salones', 'n-reserva'].forEach(id => { const el = document.getElementById(id); el && navIO.observe(el); });

  /* ---------- menú en celular ---------- */
  const burger = $('.n-burger'), menu = $('#n-menu');
  function menuSet(on) {
    burger.setAttribute('aria-expanded', String(on));
    burger.setAttribute('aria-label', on ? 'Cerrar menú' : 'Abrir menú');
    menu.hidden = !on;
    document.documentElement.classList.toggle('n-menu-on', on);
    if (on) $('a', menu).focus();
  }
  burger.addEventListener('click', () => menuSet(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) menuSet(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { menuSet(false); burger.focus(); } });
  movil.addEventListener('change', () => { if (!movil.matches && !menu.hidden) menuSet(false); });

  /* ---------- puntos del carrusel de celebrar ---------- */
  const cgrid = $('.n-cele__grid'), dots = $$('.n-dots i');
  cgrid.addEventListener('scroll', () => {
    const cards = $$('.n-card', cgrid), mid = cgrid.scrollLeft + cgrid.clientWidth / 2;
    let best = 0, d = 1e9;
    cards.forEach((c, i) => { const m = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (m < d) { d = m; best = i; } });
    dots.forEach((x, i) => x.classList.toggle('is-on', i === best));
  }, { passive: true });

  /* =====================================================================
     POLVO DORADO (solo en el hero y la escena)
     ===================================================================== */
  const cv = $('.n-dust');
  if (!reduce && cv.getContext) {
    const ctx = cv.getContext('2d');
    let W, H, pts = [], vivo = true, raf = 0;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => {
      W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
      pts = Array.from({ length: Math.round(Math.min(40, innerWidth / 30)) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.3 + .4) * dpr, v: (Math.random() * .22 + .05) * dpr, a: Math.random() * 6.28 }));
    };
    size(); addEventListener('resize', size);
    const tick = () => {
      if (!document.hidden && vivo) {
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#f1d79a';
        for (const q of pts) {
          q.y -= q.v; q.a += .008; q.x += Math.sin(q.a) * .25;
          if (q.y < -5) { q.y = H + 5; q.x = Math.random() * W; }
          ctx.globalAlpha = .22 + Math.sin(q.a * 2) * .16;
          ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const zonas = new Set();
    const dio = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? zonas.add(e.target) : zonas.delete(e.target));
      vivo = zonas.size > 0; cv.classList.toggle('is-off', !vivo);
    });
    [$('.n-hero'), sec].forEach(el => dio.observe(el));
    tick();
  } else if (cv) cv.remove();
})();
