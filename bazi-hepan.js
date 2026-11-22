/* 苏伊温德日历 · V6.1 三维净值精校合盘模块适配与透明纪录对照板 */
(() => {
'use strict';
const $ = id => document.getElementById(id);

// V6.1 预置「你的专属理论上限」（默认标准平衡权重，基于 2006-11-11 丙戌 己亥 甲辰 庚午 测算；可在左侧「测算个人理论上限」一键重算覆盖）
const DEFAULT_USER_CEILING = {
  love: {
    id: 'my-ceil-love',
    label: '我的理论爱情上限（乾造 · 甲辰）',
    mode: 'love',
    score: 76.8,
    nameA: '我(甲辰)', genderA: 'M', dateA: '2006-11-11', timeA: '12:00', unkA: false, lonA: 118.78,
    gzA: '丙戌 己亥 甲辰 庚午',
    nameB: '理论爱情满配', genderB: 'F', dateB: '2003-02-05', timeB: '16:00', unkB: false, lonB: 120.00,
    gzB: '癸未 甲寅 己酉 壬申',
    note: '热切互补 · 磨合可成型 · 吸+31.8 / 耗-7.5 / 承+2.5'
  },
  friend: {
    id: 'my-ceil-friend',
    label: '我的理论友情上限（甲辰）',
    mode: 'friend',
    score: 78.4,
    nameA: '我(甲辰)', genderA: 'M', dateA: '2006-11-11', timeA: '12:00', unkA: false, lonA: 118.78,
    gzA: '丙戌 己亥 甲辰 庚午',
    nameB: '理论友情满配', genderB: 'M', dateB: '2010-03-05', timeB: '18:00', unkB: false, lonB: 120.00,
    gzB: '庚寅 戊寅 甲寅 癸酉',
    note: '投契互补 · 磨合可深交 · 吸+22.1 / 耗-2.2 / 承+8.5'
  }
};

// V6.1 三维净值精校引擎全局标杆（标准平衡权重 · 已纳入原局自刑/偏枯/合燥精校）
const BENCHMARKS = [
  {
    id: 'bench-love',
    label: '全局婚恋满配标杆（V6.1 引擎）',
    mode: 'love',
    score: 90.9,
    nameA: '乾造命盘', genderA: 'M', dateA: '2002-03-14', timeA: '08:00', unkA: false, lonA: 120.00,
    gzA: '壬午 癸卯 辛巳 壬辰',
    nameB: '坤造命盘', genderB: 'F', dateB: '2001-08-01', timeB: '14:00', unkB: false, lonB: 120.00,
    gzB: '辛巳 乙未 丙申 乙未',
    note: '高共鸣 · 稳承接良缘型 · 吸+29.6 / 耗-4.7 / 承+16.0'
  },
  {
    id: 'bench-friend',
    label: '全局友情满配标杆（V6.1 引擎）',
    mode: 'friend',
    score: 92.6,
    nameA: '甲方命盘', genderA: 'M', dateA: '2004-05-18', timeA: '10:00', unkA: false, lonA: 120.00,
    gzA: '甲申 己巳 丁酉 乙巳',
    nameB: '乙方命盘', genderB: 'M', dateB: '2004-08-26', timeB: '00:00', unkB: false, lonB: 120.00,
    gzB: '甲申 壬申 丁丑 庚子',
    note: '高共鸣 · 稳健挚友型 · 吸+29.0 / 耗-0.9 / 承+14.5'
  }
];

const PERSONAL_STORE_KEY = 'suiwind_bazi_v61_personal_records';
const CEILING_STORE_KEY = 'suiwind_bazi_v61_my_ceiling';
const dbName = 'suiwind-bazi-v5-source', dbStore = 'source';
let loaded = false, currentHtml = '';

const styleState = () => {
  document.body.style.overflow = $('baziPage').classList.contains('bazi-open') ? 'hidden' : '';
};
function notice(msg, error = false) {
  const el = $('baziStatus'); if (!el) return;
  el.textContent = msg;
  el.classList.toggle('bazi-error', error);
}
function getPersonalRecords() {
  try { return JSON.parse(localStorage.getItem(PERSONAL_STORE_KEY) || '{}'); } catch { return {}; }
}
function savePersonalRecords(obj) {
  try { localStorage.setItem(PERSONAL_STORE_KEY, JSON.stringify(obj)); } catch {}
}
function getMyCeiling() {
  try {
    const saved = JSON.parse(localStorage.getItem(CEILING_STORE_KEY) || 'null');
    if (saved && saved.love && saved.friend) return saved;
  } catch {}
  return DEFAULT_USER_CEILING;
}
function saveMyCeiling(obj) {
  try { localStorage.setItem(CEILING_STORE_KEY, JSON.stringify(obj)); } catch {}
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('不支持 IndexedDB')); return; }
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(dbStore);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbGet() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(dbStore, 'readonly').objectStore(dbStore).get('v5html');
    req.onsuccess = () => { db.close(); resolve(req.result || null); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}
async function dbPut(value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(dbStore, 'readwrite');
    tx.objectStore(dbStore).put(value, 'v5html');
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

function validateHTML(s) {
  if (typeof s !== 'string' || s.length < 3000 || !/<html\b/i.test(s) || !/<script\b/i.test(s)) {
    throw new Error('所选文件不是完整的 HTML 工具。');
  }
}
function showFrame(html, source) {
  validateHTML(html); currentHtml = html;
  const frame = $('baziFrame');
  frame.onload = () => {
    loaded = true;
    notice('已载入 ' + source + ' · 三维净值精校（吸引/内耗/承接）+ 透明可调权重。');
  };
  $('baziEmpty').classList.add('bazi-hidden');
  frame.classList.remove('bazi-hidden');
  frame.srcdoc = html;
}
async function importFile(file) {
  try {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) throw new Error('HTML 文件超过 12MB。');
    const html = await file.text(); validateHTML(html);
    await dbPut(html); showFrame(html, '自定义本地 HTML');
  } catch (e) { notice('导入失败：' + e.message, true); }
}
async function load() {
  try {
    const r = await fetch('./bazi-hepan-v5.html?v=362', { cache: 'no-store' });
    if (r.ok) { const s = await r.text(); validateHTML(s); showFrame(s, 'V6.1 内置引擎'); return; }
  } catch (_) {}
  try {
    const local = await dbGet();
    if (local) { showFrame(local, '本地缓存引擎'); return; }
  } catch (e) { notice('本地存储不可用。', true); return; }
  notice('未检测到内置引擎，请点击上方选择 HTML 文件。');
}

function loadPairIntoFrame(pair) {
  const frame = $('baziFrame');
  if (!loaded || !frame || !frame.contentWindow) { notice('引擎尚未加载完成。', true); return; }
  frame.contentWindow.postMessage({ type: 'BAZI_V53_LOAD_PAIR', pair }, '*');
  notice(`已将「${pair.label || (pair.nameA + ' × ' + pair.nameB)}」填入左侧并排盘。`);
}

function formatPairMeta(p) {
  const gA = p.genderA === 'F' ? '女' : '男', gB = p.genderB === 'M' ? '男' : '女';
  const tA = p.unkA ? '时辰未知' : (p.timeA || '12:00'), tB = p.unkB ? '时辰未知' : (p.timeB || '12:00');
  return [
    `${p.nameA || '甲方'}(${gA})：${p.dateA} ${tA}`,
    `八字：${p.gzA || '—'}`,
    `${p.nameB || '乙方'}(${gB})：${p.dateB} ${tB}`,
    `八字：${p.gzB || '—'}`
  ];
}

function createRecordCard(title, rec, compareKey) {
  const wrap = document.createElement('div'); wrap.className = 'bazi-record';
  const head = document.createElement('div'); head.className = 'bazi-record-head';
  const name = document.createElement('div'); name.className = 'bazi-recordname'; name.textContent = title;
  head.appendChild(name);
  if (!rec) {
    wrap.appendChild(head);
    const empty = document.createElement('div'); empty.className = 'bazi-births bazi-births-empty';
    empty.textContent = '暂无 V6.1 实测记录；在左侧测算后会自动刷新最高分。';
    wrap.appendChild(empty);
    return wrap;
  }
  const score = document.createElement('div'); score.className = 'bazi-score';
  score.textContent = Number(rec.score).toFixed(1);
  head.appendChild(score);
  wrap.appendChild(head);

  const gA = rec.genderA === 'F' ? '坤' : '乾', gB = rec.genderB === 'M' ? '乾' : '坤';
  const tA = rec.unkA ? '时辰未知' : (rec.timeA || '12:00'), tB = rec.unkB ? '时辰未知' : (rec.timeB || '12:00');
  const info = document.createElement('div'); info.className = 'bazi-births';

  const mkRow = (who, g, date, time, gz) => {
    const row = document.createElement('div'); row.className = 'bazi-pair-row';
    const top = document.createElement('div'); top.className = 'bazi-pair-meta';
    top.textContent = `${who}（${g}）· ${date} ${time}`;
    const chip = document.createElement('div'); chip.className = 'bazi-gz-chip';
    chip.textContent = gz || '—';
    row.appendChild(top);
    row.appendChild(chip);
    return row;
  };
  info.appendChild(mkRow(rec.nameA || '甲方', gA, rec.dateA, tA, rec.gzA));
  info.appendChild(mkRow(rec.nameB || '乙方', gB, rec.dateB, tB, rec.gzB));
  if (rec.note) {
    const n = document.createElement('div'); n.className = 'bazi-rec-note';
    n.textContent = rec.note;
    info.appendChild(n);
  }
  wrap.appendChild(info);

  const btn = document.createElement('button'); btn.className = 'btn sm bazi-fill-btn'; btn.type = 'button'; btn.textContent = '一键填入复现';
  btn.onclick = () => {
    loadPairIntoFrame(rec);
    if ($('baziCompareCategory')) $('baziCompareCategory').value = compareKey;
    diff();
  };
  wrap.appendChild(btn);
  return wrap;
}

function getCompareTargets() {
  const p = getPersonalRecords(), c = getMyCeiling();
  return {
    'my-ceil-love': { label: c.love.label, score: Number(c.love.score) },
    'my-ceil-friend': { label: c.friend.label, score: Number(c.friend.score) },
    'personal-love': p.love ? { label: '我的实测婚恋最高', score: Number(p.love.score) } : null,
    'personal-friend': p.friend ? { label: '我的实测友情最高', score: Number(p.friend.score) } : null,
    'bench-love': { label: '全局婚恋满配标杆', score: BENCHMARKS[0].score },
    'bench-friend': { label: '全局友情满配标杆', score: BENCHMARKS[1].score }
  };
}

function renderRecords() {
  const cBox = $('baziMyCeilingRecords');
  const pBox = $('baziPersonalRecords');
  const wBox = $('baziWorldRecords');
  if (cBox) {
    cBox.innerHTML = '';
    const c = getMyCeiling();
    cBox.appendChild(createRecordCard(c.love.label, c.love, 'my-ceil-love'));
    cBox.appendChild(createRecordCard(c.friend.label, c.friend, 'my-ceil-friend'));
  }
  if (pBox) {
    pBox.innerHTML = '';
    const p = getPersonalRecords();
    pBox.appendChild(createRecordCard('我的实测婚恋最高', p.love || null, 'personal-love'));
    pBox.appendChild(createRecordCard('我的实测友情最高', p.friend || null, 'personal-friend'));
  }
  if (wBox) {
    wBox.innerHTML = '';
    BENCHMARKS.forEach(b => wBox.appendChild(createRecordCard(b.label, b, b.id)));
  }
}

function diff() {
  const input = $('baziInputScore'), cat = $('baziCompareCategory'), out = $('baziDiff');
  if (!input || !cat || !out) return;
  const val = Number(input.value);
  if (input.value === '' || !Number.isFinite(val) || val < 0 || val > 100) {
    out.textContent = '在左侧完成测算后将自动填入本次得分，也可手动输入 0–100 分。';
    return;
  }
  const target = getCompareTargets()[cat.value];
  if (!target) { out.textContent = '该类别暂无记录，请切换对比其他标杆。'; return; }
  const delta = +(val - target.score).toFixed(1);
  out.textContent = `${val.toFixed(1)} 分，与「${target.label}」(${target.score.toFixed(1)} 分) 相比：${
    delta > 0 ? '高出 ' + delta.toFixed(1) + ' 分' : delta < 0 ? '低于 ' + Math.abs(delta).toFixed(1) + ' 分' : '完全持平'
  }。`;
}

window.addEventListener('message', e => {
  const msg = e.data;
  if (!msg) return;

  if (msg.type === 'BAZI_V54_SAVE_CEILING' && msg.love && msg.friend) {
    saveMyCeiling({ love: msg.love, friend: msg.friend });
    renderRecords();
    diff();
    notice('★ 已将新的「个人理论上限」同步保存至右侧对照板！');
    return;
  }

  if (msg.type !== 'BAZI_V53_RESULT' || !msg.payload) return;
  const d = msg.payload, scoreVal = Number(d.score);
  if (!Number.isFinite(scoreVal)) return;

  if ($('baziInputScore')) $('baziInputScore').value = scoreVal.toFixed(1);
  if ($('baziDetected')) {
    const bd = d.breakdown;
    const bdText = bd
      ? `（${bd.archetype} · 吸${bd.d1 >= 0 ? '+' : ''}${Number(bd.d1).toFixed(1)} / 耗${Number(bd.d2).toFixed(1)} / 承${bd.d3 >= 0 ? '+' : ''}${Number(bd.d3).toFixed(1)} · ${bd.presetName}）`
      : '';
    $('baziDetected').textContent = `本次（${d.mode === 'friend' ? '友情' : '婚恋'}）：${d.nameA} × ${d.nameB} = ${scoreVal.toFixed(1)} 分${bdText}`;
  }

  if (msg.isUserRun) {
    const p = getPersonalRecords(), key = d.mode === 'friend' ? 'friend' : 'love';
    if (!p[key] || scoreVal > Number(p[key].score)) {
      p[key] = { ...d, label: key === 'love' ? '我的实测婚恋最高' : '我的实测友情最高' };
      savePersonalRecords(p);
      renderRecords();
      notice(`🎉 刷新了「${p[key].label}」：${scoreVal.toFixed(1)} 分！`);
    }
  }
  if ($('baziCompareCategory')) $('baziCompareCategory').value = d.mode === 'friend' ? 'my-ceil-friend' : 'my-ceil-love';
  diff();
});

function open() {
  $('baziPage').classList.add('bazi-open'); $('baziPage').setAttribute('aria-hidden', 'false'); styleState();
  if (!loaded && !currentHtml) load(); $('baziClose').focus();
}
function close() {
  $('baziPage').classList.remove('bazi-open'); $('baziPage').setAttribute('aria-hidden', 'true'); styleState(); $('baziBtn').focus();
}

function init() {
  if (!$('baziBtn') || !$('baziPage')) return;
  renderRecords();
  $('baziBtn').addEventListener('click', open);
  $('baziClose').addEventListener('click', close);
  $('baziImport').addEventListener('click', () => $('baziFile').click());
  $('baziEmptyImport').addEventListener('click', () => $('baziFile').click());
  $('baziFile').addEventListener('change', e => { importFile(e.target.files?.[0]); e.target.value = ''; });
  $('baziComputeDifference').addEventListener('click', diff);
  $('baziCompareCategory').addEventListener('change', diff);
  if ($('baziResetPersonal')) {
    $('baziResetPersonal').addEventListener('click', () => {
      if (!confirm('清空本机保存的「我的 V6.1 实测最高纪录」？')) return;
      localStorage.removeItem(PERSONAL_STORE_KEY); renderRecords(); diff();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('baziPage').classList.contains('bazi-open') && e.target?.tagName !== 'INPUT') close();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
