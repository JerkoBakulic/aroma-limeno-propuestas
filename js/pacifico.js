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

  /* =============== los cinco tiempos: banda horizontal =============== */
  const T = $('.p-tiempos'), stage = $('.p-tiempos__stage');
  const track0 = $('.p-band__track'), mains = $$('.p-band__t[data-k]'), steps = $$('.p-step'), ticks = $$('.p-ticks li'), fills = $$('.p-ticks__f');
  const tickerT = $('.p-ticker__t'), bandN = $('.p-band__n b'), N = steps.length;
  const ROM = ['I', 'II', 'III', 'IV', 'V'];
  let target = 0, smooth = -1, activo = -1, raf = 0;
  function medir() {
    const r = T.getBoundingClientRect(), recorrido = T.offsetHeight - stage.offsetHeight;
    target = clamp((pTop() - r.top) / Math.max(1, recorrido)) * (N - .2);
  }
  function ticker(t) {
    const una = Array.from({ length: 4 }, () => `<span>${esc(t)}</span><span>·</span>`).join('');
    tickerT.innerHTML = una + una;
  }
  function pintarTiempos(c) {
    if (mains.length) {
      const t0 = mains[0], paso = mains[1] ? mains[1].offsetLeft - t0.offsetLeft : t0.offsetWidth;
      const x = innerWidth / 2 - (t0.offsetLeft + t0.offsetWidth / 2) - c * paso;
      track0.style.setProperty('--tx', `${x.toFixed(1)}px`);
    }
    steps.forEach((s, k) => {
      const l = c - k, en = k ? sstep(-.16, .06, l) : 1, ex = k < N - 1 ? sstep(.74, .90, l) : 0, o = en * (1 - ex);
      s.style.opacity = o.toFixed(4);
      s.style.transform = `translateX(${((1 - en) * 40 - ex * 40).toFixed(1)}px)`;
      s.style.visibility = o < .01 ? 'hidden' : 'visible';
    });
    fills.forEach((f, k) => f.style.setProperty('--f', clamp(c - k + .2).toFixed(3)));
    const a = clamp(Math.floor(c + .1), 0, N - 1);
    if (a !== activo) {
      activo = a;
      ticker(steps[a].dataset.ring);
      bandN.textContent = ROM[a] || '';
      ticks.forEach((tk, k) => tk.classList.toggle('is-on', k === a));
      mains.forEach((tl, k) => tl.classList.toggle('is-on', k === a));
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
    return `<li class="p-item${it.f ? ' has-th' : ''}" tabindex="0" role="button" aria-haspopup="dialog" style="--i:${Math.min(k, 24)}" data-f="${it.f || ''}" data-n="${esc(it.n)}" data-p="${esc(precio(it))}">
      ${donde ? `<span class="p-item__where">${esc(donde)}</span>` : ''}
      <span class="p-item__name">${hl(it.n)}${it.f ? '<i title="Con foto"></i>' : ''}</span><span class="p-item__price">${precio(it)}</span>
      ${desc ? `<p class="p-item__desc">${esc(desc)}</p>` : ''}
      <span class="p-item__more" aria-hidden="true">Ver detalle</span>
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

  /* =============== ficha del plato + calculadora =============== */
  const WA_NUM = '56944242444', AGIL = 'https://aromalimeno.getagil.com/pedir';
  const dish = $('.p-dish'), panel = $('.p-dish__panel');
  const todos = [];
  CARTA.forEach(g => g.s.forEach(s => s.items.forEach(it => todos.push({ it, g, s }))));
  const secAgr = (CARTA.find(g => g.k === 'cocina') || { s: [] }).s.find(s => norm(s.n) === 'agregados');
  const AGR = secAgr ? secAgr.items.map(i => ({ n: i.n.replace(/^Porción de /i, ''), p: i.p })) : [];
  const agr = re => AGR.find(a => re.test(norm(a.n)));
  /* acompañamientos que se reconocen en la descripción del plato → porción equivalente de la carta */
  const LADOS = [
    { re: /(acompanad[oa]s? (con|de)|con|y|,)\s+arroz(?! frito)/, a: /^arroz/, n: 'Arroz' },
    { re: /papas fritas/, a: /^papas fritas/, n: 'Papas fritas' },
    { re: /pure de papas|pure(?! de (camote|pallares))/, a: /^pure/, n: 'Puré de papas' },
    { re: /camote/, a: /^camote/, n: 'Camote' },
    { re: /\byucas?\b/, a: /^yuca/, n: 'Yuca' },
    { re: /verduras salteadas/, a: /^verduras/, n: 'Verduras salteadas' },
  ];
  const ladosDe = it => {
    const t = norm(it.d || '');
    return LADOS.filter(l => l.re.test(t)).map(l => ({ ...l, p: (agr(l.a) || {}).p })).filter(l => l.p);
  };
  /* versiones del mismo plato en la sección: «Arroz Chaufa de Pollo / de Carne / de Mariscos» */
  const baseDe = n => { const m = norm(n).match(/^(.+?) de (.+)$/); return m ? m[1] : null; };
  const variantesDe = (it, s) => {
    const b = baseDe(it.n); if (!b) return [];
    const v = s.items.filter(x => baseDe(x.n) === b && !x.p2);
    return v.length > 1 ? v : [];
  };
  const comida = g => g.k === 'cocina' || g.k === 'sushi';
  let ficha = null, origen = null;

  function abrirFicha(nombre) {
    const r = todos.find(x => x.it.n === nombre); if (!r) return;
    const { it, g, s } = r;
    const vars = comida(g) ? variantesDe(it, s) : [];
    const lados = comida(g) && norm(s.n) !== 'agregados' ? ladosDe(it) : [];
    const extras = comida(g) && norm(s.n) !== 'agregados' && g.k === 'cocina' ? AGR : [];
    ficha = { it, s, vars, lados, extras };
    const opt = (name, val, label, extra, chk, type = 'radio') =>
      `<label class="p-opt"><input type="${type}" name="${name}" value="${val}"${chk ? ' checked' : ''}><span>${esc(label)}${extra ? ` <small>${extra}</small>` : ''}</span></label>`;
    const dif = (a, b) => { const d = Math.max(0, a - b); return d ? '+' + clp(d) : 'sin costo'; };
    let calc = '';
    if (vars.length) calc += `<fieldset class="p-calc__g"><legend>Elige la proteína</legend><div class="p-opts">${vars.map((v, i) => opt('var', i, v.n.replace(new RegExp('^.+? de ', 'i'), ''), clp(v.p), v === it)).join('')}</div></fieldset>`;
    lados.forEach((l, k) => {
      calc += `<fieldset class="p-calc__g"><legend>Cambiar acompañamiento <em>${esc(l.n)}</em></legend><div class="p-opts">${opt('lado' + k, -1, 'Mantener ' + l.n.toLowerCase(), '', true)}${AGR.filter(a => !l.a.test(norm(a.n))).map(a => opt('lado' + k, AGR.indexOf(a), a.n, dif(a.p, l.p))).join('')}</div></fieldset>`;
    });
    if (extras.length) calc += `<fieldset class="p-calc__g"><legend>Agregar una porción</legend><div class="p-opts">${extras.map((a, i) => opt('extra', i, a.n, '+' + clp(a.p), false, 'checkbox')).join('')}</div></fieldset>`;
    const tieneCalc = !!calc;
    const desc = [it.d, it.x].filter(Boolean).join('. ');
    panel.innerHTML = `<button class="p-dish__x" type="button" data-cerrar aria-label="Cerrar"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6"/></svg></button>
      ${it.f ? `<figure class="p-dish__fig"><img src="${it.f}" alt="${esc(it.n)}"></figure>` : ''}
      <div class="p-dish__body">
        <p class="p-dish__sec">${esc(g.n)} · ${esc(s.n)}</p>
        <h2 id="p-dish-h">${esc(it.n)}</h2>
        ${desc ? `<p class="p-dish__desc">${esc(desc)}</p>` : ''}
        <p class="p-dish__base"><span>Precio en carta</span><b>${precio(it)}</b></p>
        ${tieneCalc ? `<form class="p-calc">${calc}
          <div class="p-calc__tot" aria-live="polite"><span>Total estimado</span><b class="p-calc__v"></b></div>
          <p class="p-calc__det"></p>
          <p class="p-calc__note">Precios de la carta vigente. Al cambiar un acompañamiento solo se cobra la diferencia si el nuevo cuesta más; confírmalo con tu garzón o al pedir.</p></form>` : ''}
        <div class="p-dish__acts">
          <a class="p-pill p-dish__wa" href="#" target="_blank" rel="noopener"><span class="p-pill__l">Consultar por WhatsApp</span><span class="p-pill__c" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></span></a>
          ${comida(g) || g.k === 'dulce' ? `<a class="p-link" href="${AGIL}" target="_blank" rel="noopener">Pedir delivery</a>` : ''}
        </div>
      </div>`;
    recalcular();
    origen = document.activeElement;
    dish.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => dish.classList.add('is-open')));
    panel.scrollTop = 0;
    panel.focus({ preventScroll: true });
  }
  function recalcular() {
    if (!ficha) return;
    const f = $('.p-calc', panel);
    let base = ficha.it, total = ficha.it.p2 ? null : ficha.it.p;
    const det = [];
    if (f) {
      const v = f.querySelector('input[name="var"]:checked');
      if (v) { base = ficha.vars[+v.value]; total = base.p; if (base !== ficha.it) det.push(base.n); }
      ficha.lados.forEach((l, k) => {
        const x = f.querySelector(`input[name="lado${k}"]:checked`);
        if (x && +x.value >= 0) { const a = AGR[+x.value]; total += Math.max(0, a.p - l.p); det.push(`${a.n.toLowerCase()} en vez de ${l.n.toLowerCase()}`); }
      });
      $$('input[name="extra"]:checked', f).forEach(x => { const a = AGR[+x.value]; total += a.p; det.push(`+ porción de ${a.n.toLowerCase()}`); });
      $('.p-calc__v', f).textContent = total == null ? precio(base) : clp(total);
      $('.p-calc__det', f).textContent = det.length ? det.join(' · ') : 'Tal como viene en la carta.';
    }
    const msg = `Hola Aroma Limeño, quiero consultar por: ${base.n}${det.filter(d => d !== base.n).length ? ' (' + det.filter(d => d !== base.n).join(', ') + ')' : ''}.${total != null ? ' Total estimado ' + clp(total) + '.' : ''}`;
    $('.p-dish__wa', panel).href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
  }
  function cerrarFicha() {
    if (dish.hidden) return;
    dish.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    const fin = () => { if (!dish.classList.contains('is-open')) dish.hidden = true; };
    reduce ? fin() : setTimeout(fin, 520);
    if (origen && origen.focus) origen.focus({ preventScroll: true });
    ficha = null;
  }
  panel.addEventListener('change', recalcular);
  panel.addEventListener('submit', e => e.preventDefault());
  dish.addEventListener('click', e => { if (e.target.closest('[data-cerrar]')) cerrarFicha(); });
  addEventListener('keydown', e => {
    if (dish.hidden) return;
    if (e.key === 'Escape') { cerrarFicha(); return; }
    if (e.key === 'Tab') {
      const fs = $$('button, a[href], input', panel).filter(x => x.offsetParent !== null);
      if (!fs.length) return;
      const a = fs[0], z = fs[fs.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === panel)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  page.addEventListener('click', e => {
    const li = e.target.closest('.p-item'); if (!li) return;
    abrirFicha(li.dataset.n);
  });
  page.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const li = e.target.closest('.p-item'); if (!li) return;
    e.preventDefault(); abrirFicha(li.dataset.n);
  });

  /* =============== reseñas =============== */
  const track = $('.p-res__track'), rb = $$('.p-res__b');
  if (track) {
    const paso = () => { const c = track.querySelector('.p-res__c'); return c ? c.offsetWidth + 20 : 300; };
    const estado = () => {
      rb[0].disabled = track.scrollLeft < 8;
      rb[1].disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    rb.forEach(b => b.addEventListener('click', () => track.scrollBy({ left: +b.dataset.d * paso(), behavior: reduce ? 'auto' : 'smooth' })));
    track.addEventListener('scroll', () => requestAnimationFrame(estado), { passive: true });
    addEventListener('resize', estado); estado();
  }

  /* =============== horario: hoy y «abierto ahora» (hora de Chile) =============== */
  const HORAS = { 0: ['12:30', '22:00'], 1: ['12:30', '23:15'], 2: ['12:30', '23:15'], 3: ['12:30', '23:15'], 4: ['12:30', '23:15'], 5: ['12:30', '23:45'], 6: ['12:30', '23:45'] };
  const now = $('.p-visit__now');
  function horario() {
    if (!now) return;
    let d, m;
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
      d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday); m = +p.hour * 60 + +p.minute;
    } catch (e) { const t = new Date(); d = t.getDay(); m = t.getHours() * 60 + t.getMinutes(); }
    const min = s => { const [h, mm] = s.split(':'); return +h * 60 + +mm; };
    const [a, c] = HORAS[d];
    $$('.p-visit__tabla div').forEach(x => x.classList.toggle('is-hoy', +x.dataset.d === d));
    const abierto = m >= min(a) && m < min(c);
    now.classList.toggle('is-open', abierto); now.classList.toggle('is-closed', !abierto);
    now.textContent = abierto ? `Abierto ahora · cierra a las ${c}` : (m < min(a) ? `Cerrado · abre hoy a las ${a}` : `Cerrado · abre mañana a las ${HORAS[(d + 1) % 7][0]}`);
  }
  horario(); setInterval(horario, 60000);
})();
