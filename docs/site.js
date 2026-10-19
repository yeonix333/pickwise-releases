'use strict';
(function () {
  const $ = s => document.querySelector(s);
  const REPO = 'yeonix333/pickwise-releases';
  // download counter: one per browser, so it counts people rather than clicks (free public counter, no cookies)
  const COUNTER = 'https://abacus.jasoncameron.dev';
  const NS = 'pickwise-ttls-site';

  /* ---------- latest version: button, size, what's new ---------- */
  const fmtMB = b => (b / 1048576).toFixed(1).replace('.', ',') + ' МБ';
  function applyVersion(v) {
    document.querySelectorAll('[data-ver]').forEach(e => { e.textContent = e.closest('.mono') && !e.closest('.dl-main') ? 'v' + v.version : v.version });
    const url = `https://github.com/${REPO}/raw/main/${v.exe}`;
    $('#dlBtn').href = url;
    if (v.notes) {
      const ul = $('#changeList'); ul.textContent = '';
      v.notes.split('\n').map(s => s.trim()).filter(s => s && !/^\[(обязательно|required)\]$/i.test(s)).slice(0, 6).forEach(s => { const li = document.createElement('li'); li.textContent = s; ul.appendChild(li) });
      $('#changes').hidden = false;
    }
    fetch(`https://api.github.com/repos/${REPO}/contents/${v.exe}?ref=main`, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => r.ok ? r.json() : null).then(j => { if (j && j.size) document.querySelectorAll('[data-size]').forEach(e => e.textContent = fmtMB(j.size)) }).catch(() => {});
  }
  fetch(`https://raw.githubusercontent.com/${REPO}/main/latest.json`, { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : null).then(v => { if (v && v.version && v.exe) applyVersion(v) }).catch(() => {});

  function once(key) { try { if (localStorage.getItem('pw.' + key)) return false; localStorage.setItem('pw.' + key, '1') } catch (e) {} return true }
  if (once('visit')) fetch(`${COUNTER}/hit/${NS}/visitors`).catch(() => {});
  $('#dlBtn').addEventListener('click', () => { if (once('dl')) fetch(`${COUNTER}/hit/${NS}/downloads`, { keepalive: true }).catch(() => {}) });

  /* ---------- the owl follows the cursor and blinks ---------- */
  const eyes = $('#owlEyes'), art = $('#heroArt'), lids = document.querySelectorAll('#owlLids rect');
  let raf = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => {
    if (!art) return; const r = art.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * .42;
    const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 300);
    tx = dx / d * 6 * k; ty = dy / d * 5 * k;
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; eyes.style.transform = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px)` });
  }, { passive: true });
  function blink() {
    lids.forEach(l => l.setAttribute('height', '60'));
    setTimeout(() => lids.forEach(l => l.setAttribute('height', '0')), 120);
    setTimeout(blink, 2500 + Math.random() * 4000);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(blink, 2200);

  /* ---------- how it works: four steps ---------- */
  const STEPS = [
    { n: '01', t: 'Клиент', d: 'Видит драфт, роли и препики тиммейтов.', tag: 'шаг 1 · подключение', title: 'Pickwise видит драфт вместе с тобой', text: 'Как только начался выбор чемпионов, программа читает его из клиента — без кликов и копирования.', rows: [['Ты', 'Сап · красная сторона', 'роль из клиента', '✓'], ['Д', 'Duo · бот · пати', 'премейд узнан', '✓'], ['18', 'Пик-фаза II', 'до твоего хода', '18 с']] },
    { n: '02', t: 'Баны', d: 'Кого банить под твой будущий пик.', tag: 'шаг 2 · баны', title: 'Бан под твой препик', text: 'Наведись на чемпиона — Pickwise покажет, кто опаснее всего именно для него на линии.', rows: [['ЛН', 'Леона', 'против Нами −4.1 · 2 300 игр', 'бан'], ['БЛ', 'Блицкранк', 'против Нами −3.2', 'бан'], ['НТ', 'Наутилус', 'популярен в мете', '−2.4']] },
    { n: '03', t: 'Пики', d: 'Контрпик, синергия и твой пул.', tag: 'шаг 3 · твой ход', title: 'Кого брать — и почему', text: 'Наводишь чемпиона — видишь его оценку и до трёх вариантов лучше, каждый с причинами.', rows: [['НМ', 'Нами', 'против Леоны +3.1 · твой мейн', '+5.2'], ['МЛ', 'Милио', 'надёжно вслепую', '+4.1'], ['ЛЛ', 'Лулу', 'синергия с Джинкс', '+3.4']] },
    { n: '04', t: 'Разбор', d: 'Что решило игру после матча.', tag: 'шаг 4 · после игры', title: 'Разбор по таймлайну', text: 'Где выиграли и проиграли линии, когда пошёл перевес по золоту, кто сколько дал команде.', rows: [['ТП', 'Топ выиграл линию', '+840 золота к 15-й', '✓'], ['ДР', 'Драконы', '3–1 в нашу пользу', '3–1'], ['БР', 'Барон на 26-й', 'решил игру', '✓']] }
  ];
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e };
  const stepsBox = $('#steps'), view = $('#stepView');
  let cur = 2, auto = null;
  STEPS.forEach((s, i) => {
    const b = el('button', 'step reveal'); b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'step' + i; b.setAttribute('aria-controls', 'stepView');
    b.append(el('span', 'n', s.n), el('b', '', s.t), el('span', 'd', s.d));
    b.addEventListener('click', () => { stopAuto(); show(i) });
    stepsBox.appendChild(b);
  });
  function show(i) {
    cur = i; const s = STEPS[i];
    stepsBox.querySelectorAll('.step').forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1 });
    view.setAttribute('aria-labelledby', 'step' + i); view.textContent = '';
    const t = el('div', 'sv-text'); t.append(el('span', 'mono muted', s.tag), el('b', '', s.title), el('span', '', s.text));
    const rows = el('div', 'sv-rows');
    s.rows.forEach(([ini, nm, why, v]) => { const r = el('div', 'sv-row'); const mid = el('span'); mid.append(el('b', 'nm', nm), el('small', '', why)); r.append(el('span', 'ini', ini), mid, el('b', 'v', v)); rows.appendChild(r) });
    view.append(t, rows);
  }
  stepsBox.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); const n = (cur + (e.key === 'ArrowRight' ? 1 : 3)) % 4; show(n); $('#step' + n).focus() } });
  function stopAuto() { if (auto) { clearInterval(auto); auto = null } }
  show(cur);

  /* ---------- themes: a fan of cards ---------- */
  const THEMES = [
    { name: 'Обычная', acc: '#e6e6e6', line: 'Неон, сова-талисман и озвучка пиков.', fx: 'звуки · озвучка' },
    { name: 'Бюро «Ваншэн»', acc: '#f08a6c', line: '«Хе-хе, вот это пик! Бюро может спать спокойно.»', fx: 'лепестки · огонь · визитки' },
    { name: 'Дуэль', acc: '#d8c27a', line: '«Выпад засчитан. Весы склоняются к вам.»', fx: 'весы · выстрел · клинок' },
    { name: 'Криминальный город', acc: '#9be34a', line: '«Чистая работа, приятель.»', fx: 'штампы · гильзы · досье' },
    { name: 'Герои', acc: '#e3b04b', line: '«Слава герою! Армия пойдёт за тобой.»', fx: 'флаги · монеты · три замка' }
  ];
  const fan = $('#fan'); let sel = 0;
  const cards = THEMES.map((t, i) => {
    const c = el('button', 'card'); c.type = 'button';
    const acc = el('span', 'acc'); acc.style.background = t.acc;
    c.append(el('span', 'no', String(i + 1).padStart(2, '0') + ' / 05'), el('b', '', t.name), acc, el('span', 'ln', t.line), el('span', 'fx', t.fx));
    c.addEventListener('click', () => layout(i)); fan.appendChild(c); return c;
  });
  function layout(s) {
    sel = s; const step = innerWidth < 600 ? 70 : innerWidth < 960 ? 110 : 150;
    // the deck stays spread around the centre; the chosen card rises and comes to the front
    const mid = (cards.length - 1) / 2;
    cards.forEach((c, i) => {
      const off = i - mid, on = i === s;
      c.style.transform = `translateX(${off * step}px) translateY(${on ? -34 : Math.abs(off) * 10}px) rotate(${on ? 0 : off * 6}deg) scale(${on ? 1.06 : .94})`;
      c.style.zIndex = String(on ? 20 : 10 - Math.abs(Math.round(off))); c.setAttribute('aria-pressed', String(on));
    });
  }
  layout(0); addEventListener('resize', () => layout(sel));

  /* ---------- reveal on scroll, bars fill when seen ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    e.target.querySelectorAll && e.target.querySelectorAll('[data-w]').forEach(b => b.style.width = b.dataset.w + '%');
  }), { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(e => io.observe(e));
  // the step cards cycle on their own until someone clicks one
  auto = setInterval(() => show((cur + 1) % 4), 4200);
})();
