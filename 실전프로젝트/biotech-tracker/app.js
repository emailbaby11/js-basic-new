'use strict';

/* =====================================================
   CONSTANTS
===================================================== */
const EVENT_TYPES = {
  clinical_result:    { label: '임상시험 결과',    emoji: '🧪' },
  fda_approval:       { label: 'FDA/식약처 승인',  emoji: '✅' },
  pdufa:              { label: 'PDUFA 날짜',       emoji: '📋' },
  earnings:           { label: '실적 발표',         emoji: '💰' },
  conference:         { label: '학회 발표',         emoji: '🎤' },
  regulatory_filing:  { label: 'IND/NDA 제출',     emoji: '📄' },
  licensing:          { label: '기술이전 계약',     emoji: '🤝' },
  other:              { label: '기타',              emoji: '📌' },
};

const STATUS_LABELS = {
  upcoming:  '예정',
  pending:   '진행 중',
  completed: '완료 (긍정)',
  failed:    '완료 (부정)',
};

const EXP_LABELS = { 1: '매우 낮음', 2: '낮음', 3: '보통', 4: '높음', 5: '매우 높음' };
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const KO_MONTH   = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const KO_DAY     = ['일','월','화','수','목','금','토'];

/* =====================================================
   STORE
===================================================== */
const Store = {
  KEY: 'biotracker_events_v2',
  API_KEY: 'biotracker_api_key',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  },
  save(events) { localStorage.setItem(this.KEY, JSON.stringify(events)); },
  add(data) {
    const events = this.getAll();
    const ev = { ...data, id: uid(), createdAt: new Date().toISOString() };
    events.push(ev);
    this.save(events);
    return ev;
  },
  update(id, data) {
    const events = this.getAll();
    const i = events.findIndex(e => e.id === id);
    if (i < 0) return null;
    events[i] = { ...events[i], ...data, updatedAt: new Date().toISOString() };
    this.save(events);
    return events[i];
  },
  remove(id) { this.save(this.getAll().filter(e => e.id !== id)); },
  getApiKey() { return localStorage.getItem(this.API_KEY) || ''; },
  setApiKey(k) { localStorage.setItem(this.API_KEY, k); },
};

/* =====================================================
   FILTER STATE
===================================================== */
const Filters = {
  market: 'all',
  eventType: 'all',
  status: 'all',
  sortBy: 'eventDate',
  sortDir: 'asc',

  apply(events) {
    let r = [...events];
    if (this.market !== 'all')    r = r.filter(e => e.market === this.market);
    if (this.eventType !== 'all') r = r.filter(e => e.eventType === this.eventType);
    if (this.status !== 'all')    r = r.filter(e => e.status === this.status);
    const key = this.sortBy;
    r.sort((a, b) => {
      const av = a[key] || '', bv = b[key] || '';
      if (av < bv) return this.sortDir === 'asc' ? -1 : 1;
      if (av > bv) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return r;
  },
};

/* =====================================================
   UTILITIES
===================================================== */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function fmtDate(str) {
  if (!str) return '-';
  const d = new Date(str + 'T00:00:00');
  return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`;
}

function fmtDateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

function stars(n) {
  n = Math.max(1, Math.min(5, n || 3));
  return `<span class="stars">${Array.from({length:5},(_,i)=>`<span class="star ${i<n?'on':'off'}">★</span>`).join('')}</span>`;
}

function typeBadge(type) {
  const t = EVENT_TYPES[type] || { label: type, emoji: '📌' };
  return `<span class="ev-type-badge type-${type}">${t.emoji} ${t.label}</span>`;
}

function mktBadge(market) {
  return `<span class="mkt-badge mkt-${market}">${market}</span>`;
}

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.ceil((d - today) / 86400000);
}

function diffBadge(dateStr) {
  const n = daysUntil(dateStr);
  if (n < 0) return `<span style="color:var(--text-dim);font-size:11px">${Math.abs(n)}일 전</span>`;
  if (n === 0) return `<span style="color:var(--danger);font-size:11px;font-weight:700">오늘</span>`;
  if (n <= 7)  return `<span style="color:var(--warning);font-size:11px;font-weight:700">D-${n}</span>`;
  return `<span style="color:var(--text-muted);font-size:11px">D-${n}</span>`;
}

/* =====================================================
   TOAST
===================================================== */
const Toast = {
  show(msg, type = 'info', ms = 3200) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const ic = { success: '✅', error: '❌', info: 'ℹ️' };
    el.innerHTML = `<span>${ic[type]||''}</span><span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(14px)';
      setTimeout(() => el.remove(), 320);
    }, ms);
  },
};

/* =====================================================
   CALENDAR STATE
===================================================== */
const Cal = {
  y: new Date().getFullYear(),
  m: new Date().getMonth(),
  prev() { if (--this.m < 0) { this.m = 11; this.y--; } App.refresh(); },
  next() { if (++this.m > 11) { this.m = 0; this.y++; } App.refresh(); },
  today() { const n = new Date(); this.y = n.getFullYear(); this.m = n.getMonth(); App.refresh(); },
};

/* =====================================================
   VIEWS — DASHBOARD
===================================================== */
function renderDashboard(allEvents) {
  const today = new Date(); today.setHours(0,0,0,0);
  const events = Filters.apply(allEvents);

  const upcoming = events
    .filter(e => e.status === 'upcoming' && new Date(e.eventDate+'T00:00:00') >= today)
    .sort((a,b) => a.eventDate > b.eventDate ? 1 : -1);

  const within30 = upcoming.filter(e => daysUntil(e.eventDate) <= 30);
  const thisMonth = events.filter(e => {
    const d = new Date(e.eventDate+'T00:00:00');
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  });

  // Update sidebar stats
  qs('#stat-total').textContent   = allEvents.length;
  qs('#stat-upcoming').textContent = upcoming.length;
  qs('#stat-thismonth').textContent = thisMonth.length;

  // Type distribution
  const dist = {};
  events.forEach(e => { dist[e.eventType] = (dist[e.eventType]||0)+1; });
  const total = events.length || 1;

  const distHtml = Object.entries(EVENT_TYPES)
    .filter(([k]) => dist[k])
    .map(([k, v]) => {
      const pct = Math.round(dist[k]/total*100);
      return `<div class="dist-row">
        <span class="dist-label">${typeBadge(k)}</span>
        <div class="dist-bar-track"><div class="dist-bar" style="width:${pct}%"></div></div>
        <span class="dist-count">${dist[k]}</span>
      </div>`;
    }).join('') || '<p style="color:var(--text-muted);font-size:13px">데이터 없음</p>';

  const topExp = events
    .filter(e => e.status === 'upcoming')
    .sort((a,b) => (b.expectation||3) - (a.expectation||3))
    .slice(0, 5);

  const upcomingHtml = within30.length === 0
    ? `<div class="empty-state" style="padding:28px"><div class="empty-icon">📭</div><p>30일 이내 예정 이벤트가 없습니다</p></div>`
    : within30.slice(0, 8).map(renderUpcomingItem).join('')
      + (within30.length > 8 ? `<p style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:10px">+${within30.length-8}개 → <button onclick="App.setView('list')" style="color:var(--primary);background:none;border:none;cursor:pointer;font-size:12px;font-weight:600">목록 보기</button></p>` : '');

  return `
    <div class="dash-grid">
      <div class="dash-card dash-full">
        <h3>📅 다가오는 이벤트 (30일 이내) — ${within30.length}건</h3>
        ${upcomingHtml}
      </div>
      <div class="dash-card">
        <h3>📊 이벤트 유형 분포</h3>
        ${distHtml}
      </div>
      <div class="dash-card">
        <h3>⭐ 고기대감 이벤트 Top 5</h3>
        ${topExp.length === 0
          ? '<p style="color:var(--text-muted);font-size:13px">예정 이벤트 없음</p>'
          : topExp.map(e => `
            <div class="upcoming-item" onclick="App.showDetail('${e.id}')">
              <div class="ev-info">
                <div class="ev-stock">${e.stockName} ${mktBadge(e.market)}</div>
                <div class="ev-type-row">${typeBadge(e.eventType)}${e.phase?` <span style="font-size:11px;color:var(--text-muted)">${e.phase}</span>`:''}</div>
                <div style="font-size:12px;color:var(--text-muted)">${fmtDate(e.eventDate)} ${diffBadge(e.eventDate)}</div>
              </div>
              ${stars(e.expectation||3)}
            </div>`).join('')}
      </div>
    </div>`;
}

function renderUpcomingItem(e) {
  const d = new Date(e.eventDate+'T00:00:00');
  const isToday = daysUntil(e.eventDate) === 0;
  return `
    <div class="upcoming-item" onclick="App.showDetail('${e.id}')">
      <div class="date-badge${isToday?' today-badge':''}">
        <span class="db-month">${MONTH_SHORT[d.getMonth()]}</span>
        <span class="db-day">${d.getDate()}</span>
      </div>
      <div class="ev-info">
        <div class="ev-stock">
          ${e.stockName} ${mktBadge(e.market)}
          ${e.stockCode?`<span style="color:var(--text-dim);font-size:11px">${e.stockCode}</span>`:''}
          ${diffBadge(e.eventDate)}
        </div>
        <div class="ev-type-row">${typeBadge(e.eventType)}${e.phase?` <span style="font-size:11px;color:var(--text-muted)">${e.phase}</span>`:''}</div>
        ${e.memo?`<div class="ev-memo">${e.memo.slice(0,65)}${e.memo.length>65?'…':''}</div>`:''}
      </div>
      ${stars(e.expectation||3)}
    </div>`;
}

/* =====================================================
   VIEWS — CALENDAR
===================================================== */
function renderCalendar(allEvents) {
  const { y, m } = Cal;
  const today = new Date(); today.setHours(0,0,0,0);

  const filtered = Filters.apply(allEvents);
  const byDate = {};
  filtered.forEach(e => {
    if (!byDate[e.eventDate]) byDate[e.eventDate] = [];
    byDate[e.eventDate].push(e);
  });

  const first = new Date(y, m, 1);
  const last  = new Date(y, m+1, 0);
  const cur   = new Date(first);
  cur.setDate(cur.getDate() - cur.getDay()); // rewind to Sunday

  let cells = '';
  while (cur <= last || cur.getDay() !== 0) {
    if (cur > last && cur.getDay() === 0) break;
    const key = fmtDateKey(cur);
    const evs = byDate[key] || [];
    const isToday = cur.getTime() === today.getTime();
    const other   = cur.getMonth() !== m;
    const sunColor = cur.getDay() === 0 ? 'color:#f87171' : cur.getDay() === 6 ? 'color:#60a5fa' : '';

    cells += `<div class="cal-cell${isToday?' is-today':''}${other?' other-month':''}">
      <div class="cell-num" style="${sunColor}">${cur.getDate()}</div>
      <div class="cell-events">
        ${evs.slice(0,3).map(e=>`<div class="cell-ev-dot type-${e.eventType}" onclick="App.showDetail('${e.id}')" title="${e.stockName}">${EVENT_TYPES[e.eventType]?.emoji} ${e.stockName}</div>`).join('')}
        ${evs.length>3?`<div class="cell-ev-more">+${evs.length-3}개</div>`:''}
      </div>
    </div>`;
    cur.setDate(cur.getDate()+1);
  }

  return `
    <div class="cal-wrap">
      <div class="cal-header">
        <div class="cal-nav">
          <button class="cal-nav-btn" onclick="Cal.prev()">‹</button>
          <button class="cal-nav-btn" onclick="Cal.next()">›</button>
          <button class="cal-today-btn" onclick="Cal.today()">오늘</button>
        </div>
        <h2 class="cal-title">${y}년 ${KO_MONTH[m]}</h2>
        <div style="width:130px"></div>
      </div>
      <div class="cal-day-names">
        ${KO_DAY.map((d,i)=>`<div class="cal-day-name" style="${i===0?'color:#f87171':i===6?'color:#60a5fa':''}">${d}</div>`).join('')}
      </div>
      <div class="cal-grid">${cells}</div>
    </div>`;
}

/* =====================================================
   VIEWS — LIST
===================================================== */
function renderList(allEvents) {
  const filtered = Filters.apply(allEvents);

  const th = (f, label) => {
    const active = Filters.sortBy === f;
    const arrow  = active ? (Filters.sortDir === 'asc' ? '↑' : '↓') : '↕';
    return `<th onclick="App.setSort('${f}')">${label} <span class="sort-arrow${active?' on':''}">${arrow}</span></th>`;
  };

  if (filtered.length === 0) {
    return `
      <div class="list-toolbar"><div class="list-filters">${listFilters()}</div></div>
      <div class="table-wrap">
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>이벤트 없음</h3>
          <p>이벤트를 추가하거나 필터를 변경하세요</p>
          <button class="btn btn-primary" onclick="App.openAddModal()">+ 이벤트 추가</button>
        </div>
      </div>`;
  }

  return `
    <div class="list-toolbar">
      <span style="font-size:13px;color:var(--text-muted)">${filtered.length}개 이벤트</span>
      <div class="list-filters">${listFilters()}</div>
    </div>
    <div class="table-wrap">
      <table class="ev-table">
        <thead><tr>
          ${th('stockName','종목')}
          ${th('market','시장')}
          ${th('eventType','이벤트 유형')}
          ${th('eventDate','날짜')}
          ${th('expectation','기대감')}
          ${th('status','상태')}
          <th>메모</th>
        </tr></thead>
        <tbody>
          ${filtered.map(e=>`
            <tr onclick="App.showDetail('${e.id}')">
              <td><div style="font-weight:600">${e.stockName}</div>${e.stockCode?`<div style="font-size:11px;color:var(--text-muted)">${e.stockCode}</div>`:''}</td>
              <td>${mktBadge(e.market)}</td>
              <td>${typeBadge(e.eventType)}${e.phase?`<div style="font-size:11px;color:var(--text-muted);margin-top:3px">${e.phase}</div>`:''}</td>
              <td style="white-space:nowrap">${fmtDate(e.eventDate)}<div>${diffBadge(e.eventDate)}</div></td>
              <td>${stars(e.expectation||3)}</td>
              <td><span class="status-badge status-${e.status}">${STATUS_LABELS[e.status]||e.status}</span></td>
              <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-muted)">${e.memo||'—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function listFilters() {
  return `
    <select class="filter-sel" onchange="App.setFilter('eventType',this.value)">
      <option value="all" ${Filters.eventType==='all'?'selected':''}>모든 유형</option>
      ${Object.entries(EVENT_TYPES).map(([k,v])=>`<option value="${k}" ${Filters.eventType===k?'selected':''}>${v.emoji} ${v.label}</option>`).join('')}
    </select>
    <select class="filter-sel" onchange="App.setFilter('status',this.value)">
      <option value="all" ${Filters.status==='all'?'selected':''}>모든 상태</option>
      ${Object.entries(STATUS_LABELS).map(([k,v])=>`<option value="${k}" ${Filters.status===k?'selected':''}>${v}</option>`).join('')}
    </select>`;
}

/* =====================================================
   VIEWS — STOCKS
===================================================== */
function renderStocks(allEvents) {
  const events = Filters.apply(allEvents);
  const map = {};
  events.forEach(e => {
    const k = `${e.stockName}||${e.market}`;
    if (!map[k]) map[k] = { stockName: e.stockName, stockCode: e.stockCode, market: e.market, events: [] };
    map[k].events.push(e);
  });

  const stocks = Object.values(map);
  if (stocks.length === 0) return `
    <div class="empty-state">
      <div class="empty-icon">💊</div>
      <h3>종목 없음</h3>
      <p>이벤트를 추가하면 종목 현황이 표시됩니다</p>
      <button class="btn btn-primary" onclick="App.openAddModal()">+ 이벤트 추가</button>
    </div>`;

  return `<div class="stocks-grid">${stocks.map(renderStockCard).join('')}</div>`;
}

function renderStockCard(s) {
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = s.events
    .filter(e => e.status === 'upcoming' && new Date(e.eventDate+'T00:00:00') >= today)
    .sort((a,b) => a.eventDate > b.eventDate ? 1 : -1);
  const avgExp = Math.round(s.events.reduce((sum,e)=>sum+(e.expectation||3),0)/s.events.length);

  return `
    <div class="stock-card">
      <div class="sc-header">
        <div>
          <div class="sc-name">${s.stockName}</div>
          <div class="sc-meta">${s.stockCode?s.stockCode+' · ':''} ${mktBadge(s.market)}</div>
        </div>
        <div class="sc-exp">
          <span class="sc-exp-label">평균 기대감</span>
          ${stars(avgExp)}
        </div>
      </div>
      <div class="sc-subtitle">전체 ${s.events.length}개 이벤트 · 예정 ${upcoming.length}개</div>
      <div>
        ${upcoming.length === 0
          ? '<p style="font-size:12px;color:var(--text-muted)">예정 이벤트 없음</p>'
          : upcoming.slice(0,4).map(e=>`
              <div class="sc-event-row" onclick="App.showDetail('${e.id}')">
                <span>${typeBadge(e.eventType)}${e.phase?` <span style="font-size:11px;color:var(--text-muted)">${e.phase}</span>`:''}</span>
                <span class="sc-event-date">${fmtDate(e.eventDate)}</span>
              </div>`).join('')
          + (upcoming.length>4?`<div style="font-size:11px;color:var(--text-muted);padding-top:4px">+${upcoming.length-4}개 더...</div>`:'')}
      </div>
    </div>`;
}

/* =====================================================
   AI SEARCH
===================================================== */
const AI = {
  _cache: null,
  _stock: '',
  _market: '',

  async search(stockName, market) {
    const apiKey = Store.getApiKey();
    if (!apiKey) { Toast.show('먼저 API 키를 설정해주세요 (⚙️)', 'error'); return null; }

    const today = new Date().toISOString().slice(0,10);
    const prompt = `You are a biotech investment analyst. For the stock "${stockName}" (Market: ${market||'Unknown'}), list upcoming catalyst events investors should track.

Include as many relevant events as you know:
- Clinical trial results (specify phase and indication)
- FDA/regulatory approval decisions (PDUFA dates)
- Earnings release dates
- Medical conference presentations (ASCO, ESMO, ASH, etc.)
- IND/NDA/BLA filings
- Licensing or partnership announcements

Today: ${today}

Respond ONLY with a valid JSON array. No markdown, no explanation. Format:
[{"eventType":"clinical_result|fda_approval|pdufa|earnings|conference|regulatory_filing|licensing|other","description":"concise description","expectedDate":"YYYY-MM-DD","phase":"Phase 1|Phase 2|Phase 3|BLA/NDA or null","expectation":1-5,"memo":"additional context"}]

If you lack specific information, provide reasonable estimates based on common biotech timelines. Return 3-6 events minimum.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('JSON 파싱 실패');
      return JSON.parse(match[0]);
    } catch (e) {
      Toast.show(`AI 검색 오류: ${e.message}`, 'error');
      return null;
    }
  },
};

/* =====================================================
   MAIN APP
===================================================== */
const App = {
  view: 'dashboard',
  editId: null,
  detailId: null,

  init() {
    this.bindNav();
    this.bindTopbar();
    this.bindEventModal();
    this.bindDetailModal();
    this.bindSettingsModal();
    this.bindAISearch();
    this.bindMobileMenu();
    this.bindKeyboard();
    this.initExpRange();
    maybeLoadSamples();
    this.setView('dashboard');
  },

  /* --- Navigation --- */
  bindNav() {
    qsAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => this.setView(btn.dataset.view));
    });
  },

  setView(v) {
    this.view = v;
    qsAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    const titles = { dashboard:'대시보드', calendar:'캘린더', list:'이벤트 목록', stocks:'종목 현황' };
    qs('#page-title').textContent = titles[v] || v;
    this.refresh();
  },

  refresh() {
    const events = Store.getAll();
    const content = qs('#content');
    if (this.view === 'dashboard') content.innerHTML = renderDashboard(events);
    else if (this.view === 'calendar') content.innerHTML = renderCalendar(events);
    else if (this.view === 'list')     content.innerHTML = renderList(events);
    else if (this.view === 'stocks')   content.innerHTML = renderStocks(events);
  },

  setFilter(key, val) { Filters[key] = val; this.refresh(); },
  setSort(field) {
    if (Filters.sortBy === field) Filters.sortDir = Filters.sortDir === 'asc' ? 'desc' : 'asc';
    else { Filters.sortBy = field; Filters.sortDir = 'asc'; }
    this.refresh();
  },

  /* --- Topbar --- */
  bindTopbar() {
    qs('#add-event-btn').addEventListener('click', () => this.openAddModal());
    qsAll('.chip[data-market]').forEach(c => {
      c.addEventListener('click', () => {
        qsAll('.chip[data-market]').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        Filters.market = c.dataset.market;
        this.refresh();
      });
    });
  },

  /* --- Event Modal --- */
  bindEventModal() {
    qs('#event-modal-close').addEventListener('click', () => this.closeModal('event'));
    qs('#event-cancel').addEventListener('click',     () => this.closeModal('event'));
    qs('#event-save').addEventListener('click',       () => this.saveEvent());
    qs('#event-modal-overlay').addEventListener('click', e => {
      if (e.target === qs('#event-modal-overlay')) this.closeModal('event');
    });
  },

  openAddModal(prefill = {}) {
    this.editId = null;
    qs('#modal-title').textContent = '이벤트 추가';
    const f = qs('#event-form');
    f.reset();
    if (prefill.stockName)  f.elements.stockName.value  = prefill.stockName;
    if (prefill.stockCode)  f.elements.stockCode.value  = prefill.stockCode;
    if (prefill.market)     f.elements.market.value     = prefill.market;
    if (prefill.eventType)  f.elements.eventType.value  = prefill.eventType;
    if (prefill.phase)      f.elements.phase.value      = prefill.phase;
    if (prefill.eventDate)  f.elements.eventDate.value  = prefill.eventDate;
    if (prefill.expectation){ f.elements.expectation.value = prefill.expectation; this.updateExpDisplay(prefill.expectation); }
    if (prefill.memo)       f.elements.memo.value       = prefill.memo;
    if (!prefill.eventDate) f.elements.eventDate.value  = fmtDateKey(new Date());
    qs('#event-modal-overlay').classList.remove('hidden');
  },

  openEditModal(id) {
    const e = Store.getAll().find(x => x.id === id);
    if (!e) return;
    this.editId = id;
    qs('#modal-title').textContent = '이벤트 수정';
    const f = qs('#event-form');
    f.elements.stockName.value  = e.stockName  || '';
    f.elements.stockCode.value  = e.stockCode  || '';
    f.elements.market.value     = e.market     || '';
    f.elements.eventType.value  = e.eventType  || '';
    f.elements.phase.value      = e.phase      || '';
    f.elements.eventDate.value  = e.eventDate  || '';
    f.elements.expectation.value = e.expectation || 3;
    f.elements.status.value     = e.status     || 'upcoming';
    f.elements.memo.value       = e.memo       || '';
    this.updateExpDisplay(e.expectation || 3);
    qs('#event-modal-overlay').classList.remove('hidden');
  },

  saveEvent() {
    const f = qs('#event-form');
    const d = Object.fromEntries(new FormData(f));
    if (!d.stockName || !d.market || !d.eventType || !d.eventDate) {
      Toast.show('필수 항목(*)을 모두 입력해주세요', 'error'); return;
    }
    d.expectation = parseInt(d.expectation) || 3;
    if (this.editId) {
      Store.update(this.editId, d);
      Toast.show('이벤트가 수정되었습니다', 'success');
    } else {
      Store.add(d);
      Toast.show('이벤트가 추가되었습니다', 'success');
    }
    this.closeModal('event');
    this.refresh();
  },

  /* --- Detail Modal --- */
  bindDetailModal() {
    qs('#detail-modal-close').addEventListener('click', () => this.closeModal('detail'));
    qs('#detail-close-btn').addEventListener('click',   () => this.closeModal('detail'));
    qs('#detail-modal-overlay').addEventListener('click', e => {
      if (e.target === qs('#detail-modal-overlay')) this.closeModal('detail');
    });
    qs('#detail-edit').addEventListener('click', () => {
      if (!this.detailId) return;
      this.closeModal('detail');
      this.openEditModal(this.detailId);
    });
    qs('#detail-delete').addEventListener('click', () => {
      if (!this.detailId) return;
      if (!confirm('이 이벤트를 삭제하시겠습니까?')) return;
      Store.remove(this.detailId);
      this.closeModal('detail');
      this.refresh();
      Toast.show('삭제되었습니다', 'success');
    });
  },

  showDetail(id) {
    const e = Store.getAll().find(x => x.id === id);
    if (!e) return;
    this.detailId = id;
    qs('#detail-title').textContent = `${e.stockName} — ${EVENT_TYPES[e.eventType]?.label || e.eventType}`;
    qs('#detail-body').innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><label>종목명</label><div class="detail-value">${e.stockName}</div></div>
        <div class="detail-item"><label>종목코드</label><div class="detail-value">${e.stockCode||'—'}</div></div>
        <div class="detail-item"><label>시장</label><div class="detail-value">${mktBadge(e.market)}</div></div>
        <div class="detail-item"><label>이벤트 유형</label><div class="detail-value">${typeBadge(e.eventType)}</div></div>
        <div class="detail-item"><label>임상 단계</label><div class="detail-value">${e.phase||'—'}</div></div>
        <div class="detail-item"><label>날짜</label><div class="detail-value">${fmtDate(e.eventDate)} ${diffBadge(e.eventDate)}</div></div>
        <div class="detail-item"><label>기대감</label><div class="detail-value">${stars(e.expectation||3)} <span style="font-size:12px;color:var(--text-muted)">${EXP_LABELS[e.expectation||3]}</span></div></div>
        <div class="detail-item"><label>상태</label><div class="detail-value status-badge status-${e.status}">${STATUS_LABELS[e.status]||e.status}</div></div>
      </div>
      ${e.memo?`<div><label style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:8px">메모</label><div class="detail-memo-box">${e.memo}</div></div>`:''}
      <div style="margin-top:14px;font-size:11px;color:var(--text-dim)">추가: ${e.createdAt?new Date(e.createdAt).toLocaleString('ko-KR'):'—'}</div>`;
    qs('#detail-modal-overlay').classList.remove('hidden');
  },

  /* --- Settings Modal --- */
  bindSettingsModal() {
    qs('#settings-btn').addEventListener('click', () => {
      qs('#api-key-input').value = Store.getApiKey();
      qs('#settings-modal-overlay').classList.remove('hidden');
    });
    qs('#settings-modal-close').addEventListener('click', () => this.closeModal('settings'));
    qs('#settings-cancel').addEventListener('click',      () => this.closeModal('settings'));
    qs('#settings-save').addEventListener('click', () => {
      const k = qs('#api-key-input').value.trim();
      Store.setApiKey(k);
      this.closeModal('settings');
      Toast.show('API 키가 저장되었습니다', 'success');
    });
    qs('#settings-modal-overlay').addEventListener('click', e => {
      if (e.target === qs('#settings-modal-overlay')) this.closeModal('settings');
    });
  },

  /* --- Close Modal --- */
  closeModal(type) {
    const ids = { event: 'event-modal-overlay', detail: 'detail-modal-overlay', settings: 'settings-modal-overlay' };
    qs('#' + ids[type])?.classList.add('hidden');
  },

  /* --- AI Search --- */
  bindAISearch() {
    qs('#ai-search-btn').addEventListener('click', async () => {
      const stockName = qs('#ai-stock-input').value.trim();
      const market    = qs('#ai-market-select').value;
      if (!stockName) { Toast.show('종목명을 입력해주세요', 'error'); return; }

      const btn = qs('#ai-search-btn');
      const res = qs('#ai-result');
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner"></div> 검색 중...';
      res.innerHTML = '<div class="loading"><div class="spinner"></div> AI가 이벤트를 분석 중...</div>';
      res.classList.remove('hidden');

      const results = await AI.search(stockName, market);
      btn.disabled = false;
      btn.innerHTML = '<span>🤖</span> AI 이벤트 검색';

      if (!results?.length) {
        res.innerHTML = '<p style="color:var(--text-muted);font-size:12px;padding:6px">검색 결과가 없습니다</p>';
        return;
      }

      AI._cache  = results;
      AI._stock  = stockName;
      AI._market = market;

      res.innerHTML = `
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:8px">${results.length}개 이벤트 발견 — 클릭하여 추가</div>
        ${results.map((r,i) => `
          <div class="ai-event-item">
            <div class="ai-event-type">${EVENT_TYPES[r.eventType]?.emoji||'📌'} ${EVENT_TYPES[r.eventType]?.label||r.eventType}</div>
            <div class="ai-event-desc">${r.description}</div>
            <div class="ai-event-date">📅 ${r.expectedDate}${r.phase?' · '+r.phase:''} · ${stars(r.expectation||3)}</div>
            <button class="ai-add-btn" onclick="App.addAIEvent(${i})">+ 추가하기</button>
          </div>`).join('')}`;
    });
  },

  addAIEvent(i) {
    const r = AI._cache?.[i];
    if (!r) return;
    let dt = r.expectedDate || '';
    if (/^\d{4}-Q[1-4]$/.test(dt)) {
      const q = parseInt(dt.slice(-1));
      dt = `${dt.slice(0,4)}-${pad((q-1)*3+1)}-01`;
    } else if (/^\d{4}-\d{2}$/.test(dt)) {
      dt += '-01';
    } else if (/^\d{4}$/.test(dt)) {
      dt += '-01-01';
    }
    this.openAddModal({
      stockName:  AI._stock,
      market:     AI._market,
      eventType:  r.eventType || 'other',
      phase:      r.phase || '',
      eventDate:  dt,
      expectation: r.expectation || 3,
      memo:       r.memo || r.description || '',
    });
  },

  /* --- Mobile Menu --- */
  bindMobileMenu() {
    qs('#menu-btn').addEventListener('click', () => {
      qs('#sidebar').classList.add('open');
      qs('#sidebar-overlay').classList.add('active');
    });
    qs('#sidebar-close').addEventListener('click',   closeSidebar);
    qs('#sidebar-overlay').addEventListener('click', closeSidebar);
    qsAll('.nav-item').forEach(b => b.addEventListener('click', closeSidebar));
  },

  /* --- Keyboard --- */
  bindKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeModal('event');
        this.closeModal('detail');
        this.closeModal('settings');
      }
    });
  },

  /* --- Expectation Range --- */
  initExpRange() {
    qs('#exp-range').addEventListener('input', e => this.updateExpDisplay(e.target.value));
  },
  updateExpDisplay(v) {
    qs('#exp-display').textContent = `${v} — ${EXP_LABELS[v] || ''}`;
    qs('#exp-range').value = v;
  },
};

function closeSidebar() {
  qs('#sidebar').classList.remove('open');
  qs('#sidebar-overlay').classList.remove('active');
}

/* =====================================================
   HELPERS
===================================================== */
function qs(sel) { return document.querySelector(sel); }
function qsAll(sel) { return document.querySelectorAll(sel); }

/* =====================================================
   SAMPLE DATA
===================================================== */
function maybeLoadSamples() {
  if (Store.getAll().length > 0) return;

  const addDays = n => {
    const d = new Date(); d.setDate(d.getDate() + n);
    return fmtDateKey(d);
  };

  const samples = [
    { stockName:'셀트리온',      stockCode:'068270', market:'KOSPI',  eventType:'fda_approval',       phase:'',         eventDate:addDays(14),  expectation:5, status:'upcoming', memo:'CT-P13 피하제형 FDA 우선심사 결정 예정 (생물학적 제제 허가)' },
    { stockName:'한미약품',      stockCode:'128940', market:'KOSPI',  eventType:'clinical_result',    phase:'Phase 3',  eventDate:addDays(32),  expectation:4, status:'upcoming', memo:'efinopegdutide (HM15211) NASH Phase 3 중간 분석 결과 발표' },
    { stockName:'알테오젠',      stockCode:'196170', market:'KOSDAQ', eventType:'licensing',          phase:'',         eventDate:addDays(45),  expectation:5, status:'upcoming', memo:'SC 플랫폼 ALT-B4 추가 기술이전 계약 기대 (글로벌 Big Pharma)' },
    { stockName:'유한양행',      stockCode:'000100', market:'KOSPI',  eventType:'conference',         phase:'',         eventDate:addDays(8),   expectation:3, status:'upcoming', memo:'ASCO 2026 — 렉라자+리브레반트 MARIPOSA-2 3년 추적 데이터' },
    { stockName:'에이비엘바이오', stockCode:'298380', market:'KOSDAQ', eventType:'clinical_result',   phase:'Phase 1',  eventDate:addDays(55),  expectation:3, status:'upcoming', memo:'ABL001 이중항체 고형암 Phase 1 용량증량 결과' },
    { stockName:'Moderna',       stockCode:'MRNA',   market:'NASDAQ', eventType:'pdufa',              phase:'',         eventDate:addDays(21),  expectation:4, status:'upcoming', memo:'mRNA-1345 RSV 백신 PDUFA 날짜 — 60세 이상 성인' },
    { stockName:'Alnylam',       stockCode:'ALNY',   market:'NASDAQ', eventType:'clinical_result',    phase:'Phase 3',  eventDate:addDays(60),  expectation:4, status:'upcoming', memo:'zilebesiran (RNAi) 고혈압 KARDIA-2 Phase 3 주요 결과' },
    { stockName:'Incyte',        stockCode:'INCY',   market:'NASDAQ', eventType:'earnings',           phase:'',         eventDate:addDays(18),  expectation:2, status:'upcoming', memo:'2026년 1분기 실적 발표 — Jakafi 매출 성장 주목' },
  ];
  samples.forEach(s => Store.add(s));
}

/* =====================================================
   BOOT
===================================================== */
document.addEventListener('DOMContentLoaded', () => App.init());
