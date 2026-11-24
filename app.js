/* 苏伊温德日历 V3.0 · 新中式极简手账主程序
 * 100% 兼容 V1.x / V2.x 本地存储键名 (zx_*) 与 Supabase calendar_state 结构
 */
(() => {
'use strict';

const D = window.SUIWIND_DATA;
if (!D) { console.error('SUIWIND_DATA 未加载'); return; }

const {
  APP_VERSION, LEARNING_TIME_ZONE,
  LEARNING_CONFIG, DEFAULT_LEARNING_COUNTDOWNS, V150_MILESTONES,
  STUDY_SUBJECTS, ROADMAP_THEMES,
  ENGLISH_SKILL_PLAN_ORDER, ENGLISH_SKILL_DAILY_BLOCKS,
  FINANCE_PLAN, FINANCE_EXEC_ORDER, FINANCE_PHASES,
  MATH_PLAN, ENGLISH_SKILLS, ENGLISH_LESSON_TOTAL, ENGLISH_VOCAB_LESSONS,
  SOLAR_TERM_NAMES, SOLAR_TERM_MINUTES, LUNAR_FESTIVALS, SOLAR_FESTIVALS,
  HOLIDAY_RANGES, HOLIDAY_WORKDAYS, DEFAULT_SCHEDULE_PROFILE
} = D;

const BACKUP_KEY = 'zx_v160BackupHistory';
const $ = s => document.querySelector(s);
const rawGet = (k, f) => { try { return JSON.parse(localStorage.getItem('zx_' + k)) ?? f; } catch { return f; } };
const rawSet = (k, v) => localStorage.setItem('zx_' + k, JSON.stringify(v));

let syncSuppressed = false;
let cloudDirty = false;
let cloudRevision = 0, cloudUploading = false;
let syncTimer = null;

const S = {
  g: rawGet,
  s(k, v) {
    rawSet(k, v);
    if (syncSuppressed) return;
    if (!['sentReminders', 'cloudConfig', 'syncMeta'].includes(k)) {
      const m = syncMeta();
      rawSet('syncMeta', { ...m, localUpdatedAt: new Date().toISOString() });
      markCloudDirty();
      renderSyncMeta();
      scheduleCloudSync();
    }
  }
};

/* ===== 基础工具 ===== */
const now = new Date();
const pad = n => String(n).padStart(2, '0');
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [a, b, c] = String(s).split('-').map(Number); return new Date(a, b - 1, c, 12); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
const ico = (id, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const uuid = () => crypto.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2));
const same = (a, b) => fmt(a) === fmt(b);
const wd = d => ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const dateOk = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const isoNow = () => new Date().toISOString();

function dayDiff(a, b) {
  return Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
}
function addDaysKey(k, n) { const d = parse(k); d.setDate(d.getDate() + n); return fmt(d); }
function startOfWeek(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
function endOfWeek(d) { const x = startOfWeek(d); x.setDate(x.getDate() + 6); return x; }
function eachDate(a, b) { const out = [], d = new Date(a); for (; d <= b; d.setDate(d.getDate() + 1)) out.push(new Date(d)); return out; }
function weekKey(d) {
  const x = new Date(d), day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day + 3);
  const f = new Date(x.getFullYear(), 0, 4, 12);
  const w = 1 + Math.round(((x - f) / 86400000 - 3 + (f.getDay() + 6) % 7) / 7);
  return `${x.getFullYear()}-W${pad(w)}`;
}

const TZ_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: LEARNING_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});
function bjParts(v = new Date()) {
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  const p = {};
  TZ_FMT.formatToParts(d).forEach(x => { if (x.type !== 'literal') p[x.type] = x.value; });
  return p;
}
function bjDateKey(v = new Date()) { const p = bjParts(v); return p ? `${p.year}-${p.month}-${p.day}` : fmt(new Date()); }
function bjDateTime(v) { const p = bjParts(v); return p ? `${p.month}-${p.day} ${p.hour}:${p.minute}` : '—'; }
function todayDate() { const p = bjParts(); return p ? new Date(Number(p.year), Number(p.month) - 1, Number(p.day), 12) : new Date(); }
function todayKey() { return bjDateKey(); }

function durSec(s) { if (!s) return 0; const a = String(s).split(':').map(Number); return a.length === 2 ? a[0] * 60 + a[1] : 0; }
function secHuman(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h ? `${h}小时${m ? m + '分' : ''}` : `${m}分钟`;
}
function clockStr(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

let toastTimer = null;
function toast(msg, success = false) {
  let t = $('#v3Toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'v3Toast';
    t.className = 'toast';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast' + (success ? ' success' : '');
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('已复制到剪贴板', true)).catch(() => alert('复制失败，请手动复制。'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast('已复制到剪贴板', true);
  }
}

function downloadText(name, text, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([text], { type: mime }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

/* ===== 节假日 / 节气 / 农历 ===== */
const H = {};
HOLIDAY_RANGES.forEach(([a, b, type, name]) => {
  const d = parse(a), e = parse(b);
  for (; d <= e; d.setDate(d.getDate() + 1)) H[fmt(d)] = { type, name };
});
HOLIDAY_WORKDAYS.forEach(x => { H[x] = { type: 'work', name: '调休上班' }; });

function solarTermDate(year, idx) {
  const raw = new Date(Date.UTC(1900, 0, 6, 2, 5) + 31556925974.7 * (year - 1900) + SOLAR_TERM_MINUTES[idx] * 60000);
  return new Date(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate(), 12);
}
function solarTermForDate(d) {
  const k = fmt(d), y = d.getFullYear();
  for (let i = 0; i < 24; i++) if (fmt(solarTermDate(y, i)) === k) return SOLAR_TERM_NAMES[i];
  return '';
}
function nextSolarTerm(from) {
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  let best = null;
  for (let y = base.getFullYear(); y <= base.getFullYear() + 1; y++) {
    for (let i = 0; i < 24; i++) {
      const date = solarTermDate(y, i);
      if (date < base) continue;
      if (!best || date < best.date) best = { name: SOLAR_TERM_NAMES[i], date };
    }
  }
  return best;
}
function lunarDayText(n) {
  n = Number(n);
  const nums = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (n <= 0 || n > 30) return '';
  if (n <= 10) return n === 10 ? '初十' : `初${nums[n]}`;
  if (n < 20) return `十${nums[n - 10]}`;
  if (n === 20) return '二十';
  if (n < 30) return `廿${nums[n - 20]}`;
  return '三十';
}
let zhCalFmt = null;
function lunar(d) {
  try {
    if (!zhCalFmt) zhCalFmt = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { year: 'numeric', month: 'long', day: 'numeric' });
    const parts = zhCalFmt.formatToParts(d);
    const month = (parts.find(x => x.type === 'month')?.value || '').replace(/月月$/, '月');
    const dayNum = Number(parts.find(x => x.type === 'day')?.value || 0);
    const di = lunarDayText(dayNum), mTxt = month.endsWith('月') ? month : `${month}月`;
    const term = solarTermForDate(d), fest = [];
    const lf = LUNAR_FESTIVALS[`${month}-${dayNum}`]; if (lf) fest.push(lf);
    const sf = SOLAR_FESTIVALS[`${pad(d.getMonth() + 1)}-${pad(d.getDate())}`]; if (sf && !fest.includes(sf)) fest.push(sf);
    return { text: dayNum === 1 ? mTxt : di, fullText: `${mTxt}${di}`, fest, term };
  } catch { return { text: '', fullText: '—', fest: [], term: solarTermForDate(d) }; }
}

/* ===== 状态加载与向后兼容规范化 ===== */
function normCountdown(c) {
  const date = String(c?.date || '');
  let endDate = String(c?.endDate || '');
  if (!dateOk(date)) return null;
  if (!dateOk(endDate) || endDate < date) endDate = '';
  return { id: String(c.id || uuid()), title: String(c.title || '').trim(), date, endDate, kind: String(c.kind || '考试'), note: String(c.note || ''), createdAt: String(c.createdAt || '') };
}

function normalizeLS(raw) {
  const x = (raw && typeof raw === 'object') ? { ...raw } : {};
  const en = x.english || {};
  x.version = Math.max(12, Number(x.version) || 0);
  x.busyDates = (x.busyDates && typeof x.busyDates === 'object') ? x.busyDates : {};
  x.countdowns = (Array.isArray(x.countdowns) ? x.countdowns : DEFAULT_LEARNING_COUNTDOWNS).map(normCountdown).filter(Boolean);
  x.english = {
    round1: (en.round1 && typeof en.round1 === 'object') ? en.round1 : {},
    round2: (en.round2 && typeof en.round2 === 'object') ? en.round2 : {},
    skills: (en.skills && typeof en.skills === 'object') ? en.skills : {},
    reviews: (en.reviews && typeof en.reviews === 'object') ? en.reviews : {}
  };
  x.finance = { completions: (x.finance?.completions && typeof x.finance.completions === 'object') ? x.finance.completions : {} };
  x.math = { completions: (x.math?.completions && typeof x.math.completions === 'object') ? x.math.completions : {} };
  x.studyTimer = {
    active: (x.studyTimer?.active && typeof x.studyTimer.active === 'object') ? x.studyTimer.active : null,
    sessions: Array.isArray(x.studyTimer?.sessions) ? x.studyTimer.sessions : [],
    deletedSessionIds: Array.isArray(x.studyTimer?.deletedSessionIds) ? x.studyTimer.deletedSessionIds : []
  };
  x.burndown = {
    targets: {
      english1: typeof x.burndown?.targets?.english1 === 'string' ? x.burndown.targets.english1 : '2026-11-18',
      english2: typeof x.burndown?.targets?.english2 === 'string' ? x.burndown.targets.english2 : '',
      skills: typeof x.burndown?.targets?.skills === 'string' ? x.burndown.targets.skills : '',
      finance: typeof x.burndown?.targets?.finance === 'string' ? x.burndown.targets.finance : '',
      math: typeof x.burndown?.targets?.math === 'string' ? x.burndown.targets.math : ''
    },
    selected: ['english1', 'english2', 'skills', 'finance', 'math'].includes(x.burndown?.selected) ? x.burndown.selected : 'english1'
  };
  x.migrations = (x.migrations && typeof x.migrations === 'object') ? x.migrations : {};
  if (!x.migrations.editableMilestonesV150) {
    for (const c of V150_MILESTONES) {
      if (!x.countdowns.some(item => item.id === c.id || (item.title === c.title && item.date === c.date))) {
        x.countdowns.push({ ...c, createdAt: isoNow() });
      }
    }
    x.migrations.editableMilestonesV150 = true;
  }
  return x;
}

let T = rawGet('tasks', {});
let WG = rawGet('weekGoals', {});
let MG = rawGet('monthGoals', {});
let R = rawGet('reflections', {});
let A = rawGet('anniversaries', []);
let RT = rawGet('recurringTasks', []);
let DG = rawGet('deadlineGoals', []);
let SO = rawGet('scheduleOverrides', {});
let SC = rawGet('scheduleConfig', { disabledCourseIds: [] });
if (!SC || typeof SC !== 'object') SC = { disabledCourseIds: [] };
if (!Array.isArray(SC.disabledCourseIds)) SC.disabledCourseIds = [];
let LS = normalizeLS(rawGet('learningState', {}));
rawSet('learningState', LS);

let view = new Date(now.getFullYear(), now.getMonth(), 1);
let sel = new Date(now.getFullYear(), now.getMonth(), now.getDate());
let activeSideTab = 'schedule';
let activeLearningTab = 'today';
let activeSubjectSub = 'english';
let activeReviewType = 'week';
let editingCountdownId = '';
let timerInterval = null;
let pendingRecurring = null;

/* ===== 私密课表系统 ===== */
function scheduleProfile() {
  const p = SC?.profile;
  if (p && typeof p === 'object') {
    return {
      term: p.term?.start && p.term?.end ? p.term : DEFAULT_SCHEDULE_PROFILE.term,
      activityPeriod: p.activityPeriod?.start && p.activityPeriod?.end ? p.activityPeriod : DEFAULT_SCHEDULE_PROFILE.activityPeriod,
      breaks: Array.isArray(p.breaks) ? p.breaks : DEFAULT_SCHEDULE_PROFILE.breaks,
      autoRules: p.autoRules && typeof p.autoRules === 'object' ? p.autoRules : DEFAULT_SCHEDULE_PROFILE.autoRules,
      courses: Array.isArray(p.courses) ? p.courses : []
    };
  }
  return DEFAULT_SCHEDULE_PROFILE;
}
const activeCourses = () => scheduleProfile().courses || [];
function schoolWeekNum(d) {
  const term = scheduleProfile().term, day = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  const start = parse(term.start), end = parse(term.end);
  if (day < start || day > end) return null;
  const n = Math.floor((startOfWeek(day) - start) / 604800000) + 1;
  return n >= 1 && n <= Number(term.weeks || 25) ? n : null;
}
function dateBetween(d, a, b) { const k = fmt(d); return k >= a && k <= b; }
function isBreak(d) { return (scheduleProfile().breaks || []).some(([a, b]) => dateBetween(d, a, b)) || H[fmt(d)]?.type === 'holiday'; }
function isHolidayEve(d) { if (isBreak(d)) return false; const n = new Date(d); n.setDate(n.getDate() + 1); return isBreak(n); }
function inActivity(d) { const ap = scheduleProfile().activityPeriod; return ap?.start && ap?.end && dateBetween(d, ap.start, ap.end) && !isBreak(d); }
const timeMin = v => { const [h, m] = String(v || '0:0').split(':').map(Number); return h * 60 + m; };
const overlap = (a, b) => Math.max(timeMin(a.start), timeMin(b.start)) < Math.min(timeMin(a.end), timeMin(b.end));
const schedOv = d => { const r = SO[fmt(d)] || {}; return { added: Array.isArray(r.added) ? r.added : [], cancelled: Array.isArray(r.cancelled) ? r.cancelled : [] }; };

function scheduleFor(d) {
  const wk = schoolWeekNum(d), day = d.getDay(), ov = schedOv(d), dis = SC.disabledCourseIds || [];
  const base = wk ? activeCourses().filter(c => Number(c.day) === day && Array.isArray(c.weeks) && c.weeks.includes(wk) && !dis.includes(c.id) && !ov.cancelled.includes(c.id))
    .map(c => ({ ...c, type: 'course', source: 'base', baseId: c.id })) : [];
  const added = ov.added.map(c => ({ ...c, type: 'course', source: 'added', id: c.id || uuid() }));
  const events = [...base, ...added];
  const rules = scheduleProfile().autoRules || {};
  const hasEveClass = events.some(c => overlap(c, { start: '19:00', end: '20:30' }) || (timeMin(c.start) >= 1080 && timeMin(c.start) < 1260));
  if (rules.morningStudy?.enabled && events.some(e => e.start === (rules.morningStudy.triggerStart || '08:20'))) {
    events.push({ id: 'auto-ms', start: rules.morningStudy.start || '07:40', end: rules.morningStudy.end || '08:10', name: rules.morningStudy.name || '早自习', room: rules.morningStudy.room || '', type: 'study', source: 'auto' });
  }
  if (rules.eveningStudy?.enabled && inActivity(d) && (rules.eveningStudy.days || [1, 2, 3, 4]).includes(day) && !hasEveClass && !isHolidayEve(d)) {
    events.push({ id: 'auto-es', start: rules.eveningStudy.start || '19:00', end: rules.eveningStudy.end || '20:30', name: rules.eveningStudy.name || '晚自习', room: rules.eveningStudy.room || '', type: 'study', source: 'auto' });
  }
  if (rules.sundayCommentary?.enabled && inActivity(d) && day === (rules.sundayCommentary.day ?? 0)) {
    events.push({ id: 'auto-sc', start: rules.sundayCommentary.start || '19:30', end: rules.sundayCommentary.end || '19:45', name: rules.sundayCommentary.name || '晚点评', room: rules.sundayCommentary.room || '', type: 'commentary', source: 'auto' });
  }
  return events.sort((a, b) => timeMin(a.start) - timeMin(b.start));
}

function renderSchedule() {
  const box = $('#dailySchedule'), stat = $('#scheduleStat'), note = $('#scheduleRuleNote');
  if (!box) return;
  const events = scheduleFor(sel), wk = schoolWeekNum(sel), hasBase = activeCourses().length > 0;
  box.innerHTML = '';
  stat.textContent = events.length ? `${events.length} 项${wk ? ` · 第${wk}周` : ''}` : (wk ? `第${wk}周` : '');
  note.textContent = '';

  if (!events.length) {
    if (!hasBase) {
      box.innerHTML = `<div class="empty-box">公网源码不含个人课表。<br>点击下方导入「我的私密课表_站内导入用.json」即可恢复。<div class="mt-10"><button class="btn sm primary" id="quickImportSched" type="button">导入私密课表</button></div></div>`;
      $('#quickImportSched').onclick = () => $('#importScheduleFile').click();
      return;
    }
    box.innerHTML = `<div class="empty-box">${wk ? '今天没有课表安排，适合自由专注或休息。' : '当前日期不在本学期课表范围内。'}</div>`;
    return;
  }

  const isTodaySel = fmt(sel) === todayKey();
  const curParts = isTodaySel ? bjParts() : null;
  const curMin = curParts ? Number(curParts.hour) * 60 + Number(curParts.minute) : -1;

  events.forEach(e => {
    const row = document.createElement('div');
    let phaseCls = '';
    if (isTodaySel && curMin >= 0) {
      const sMin = timeMin(e.start), eMin = timeMin(e.end);
      if (curMin >= eMin) phaseCls = ' is-past';
      else if (curMin >= sMin && curMin < eMin) phaseCls = ' is-now';
    }
    row.className = `schedule-item ${e.type}${phaseCls}`;
    const meta = [e.teacher, e.room, e.note, e.source === 'added' ? '临时' : ''].filter(Boolean).join(' · ');
    row.innerHTML = `<div class="schedule-time">${esc(e.start)}–${esc(e.end)}</div><div class="sched-node" aria-hidden="true"></div><div class="schedule-body"><div class="schedule-name">${esc(e.name)}${phaseCls === ' is-now' ? '<span class="now-pill">进行中</span>' : ''}</div>${meta ? `<div class="schedule-meta">${esc(meta)}</div>` : ''}</div>${e.type === 'course' ? `<button data-action-delete class="x" type="button" title="取消/删除" aria-label="取消/删除">${ico('x', 'ico-sm')}</button>` : ''}`;
    const del = row.querySelector('[data-action-delete]');
    if (del) del.onclick = () => {
      const k = fmt(sel), ov = schedOv(sel);
      if (e.source === 'base') {
        if (!confirm(`仅取消 ${k} 的「${e.name}」？`)) return;
        SO[k] = { ...ov, cancelled: [...new Set([...ov.cancelled, e.baseId])] };
      } else {
        if (!confirm(`删除临时课程「${e.name}」？`)) return;
        SO[k] = { ...ov, added: ov.added.filter(x => x.id !== e.id) };
      }
      S.s('scheduleOverrides', SO);
      renderSchedule();
    };
    box.appendChild(row);
  });
}

/* ===== 学习核心辅助 ===== */
const entryDate = v => !v ? '' : (typeof v === 'string' ? v.slice(0, 10) : (v.date || String(v.at || '').slice(0, 10)));
const doneCount = map => Object.keys(map || {}).filter(k => !!map[k]).length;
const pct = (a, b) => b ? Math.min(100, Math.round(a / b * 100)) : 0;
function nextNum(total, map) { for (let i = 1; i <= total; i++) if (!map?.[String(i)]) return i; return null; }
const enLabel = i => { const x = ENGLISH_VOCAB_LESSONS[Number(i) - 1]; return x ? `Unit ${x.unit} · Lesson ${x.lesson}` : '—'; };
const enDone = map => { let n = 0; for (let i = 1; i <= ENGLISH_LESSON_TOTAL; i++) if (map?.[String(i)]) n++; return n; };
const nextEn1 = () => nextNum(ENGLISH_LESSON_TOTAL, LS.english.round1);
const nextEn2 = () => nextNum(ENGLISH_LESSON_TOTAL, LS.english.round2);
const en1Complete = () => enDone(LS.english.round1) >= ENGLISH_LESSON_TOTAL;
const skillById = id => ENGLISH_SKILLS.find(x => Number(x.id) === Number(id)) || null;
const nextSkillId = () => ENGLISH_SKILL_PLAN_ORDER.find(id => !LS.english.skills[String(id)]) || null;
function curSkillBlock() {
  for (const b of ENGLISH_SKILL_DAILY_BLOCKS) {
    const left = b.ids.filter(id => !LS.english.skills[String(id)]);
    if (left.length) return { ...b, left };
  }
  return null;
}
const nextFinDay = () => FINANCE_EXEC_ORDER.find(d => !LS.finance.completions[String(d)]) || null;
const nextMathDay = () => nextNum(48, LS.math.completions);
const finItem = d => FINANCE_PLAN.find(x => x.originalDay === Number(d));
const mathItem = d => MATH_PLAN.find(x => x.day === Number(d));
const mathDur = x => (x?.lectures || []).reduce((s, l) => s + durSec(l.duration), 0);

function completionsOn(k) {
  const out = [];
  for (let i = 1; i <= ENGLISH_LESSON_TOTAL; i++) {
    if (entryDate(LS.english.round1[String(i)]) === k) out.push(`英语一轮 · ${enLabel(i)}`);
    if (entryDate(LS.english.round2[String(i)]) === k) out.push(`英语二轮 · ${enLabel(i)}`);
  }
  ENGLISH_SKILLS.forEach(s => { if (entryDate(LS.english.skills[String(s.id)]) === k) out.push(`四级技巧 #${s.id}`); });
  FINANCE_EXEC_ORDER.forEach(d => { if (entryDate(LS.finance.completions[String(d)]) === k) out.push(`财经 · ${finItem(d)?.title || 'Day ' + d}`); });
  for (let d = 1; d <= 48; d++) if (entryDate(LS.math.completions[String(d)]) === k) out.push(`高数 · Day ${d}`);
  return out;
}

function markLearning(map, id, checked) {
  if (checked) map[String(id)] = { date: todayKey(), at: isoNow() };
  else delete map[String(id)];
  S.s('learningState', LS);
  renderLearningSummary();
  renderTodayFocus();
  renderCal();
  if ($('#learningModal').classList.contains('show')) renderLearningPanel();
}

function countdownsOn(k) { return (LS.countdowns || []).filter(x => k >= x.date && k <= (x.endDate || x.date)); }
function countdownText(date, endDate = '') {
  const n = dayDiff(parse(date), todayDate());
  if (endDate && dateOk(endDate) && todayKey() >= date && todayKey() <= endDate) return '进行中';
  return n > 0 ? `还有 ${n} 天` : n === 0 ? '就是今天' : `已过 ${Math.abs(n)} 天`;
}

/* ===== 专注计时器（极简版） ===== */
const sessionDate = s => String(s?.dateKey || '') || bjDateKey(s?.startAt || s?.endAt || '');
function activeFocusSec() {
  const a = LS.studyTimer.active;
  if (!a) return 0;
  let total = Number(a.focusAccumSec || 0);
  if (a.phase === 'focus') total += Math.max(0, Math.floor((Date.now() - Date.parse(a.phaseStartedAt)) / 1000));
  return total;
}
function curPhaseSec() {
  const a = LS.studyTimer.active;
  return a ? Math.max(0, Math.floor((Date.now() - Date.parse(a.phaseStartedAt)) / 1000)) : 0;
}
function studySecBetween(a, b) {
  return (LS.studyTimer.sessions || []).filter(x => { const k = sessionDate(x); return k >= a && k <= b; })
    .reduce((s, x) => s + Number(x.focusSeconds || 0), 0);
}
function todayStudySec() { const k = todayKey(); return studySecBetween(k, k) + activeFocusSec(); }
function weekStudySec() {
  const a = fmt(startOfWeek(todayDate())), b = fmt(endOfWeek(todayDate()));
  return studySecBetween(a, b) + activeFocusSec();
}

function syncTimerLoop() {
  if (LS.studyTimer.active) {
    if (!timerInterval) timerInterval = setInterval(timerTick, 1000);
  } else if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startStudy(subject, mode, note) {
  if (LS.studyTimer.active) return;
  const nowIso = isoNow();
  LS.studyTimer.active = {
    id: uuid(), subject, energy: mode, note: String(note || '').trim(),
    timeClass: ['英语', '财经', '高数'].includes(subject) ? 'CORE-DEEP' : 'OTHER-ACADEMIC',
    sessionStartedAt: nowIso, phase: 'focus', phaseStartedAt: nowIso,
    focusAccumSec: 0, breakAccumSec: 0, blocksCompleted: 0
  };
  S.s('learningState', LS);
  syncTimerLoop();
  renderLearningPanel();
  renderTodayFocus();
}

function finishStudy() {
  const a = LS.studyTimer.active;
  if (!a) return;
  const focus = Math.max(0, Math.round(activeFocusSec()));
  if (focus >= 30) {
    LS.studyTimer.sessions.push({
      id: a.id || uuid(), subject: a.subject, energy: a.energy || 'normal',
      timeClass: a.timeClass || 'CORE-DEEP', note: a.note || '',
      startAt: a.sessionStartedAt || isoNow(), endAt: isoNow(),
      focusSeconds: focus, breakSeconds: 0, blocks: a.blocksCompleted || 0, recordedAt: isoNow()
    });
    toast(`已保存 ${a.subject} · ${secHuman(focus)}`, true);
  } else {
    toast('不足 30 秒，未计入账本');
  }
  LS.studyTimer.active = null;
  S.s('learningState', LS);
  syncTimerLoop();
  renderLearningPanel();
  renderTodayFocus();
}

function timerTick() {
  const c = $('#liveTimerClock'), ph = $('#liveTimerPhase');
  const a = LS.studyTimer.active;
  if (!a) { syncTimerLoop(); return; }
  const targetMin = a.energy === 'low' ? 25 : 50;
  const elapsed = curPhaseSec();
  if (c) {
    const left = targetMin * 60 - elapsed;
    c.textContent = left >= 0 ? clockStr(left) : `+${clockStr(Math.abs(left))}`;
  }
  if (ph) {
    ph.textContent = `${a.subject} · 已专注 ${secHuman(activeFocusSec())}${a.note ? ' · ' + a.note : ''}`;
  }
}

/* ===== 日历、任务、期限、复盘 ===== */
const annivOn = d => A.filter(a => { const q = parse(a.date); return a.repeat ? (q.getMonth() === d.getMonth() && q.getDate() === d.getDate()) : a.date === fmt(d); });
const deadlineOn = d => DG.filter(g => g.dueDate === fmt(d));
function occurs(rule, d) {
  const st = parse(rule.startDate), cur = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12), k = fmt(cur);
  if (cur < st || (rule.endDate && cur > parse(rule.endDate)) || (rule.skipDates || []).includes(k)) return false;
  if (rule.repeat === 'daily') return true;
  if (rule.repeat === 'weekly') return cur.getDay() === st.getDay();
  if (rule.repeat === 'monthly') return cur.getDate() === st.getDate();
  return k === rule.startDate;
}
const allTasksFor = d => [
  ...(T[fmt(d)] || []).map(x => ({ ...x, recurring: false })),
  ...RT.filter(r => occurs(r, d)).map(r => ({ ...r, recurring: true, done: (r.doneDates || []).includes(fmt(d)) }))
];

function setTaskDone(task, d, done) {
  if (task.recurring) {
    const r = RT.find(x => x.id === task.id); if (!r) return;
    r.doneDates = r.doneDates || [];
    const k = fmt(d);
    if (done && !r.doneDates.includes(k)) r.doneDates.push(k);
    if (!done) r.doneDates = r.doneDates.filter(x => x !== k);
    S.s('recurringTasks', RT);
  } else {
    const r = (T[fmt(d)] || []).find(x => x.id === task.id);
    if (r) r.done = done;
    S.s('tasks', T);
  }
}

function syncYearSelect() {
  const el = $('#yearSelect'); if (!el) return;
  const y = view.getFullYear(), st = Math.min(now.getFullYear() - 3, y - 1), ed = Math.max(now.getFullYear() + 6, y + 1);
  el.innerHTML = '';
  for (let yr = st; yr <= ed; yr++) {
    const op = document.createElement('option');
    op.value = String(yr); op.textContent = `${yr}年`;
    if (yr === y) op.selected = true;
    el.appendChild(op);
  }
}

function renderCal(animate = false) {
  syncYearSelect();
  $('#monthTitle').innerHTML = `${view.getMonth() + 1}<small>月</small>`;
  const g = $('#calendar');
  g.innerHTML = '';
  if (animate) {
    g.classList.remove('grid-anim');
    void g.offsetWidth;
    g.classList.add('grid-anim');
  }
  const y = view.getFullYear(), m = view.getMonth();
  const td = todayDate();
  const f = new Date(y, m, 1, 12), off = (f.getDay() + 6) % 7, start = new Date(y, m, 1 - off, 12);

  let monthTotal = 0, monthDone = 0;
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const k = fmt(d), li = lunar(d), h = H[k], an = annivOn(d), ddl = deadlineOn(d), cds = countdownsOn(d);
    const arr = allTasksFor(d), done = arr.filter(x => x.done).length;
    const learned = completionsOn(k).length > 0;
    const reflected = reflectHas(R[k]);
    if (d.getMonth() === m) { monthTotal += arr.length; monthDone += done; }

    // 极简规则：每格最多展示 1 个高优先级文字标签，保持呼吸感
    let badgeHtml = '';
    if (cds.length) badgeHtml = `<div class="day-badge exam" title="${esc(cds[0].title)}"><span>${esc(cds[0].title)}</span></div>`;
    else if (h) badgeHtml = `<div class="day-badge ${h.type}" title="${esc(h.name)}"><span>${h.type === 'holiday' ? '休 · ' : '班 · '}${esc(h.name.replace('假期', ''))}</span></div>`;
    else if (an.length) badgeHtml = `<div class="day-badge holiday" title="${esc(an[0].name)}">${ico('heart', 'ico-sm')}<span>${esc(an[0].name)}</span></div>`;
    else if (ddl.length) badgeHtml = `<div class="day-badge deadline" title="截止 · ${esc(ddl[0].text)}">${ico('bell', 'ico-sm')}<span>截止 · ${esc(ddl[0].text)}</span></div>`;
    else if (d.getDay() === 1 && schoolWeekNum(d)) badgeHtml = `<div class="day-badge weeknum">第${schoolWeekNum(d)}周</div>`;

    const dots = arr.filter(x => !x.done).slice(0, 3).map(x => `<i class="dot ${x.priority || 'medium'}"></i>`).join('')
      + (learned ? '<i class="dot learn"></i>' : '');

    const subText = li.term || li.fest[0] || li.text;
    const rel = dayDiff(d, td);
    const isOther = d.getMonth() !== m;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const hasFootprint = rel < 0 && !isOther && (learned || reflected || done > 0);
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.date = k;
    b.className = 'day'
      + (isOther ? ' other' : '')
      + (rel === 0 ? ' today' : rel < 0 ? ' past' : ' future')
      + (isWeekend ? ' weekend' : '')
      + (hasFootprint ? ' has-footprint' : '')
      + (same(d, sel) ? ' selected' : '');
    b.innerHTML = `
      <span class="num">${d.getDate()}</span>
      <span class="lunar ${li.term ? 'is-term' : ''}">${esc(subText)}</span>
      ${badgeHtml}
      <span class="dots">${dots}</span>
      <span class="done-mark">${arr.length ? `${done}/${arr.length}` : ''}</span>`;
    b.onclick = () => { sel = new Date(d); renderCal(); renderSide(); };
    g.appendChild(b);
  }
  $('#monthProgressText').textContent = monthTotal ? `本月任务 ${monthDone} / ${monthTotal}（${Math.round(monthDone / monthTotal * 100)}%）` : '本月暂无任务';
  window.dispatchEvent(new Event('suiwind:calendar-render'));
}

function renderTodayFocus() {
  const box = $('#todayFocusBox'); if (!box) return;
  const k = fmt(sel);
  if (k !== todayKey()) {
    const items = completionsOn(k);
    box.innerHTML = items.length
      ? `<div class="focus-card"><div class="focus-card-kicker"><span>当日学习记录</span><span>${items.length} 项</span></div><div class="small">${items.map(esc).join(' · ')}</div></div>`
      : '';
    return;
  }
  const active = LS.studyTimer.active;
  const busy = !!LS.busyDates[k];
  const r1 = nextEn1(), r2 = nextEn2(), fd = nextFinDay(), md = nextMathDay();
  let title = '今日核心队列已清零', meta = '可以轻量复盘或安心休息。', tab = 'today';
  if (active) { title = `正在专注：${active.subject}`; meta = `已累计 ${secHuman(activeFocusSec())}，点击进入计时器。`; tab = 'timer'; }
  else if (busy) { title = '今日已设为缓冲日'; meta = '不强推新进度，保持轻松节奏。'; }
  else if (r1) { title = `英语一轮 · ${enLabel(r1)}`; meta = `随后可推进财经原 Day ${fd || '—'} / 高数 Day ${md || '—'}`; }
  else if (r2) { title = `英语二轮 · ${enLabel(r2)}`; meta = `财经原 Day ${fd || '—'} · 高数 Day ${md || '—'}`; }
  else if (fd) { title = `财经 · ${finItem(fd)?.title || 'Day ' + fd}`; meta = `高数下一项：Day ${md || '已完成'}`; }
  else if (md) { title = `高数 · Day ${md}`; meta = '按序推进即可。'; }

  box.innerHTML = `
    <div class="focus-card">
      <div class="focus-card-kicker">
        <span>今日学习焦点</span>
        <span>已专注 ${secHuman(todayStudySec())}</span>
      </div>
      <div class="focus-card-title">${esc(title)}</div>
      <div class="focus-card-meta">${esc(meta)}</div>
      <div class="focus-card-actions">
        <button class="btn sm primary" id="focusOpenLearn" type="button">${active ? '回到计时' : '进入学习中心'}</button>
        <button class="btn sm soft" id="focusOpenTimer" type="button">开始计时</button>
      </div>
    </div>`;
  $('#focusOpenLearn').onclick = () => openLearning(tab);
  $('#focusOpenTimer').onclick = () => openLearning('timer');
}

function renderTasks() {
  const e = $('#tasks'), arr = allTasksFor(sel);
  e.innerHTML = '';
  const pending = arr.filter(x => !x.done).length;
  $('#taskStat').textContent = arr.length ? `${arr.length - pending}/${arr.length}` : '';
  $('#sideTaskBadge').textContent = pending ? String(pending) : '';
  if (!arr.length) { e.innerHTML = '<div class="empty-box">这一天还没有任务。</div>'; return; }

  const pOrd = { high: 0, medium: 1, low: 2 };
  arr.sort((a, b) => (a.done - b.done) || ((pOrd[a.priority] ?? 1) - (pOrd[b.priority] ?? 1)));
  arr.forEach(t => {
    const row = document.createElement('div');
    row.className = 'task' + (t.done ? ' done' : '');
    const pTxt = t.priority === 'high' ? '高' : t.priority === 'low' ? '低' : '中';
    row.innerHTML = `<input data-action-check type="checkbox" ${t.done ? 'checked' : ''}><div class="txt"><div>${esc(t.text)}</div><div class="meta"><span class="meta-tag ${t.priority || 'medium'}">${pTxt}优先</span>${t.reminder ? `<span class="meta-tag info">${ico('clock', 'ico-sm')}${esc(t.reminder)}</span>` : ''}${t.recurring ? `<span class="meta-tag info">${ico('rotate-cw', 'ico-sm')}重复</span>` : ''}</div></div><button data-action-delete class="x" type="button" aria-label="删除">${ico('x', 'ico-sm')}</button>`;
    row.querySelector('[data-action-check]').onchange = ev => { setTaskDone(t, sel, ev.target.checked); renderCal(); renderTasks(); };
    row.querySelector('[data-action-delete]').onclick = () => {
      if (t.recurring) {
        pendingRecurring = { task: t, date: new Date(sel) };
        $('#repeatActionDesc').textContent = `${t.text} · ${fmt(sel)}`;
        $('#repeatActionModal').classList.add('show');
      } else {
        T[fmt(sel)] = (T[fmt(sel)] || []).filter(x => x.id !== t.id);
        S.s('tasks', T); renderCal(); renderTasks();
      }
    };
    e.appendChild(row);
  });
}

function renderDeadlines() {
  const e = $('#deadlineGoals'); if (!e) return;
  const arr = [...DG].sort((a, b) => (!!a.done - !!b.done) || String(a.dueDate).localeCompare(String(b.dueDate)));
  const pend = arr.filter(x => !x.done).length;
  $('#deadlineStat').textContent = arr.length ? `${pend} 待办` : '';
  e.innerHTML = '';
  if (!arr.length) { e.innerHTML = '<div class="empty-box">暂无期限事项（比赛、作品集等可记在这里）。</div>'; return; }

  arr.forEach(g => {
    const n = dayDiff(parse(g.dueDate), todayDate());
    const stText = g.done ? '已完成' : n > 0 ? `剩 ${n} 天` : n === 0 ? '今日截止' : `逾期 ${Math.abs(n)} 天`;
    const stCls = g.done ? 'low' : n <= 0 ? 'high' : n <= 7 ? 'medium' : 'info';
    const row = document.createElement('div');
    row.className = 'task' + (g.done ? ' done' : '');
    row.innerHTML = `<input data-action-check type="checkbox" ${g.done ? 'checked' : ''}><div class="txt"><div>${esc(g.text)}</div><div class="meta"><span class="meta-tag">${esc(g.dueDate)}</span><span class="meta-tag ${stCls}">${stText}</span></div></div><button data-action-delete class="x" type="button" aria-label="删除">${ico('x', 'ico-sm')}</button>`;
    row.querySelector('[data-action-check]').onchange = ev => { g.done = ev.target.checked; g.completedAt = g.done ? isoNow() : ''; S.s('deadlineGoals', DG); renderDeadlines(); renderCal(); };
    row.querySelector('[data-action-delete]').onclick = () => { if (confirm(`删除「${g.text}」？`)) { DG = DG.filter(x => x.id !== g.id); S.s('deadlineGoals', DG); renderDeadlines(); renderCal(); } };
    e.appendChild(row);
  });
}

function renderGoals() {
  const wk = weekKey(sel), mk = monthKey(sel);
  $('#weekLabel').textContent = `本周 (${wk})`;
  $('#monthLabel').textContent = `本月 (${mk})`;
  const wArr = WG[wk] || [], mArr = MG[mk] || [];
  $('#goalCollapseStat').textContent = `${wArr.length + mArr.length} 项`;
  const draw = (el, obj, key, sk) => {
    const box = $(el), list = obj[key] || [];
    box.innerHTML = list.length ? '' : '<div class="small py-4">暂无目标</div>';
    list.forEach((g, i) => {
      const r = document.createElement('div'); r.className = 'task' + (g.done ? ' done' : '');
      r.innerHTML = `<input data-action-check type="checkbox" ${g.done ? 'checked' : ''}><div class="txt">${esc(g.text)}</div><button data-action-delete class="x" type="button" aria-label="删除">${ico('x', 'ico-sm')}</button>`;
      r.querySelector('[data-action-check]').onchange = ev => { g.done = ev.target.checked; S.s(sk, obj); renderGoals(); };
      r.querySelector('[data-action-delete]').onclick = () => { list.splice(i, 1); obj[key] = list; S.s(sk, obj); renderGoals(); };
      box.appendChild(r);
    });
  };
  draw('#weekGoals', WG, wk, 'weekGoals');
  draw('#monthGoals', MG, mk, 'monthGoals');
}

const reflectHas = r => [r?.q1, r?.q2, r?.q3].some(x => (x || '').trim());
const reflectDone = r => reflectHas(r) && !r.confirmRequired;
function renderReflectState(r = R[fmt(sel)] || {}) {
  const has = reflectHas(r), done = reflectDone(r);
  $('#saved').innerHTML = done ? `${ico('check', 'ico-sm')} 已完成` : has ? '草稿' : '';
  $('#completeReflection').innerHTML = done ? `${ico('check', 'ico-sm')} 今日复盘已完成` : '完成今日复盘';
  $('#reflectionFeedback').textContent = done ? '已保存，计入连续复盘' : '输入时自动保存草稿';
  $('#sideReflectBadge').innerHTML = done ? ico('check', 'ico-sm') : (has ? '•' : '');
}
let reflectTimer = null;
function saveDraftR() {
  const k = fmt(sel);
  clearTimeout(reflectTimer);
  $('#saved').textContent = '保存中…';
  reflectTimer = setTimeout(() => {
    R[k] = { ...(R[k] || {}), q1: $('#q1').value, q2: $('#q2').value, q3: $('#q3').value, updatedAt: isoNow(), confirmRequired: true };
    S.s('reflections', R); renderStreak(); if (fmt(sel) === k) renderReflectState(R[k]);
  }, 280);
}
function finishR() {
  clearTimeout(reflectTimer);
  const k = fmt(sel), q1 = $('#q1').value, q2 = $('#q2').value, q3 = $('#q3').value;
  if (![q1, q2, q3].some(x => x.trim())) { toast('先写一点再完成吧'); return; }
  const st = isoNow();
  R[k] = { ...(R[k] || {}), q1, q2, q3, updatedAt: st, completedAt: st, confirmRequired: false };
  S.s('reflections', R); renderReflectState(R[k]); renderStreak(); toast('今日复盘已完成', true);
}

function renderStreak() {
  let n = 0; const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  while (true) {
    const r = R[fmt(d)];
    if (r && reflectHas(r)) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  $('#streakPill').textContent = `连续复盘 ${n} 天`;
}

function renderNextTerm() {
  const t = nextSolarTerm(now);
  if (!t) return;
  const n = dayDiff(t.date, now);
  $('#nextTermPill').textContent = n === 0 ? `今日 · ${t.name}` : `${t.name} · ${n}天后`;
}

function renderSide() {
  const k = fmt(sel), li = lunar(sel), h = H[k], r = R[k] || {}, wk = schoolWeekNum(sel), diff = dayDiff(sel, todayDate());
  $('#dateTitle').innerHTML = `<span class="hero-day">${sel.getDate()}</span><span class="hero-meta">${sel.getMonth() + 1}月 · 周${wd(sel)}</span>`;
  const dist = $('#dateDistance');
  dist.textContent = diff === 0 ? '今天' : diff > 0 ? `${diff} 天后` : `${Math.abs(diff)} 天前`;
  dist.className = `date-distance ${diff === 0 ? 'today' : diff > 0 ? 'future' : 'past'}`;
  $('#dateSub').textContent = [`农历${li.fullText}`, wk ? `校历第${wk}周` : '', li.term, ...li.fest, h?.name].filter(Boolean).join(' · ');

  const evEl = $('#dateEventsLine');
  if (evEl) {
    const tags = [];
    annivOn(sel).forEach(a => tags.push(`<span class="hero-event-tag seal">${ico('heart', 'ico-sm')}${esc(a.name)}</span>`));
    deadlineOn(sel).forEach(g => tags.push(`<span class="hero-event-tag ochre">${ico('bell', 'ico-sm')}截止 · ${esc(g.text)}</span>`));
    countdownsOn(sel).forEach(c => tags.push(`<span class="hero-event-tag accent">${ico('calendar', 'ico-sm')}${esc(c.title)}</span>`));
    evEl.innerHTML = tags.join('');
  }
  if (!$('#deadlineInput').value.trim()) $('#deadlineDate').value = k;

  renderTodayFocus();
  renderSchedule();
  renderTasks();
  renderDeadlines();
  renderGoals();
  ['q1', 'q2', 'q3'].forEach(id => { $('#' + id).value = r[id] || ''; });
  renderReflectState(r);
  window.dispatchEvent(new Event('suiwind:calendar-render'));
}

function setSideTab(tab) {
  activeSideTab = tab;
  document.querySelectorAll('[data-side-tab]').forEach(b => b.classList.toggle('active', b.dataset.sideTab === tab));
  $('#sidePaneSchedule').classList.toggle('active', tab === 'schedule');
  $('#sidePaneTasks').classList.toggle('active', tab === 'tasks');
  $('#sidePaneReflect').classList.toggle('active', tab === 'reflect');
}

/* ===== 学习中心 4 标签渲染 ===== */
function renderLearningSummary() {
  const r1 = enDone(LS.english.round1), sk = doneCount(LS.english.skills);
  $('#learnEnglishMetric').innerHTML = `${r1}<small>/40</small>`;
  $('#learnEnglishBar').style.width = `${pct(r1 + sk, 78)}%`;
  $('#learnEnglishNote').textContent = `技巧 ${sk}/38 · ` + (nextEn1() ? `下一节：${enLabel(nextEn1())}` : `二轮 ${enDone(LS.english.round2)}/40`);

  const f = doneCount(LS.finance.completions), m = doneCount(LS.math.completions);
  $('#learnFinanceMetric').innerHTML = `${f}<small>/80</small>`;
  $('#learnFinanceBar').style.width = `${pct(f, 80)}%`;
  $('#learnFinanceNote').textContent = nextFinDay() ? `下一项：原 Day ${nextFinDay()}` : '已全部完成';

  $('#learnMathMetric').innerHTML = `${m}<small>/48</small>`;
  $('#learnMathBar').style.width = `${pct(m, 48)}%`;
  $('#learnMathNote').textContent = nextMathDay() ? `下一项：Day ${nextMathDay()}` : '已全部完成';
}

function openLearning(tab = 'today') {
  activeLearningTab = tab;
  window.dispatchEvent(new CustomEvent('suiwind:learning-open'));
  $('#learningModal').classList.add('show');
  renderLearningSummary();
  renderLearningPanel();
}

function renderLearningPanel() {
  document.querySelectorAll('[data-learning-tab]').forEach(b => b.classList.toggle('active', b.dataset.learningTab === activeLearningTab));
  if (activeLearningTab === 'today') renderLearnToday();
  else if (activeLearningTab === 'timer') renderLearnTimer();
  else if (activeLearningTab === 'subjects') renderLearnSubjects();
  else renderLearnExams();
}

function renderLearnToday() {
  const k = todayKey(), busy = !!LS.busyDates[k];
  const r1 = nextEn1(), r2 = nextEn2(), sb = curSkillBlock(), fd = nextFinDay(), md = nextMathDay();
  const doneList = completionsOn(k);

  const items = [];
  if (r1) items.push({ title: `英语词汇一轮 · ${enLabel(r1)}`, meta: '每日 1 个 Lesson，扎实记忆不贪多', act: 'r1' });
  else if (r2) items.push({ title: `英语词汇二轮 · ${enLabel(r2)}`, meta: '倍速过词 + 查漏补缺', act: 'r2' });
  if (sb) items.push({ title: `四级技巧 · Day ${sb.day} (${sb.stage})`, meta: `待看：${sb.left.map(id => '#' + id).join('、')}`, act: 'skill' });
  if (!busy && fd) items.push({ title: `财经综合 · 原 Day ${fd} · ${finItem(fd)?.title || ''}`, meta: `${finItem(fd)?.subject || ''} · ${finItem(fd)?.target || ''}`, act: 'fin' });
  if (!busy && md) items.push({ title: `高等数学 · Day ${md}`, meta: `${mathItem(md)?.lectures?.length || 0} 节视频 · 约 ${secHuman(mathDur(mathItem(md)))}`, act: 'math' });

  $('#learningPanel').innerHTML = `
    <div class="card-box">
      <div class="row-spread">
        <div>
          <h4>今日推进队列 · ${k}</h4>
          <div class="small">${busy ? '今日已开启缓冲模式，不强推财经与高数新进度。' : '按顺序打勾即可，提前完成自动前移，做不完不产生欠账。'}</div>
        </div>
        <button class="btn sm ${busy ? 'soft' : 'danger'}" id="toggleBusyBtn" type="button">${busy ? '恢复正常' : '今天很忙（缓冲）'}</button>
      </div>
      ${items.length ? items.map(it => `
        <div class="queue-item">
          <div><b>${esc(it.title)}</b><small>${esc(it.meta)}</small></div>
          <button class="btn sm primary" type="button" data-qact="${it.act}">${it.act === 'skill' ? '去勾选' : '完成'}</button>
        </div>`).join('') : '<div class="empty-box mt-10">今天的核心队列已全部推进完成。</div>'}
    </div>
    <div class="card-box">
      <div class="row-spread">
        <h4>今日已完成记录</h4>
        <span class="small">今日专注 ${secHuman(todayStudySec())}</span>
      </div>
      ${doneList.length ? doneList.map(x => `<div class="small py-5">${ico('check', 'ico-sm')} ${esc(x)}</div>`).join('') : '<div class="small mt-6">今天尚未打勾正式学习项。</div>'}
    </div>`;

  $('#toggleBusyBtn').onclick = () => {
    if (LS.busyDates[k]) delete LS.busyDates[k];
    else LS.busyDates[k] = { reason: '今日缓冲', createdAt: isoNow() };
    S.s('learningState', LS); renderLearnToday(); renderTodayFocus(); renderCal();
  };
  document.querySelectorAll('[data-qact]').forEach(b => {
    b.onclick = () => {
      const a = b.dataset.qact;
      if (a === 'r1' && r1) markLearning(LS.english.round1, r1, true);
      else if (a === 'r2' && r2) markLearning(LS.english.round2, r2, true);
      else if (a === 'skill') { activeLearningTab = 'subjects'; activeSubjectSub = 'english'; renderLearningPanel(); return; }
      else if (a === 'fin' && fd) markLearning(LS.finance.completions, fd, true);
      else if (a === 'math' && md) markLearning(LS.math.completions, md, true);
      toast('已标记完成', true);
    };
  });
}

function renderLearnTimer() {
  const a = LS.studyTimer.active;
  const recent = [...(LS.studyTimer.sessions || [])].sort((x, y) => String(y.recordedAt || y.endAt || '').localeCompare(String(x.recordedAt || x.endAt || ''))).slice(0, 12);

  $('#learningPanel').innerHTML = `
    <div class="timer-box">
      <div class="small">今日累计 ${secHuman(todayStudySec())} · 本周累计 ${secHuman(weekStudySec())}</div>
      <div class="timer-clock" id="liveTimerClock">${a ? clockStr(Math.max(0, (a.energy === 'low' ? 25 : 50) * 60 - curPhaseSec())) : '50:00'}</div>
      <div class="small" id="liveTimerPhase">${a ? `${esc(a.subject)} · 专注中` : '选择科目后开始，默认 50 分钟标准 / 25 分钟轻负荷'}</div>
      ${a ? `<div class="timer-controls"><button class="btn danger" id="finishStudyBtn" type="button">结束并保存</button></div>`
      : `<div class="timer-grid">
          <select id="studySubject">${STUDY_SUBJECTS.map(s => `<option>${s}</option>`).join('')}</select>
          <select id="studyMode"><option value="normal">标准 · 50分</option><option value="low">轻负荷 · 25分</option></select>
          <input id="studyNote" type="text" placeholder="本轮专注内容（可选）">
          <button class="btn primary" id="startStudyBtn" type="button">开始专注</button>
        </div>`}
    </div>
    <div class="card-box">
      <h4>漏记补录</h4>
      <div class="timer-grid">
        <select id="manSubject">${STUDY_SUBJECTS.map(s => `<option>${s}</option>`).join('')}</select>
        <input id="manDate" type="date" value="${todayKey()}">
        <input id="manMin" type="number" min="1" max="600" placeholder="分钟数">
        <button class="btn sm soft" id="manAddBtn" type="button">补记</button>
      </div>
    </div>
    <div class="card-box">
      <h4>最近专注记录</h4>
      ${recent.length ? recent.map(x => `
        <div class="log-row">
          <b>${esc(x.subject)}</b>
          <span>${secHuman(x.focusSeconds)}</span>
          <span class="small">${x.manual ? esc(sessionDate(x)) + ' 补记' : bjDateTime(x.startAt)}${x.note ? ' · ' + esc(x.note) : ''}</span>
          <button data-action-delete class="x" type="button" data-del-sess="${x.id}" aria-label="删除">${ico('x', 'ico-sm')}</button>
        </div>`).join('') : '<div class="small">暂无专注记录。</div>'}
    </div>`;

  if ($('#startStudyBtn')) $('#startStudyBtn').onclick = () => startStudy($('#studySubject').value, $('#studyMode').value, $('#studyNote').value);
  if ($('#finishStudyBtn')) $('#finishStudyBtn').onclick = finishStudy;
  $('#manAddBtn').onclick = () => {
    const min = Math.round(Number($('#manMin').value));
    const dk = $('#manDate').value;
    if (!dateOk(dk) || !min || min <= 0 || min > 600) { alert('请填写有效的日期与分钟数（1-600）。'); return; }
    const sub = $('#manSubject').value;
    LS.studyTimer.sessions.push({
      id: 'manual-' + uuid(), manual: true, dateKey: dk, subject: sub, energy: 'normal',
      timeClass: ['英语', '财经', '高数'].includes(sub) ? 'CORE-DEEP' : 'OTHER-ACADEMIC',
      startAt: isoNow(), endAt: isoNow(), focusSeconds: min * 60, breakSeconds: 0, recordedAt: isoNow()
    });
    S.s('learningState', LS); toast(`已补记 ${sub} ${min} 分钟`, true); renderLearnTimer(); renderTodayFocus();
  };
  document.querySelectorAll('[data-del-sess]').forEach(b => {
    b.onclick = () => {
      if (!confirm('删除这条专注记录？')) return;
      const id = b.dataset.delSess;
      LS.studyTimer.sessions = LS.studyTimer.sessions.filter(x => x.id !== id);
      LS.studyTimer.deletedSessionIds = [...new Set([...(LS.studyTimer.deletedSessionIds || []), id])];
      S.s('learningState', LS); renderLearnTimer(); renderTodayFocus();
    };
  });
  timerTick();
}

function renderBurndownSvg(total, map, startStr, targetStr) {
  const today = todayKey();
  const dates = Object.values(map || {}).map(entryDate).filter(dateOk).sort();
  const start = startStr || dates[0] || today;
  const end = (targetStr && targetStr > today) ? targetStr : addDaysKey(today, 14);
  const span = Math.max(7, Math.min(365, dayDiff(parse(end), parse(start))));
  const counts = {};
  dates.forEach(k => { if (k >= start && k <= today) counts[k] = (counts[k] || 0) + 1; });
  let rem = total;
  const pts = [{ d: start, r: total }];
  Object.keys(counts).sort().forEach(k => { rem = Math.max(0, rem - counts[k]); pts.push({ d: k, r: rem }); });
  if (pts[pts.length - 1].d !== today) pts.push({ d: today, r: Math.max(0, total - dates.length) });

  const W = 680, Hh = 200, L = 40, Rr = 22, Tt = 18, B = 28, pw = W - L - Rr, ph = Hh - Tt - B;
  const x = k => L + Math.max(0, Math.min(span, dayDiff(parse(k), parse(start)))) / span * pw;
  const y = v => Tt + (1 - Math.max(0, Math.min(total, v)) / Math.max(1, total)) * ph;
  const coords = pts.map(p => ({ px: x(p.d), py: y(p.r), r: p.r }));
  const poly = coords.map(c => `${c.px.toFixed(1)},${c.py.toFixed(1)}`).join(' ');
  const firstC = coords[0], lastC = coords[coords.length - 1];
  const baseY = (Hh - B).toFixed(1);
  const areaD = `M ${firstC.px.toFixed(1)},${firstC.py.toFixed(1)} ` + coords.slice(1).map(c => `L ${c.px.toFixed(1)},${c.py.toFixed(1)}`).join(' ') + ` L ${lastC.px.toFixed(1)},${baseY} L ${firstC.px.toFixed(1)},${baseY} Z`;

  const gridYs = [0.25, 0.5, 0.75, 1].map(ratio => {
    const val = Math.round(total * ratio);
    const yy = y(val).toFixed(1);
    return `<line x1="${L}" y1="${yy}" x2="${W - Rr}" y2="${yy}"/><text x="${L - 7}" y="${Number(yy) + 3.5}" text-anchor="end">${val}</text>`;
  }).join('');

  const idealLine = (targetStr && targetStr > start) ? `<line class="ideal" x1="${x(start).toFixed(1)}" y1="${y(total).toFixed(1)}" x2="${x(targetStr).toFixed(1)}" y2="${baseY}"/>` : '';
  const tx = x(today).toFixed(1);
  const labelAnchor = lastC.px > W - 96 ? 'end' : 'start';
  const labelX = lastC.px > W - 96 ? (lastC.px - 8).toFixed(1) : (lastC.px + 8).toFixed(1);

  return `<svg class="burndown-svg burn" viewBox="0 0 ${W} ${Hh}">
    <defs>
      <linearGradient id="burnFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g class="grid">${gridYs}</g>
    <line class="axis" x1="${L}" y1="${baseY}" x2="${W - Rr}" y2="${baseY}"/>
    <line class="today-line" x1="${tx}" y1="${Tt}" x2="${tx}" y2="${baseY}"/>
    ${idealLine}
    <path class="area" d="${areaD}"/>
    <polyline class="actual" pathLength="1" points="${poly}"/>
    <circle class="end-dot" cx="${lastC.px.toFixed(1)}" cy="${lastC.py.toFixed(1)}" r="3.5"/>
    <text class="end-label" x="${labelX}" y="${(lastC.py - 8).toFixed(1)}" text-anchor="${labelAnchor}">剩余 ${lastC.r}</text>
    <text x="${L - 7}" y="${Number(baseY) + 3}" text-anchor="end">0</text>
    <text x="${L}" y="${Hh - 8}">${start.slice(5)}</text>
    <text class="today-label" x="${tx}" y="${Hh - 8}" text-anchor="middle">今日</text>
    <text x="${W - Rr}" y="${Hh - 8}" text-anchor="end">${end.slice(5)}</text>
  </svg>`;
}

function renderLearnSubjects() {
  let content = '';
  if (activeSubjectSub === 'english') {
    const r1 = enDone(LS.english.round1), sk = doneCount(LS.english.skills);
    const vocabRows = ENGLISH_VOCAB_LESSONS.map(x => {
      const v = LS.english.round1[String(x.i)], d = !!v;
      return `<label class="check-row ${d ? 'done' : ''}"><input type="checkbox" data-m="en1" data-id="${x.i}" ${d ? 'checked' : ''}><div><div class="check-title">Unit ${x.unit} · Lesson ${x.lesson}</div><div class="check-meta">${esc(x.range)}</div></div><span class="small">${d ? entryDate(v) : ''}</span></label>`;
    }).join('');
    const skillRows = ENGLISH_SKILL_PLAN_ORDER.map(id => {
      const s = skillById(id), v = LS.english.skills[String(id)], d = !!v;
      return `<label class="check-row ${d ? 'done' : ''}"><input type="checkbox" data-m="sk" data-id="${id}" ${d ? 'checked' : ''}><div><div class="check-title">${s.module} · #${id} ${esc(s.title)}</div><div class="check-meta">${esc(s.duration)}</div></div><span class="small">${d ? entryDate(v) : ''}</span></label>`;
    }).join('');
    content = `
      <div class="card-box">
        <div class="row-spread"><h4>英语词汇一轮燃尽图（${r1}/40）</h4><span class="small">剩余 ${40 - r1} 节</span></div>
        ${renderBurndownSvg(40, LS.english.round1, '2026-10-13', LS.burndown.targets.english1 || '2026-11-18')}
      </div>
      <div class="card-box"><h4>词汇一轮清单（40 Lesson）</h4><div class="check-list">${vocabRows}</div></div>
      <div class="card-box"><h4>四级技巧清单（${sk}/38 · 阅读→听力→翻译→写作）</h4><div class="check-list">${skillRows}</div></div>`;
  } else if (activeSubjectSub === 'finance') {
    const f = doneCount(LS.finance.completions);
    const rows = FINANCE_EXEC_ORDER.map((d, idx) => {
      const x = finItem(d), v = LS.finance.completions[String(d)], done = !!v;
      return `<label class="check-row ${done ? 'done' : ''}"><input type="checkbox" data-m="fin" data-id="${d}" ${done ? 'checked' : ''}><div><div class="check-title">${idx + 1}. ${esc(x.subject)} · ${esc(x.title)}</div><div class="check-meta">原 Day ${d} · ${esc(x.target || '')}</div></div><span class="small">${done ? entryDate(v) : ''}</span></label>`;
    }).join('');
    content = `
      <div class="card-box">
        <div class="row-spread"><h4>财经综合燃尽图（${f}/80）</h4><span class="small">会计 → 财管 → 经济学 → 收官</span></div>
        ${renderBurndownSvg(80, LS.finance.completions, LEARNING_CONFIG.resumeDate, LS.burndown.targets.finance || '')}
      </div>
      <div class="card-box"><h4>80 天执行队列</h4><div class="check-list">${rows}</div></div>`;
  } else {
    const m = doneCount(LS.math.completions);
    const rows = MATH_PLAN.map(item => {
      const v = LS.math.completions[String(item.day)], done = !!v;
      const first = item.lectures[0]?.title.replace(/^第\d+讲-/, '') || '高数';
      return `<label class="check-row ${done ? 'done' : ''}"><input type="checkbox" data-m="math" data-id="${item.day}" ${done ? 'checked' : ''}><div><div class="check-title">Day ${item.day} · ${esc(first)}</div><div class="check-meta">${item.lectures.length} 节视频 · 约 ${secHuman(mathDur(item))}</div></div><span class="small">${done ? entryDate(v) : ''}</span></label>`;
    }).join('');
    content = `
      <div class="card-box">
        <div class="row-spread"><h4>高等数学燃尽图（${m}/48）</h4><span class="small">剩余 ${48 - m} 天</span></div>
        ${renderBurndownSvg(48, LS.math.completions, LEARNING_CONFIG.resumeDate, LS.burndown.targets.math || '')}
      </div>
      <div class="card-box"><h4>48 天基础队列</h4><div class="check-list">${rows}</div></div>`;
  }

  $('#learningPanel').innerHTML = `
    <div class="sub-tabs">
      <button class="btn sm ${activeSubjectSub === 'english' ? 'active' : ''}" data-sub="english" type="button">英语</button>
      <button class="btn sm ${activeSubjectSub === 'finance' ? 'active' : ''}" data-sub="finance" type="button">财经综合</button>
      <button class="btn sm ${activeSubjectSub === 'math' ? 'active' : ''}" data-sub="math" type="button">高等数学</button>
    </div>${content}`;

  document.querySelectorAll('[data-sub]').forEach(b => { b.onclick = () => { activeSubjectSub = b.dataset.sub; renderLearnSubjects(); }; });
  document.querySelectorAll('[data-m]').forEach(el => {
    el.onchange = ev => {
      const map = el.dataset.m === 'en1' ? LS.english.round1 : el.dataset.m === 'sk' ? LS.english.skills : el.dataset.m === 'fin' ? LS.finance.completions : LS.math.completions;
      markLearning(map, el.dataset.id, ev.target.checked);
    };
  });
}

function renderLearnExams() {
  const list = [...(LS.countdowns || [])].sort((a, b) => a.date.localeCompare(b.date));
  const edit = editingCountdownId ? list.find(x => x.id === editingCountdownId) : null;
  const roadmapHtml = [2026, 2027, 2028, 2029].map(yr => {
    const theme = ROADMAP_THEMES[yr] || ['阶段', ''];
    const evs = list.filter(x => Number(x.date.slice(0, 4)) === yr);
    return `
      <div class="roadmap-row">
        <div class="roadmap-yr">${yr}</div>
        <div class="card-box mb-0">
          <h4>${esc(theme[0])}</h4>
          <div class="small">${esc(theme[1])}</div>
          ${evs.map(x => `<div class="queue-item"><div><b>${esc(x.title)}</b><small>${esc(x.date)}${x.endDate ? ' — ' + esc(x.endDate) : ''}${x.note ? ' · ' + esc(x.note) : ''}</small></div><div class="flex-center-xs"><span class="pill info">${countdownText(x.date, x.endDate)}</span><button class="btn sm ghost" data-cedit="${x.id}" type="button">改</button><button class="x" data-cdel="${x.id}" type="button" aria-label="删除">${ico('x', 'ico-sm')}</button></div></div>`).join('')}
        </div>
      </div>`;
  }).join('');

  $('#learningPanel').innerHTML = `
    <div class="card-box">
      <div class="row-spread">
        <h4>${edit ? '编辑考试 / 考证节点' : '添加考试 / 考证倒数日'}</h4>
        ${edit ? '<button class="btn sm ghost" id="cancelCdEdit" type="button">取消编辑</button>' : ''}
      </div>
      <div class="countdown-form">
        <input id="cdTitle" type="text" placeholder="考试名称" value="${edit ? esc(edit.title) : ''}">
        <input id="cdDate" type="date" value="${edit?.date || todayKey()}">
        <input id="cdEnd" type="date" value="${edit?.endDate || ''}" title="结束日期（可选）">
        <select id="cdKind">${['考试', '考证', '升学考试', '报名', '其他'].map(k => `<option ${edit?.kind === k ? 'selected' : ''}>${k}</option>`).join('')}</select>
        <input id="cdNote" type="text" placeholder="备注（可选）" value="${edit ? esc(edit.note) : ''}">
        <button class="btn sm primary" id="cdSave" type="button">${edit ? '保存' : '添加'}</button>
      </div>
    </div>
    ${roadmapHtml}`;

  if ($('#cancelCdEdit')) $('#cancelCdEdit').onclick = () => { editingCountdownId = ''; renderLearnExams(); };
  $('#cdSave').onclick = () => {
    const title = $('#cdTitle').value.trim(), date = $('#cdDate').value, endDate = $('#cdEnd').value, kind = $('#cdKind').value, note = $('#cdNote').value.trim();
    if (!title || !dateOk(date)) { alert('请填写名称和有效日期。'); return; }
    if (edit) {
      const idx = LS.countdowns.findIndex(x => x.id === edit.id);
      if (idx >= 0) LS.countdowns[idx] = { ...LS.countdowns[idx], title, date, endDate: endDate >= date ? endDate : '', kind, note };
      editingCountdownId = '';
    } else {
      LS.countdowns.push({ id: uuid(), title, date, endDate: endDate >= date ? endDate : '', kind, note, createdAt: isoNow() });
    }
    S.s('learningState', LS); renderCal(); renderLearnExams(); toast('考试节点已保存', true);
  };
  document.querySelectorAll('[data-cedit]').forEach(b => { b.onclick = () => { editingCountdownId = b.dataset.cedit; renderLearnExams(); }; });
  document.querySelectorAll('[data-cdel]').forEach(b => {
    b.onclick = () => {
      if (!confirm('删除这个考试节点？')) return;
      LS.countdowns = LS.countdowns.filter(x => x.id !== b.dataset.cdel);
      S.s('learningState', LS); renderCal(); renderLearnExams();
    };
  });
}

/* ===== 周 / 月复盘中心（去假 AI，换一键复制纯文本） ===== */
function collectPeriod(a, b) {
  const days = eachDate(a, b);
  let total = 0, done = 0, hiTotal = 0, hiDone = 0, refDays = 0;
  const wrong = [], right = [], better = [];
  days.forEach(d => {
    const arr = allTasksFor(d);
    total += arr.length; done += arr.filter(x => x.done).length;
    const hi = arr.filter(x => x.priority === 'high');
    hiTotal += hi.length; hiDone += hi.filter(x => x.done).length;
    const r = R[fmt(d)] || {};
    if (reflectHas(r)) refDays++;
    if ((r.q1 || '').trim()) wrong.push({ date: d, text: r.q1.trim() });
    if ((r.q2 || '').trim()) right.push({ date: d, text: r.q2.trim() });
    if ((r.q3 || '').trim()) better.push({ date: d, text: r.q3.trim() });
  });
  return { days, total, done, hiTotal, hiDone, refDays, wrong, right, better };
}

function fitnessPeriodText(a,b) {
  try {
    const x = window.SuiwindFitnessCore.summarize(readFitnessState(),fmt(a),fmt(b));
    return `完整 ${x.complete} 次 · 部分 ${x.partial} 次 · ${x.sets} 组 · 已累计 ${Math.floor(x.elapsedMs/60000)} 分钟（不含仍在运行的计时）`;
  } catch { return '健身数据暂不可读，请检查本机记录。'; }
}
function buildReviewMd(type) {
  const isW = type === 'week';
  const a = isW ? startOfWeek(sel) : new Date(sel.getFullYear(), sel.getMonth(), 1, 12);
  const b = isW ? endOfWeek(sel) : new Date(sel.getFullYear(), sel.getMonth() + 1, 0, 12);
  const data = collectPeriod(a, b);
  const title = isW ? `${fmt(a)} ~ ${fmt(b)} 周复盘` : `${sel.getFullYear()}年${sel.getMonth() + 1}月 月复盘`;
  const mKey = isW ? `week:${weekKey(sel)}` : `month:${monthKey(sel)}`;
  const manual = (S.g('reviewNotes', {})[mKey] || '').trim();
  const lines = [
    `# ${title}`, '',
    `- 任务完成：${data.done} / ${data.total}（${data.total ? Math.round(data.done / data.total * 100) : 0}%）`,
    `- 高优先级：${data.hiDone} / ${data.hiTotal}`,
    `- 复盘天数：${data.refDays} 天`,
    `- 专注时长：${secHuman(studySecBetween(fmt(a), fmt(b)))}`,
    `- 健身训练：${fitnessPeriodText(a,b)}`, ''
  ];
  const sec = (h, arr) => {
    lines.push(`## ${h}`, '');
    if (!arr.length) lines.push('暂无记录。', '');
    else arr.forEach(x => lines.push(`- **${fmt(x.date)}**：${x.text}`));
    lines.push('');
  };
  sec('可以做得更好的地方', data.wrong);
  sec('做对了的事 / 值得记住的小事', data.right);
  sec('具体改进计划', data.better);
  lines.push('## 我的总结', '', manual || '暂无。');
  return { name: `${title.replace(/[~:/\\*?"<>|]/g, '-')}.md`, text: lines.join('\n') };
}

function renderReviewModal() {
  const isW = activeReviewType === 'week';
  $('#weeklyTab').classList.toggle('active', isW);
  $('#monthlyTab').classList.toggle('active', !isW);
  const a = isW ? startOfWeek(sel) : new Date(sel.getFullYear(), sel.getMonth(), 1, 12);
  const b = isW ? endOfWeek(sel) : new Date(sel.getFullYear(), sel.getMonth() + 1, 0, 12);
  const data = collectPeriod(a, b);
  const rate = data.total ? Math.round(data.done / data.total * 100) : 0;
  const mKey = isW ? `week:${weekKey(sel)}` : `month:${monthKey(sel)}`;
  const manual = S.g('reviewNotes', {})[mKey] || '';

  const groups = isW
    ? data.days.map(d => { const arr = allTasksFor(d); return { label: wd(d), done: arr.filter(x => x.done).length, total: arr.length }; })
    : [1, 2, 3, 4, 5].map(w => {
        const sub = data.days.slice((w - 1) * 7, w * 7);
        const arr = sub.flatMap(d => allTasksFor(d));
        return { label: `W${w}`, done: arr.filter(x => x.done).length, total: arr.length };
      });
  const maxBar = Math.max(1, ...groups.map(g => g.total));
  const maxDone = Math.max(0, ...groups.map(g => g.done));
  const trendHtml = groups.map(g => {
    const isEmpty = g.done === 0;
    const h = isEmpty ? 2 : Math.max(10, Math.round((g.done / maxBar) * 84));
    const barCls = isEmpty ? 'bar is-empty' : (g.done === maxDone && maxDone > 0 ? 'bar is-max' : 'bar');
    return `<div class="barwrap"><div class="${barCls}" data-v="${isEmpty ? '' : g.done}" style="height:${h}px" title="${g.done}/${g.total}"></div><div class="barlabel">${g.label}</div></div>`;
  }).join('');

  const listHtml = arr => arr.length
    ? arr.map(x => `<div class="review-entry"><b>${x.date.getMonth() + 1}月${x.date.getDate()}日</b><p>${esc(x.text)}</p></div>`).join('')
    : '<div class="small">这一段暂无记录。</div>';

  $('#reviewBody').innerHTML = `
    <div class="review-metrics">
      <div class="review-metric"><small>任务完成</small><strong>${data.done}<small>/${data.total}</small></strong></div>
      <div class="review-metric"><small>完成率</small><strong>${rate}<small>%</small></strong></div>
      <div class="review-metric"><small>复盘天数</small><strong>${data.refDays}<small> 天</small></strong></div>
      <div class="review-metric"><small>专注累计</small><strong>${secHuman(studySecBetween(fmt(a), fmt(b)))}</strong></div>
    </div>
    <div class="card-box" id="fitnessReviewSummary"><h4>健身训练</h4><p>${esc(fitnessPeriodText(a,b))}</p></div>
    <div class="card-box"><h4>完成趋势</h4><div class="trend">${trendHtml}</div></div>
    <div class="review-grid">
      <div class="card-box reflect-col"><h4>可以做得更好</h4>${listHtml(data.wrong)}</div>
      <div class="card-box reflect-col good"><h4>做对了 / 值得记住</h4>${listHtml(data.right)}</div>
    </div>
    <div class="card-box reflect-col"><h4>具体改进计划</h4>${listHtml(data.better)}</div>
    <div class="card-box">
      <h4>我的${isW ? '本周' : '本月'}总结</h4>
      <textarea id="revManualInput" placeholder="写下这一阶段最重要的感受与下一阶段重点…">${esc(manual)}</textarea>
      <div class="sync-actions sync-actions-end">
        <button class="btn sm primary" id="aiAnalyzeReviewBtn" type="button">${ico('sparkles', 'ico-sm')} 一键 AI 深度分析</button>
        <button class="btn sm soft" id="copyReviewBtn" type="button">复制纯文本</button>
        <button class="btn sm" id="exportReviewBtn" type="button">导出 Markdown</button>
      </div>
      <div id="aiReviewOutput" class="ai-analysis-box" style="${S.g('aiSummaries', {})[mKey] ? '' : 'display:none'}">${esc(S.g('aiSummaries', {})[mKey]?.text || '')}</div>
    </div>`;

  $('#revManualInput').oninput = () => {
    const notes = S.g('reviewNotes', {});
    notes[mKey] = $('#revManualInput').value;
    S.s('reviewNotes', notes);
  };
  $('#copyReviewBtn').onclick = () => copyText(buildReviewMd(activeReviewType).text);
  $('#exportReviewBtn').onclick = () => { const md = buildReviewMd(activeReviewType); downloadText(md.name, md.text); };
  $('#aiAnalyzeReviewBtn').onclick = () => runAiReviewAnalysis(activeReviewType, mKey);
}

/* ===== 云同步与本地快照（100% 兼容 V2.0） ===== */
function readFitnessState() {
  const core = window.SuiwindFitnessCore;
  const raw = localStorage.getItem('zx_fitnessState');
  return raw === null ? core.empty() : core.validate(JSON.parse(raw));
}
function snapshotData() {
  return {
    version: 30, savedAt: isoNow(), tasks: T, recurringTasks: RT, weekGoals: WG, monthGoals: MG,
    deadlineGoals: DG, scheduleOverrides: SO, scheduleConfig: SC, reflections: R, anniversaries: A,
    reviewNotes: S.g('reviewNotes', {}), aiSummaries: S.g('aiSummaries', {}), learningState: LS, liurenHistory: rawGet('liurenHistory', []), fitnessState: readFitnessState()
  };
}
function applySnapshot(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !['tasks','reflections','learningState','recurringTasks','weekGoals','monthGoals','scheduleConfig','anniversaries'].some(k => Object.hasOwn(data,k))) throw new Error('invalid snapshot');
  for (const k of ['tasks','weekGoals','monthGoals','scheduleOverrides','scheduleConfig','reflections','reviewNotes','aiSummaries','learningState']) if (Object.hasOwn(data,k) && (data[k] === null || typeof data[k] !== 'object' || Array.isArray(data[k]))) throw new Error('invalid '+k);
  for (const k of ['recurringTasks','deadlineGoals','anniversaries','liurenHistory']) if (Object.hasOwn(data,k) && (!Array.isArray(data[k]) || data[k].some(x=>!x || typeof x !== 'object' || Array.isArray(x)))) throw new Error('invalid '+k);
  // Prepare and serialize every value before changing memory or storage. A legacy
  // snapshot that lacks a field leaves that field untouched, including Liuren.
  const next = {
    tasks: data.tasks ?? T,
    recurringTasks: (data.recurringTasks ?? RT).map(r => ({ ...r, endDate: r.endDate || '', doneDates: r.doneDates || [], skipDates: r.skipDates || [] })),
    weekGoals: data.weekGoals ?? WG, monthGoals: data.monthGoals ?? MG,
    deadlineGoals: (data.deadlineGoals ?? DG).map(g => ({ ...g, id: g.id || uuid(), priority: g.priority || 'medium', done: !!g.done, completedAt: g.completedAt || '' })),
    scheduleOverrides: data.scheduleOverrides ?? SO,
    scheduleConfig: { ...(data.scheduleConfig ?? SC) }, reflections: data.reflections ?? R,
    anniversaries: (data.anniversaries ?? A).map(a => ({ ...a, id: a.id || uuid() })),
    learningState: normalizeLS(JSON.parse(JSON.stringify(data.learningState ?? LS)))
  };
  if (!Array.isArray(next.scheduleConfig.disabledCourseIds)) next.scheduleConfig.disabledCourseIds = [];
  if (Object.hasOwn(data,'fitnessState')) window.SuiwindFitnessCore.validate(data.fitnessState);
  for (const k of ['reviewNotes','aiSummaries','liurenHistory','fitnessState']) if (Object.hasOwn(data,k)) next[k] = data[k];
  const writes = Object.entries(next).map(([k,v]) => ['zx_'+k, JSON.stringify(v)]);
  const previous = writes.map(([k])=>[k,localStorage.getItem(k)]);
  const changed = [];
  syncSuppressed = true;
  try {
    for (const [k,v] of writes) { localStorage.setItem(k,v); changed.push(k); }
  } catch (err) {
    // Storage quota/privacy errors must not leave a partially restored state.
    // Restore original raw strings, releasing newly written space first.
    try {
      for (const k of changed) localStorage.removeItem(k);
      for (const [k,v] of previous) if (changed.includes(k) && v !== null) localStorage.setItem(k,v);
    } catch (rollbackError) { throw new Error('恢复中断且自动回滚失败，请使用操作前的内部快照或导出的 JSON：'+rollbackError.message); }
    throw err;
  } finally { syncSuppressed = false; }
  ({tasks:T,recurringTasks:RT,weekGoals:WG,monthGoals:MG,deadlineGoals:DG,scheduleOverrides:SO,scheduleConfig:SC,reflections:R,anniversaries:A,learningState:LS}=next);
  syncTimerLoop(); renderCal(); renderSide(); renderStreak(); renderLearningSummary();
  window.dispatchEvent(new Event('suiwind:history-change'));
  window.dispatchEvent(new Event('suiwind:fitness-change'));
}

// Older clients may have synced a row without loading newly introduced fields.
// On upload preserve remote extension data when its local key never existed.
function adoptMissingExtensions(remote) {
  if (!remote || typeof remote !== 'object' || Array.isArray(remote)) return;
  const pending = [];
  for (const field of ['liurenHistory','fitnessState']) {
    if (!Object.hasOwn(remote,field) || localStorage.getItem('zx_'+field) !== null) continue;
    const value = remote[field];
    if (field === 'fitnessState') window.SuiwindFitnessCore.validate(value);
    else if (!Array.isArray(value) || value.some(x=>!x || typeof x !== 'object' || Array.isArray(x))) throw new Error('invalid remote '+field);
    pending.push([field,value]);
  }
  for (const [field,value] of pending) rawSet(field,value);
  if (pending.some(([k])=>k==='liurenHistory')) window.dispatchEvent(new Event('suiwind:history-change'));
  if (pending.some(([k])=>k==='fitnessState')) window.dispatchEvent(new Event('suiwind:fitness-change'));
}
function getBackups() { try { const a = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } }
function createBackup(reason = '手动快照', quiet = false, data) {
  try { if (data === undefined) data = snapshotData(); } catch (err) { alert('无法安全创建快照：'+err.message); return false; }
  const arr = getBackups();
  arr.unshift({ id: uuid(), reason, dateKey: todayKey(), createdAt: isoNow(), data });
  try { localStorage.setItem(BACKUP_KEY, JSON.stringify(arr.slice(0, 7))); } catch { alert('内部快照写入失败。为防止数据丢失，已取消操作；请先导出 JSON 或释放存储空间。'); return false; }
  renderBackups();
  if (!quiet) toast('已创建内部快照', true);
  return true;
}
function renderBackups() {
  const el = $('#backupHistoryList'); if (!el) return;
  const arr = getBackups();
  if (!arr.length) { el.innerHTML = '<div class="small">暂无内部快照。</div>'; return; }
  el.innerHTML = arr.map(x => `
    <div class="log-row log-row-3col">
      <span class="small"><b>${esc(x.reason)}</b> · ${bjDateTime(x.createdAt)}</span>
      <button class="btn sm ghost" data-brestore="${x.id}" type="button">恢复</button>
      <button class="x" data-bdel="${x.id}" type="button" aria-label="删除">${ico('x', 'ico-sm')}</button>
    </div>`).join('');
  document.querySelectorAll('[data-brestore]').forEach(b => {
    b.onclick = () => {
      const item = getBackups().find(x => x.id === b.dataset.brestore);
      if (!item || !confirm(`恢复「${item.reason}」快照？`)) return;
      if (!createBackup('恢复前自动留档', true)) return;
      try { applySnapshot(item.data); markCloudDirty(); } catch (err) { alert('快照恢复失败：'+err.message); return; }
      toast('快照已恢复', true);
    };
  });
  document.querySelectorAll('[data-bdel]').forEach(b => {
    b.onclick = () => {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(getBackups().filter(x => x.id !== b.dataset.bdel)));
      renderBackups();
    };
  });
}

let sb = null, sbUser = null;
const cloudCfg = () => S.g('cloudConfig', { url: '', key: '' });
const syncMeta = () => S.g('syncMeta', { localUpdatedAt: '', lastSyncedAt: '', lastSyncedCloudAt: '', cloudUpdatedAt: '', conflict: false });
function saveSyncMeta(p) { const n = { ...syncMeta(), ...p }; rawSet('syncMeta', n); renderSyncMeta(); return n; }
function setCloudStatus(st, txt) {
  const dot = $('#cloudDot'); if (dot) dot.className = 'cloud-dot' + (st === 'on' ? ' on' : st === 'busy' ? ' busy' : '');
  if ($('#cloudText')) $('#cloudText').textContent = txt;
}
function renderSyncMeta() {
  const m = syncMeta();
  if ($('#localUpdatedLabel')) $('#localUpdatedLabel').textContent = bjDateTime(m.localUpdatedAt);
  if ($('#cloudUpdatedLabel')) $('#cloudUpdatedLabel').textContent = bjDateTime(m.cloudUpdatedAt);
  if ($('#syncStateLabel')) $('#syncStateLabel').textContent = m.conflict ? '发现冲突' : (sbUser ? '已连接' : '仅本地');
  if ($('#syncConflictBox')) $('#syncConflictBox').classList.toggle('show', !!m.conflict);
}
function updateCloudUI() {
  if ($('#accountTitle')) $('#accountTitle').textContent = sbUser ? `已登录 · ${sbUser.email || ''}` : '未登录';
  if ($('#accountInfo')) $('#accountInfo').textContent = sbUser ? '本设备已开启自动续期与云同步。' : '当前数据仅保存在本浏览器。';
  $('#signOutBtn').disabled = !sbUser; $('#uploadCloud').disabled = !sbUser; $('#downloadCloud').disabled = !sbUser;
  renderSyncMeta();
}
function initSupabase() {
  const c = cloudCfg();
  if (!c.url || !c.key || !window.supabase) { sb = null; sbUser = null; setCloudStatus('off', '仅本地'); updateCloudUI(); return; }
  try {
    sb = window.supabase.createClient(c.url, c.key, { auth: { persistSession: true, autoRefreshToken: true } });
    sb.auth.getSession().then(({ data }) => {
      sbUser = data?.session?.user || null;
      setCloudStatus(sbUser ? 'on' : 'off', sbUser ? '已连接' : '未登录');
      updateCloudUI();
      if (sbUser && cloudDirty) scheduleCloudSync();
    });
  } catch { sb = null; setCloudStatus('off', '配置错误'); }
}
async function uploadCloud(silent = false) {
  if (!sb || !sbUser) { if (!silent) alert('请先登录云端账号。'); return; }
  if (cloudUploading) { if (!silent) toast('已有同步任务正在进行'); return; }
  cloudUploading = true;
  const client = sb, userId = sbUser.id, revision = cloudRevision;
  const stillActive = () => sb === client && sbUser?.id === userId;
  const fail = msg => { if (stillActive()) setCloudStatus('off', '同步失败'); if (!silent) alert(msg); };
  try {
    setCloudStatus('busy', '同步中');
    const check = await client.from('calendar_state').select('payload,updated_at').eq('user_id', userId).maybeSingle();
    if (!stillActive()) return;
    if (check.error) { fail(check.error.message); return; }
    const remote = check.data, meta = syncMeta();
    const matched = remote && meta.lastSyncedCloudAt && Date.parse(remote.updated_at) === Date.parse(meta.lastSyncedCloudAt);
    if (remote && (!matched || meta.conflict || (meta.userId && meta.userId !== userId))) {
      saveSyncMeta({ cloudUpdatedAt: remote.updated_at, conflict: true });
      if (silent) { setCloudStatus('off','发现冲突'); return; }
      if (!confirm('云端有未确认的数据。是否先把云端保存为本机快照，再明确使用本机数据覆盖云端？取消后可选择下载。')) { setCloudStatus('off','发现冲突'); return; }
      if (!createBackup('覆盖前云端留档', true, remote.payload)) { setCloudStatus('off','发现冲突'); return; }
    }
    adoptMissingExtensions(remote?.payload);
    const stamp = isoNow(), payload = {...(remote?.payload || {}), ...snapshotData()};
    const row = { user_id: userId, payload, updated_at: stamp };
    const result = await client.from('calendar_state').writeIfUnchanged(row, remote?.updated_at ?? null);
    if (!stillActive()) return;
    if (result.error) { saveSyncMeta({conflict:true}); fail(result.error.message); return; }
    const saved = result.data?.updated_at || stamp;
    saveSyncMeta({ userId, lastSyncedCloudAt: saved, cloudUpdatedAt: saved, lastSyncedAt: stamp, ...(cloudRevision === revision ? {localUpdatedAt:stamp} : {}), conflict: false });
    cloudDirty = cloudRevision !== revision; setCloudStatus('on','已同步');
    if (!silent) toast('已上传到云端', true);
  } catch (err) { fail(err.message || String(err)); }
  finally { cloudUploading = false; if (cloudRevision !== revision && stillActive() && !syncMeta().conflict) scheduleCloudSync(); }
}
async function downloadCloud() {
  if (!sb || !sbUser) { alert('请先登录云端账号。'); return; }
  if (cloudUploading) { toast('请先完成当前同步'); return; }
  clearTimeout(syncTimer);
  const client = sb, userId = sbUser.id;
  setCloudStatus('busy', '拉取中');
  const { data, error } = await sb.from('calendar_state').select('payload,updated_at').eq('user_id', sbUser.id).maybeSingle();
  if (error || !data?.payload) { setCloudStatus('on', '已同步'); alert(error ? error.message : '云端暂无数据。'); return; }
  if (!confirm('将使用云端数据覆盖当前本机数据（本机已自动备份快照），继续吗？')) { setCloudStatus('on', '已同步'); return; }
  if (sb !== client || sbUser?.id !== userId || cloudUploading) { alert('同步状态已变化，请重试。'); return; }
  if (!createBackup('下载云端前', true)) { setCloudStatus('off','下载取消'); return; }
  try { applySnapshot(data.payload); } catch (err) { setCloudStatus('off','下载失败'); alert('云端数据格式无效或本机存储失败：'+err.message); return; }
  clearTimeout(syncTimer); cloudDirty = false;
  saveSyncMeta({ userId, lastSyncedCloudAt: data.updated_at, cloudUpdatedAt: data.updated_at, lastSyncedAt: isoNow(), localUpdatedAt: isoNow(), conflict: false });
  setCloudStatus('on', '已同步'); toast('云端数据已恢复', true);
}
function markCloudDirty() { cloudDirty = true; cloudRevision++; }
function scheduleCloudSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => { if (sb && sbUser && cloudDirty && !syncMeta().conflict) uploadCloud(true); }, 2000);
}

/* ===== 主题、纪念日、通知、SW ===== */
function applyTheme(t) {
  const dark = t === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  try { localStorage.setItem('zx_theme', dark ? 'dark' : 'light'); } catch {}
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#121412' : '#F3F0E8');
  $('#themeToggleIcon').innerHTML = ico(dark ? 'sun' : 'moon');
}

function renderAnnivManage() {
  const el = $('#annivManage');
  el.innerHTML = A.length ? A.map(a => `
    <div class="log-row log-row-3col">
      <div><b>${ico('heart', 'ico-sm ico-seal')} ${esc(a.name)}</b><div class="small">${a.date}${a.repeat ? ' · 每年重复' : ''}</div></div>
      <span class="pill info">${countdownText(a.date)}</span>
      <button class="x" data-adel="${a.id}" type="button" aria-label="删除">${ico('x', 'ico-sm')}</button>
    </div>`).join('') : '<div class="small">暂无纪念日。</div>';
  document.querySelectorAll('[data-adel]').forEach(b => {
    b.onclick = () => { A = A.filter(x => x.id !== b.dataset.adel); S.s('anniversaries', A); renderAnnivManage(); renderCal(); };
  });
}

function updateNotifyUI() {
  const lb = $('#notifyBtn')?.querySelector('#notifyLabel');
  if (!lb || !('Notification' in window)) return;
  lb.textContent = Notification.permission === 'granted' ? '提醒已开启' : '开启提醒';
}

function setupSW() {
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  let waiting = null;
  $('#swUpdateApplyBtn').onclick = () => { if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' }); else location.reload(); };
  $('#swUpdateDismissBtn').onclick = () => $('#swUpdateBar').classList.remove('show');
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
  navigator.serviceWorker.register('./sw.js').then(reg => {
    if (reg.waiting) { waiting = reg.waiting; $('#swUpdateBar').classList.add('show'); }
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (nw) nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) { waiting = nw; $('#swUpdateBar').classList.add('show'); } });
    });
  }).catch(() => {});
}

/* ===== 事件绑定 ===== */
function bindEvents() {
  document.addEventListener('click', e => { if (!e.target.closest('#moreMenuWrap')) $('#moreMenuDropdown').classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $('#moreMenuDropdown').classList.remove('open');
      ['cloudModal', 'scheduleModal', 'repeatActionModal', 'modal', 'aiModal'].forEach(id => $('#' + id)?.classList.remove('show'));
    }
  });

  $('#themeToggleBtn').onclick = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  $('#moreMenuBtn').onclick = e => { e.stopPropagation(); $('#moreMenuDropdown').classList.toggle('open'); };

  $('#prevBtn').onclick = () => { view.setMonth(view.getMonth() - 1); renderCal(true); };
  $('#nextBtn').onclick = () => { view.setMonth(view.getMonth() + 1); renderCal(true); };
  $('#todayBtn').onclick = () => { sel = todayDate(); view = new Date(sel.getFullYear(), sel.getMonth(), 1); renderCal(true); renderSide(); };
  $('#yearSelect').onchange = e => { const y = Number(e.target.value); view = new Date(y, view.getMonth(), 1, 12); sel = new Date(y, view.getMonth(), 1, 12); renderCal(true); renderSide(); };

  document.querySelectorAll('[data-side-tab]').forEach(b => { b.onclick = () => setSideTab(b.dataset.sideTab); });

  // 任务与期限
  const doAddTask = () => {
    const v = $('#taskInput').value.trim(); if (!v) return;
    const item = { id: uuid(), text: v, priority: $('#priority').value, reminder: $('#reminder').value || '', repeat: $('#repeat').value, done: false };
    if (item.repeat === 'none') { const k = fmt(sel); T[k] = T[k] || []; T[k].push(item); S.s('tasks', T); }
    else { RT.push({ ...item, startDate: fmt(sel), endDate: $('#repeatEnd').value || '', doneDates: [], skipDates: [] }); S.s('recurringTasks', RT); }
    $('#taskInput').value = ''; $('#reminder').value = ''; $('#repeat').value = 'none'; $('#repeatEnd').value = ''; $('#repeatEndWrap').hidden = true;
    renderCal(); renderTasks();
  };
  $('#addTask').onclick = doAddTask;
  $('#taskInput').onkeydown = e => { if (e.key === 'Enter') doAddTask(); };
  $('#repeat').onchange = () => { $('#repeatEndWrap').hidden = $('#repeat').value === 'none'; };

  $('#addDeadline').onclick = () => {
    const text = $('#deadlineInput').value.trim(), dueDate = $('#deadlineDate').value;
    if (!text || !dueDate) { toast('请填写事项名称和截止日期'); return; }
    DG.push({ id: uuid(), text, dueDate, priority: $('#deadlinePriority').value, done: false, createdAt: isoNow(), completedAt: '' });
    S.s('deadlineGoals', DG); $('#deadlineInput').value = ''; renderDeadlines(); renderCal();
  };
  $('#addWeek').onclick = () => {
    const v = $('#weekInput').value.trim(); if (!v) return;
    const k = weekKey(sel); WG[k] = WG[k] || []; WG[k].push({ id: uuid(), text: v, done: false });
    S.s('weekGoals', WG); $('#weekInput').value = ''; renderGoals();
  };
  $('#addMonth').onclick = () => {
    const v = $('#monthInput').value.trim(); if (!v) return;
    const k = monthKey(sel); MG[k] = MG[k] || []; MG[k].push({ id: uuid(), text: v, done: false });
    S.s('monthGoals', MG); $('#monthInput').value = ''; renderGoals();
  };

  // 重复任务弹窗
  const closeRep = () => { pendingRecurring = null; $('#repeatActionModal').classList.remove('show'); };
  $('#closeRepeatAction').onclick = closeRep;
  $('#repeatSkipOne').onclick = () => {
    if (!pendingRecurring) return;
    const r = RT.find(x => x.id === pendingRecurring.task.id);
    if (r) { r.skipDates = [...new Set([...(r.skipDates || []), fmt(pendingRecurring.date)])]; S.s('recurringTasks', RT); }
    closeRep(); renderCal(); renderTasks();
  };
  $('#repeatEndFromHere').onclick = () => {
    if (!pendingRecurring) return;
    const r = RT.find(x => x.id === pendingRecurring.task.id);
    if (r) { const prev = new Date(pendingRecurring.date); prev.setDate(prev.getDate() - 1); r.endDate = fmt(prev); S.s('recurringTasks', RT); }
    closeRep(); renderCal(); renderTasks();
  };
  $('#repeatDeleteAll').onclick = () => {
    if (!pendingRecurring) return;
    RT = RT.filter(x => x.id !== pendingRecurring.task.id); S.s('recurringTasks', RT);
    closeRep(); renderCal(); renderTasks();
  };

  // 复盘
  ['q1', 'q2', 'q3'].forEach(id => { $('#' + id).oninput = saveDraftR; });
  $('#completeReflection').onclick = finishR;

  // 学习中心
  $('#learningBtn').onclick = () => openLearning('today');
  $('#closeLearning').onclick = () => $('#learningModal').classList.remove('show');
  $('#learningModal').onclick = e => { if (e.target === $('#learningModal')) $('#learningModal').classList.remove('show'); };
  document.querySelectorAll('[data-learning-tab]').forEach(b => { b.onclick = () => { activeLearningTab = b.dataset.learningTab; renderLearningPanel(); }; });

  // 周月复盘
  $('#reviewBtn').onclick = () => { window.dispatchEvent(new CustomEvent('suiwind:review-open')); $('#reviewModal').classList.add('show'); renderReviewModal(); };
  $('#closeReview').onclick = () => $('#reviewModal').classList.remove('show');
  $('#reviewModal').onclick = e => { if (e.target === $('#reviewModal')) $('#reviewModal').classList.remove('show'); };
  $('#weeklyTab').onclick = () => { activeReviewType = 'week'; renderReviewModal(); };
  $('#monthlyTab').onclick = () => { activeReviewType = 'month'; renderReviewModal(); };

  // 课表弹窗
  const openSched = () => {
    $('#scheduleModalDate').textContent = `${fmt(sel)} · 周${wd(sel)}`;
    const list = activeCourses();
    $('#scheduleProfileStat').textContent = list.length ? `已导入 ${list.length} 门固定课程（本地私密保存）。` : '尚未导入固定课表。';
    $('#schedulePreset').innerHTML = '<option value="">自定义 / 临时课程</option>' + list.map(c => `<option value="${esc(c.id)}">${esc(c.name)} (${esc(c.start)}–${esc(c.end)})</option>`).join('');
    const ov = schedOv(sel), canc = list.filter(c => ov.cancelled.includes(c.id));
    $('#cancelledScheduleList').innerHTML = canc.length ? canc.map(c => `<div class="log-row log-row-2col"><span>${esc(c.name)} (${esc(c.start)}–${esc(c.end)})</span><button class="btn sm soft" data-res-c="${esc(c.id)}" type="button">恢复</button></div>`).join('') : '<div class="small">今天没有已取消的课程。</div>';
    document.querySelectorAll('[data-res-c]').forEach(b => {
      b.onclick = () => { const k = fmt(sel), cur = schedOv(sel); SO[k] = { ...cur, cancelled: cur.cancelled.filter(id => id !== b.dataset.resC) }; S.s('scheduleOverrides', SO); renderSchedule(); openSched(); };
    });
    $('#scheduleModal').classList.add('show');
  };
  $('#scheduleEditBtn').onclick = openSched;
  $('#closeScheduleModal').onclick = () => $('#scheduleModal').classList.remove('show');
  $('#scheduleModal').onclick = e => { if (e.target === $('#scheduleModal')) $('#scheduleModal').classList.remove('show'); };
  $('#schedulePreset').onchange = e => {
    const c = activeCourses().find(x => x.id === e.target.value);
    if (!c) return;
    $('#scheduleName').value = c.name || ''; $('#scheduleStart').value = c.start || ''; $('#scheduleEnd').value = c.end || ''; $('#scheduleTeacher').value = c.teacher || ''; $('#scheduleRoom').value = c.room || '';
  };
  $('#addScheduleCourse').onclick = () => {
    const name = $('#scheduleName').value.trim(), start = $('#scheduleStart').value, end = $('#scheduleEnd').value;
    if (!name || !start || !end) { toast('请填写课程名与起止时间'); return; }
    const k = fmt(sel), ov = schedOv(sel);
    SO[k] = { ...ov, added: [...ov.added, { id: uuid(), name, start, end, teacher: $('#scheduleTeacher').value.trim(), room: $('#scheduleRoom').value.trim() }] };
    S.s('scheduleOverrides', SO); renderSchedule(); $('#scheduleModal').classList.remove('show'); toast('已添加到当天课表', true);
  };
  $('#importScheduleBtn').onclick = () => $('#importScheduleFile').click();
  $('#importScheduleFile').onchange = async e => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!Array.isArray(raw.courses)) throw new Error();
      SC = { ...SC, profile: raw }; S.s('scheduleConfig', SC);
      renderSchedule(); renderCal(); if ($('#scheduleModal').classList.contains('show')) openSched();
      toast(`已导入 ${raw.courses.length} 门私密课表`, true);
    } catch { alert('课表 JSON 格式不正确。'); }
  };
  $('#exportScheduleBtn').onclick = () => downloadText(`苏伊温德课表_${fmt(now)}.json`, JSON.stringify({ format: 'suiwind-schedule-v2', ...scheduleProfile() }, null, 2), 'application/json');
  $('#clearBaseScheduleBtn').onclick = () => { if (!confirm('清空固定课表？')) return; delete SC.profile; S.s('scheduleConfig', SC); renderSchedule(); openSched(); };

  // 云同步与备份
  $('#cloudBtn').onclick = () => {
    const c = cloudCfg(); $('#sbUrl').value = c.url || ''; $('#sbKey').value = c.key || '';
    $('#cloudModal').classList.add('show'); updateCloudUI(); renderBackups();
  };
  $('#closeCloud').onclick = () => $('#cloudModal').classList.remove('show');
  $('#cloudModal').onclick = e => { if (e.target === $('#cloudModal')) $('#cloudModal').classList.remove('show'); };
  $('#saveCloudConfig').onclick = () => { S.s('cloudConfig', { url: $('#sbUrl').value.trim(), key: $('#sbKey').value.trim() }); initSupabase(); toast('配置已保存', true); };
  $('#signUpBtn').onclick = async () => {
    if (!sb) { alert('请先保存 Supabase 配置。'); return; }
    const { data, error } = await sb.auth.signUp({ email: $('#sbEmail').value.trim(), password: $('#sbPassword').value });
    if (error) alert(error.message); else { sbUser = data.user || null; updateCloudUI(); toast('注册成功，请查收邮箱或直接登录', true); }
  };
  $('#signInBtn').onclick = async () => {
    if (!sb) { alert('请先保存 Supabase 配置。'); return; }
    const { data, error } = await sb.auth.signInWithPassword({ email: $('#sbEmail').value.trim(), password: $('#sbPassword').value });
    if (error) alert(error.message); else { sbUser = data.user; setCloudStatus('on', '已连接'); updateCloudUI(); if (cloudDirty) scheduleCloudSync(); toast('登录成功', true); }
  };
  $('#signOutBtn').onclick = async () => { if (sb) await sb.auth.signOut(); sbUser = null; setCloudStatus('off', '未登录'); updateCloudUI(); };
  $('#uploadCloud').onclick = () => uploadCloud(false);
  $('#downloadCloud').onclick = downloadCloud;
  $('#exportBtn').onclick = () => { try { downloadText(`苏伊温德日历备份_${fmt(now)}.json`, JSON.stringify(snapshotData(), null, 2), 'application/json'); } catch (err) { alert('无法安全导出备份：'+err.message); } };
  $('#createBackupBtn').onclick = () => createBackup('手动快照');
  $('#importBtn').onclick = () => $('#importFile').click();
  $('#importFile').onchange = async e => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!confirm('导入将覆盖当前数据（系统会自动留存快照），继续吗？')) return;
      if (!createBackup('导入 JSON 前', true)) return; applySnapshot(data); markCloudDirty(); toast('备份已恢复', true);
    } catch (err) { alert('无法恢复该 JSON 备份：'+err.message); }
  };

  // 纪念日 & 提醒
  $('#annivBtn').onclick = () => { $('#moreMenuDropdown').classList.remove('open'); $('#aDate').value = fmt(sel); renderAnnivManage(); $('#modal').classList.add('show'); };
  $('#cancelA').onclick = () => $('#modal').classList.remove('show');
  $('#modal').onclick = e => { if (e.target === $('#modal')) $('#modal').classList.remove('show'); };
  $('#saveA').onclick = () => {
    const name = $('#aName').value.trim(), date = $('#aDate').value; if (!name || !date) return;
    A.push({ id: uuid(), name, date, repeat: $('#aRepeat').checked });
    S.s('anniversaries', A); $('#aName').value = ''; renderAnnivManage(); renderCal(); toast('纪念日已添加', true);
  };
  $('#notifyBtn').onclick = async () => {
    $('#moreMenuDropdown').classList.remove('open');
    if (!('Notification' in window)) { alert('当前浏览器不支持通知。'); return; }
    const p = await Notification.requestPermission(); updateNotifyUI();
    if (p === 'granted') toast('任务提醒已开启', true);
  };
}


/* ===== V3.4 AI 引擎（支持 Gemini & DeepSeek/OpenAI 兼容接口） ===== */
const DEFAULT_AI_PERSONA = '温暖克制、清醒真诚、带一点文学感，像懂我的老朋友。不说教、不灌鸡汤，回答简洁有洞察。';
const getAiCfg = () => rawGet('aiConfig', {
  provider: 'gemini',
  apiKey: '',
  endpoint: 'https://api.deepseek.com/v1/chat/completions',
  model: 'gemini-2.5-flash',
  persona: DEFAULT_AI_PERSONA
});
const saveAiCfg = cfg => rawSet('aiConfig', cfg);

async function fetchAI(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(url, {...options, signal:controller.signal});
    // Buffer the response before clearing the timeout so a stalled body is also bounded.
    const data = await response.json().catch(err => { if (controller.signal.aborted) throw err; return {}; });
    return {ok:response.ok,status:response.status,json:async()=>data};
  } catch (err) { if (controller.signal.aborted) throw new Error('AI 请求超时，请重试。'); throw err; }
  finally { clearTimeout(timer); }
}

async function callAI(systemPrompt, userPrompt) {
  const cfg = getAiCfg();
  if (!cfg.apiKey) throw new Error('尚未配置 API Key，请先点击「配置 AI」。');

  if (cfg.provider === 'gemini') {
    const model = (cfg.model || 'gemini-2.5-flash').trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cfg.apiKey.trim())}`;
    const res = await fetchAI(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.8 }
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || `Gemini 请求失败 (${res.status})`);
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    if (!text) throw new Error('Gemini 返回内容为空');
    return text.trim();
  } else {
    const url = (cfg.endpoint || 'https://api.deepseek.com/v1/chat/completions').trim();
    const model = (cfg.model || 'deepseek-chat').trim();
    const res = await fetchAI(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || `接口请求失败 (${res.status})`);
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text) throw new Error('模型返回内容为空');
    return text.trim();
  }
}

async function loadDailyQuote(force = false) {
  const el = $('#aiQuoteText'), setupBtn = $('#aiQuoteSetupBtn');
  if (!el) return;
  const cfg = getAiCfg();
  const k = todayKey();
  const cache = rawGet('aiDailyQuotes', {});

  if (setupBtn) setupBtn.textContent = cfg.apiKey ? 'AI 设置' : '配置 AI';

  if (!cfg.apiKey) {
    el.textContent = '配置你的 Gemini / DeepSeek API Key 后，每天打开日历都会为你写一句专属的话。';
    return;
  }
  if (!force && cache[k]) {
    el.textContent = cache[k];
    return;
  }

  el.textContent = '正在为你写今天的话…';
  try {
    const li = lunar(todayDate());
    const schedN = scheduleFor(todayDate()).length;
    const taskN = allTasksFor(todayDate()).filter(x => !x.done).length;
    const yestR = R[addDaysKey(k, -1)] || {};
    const yestHint = [yestR.q2, yestR.q3].filter(Boolean).join('；').slice(0, 120);
    const sys = `${cfg.persona || DEFAULT_AI_PERSONA} 请用中文写一句简短的每日问候或提醒（20到45字之间，不要加引号，不要分点）。`;
    const usr = `今天是 ${k}，周${wd(todayDate())}，农历${li.fullText}${li.term ? '，节气' + li.term : ''}。今天有 ${schedN} 节课、${taskN} 项待办。${yestHint ? '我昨天复盘提到：' + yestHint : ''}`;
    const text = (await callAI(sys, usr)).replace(/^["“]|["”]$/g, '');
    cache[k] = text;
    rawSet('aiDailyQuotes', cache);
    el.textContent = text;
  } catch (err) {
    el.textContent = cache[k] || `暂未获取到今日寄语（${err.message}）`;
  }
}

async function runAiReviewAnalysis(type, mKey) {
  const cfg = getAiCfg();
  if (!cfg.apiKey) {
    openAiModal();
    toast('请先填写 API Key');
    return;
  }
  const btn = $('#aiAnalyzeReviewBtn'), out = $('#aiReviewOutput');
  if (!btn || !out) return;
  const oldTxt = btn.textContent;
  btn.disabled = true;
  btn.textContent = '正在分析…';
  out.style.display = 'block';
  out.classList.add('loading');
  out.textContent = '正在阅读你的任务与每日三问，生成深度复盘建议…';
  try {
    const md = buildReviewMd(type).text;
    const sys = `${cfg.persona || DEFAULT_AI_PERSONA} 请根据用户的${type === 'week' ? '周' : '月'}复盘数据，分三小段给出分析：1. 肯定真实做得好的地方；2. 温和指出一个最关键的卡点；3. 给出 2 条下阶段立刻能执行的具体微调建议。控制在 280 字以内。`;
    const result = await callAI(sys, md);
    out.classList.remove('loading');
    out.textContent = result;
    const all = S.g('aiSummaries', {});
    all[mKey] = { text: result, updatedAt: isoNow() };
    S.s('aiSummaries', all);
    toast('AI 复盘分析已生成', true);
  } catch (err) {
    out.classList.remove('loading');
    out.textContent = `分析失败：${err.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = oldTxt;
  }
}

function syncAiProviderUI() {
  const prov = $('#aiProvider').value;
  $('#aiEndpointWrap').style.display = prov === 'openai' ? 'block' : 'none';
  const m = $('#aiModel');
  if (prov === 'gemini' && (!m.value || m.value === 'deepseek-chat')) m.value = 'gemini-2.5-flash';
  if (prov === 'openai' && (!m.value || m.value.startsWith('gemini'))) m.value = 'deepseek-chat';
}

function openAiModal() {
  const cfg = getAiCfg();
  $('#aiProvider').value = cfg.provider || 'gemini';
  $('#aiKey').value = cfg.apiKey || '';
  $('#aiEndpoint').value = cfg.endpoint || 'https://api.deepseek.com/v1/chat/completions';
  $('#aiModel').value = cfg.model || (cfg.provider === 'openai' ? 'deepseek-chat' : 'gemini-2.5-flash');
  $('#aiPersona').value = cfg.persona || DEFAULT_AI_PERSONA;
  $('#aiTestStatus').textContent = '';
  syncAiProviderUI();
  $('#aiModal').classList.add('show');
}

function bindAiEvents() {
  $('#aiConfigBtn').onclick = () => { $('#moreMenuDropdown').classList.remove('open'); openAiModal(); };
  $('#aiQuoteSetupBtn').onclick = openAiModal;
  $('#closeAiModal').onclick = () => $('#aiModal').classList.remove('show');
  $('#aiModal').onclick = e => { if (e.target === $('#aiModal')) $('#aiModal').classList.remove('show'); };
  $('#aiProvider').onchange = syncAiProviderUI;
  $('#aiQuoteRefresh').onclick = () => loadDailyQuote(true);

  const readForm = () => ({
    provider: $('#aiProvider').value,
    apiKey: $('#aiKey').value.trim(),
    endpoint: $('#aiEndpoint').value.trim() || 'https://api.deepseek.com/v1/chat/completions',
    model: $('#aiModel').value.trim() || ($('#aiProvider').value === 'gemini' ? 'gemini-2.5-flash' : 'deepseek-chat'),
    persona: $('#aiPersona').value.trim() || DEFAULT_AI_PERSONA
  });

  $('#aiSaveBtn').onclick = () => {
    saveAiCfg(readForm());
    $('#aiModal').classList.remove('show');
    toast('AI 配置已保存在本机', true);
    loadDailyQuote(true);
  };
  $('#aiClearBtn').onclick = () => {
    if (!confirm('清除本机保存的 AI API Key？')) return;
    localStorage.removeItem('zx_aiConfig');
    $('#aiKey').value = '';
    $('#aiTestStatus').textContent = '已清除。';
    loadDailyQuote(false);
  };
  $('#aiTestBtn').onclick = async () => {
    saveAiCfg(readForm());
    $('#aiTestStatus').textContent = '正在测试连接…';
    try {
      const reply = await callAI('你是一个测试助手。', '请用不超过10个字打个招呼。');
      $('#aiTestStatus').textContent = `连接成功：${reply}`;
    } catch (err) {
      $('#aiTestStatus').textContent = `连接失败：${err.message}`;
    }
  };
}

/* 供独立工作台模块调用；不公开 Key、云凭据或通用存储写权限。 */
window.SuiwindWorkbench = Object.freeze({
  callAI, openAiModal,
  getSelectedDate: () => fmt(sel),
  getFitnessState: readFitnessState,
  setFitnessState: state => {
    window.SuiwindFitnessCore.validate(state);
    const key = 'zx_fitnessState', previous = localStorage.getItem(key);
    try { S.s('fitnessState', state); }
    catch (err) {
      // S.s can fail while writing sync metadata after the business data write.
      if (localStorage.getItem(key) !== previous) {
        try { if (previous === null) localStorage.removeItem(key); else localStorage.setItem(key,previous); }
        catch (rollbackError) { throw new Error('健身保存异常，回滚失败，请先导出备份：'+rollbackError.message); }
      }
      throw err;
    }
    window.dispatchEvent(new Event('suiwind:fitness-change'));
  },
  getHistory: () => rawGet('liurenHistory', []),
  setHistory: records => { if (!Array.isArray(records)) throw new TypeError('history'); S.s('liurenHistory', records); window.dispatchEvent(new Event('suiwind:history-change')); },
});

/* ===== 启动 ===== */
applyTheme(localStorage.getItem('zx_theme') === 'dark' ? 'dark' : 'light');
bindEvents();
bindAiEvents();
syncTimerLoop();
renderNextTerm();
renderStreak();
renderCal();
renderSide();
renderLearningSummary();
updateNotifyUI();
initSupabase();
loadDailyQuote(false);
setupSW();
})();
