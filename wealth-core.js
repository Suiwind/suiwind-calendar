/* 素账 · 金额、流水、解析与图表统计核心（V3.6.1）
 * 金额以整数分计，100% 兼容 suzhang-v1 档案结构，零第三方依赖。
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SuzhangCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const TYPES = {
    expense: '日常 / 个人支出',
    family: '家庭支持',
    labor: '劳动收入',
    cost: '副业成本',
    reward: '副业奖励消费',
    income: '其他收入',
    refund: '退款 / AA 收回',
    transfer: '账户转移 / 还款',
    card: '亲情卡消费',
    card_refund: '亲情卡退款',
    interest: '利息 / 投资收益',
    fee: '手续费 / 投资费用',
    subsidy: '平台优惠',
    gain: '投资估值增加',
    loss: '投资估值减少',
    adjust_up: '待查差额增加',
    adjust_down: '待查差额减少'
  };

  const CATS = [
    '正餐', '零食饮品', '日用购物', '交通出行', '学习娱乐',
    '偶发支出', '住房固定', '未明细日常消费', '未分类',
    '副业经营', '副业奖励', '投资费用', '其他'
  ];

  const BUCKETS = {
    daily: '日常',
    fixed: '固定',
    occasional: '偶发',
    business: '副业',
    other: '其他',
    none: '不计个人消费预算'
  };

  const STATUS = {
    confirmed: '已确认',
    estimated: '待核实',
    pending: '在途'
  };

  const ACCOUNTS = [
    ['bank', '主账户 · 活期', 'cash'],
    ['deposit', '主账户 · 定存', 'deposit'],
    ['cashfund', '主账户 · 现金管理', 'cash'],
    ['cashpending', '现金管理在途', 'pending'],
    ['work', '个人收入账户', 'cash'],
    ['workreserve', '个人收入 · 储蓄', 'deposit'],
    ['wallet', '日常钱包 · 零钱', 'cash'],
    ['walletfund', '日常钱包 · 现金管理', 'cash'],
    ['fund', '长期投资基金', 'investment'],
    ['fundpending', '基金申购在途', 'pending'],
    ['pay', '支付账户余额', 'cash'],
    ['payfund', '支付账户现金管理', 'cash'],
    ['broker', '证券冷备', 'cash'],
    ['restricted', '可退押金', 'restricted'],
    ['debt', '信用 / 借款负债', 'liability'],
    ['card', '亲情卡（独立）', 'external']
  ];

  const MONEY_LIMIT = 100000000000;
  const id = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  const date = (v = new Date()) => new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(v);
  const dayAdd = (d, n) => date(new Date(new Date(d + 'T12:00:00+08:00').getTime() + n * 86400000));

  function validDate(d) {
    if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
    try { return date(new Date(d + 'T12:00:00+08:00')) === d; } catch { return false; }
  }

  function cents(v) {
    if (typeof v === 'number') {
      if (!Number.isFinite(v) || v < 0) throw Error('金额必须是非负数字，最多两位小数');
      v = v.toFixed(2).replace(/\.?0+$/, '') || '0';
    }
    if (typeof v !== 'string') throw Error('金额必须是非负数字，最多两位小数');
    const clean = v.trim().replace(/^[¥￥]\s*/, '').replace(/\s*元$/, '').replace(/,/g, '');
    if (!/^\d+(?:\.\d{1,2})?$/.test(clean)) throw Error('金额必须是非负数字，最多两位小数');
    const [a, b = ''] = clean.split('.');
    const n = Number(a) * 100 + Number(b.padEnd(2, '0'));
    if (!Number.isSafeInteger(n) || n > MONEY_LIMIT) throw Error('金额过大');
    return n;
  }

  const fmt = n => n == null ? '—' : (n / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sum = a => a.reduce((x, y) => x + y, 0);
  const clone = x => JSON.parse(JSON.stringify(x));

  const blank = () => ({
    format: 'suzhang-v1',
    revision: id(),
    start: date(),
    accounts: ACCOUNTS.map(([accId, name, kind]) => ({ id: accId, name, kind, opening: 0, status: 'estimated', asOf: '', note: '' })),
    entries: [],
    rules: {
      daily: null, card: null, fixed: null, annual: null,
      safety: null, activeBuffer: null, depositTrigger: null, reviewTrigger: null,
      rewardFloor: null, rewardLow: 20, rewardHigh: 30,
      workTarget: null, workReserve: null, workLossCarry: 0,
      goalLow: null, goalMid: null, goalHigh: null, goalDate: '',
      rent: null, rentDate: '', rentCycle: 1,
      invest: null, investDay: 6, investActive: false,
      initialBaseline: null, planStart: '',
      forecastIncome: [], forecastOut: [], milestones: []
    },
    products: [],
    reminders: [],
    notes: [],
    reports: []
  });

  function isMoney(n, negative = false) {
    return Number.isSafeInteger(n) && Math.abs(n) <= MONEY_LIMIT && (negative || n >= 0);
  }

  function cleanText(v, max = 2000) {
    if (typeof v !== 'string' || v.length > max) throw Error('文本字段无效或过长');
    return v;
  }

  function checkEntry(e, s) {
    if (!e || typeof e !== 'object' || !Object.hasOwn(TYPES, e.type) || !validDate(e.date) || e.date < s.start || e.date > date() || !isMoney(e.amount) || e.amount === 0) {
      throw Error('流水日期、类型或金额无效（仅记录启账日至今天的真实事项）');
    }
    if (!Object.hasOwn(STATUS, e.status) || !Object.hasOwn(BUCKETS, e.bucket) || !CATS.includes(e.category)) {
      throw Error('流水分类或状态无效');
    }
    cleanText(e.note, 300);
    const a = s.accounts.find(x => x.id === e.account);
    if (!a) throw Error('请选择实际账户');
    if (e.type === 'transfer') {
      const b = s.accounts.find(x => x.id === e.to);
      if (!b || b.id === a.id || a.kind === 'external' || b.kind === 'external') {
        throw Error('请选择不同的转出和转入账户');
      }
    } else if (['card', 'card_refund'].includes(e.type)) {
      if (a.kind !== 'external') throw Error('亲情卡需记入独立账户');
    } else if (a.kind === 'external') {
      throw Error('亲情卡只记录其消费及退款');
    }
    return e;
  }

  function validate(s) {
    if (!s || s.format !== 'suzhang-v1' || !validDate(s.start) || s.start > date() || typeof s.revision !== 'string' || !Array.isArray(s.accounts) || s.accounts.length !== ACCOUNTS.length || !Array.isArray(s.entries) || s.entries.length > 30000) {
      throw Error('不是有效的素账档案');
    }
    const ids = new Set();
    for (const a of s.accounts) {
      const def = ACCOUNTS.find(x => x[0] === a.id);
      if (!def || ids.has(a.id) || a.kind !== def[2] || !isMoney(a.opening, a.kind === 'liability') || (a.kind === 'liability' && a.opening > 0) || (a.kind === 'external' && a.opening !== 0) || !Object.hasOwn(STATUS, a.status)) {
        throw Error('账户档案无效');
      }
      ids.add(a.id);
      cleanText(a.name, 80);
      cleanText(a.note || '', 1000);
      if (a.asOf && !validDate(a.asOf)) throw Error('对账日期无效');
    }
    const es = new Set();
    for (const e of s.entries) {
      checkEntry(e, s);
      if (typeof e.id !== 'string' || es.has(e.id) || typeof e.void !== 'boolean') throw Error('流水编号无效');
      es.add(e.id);
    }
    const r = s.rules;
    if (!r || typeof r !== 'object') throw Error('缺少方案参数');
    for (const k of ['daily', 'card', 'fixed', 'annual', 'safety', 'activeBuffer', 'depositTrigger', 'reviewTrigger', 'rewardFloor', 'workTarget', 'workReserve', 'workLossCarry', 'goalLow', 'goalMid', 'goalHigh', 'rent', 'invest', 'initialBaseline']) {
      if (r[k] != null && !isMoney(r[k])) throw Error('方案金额无效：' + k);
    }
    for (const k of ['rewardLow', 'rewardHigh']) {
      if (!Number.isFinite(r[k]) || r[k] < 0 || r[k] > 100) throw Error('奖励比例无效');
    }
    if (r.rewardLow > r.rewardHigh || ![1, 2, 3, 6, 12].includes(r.rentCycle) || !Number.isInteger(r.investDay) || r.investDay < 1 || r.investDay > 28 || typeof r.investActive !== 'boolean') {
      throw Error('周期或比例无效');
    }
    for (const k of ['goalDate', 'rentDate', 'planStart']) {
      if (r[k] && !validDate(r[k])) throw Error('方案日期无效');
    }
    for (const k of ['forecastIncome', 'forecastOut', 'milestones']) {
      if (!Array.isArray(r[k]) || r[k].length > 1000) throw Error('计划列表无效');
      const fi = new Set();
      for (const x of r[k]) {
        if (!validDate(x.date) || !isMoney(x.amount) || typeof x.id !== 'string' || fi.has(x.id)) throw Error('计划项目无效');
        fi.add(x.id);
        cleanText(x.label, 120);
      }
    }
    for (const k of ['products', 'reminders', 'notes', 'reports']) {
      if (!Array.isArray(s[k]) || s[k].length > 1000) throw Error('档案扩展数据无效');
    }
    for (const x of s.products) {
      cleanText(x.name, 120);
      cleanText(x.detail || '', 1000);
      if (x.amount != null && !isMoney(x.amount)) throw Error('产品金额无效');
      if (x.maturity && !validDate(x.maturity)) throw Error('产品日期无效');
      if (x.start && !validDate(x.start)) throw Error('产品日期无效');
    }
    for (const x of s.reminders) {
      cleanText(x.label, 120);
      if (!validDate(x.date) || typeof x.id !== 'string') throw Error('提醒无效');
    }
    for (const x of s.notes) cleanText(x, 3000);
    for (const x of s.reports) {
      cleanText(x.key, 80);
      cleanText(x.text, 30000);
    }
    return s;
  }

  const live = (s, through = '9999-12-31') => s.entries.filter(e => !e.void && e.date <= through);
  const minus = new Set(['expense', 'cost', 'reward', 'card', 'fee', 'loss', 'adjust_down']);

  function effects(e) {
    if (e.type === 'transfer') return [[e.account, -e.amount], [e.to, e.amount]];
    return [[e.account, (minus.has(e.type) ? -1 : 1) * e.amount]];
  }

  function balances(s, through = '9999-12-31') {
    const b = Object.fromEntries(s.accounts.map(a => [a.id, a.opening]));
    for (const e of live(s, through)) {
      for (const [k, n] of effects(e)) b[k] += n;
    }
    return b;
  }

  function totals(s, b = balances(s)) {
    let assets = 0, debt = 0;
    for (const a of s.accounts) {
      if (a.kind === 'external') continue;
      const n = b[a.id];
      if (a.kind === 'liability' || n < 0) debt += Math.max(0, -n);
      if (n > 0 && a.kind !== 'liability') assets += n;
    }
    return {
      assets,
      debt,
      net: assets - debt,
      liquid: sum(s.accounts.filter(a => a.kind === 'cash').map(a => Math.max(0, b[a.id]))),
      pending: sum(s.accounts.filter(a => a.kind === 'pending').map(a => b[a.id])),
      restricted: b.restricted
    };
  }

  const fingerprint = e => [e.date, e.type, e.account, e.to || '', e.amount, e.note.trim().replace(/\s+/g, '').toLowerCase()].join('|');

  function bucketFor(t, c) {
    if (t === 'cost') return 'business';
    if (t === 'reward') return 'other';
    if (!['expense', 'refund'].includes(t)) return 'none';
    if (c === '住房固定') return 'fixed';
    if (c === '偶发支出') return 'occasional';
    return 'daily';
  }

  function makeEntry(p) {
    const type = p.type || 'expense', category = p.category || '未分类';
    return {
      id: p.id || id(),
      date: p.date || date(),
      type,
      amount: p.amount ?? 0,
      account: p.account || '',
      to: p.to || '',
      category,
      bucket: p.bucket || bucketFor(type, category),
      note: String(p.note || '').slice(0, 300),
      status: p.status || 'confirmed',
      void: false
    };
  }

  function stats(s, start, end) {
    const es = live(s, end).filter(e => e.date >= start);
    const cat = {};
    const bud = { daily: 0, fixed: 0, occasional: 0, business: 0, other: 0, none: 0 };
    let family = 0, labor = 0, cost = 0, other = 0, spend = 0, card = 0, invest = 0, fee = 0, subsidy = 0, adjust = 0, unknown = 0;
    for (const e of es) {
      const a = e.amount, t = e.type;
      if (e.status !== 'confirmed') unknown++;
      if (t === 'family') family += a;
      if (t === 'labor') labor += a;
      if (t === 'cost') { cost += a; bud.business += a; }
      if (t === 'income') other += a;
      if (['expense', 'reward', 'refund'].includes(t)) {
        const n = t === 'refund' ? -a : a;
        spend += n;
        cat[e.category] = (cat[e.category] || 0) + n;
        bud[e.bucket] += n;
      }
      if (t === 'card') card += a;
      if (t === 'card_refund') card -= a;
      if (['interest', 'gain', 'loss'].includes(t)) invest += (t === 'loss' ? -a : a);
      if (t === 'fee') fee += a;
      if (t === 'subsidy') subsidy += a;
      if (t.startsWith('adjust_')) adjust += (t === 'adjust_down' ? -a : a);
    }
    const income = family + labor + other;
    const netIncome = income - cost;
    const saved = netIncome - spend - fee;
    return {
      count: es.length, unknown, family, labor, cost, other, income, netIncome,
      spend, card, invest, fee, subsidy, adjust, cat, bud, saved,
      savingRate: netIncome > 0 ? saved / netIncome * 100 : null,
      change: saved + invest + subsidy + adjust
    };
  }

  function period(kind, anchor) {
    const [y, m] = anchor.split('-').map(Number);
    let sm = m, n = 1;
    if (kind === 'quarter') { sm = Math.floor((m - 1) / 3) * 3 + 1; n = 3; }
    if (kind === 'year') { sm = 1; n = 12; }
    const start = `${y}-${String(sm).padStart(2, '0')}-01`;
    const e = new Date(Date.UTC(y, sm + n - 1, 0, 12));
    return { start, end: e.toISOString().slice(0, 10) };
  }

  function forecast(s, stress = false, rentOverride = null) {
    const r = s.rules, b = balances(s), today = date();
    if (!r.rentDate || r.rentDate < today || r.rent == null || r.safety == null) return null;
    const rent = rentOverride ?? r.rent * r.rentCycle;
    const base = b.bank + b.cashfund + b.cashpending;
    const cashBase = b.bank;
    const pending = s.rules.forecastIncome.filter(x => !x.done && x.date >= today && x.date <= r.rentDate && (!stress || x.stress !== false));
    const out = r.forecastOut.filter(x => !x.done && x.date >= today && x.date <= r.rentDate);
    const events = [
      ...pending.map(x => ({ ...x, n: x.amount })),
      ...out.map(x => ({ ...x, n: -x.amount })),
      { id: 'rent', date: r.rentDate, label: '房租', n: -rent }
    ].sort((a, b2) => a.date.localeCompare(b2.date) || a.n - b2.n);
    let cur = base, min = cur;
    for (const e of events) { cur += e.n; min = Math.min(min, cur); }
    return {
      base, cashBase, events,
      income: sum(pending.map(x => x.amount)),
      out: sum(out.map(x => x.amount)),
      rent, left: cur, margin: cur - r.safety, min, conditional: true
    };
  }

  /* 修复口径串台：
   * 1. 定投升级复盘（15,000）：建行(定存+现金管理+活期[含在途参考]) - 下期完整房租 - 近期必要开支
   *    不重复扣除未来由未来生活费覆盖的常规微信补足与定投计划。
   * 2. 新增定存触发（5,000）：保持严格保守，用已确认建行流动资金扣除房租、全部预测转出与安全垫。
   */
  function thresholds(s) {
    const b = balances(s), r = s.rules, today = date();
    const rent = r.rent != null ? r.rent * r.rentCycle : null;
    const rentDateExpired = !!r.rentDate && r.rentDate < today;
    const future = r.forecastOut.filter(x => !x.done && x.date >= today && (!r.rentDate || rentDateExpired || x.date <= r.rentDate));
    const recurringRe = /补微信|补足微信|零钱通|定投|买基金|申购/;
    const necessaryItems = future.filter(x => !recurringRe.test(String(x.label || '')));
    const allOut = sum(future.map(x => x.amount));
    const necessaryOut = sum(necessaryItems.map(x => x.amount));
    const liquidConfirmed = b.bank + b.cashfund;
    const liquidAll = liquidConfirmed + b.cashpending;
    const review = rent != null ? (liquidAll + b.deposit - rent - necessaryOut) : null;
    const reviewConfirmed = rent != null ? (liquidConfirmed + b.deposit - rent - necessaryOut) : null;
    const surplus = (rent != null && r.safety != null && !rentDateExpired)
      ? (liquidConfirmed - rent - allOut - r.safety)
      : null;
    return { review, reviewConfirmed, surplus, out: allOut, necessaryOut, rentDateExpired };
  }

  function workCarry(s, month) {
    let carry = s.rules.workLossCarry || 0;
    const months = [...new Set(live(s).filter(e => e.date.slice(0, 7) < month && ['labor', 'cost'].includes(e.type)).map(e => e.date.slice(0, 7)))].sort();
    for (const m of months) {
      const p = period('month', m), v = stats(s, p.start, p.end);
      carry = Math.max(0, carry + v.cost - v.labor);
    }
    return carry;
  }

  function fundStats(s) {
    let paid = 0, redeemed = 0, subsidy = 0, fees = 0;
    const ids = ['fund', 'fundpending'];
    for (const e of live(s)) {
      if (e.type === 'transfer') {
        if (ids.includes(e.to) && !ids.includes(e.account)) paid += e.amount;
        if (ids.includes(e.account) && !ids.includes(e.to)) redeemed += e.amount;
      }
      if (ids.includes(e.account) && e.type === 'subsidy') subsidy += e.amount;
      if (ids.includes(e.account) && e.type === 'fee') fees += e.amount;
    }
    const b = balances(s), value = b.fund + b.fundpending;
    return {
      paid, redeemed, subsidy, fees, value,
      profit: value + redeemed - paid,
      opening: s.accounts.filter(a => ids.includes(a.id)).reduce((t, a) => t + a.opening, 0)
    };
  }

  /* ===== 可视化图表纯数据计算 ===== */
  function assetAllocation(s, b = balances(s)) {
    const pos = idList => sum(idList.map(k => Math.max(0, b[k] || 0)));
    const buckets = [
      { key: 'deposit', label: '稳健定存', amount: pos(['deposit', 'workreserve']), colorKey: 'accent' },
      { key: 'liquid', label: '流动应急', amount: pos(['bank', 'cashfund', 'cashpending', 'work', 'pay', 'payfund', 'broker']), colorKey: 'wood' },
      { key: 'wallet', label: '日常钱包', amount: pos(['wallet', 'walletfund']), colorKey: 'ochre' },
      { key: 'invest', label: '长期基金', amount: pos(['fund', 'fundpending']), colorKey: 'seal' },
      { key: 'restricted', label: '可退押金', amount: pos(['restricted']), colorKey: 'info' }
    ].filter(x => x.amount > 0);
    const total = sum(buckets.map(x => x.amount));
    const items = buckets.map(x => ({ ...x, pct: total > 0 ? x.amount / total * 100 : 0 }));
    const investAmt = pos(['fund', 'fundpending']);
    return { total, equityRatio: total > 0 ? investAmt / total * 100 : 0, items };
  }

  function nextMonthKey(ym) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(Date.UTC(y, m, 1, 12));
    return d.toISOString().slice(0, 7);
  }

  function monthlyAssetSeries(s) {
    const todayStr = date();
    const startYm = s.start.slice(0, 7);
    const endYm = todayStr.slice(0, 7);
    const actual = [];
    let cur = startYm, guard = 0;
    while (cur <= endYm && guard < 36) {
      const p = period('month', cur);
      const cut = p.end > todayStr ? todayStr : p.end;
      const tot = totals(s, balances(s, cut));
      actual.push({ month: cur, date: cut, assets: tot.assets, net: tot.net });
      cur = nextMonthKey(cur);
      guard++;
    }
    const milestones = (s.rules.milestones || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    return { actual, milestones };
  }

  function dailySpendSeries(s, start, end) {
    const map = {};
    for (const e of live(s, end)) {
      if (e.date < start) continue;
      if (['expense', 'reward', 'refund'].includes(e.type)) {
        map[e.date] = (map[e.date] || 0) + (e.type === 'refund' ? -e.amount : e.amount);
      }
    }
    const days = [];
    let d = start, guard = 0, max = 0, maxDate = '';
    while (d <= end && guard < 35) {
      const amount = Math.max(0, map[d] || 0);
      if (amount > max) { max = amount; maxDate = d; }
      days.push({ date: d, day: Number(d.slice(8, 10)), amount });
      d = dayAdd(d, 1);
      guard++;
    }
    return { days, max, maxDate };
  }

  function monthlyFlowSeries(s, start, end) {
    const todayStr = date();
    const startYm = start.slice(0, 7);
    const endYm = (end > todayStr ? todayStr : end).slice(0, 7);
    const items = [];
    let cur = startYm, guard = 0;
    while (cur <= endYm && guard < 24) {
      const mp = period('month', cur);
      const ms = mp.start < start ? start : mp.start;
      const me = mp.end > end ? end : mp.end;
      if (me >= s.start) {
        const st = stats(s, ms, me);
        items.push({ month: cur, label: `${Number(cur.slice(5, 7))}月`, netIncome: st.netIncome, spend: st.spend, saved: st.saved });
      }
      cur = nextMonthKey(cur);
      guard++;
    }
    return items;
  }

  /* ===== 强容错 AI JSON 提取器 ===== */
  function extractBalancedJson(str) {
    for (let i = 0; i < str.length; i++) {
      const open = str[i];
      if (open !== '{' && open !== '[') continue;
      const close = open === '{' ? '}' : ']';
      let depth = 0, inStr = false, escaped = false;
      for (let j = i; j < str.length; j++) {
        const ch = str[j];
        if (inStr) {
          if (escaped) escaped = false;
          else if (ch === '\\') escaped = true;
          else if (ch === '"') inStr = false;
        } else {
          if (ch === '"') inStr = true;
          else if (ch === open) depth++;
          else if (ch === close) {
            depth--;
            if (depth === 0) {
              const candidate = str.slice(i, j + 1);
              try { return JSON.parse(candidate); } catch {}
              break;
            }
          }
        }
      }
    }
    throw Error('AI 返回的流水格式无效');
  }

  function parseAI(text) {
    const raw = String(text || '').trim();
    if (!raw) throw Error('AI 返回内容为空');
    let v;
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const stripped = fenced ? fenced[1].trim() : raw;
    try {
      v = JSON.parse(stripped);
    } catch {
      v = extractBalancedJson(stripped);
    }
    const rows = Array.isArray(v) ? v : (Array.isArray(v?.entries) ? v.entries : (v && typeof v === 'object' && ('amount' in v || 'note' in v) ? [v] : null));
    if (!Array.isArray(rows) || rows.length > 100) throw Error('AI 返回的流水格式无效');
    return rows;
  }

  /* ===== 智能离线速记解析器（支持中文日期、多数字智能取金额、空格多笔、微信默认零钱通） ===== */
  function inferCategory(t) {
    if (/房租|水电|话费|网费|物业/.test(t)) return '住房固定';
    if (/奶茶|咖啡|瑞幸|星巴克|库迪|霸王茶姬|零食|饮料|甜品|雪糕|冰激凌|水果|面包|蛋糕/.test(t)) return '零食饮品';
    if (/早餐|午饭|晚饭|早饭|午餐|晚餐|吃饭|外卖|聚餐|食堂|正餐|麻辣烫|面条|米饭|盖饭|汉堡|肯德基|麦当劳|海底捞|烧烤|宵夜|夜宵|饭/.test(t)) return '正餐';
    if (/旅游|机票|酒店|高铁|火车票|医药|医疗|看病|买药|维修|衣服|鞋子|返乡|体检|医保/.test(t)) return '偶发支出';
    if (/地铁|公交|打车|滴滴|共享单车|单车|交通|车票|充公交/.test(t)) return '交通出行';
    if (/学习|书|资料|网课|考试|电影|游戏|演出|话剧|门票|会员|软件/.test(t)) return '学习娱乐';
    if (/购物|日用|牙膏|纸巾|洗衣液|洗发水|超市|淘宝|拼多多|京东|快递|文具/.test(t)) return '日用购物';
    if (/声卡|麦克风|音频|话筒|抽成|剪辑|配音/.test(t)) return '副业经营';
    return '未分类';
  }

  function resolveCnDate(monthNum, dayNum, anchor) {
    const ay = Number(anchor.slice(0, 4));
    const pad2 = n => String(n).padStart(2, '0');
    let cand = `${ay}-${pad2(monthNum)}-${pad2(dayNum)}`;
    if (!validDate(cand)) return '';
    if (cand > dayAdd(anchor, 30)) {
      const prev = `${ay - 1}-${pad2(monthNum)}-${pad2(dayNum)}`;
      if (validDate(prev)) cand = prev;
    }
    return cand;
  }

  function extractAmountFromText(detail) {
    // 1. 优先匹配显式货币标记
    const explicit = [
      ...detail.matchAll(/(?:¥|￥)\s*(\d+(?:\.\d{1,2})?)/g),
      ...detail.matchAll(/(?<![\d.])(\d+(?:\.\d{1,2})?)\s*(?:元|块|rmb|RMB)/g)
    ];
    if (explicit.length >= 1) {
      try { return cents(explicit[explicit.length - 1][1]); } catch {}
    }
    // 2. 剔除数量/时间/规格数字后再提取金额
    const cleaned = detail.replace(/(?<![\d.])\d+(?:\.\d+)?\s*(?:杯|个|份|件|瓶|盒|包|次|天|张|本|支|根|双|套|斤|两|克|g|kg|ml|L|km|公里|小时|分钟|点|时|分|月|日|号|折|%|期|单)(?![\d.])/gi, ' ');
    const nums = [...cleaned.matchAll(/(?<![\d.])(\d+(?:\.\d{1,2})?)(?![\d.])/g)];
    if (nums.length >= 1) {
      try { return cents(nums[nums.length - 1][1]); } catch {}
    }
    return 0;
  }

  function splitSpaceItems(chunk) {
    // 仅当同一短句内出现 2 个以上「短文字+空格/直接数字」组合，且不含长句关键词时拆分，如「午饭15 晚饭18 奶茶12」
    const parts = chunk.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return [chunk];
    const hasDateHead = /^(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}月\d{1,2}[日号]?|今天|昨天|前天)$/.test(parts[0]);
    const body = hasDateHead ? parts.slice(1) : parts;
    if (body.length >= 2 && body.every(p => /^[\u4e00-\u9fa5a-zA-Z]{1,10}(?:¥|￥)?\d+(?:\.\d{1,2})?(?:元|块)?$/.test(p))) {
      return hasDateHead ? body.map((p, idx) => (idx === 0 ? parts[0] + ' ' + p : p)) : body;
    }
    return [chunk];
  }

  function offline(text, anchor = date(), defaultPay = 'walletfund') {
    const rawChunks = String(text || '')
      .split(/[\n；;。！？]+/)
      .flatMap(x => x.split(/[，,、]/).map(v => v.trim()).filter(Boolean))
      .flatMap(splitSpaceItems);
    let curDate = anchor;
    return rawChunks
      .filter(t => t && !/^(?:明天|后天|预计|计划|预算|余额|市值|待付|未付|准备)|(?:余额|市值)\s*(?:为|是|还剩|剩余|[:：])?\s*\d/.test(t))
      .map(t => {
        let detail = t.trim();
        // 提取并剥离句首日期
        const isoMatch = detail.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\s*[：:\s]*/);
        const cnMatch = !isoMatch && detail.match(/^(\d{1,2})月(\d{1,2})[日号]?\s*[：:\s]*/);
        const relMatch = !isoMatch && !cnMatch && detail.match(/^(昨天|前天|今天)\s*[：:\s]*/);
        if (isoMatch) {
          const cand = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
          if (validDate(cand)) curDate = cand;
          detail = detail.slice(isoMatch[0].length);
        } else if (cnMatch) {
          const cand = resolveCnDate(Number(cnMatch[1]), Number(cnMatch[2]), anchor);
          if (cand) curDate = cand;
          detail = detail.slice(cnMatch[0].length);
        } else if (relMatch) {
          curDate = relMatch[1] === '昨天' ? dayAdd(anchor, -1) : relMatch[1] === '前天' ? dayAdd(anchor, -2) : anchor;
          detail = detail.slice(relMatch[0].length);
        }

        const amount = extractAmountFromText(detail);
        const isCard = /亲情卡/.test(detail);
        const isBank = /建行|建设银行/.test(detail);
        const isWork = /工行|工商银行/.test(detail);
        const isAli = /支付宝/.test(detail);
        const isWechatCash = /微信零钱|零钱余额/.test(detail);
        const isWechat = /零钱通|微信/.test(detail);
        const category = inferCategory(detail);

        let type = 'expense';
        let account = isCard ? 'card'
          : isBank ? 'bank'
          : isWork ? 'work'
          : isWechatCash ? 'wallet'
          : isWechat ? 'walletfund'
          : isAli ? 'pay'
          : '';
        let to = '';

        if (isCard) {
          type = /退款|退回/.test(detail) ? 'card_refund' : 'card';
        } else if (/妈妈|母亲|爸爸|父亲|生活费/.test(detail)) {
          type = 'family';
          if (/妈妈|母亲/.test(detail)) account = 'bank';
          else if (/爸爸|父亲/.test(detail)) account = 'work';
          else account = account || 'bank';
        } else if (/配音|副业|声卡|麦克风|音频线|话筒/.test(detail)) {
          type = /成本|买|支出|设备|抽成|音频|声卡|麦克风|话筒/.test(detail) ? 'cost' : 'labor';
          account = account || 'work';
        } else if (/退款|AA|退回/.test(detail)) {
          type = 'refund';
          account = account || defaultPay || 'walletfund';
        } else if (/定投|买基金|申购|A500|沪深300/.test(detail)) {
          type = 'transfer';
          account = account || 'bank';
          to = 'fundpending';
        } else if (/补微信|转零钱通|补足微信/.test(detail)) {
          type = 'transfer';
          account = 'bank';
          to = 'walletfund';
        } else if (/转入|转给|转到|归集|存定期|提现|还款/.test(detail)) {
          type = 'transfer';
          account = account || '';
        } else {
          account = account || defaultPay || 'walletfund';
        }

        return makeEntry({
          date: curDate,
          type,
          account,
          to,
          amount,
          category,
          note: detail || t,
          status: 'confirmed'
        });
      });
  }

  return {
    TYPES, CATS, BUCKETS, STATUS, ACCOUNTS,
    id, date, dayAdd, validDate, cents, fmt, clone, blank,
    checkEntry, validate, live, effects, balances, totals, fingerprint,
    bucketFor, makeEntry, stats, period, forecast, thresholds, workCarry, fundStats,
    assetAllocation, monthlyAssetSeries, dailySpendSeries, monthlyFlowSeries,
    parseAI, offline
  };
});
