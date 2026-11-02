(function () {
'use strict';

/* ───────── helpers ───────── */
const KEY = 'thuchi.v1';
const $ = s => document.querySelector(s);
const $app = $('#app'), $view = $('#view'), $title = $('#title'),
      $sheet = $('#sheet'), $scrim = $('#scrim'), $toast = $('#toast');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const norm = s => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/đ/g, 'd');

const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); };
const monthOf = s => s.slice(0, 7);
const shiftMonth = (m, n) => { const [y, mo] = m.split('-').map(Number); const d = new Date(y, mo - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const monthLabel = m => { const [y, mo] = m.split('-').map(Number); return `${MONTHS[mo - 1]} ${y}`; };
const daysInMonth = m => { const [y, mo] = m.split('-').map(Number); return new Date(y, mo, 0).getDate(); };
const relDate = s => {
  if (s === today()) return 'Today';
  if (s === addDays(today(), -1)) return 'Yesterday';
  const d = parseD(s); return `${d.getDate()} ${MON[d.getMonth()]}`;
};
const dayHeader = s => {
  if (s === today()) return 'Today';
  if (s === addDays(today(), -1)) return 'Yesterday';
  const d = parseD(s); return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
};

const fmtN = n => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const money = n => (n < 0 ? '-' : '') + S.settings.currency + fmtN(n);
const compact = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n));

function parseAmt(str) {
  const s = String(str).toLowerCase().replace(/\s/g, '');
  const m = s.match(/^([\d.,]+)(k|m|tr)$/);
  if (m) {
    const n = parseFloat(m[1].replace(',', '.'));
    return Math.round(n * (m[2] === 'k' ? 1e3 : 1e6)) || 0;
  }
  return parseInt(s.replace(/\D/g, ''), 10) || 0;
}

/* ───────── icons ───────── */
const leaves = '<ellipse cx="4.2" cy="6.2" rx="1.5" ry="3" transform="rotate(-30 4.2 6.2)"/><ellipse cx="3.6" cy="11.4" rx="1.5" ry="3" transform="rotate(-8 3.6 11.4)"/><ellipse cx="5.4" cy="16.4" rx="1.5" ry="3" transform="rotate(22 5.4 16.4)"/>';
const IC = {
  health: '<rect x="3" y="7" width="18" height="13" rx="3.5" fill="currentColor" stroke="none"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M12 10.5v6M9 13.5h6" stroke="#1d1f1d" stroke-width="2.2"/>',
  shopping: '<path d="M5 8.5h14l-.9 11.5H5.9z" fill="currentColor" stroke="none"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  food: '<path d="M7 3v7M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10"/><path d="M17.5 21V3c-2.2 1.6-3 4.2-3 7.5h3"/>',
  groceries: '<path d="M3 4h2.5l2 11h10l2-8H7"/><circle cx="9" cy="19.5" r="1.4" fill="currentColor"/><circle cx="17" cy="19.5" r="1.4" fill="currentColor"/>',
  transport: '<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 12h14M8 21v-3M16 21v-3"/><circle cx="8.5" cy="15" r=".7" fill="currentColor"/><circle cx="15.5" cy="15" r=".7" fill="currentColor"/>',
  bills: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  other: '<circle cx="6" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="12" r="1.6" fill="currentColor"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  'chev-d': '<path d="M6 9l6 6 6-6"/>',
  'chev-r': '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  tag: '<path d="M3 11.5V4h7.5L21 14.5 14.5 21z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M3 10h18"/>',
  cal: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  lines: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  laurel: `<g fill="currentColor" stroke="none">${leaves}</g><path d="M12 21c-5-1.3-8-5-8-10"/><g transform="translate(24 0) scale(-1 1)"><g fill="currentColor" stroke="none">${leaves}</g><path d="M12 21c-5-1.3-8-5-8-10"/></g>`
};
const icon = (n, cls = '') => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${IC[n] || IC.other}</svg>`;
const ICON_CHOICES = ['health', 'shopping', 'food', 'groceries', 'transport', 'bills', 'home', 'star', 'other'];
const COLORS = ['#b98a86', '#a3b18a', '#c9a66b', '#84a99c', '#9a98c4', '#c98fa8', '#8fb0c9', '#c4b17a', '#b5654f', '#9a9b92'];

/* ───────── data ───────── */
const DEFAULT_CATS = [
  { id: 'health', name: 'Health', color: '#b98a86', icon: 'health' },
  { id: 'shopping', name: 'Shopping', color: '#a3b18a', icon: 'shopping' },
  { id: 'food', name: 'Food & Drink', color: '#c9a66b', icon: 'food' },
  { id: 'groceries', name: 'Groceries', color: '#84a99c', icon: 'groceries' },
  { id: 'transport', name: 'Transport', color: '#9a98c4', icon: 'transport' },
  { id: 'bills', name: 'Bills', color: '#8fb0c9', icon: 'bills' },
  { id: 'other', name: 'Other', color: '#9a9b92', icon: 'other' }
];
function defaults() {
  const now = new Date().toISOString();
  return {
    version: 2,
    settings: { currency: 'đ', monthlyBudget: 4500000, paymentMethods: ['Cash', 'Card', 'Bank Transfer', 'Other'], tone: true, lastBackup: null, lastPromptMonth: null, lastCat: null, lastMethod: null, updated_at: now, pending: true },
    categories: DEFAULT_CATS.map(c => ({ ...c, deleted: false, updated_at: now, pending: true })),
    expenses: []
  };
}
const validExp = e => e && typeof e === 'object' && isFinite(+e.amount) && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '');
function migrate(j) {
  const d = defaults();
  const now = new Date().toISOString();
  const o = {
    version: 2,
    settings: {
      ...d.settings, ...(j.settings || {}),
      updated_at: (j.settings && j.settings.updated_at) || now,
      pending: !(j.settings && j.settings.pending === false)
    },
    categories: Array.isArray(j.categories) && j.categories.length ? j.categories.filter(c => c && c.id && c.name).map(c => ({
      id: String(c.id), name: String(c.name), color: c.color || '#9a9b92', icon: c.icon || 'other',
      deleted: !!c.deleted, updated_at: c.updated_at || now, pending: c.pending !== false
    })) : d.categories,
    expenses: (Array.isArray(j.expenses) ? j.expenses : []).filter(validExp).map(e => ({
      id: String(e.id || uid()), title: String(e.title || ''), amount: Math.round(+e.amount),
      categoryId: e.categoryId || 'other', method: e.method || '', date: e.date, note: String(e.note || ''), ts: +e.ts || 0,
      deleted: !!e.deleted, updated_at: e.updated_at || now, pending: e.pending !== false
    }))
  };
  if (!Array.isArray(o.settings.paymentMethods) || !o.settings.paymentMethods.length) o.settings.paymentMethods = d.settings.paymentMethods;
  const legacyMethods = ['Cash', 'Bank', 'Card'];
  if (o.settings.paymentMethods.length === 3 && legacyMethods.every((m, i) => o.settings.paymentMethods[i] === m)) o.settings.paymentMethods = d.settings.paymentMethods.slice();
  o.expenses.forEach(e => { if (e.method === 'Bank' && !o.settings.paymentMethods.includes('Bank')) e.method = 'Bank Transfer'; });
  if (!o.categories.length) o.categories = d.categories;
  return o;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const j = JSON.parse(raw);
      if (j && typeof j === 'object') {
        const m = migrate(j);
        try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (_) {}
        return m;
      }
    }
  } catch (e) { /* fall through */ }
  return defaults();
}
let S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Could not save — storage is full or blocked'); }
}

const catOf = id => S.categories.find(c => c.id === id) || { id: 'other', name: 'Other', color: '#9a9b92', icon: 'other' };
const sum = a => a.reduce((t, e) => t + e.amount, 0);
const live = a => a.filter(x => !x.deleted);
const liveCats = () => S.categories.filter(c => !c.deleted);
const stamp = () => new Date().toISOString();
const touchExp = e => { e.pending = true; e.updated_at = stamp(); };
const touchCat = c => { c.pending = true; c.updated_at = stamp(); };
const touchSettings = () => { S.settings.pending = true; S.settings.updated_at = stamp(); };
const inMonth = m => S.expenses.filter(e => !e.deleted && monthOf(e.date) === m);
const sorted = a => [...a].sort((x, y) => y.date.localeCompare(x.date) || y.ts - x.ts);
const titleOf = e => e.title || catOf(e.categoryId).name;

/* ───────── ui state ───────── */
const ui = {
  route: 'overview', compact: false, month: monthOf(today()), range: 6,
  f: { q: '', cat: null, method: null, date: { type: 'all' } }
};
const route = () => { const h = (location.hash || '').replace('#/', ''); return V[h] ? h : 'overview'; };
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);

/* ───────── views ───────── */
function tile(c) { return `<span class="tile" style="background:${c.color}2e;color:${c.color}">${icon(c.icon)}</span>`; }

function vOverview() {
  const m = ui.month, ex = inMonth(m), total = sum(ex), t = today();
  const tS = sum(S.expenses.filter(e => !e.deleted && e.date === t));
  const yS = sum(S.expenses.filter(e => !e.deleted && e.date === addDays(t, -1)));
  const b = S.settings.monthlyBudget, pct = b > 0 ? total / b * 100 : 0;
  let html = '';

  if (isIOS && !standalone() && !localStorage.getItem('thuchi.hint')) {
    html += `<div class="hint">Install: tap <b>Share</b> → <b>Add to Home Screen</b>, then open Olympus Finance from the new icon and enter your data there.<button data-act="hint-x" aria-label="Dismiss">✕</button></div>`;
  }

  html += `<div class="card hero" id="hero">
    <div class="label">Spent this month</div>
    <div class="amount">${money(total)}</div>
    <div class="count">${ex.length} expense${ex.length === 1 ? '' : 's'}</div>
    <div class="pill">
      <div><div class="l">Yesterday</div><div class="v ${yS ? '' : 'none'}">${yS ? money(yS) : 'No spending'}</div></div>
      <div><div class="l">Today</div><div class="v ${tS ? '' : 'none'}">${tS ? money(tS) : 'No spending'}</div></div>
    </div></div><div class="meander"></div>`;

  if (b > 0) {
    const left = b - total;
    const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : '';
    let tone = '';
    if (S.settings.tone) {
      if (pct >= 100) tone = `<div class="tone">Hubris. The budget is breached.</div>`;
      else if (pct < 80) tone = `<div class="tone">${icon('laurel', 'laurel')} The gods smile upon your purse.</div>`;
    }
    html += `<div class="card budget" data-act="budget" role="button" tabindex="0">
      <div class="row-h"><h3>Budget</h3><span class="nums">${money(total)} · ${money(b)}</span></div>
      <div class="bar"><i class="${cls}" style="width:${Math.min(100, pct)}%"></i></div>
      <div class="left">${left >= 0 ? money(left) + ' left' : money(-left) + ' over'}</div>${tone}</div>`;
  } else {
    html += `<div class="card budget" data-act="budget" role="button" tabindex="0"><div class="row-h"><h3>Budget</h3><span class="nums">Tap to set</span></div></div>`;
  }

  if (!ex.length) {
    html += `<div class="card"><div class="empty">${S.settings.tone ? 'The oracle sees no spending.' : 'No expenses yet.'}</div></div>`;
    return html;
  }

  const by = {};
  ex.forEach(e => { by[e.categoryId] = (by[e.categoryId] || 0) + e.amount; });
  const rows = Object.entries(by).sort((a, b2) => b2[1] - a[1]);
  html += `<div class="card"><h3 style="margin-bottom:6px">Categories</h3>` + rows.map(([id, amt]) => {
    const c = catOf(id);
    return `<div class="cat-row" data-act="month-cat" data-cat="${esc(id)}" role="button" tabindex="0">
      <div class="top"><span style="color:${c.color};display:flex">${icon(c.icon, 'ic')}</span><span class="nm">${esc(c.name)}</span><span class="am">${money(amt)}</span>${icon('chev-r', 'ch')}</div>
      <div class="bar"><i style="width:${(amt / total * 100).toFixed(1)}%;background:${c.color}"></i></div></div>`;
  }).join('') + `</div>`;

  const recent = sorted(live(S.expenses)).slice(0, 5);
  html += `<div class="card"><div class="card-head"><h3>Recent</h3><a class="link" href="#/history" data-act="all-hist">All</a></div>` +
    recent.map(e => {
      const c = catOf(e.categoryId);
      return `<div class="item" data-act="edit" data-id="${e.id}" role="button" tabindex="0">${tile(c)}
        <div class="mid"><div class="t">${esc(titleOf(e))}</div><div class="s">${esc(c.name)} · ${relDate(e.date)}</div></div>
        <div class="a">${money(e.amount)}</div></div>`;
    }).join('') + `</div>`;
  return html;
}

/* history */
function inDate(d, r) {
  switch (r.type) {
    case 'month': return monthOf(d) === r.month;
    case '7d': return d >= addDays(today(), -6);
    case '30d': return d >= addDays(today(), -29);
    case 'range': return (!r.from || d >= r.from) && (!r.to || d <= r.to);
    default: return true;
  }
}
function dateLabel() {
  const r = ui.f.date;
  if (r.type === 'month') { const [y, mo] = r.month.split('-').map(Number); return `${MON[mo - 1]} ${y}`; }
  if (r.type === '7d') return 'Last 7 days';
  if (r.type === '30d') return 'Last 30 days';
  if (r.type === 'range') {
    const f = x => { if (!x) return '…'; const d = parseD(x); return `${d.getDate()} ${MON[d.getMonth()]}`; };
    return `${f(r.from)} – ${f(r.to)}`;
  }
  return 'Date';
}
function filtered() {
  const f = ui.f, q = norm(f.q.trim());
  return sorted(live(S.expenses).filter(e => {
    if (f.cat && e.categoryId !== f.cat) return false;
    if (f.method && e.method !== f.method) return false;
    if (!inDate(e.date, f.date)) return false;
    if (q && !norm(`${e.title} ${e.note} ${catOf(e.categoryId).name} ${e.method}`).includes(q)) return false;
    return true;
  }));
}
function hlist() {
  const list = filtered();
  if (!list.length) return `<div class="empty">${S.expenses.length ? 'Nothing matches.' : (S.settings.tone ? 'The oracle sees no spending.' : 'No expenses yet.')}</div>`;
  const groups = [];
  list.forEach(e => {
    const g = groups[groups.length - 1];
    if (g && g.date === e.date) g.items.push(e); else groups.push({ date: e.date, items: [e] });
  });
  return groups.map(g => `<div class="day"><span>${dayHeader(g.date)}</span><span>${money(sum(g.items))}</span></div>
    <div class="card list">${g.items.map(e => {
      const c = catOf(e.categoryId);
      return `<div class="item" data-act="edit" data-id="${e.id}" role="button" tabindex="0">${tile(c)}
        <div class="mid"><div class="t">${esc(titleOf(e))}</div><div class="s">${esc(c.name)}</div></div>
        <div class="a">${money(e.amount)}</div></div>`;
    }).join('')}</div>`).join('');
}
function vHistory() {
  const f = ui.f;
  return `<h1 class="page">History</h1>
    <label class="search">${icon('search')}<input id="q" type="search" placeholder="Titles, notes, and categories" value="${esc(f.q)}" autocomplete="off" autocapitalize="off" enterkeyhint="search"></label>
    <div class="chips">
      <button class="chip ${f.date.type !== 'all' ? 'on' : ''}" data-act="f-date">${esc(dateLabel())} ${icon('chev-d')}</button>
      <button class="chip ${f.cat ? 'on' : ''}" data-act="f-cat">${esc(f.cat ? catOf(f.cat).name : 'Category')} ${icon('chev-d')}</button>
      <button class="chip ${f.method ? 'on' : ''}" data-act="f-method">${esc(f.method || 'Payment Method')} ${icon('chev-d')}</button>
    </div>
    <div id="hlist">${hlist()}</div>`;
}

/* analytics */
function vAnalytics() {
  const m = ui.month, ex = inMonth(m), total = sum(ex);
  const pm = shiftMonth(m, -1), prev = sum(inMonth(pm));
  let delta;
  if (!prev) delta = `No spending in ${MONTHS[+pm.slice(5) - 1]}`;
  else {
    const p = Math.round((total - prev) / prev * 100);
    delta = `<b class="${p > 0 ? 'up' : ''}">${p > 0 ? '▲' : '▼'} ${Math.abs(p)}%</b> vs ${MONTHS[+pm.slice(5) - 1]}`;
  }
  let html = `<h1 class="page">Analytics</h1>
    <div class="segwrap">${[3, 6, 12].map(n => `<button class="seg ${ui.range === n ? 'on' : ''}" data-n="${n}">${n} mo</button>`).join('')}</div>
    <div class="card"><div class="label">Total · ${monthLabel(m)}</div><div class="big-cmp">${money(total)}</div><div class="delta">${delta}</div></div>`;
  if (!ex.length) return html + `<div class="card"><div class="empty">${S.settings.tone ? 'The oracle sees no spending.' : 'No expenses this month.'}</div></div>`;

  const by = {};
  ex.forEach(e => { by[e.categoryId] = (by[e.categoryId] || 0) + e.amount; });
  const rows = Object.entries(by).sort((a, b) => b[1] - a[1]);
  let off = 0;
  const segs = rows.map(([id, amt]) => {
    const pct = amt / total * 100, c = catOf(id);
    const s = `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${c.color}" stroke-width="6" stroke-dasharray="${Math.max(0, pct - (rows.length > 1 ? 0.8 : 0)).toFixed(2)} ${(100 - Math.max(0, pct - (rows.length > 1 ? 0.8 : 0))).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`;
    off += pct; return s;
  }).join('');
  html += `<div class="card"><h3>By category</h3><div class="donut-wrap">
    <svg viewBox="0 0 42 42" aria-hidden="true"><g transform="rotate(-90 21 21)">${segs}</g><text x="21" y="22.5" text-anchor="middle" font-size="5" fill="#f1ece1" stroke="none" font-weight="600">${compact(total)}</text></svg>
    <div class="legend">${rows.map(([id, amt]) => { const c = catOf(id); return `<div><i style="background:${c.color}"></i><span>${esc(c.name)}</span><em>${Math.round(amt / total * 100)}%</em></div>`; }).join('')}</div></div></div>`;

  const months = [];
  for (let i = ui.range - 1; i >= 0; i--) { const mm = shiftMonth(m, -i); months.push({ mm, t: sum(inMonth(mm)) }); }
  const mx = Math.max(1, ...months.map(x => x.t));
  html += `<div class="card"><h3>Last ${ui.range} months</h3><div class="bars">${months.map(x =>
    `<div class="${x.mm === m ? 'cur' : ''}"><em>${x.t ? compact(x.t) : ''}</em><i style="height:${Math.max(4, Math.round(x.t / mx * 96))}px"></i><small>${MON[+x.mm.slice(5) - 1]}</small></div>`).join('')}</div></div>`;

  const days = m === monthOf(today()) ? new Date().getDate() : daysInMonth(m);
  const top = [...ex].sort((a, b) => b.amount - a.amount).slice(0, 3);
  html += `<div class="card"><div class="two">
      <div><div class="label">Daily average</div><div class="v">${money(total / days)}</div></div>
      <div><div class="label">Expenses</div><div class="v">${ex.length}</div></div></div></div>
    <div class="card"><h3 style="margin-bottom:4px">Biggest expenses</h3>${top.map(e => {
      const c = catOf(e.categoryId);
      return `<div class="item" data-act="edit" data-id="${e.id}" role="button" tabindex="0">${tile(c)}<div class="mid"><div class="t">${esc(titleOf(e))}</div><div class="s">${esc(c.name)} · ${relDate(e.date)}</div></div><div class="a">${money(e.amount)}</div></div>`;
    }).join('')}</div>`;
  return html;
}

/* settings */
function vSettings() {
  const s = S.settings;
  const days = s.lastBackup ? Math.floor((Date.now() - s.lastBackup) / 864e5) : null;
  const liveCount = live(S.expenses).length;
  const stale = liveCount && (days === null || days > 14);
  const bk = s.lastBackup ? `Last backup: ${(() => { const d = new Date(s.lastBackup); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; })()}` : 'No backup yet';
  return `<h1 class="page">Settings</h1><div class="meander"></div>
  <div class="label set-sec">Budget</div>
  <div class="card list">
    <div class="set-row" data-act="budget" role="button"><span>Monthly budget</span><span class="v">${s.monthlyBudget ? money(s.monthlyBudget) : 'Not set'}</span></div>
    <div class="set-row" data-act="currency" role="button"><span>Currency symbol</span><span class="v">${esc(s.currency)}</span></div>
  </div>
  <div class="label set-sec">Categories</div>
  <div class="card list">
    ${liveCats().map(c => `<div class="set-row" data-act="cat-edit" data-id="${esc(c.id)}" role="button"><span style="display:flex;gap:12px;align-items:center"><i class="dot" style="background:${c.color}"></i>${esc(c.name)}</span><span class="v">${S.expenses.filter(e => !e.deleted && e.categoryId === c.id).length}</span></div>`).join('')}
    <div class="set-row" data-act="cat-edit" role="button" style="color:var(--gold)"><span>+ Add category</span></div>
  </div>
  <div class="label set-sec">Payment methods</div>
  <div class="card list">
    ${s.paymentMethods.map(m => `<div class="set-row" data-act="m-edit" data-m="${esc(m)}" role="button"><span>${esc(m)}</span><span class="v">${S.expenses.filter(e => !e.deleted && e.method === m).length}</span></div>`).join('')}
    <div class="set-row" data-act="m-edit" role="button" style="color:var(--gold)"><span>+ Add method</span></div>
  </div>
  <div class="label set-sec">Cloud sync</div>
  <div class="card list">${cloudSection()}</div>
  <div class="label set-sec">Backup</div>
  <div class="card list">
    <div class="set-row" style="display:block"><div>${bk}</div><div class="v" style="margin-top:2px">${liveCount} expenses stored on this device</div>${stale ? '<div class="warn-chip">Back up now — iOS can clear app data</div>' : ''}</div>
    <div class="set-row" data-act="export-json" role="button"><span>Export backup (JSON)</span><span class="v">Share / Files</span></div>
    <div class="set-row" data-act="export-csv" role="button"><span>Export CSV</span><span class="v">Excel</span></div>
    <div class="set-row" data-act="import" role="button"><span>Import backup</span><span class="v">JSON</span></div>
  </div>
  <div class="label set-sec">Other</div>
  <div class="card list">
    <div class="set-row" data-act="tone" role="button"><span>Oracle messages</span><span class="v">${s.tone ? 'On' : 'Off'}</span></div>
    <div class="set-row" data-act="demo" role="button"><span>Load demo data</span></div>
    <div class="set-row danger" data-act="clear" role="button"><span>Clear all data</span></div>
  </div>
  <input type="file" id="file" accept="application/json,.json" hidden>
  <div class="foot">Know thyself. Count thy coin.</div>`;
}

const V = { overview: vOverview, history: vHistory, analytics: vAnalytics, settings: vSettings };

/* ───────── render ───────── */
function setTitle() {
  const r = ui.route;
  if (r !== 'overview') { $title.textContent = ''; return; }
  const compactOn = r === 'overview' && ui.compact;
  $title.className = 'title' + (compactOn ? ' compact' : '');
  $title.textContent = monthLabel(ui.month);
  if (compactOn) {
    const small = document.createElement('small');
    small.textContent = ' · ' + money(sum(inMonth(ui.month)));
    $title.appendChild(small);
  }
}
function updateCompact() {
  if (ui.route !== 'overview') {
    if (ui.compact) { ui.compact = false; setTitle(); }
    return;
  }
  const hero = $('#hero'); if (!hero) return;
  const c = hero.getBoundingClientRect().bottom < $('#topbar').offsetHeight + 4;
  if (c !== ui.compact) { ui.compact = c; setTitle(); }
}
function render(keep) {
  const r = ui.route = route();
  const sc = keep ? $view.scrollTop : 0;
  $app.classList.toggle('no-top', r === 'history' || r === 'settings' || r === 'analytics');
  $app.classList.toggle('no-fab', r === 'settings' || r === 'analytics');
  document.querySelectorAll('#tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === r));
  $view.innerHTML = V[r]();
  if (r === 'history') {
    const q = $('#q');
    q.addEventListener('input', () => { ui.f.q = q.value; $('#hlist').innerHTML = hlist(); });
  }
  if (r === 'settings') {
    $('#file').addEventListener('change', onImportFile);
  }
  if (r === 'analytics') {
    document.querySelectorAll('.seg').forEach(b => b.onclick = () => { ui.range = +b.dataset.n; render(true); });
  }
  $view.scrollTop = sc;
  updateCompact();
  setTitle();
}
window.addEventListener('hashchange', () => render(false));
$view.addEventListener('scroll', () => {
  if (ui.route !== 'overview') return;
  updateCompact();
}, { passive: true });
$('#prev').onclick = () => { ui.month = shiftMonth(ui.month, -1); render(false); };
$('#next').onclick = () => { ui.month = shiftMonth(ui.month, 1); render(false); };

/* ───────── toast & sheets ───────── */
let tt;
function toast(msg, o = {}) {
  clearTimeout(tt);
  $toast.innerHTML = `<span>${esc(msg)}</span>${o.action ? `<button id="ta">${esc(o.action)}</button>` : ''}`;
  $toast.hidden = false;
  if (o.action) $('#ta').onclick = () => { $toast.hidden = true; o.fn && o.fn(); };
  if (o.ms !== 0) tt = setTimeout(() => { $toast.hidden = true; }, o.ms || 4000);
}
function fitSheet() {
  const vv = window.visualViewport; if (!vv || $sheet.hidden) return;
  const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  $sheet.style.bottom = kb + 'px';
  $sheet.style.maxHeight = (vv.height - 16) + 'px';
}
if (window.visualViewport) {
  visualViewport.addEventListener('resize', fitSheet);
  visualViewport.addEventListener('scroll', fitSheet);
}
$sheet.addEventListener('focusin', e => {
  if (!/INPUT|TEXTAREA/.test(e.target.tagName)) return;
  setTimeout(() => { try { e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (_) {} }, 320);
});
function openSheet(html) {
  $sheet.innerHTML = '<div class="grab"></div>' + html;
  $scrim.hidden = false; $sheet.hidden = false; $sheet.scrollTop = 0;
  fitSheet();
}
function closeSheet() {
  $sheet.hidden = true; $scrim.hidden = true; $sheet.innerHTML = '';
  $sheet.style.bottom = ''; $sheet.style.maxHeight = '';
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}
$scrim.addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$sheet.hidden) closeSheet(); });

function pickSheet(title, opts, current, onPick) {
  openSheet(`<div class="sheet-t">${esc(title)}</div>` + opts.map((o, i) =>
    `<button class="opt ${o.v === current ? 'on' : ''}" data-i="${i}"><span>${esc(o.l)}</span><span>${o.v === current ? '✓' : ''}</span></button>`).join(''));
  $sheet.querySelectorAll('.opt').forEach(b => b.onclick = () => { const o = opts[+b.dataset.i]; closeSheet(); onPick(o); });
}

function liveAmt(inp, prev) {
  inp.addEventListener('input', () => {
    const v = inp.value;
    if (/[a-z]/i.test(v)) { if (prev) { const n = parseAmt(v); prev.textContent = n ? '= ' + money(n) : ''; } return; }
    const n = v.replace(/\D/g, '');
    inp.value = n ? fmtN(+n) : '';
    if (prev) prev.textContent = '';
  });
}

/* add / edit expense */
function expenseSheet(id) {
  const ex = id ? S.expenses.find(e => e.id === id) : null;
  const st = S.settings;
  const d = ex || {
    title: '', amount: 0, note: '', date: today(),
    categoryId: liveCats().some(c => c.id === st.lastCat) ? st.lastCat : (liveCats()[0] ? liveCats()[0].id : 'other'),
    method: st.paymentMethods.includes(st.lastMethod) ? st.lastMethod : ''
  };
  let cat = d.categoryId, method = d.method, armed = false, selDate = d.date;
  const methods = [{ v: '', l: 'None' }, ...st.paymentMethods.map(m => ({ v: m, l: m }))];
  const catVal = () => { const c = catOf(cat); return `<span style="color:${c.color};display:flex">${icon(c.icon)}</span>${esc(c.name)}`; };

  openSheet(`<div class="sheet-head">
      <button type="button" class="sbtn" id="sx" aria-label="Close">${icon('close')}</button>
      <div class="sheet-t">${ex ? 'Edit Expense' : 'New Expense'}</div>
      <button type="button" class="sbtn ok" id="save" aria-label="Save" ${d.amount ? '' : 'disabled'}>${icon('check')}</button>
    </div>
    <div class="amt-card">
      <span class="cur">${esc(st.currency)}</span>
      <input id="amt" class="amt" inputmode="numeric" placeholder="0" autocomplete="off" value="${d.amount ? fmtN(d.amount) : ''}" aria-label="Amount">
      <span class="wm" id="wm" style="color:${catOf(cat).color}">${icon(catOf(cat).icon)}</span>
    </div>
    <div class="sbody">
      <div class="srow"><span class="sicon aa">Aa</span><input id="ttl" class="sinp" placeholder="Title (e.g. Weekly groceries)" value="${esc(d.title)}" autocomplete="off" aria-label="Title"></div>
      <button type="button" class="srow" id="catrow"><span class="sicon">${icon('tag')}</span><span class="slabel">Category</span><span class="sval" id="catval">${catVal()}</span>${icon('chev-d', 'sch')}</button>
      <div class="cgrid" id="cats"></div>
      <button type="button" class="srow" id="payrow"><span class="sicon">${icon('card')}</span><span class="slabel">Payment Method</span><span class="sval" id="payval">${esc(method || 'None')}</span>${icon('chev-d', 'sch')}</button>
      <div class="cgrid" id="meths" hidden></div>
      <div class="srow"><span class="sicon">${icon('cal')}</span><div class="dates">
        <button type="button" class="dbtn" data-day="0">Today</button>
        <button type="button" class="dbtn" data-day="-1">Yesterday</button>
        <label class="dbtn custom" id="dlab">${relDate(selDate)}<input id="dt" type="date" value="${selDate}" aria-label="Date"></label>
      </div></div>
      <div class="srow"><span class="sicon">${icon('lines')}</span><input id="nt" class="sinp" placeholder="Note" value="${esc(d.note)}" autocomplete="off" aria-label="Note"></div>
    </div>
    ${ex ? '<button class="btn del" id="del">Delete</button>' : ''}`);

  function paintCats() {
    $('#cats').innerHTML = liveCats().map(c =>
      `<button type="button" class="cchip ${c.id === cat ? 'on' : ''}" data-id="${esc(c.id)}"><span style="color:${c.color};display:flex">${icon(c.icon)}</span>${esc(c.name)}</button>`
    ).join('') + `<button type="button" class="cchip new" data-new="1">${icon('plus')} New</button>`;
  }
  function paintMeths() {
    $('#meths').innerHTML = methods.map(m =>
      `<button type="button" class="cchip ${m.v === method ? 'on' : ''}" data-m="${esc(m.v)}">${esc(m.l)}</button>`).join('');
  }
  function markCat() {
    $('#cats').querySelectorAll('.cchip').forEach(x => x.classList.toggle('on', x.dataset.id === cat));
    $('#catval').innerHTML = catVal();
    const c = catOf(cat);
    $('#wm').style.color = c.color;
    $('#wm').innerHTML = icon(c.icon);
  }
  function newCat() {
    $('#cats').innerHTML = `<div class="newcat"><input id="ncn" class="sinp" placeholder="Category name" aria-label="Category name"><button type="button" class="mini" id="ncok">Add</button><button type="button" class="mini" id="ncx">Cancel</button></div>`;
    $('#ncn').focus();
    $('#ncx').onclick = paintCats;
    $('#ncok').onclick = () => {
      const name = $('#ncn').value.trim(); if (!name) { $('#ncn').focus(); return; }
      const c = { id: 'c' + Date.now().toString(36), name, color: COLORS[S.categories.length % COLORS.length], icon: 'star', deleted: false, updated_at: stamp(), pending: true };
      S.categories.push(c); save(); cat = c.id;
      paintCats(); markCat();
    };
  }

  paintCats(); paintMeths();
  const amt = $('#amt'), saveBtn = $('#save');
  liveAmt(amt);
  const syncSave = () => { saveBtn.disabled = !parseAmt(amt.value); };
  amt.addEventListener('input', syncSave);
  syncSave();

  $('#sx').onclick = closeSheet;
  $('#catrow').onclick = () => { const g = $('#cats'); g.hidden = !g.hidden; };
  $('#payrow').onclick = () => { const g = $('#meths'); g.hidden = !g.hidden; };
  $('#cats').onclick = e => {
    const b = e.target.closest('.cchip'); if (!b) return;
    if (b.dataset.new) { newCat(); return; }
    cat = b.dataset.id; markCat();
  };
  $('#meths').onclick = e => {
    const b = e.target.closest('.cchip'); if (!b) return;
    method = b.dataset.m;
    $('#meths').querySelectorAll('.cchip').forEach(x => x.classList.toggle('on', x === b));
    $('#payval').textContent = method || 'None';
  };
  $('#dt').addEventListener('change', () => {
    selDate = $('#dt').value || today();
    $('#dlab').firstChild.nodeValue = relDate(selDate);
  });
  document.querySelectorAll('.dbtn[data-day]').forEach(b => b.onclick = () => {
    selDate = addDays(today(), +b.dataset.day);
    $('#dt').value = selDate;
    $('#dlab').firstChild.nodeValue = relDate(selDate);
  });

  saveBtn.onclick = () => {
    const amount = parseAmt(amt.value);
    if (!amount) { amt.focus(); return; }
    const rec = {
      id: ex ? ex.id : uid(), title: $('#ttl').value.trim(), amount, categoryId: cat, method,
      date: selDate || today(), note: $('#nt').value.trim(), ts: ex ? ex.ts : Date.now(),
      deleted: false, updated_at: stamp(), pending: true
    };
    if (ex) S.expenses[S.expenses.indexOf(ex)] = rec; else S.expenses.push(rec);
    st.lastCat = cat; st.lastMethod = method;
    save(); closeSheet(); render(true);
  };
  if (ex) $('#del').onclick = () => {
    const b = $('#del');
    if (!armed) { armed = true; b.textContent = 'Tap again to delete'; return; }
    closeSheet(); removeExpense(ex.id);
  };
  if (!ex) amt.focus();
}
function removeExpense(id) {
  const e = S.expenses.find(x => x.id === id);
  if (!e || e.deleted) return;
  e.deleted = true; touchExp(e);
  save(); render(true);
  toast('Deleted', { action: 'Undo', fn: () => { e.deleted = false; touchExp(e); save(); render(true); } });
}

/* settings sheets */
function budgetSheet() {
  openSheet(`<div class="sheet-t">Monthly budget</div>
    <input id="bv" class="amt" inputmode="numeric" placeholder="0" value="${S.settings.monthlyBudget ? fmtN(S.settings.monthlyBudget) : ''}">
    <button class="btn" id="ok">Save</button><button class="btn ghost" id="rm">Remove budget</button>`);
  liveAmt($('#bv'));
  $('#ok').onclick = () => { S.settings.monthlyBudget = parseAmt($('#bv').value); touchSettings(); save(); closeSheet(); render(true); };
  $('#rm').onclick = () => { S.settings.monthlyBudget = 0; touchSettings(); save(); closeSheet(); render(true); };
  $('#bv').focus();
}
function currencySheet() {
  openSheet(`<div class="sheet-t">Currency symbol</div>
    <input id="cv" class="inp" maxlength="4" value="${esc(S.settings.currency)}" style="text-align:center;font-size:24px">
    <button class="btn" id="ok">Save</button>`);
  $('#ok').onclick = () => { S.settings.currency = $('#cv').value.trim() || 'đ'; touchSettings(); save(); closeSheet(); render(true); };
}
function categorySheet(id) {
  const c0 = id ? S.categories.find(c => c.id === id && !c.deleted) : null;
  let color = c0 ? c0.color : COLORS[0], ic = c0 ? c0.icon : 'star', armed = false;
  openSheet(`<div class="sheet-t">${c0 ? 'Edit category' : 'New category'}</div>
    <div class="field" style="margin-top:0"><span class="label">Name</span><input id="cn" class="inp" value="${c0 ? esc(c0.name) : ''}" placeholder="e.g. Coffee"></div>
    <div class="field"><span class="label">Color</span><div class="colors" id="cols">${COLORS.map(x => `<button type="button" data-c="${x}" class="${x === color ? 'on' : ''}" style="background:${x}" aria-label="${x}"></button>`).join('')}</div></div>
    <div class="field"><span class="label">Icon</span><div class="cats" id="ics" style="flex-wrap:wrap">${ICON_CHOICES.map(x => `<button type="button" class="cchip ${x === ic ? 'on' : ''}" data-i="${x}" style="padding:0 12px">${icon(x)}</button>`).join('')}</div></div>
    <button class="btn" id="ok">Save</button>${c0 && c0.id !== 'other' ? '<button class="btn del" id="del">Delete</button>' : ''}`);
  $('#cols').onclick = e => { const b = e.target.closest('button'); if (!b) return; color = b.dataset.c; $('#cols').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); };
  $('#ics').onclick = e => { const b = e.target.closest('button'); if (!b) return; ic = b.dataset.i; $('#ics').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); };
  $('#ok').onclick = () => {
    const name = $('#cn').value.trim(); if (!name) { $('#cn').focus(); return; }
    if (c0) { c0.name = name; c0.color = color; c0.icon = ic; touchCat(c0); }
    else S.categories.push({ id: 'c' + Date.now().toString(36), name, color, icon: ic, deleted: false, updated_at: stamp(), pending: true });
    save(); closeSheet(); render(true);
  };
  if ($('#del')) $('#del').onclick = () => {
    const b = $('#del');
    if (!armed) { armed = true; b.textContent = 'Tap again — expenses move to Other'; return; }
    if (!liveCats().some(c => c.id === 'other')) S.categories.push({ ...DEFAULT_CATS[DEFAULT_CATS.length - 1], deleted: false, updated_at: stamp(), pending: true });
    S.expenses.forEach(e => { if (!e.deleted && e.categoryId === c0.id) { e.categoryId = 'other'; touchExp(e); } });
    c0.deleted = true; touchCat(c0);
    save(); closeSheet(); render(true);
  };
}
function methodSheet(name) {
  let armed = false;
  openSheet(`<div class="sheet-t">${name ? 'Edit method' : 'New method'}</div>
    <input id="mn" class="inp" value="${name ? esc(name) : ''}" placeholder="e.g. MoMo">
    <button class="btn" id="ok">Save</button>${name && S.settings.paymentMethods.length > 1 ? '<button class="btn del" id="del">Delete</button>' : ''}`);
  $('#ok').onclick = () => {
    const v = $('#mn').value.trim(); if (!v) return;
    const list = S.settings.paymentMethods;
    if (name) {
      if (v !== name && list.includes(v)) { toast('Already exists'); return; }
      list[list.indexOf(name)] = v;
      S.expenses.forEach(e => { if (!e.deleted && e.method === name) { e.method = v; touchExp(e); } });
      if (S.settings.lastMethod === name) S.settings.lastMethod = v;
    } else if (!list.includes(v)) list.push(v);
    touchSettings();
    save(); closeSheet(); render(true);
  };
  if ($('#del')) $('#del').onclick = () => {
    const b = $('#del');
    if (!armed) { armed = true; b.textContent = 'Tap again to delete'; return; }
    S.settings.paymentMethods = S.settings.paymentMethods.filter(m => m !== name);
    S.expenses.forEach(e => { if (!e.deleted && e.method === name) { e.method = ''; touchExp(e); } });
    touchSettings();
    save(); closeSheet(); render(true);
  };
}

/* history filters */
function pickDate() {
  const cur = ui.f.date.type;
  pickSheet('Date', [
    { v: 'all', l: 'All time' }, { v: 'month', l: monthLabel(ui.month) },
    { v: '7d', l: 'Last 7 days' }, { v: '30d', l: 'Last 30 days' }, { v: 'range', l: 'Custom range…' }
  ], cur, o => {
    if (o.v === 'range') { rangeSheet(); return; }
    ui.f.date = o.v === 'month' ? { type: 'month', month: ui.month } : { type: o.v };
    render(true);
  });
}
function rangeSheet() {
  const r = ui.f.date;
  openSheet(`<div class="sheet-t">Custom range</div>
    <div class="range"><div class="field"><span class="label">From</span><input id="rf" class="inp" type="date" value="${r.from || ''}"></div>
    <div class="field"><span class="label">To</span><input id="rt" class="inp" type="date" value="${r.to || ''}"></div></div>
    <button class="btn" id="ok">Apply</button>`);
  $('#ok').onclick = () => {
    const from = $('#rf').value, to = $('#rt').value;
    ui.f.date = (from || to) ? { type: 'range', from, to } : { type: 'all' };
    closeSheet(); render(true);
  };
}

/* export / import */
async function shareFile(name, text, type) {
  const file = new File([text], name, { type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return true; }
    catch (e) { if (e && e.name === 'AbortError') return false; }
  }
  try {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (e) { toast('Export is not supported here'); return false; }
}
function exportJSON() {
  const text = JSON.stringify(S, null, 2);
  shareFile(`thuchi-${today()}.json`, text, 'application/json').then(ok => {
    if (ok) { S.settings.lastBackup = Date.now(); save(); render(true); toast('Backup exported'); }
  });
}
function exportCSV() {
  const q = c => `"${String(c).replace(/"/g, '""')}"`;
  const rows = [['Date', 'Title', 'Category', 'Amount', 'Payment method', 'Note'],
    ...sorted(live(S.expenses)).map(e => [e.date, e.title, catOf(e.categoryId).name, e.amount, e.method, e.note])];
  const text = '\ufeff' + rows.map(r => r.map(q).join(',')).join('\r\n');
  shareFile(`thuchi-${today()}.csv`, text, 'text/csv');
}
function onImportFile(e) {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    let j;
    try { j = JSON.parse(String(fr.result).replace(/^\ufeff/, '')); } catch (_) { toast('That file is not valid JSON'); return; }
    if (!j || !Array.isArray(j.expenses)) { toast('Not an Olympus Finance backup'); return; }
    const inc = migrate(j);
    openSheet(`<div class="sheet-t">Import backup</div>
      <p style="text-align:center;color:var(--muted);margin:0 0 6px">Found <b style="color:var(--text)">${inc.expenses.length}</b> expenses and ${inc.categories.length} categories.<br>You currently have ${live(S.expenses).length} expenses.</p>
      <button class="btn" id="mg">Merge with current data</button>
      <button class="btn ghost" id="rp">Replace current data</button>
      <button class="btn del" id="cn">Cancel</button>`);
    $('#cn').onclick = closeSheet;
    $('#mg').onclick = () => {
      const have = new Set(S.expenses.map(x => x.id));
      inc.expenses.forEach(x => { if (!have.has(x.id)) S.expenses.push(x); });
      inc.categories.forEach(c => { if (!S.categories.some(x => x.id === c.id)) S.categories.push(c); });
      inc.settings.paymentMethods.forEach(m => { if (!S.settings.paymentMethods.includes(m)) S.settings.paymentMethods.push(m); });
      S.expenses.forEach(touchExp);
      S.categories.forEach(touchCat);
      touchSettings();
      save(); closeSheet(); render(true); toast('Merged');
    };
    $('#rp').onclick = () => {
      S = inc;
      S.expenses.forEach(touchExp); S.categories.forEach(touchCat); touchSettings();
      save(); closeSheet(); render(false); toast('Backup restored');
    };
  };
  fr.readAsText(f);
  e.target.value = '';
}

function demo() {
  const t = today();
  const sets = [['Phở bò', 45000, 'food'], ['Cà phê', 35000, 'food'], ['Siêu thị', 320000, 'groceries'], ['Đổ xăng', 70000, 'transport'],
    ['Grab', 58000, 'transport'], ['Long châu', 250000, 'health'], ['Áo thun', 390000, 'shopping'], ['Tiền điện', 680000, 'bills'],
    ['Bún chả', 55000, 'food'], ['Rau củ', 120000, 'groceries']];
  for (let i = 0; i < 30; i++) {
    const s = sets[(i * 7 + 3) % sets.length];
    S.expenses.push({
      id: uid(), title: s[0], amount: Math.round(s[1] * (0.8 + ((i * 37) % 5) / 10) / 1000) * 1000, categoryId: s[2],
      method: S.settings.paymentMethods[i % S.settings.paymentMethods.length], date: addDays(t, -((i * 3) % 50)), note: '', ts: Date.now() - i,
      deleted: false, updated_at: stamp(), pending: true
    });
  }
  save(); render(true); toast('Demo data loaded');
}
function clearAll() {
  let armed = false;
  openSheet(`<div class="sheet-t">Clear all data?</div>
    <p style="text-align:center;color:var(--muted);margin:0">This deletes every expense on this device. Export a backup first if you might need it.</p>
    <button class="btn" id="ok" style="background:var(--rust);color:#fff">Erase everything</button>
    <button class="btn ghost" id="no">Cancel</button>`);
  $('#no').onclick = closeSheet;
  $('#ok').onclick = async () => {
    const b = $('#ok');
    if (!armed) { armed = true; b.textContent = 'Really erase? Tap again'; return; }
    if (signedIn()) {
      try { await wipeCloud(); } catch (e) { toast('Cloud erase failed: ' + e.message); return; }
    }
    S = defaults(); save(); closeSheet(); render(false); toast('All data cleared');
  };
}

/* ───────── cloud sync ───────── */
const CFG = window.DRACHMA || null;
const SKEY = 'thuchi.session', LKEY = 'thuchi.lastsync';
let syncBusy = false, syncError = '';

const cloudOn = () => !!(CFG && CFG.supabaseUrl && CFG.supabaseKey);
function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SKEY) || 'null');
    return s && s.access_token ? s : null;
  } catch (_) { return null; }
}
function setSession(j) {
  const s = {
    access_token: j.access_token, refresh_token: j.refresh_token,
    expires_at: Date.now() + (j.expires_in || 3600) * 1000,
    user: { id: (j.user && j.user.id) || '', email: (j.user && j.user.email) || '' }
  };
  localStorage.setItem(SKEY, JSON.stringify(s));
  return s;
}
function clearSession() {
  localStorage.removeItem(SKEY);
  localStorage.removeItem(LKEY);
}
const signedIn = () => !!getSession();
const pendingCount = () => S.expenses.filter(e => e.pending).length + S.categories.filter(c => c.pending).length + (S.settings.pending ? 1 : 0);

async function authReq(path, body, token) {
  const headers = { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const r = await fetch(CFG.supabaseUrl + path, { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  let j = null;
  try { j = txt ? JSON.parse(txt) : null; } catch (_) {}
  if (!r.ok) throw new Error((j && (j.msg || j.message || j.error_description)) || ('HTTP ' + r.status));
  return j;
}
async function refreshSession() {
  const s = getSession();
  if (!s || !s.refresh_token) return false;
  try {
    const j = await authReq('/auth/v1/token?grant_type=refresh_token', { refresh_token: s.refresh_token });
    setSession(j);
    return true;
  } catch (_) { clearSession(); return false; }
}
async function sb(path, opts = {}, retry = true) {
  if (!cloudOn()) throw new Error('Cloud is not configured');
  let s = getSession();
  if (!s) throw new Error('Sign in first');
  if (s.expires_at < Date.now() + 60000 && !(await refreshSession())) throw new Error('Session expired');
  s = getSession();
  const headers = { apikey: CFG.supabaseKey, 'Content-Type': 'application/json', ...(opts.headers || {}), Authorization: 'Bearer ' + s.access_token };
  const r = await fetch(CFG.supabaseUrl + path, { ...opts, headers });
  if (r.status === 401 && retry && (await refreshSession())) return sb(path, opts, false);
  if (!r.ok) {
    let msg = 'HTTP ' + r.status;
    try { const j = await r.json(); msg = j.message || j.hint || msg; } catch (_) {}
    throw new Error(msg);
  }
  return r.status === 204 ? null : r.json();
}
async function passwordAuth(mode, email, password) {
  if (!cloudOn()) throw new Error('Cloud is not configured');
  if (password.length < 6) throw new Error('Password needs at least 6 characters');
  const j = mode === 'signup'
    ? await authReq('/auth/v1/signup', { email, password })
    : await authReq('/auth/v1/token?grant_type=password', { email, password });
  if (!j || !j.access_token) throw new Error('Confirm your email first, or turn off Confirm email in Supabase.');
  setSession(j);
}
async function pullAll(table, since) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const rows = await sb(`/rest/v1/${table}?select=*&order=updated_at.asc&limit=1000&offset=${offset}${since ? `&updated_at=gt.${encodeURIComponent(since)}` : ''}`);
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

async function syncNow(silent) {
  if (!cloudOn() || !signedIn() || syncBusy) return;
  syncBusy = true; syncError = '';
  try {
    const uid = getSession().user.id;

    const pendingEx = S.expenses.filter(e => e.pending);
    if (pendingEx.length) {
      const rows = pendingEx.map(e => ({
        user_id: uid, id: e.id, title: e.title, amount: e.amount, category_id: e.categoryId,
        method: e.method, date: e.date, note: e.note, ts: e.ts, deleted: !!e.deleted
      }));
      const saved = await sb('/rest/v1/expenses?on_conflict=user_id,id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(rows)
      });
      (saved || []).forEach(r => { const e = S.expenses.find(x => x.id === r.id); if (e) { e.pending = false; e.updated_at = r.updated_at; } });
      save();
    }

    const pendingCats = S.categories.filter(c => c.pending);
    if (pendingCats.length) {
      const rows = pendingCats.map(c => ({ user_id: uid, id: c.id, name: c.name, color: c.color, icon: c.icon, deleted: !!c.deleted }));
      const saved = await sb('/rest/v1/categories?on_conflict=user_id,id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(rows)
      });
      (saved || []).forEach(r => { const c = S.categories.find(x => x.id === r.id); if (c) { c.pending = false; c.updated_at = r.updated_at; } });
      save();
    }

    if (S.settings.pending) {
      const row = {
        user_id: uid, currency: S.settings.currency, monthly_budget: S.settings.monthlyBudget,
        payment_methods: S.settings.paymentMethods, tone: !!S.settings.tone
      };
      const saved = await sb('/rest/v1/settings?on_conflict=user_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify([row])
      });
      if (saved && saved[0]) { S.settings.pending = false; S.settings.updated_at = saved[0].updated_at; save(); }
    }

    const since = localStorage.getItem(LKEY) || '1970-01-01T00:00:00.000Z';
    const [rex, rcat, rset] = await Promise.all([
      pullAll('expenses', since),
      pullAll('categories', since),
      sb('/rest/v1/settings?select=*')
    ]);
    let max = Date.parse(since) || 0;

    (rex || []).forEach(r => {
      const t = Date.parse(r.updated_at) || 0;
      if (t > max) max = t;
      const local = S.expenses.find(x => x.id === r.id);
      const row = {
        title: r.title, amount: r.amount, categoryId: r.category_id, method: r.method,
        date: r.date, note: r.note, ts: r.ts, deleted: !!r.deleted, updated_at: r.updated_at
      };
      if (!local) S.expenses.push({ id: r.id, ...row, pending: false });
      else if (!local.pending) Object.assign(local, row, { pending: false });
    });

    (rcat || []).forEach(r => {
      const t = Date.parse(r.updated_at) || 0;
      if (t > max) max = t;
      const local = S.categories.find(x => x.id === r.id);
      const row = { name: r.name, color: r.color, icon: r.icon, deleted: !!r.deleted, updated_at: r.updated_at };
      if (!local) S.categories.push({ id: r.id, ...row, pending: false });
      else if (!local.pending) Object.assign(local, row, { pending: false });
    });

    if (rset && rset[0] && !S.settings.pending) {
      const r = rset[0];
      S.settings.currency = r.currency || S.settings.currency;
      S.settings.monthlyBudget = Number(r.monthly_budget) || 0;
      if (Array.isArray(r.payment_methods) && r.payment_methods.length) S.settings.paymentMethods = r.payment_methods;
      S.settings.tone = !!r.tone;
      S.settings.updated_at = r.updated_at;
    }

    if (max) localStorage.setItem(LKEY, new Date(max).toISOString());
    save();
    if (!silent) { render(true); toast('Synced'); }
  } catch (e) {
    syncError = e.message || 'Sync failed';
    console.error('sync failed:', e);
    if (!silent) toast(syncError);
  } finally {
    syncBusy = false;
    if (ui.route === 'settings') render(true);
  }
}

async function wipeCloud() {
  const s = getSession();
  if (!s) return;
  await Promise.all([
    sb(`/rest/v1/expenses?user_id=eq.${s.user.id}`, { method: 'DELETE' }),
    sb(`/rest/v1/categories?user_id=eq.${s.user.id}`, { method: 'DELETE' }),
    sb(`/rest/v1/settings?user_id=eq.${s.user.id}`, { method: 'DELETE' })
  ]);
}
async function signOutCloud() {
  const s = getSession();
  if (s) { try { await authReq('/auth/v1/logout', {}, s.access_token); } catch (_) {} }
  clearSession();
  render(true);
  toast('Signed out');
}

function cloudSection() {
  if (!cloudOn()) return `<div class="set-row" style="display:block"><div>Not configured</div><div class="v" style="margin-top:2px">Add SUPABASE_URL and key to config.js</div></div>`;
  const s = getSession();
  if (!s) return `<div class="set-row" data-act="cloud" role="button"><span>Sign in to sync</span><span class="v">Email + password</span></div>
    <div class="set-row" style="display:block"><div class="v">Data stays on this device until you sign in.</div></div>`;
  const last = localStorage.getItem(LKEY);
  const lastTxt = last ? new Date(last).toLocaleString() : 'Never';
  const p = pendingCount();
  return `<div class="set-row" style="display:block"><div>${esc(s.user.email || 'Signed in')}</div><div class="v" style="margin-top:2px">${p ? p + ' change' + (p === 1 ? '' : 's') + ' pending' : 'Up to date'}</div></div>
    <div class="set-row" data-act="cloud-sync" role="button"><span>Sync now</span><span class="v">${syncBusy ? 'Syncing…' : lastTxt}</span></div>
    <div class="set-row" data-act="cloud-out" role="button"><span>Sign out</span><span class="v">Keeps local data</span></div>`;
}

function cloudSheet() {
  if (!cloudOn()) { toast('Cloud is not configured'); return; }
  if (getSession()) return;
  openSheet(`<div class="sheet-head">
      <button type="button" class="sbtn" id="sx" aria-label="Close">${icon('close')}</button>
      <div class="sheet-t">Cloud sync</div><span style="width:40px"></span>
    </div>
    <input id="cem" class="inp" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" aria-label="Email">
    <input id="cpw" class="inp" type="password" autocomplete="current-password" placeholder="Password" style="margin-top:10px" aria-label="Password">
    <button class="btn" id="signin">Sign in</button>
    <button class="btn ghost" id="signup">Create account</button>
    <p style="text-align:center;color:var(--muted);font-size:14px;margin:12px 0 0">New account is created instantly when email confirmation is off in Supabase.</p>`);
  $('#sx').onclick = closeSheet;
  const run = async mode => {
    const email = $('#cem').value.trim();
    const password = $('#cpw').value;
    if (!email) { $('#cem').focus(); return; }
    if (!password) { $('#cpw').focus(); return; }
    const b = $(mode === 'signup' ? '#signup' : '#signin');
    const label = b.textContent;
    b.disabled = true; b.textContent = mode === 'signup' ? 'Creating…' : 'Signing in…';
    try {
      await passwordAuth(mode, email, password);
      closeSheet();
      render(false);
      toast('Signed in');
      syncNow(true);
    } catch (e) {
      b.disabled = false; b.textContent = label;
      toast(e.message || 'Sign in failed');
    }
  };
  $('#signin').onclick = () => run('signin');
  $('#signup').onclick = () => run('signup');
  $('#cem').focus();
}

/* ───────── actions ───────── */
let swiped = 0;
const ACT = {
  'hint-x': () => { try { localStorage.setItem('thuchi.hint', '1'); } catch (_) {} render(true); },
  'month-cat': el => { ui.f = { q: '', cat: el.dataset.cat, method: null, date: { type: 'month', month: ui.month } }; location.hash = '#/history'; },
  'all-hist': () => { ui.f = { q: '', cat: null, method: null, date: { type: 'all' } }; },
  edit: el => expenseSheet(el.dataset.id),
  budget: budgetSheet,
  currency: currencySheet,
  'cat-edit': el => categorySheet(el.dataset.id),
  'm-edit': el => methodSheet(el.dataset.m),
  'f-date': pickDate,
  'f-cat': () => pickSheet('Category', [{ v: null, l: 'All categories' }, ...liveCats().map(c => ({ v: c.id, l: c.name }))], ui.f.cat, o => { ui.f.cat = o.v; render(true); }),
  'f-method': () => pickSheet('Payment method', [{ v: null, l: 'All methods' }, ...S.settings.paymentMethods.map(m => ({ v: m, l: m }))], ui.f.method, o => { ui.f.method = o.v; render(true); }),
  'export-json': exportJSON,
  'export-csv': exportCSV,
  import: () => { const f = $('#file'); if (f) f.click(); },
  tone: () => { S.settings.tone = !S.settings.tone; touchSettings(); save(); render(true); },
  cloud: cloudSheet,
  'cloud-sync': () => syncNow(false),
  'cloud-out': signOutCloud,
  demo, clear: clearAll
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (Date.now() - swiped < 400) { e.preventDefault(); return; }
  const h = ACT[el.dataset.act]; if (h) h(el, e);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest && e.target.closest('[role=button][data-act]');
  if (el) { e.preventDefault(); el.click(); }
});
$('#fab').onclick = () => expenseSheet();

/* swipe-left to delete (history) */
let sw = null;
$view.addEventListener('touchstart', e => {
  const row = e.target.closest('.item[data-id]');
  if (!row || ui.route !== 'history') return;
  const t = e.touches[0];
  if (t.clientX < 28) return; // keep iOS edge-swipe-back working
  sw = { row, x: t.clientX, y: t.clientY, dx: 0, lock: null };
}, { passive: true });
$view.addEventListener('touchmove', e => {
  if (!sw) return;
  const t = e.touches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y;
  if (sw.lock === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) sw.lock = (dx < 0 && Math.abs(dx) > Math.abs(dy) * 1.5) ? 'h' : 'v';
  if (sw.lock === 'h') {
    e.preventDefault(); sw.dx = dx;
    const v = Math.max(dx, -140);
    sw.row.style.transform = `translateX(${v}px)`; sw.row.style.opacity = 1 + v / 400;
  }
}, { passive: false });
const endSwipe = () => {
  if (!sw) return;
  const { row, dx, lock } = sw; sw = null;
  if (lock === 'h') {
    swiped = Date.now();
    if (dx < -90) removeExpense(row.dataset.id);
    else { row.style.transform = ''; row.style.opacity = ''; }
  }
};
$view.addEventListener('touchend', endSwipe);
$view.addEventListener('touchcancel', endSwipe);

/* ───────── boot ───────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !$sheet.hidden) return;
  render(true);
  if (signedIn()) syncNow(true);
});

render(false);
if (signedIn()) setTimeout(() => syncNow(true), 1000);

try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (_) {}

(function monthlyPrompt() {
  const cm = monthOf(today());
  if (S.settings.lastPromptMonth === cm) return;
  const had = S.expenses.length > 0;
  S.settings.lastPromptMonth = cm; save();
  if (had) setTimeout(() => toast('New month — export a backup?', { action: 'Open', ms: 9000, fn: () => { location.hash = '#/settings'; } }), 800);
})();

if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) toast('Update ready', { action: 'Reload', ms: 0, fn: () => location.reload() });
  });
}
})();
