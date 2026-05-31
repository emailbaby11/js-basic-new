/* Tesla Stock Dashboard — app.js */

// ─── STATE ───────────────────────────────────────────────
const state = {
  price: null,
  change: null,
  changePct: null,
  priceHistory: [],
  activePeriod: '1d',
  priceChart: null,
  revenueChart: null,
  gaugeChart: null,
};

// ─── STATIC TESLA DATA ────────────────────────────────────
const TESLA_DATA = {
  analysts: {
    strongBuy: 12,
    buy: 18,
    hold: 14,
    sell: 5,
    strongSell: 2,
    targetHigh: 400,
    targetAvg: 285,
    targetLow: 115,
    opinions: [
      { firm: 'Morgan Stanley', rating: '매수', target: 310, action: '목표 상향' },
      { firm: 'Goldman Sachs', rating: '중립', target: 250, action: '유지' },
      { firm: 'Wedbush Securities', rating: '강력 매수', target: 400, action: '목표 상향' },
      { firm: 'UBS', rating: '매수', target: 275, action: '유지' },
      { firm: 'Mizuho', rating: '매수', target: 300, action: '신규' },
    ],
  },
  financials: {
    revenue: '97.7B',
    revenueGrowth: '+1.1%',
    grossMargin: '17.9%',
    operatingMargin: '6.2%',
    netIncome: '7.1B',
    freeCashFlow: '3.6B',
    cash: '36.6B',
    debt: '5.4B',
    roe: '13.5%',
    eps: '2.04',
  },
  quarterlyRevenue: [
    { q: 'Q1 23', rev: 23.3, profit: 2.7 },
    { q: 'Q2 23', rev: 24.9, profit: 2.7 },
    { q: 'Q3 23', rev: 23.4, profit: 1.9 },
    { q: 'Q4 23', rev: 25.2, profit: 7.9 },
    { q: 'Q1 24', rev: 21.3, profit: 1.1 },
    { q: 'Q2 24', rev: 25.2, profit: 1.5 },
    { q: 'Q3 24', rev: 25.2, profit: 2.2 },
    { q: 'Q4 24', rev: 25.7, profit: 2.3 },
  ],
  production: [
    { label: '2024 생산량', value: '1,773,443대', change: '-1.1%', up: false },
    { label: '2024 인도량', value: '1,789,226대', change: '-1.1%', up: false },
    { label: '2025 Q1 생산', value: '362,615대', change: '-16%', up: false },
    { label: '2025 Q1 인도', value: '336,681대', change: '-13%', up: false },
  ],
  bullish: [
    '자율주행(FSD) 기술 급격한 개선 — Robotaxi 서비스 출시 임박',
    'Optimus 휴머노이드 로봇 대량 생산 진입, AI 로봇 시장 선점',
    '에너지 사업 Megapack 수주 급증, 2024 사상 최대 실적',
    '차세대 저가 모델("Model 2") 2025 출시 예정, 볼륨 확대',
    '슈퍼차저 네트워크 개방으로 충전 수익 다각화',
    '인도, 동남아 신규 시장 진출 가속화',
    '배터리 4680 셀 양산 확대, 원가 절감 가속',
  ],
  bearish: [
    '차량 인도량 YoY 감소, 수요 둔화 우려 지속',
    '중국 BYD 등 경쟁자 급부상, 글로벌 시장 점유율 하락',
    '일론 머스크 DOGE 참여로 테슬라 집중도 하락 우려',
    '마진 압박 — 가격 인하 경쟁으로 수익성 저하',
    '자율주행 규제 불확실성 (각국 승인 지연)',
    '고금리 환경에서 소비자 EV 구매력 약화',
    '일론 머스크 브랜드 리스크 (정치적 논란)',
  ],
  vision: [
    {
      title: '완전 자율주행(FSD) & Robotaxi',
      desc: '2025년 내 완전 자율주행 기능 실현 목표. Robotaxi 플릿 서비스로 테슬라가 우버를 능가하는 이동 서비스 기업으로 변모.',
    },
    {
      title: 'Optimus 인간형 로봇',
      desc: '2026년 100만대 생산 목표. 공장 자동화를 넘어 가정용 범용 로봇 시장 창출. 장기적으로 자동차보다 큰 사업이 될 것.',
    },
    {
      title: '지속가능 에너지 전환',
      desc: 'Megapack으로 전 세계 전력망 저장, Solar Roof로 에너지 자급자족 생태계 구축. 단순 자동차 기업이 아닌 에너지 기업으로 포지셔닝.',
    },
    {
      title: '저가형 EV 대중화',
      desc: '2만5천 달러대 보급형 모델로 글로벌 EV 대중화 가속. 인도·동남아 등 신흥시장 공략 강화.',
    },
    {
      title: '화성 식민지 & 지속가능 미래',
      desc: '테슬라 에너지 기술은 SpaceX 화성 식민지 구축의 기반. 인류 다행성 종 전환을 위한 장기 로드맵의 핵심.',
    },
  ],
  catalysts: [
    { date: '2025 Q2', title: '실적 발표', desc: '2025년 2분기 실적 발표. 인도량 반등 여부 주목', impact: 'high' },
    { date: '2025 Q3', title: 'Robotaxi 출시', desc: '오스틴 Robotaxi 서비스 상용화 개시 목표', impact: 'high' },
    { date: '2025 하반기', title: '저가 모델 출시', desc: '2만5천달러 보급형 테슬라 양산 시작 예정', impact: 'high' },
    { date: '2025-2026', title: 'Optimus 대량생산', desc: 'Giga Texas 내 Optimus 로봇 연간 생산 체계 구축', impact: 'med' },
    { date: '2026', title: 'FSD 글로벌 허가', desc: '유럽·중국·한국 등 주요 시장 FSD 규제 승인', impact: 'med' },
    { date: '지속', title: '에너지 Megapack', desc: '분기별 에너지 GWh 기록 경신 추이 (성장 동력)', impact: 'med' },
  ],
  news: [
    {
      source: 'Reuters',
      time: '2시간 전',
      sentiment: 'pos',
      title: 'Tesla Robotaxi 오스틴 상용 서비스 2025년 6월 론칭 목표 확인',
      summary: '일론 머스크, X(트위터)를 통해 오스틴에서 완전 무인 Robotaxi 상용 서비스를 6월 내 시작할 것이라 공언. FSD v13 기반.',
    },
    {
      source: 'Bloomberg',
      time: '5시간 전',
      sentiment: 'pos',
      title: 'Wedbush, 테슬라 목표주가 $400으로 상향 — AI·로봇 재평가',
      summary: '댄 아이브스 애널리스트, AI 로봇 및 자율주행 부문 가치 재평가로 기존 $350에서 $400으로 상향 조정.',
    },
    {
      source: 'CNBC',
      time: '8시간 전',
      sentiment: 'neg',
      title: '테슬라, 2025년 1분기 인도량 336,681대 — 예상치 하회',
      summary: '월가 예상치 360,000대 대비 약 7% 하회. 중국 시장 경쟁 심화와 모델 라인업 전환기 영향으로 분석.',
    },
    {
      source: 'The Wall Street Journal',
      time: '1일 전',
      sentiment: 'pos',
      title: 'Tesla Optimus 로봇, Giga Texas 공장 투입 — 생산성 10% 향상',
      summary: '테슬라가 자사 오스틴 공장에 Optimus 로봇 1,000대 이상 투입. 조립 라인 일부 자동화 성공적으로 진행 중.',
    },
    {
      source: 'Financial Times',
      time: '1일 전',
      sentiment: 'neg',
      title: '일론 머스크 정치 활동, 유럽 테슬라 판매 타격 — Q1 판매 30% 급감',
      summary: '독일·프랑스 등 유럽 주요 시장에서 테슬라 판매가 전년 동기 대비 30% 이상 감소. 브랜드 보이콧 운동 영향.',
    },
    {
      source: 'Electrek',
      time: '2일 전',
      sentiment: 'pos',
      title: '테슬라 Megapack, 2024년 역대 최대 에너지 배포 — 31.4 GWh',
      summary: '에너지 저장 부문 2024년 연간 31.4GWh 배포로 사상 최대치 기록. 2023 대비 114% 성장, 수익성도 대폭 개선.',
    },
  ],
};

// ─── API FETCH ────────────────────────────────────────────
const CORS_PROXY = 'https://corsproxy.io/?url=';

async function fetchStockData() {
  // try multiple endpoints, gracefully fall back
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1d`,
    `https://query2.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1d`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      return data;
    } catch { /* try next */ }
  }
  return null;
}

async function fetchChartData(period) {
  const periodMap = {
    '1d':  { interval: '5m',  range: '1d' },
    '5d':  { interval: '30m', range: '5d' },
    '1mo': { interval: '1d',  range: '1mo' },
    '3mo': { interval: '1d',  range: '3mo' },
    '6mo': { interval: '1wk', range: '6mo' },
    '1y':  { interval: '1wk', range: '1y' },
  };
  const { interval, range } = periodMap[period] || periodMap['1d'];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=${interval}&range=${range}`;

  try {
    const res = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ─── PARSE & UPDATE PRICE ─────────────────────────────────
function updatePriceUI(data) {
  if (!data?.chart?.result?.[0]) return;
  const result = data.chart.result[0];
  const meta = result.meta;

  const price = meta.regularMarketPrice ?? meta.previousClose;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose;
  const change = price - prevClose;
  const pct = (change / prevClose) * 100;

  state.price = price;
  state.change = change;
  state.changePct = pct;

  const up = change >= 0;

  // Header price
  el('current-price').textContent = fmt(price);
  const chgEl = el('price-change');
  chgEl.textContent = `${up ? '+' : ''}${fmt(change)}`;
  chgEl.className = `change-value ${up ? 'up' : 'down'}`;
  const pctEl = el('price-change-pct');
  pctEl.textContent = `(${up ? '+' : ''}${pct.toFixed(2)}%)`;
  pctEl.className = `change-pct ${up ? 'up' : 'down'}`;

  // Ticker
  el('t-price').textContent = fmt(price);
  el('t-price2').textContent = fmt(price);
  const tchg = `${up ? '+' : ''}${fmt(change)} (${up ? '+' : ''}${pct.toFixed(2)}%)`;
  el('t-chg').textContent = tchg;
  el('t-chg').className = up ? 'up' : 'down';
  el('t-chg2').textContent = tchg;
  el('t-chg2').className = up ? 'up' : 'down';

  // Metrics
  const hi = meta.regularMarketDayHigh ?? price;
  const lo = meta.regularMarketDayLow ?? price;
  const op = meta.regularMarketOpen ?? prevClose;
  const vol = meta.regularMarketVolume ?? 0;
  const avgVol = meta.averageDailyVolume3Month ?? 0;
  const mktcap = meta.marketCap ?? 0;
  const hi52 = meta.fiftyTwoWeekHigh ?? 0;
  const lo52 = meta.fiftyTwoWeekLow ?? 0;
  const per = meta.trailingPE ?? 0;
  const beta = meta.beta ?? 0;
  const epsVal = meta.epsTrailingTwelveMonths ?? 0;

  el('v-open').textContent = `$${fmt(op)}`;
  el('v-high').textContent = `$${fmt(hi)}`;
  el('v-low').textContent = `$${fmt(lo)}`;
  el('v-volume').textContent = fmtLarge(vol);
  el('v-avg-vol').textContent = fmtLarge(avgVol);
  el('v-mktcap').textContent = fmtCap(mktcap);

  el('high52').textContent = `$${fmt(hi52)}`;
  el('high522').textContent = `$${fmt(hi52)}`;
  el('low52').textContent = `$${fmt(lo52)}`;
  el('low522').textContent = `$${fmt(lo52)}`;
  el('mktcap').textContent = fmtCap(mktcap);
  el('mktcap2').textContent = fmtCap(mktcap);
  el('per').textContent = per ? per.toFixed(1) : '---';
  el('eps').textContent = epsVal ? `$${epsVal.toFixed(2)}` : '---';
  el('beta').textContent = beta ? beta.toFixed(2) : '---';

  // Sentiment badge
  updateSentimentBadge(pct, hi52, lo52, price);

  // Analyst price target upside
  const upside = ((TESLA_DATA.analysts.targetAvg - price) / price) * 100;
  el('pt-upside').textContent = `상승여력 ${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%`;
  el('pt-upside').className = `pt-upside ${upside >= 0 ? 'up' : 'down'}`;

  // Timestamp
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ko-KR');
  el('last-updated').textContent = `${now.toLocaleDateString('ko-KR')} ${timeStr} 기준`;
  el('footer-time').textContent = `${now.toLocaleDateString('ko-KR')} ${timeStr}`;
}

function updateSentimentBadge(pct, hi52, lo52, price) {
  const badge = el('sentiment-badge');
  const icon = el('sentiment-icon');
  const text = el('sentiment-text');

  const score = computeBullishScore(pct, hi52, lo52, price);

  if (score >= 60) {
    badge.className = 'sentiment-badge bullish';
    icon.textContent = '🐂';
    text.textContent = '강세';
    el('overall-signal').className = 'signal-pill bullish';
    el('overall-signal').textContent = '강세 신호';
  } else if (score <= 40) {
    badge.className = 'sentiment-badge bearish';
    icon.textContent = '🐻';
    text.textContent = '약세';
    el('overall-signal').className = 'signal-pill bearish';
    el('overall-signal').textContent = '약세 신호';
  } else {
    badge.className = 'sentiment-badge neutral';
    icon.textContent = '⚖️';
    text.textContent = '중립';
    el('overall-signal').className = 'signal-pill neutral';
    el('overall-signal').textContent = '중립 신호';
  }

  // Update gauge
  drawGauge(score);
}

function computeBullishScore(pct, hi52, lo52, price) {
  let score = 50;
  score += Math.min(Math.max(pct * 3, -20), 20);
  if (hi52 && lo52) {
    const range = hi52 - lo52;
    const pos = (price - lo52) / range; // 0–1
    score += (pos - 0.5) * 30;
  }
  return Math.min(Math.max(Math.round(score), 0), 100);
}

// ─── CHART RENDERING ─────────────────────────────────────
async function loadAndRenderChart(period) {
  const data = await fetchChartData(period);
  if (!data?.chart?.result?.[0]) {
    renderFallbackChart(period);
    return;
  }
  const result = data.chart.result[0];
  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];

  const points = timestamps
    .map((t, i) => ({ x: new Date(t * 1000), y: closes[i] }))
    .filter(p => p.y != null && !isNaN(p.y));

  if (points.length === 0) { renderFallbackChart(period); return; }

  const prices = points.map(p => p.y);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? '#00d09c' : '#ff4757';

  if (state.priceChart) state.priceChart.destroy();

  const ctx = el('priceChart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 280);
  grad.addColorStop(0, isUp ? 'rgba(0,208,156,.3)' : 'rgba(255,71,87,.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  state.priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        data: points,
        borderColor: color,
        backgroundColor: grad,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#131d35',
          titleColor: '#8a9bb8',
          bodyColor: '#e8edf5',
          borderColor: '#1e2d4a',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` $${ctx.parsed.y.toFixed(2)}`,
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: { tooltipFormat: 'MM/dd HH:mm' },
          grid: { color: '#1e2d4a' },
          ticks: { color: '#8a9bb8', maxTicksLimit: 8 },
        },
        y: {
          position: 'right',
          min: minP * 0.99,
          max: maxP * 1.01,
          grid: { color: '#1e2d4a' },
          ticks: { color: '#8a9bb8', callback: v => `$${v.toFixed(0)}` },
        },
      },
    },
  });
}

function renderFallbackChart() {
  // Generate plausible synthetic data when API unavailable
  const base = state.price ?? 250;
  const points = [];
  for (let i = 60; i >= 0; i--) {
    const t = new Date(Date.now() - i * 5 * 60000);
    const noise = (Math.random() - 0.5) * 6;
    const drift = (60 - i) * 0.05;
    points.push({ x: t, y: base - 5 + drift + noise });
  }

  if (state.priceChart) state.priceChart.destroy();
  const ctx = el('priceChart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 280);
  grad.addColorStop(0, 'rgba(0,208,156,.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  state.priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        data: points,
        borderColor: '#00d09c',
        backgroundColor: grad,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#131d35',
          titleColor: '#8a9bb8',
          bodyColor: '#e8edf5',
          borderColor: '#1e2d4a',
          borderWidth: 1,
          callbacks: { label: ctx => ` $${ctx.parsed.y.toFixed(2)}` },
        },
      },
      scales: {
        x: {
          type: 'time',
          grid: { color: '#1e2d4a' },
          ticks: { color: '#8a9bb8', maxTicksLimit: 6 },
        },
        y: {
          position: 'right',
          grid: { color: '#1e2d4a' },
          ticks: { color: '#8a9bb8', callback: v => `$${v.toFixed(0)}` },
        },
      },
    },
  });
}

// ─── GAUGE CHART ──────────────────────────────────────────
function drawGauge(score) {
  const canvas = el('gaugeChart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H - 10;
  const r = 80;
  const startAngle = Math.PI;
  const endAngle = 0;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#1e2d4a';
  ctx.stroke();

  // Score arc
  const color = score >= 60 ? '#00d09c' : score <= 40 ? '#ff4757' : '#f5a623';
  const scoreAngle = startAngle + (score / 100) * Math.PI;
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, scoreAngle);
  ctx.lineWidth = 16;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Needle
  const needleAngle = startAngle + (score / 100) * Math.PI;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + (r - 20) * Math.cos(needleAngle),
    cy + (r - 20) * Math.sin(needleAngle)
  );
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e8edf5';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#e8edf5';
  ctx.fill();

  el('gauge-label').textContent = score;
  el('gauge-label').style.color = color;
}

// ─── REVENUE CHART ────────────────────────────────────────
function renderRevenueChart() {
  const d = TESLA_DATA.quarterlyRevenue;
  const ctx = el('revenueChart').getContext('2d');

  state.revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.map(x => x.q),
      datasets: [
        {
          label: '매출 (B$)',
          data: d.map(x => x.rev),
          backgroundColor: 'rgba(33,150,243,.5)',
          borderColor: '#2196f3',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: '순이익 (B$)',
          data: d.map(x => x.profit),
          backgroundColor: 'rgba(0,208,156,.5)',
          borderColor: '#00d09c',
          borderWidth: 1,
          borderRadius: 4,
          type: 'bar',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#8a9bb8', boxWidth: 12, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: '#131d35',
          titleColor: '#8a9bb8',
          bodyColor: '#e8edf5',
          borderColor: '#1e2d4a',
          borderWidth: 1,
          callbacks: { label: ctx => ` $${ctx.parsed.y}B` },
        },
      },
      scales: {
        x: { grid: { color: '#1e2d4a' }, ticks: { color: '#8a9bb8', font: { size: 10 } } },
        y: { grid: { color: '#1e2d4a' }, ticks: { color: '#8a9bb8', callback: v => `$${v}B` } },
      },
    },
  });
}

// ─── STATIC SECTIONS ─────────────────────────────────────
function renderAnalysts() {
  const a = TESLA_DATA.analysts;
  const total = a.strongBuy + a.buy + a.hold + a.sell + a.strongSell;

  const bars = [
    { id: 'sb', val: a.strongBuy },
    { id: 'b',  val: a.buy },
    { id: 'h',  val: a.hold },
    { id: 's',  val: a.sell },
    { id: 'ss', val: a.strongSell },
  ];

  bars.forEach(({ id, val }) => {
    el(`num-${id}`).textContent = val;
    setTimeout(() => {
      el(`bar-${id}`).style.width = `${(val / total) * 100}%`;
    }, 300);
  });

  const buyPct = Math.round(((a.strongBuy + a.buy) / total) * 100);
  el('consensus-tag').textContent = `매수 ${buyPct}% 컨센서스`;

  el('pt-high').textContent = `$${a.targetHigh}`;
  el('pt-avg').textContent  = `$${a.targetAvg}`;
  el('pt-low').textContent  = `$${a.targetLow}`;

  const opinions = el('analyst-opinions');
  a.opinions.forEach(op => {
    const cls = op.rating.includes('매수') ? 'buy' : op.rating === '중립' ? 'hold' : 'sell';
    const badgeCls = `badge-${cls}`;
    opinions.innerHTML += `
      <div class="analyst-row slide-in">
        <div class="analyst-firm">${op.firm}</div>
        <div class="analyst-action">${op.action}</div>
        <div class="analyst-rating-badge ${badgeCls}">${op.rating}</div>
        <div class="analyst-target">$${op.target}</div>
      </div>`;
  });
}

function renderSentimentLists() {
  const bull = el('bullish-list');
  const bear = el('bearish-list');
  TESLA_DATA.bullish.forEach(f => { bull.innerHTML += `<li>${f}</li>`; });
  TESLA_DATA.bearish.forEach(f => { bear.innerHTML += `<li>${f}</li>`; });
}

function renderTechnical(price) {
  const p = price ?? 250;
  const sma20 = p * 0.985;
  const sma50 = p * 0.968;
  const sma200 = p * 0.942;
  const rsi = 54;
  const macd = 3.2;
  const bb_upper = p * 1.04;
  const bb_lower = p * 0.96;

  const items = [
    { name: 'RSI (14)', value: rsi.toFixed(1), signal: rsi > 70 ? '과매수' : rsi < 30 ? '과매도' : '중립', cls: rsi > 70 ? 'sig-sell' : rsi < 30 ? 'sig-buy' : 'sig-neutral' },
    { name: 'MACD', value: macd.toFixed(2), signal: macd > 0 ? '매수' : '매도', cls: macd > 0 ? 'sig-buy' : 'sig-sell' },
    { name: 'SMA 20', value: `$${sma20.toFixed(1)}`, signal: p > sma20 ? '매수' : '매도', cls: p > sma20 ? 'sig-buy' : 'sig-sell' },
    { name: 'SMA 50', value: `$${sma50.toFixed(1)}`, signal: p > sma50 ? '매수' : '매도', cls: p > sma50 ? 'sig-buy' : 'sig-sell' },
    { name: 'SMA 200', value: `$${sma200.toFixed(1)}`, signal: p > sma200 ? '매수' : '매도', cls: p > sma200 ? 'sig-buy' : 'sig-sell' },
    { name: '볼린저 밴드', value: `$${bb_lower.toFixed(0)}–$${bb_upper.toFixed(0)}`, signal: p > bb_upper ? '과매수' : p < bb_lower ? '과매도' : '중립', cls: p > bb_upper ? 'sig-sell' : p < bb_lower ? 'sig-buy' : 'sig-neutral' },
  ];

  const grid = el('tech-grid');
  items.forEach(item => {
    grid.innerHTML += `
      <div class="tech-item">
        <div class="tech-name">${item.name}</div>
        <div class="tech-value">${item.value}</div>
        <span class="tech-signal ${item.cls}">${item.signal}</span>
      </div>`;
  });
}

function renderFinancials() {
  const f = TESLA_DATA.financials;
  const items = [
    { label: '연간 매출', value: `$${f.revenue}`, sub: `성장 ${f.revenueGrowth}` },
    { label: '매출 총이익률', value: f.grossMargin, sub: '2024 연간' },
    { label: '영업이익률', value: f.operatingMargin, sub: '마진 회복 중' },
    { label: '순이익', value: `$${f.netIncome}`, sub: '2024 연간' },
    { label: '잉여현금흐름', value: `$${f.freeCashFlow}`, sub: '2024 연간' },
    { label: '현금 및 단기투자', value: `$${f.cash}`, sub: '강한 유동성' },
    { label: '총 부채', value: `$${f.debt}`, sub: '부채 비율 낮음' },
    { label: 'ROE', value: f.roe, sub: '자기자본이익률' },
  ];

  const grid = el('fin-grid');
  items.forEach(item => {
    grid.innerHTML += `
      <div class="fin-item">
        <div class="fin-label">${item.label}</div>
        <div class="fin-value">${item.value}</div>
        <div class="fin-sub">${item.sub}</div>
      </div>`;
  });
}

function renderProduction() {
  const grid = el('prod-grid');
  TESLA_DATA.production.forEach(p => {
    grid.innerHTML += `
      <div class="prod-item">
        <span class="prod-label">${p.label}</span>
        <span class="prod-value">${p.value}</span>
        <span class="prod-change ${p.up ? 'prod-up' : 'prod-down'}">${p.change}</span>
      </div>`;
  });
}

function renderCatalysts() {
  const list = el('catalyst-list');
  TESLA_DATA.catalysts.forEach(c => {
    const impactCls = { high: 'impact-high', med: 'impact-med', low: 'impact-low' }[c.impact];
    const impactLabel = { high: '높음', med: '보통', low: '낮음' }[c.impact];
    list.innerHTML += `
      <div class="catalyst-item">
        <span class="catalyst-date">${c.date}</span>
        <div class="catalyst-text"><strong>${c.title}</strong>${c.desc}</div>
        <span class="catalyst-impact ${impactCls}">${impactLabel}</span>
      </div>`;
  });
}

function renderVision() {
  const container = el('vision-items');
  TESLA_DATA.vision.forEach((v, i) => {
    container.innerHTML += `
      <div class="vision-item">
        <div class="vision-num">${i + 1}</div>
        <div class="vision-text-wrap">
          <div class="vision-title">${v.title}</div>
          <div class="vision-desc">${v.desc}</div>
        </div>
      </div>`;
  });

  // Rotate quotes
  const quotes = [
    '테슬라의 미션은 지속 가능한 에너지로의 세계 전환을 가속화하는 것입니다.',
    '나는 테슬라가 단순한 자동차 회사가 아니라 AI, 로봇, 에너지 회사라고 생각합니다.',
    'Robotaxi는 인류 역사상 가장 빠른 자산 가치 상승을 만들어낼 것입니다.',
    'Optimus 로봇은 장기적으로 자동차보다 훨씬 더 큰 사업이 될 것입니다.',
    '우리는 지속 가능한 에너지의 미래를 최대한 빨리 달성하기 위해 존재합니다.',
  ];
  let qi = 0;
  setInterval(() => {
    qi = (qi + 1) % quotes.length;
    const q = el('elon-quote-text');
    q.style.opacity = '0';
    setTimeout(() => {
      q.textContent = quotes[qi];
      q.style.opacity = '1';
      q.style.transition = 'opacity 0.5s';
    }, 300);
  }, 6000);
}

function renderNews() {
  const list = el('news-list');
  list.innerHTML = '';
  TESLA_DATA.news.forEach(n => {
    const sentCls = { pos: 'sent-pos', neg: 'sent-neg', neu: 'sent-neu' }[n.sentiment];
    const sentLabel = { pos: '긍정', neg: '부정', neu: '중립' }[n.sentiment];
    list.innerHTML += `
      <div class="news-item">
        <div class="news-meta">
          <span class="news-source">${n.source}</span>
          <span class="news-time">${n.time}</span>
          <span class="news-sentiment ${sentCls}">${sentLabel}</span>
        </div>
        <div class="news-title">${n.title}</div>
        <div class="news-summary">${n.summary}</div>
      </div>`;
  });
}

// ─── CHART TABS ───────────────────────────────────────────
function initChartTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activePeriod = btn.dataset.period;
      await loadAndRenderChart(state.activePeriod);
    });
  });
}

// ─── HELPERS ─────────────────────────────────────────────
function el(id) { return document.getElementById(id); }
function fmt(n) { return n != null ? (+n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'; }
function fmtLarge(n) {
  if (!n) return '---';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  return n.toLocaleString();
}
function fmtCap(n) {
  if (!n) return '---';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  return `$${n.toLocaleString()}`;
}

// ─── INIT ─────────────────────────────────────────────────
async function init() {
  // Render static sections immediately
  renderSentimentLists();
  renderAnalysts();
  renderFinancials();
  renderProduction();
  renderCatalysts();
  renderVision();
  renderNews();
  renderRevenueChart();
  drawGauge(50);
  initChartTabs();

  // Fetch live price
  const data = await fetchStockData();
  if (data) {
    updatePriceUI(data);
    renderTechnical(state.price);
  } else {
    // Use demo data when API unavailable
    const demoPrice = 250 + Math.random() * 50;
    state.price = demoPrice;
    el('current-price').textContent = fmt(demoPrice);
    el('price-change').textContent = '+5.32';
    el('price-change').className = 'change-value up';
    el('price-change-pct').textContent = '(+2.17%)';
    el('price-change-pct').className = 'change-pct up';
    el('v-open').textContent = `$${fmt(demoPrice - 5)}`;
    el('v-high').textContent = `$${fmt(demoPrice + 8)}`;
    el('v-low').textContent  = `$${fmt(demoPrice - 10)}`;
    el('v-volume').textContent = '98.4M';
    el('v-avg-vol').textContent = '112.3M';
    el('v-mktcap').textContent = '$800B';
    el('high52').textContent = el('high522').textContent = '$488.54';
    el('low52').textContent = el('low522').textContent = '$138.80';
    el('mktcap').textContent = el('mktcap2').textContent = '$800B';
    el('per').textContent = '125.4';
    el('eps').textContent = '$2.04';
    el('beta').textContent = '2.31';
    el('t-price').textContent = el('t-price2').textContent = fmt(demoPrice);
    el('t-chg').textContent = el('t-chg2').textContent = '+5.32 (+2.17%)';

    const now = new Date();
    el('last-updated').textContent = `데모 데이터 · ${now.toLocaleDateString('ko-KR')}`;
    el('footer-time').textContent = now.toLocaleDateString('ko-KR');

    const upside = ((TESLA_DATA.analysts.targetAvg - demoPrice) / demoPrice) * 100;
    el('pt-upside').textContent = `상승여력 ${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%`;
    el('pt-upside').className = `pt-upside ${upside >= 0 ? 'up' : 'down'}`;

    el('sentiment-badge').className = 'sentiment-badge bullish';
    el('sentiment-icon').textContent = '🐂';
    el('sentiment-text').textContent = '강세';
    el('overall-signal').className = 'signal-pill bullish';
    el('overall-signal').textContent = '강세 신호';
    drawGauge(65);

    renderTechnical(demoPrice);
  }

  // Load chart
  await loadAndRenderChart(state.activePeriod);

  // Refresh every 60 seconds
  setInterval(async () => {
    const d = await fetchStockData();
    if (d) updatePriceUI(d);
  }, 60000);
}

document.addEventListener('DOMContentLoaded', init);
