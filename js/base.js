/* Base compartida: utilidades, selector de propuesta y reveal */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clp = n => '$' + Number(n).toLocaleString('es-CL');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const precio = it => it.p2 ? `${clp(it.p)} / ${clp(it.p2)}` : clp(it.p);
  const fotoSec = s => (s.items.find(i => i.f) || {}).f;

  /* ---- selector: la píldora parte desde la versión anterior y se desliza ---- */
  const thumb = $('.switcher__thumb');
  const btns = $$('.switcher__btn');
  const actual = root.dataset.version;
  function pos(v) {
    const b = btns.find(x => x.dataset.go === v); if (!b) return null;
    const t = b.parentElement.getBoundingClientRect(), r = b.getBoundingClientRect();
    return `translateX(${r.left - t.left}px) scaleX(${r.width / 10})`;
  }
  btns.forEach(b => b.setAttribute('aria-current', b.dataset.go === actual ? 'page' : 'false'));
  let previa = null;
  try { previa = sessionStorage.getItem('al-prev'); sessionStorage.removeItem('al-prev'); } catch (e) {}
  function colocar(animar) {
    const fin = pos(actual); if (!fin) return;
    const ini = previa && previa !== actual ? pos(previa) : null;
    if (animar && ini && !reduce) {
      thumb.style.transition = 'none'; thumb.style.transform = ini;
      requestAnimationFrame(() => requestAnimationFrame(() => { thumb.style.transition = ''; thumb.style.transform = fin; }));
    } else thumb.style.transform = fin;
  }
  colocar(true);
  addEventListener('resize', () => colocar(false));
  document.fonts && document.fonts.ready.then(() => colocar(false));
  btns.forEach(b => b.addEventListener('click', e => {
    if (b.dataset.go === actual) { e.preventDefault(); return; }
    try { sessionStorage.setItem('al-prev', actual); sessionStorage.setItem('al-xy', e.clientX + ',' + e.clientY); } catch (er) {}
  }));

  /* ---- scroll suave a anclas internas ---- */
  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  }));

  /* ---- reveal + títulos partidos ---- */
  $$('.split').forEach(h => {
    h.innerHTML = h.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
  });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .15 });
  $$('.reveal, .split').forEach(el => io.observe(el));
  requestAnimationFrame(() => $$('.split').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); }));

  window.AL = { $, $$, root, CARTA: window.CARTA || [], reduce, fino, clp, esc, precio, fotoSec };
})();
