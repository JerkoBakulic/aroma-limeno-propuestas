/* Aroma Limeño · Pacífico */
(() => {
  'use strict';
  const { $, $$, CARTA, reduce, fino, clp, esc, precio, fotoSec } = window.AL;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sstep = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); };
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const two = n => String(n).padStart(2, '0');
  const pTop = () => parseFloat(getComputedStyle($('.p-nav')).top) + $('.p-nav').offsetHeight;

  /* =============== manifiesto: palabra a palabra =============== */
  const mani = $('.p-mani__txt');
  (function partir(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.append(t);
          else { const s = document.createElement('span'); s.className = 'p-w'; s.textContent = t; frag.append(s); }
        });
        n.replaceWith(frag);
      } else partir(n);
    });
  })(mani);
  const words = $$('.p-w', mani);
  function maniScroll() {
    const r = mani.getBoundingClientRect();
    const prog = clamp((innerHeight * .82 - r.top) / (r.height + innerHeight * .25));
    const n = Math.round(prog * words.length * 1.12);
    words.forEach((w, i) => w.classList.toggle('is-on', i < n));
  }

  /* =============== texto circular que cierra exacto =============== */
  function ajustar(tp, C) {
    const txt = tp.closest('text'); if (!txt || !txt.getComputedTextLength) return;
    txt.style.letterSpacing = '0px'; txt.style.fontSize = '';
    const base = parseFloat(getComputedStyle(txt).fontSize) || 7;
    let len = txt.getComputedTextLength(); if (!len) return;
    const chars = tp.textContent.length;
    let fs = base;
    if (len > C * .86) { fs = Math.max(base * .7, base * C * .86 / len); txt.style.fontSize = fs + 'px'; len = txt.getComputedTextLength(); }
    txt.style.letterSpacing = Math.max(0, (C - len) / chars).toFixed(3) + 'px';
  }

  /* =============== sello que gira =============== */
  const stamp = $('.p-stamp');
  const fitStamp = () => ajustar($('.p-stamp textPath'), 2 * Math.PI * 46 - 2);
  fitStamp(); document.fonts && document.fonts.ready.then(() => { fitStamp(); activo = -1; onScroll(); });

  /* =============== la mesa en siete tiempos =============== */
  const T = $('.p-tiempos'), stage = $('.p-tiempos__stage');
  const layers = $$('.p-plate__l'), ghosts = $$('.p-ghost span'), steps = $$('.p-step'), ticks = $$('.p-ticks li');
  const ringT = $('.p-ring__t'), ringSvg = $('.p-ring'), N = steps.length;
  let target = 0, smooth = -1, activo = -1, raf = 0;
  function medir() {
    const r = T.getBoundingClientRect(), recorrido = T.offsetHeight - stage.offsetHeight;
    target = clamp((pTop() - r.top) / Math.max(1, recorrido)) * (N - .2);
  }
  function pintarTiempos(c) {
    layers.forEach((l, k) => {
      if (!k) return;
      const r = sstep(k - .24, k + .04, c);
      l.style.clipPath = `circle(${(r * 72).toFixed(2)}% at 50% 50%)`;
      const img = l.firstElementChild;
      img.style.setProperty('--r', `${((1 - r) * -18).toFixed(2)}deg`);
      img.style.setProperty('--s', ((k === 2 ? 1.35 : 1.2) - .14 * r).toFixed(4));
    });
    ghosts.forEach((g, k) => {
      const en = k ? sstep(k - .32, k + .04, c) : 1, ex = k < N - 1 ? sstep(k + .68, k + .98, c) : 0;
      g.style.opacity = (.075 * en * (1 - ex)).toFixed(4);
      g.style.transform = `translate(calc(-50% + ${((ex - (1 - en)) * -5).toFixed(2)}vw), -54%)`;
    });
    steps.forEach((s, k) => {
      const l = c - k, en = k ? sstep(-.16, .06, l) : 1, ex = k < N - 1 ? sstep(.74, .90, l) : 0, o = en * (1 - ex);
      s.style.opacity = o.toFixed(4);
      s.style.transform = `translateY(${((1 - en) * 40 - ex * 40).toFixed(1)}px)`;
      s.style.visibility = o < .01 ? 'hidden' : 'visible';
    });
    const a = clamp(Math.floor(c + .1), 0, N - 1);
    ringSvg.style.setProperty('--ring', `${(c * 34).toFixed(2)}deg`);
    if (a !== activo) {
      activo = a;
      const t = steps[a].dataset.ring;
      ringT.textContent = `${t} · ${t} ·`;
      ajustar(ringT, 2 * Math.PI * 93 - 3);
      if (!reduce) ringSvg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
      ticks.forEach((tk, k) => { tk.classList.toggle('is-on', k === a); tk.classList.toggle('was', k < a); });
    }
  }
  function loopTiempos() {
    raf = 0;
    smooth = (smooth < 0 || reduce) ? target : smooth + (target - smooth) * .12;
    if (Math.abs(target - smooth) < .0006) smooth = target;
    pintarTiempos(smooth);
    if (smooth !== target) raf = requestAnimationFrame(loopTiempos);
  }

  /* =============== lámina y casa =============== */
  const cols = $$('.p-col'), lam = $('.p-lamina'), casaImg = $('.p-casa__img img'), casa = $('.p-casa__img');
  function paralaje() {
    if (reduce) return;
    const vh = innerHeight;
    if (fino && innerWidth > 860) {
      const r = lam.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = clamp((vh - r.top) / (vh + r.height)) - .5;
        cols.forEach(c => c.style.setProperty('--y', `${(p * +c.dataset.drift * -110).toFixed(1)}px`));
      }
    }
    const rc = casa.getBoundingClientRect();
    if (rc.bottom > 0 && rc.top < vh) {
      const p = clamp((vh - rc.top) / (vh + rc.height));
      casaImg.style.setProperty('--py', `${(-8 + p * 8).toFixed(2)}%`);
    }
  }

  /* =============== scroll común =============== */
  let tick = false;
  function onScroll() {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      tick = false;
      maniScroll(); paralaje();
      if (stamp && !reduce) stamp.style.setProperty('--rot', `${(scrollY * .12).toFixed(1)}deg`);
      medir(); if (!raf) raf = requestAnimationFrame(loopTiempos);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* =============== la carta =============== */
  const tabs = $('.p-tabs'), bar = $('.p-tabs__bar'), page = $('.p-page'), toc = $('.p-toc');
  const arch = $('.p-arch'), aImgs = $$('.p-arch__img'), aWord = $('.p-arch__word'), aN = $('.p-arch__n'), aP = $('.p-arch__p');
  const q = $('#p-q'), qx = $('.p-search__x');
  const status = document.createElement('p'); status.className = 'sr'; status.setAttribute('aria-live', 'polite'); page.after(status);
  page.removeAttribute('aria-live'); page.setAttribute('role', 'tabpanel'); page.id = 'p-page'; page.tabIndex = -1;
  const cuenta = g => g.s.reduce((n, s) => n + s.items.length, 0);
  let G = 0, S = 0, consulta = '', capa = 0, actualSrc = '', turno = 0;
  const arrow = d => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${d > 0 ? 'M3 8h10M9 4l4 4-4 4' : 'M13 8H3M7 4L3 8l4 4'}" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;

  tabs.insertAdjacentHTML('beforeend', CARTA.map((g, i) =>
    `<button class="p-tab" role="tab" id="p-tab-${i}" aria-controls="p-page" data-i="${i}">${esc(g.n)}<sup>${cuenta(g)}</sup></button>`).join(''));
  const tabBtns = $$('.p-tab', tabs);
  function moverBarra() {
    const b = tabBtns[G]; if (!b) return;
    bar.style.transform = `translateX(${b.offsetLeft}px) scaleX(${b.offsetWidth / 10})`;
  }

  function lamina(lista) {
    if (!lista || !lista.items || !lista.items.length) return '';
    return `<span class="p-arch__k">${esc(lista.num)}</span><span class="p-arch__list">${lista.items.map((n, i) => `<span${i % 2 ? ' class="is-alt"' : ''}>${esc(n)}</span>`).join('')}</span>`;
  }
  function escena(src, nombre, pr, palabra, lista) {
    aN.textContent = nombre || ''; aP.textContent = pr || '';
    if (!src) {
      const html = lamina(lista);
      if (html) { aWord.innerHTML = html; aWord.classList.add('is-list'); }
      else { aWord.textContent = palabra || nombre || ''; aWord.classList.remove('is-list'); }
      arch.classList.add('is-word'); actualSrc = ''; aImgs.forEach(i => i.classList.remove('is-on')); return;
    }
    arch.classList.remove('is-word');
    if (src === actualSrc) return;
    actualSrc = src; capa = 1 - capa;
    const nueva = aImgs[capa], vieja = aImgs[1 - capa];
    const mostrar = () => { if (actualSrc !== src) return; nueva.classList.add('is-on'); vieja.classList.remove('is-on'); };
    nueva.classList.remove('is-on'); nueva.onload = null;
    if (nueva.getAttribute('src') === src && nueva.complete) requestAnimationFrame(mostrar);
    else { nueva.onload = mostrar; nueva.src = src; }
  }
  const listaSec = () => { const g = CARTA[G], s = g.s[S]; return { num: `${two(S + 1)} / ${two(g.s.length)}`, items: s.items.slice(0, 8).map(i => i.n) }; };
  function escenaSeccion() {
    const s = CARTA[G].s[S];
    escena(fotoSec(s), s.n, `${s.items.length} ${s.items.length === 1 ? 'opción' : 'opciones'}`, s.n, listaSec());
  }

  function itemHTML(it, k, donde, marcar) {
    const desc = [it.d, it.x].filter(Boolean).join('. ');
    const hl = t => { const e = esc(t); if (!marcar) return e; const i = norm(t).indexOf(marcar); return i < 0 ? e : esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + marcar.length)) + '</mark>' + esc(t.slice(i + marcar.length)); };
    return `<li class="p-item${it.f ? ' has-th' : ''}" tabindex="0" style="--i:${Math.min(k, 24)}" data-f="${it.f || ''}" data-n="${esc(it.n)}" data-p="${esc(precio(it))}">
      ${donde ? `<span class="p-item__where">${esc(donde)}</span>` : ''}
      <span class="p-item__name">${hl(it.n)}${it.f ? '<i title="Con foto"></i>' : ''}</span><span class="p-item__price">${precio(it)}</span>
      ${desc ? `<p class="p-item__desc">${esc(desc)}</p>` : ''}
      ${it.f ? `<img class="p-item__th" src="${it.f}" alt="" loading="lazy">` : ''}</li>`;
  }
  function vecino(d) {
    let g = G, s = S + d;
    if (s < 0) { g--; if (g < 0) return null; s = CARTA[g].s.length - 1; }
    if (s >= CARTA[g].s.length) { g++; if (g >= CARTA.length) return null; s = 0; }
    return { g, s };
  }
  function pintarTOC() {
    toc.hidden = !!consulta;
    if (consulta) return;
    toc.innerHTML = CARTA[G].s.map((s, i) => `<button type="button" data-s="${i}" aria-current="${i === S}"><b>${two(i + 1)}</b>${esc(s.n)}<small>${s.items.length}</small></button>`).join('');
    const act = toc.children[S];
    if (act) {
      if (innerWidth <= 1000) toc.scrollTo({ left: act.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
      else if (act.offsetTop < toc.scrollTop || act.offsetTop > toc.scrollTop + toc.clientHeight - 40) toc.scrollTop = act.offsetTop - 40;
    }
  }
  function pintarPagina() {
    tabBtns.forEach((b, i) => { const on = !consulta && i === G; b.setAttribute('aria-selected', String(on)); b.tabIndex = on || (consulta && !i) ? 0 : -1; });
    tabs.classList.toggle('is-search', !!consulta);
    if (consulta) {
      tabs.scrollTo({ left: 0 });
      const res = [];
      CARTA.forEach(g => g.s.forEach(s => s.items.forEach(it => { if (norm(it.n + ' ' + (it.d || '') + ' ' + (it.x || '')).includes(consulta)) res.push([it, `${g.n} · ${s.n}`]); })));
      page.removeAttribute('aria-labelledby');
      page.innerHTML = `<header class="p-page__head"><h3><small>Búsqueda</small>${res.length ? `${res.length} ${res.length === 1 ? 'resultado' : 'resultados'}` : 'Sin resultados'}</h3></header>
        ${res.length ? `<ul class="p-list">${res.map(([it, w], k) => itemHTML(it, k, w, consulta)).join('')}</ul>` : `<p class="p-empty">Prueba con otra palabra: ceviche, lomo, pisco, carmenere…</p>`}`;
      status.textContent = res.length ? `${res.length} resultados` : 'Sin resultados';
      const f = res.find(r => r[0].f);
      f ? escena(f[0].f, f[0].n, precio(f[0])) : escena('', 'Búsqueda', '', '¿Qué se te antoja?');
      pintarTOC(); return;
    }
    const g = CARTA[G], s = g.s[S], dos = s.items.length > 10 && s.items.filter(i => i.d && i.d.length > 50).length < 3;
    const prev = vecino(-1), next = vecino(1);
    page.setAttribute('aria-labelledby', `p-tab-${G}`);
    page.innerHTML = `<header class="p-page__head"><h3><small>${esc(g.n)}</small>${esc(s.n)}</h3><span class="p-page__n">Pág. ${two(S + 1)} / ${two(g.s.length)}</span></header>
      <ul class="p-list${dos ? ' p-list--dos' : ''}">${s.items.map((it, k) => itemHTML(it, k)).join('')}</ul>
      <footer class="p-page__foot">
        ${prev ? `<button class="p-turn p-turn--prev" type="button" data-d="-1">${arrow(-1)}<span><small>Anterior</small>${esc(CARTA[prev.g].s[prev.s].n)}</span></button>` : ''}
        ${next ? `<button class="p-turn p-turn--next" type="button" data-d="1"><span><small>Siguiente</small>${esc(CARTA[next.g].s[next.s].n)}</span>${arrow(1)}</button>` : ''}
      </footer><div class="p-page__shade" aria-hidden="true"></div>`;
    status.textContent = `${g.n}, ${s.n}, página ${S + 1} de ${g.s.length}`;
    escenaSeccion(); pintarTOC(); moverBarra();
  }
  function entrar() {
    if (reduce) return;
    page.animate([{ transform: 'rotateY(14deg) translateX(2%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 760, easing: 'cubic-bezier(.16,1,.3,1)' });
    const sh = $('.p-page__shade', page); sh && sh.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
    $$('.p-item', page).forEach((el, k) => el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 80 + Math.min(k, 24) * 22, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
  }
  let salida = null;
  function ir(g, s, foco, forzar) {
    if (g === G && s === S && !consulta && !forzar) return;
    const t = ++turno;
    const cambiar = () => {
      if (t !== turno) return;
      if (salida) { salida.cancel(); salida = null; }
      G = g; S = s; pintarPagina(); entrar();
      const top = $('.p-tabs').getBoundingClientRect().top;
      if (top < pTop() - 10 || top > innerHeight * .6) $('.p-tabs').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (foco) page.focus({ preventScroll: true });
    };
    if (reduce) return cambiar();
    if (salida) salida.cancel();
    salida = page.animate([{ transform: 'none', opacity: 1 }, { transform: 'rotateY(-24deg) translateX(-2%)', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    salida.onfinish = cambiar;
  }
  tabs.addEventListener('click', e => { const b = e.target.closest('.p-tab'); if (!b) return; const habia = !!consulta; limpiar(false); ir(+b.dataset.i, 0, false, habia); });
  tabs.addEventListener('keydown', e => {
    const i = tabBtns.indexOf(document.activeElement); if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % tabBtns.length; else if (e.key === 'ArrowLeft') n = (i - 1 + tabBtns.length) % tabBtns.length;
    else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabBtns.length - 1;
    if (n === null) return; e.preventDefault(); tabBtns[n].focus(); const habia = !!consulta; limpiar(false); ir(n, 0, false, habia);
  });
  toc.addEventListener('click', e => { const b = e.target.closest('button'); if (b) ir(G, +b.dataset.s); });
  page.addEventListener('click', e => { const b = e.target.closest('.p-turn'); if (!b) return; const v = vecino(+b.dataset.d); if (v) ir(v.g, v.s, true); });
  const ver = e => {
    const it = e.target.closest('.p-item'); if (!it) return;
    const s = consulta ? null : CARTA[G].s[S];
    escena(it.dataset.f || (s && fotoSec(s)) || '', it.dataset.n, it.dataset.p, s ? s.n : it.dataset.n, s ? listaSec() : null);
  };
  page.addEventListener('pointerover', ver);
  page.addEventListener('focusin', ver);
  page.addEventListener('pointerleave', () => { if (!consulta) escenaSeccion(); });

  /* búsqueda */
  let qt = 0;
  function buscar() {
    const v = norm(q.value.trim());
    qx.hidden = !q.value;
    const nueva = v.length >= 2 ? v : '';
    if (nueva === consulta) return;
    consulta = nueva; turno++; if (salida) { salida.cancel(); salida = null; } pintarPagina();
  }
  function limpiar(pintar = true) { if (!q.value && !consulta) return; q.value = ''; qx.hidden = true; consulta = ''; if (pintar) { turno++; if (salida) { salida.cancel(); salida = null; } pintarPagina(); } }
  q.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(buscar, 140); });
  q.addEventListener('keydown', e => { if (e.key === 'Escape') { limpiar(); } });
  qx.addEventListener('click', () => { limpiar(); q.focus(); });

  addEventListener('resize', moverBarra);
  document.fonts && document.fonts.ready.then(moverBarra);
  pintarPagina();

  /* lámina: precios reales y enlace a la carta */
  const buscarPlato = n => { for (const g of CARTA) for (const s of g.s) for (const it of s.items) if (norm(it.n).startsWith(norm(n))) return it; return null; };
  $$('.p-fig').forEach(a => {
    const it = buscarPlato(a.dataset.plato);
    if (it) $('b', a).textContent = precio(it);
    a.addEventListener('click', e => {
      e.preventDefault();
      q.value = a.dataset.plato; consulta = ''; buscar();
      $('#p-carta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
