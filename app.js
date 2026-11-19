/* 苏伊温德日历 V2.0.0 · 扁平重构主程序
 * 100% 兼容 V1.x 本地存储键名 (zx_*) 与 Supabase calendar_state 结构
 */
(() => {
'use strict';

const D = window.SUIWIND_DATA;
if (!D) { console.error('SUIWIND_DATA 未加载'); return; }

const {
  APP_VERSION, APP_CACHE_TAG, LEARNING_TIME_ZONE,
  LEARNING_CONFIG, DEFAULT_LEARNING_COUNTDOWNS, V150_MILESTONES,
  REVIEW_OFFSETS, STUDY_SUBJECTS, ROADMAP_THEMES, V158_TIME_CLASSES,
  ENGLISH_SKILL_PLAN_ORDER, ENGLISH_SKILL_DAILY_BLOCKS,
  FINANCE_PLAN, FINANCE_EXEC_ORDER, FINANCE_PHASES,
  MATH_PLAN, ENGLISH_SKILLS, ENGLISH_LESSON_TOTAL, ENGLISH_VOCAB_LESSONS,
  SOLAR_TERM_NAMES, SOLAR_TERM_MINUTES, LUNAR_FESTIVALS, SOLAR_FESTIVALS,
  HOLIDAY_RANGES, HOLIDAY_WORKDAYS, DEFAULT_SCHEDULE_PROFILE
} = D;

const V158_CORE_CLASSES = new Set(Object.keys(V158_TIME_CLASSES).filter(k => V158_TIME_CLASSES[k].count));
const V160_BACKUP_KEY = 'zx_v160BackupHistory';

const $ = s => document.querySelector(s);
const rawGet = (k, f) => { try { return JSON.parse(localStorage.getItem('zx_' + k)) ?? f; } catch { return f; } };
const originalSet = (k, v) => localStorage.setItem('zx_' + k, JSON.stringify(v));

let syncSuppressed = false;
let v170HistoryGuard = false;
let cloudDirty = false;
let syncTimer = null;

const S = {
  g: rawGet,
  s(k, v) {
    if (!v170HistoryGuard && !syncSuppressed && !['sentReminders', 'cloudConfig', 'syncMeta'].includes(k)) {
      const last = Number(localStorage.getItem('zx_v170HistoryAt') || 0);
      if (Date.now() - last > 30 * 60 * 1000) {
        v170HistoryGuard = true;
        try { v160CreateSafetyBackup('滚动历史', true); localStorage.setItem('zx_v170HistoryAt', String(Date.now())); } catch {}
        finally { v170HistoryGuard = false; }
      }
    }
    originalSet(k, v);
    if (syncSuppressed) return;
    if (!['sentReminders', 'cloudConfig', 'syncMeta'].includes(k)) {
      const stamp = new Date().toISOString();
      const m = syncMeta();
      originalSet('syncMeta', { ...m, localUpdatedAt: stamp });
      markCloudDirty(); renderSyncMeta(); scheduleCloudSync();
    }
  }
};

/* ===== 基础工具 ===== */
const now = new Date();
const pad = n => String(n).padStart(2, '0');
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [a, b, c] = String(s).split('-').map(Number); return new Date(a, b - 1, c, 12); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
const uuid = () => crypto.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2));
const same = (a, b) => fmt(a) === fmt(b);
const wd = d => ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const v150DateOk = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const v170Stamp = () => new Date().toISOString();

function dayDiff(a, b) {
  return Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
}
function addDaysKey(k, n) { const d = parse(k); d.setDate(d.getDate() + n); return fmt(d); }
function dateHuman(k) { if (!k) return '—'; const d = parse(k); return `${d.getMonth() + 1}月${d.getDate()}日`; }
function startOfWeek(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
function endOfWeek(d) { const x = startOfWeek(d); x.setDate(x.getDate() + 6); return x; }
function eachDate(a, b) { const out = [], d = new Date(a); for (; d <= b; d.setDate(d.getDate() + 1)) out.push(new Date(d)); return out; }
function weekKey(d) {
  const x = new Date(d), day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day + 3);
  const f = new Date(x.getFullYear(), 0, 4, 12);
  const w = 1 + Math.round(((x - f) / 86400000 - 3 + (f.getDay() + 6) % 7) / 7);
  return `${x.getFullYear()}-W${pad(w)}`;
}

const LEARNING_TZ_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: LEARNING_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});
function beijingParts(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const parts = {};
  LEARNING_TZ_FORMATTER.formatToParts(d).forEach(x => { if (x.type !== 'literal') parts[x.type] = x.value; });
  return parts;
}
function beijingDateKey(value = new Date()) { const x = beijingParts(value); return x ? `${x.year}-${x.month}-${x.day}` : ''; }
function beijingDateTimeLabel(value) { const x = beijingParts(value); return x ? `${x.year}-${x.month}-${x.day} ${x.hour}:${x.minute}` : '—'; }
function learningTodayDate() { const x = beijingParts(); return x ? new Date(Number(x.year), Number(x.month) - 1, Number(x.day), 12) : new Date(); }
function learningTodayKey() { return beijingDateKey(); }
function beijingAnchorIso(dateKey, time = '12:00') {
  const [y, m, d] = String(dateKey || '').split('-').map(Number), [hh, mm] = String(time || '12:00').split(':').map(Number);
  if (!y || !m || !d) return new Date().toISOString();
  return new Date(Date.UTC(y, m - 1, d, (hh || 0) - 8, mm || 0, 0)).toISOString();
}
function durationSeconds(s) { if (!s) return 0; const a = String(s).split(':').map(Number); return a.length === 2 ? a[0] * 60 + a[1] : 0; }
function durationHuman(sec) { if (!sec) return '—'; const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)}小时${m % 60 ? `${m % 60}分` : ''}` : `约${m}分钟`; }
function secHuman(sec) { sec = Math.max(0, Math.round(sec || 0)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60); return h ? `${h}小时${m ? `${m}分` : ''}` : `${m}分钟`; }
function timeClock(sec) { sec = Math.max(0, Math.floor(sec || 0)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return h ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`; }

/* ===== 节假日 / 节气 / 农历 ===== */
const H = {};
HOLIDAY_RANGES.forEach(([a, b, type, name]) => { const d = parse(a), e = parse(b); for (; d <= e; d.setDate(d.getDate() + 1)) H[fmt(d)] = { type, name }; });
HOLIDAY_WORKDAYS.forEach(x => { H[x] = { type: 'work', name: '调休上班' }; });

function solarTermDate(year, index) {
  const raw = new Date(Date.UTC(1900, 0, 6, 2, 5) + 31556925974.7 * (year - 1900) + SOLAR_TERM_MINUTES[index] * 60000);
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
  n = Number(n); const nums = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (n <= 0 || n > 30) return String(n || '');
  if (n <= 10) return n === 10 ? '初十' : `初${nums[n]}`;
  if (n < 20) return `十${nums[n - 10]}`;
  if (n === 20) return '二十';
  if (n < 30) return `廿${nums[n - 20]}`;
  return '三十';
}
let chineseCalendarFormatter = null;
function lunar(d) {
  try {
    if (!chineseCalendarFormatter) chineseCalendarFormatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { year: 'numeric', month: 'long', day: 'numeric' });
    const parts = chineseCalendarFormatter.formatToParts(d);
    const month = (parts.find(x => x.type === 'month')?.value || '').replace(/月月$/, '月');
    const dayNum = Number(parts.find(x => x.type === 'day')?.value || 0);
    const di = lunarDayText(dayNum), monthText = month.endsWith('月') ? month : `${month}月`;
    const term = solarTermForDate(d), fest = [];
    const lunarFest = LUNAR_FESTIVALS[`${month}-${dayNum}`]; if (lunarFest) fest.push(lunarFest);
    const solarFest = SOLAR_FESTIVALS[`${pad(d.getMonth() + 1)}-${pad(d.getDate())}`]; if (solarFest && !fest.includes(solarFest)) fest.push(solarFest);
    return { text: dayNum === 1 ? monthText : di, fullText: `${monthText}${di}`, fest, term };
  } catch { return { text: '农历', fullText: '—', fest: [], term: solarTermForDate(d) }; }
}

/* ===== 统一状态规范化 ===== */
function v150Countdown(c) {
  const date = String(c?.date || ''); let endDate = String(c?.endDate || '');
  if (!v150DateOk(date)) return null;
  if (!v150DateOk(endDate) || endDate < date) endDate = '';
  return { id: String(c.id || uuid()), title: String(c.title || '').trim(), date, endDate, kind: String(c.kind || '考试'), note: String(c.note || ''), createdAt: String(c.createdAt || '') };
}
function v158PolicyDefault() {
  return { version: 1, weeklyRestDay: 6, weekdayTargetMin: 330, sundayTargetMin: 270, flex: { balance: 0, cap: 6, monthlyCredit: 2, lastCreditMonth: '', used: {} }, monthlyMetrics: {}, settlements: {}, restInbox: [], migrations: {} };
}
function v158NormalizePolicy(raw) {
  const d = v158PolicyDefault(), x = raw && typeof raw === 'object' ? raw : {};
  const f = x.flex && typeof x.flex === 'object' ? x.flex : {};
  d.flex.balance = Math.max(0, Math.min(6, Number(f.balance) || 0));
  d.flex.lastCreditMonth = /^\d{4}-\d{2}$/.test(String(f.lastCreditMonth || '')) ? String(f.lastCreditMonth) : '';
  d.flex.used = f.used && typeof f.used === 'object' ? f.used : {};
  d.monthlyMetrics = x.monthlyMetrics && typeof x.monthlyMetrics === 'object' ? x.monthlyMetrics : {};
  d.settlements = x.settlements && typeof x.settlements === 'object' ? x.settlements : {};
  d.restInbox = Array.isArray(x.restInbox) ? x.restInbox : [];
  d.migrations = x.migrations && typeof x.migrations === 'object' ? x.migrations : {};
  return d;
}
function v170DefaultState() {
  return { version: 1, projects: [], life: { checkins: {} }, settings: { adaptive: true }, tombstones: { projects: [], milestones: [], logs: [], retrieval: [], errors: [] }, migrations: {} };
}
function v170NormalizeProject(p) {
  p = p && typeof p === 'object' ? p : {};
  const fallbackNow = new Date().toISOString();
  return {
    id: String(p.id || uuid()), name: String(p.name || '未命名项目'), kind: String(p.kind || '成长项目'),
    deadline: v150DateOk(p.deadline) ? p.deadline : '', status: ['active', 'paused', 'done'].includes(p.status) ? p.status : 'active',
    note: String(p.note || ''), createdAt: String(p.createdAt || fallbackNow), updatedAt: String(p.updatedAt || p.createdAt || fallbackNow),
    milestones: Array.isArray(p.milestones) ? p.milestones.map(x => ({ id: String(x.id || uuid()), title: String(x.title || '里程碑'), dueDate: v150DateOk(x.dueDate) ? x.dueDate : '', done: !!x.done, doneAt: String(x.doneAt || ''), updatedAt: String(x.updatedAt || x.doneAt || fallbackNow) })) : [],
    logs: Array.isArray(p.logs) ? p.logs.map(x => ({ id: String(x.id || uuid()), date: v150DateOk(x.date) ? x.date : learningTodayKey(), minutes: Math.max(0, Math.round(Number(x.minutes) || 0)), note: String(x.note || ''), createdAt: String(x.createdAt || fallbackNow), updatedAt: String(x.updatedAt || x.createdAt || fallbackNow) })) : []
  };
}
function v170NormalizeState(raw) {
  const d = v170DefaultState(), x = raw && typeof raw === 'object' ? raw : {};
  d.projects = (Array.isArray(x.projects) ? x.projects : []).map(v170NormalizeProject);
  d.life = { checkins: (x.life?.checkins && typeof x.life.checkins === 'object') ? x.life.checkins : {} };
  d.settings = { adaptive: x.settings?.adaptive !== false };
  const t = x.tombstones || {};
  d.tombstones = { projects: Array.isArray(t.projects) ? t.projects : [], milestones: Array.isArray(t.milestones) ? t.milestones : [], logs: Array.isArray(t.logs) ? t.logs : [], retrieval: Array.isArray(t.retrieval) ? t.retrieval : [], errors: Array.isArray(t.errors) ? t.errors : [] };
  d.migrations = x.migrations && typeof x.migrations === 'object' ? x.migrations : {};
  return d;
}
function v158MonthKeyFromDateKey(k) { return String(k || '').slice(0, 7); }
function v158NextMonthKey(m) { const [y, mo] = String(m).split('-').map(Number); const d = new Date(y, mo, 1, 12); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
function v158DefaultClassForSubject(subject) { return ['英语', '财经', '高数'].includes(subject) ? 'CORE-DEEP' : 'OTHER-ACADEMIC'; }

function normalizeLearningState(raw) {
  const x = (raw && typeof raw === 'object') ? raw : {}, en = x.english || {};
  const d = {
    version: Math.max(12, Number(x.version) || 0),
    busyDates: (x.busyDates && typeof x.busyDates === 'object') ? x.busyDates : {},
    freeLogs: Array.isArray(x.freeLogs) ? x.freeLogs : [],
    countdowns: (Array.isArray(x.countdowns) ? x.countdowns : DEFAULT_LEARNING_COUNTDOWNS).map(v150Countdown).filter(Boolean),
    english: {
      round1: (en.round1 && typeof en.round1 === 'object') ? en.round1 : {},
      round2: (en.round2 && typeof en.round2 === 'object') ? en.round2 : {},
      skills: (en.skills && typeof en.skills === 'object') ? en.skills : {},
      reviews: (en.reviews && typeof en.reviews === 'object') ? en.reviews : {}
    },
    finance: { completions: (x.finance?.completions && typeof x.finance.completions === 'object') ? x.finance.completions : {} },
    math: { completions: (x.math?.completions && typeof x.math.completions === 'object') ? x.math.completions : {} },
    energy: (x.energy && typeof x.energy === 'object') ? x.energy : {},
    studyTimer: {
      active: (x.studyTimer?.active && typeof x.studyTimer.active === 'object') ? x.studyTimer.active : null,
      sessions: Array.isArray(x.studyTimer?.sessions) ? x.studyTimer.sessions : [],
      deletedSessionIds: Array.isArray(x.studyTimer?.deletedSessionIds) ? x.studyTimer.deletedSessionIds : []
    },
    spacedReviews: {
      done: (x.spacedReviews?.done && typeof x.spacedReviews.done === 'object') ? x.spacedReviews.done : {},
      settings: {
        finance: x.spacedReviews?.settings?.finance !== false,
        math: x.spacedReviews?.settings?.math !== false,
        skills: x.spacedReviews?.settings?.skills !== false,
        dailyBudgetMin: Math.max(5, Math.min(45, Number(x.spacedReviews?.settings?.dailyBudgetMin) || 15))
      }
    },
    uiFeedback: (x.uiFeedback && typeof x.uiFeedback === 'object') ? { sound: !!x.uiFeedback.sound, haptic: x.uiFeedback.haptic !== false } : { sound: false, haptic: true },
    sleep: { records: (x.sleep?.records && typeof x.sleep.records === 'object') ? x.sleep.records : {} },
    quality: {
      retrievalTests: Array.isArray(x.quality?.retrievalTests) ? x.quality.retrievalTests : [],
      errorChecks: Array.isArray(x.quality?.errorChecks) ? x.quality.errorChecks : []
    },
    burndown: {
      targets: {
        english1: typeof x.burndown?.targets?.english1 === 'string' ? x.burndown.targets.english1 : '2026-11-18',
        english2: typeof x.burndown?.targets?.english2 === 'string' ? x.burndown.targets.english2 : '',
        skills: typeof x.burndown?.targets?.skills === 'string' ? x.burndown.targets.skills : '',
        finance: typeof x.burndown?.targets?.finance === 'string' ? x.burndown.targets.finance : '',
        math: typeof x.burndown?.targets?.math === 'string' ? x.burndown.targets.math : ''
      },
      selected: ['english1', 'english2', 'skills', 'finance', 'math'].includes(x.burndown?.selected) ? x.burndown.selected : 'english1'
    },
    lifePolicy: v158NormalizePolicy(x.lifePolicy),
    v170: v170NormalizeState(x.v170),
    migrations: (x.migrations && typeof x.migrations === 'object') ? x.migrations : {}
  };

  if (!d.migrations.editableMilestonesV150) {
    for (const c of V150_MILESTONES) {
      if (!d.countdowns.some(item => item.id === c.id || (item.title === c.title && item.date === c.date))) d.countdowns.push({ ...c, createdAt: new Date().toISOString() });
    }
    const seen = new Set();
    d.countdowns = d.countdowns.filter(item => { const key = `${item.title}|${item.date}`; if (seen.has(key)) return false; seen.add(key); return true; });
    d.migrations.editableMilestonesV150 = true;
  }
  if (!d.lifePolicy.migrations.v158SessionClasses) {
    for (const s of d.studyTimer.sessions) if (!V158_TIME_CLASSES[s.timeClass]) { s.timeClass = v158DefaultClassForSubject(s.subject); s.classificationSource = 'V1.5.8旧记录兼容'; }
    if (d.studyTimer.active && !V158_TIME_CLASSES[d.studyTimer.active.timeClass]) d.studyTimer.active.timeClass = v158DefaultClassForSubject(d.studyTimer.active.subject);
    d.lifePolicy.migrations.v158SessionClasses = true;
  }
  if (!d.v170.migrations.seedProjectsV170) {
    const stamp = new Date().toISOString();
    for (const [name, kind] of [['职业规划大赛', '竞赛项目'], ['安全知识竞赛', '竞赛项目'], ['审计数据分析作品集', '长期项目']]) {
      if (!d.v170.projects.some(p => p.name === name)) d.v170.projects.push(v170NormalizeProject({ id: uuid(), name, kind, status: 'active', createdAt: stamp, updatedAt: stamp }));
    }
    d.v170.migrations.seedProjectsV170 = true;
  }
  const f = d.lifePolicy.flex, currentMonth = v158MonthKeyFromDateKey(learningTodayKey());
  if (!f.lastCreditMonth) { f.lastCreditMonth = currentMonth; f.balance = Math.min(f.cap, f.balance + f.monthlyCredit); }
  else {
    let cursor = f.lastCreditMonth, guard = 0;
    while (cursor < currentMonth && guard < 48) { cursor = v158NextMonthKey(cursor); if (f.balance < f.cap) f.balance = Math.min(f.cap, f.balance + f.monthlyCredit); f.lastCreditMonth = cursor; guard++; }
  }
  return d;
}

/* ===== 主数据状态 ===== */
let T = rawGet('tasks', {}), WG = rawGet('weekGoals', {}), MG = rawGet('monthGoals', {}), R = rawGet('reflections', {});
let A = rawGet('anniversaries', []), RT = rawGet('recurringTasks', []), DG = rawGet('deadlineGoals', []);
let SO = rawGet('scheduleOverrides', {}), SC = rawGet('scheduleConfig', { disabledCourseIds: [] });
if (!SC || typeof SC !== 'object') SC = { disabledCourseIds: [] };
if (!Array.isArray(SC.disabledCourseIds)) SC.disabledCourseIds = [];

let LS = normalizeLearningState(rawGet('learningState', {}));
originalSet('learningState', LS);

let view = new Date(now.getFullYear(), now.getMonth(), 1), sel = new Date(now.getFullYear(), now.getMonth(), now.getDate());
let activeLearningTab = 'today', activeSideTab = 'action', goalOverviewsForceOpen = false;
let editingCountdownId = '', studyTimerNotice = '', studyTimerInterval = null, pendingRecurringAction = null;

/* ===== 隐私课表系统 ===== */
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
function activeCourseList() { return scheduleProfile().courses || []; }
function schoolWeekNumber(d) {
  const term = scheduleProfile().term, day = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  const start = parse(term.start), end = parse(term.end);
  if (day < start || day > end) return null;
  const n = Math.floor((startOfWeek(day) - start) / 604800000) + 1;
  return n >= 1 && n <= Number(term.weeks || 25) ? n : null;
}
function schoolWeekText(d) { const n = schoolWeekNumber(d); return n ? `校历第${n}周` : ''; }
function dateBetween(d, a, b) { const k = fmt(d); return k >= a && k <= b; }
function isSchoolBreak(d) { return (scheduleProfile().breaks || []).some(([a, b]) => dateBetween(d, a, b)); }
function isHolidayLike(d) { return isSchoolBreak(d) || H[fmt(d)]?.type === 'holiday'; }
function isHolidayEve(d) { if (isHolidayLike(d)) return false; const next = new Date(d); next.setDate(next.getDate() + 1); return isHolidayLike(next); }
function inSchoolActivityPeriod(d) { const ap = scheduleProfile().activityPeriod; return ap?.start && ap?.end && dateBetween(d, ap.start, ap.end) && !isHolidayLike(d); }
function timeMinutes(v) { const [h, m] = String(v || '0:0').split(':').map(Number); return h * 60 + m; }
function schedulesOverlap(a, b) { return Math.max(timeMinutes(a.start), timeMinutes(b.start)) < Math.min(timeMinutes(a.end), timeMinutes(b.end)); }
function scheduleOverrideFor(d) { const raw = SO[fmt(d)] || {}; return { added: Array.isArray(raw.added) ? raw.added : [], cancelled: Array.isArray(raw.cancelled) ? raw.cancelled : [] }; }
function disabledCourseIds() { return Array.isArray(SC?.disabledCourseIds) ? SC.disabledCourseIds : []; }
function saveScheduleState() { S.s('scheduleOverrides', SO); S.s('scheduleConfig', SC); }
function baseCoursesFor(d) {
  const week = schoolWeekNumber(d), day = d.getDay(), ov = scheduleOverrideFor(d), disabled = disabledCourseIds();
  if (!week) return [];
  return activeCourseList().filter(c => Number(c.day) === day && Array.isArray(c.weeks) && c.weeks.includes(week) && !disabled.includes(c.id) && !ov.cancelled.includes(c.id))
    .map(c => ({ ...c, type: 'course', source: 'base', baseId: c.id, id: `base:${c.id}` }));
}
function addedCoursesFor(d) { return scheduleOverrideFor(d).added.map(c => ({ ...c, type: 'course', source: 'added', id: c.id || uuid() })); }
function eveningClassExists(courses) {
  const studyWindow = { start: '19:00', end: '20:30' };
  return courses.some(c => schedulesOverlap(c, studyWindow) || (timeMinutes(c.start) >= 18 * 60 && timeMinutes(c.start) < 21 * 60));
}
function scheduleFor(d) {
  const day = d.getDay(), rules = scheduleProfile().autoRules || {}, events = [...baseCoursesFor(d), ...addedCoursesFor(d)], courses = [...events];
  const ms = rules.morningStudy;
  if (ms?.enabled && courses.some(e => e.start === (ms.triggerStart || '08:20'))) events.push({ id: 'auto-morning-study', start: ms.start || '07:40', end: ms.end || '08:10', name: ms.name || '早自习', teacher: '', room: ms.room || '', type: 'study', source: 'auto', note: ms.note || '' });
  const es = rules.eveningStudy;
  if (es?.enabled && inSchoolActivityPeriod(d) && (es.days || [1, 2, 3, 4]).includes(day) && !eveningClassExists(courses) && !isHolidayEve(d)) events.push({ id: 'auto-evening-study', start: es.start || '19:00', end: es.end || '20:30', name: es.name || '晚自习', teacher: '', room: es.room || '', type: 'study', source: 'auto' });
  const sc = rules.sundayCommentary;
  if (sc?.enabled && inSchoolActivityPeriod(d) && day === (sc.day ?? 0)) events.push({ id: 'auto-commentary', start: sc.start || '19:30', end: sc.end || '19:45', name: sc.name || '晚点评', teacher: '', room: sc.room || '', type: 'commentary', source: 'auto', note: sc.note || '' });
  events.sort((a, b) => timeMinutes(a.start) - timeMinutes(b.start));
  return events.map((e, i) => ({ ...e, conflict: events.some((x, j) => j !== i && schedulesOverlap(e, x)) }));
}
function scheduleRuleText(d) {
  const es = scheduleProfile().autoRules?.eveningStudy;
  if (!es?.enabled || !inSchoolActivityPeriod(d) || !(es.days || [1, 2, 3, 4]).includes(d.getDay())) return '';
  const courses = [...baseCoursesFor(d), ...addedCoursesFor(d)];
  if (eveningClassExists(courses)) return '今晚有晚间课程，已自动取消晚自习。';
  if (isHolidayEve(d)) return '明日进入假期，今晚不安排晚自习。';
  return '';
}
function scheduleTypeLabel(e) { return e.type === 'study' ? '自习' : e.type === 'commentary' ? '点评' : '课程'; }
function removeCourseFromDate(e) {
  const k = fmt(sel), ov = scheduleOverrideFor(sel);
  if (e.source === 'base') {
    if (!confirm(`仅取消 ${k} 的“${e.name}”？其他周次的固定课仍会保留。`)) return;
    SO[k] = { ...ov, cancelled: [...new Set([...ov.cancelled, e.baseId])] };
  } else if (e.source === 'added') {
    if (!confirm(`删除 ${k} 临时添加的“${e.name}”？`)) return;
    SO[k] = { ...ov, added: ov.added.filter(x => x.id !== e.id) };
  } else return;
  saveScheduleState(); renderSchedule(); renderCal();
}
function renderSchedule() {
  const box = $('#dailySchedule'), stat = $('#scheduleStat'), rule = $('#scheduleRuleNote'); if (!box) return;
  const events = scheduleFor(sel), week = schoolWeekNumber(sel), hasBase = activeCourseList().length > 0;
  box.innerHTML = '';
  stat.textContent = events.length ? `${events.length} 项${week ? ` · 第${week}周` : ''}` : (week ? `第${week}周` : '');
  if (rule) rule.textContent = scheduleRuleText(sel);
  if (!events.length) {
    if (!hasBase) {
      box.innerHTML = `<div class="schedule-empty-box">为保护隐私，V2.0 公开源码不再硬编码真实课表与教室。<br>点击下方导入随包附带的 <b>我的私密课表_站内导入用.json</b>，仅存本机与私有云端。<br><button class="btn sm primary" id="quickImportScheduleBtn" type="button">导入私密课表</button></div>`;
      const btn = $('#quickImportScheduleBtn'); if (btn) btn.onclick = () => $('#importScheduleFile').click();
      return;
    }
    const msg = week ? (isHolidayLike(sel) ? '今天属于校历假期，没有固定课表安排。' : '今天没有固定课程、自习或晚点评。') : '当前日期不在本学期课表范围内。';
    box.innerHTML = `<div class="empty">${msg}</div>`; return;
  }
  events.forEach(e => {
    const row = document.createElement('div'); row.className = `schedule-item ${e.type}${e.conflict ? ' conflict' : ''}`;
    const details = [e.teacher ? `老师：${e.teacher}` : '', e.room ? `地点：${e.room}` : '', e.note || '', e.source === 'added' ? '临时添加' : '', e.conflict ? '⚠ 与本日另一项安排时间重叠' : ''].filter(Boolean);
    row.innerHTML = `<div class="schedule-time">${esc(e.start)}–${esc(e.end)}</div><div class="schedule-main"><div class="schedule-name">${esc(e.name)}<span class="schedule-badge ${e.type}">${scheduleTypeLabel(e)}</span></div><div class="schedule-meta ${e.conflict ? 'schedule-warning' : ''}">${details.map(esc).join(' · ')}</div></div>${e.type === 'course' ? '<button class="schedule-remove" type="button" title="删除 / 取消这一天的课程">×</button>' : '<span></span>'}`;
    const remove = row.querySelector('.schedule-remove'); if (remove) remove.onclick = () => removeCourseFromDate(e);
    box.appendChild(row);
  });
}
function presetLabel(c) { return `${['日', '一', '二', '三', '四', '五', '六'][Number(c.day) || 0]} · ${c.start}–${c.end} · ${c.name}${c.room ? ` · ${c.room}` : ''}`; }
function populateSchedulePreset() { const select = $('#schedulePreset'); if (!select) return; select.innerHTML = '<option value="">自定义 / 临时课程</option>' + activeCourseList().map(c => `<option value="${esc(c.id)}">周${esc(presetLabel(c))}</option>`).join(''); }
function fillScheduleForm(c) { $('#scheduleName').value = c?.name || ''; $('#scheduleStart').value = c?.start || ''; $('#scheduleEnd').value = c?.end || ''; $('#scheduleTeacher').value = c?.teacher || ''; $('#scheduleRoom').value = c?.room || ''; $('#scheduleNoteInput').value = c?.note || ''; }
function clearScheduleForm() { if ($('#schedulePreset')) $('#schedulePreset').value = ''; fillScheduleForm(null); }
function updateScheduleProfileStat() {
  const el = $('#scheduleProfileStat'); if (!el) return;
  const list = activeCourseList();
  el.textContent = list.length ? `已加载 ${list.length} 门固定课程（校历 ${scheduleProfile().term.start} ~ ${scheduleProfile().term.end}），数据仅保存在本地与你的私有云同步中。` : '尚未导入固定课表。可导入随包附带的「我的私密课表_站内导入用.json」，或直接在下方添加当天临时课程。';
}
async function importScheduleProfile(file) {
  try {
    const raw = JSON.parse(await file.text());
    if (!raw || !Array.isArray(raw.courses)) throw new Error();
    SC = { ...SC, profile: { term: raw.term?.start && raw.term?.end ? raw.term : DEFAULT_SCHEDULE_PROFILE.term, activityPeriod: raw.activityPeriod?.start && raw.activityPeriod?.end ? raw.activityPeriod : DEFAULT_SCHEDULE_PROFILE.activityPeriod, breaks: Array.isArray(raw.breaks) ? raw.breaks : DEFAULT_SCHEDULE_PROFILE.breaks, autoRules: raw.autoRules && typeof raw.autoRules === 'object' ? raw.autoRules : DEFAULT_SCHEDULE_PROFILE.autoRules, courses: raw.courses } };
    saveScheduleState(); updateScheduleProfileStat(); populateSchedulePreset(); renderFixedScheduleList(); renderSchedule(); renderCal();
    v156Toast(`✓ 已导入 ${raw.courses.length} 门私密课表`, true);
  } catch { alert('无法读取该课表文件，请选择「我的私密课表_站内导入用.json」。'); }
}
function exportScheduleProfile() {
  const blob = new Blob([JSON.stringify({ format: 'suiwind-schedule-v2', ...scheduleProfile() }, null, 2)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `苏伊温德课表备份_${fmt(now)}.json`; a.click(); URL.revokeObjectURL(a.href);
}
function clearBaseScheduleProfile() {
  if (!confirm('清空当前固定课表？此操作不会影响你的任务与学习记录。')) return;
  delete SC.profile; SC.disabledCourseIds = [];
  saveScheduleState(); updateScheduleProfileStat(); populateSchedulePreset(); renderFixedScheduleList(); renderSchedule(); renderCal();
  v156Toast('已清空固定课表');
}
function renderCancelledScheduleList() {
  const box = $('#cancelledScheduleList'); if (!box) return;
  const ov = scheduleOverrideFor(sel), items = activeCourseList().filter(c => ov.cancelled.includes(c.id));
  box.innerHTML = '';
  if (!items.length) { box.innerHTML = '<div class="empty">今天没有被取消的固定课程。</div>'; return; }
  items.forEach(c => {
    const row = document.createElement('div'); row.className = 'schedule-manage-item';
    row.innerHTML = `<div class="grow"><b>${esc(c.name)}</b><small>${esc(c.start)}–${esc(c.end)}${c.room ? ` · ${esc(c.room)}` : ''}</small></div><button class="btn sm" type="button">恢复</button>`;
    row.querySelector('button').onclick = () => { const k = fmt(sel), cur = scheduleOverrideFor(sel); SO[k] = { ...cur, cancelled: cur.cancelled.filter(id => id !== c.id) }; saveScheduleState(); renderSchedule(); renderCancelledScheduleList(); renderCal(); };
    box.appendChild(row);
  });
}
function renderFixedScheduleList() {
  const box = $('#fixedScheduleList'); if (!box) return;
  const disabled = disabledCourseIds(), list = activeCourseList(); box.innerHTML = '';
  if (!list.length) { box.innerHTML = '<div class="empty">暂无固定课程，可先点击上方「导入私密课表 JSON」。</div>'; return; }
  list.forEach(c => {
    const off = disabled.includes(c.id), row = document.createElement('div'); row.className = 'schedule-manage-item';
    row.innerHTML = `<div class="grow"><b>${esc(c.name)}</b><small>周${esc(presetLabel(c))}</small></div><button class="btn sm ${off ? '' : 'ghost'}" type="button">${off ? '重新启用' : '停用'}</button>`;
    row.querySelector('button').onclick = () => { const ids = new Set(disabledCourseIds()); off ? ids.delete(c.id) : ids.add(c.id); SC = { ...SC, disabledCourseIds: [...ids] }; saveScheduleState(); renderFixedScheduleList(); renderSchedule(); renderCal(); };
    box.appendChild(row);
  });
}
function openScheduleModal() {
  $('#scheduleModalDate').textContent = `${fmt(sel)} · 周${wd(sel)}${schoolWeekText(sel) ? ` · ${schoolWeekText(sel)}` : ''}`;
  updateScheduleProfileStat(); populateSchedulePreset(); clearScheduleForm(); renderCancelledScheduleList(); renderFixedScheduleList();
  $('#scheduleModal').classList.add('show');
}
function closeScheduleModal() { $('#scheduleModal').classList.remove('show'); }
function addScheduleCourseForSelectedDate() {
  const name = $('#scheduleName').value.trim(), start = $('#scheduleStart').value, end = $('#scheduleEnd').value;
  if (!name || !start || !end) { alert('请填写课程名称、开始时间和结束时间。'); return; }
  if (timeMinutes(end) <= timeMinutes(start)) { alert('结束时间需要晚于开始时间。'); return; }
  const k = fmt(sel), ov = scheduleOverrideFor(sel);
  SO[k] = { ...ov, added: [...ov.added, { id: uuid(), name, start, end, teacher: $('#scheduleTeacher').value.trim(), room: $('#scheduleRoom').value.trim(), note: $('#scheduleNoteInput').value.trim() }] };
  saveScheduleState(); clearScheduleForm(); renderSchedule(); renderCal(); v156Toast(`✓ 已添加到 ${k} 的课表`, true);
}

/* ===== 日历、任务、目标、期限事项、纪念日、复盘 ===== */
function annivOn(d) { return A.filter(a => { const q = parse(a.date); return a.repeat ? (q.getMonth() === d.getMonth() && q.getDate() === d.getDate()) : a.date === fmt(d); }); }
function selectedDistanceText(d) { const n = dayDiff(d, now); return n === 0 ? '今天' : n > 0 ? `${n} 天后` : `${Math.abs(n)} 天前`; }
function deadlineOn(d) { return DG.filter(g => g.dueDate === fmt(d)); }
function deadlinePriority(g) { return g?.priority || 'medium'; }
function completedDate(g) { if (!g?.completedAt) return null; const d = new Date(g.completedAt); return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); }
function deadlineState(g) {
  const due = parse(g.dueDate), today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (g.done) { const c = completedDate(g) || today, n = dayDiff(due, c); return n > 0 ? { text: `提前 ${n} 天完成`, cls: 'done' } : n === 0 ? { text: '截止当天完成', cls: 'done' } : { text: `逾期 ${Math.abs(n)} 天完成`, cls: 'done' }; }
  const n = dayDiff(due, today);
  return n > 7 ? { text: `${n} 天后截止`, cls: 'future' } : n > 0 ? { text: `还有 ${n} 天`, cls: 'soon' } : n === 0 ? { text: '今天截止', cls: 'today' } : { text: `已逾期 ${Math.abs(n)} 天`, cls: 'overdue' };
}
function deadlineSort(a, b) {
  if (!!a.done !== !!b.done) return a.done ? 1 : -1;
  const ad = parse(a.dueDate).getTime(), bd = parse(b.dueDate).getTime();
  if (ad !== bd) return ad - bd;
  return ({ high: 0, medium: 1, low: 2 }[deadlinePriority(a)] ?? 1) - ({ high: 0, medium: 1, low: 2 }[deadlinePriority(b)] ?? 1);
}
function occurs(rule, d) {
  const start = parse(rule.startDate), cur = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12), key = fmt(cur);
  if (cur < start || (rule.endDate && cur > parse(rule.endDate)) || (rule.skipDates || []).includes(key)) return false;
  if (rule.repeat === 'daily') return true;
  if (rule.repeat === 'weekly') return cur.getDay() === start.getDay();
  if (rule.repeat === 'monthly') return cur.getDate() === start.getDate();
  return key === rule.startDate;
}
function recurringFor(d) { return RT.filter(r => occurs(r, d)).map(r => ({ ...r, recurring: true, done: (r.doneDates || []).includes(fmt(d)), occurrenceDate: fmt(d) })); }
function allTasksFor(d) { return [...(T[fmt(d)] || []).map(x => ({ ...x, recurring: false })), ...recurringFor(d)]; }
function setTaskDone(task, d, done) {
  if (task.recurring) {
    const r = RT.find(x => x.id === task.id); if (!r) return;
    r.doneDates = r.doneDates || []; const k = fmt(d);
    if (done && !r.doneDates.includes(k)) r.doneDates.push(k);
    if (!done) r.doneDates = r.doneDates.filter(x => x !== k);
    S.s('recurringTasks', RT);
  } else { const r = (T[fmt(d)] || []).find(x => x.id === task.id); if (r) r.done = done; S.s('tasks', T); }
}
function closeRecurringAction() { pendingRecurringAction = null; $('#repeatActionModal').classList.remove('show'); }
function openRecurringAction(task, d) { pendingRecurringAction = { task, date: new Date(d) }; $('#repeatActionDesc').textContent = `${task.text} · ${fmt(d)}`; $('#repeatActionModal').classList.add('show'); }
function finishRecurringAction(kind) {
  if (!pendingRecurringAction) return;
  const { task, date } = pendingRecurringAction, r = RT.find(x => x.id === task.id), key = fmt(date);
  if (!r) { closeRecurringAction(); return; }
  if (kind === 'skip') { r.skipDates = r.skipDates || []; if (!r.skipDates.includes(key)) r.skipDates.push(key); }
  else if (kind === 'end') { const prev = new Date(date); prev.setDate(prev.getDate() - 1); if (prev < parse(r.startDate)) RT = RT.filter(x => x.id !== r.id); else r.endDate = fmt(prev); }
  else if (kind === 'all') RT = RT.filter(x => x.id !== r.id);
  S.s('recurringTasks', RT); closeRecurringAction(); renderCal(); renderTasks();
}
function removeTask(task, d) {
  if (task.recurring) openRecurringAction(task, d);
  else { T[fmt(d)] = (T[fmt(d)] || []).filter(x => x.id !== task.id); S.s('tasks', T); renderCal(); renderTasks(); }
}
const pLabel = p => p === 'high' ? '高' : p === 'low' ? '低' : '中';
const rLabel = r => r === 'daily' ? '每天' : r === 'weekly' ? '每周' : r === 'monthly' ? '每月' : '';

function syncYearSelect() {
  const el = $('#yearSelect'); if (!el) return;
  const y = view.getFullYear(), start = Math.min(now.getFullYear() - 5, y - 1), end = Math.max(now.getFullYear() + 10, y + 1);
  el.innerHTML = '';
  for (let yr = start; yr <= end; yr++) { const op = document.createElement('option'); op.value = String(yr); op.textContent = `${yr}年`; if (yr === y) op.selected = true; el.appendChild(op); }
}
function renderCal() {
  syncYearSelect();
  $('#monthTitle').textContent = `${view.getMonth() + 1}月`;
  const g = $('#calendar'); g.innerHTML = '';
  const y = view.getFullYear(), m = view.getMonth(), f = new Date(y, m, 1, 12), off = (f.getDay() + 6) % 7, start = new Date(y, m, 1 - off, 12);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const k = fmt(d), li = lunar(d), h = H[k], an = annivOn(d), ddl = deadlineOn(d), arr = allTasksFor(d), done = arr.filter(x => x.done).length;
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'day' + (d.getMonth() !== m ? ' other' : '') + (same(d, now) ? ' today' : '') + (same(d, sel) ? ' selected' : '');
    const dots = arr.filter(x => !x.done).slice(0, 4).map(x => `<i class="pd ${x.priority || 'medium'}"></i>`).join('');
    const schoolWeek = (d.getDay() === 1) ? schoolWeekNumber(d) : null;
    b.innerHTML = `<div class="dtop"><span class="date-left"><span class="num">${d.getDate()}</span>${same(d, now) ? '<span class="today-chip">今天</span>' : ''}</span><span class="lunar">${esc(li.text)}</span></div>
      <div class="tags">${schoolWeek ? `<span class="school-week-badge">第${schoolWeek}周</span>` : ''}${learningCalendarTags(d)}${ddl.length ? `<span class="tag deadline ${ddl.every(x => x.done) ? 'done' : ''}">${ddl.every(x => x.done) ? '✓' : '⌛'} 截止${ddl.length > 1 ? ` ${ddl.length}` : ''}</span>` : ''}${h ? `<span class="tag ${h.type}">${h.type === 'holiday' ? '休' : '班'} · ${esc(h.name)}</span>` : ''}${li.term ? `<span class="tag term">${esc(li.term)}</span>` : ''}${li.fest.slice(0, 1).map(x => `<span class="tag">${esc(x)}</span>`).join('')}${an.slice(0, 1).map(x => `<span class="tag">♥ ${esc(x.name)}</span>`).join('')}</div>
      <div class="mini"><span>${arr.length ? `✓ ${done}/${arr.length}` : ''}</span><span class="priority-dots">${dots}</span></div>`;
    b.onclick = () => { sel = new Date(d); renderCal(); renderSide(); };
    g.appendChild(b);
  }
  renderMonthStat(); renderTodayStat(); renderGoalOverview(); renderDeadlineOverview(); syncGoalOverviewCollapseState();
}
function updateSideBadges() {
  const arr = allTasksFor(sel), pending = arr.filter(x => !x.done).length;
  const tb = $('#sideTaskBadge'); if (tb) tb.textContent = pending ? String(pending) : '';
  const rb = $('#sideReflectBadge'); if (rb) { const r = R[fmt(sel)] || {}; rb.textContent = reflectionConfirmed(r) ? '✓' : (reflectionHasContent(r) ? '•' : ''); }
}
function setSideTab(tab) {
  if (!['action', 'tasks', 'reflect'].includes(tab)) tab = 'action';
  activeSideTab = tab;
  document.querySelectorAll('[data-side-tab]').forEach(b => b.classList.toggle('active', b.dataset.sideTab === tab));
  $('#sidePaneAction')?.classList.toggle('active', tab === 'action');
  $('#sidePaneTasks')?.classList.toggle('active', tab === 'tasks');
  $('#sidePaneReflect')?.classList.toggle('active', tab === 'reflect');
}
function renderTasks() {
  const e = $('#tasks'), arr = allTasksFor(sel); e.innerHTML = '';
  $('#taskStat').textContent = arr.length ? `${arr.filter(x => x.done).length}/${arr.length}` : '';
  updateSideBadges();
  if (!arr.length) { e.innerHTML = '<div class="empty">今天还没有任务。</div>'; return; }
  arr.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority || 'medium']) - ({ high: 0, medium: 1, low: 2 }[b.priority || 'medium']));
  arr.forEach(t => {
    const r = document.createElement('div'); r.className = 'task' + (t.done ? ' done' : '');
    r.innerHTML = `<input type="checkbox" ${t.done ? 'checked' : ''}><div class="txt"><div>${esc(t.text)}</div><div class="meta"><span class="pill ${t.priority || 'medium'}">${pLabel(t.priority || 'medium')}优先级</span>${t.reminder ? `<span class="pill reminder">⏰ ${esc(t.reminder)}</span>` : ''}${t.recurring ? `<span class="pill repeat">↻ ${rLabel(t.repeat)}${t.endDate ? ` · 到 ${esc(t.endDate)}` : ''}</span>` : ''}</div></div><button class="x" type="button">×</button>`;
    r.querySelector('input').onchange = x => { setTaskDone(t, sel, x.target.checked); renderCal(); renderTasks(); };
    r.querySelector('button').onclick = () => { removeTask(t, sel); renderCal(); renderTasks(); };
    e.appendChild(r);
  });
}
function syncRepeatEndUI() { const active = $('#repeat').value !== 'none'; $('#repeatEndWrap').hidden = !active; if (!active) $('#repeatEnd').value = ''; }
function addTask() {
  const v = $('#taskInput').value.trim(); if (!v) return;
  const data = { id: uuid(), text: v, priority: $('#priority').value, reminder: $('#reminder').value || '', repeat: $('#repeat').value, done: false };
  if (data.repeat === 'none') { const k = fmt(sel); T[k] = T[k] || []; T[k].push(data); S.s('tasks', T); }
  else {
    const endDate = $('#repeatEnd').value || '';
    if (endDate && parse(endDate) < parse(fmt(sel))) { alert('重复截止日期不能早于开始日期。'); return; }
    RT.push({ ...data, startDate: fmt(sel), endDate, doneDates: [], skipDates: [] }); S.s('recurringTasks', RT);
  }
  $('#taskInput').value = ''; $('#reminder').value = ''; $('#repeat').value = 'none'; $('#repeatEnd').value = ''; syncRepeatEndUI(); renderCal(); renderTasks();
}
function jumpToDate(dateText, sideTab = '') {
  if (!v150DateOk(dateText)) return;
  const d = parse(dateText); sel = new Date(d); view = new Date(d.getFullYear(), d.getMonth(), 1, 12);
  if (sideTab) setSideTab(sideTab);
  renderCal(); renderSide(); document.querySelector('.calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderDeadlines() {
  const e = $('#deadlineGoals'); if (!e) return;
  const arr = [...DG].sort(deadlineSort), pending = arr.filter(x => !x.done);
  $('#deadlineStat').textContent = DG.length ? `${pending.length} 未完成 / ${DG.length}` : ''; e.innerHTML = '';
  if (!arr.length) { e.innerHTML = '<div class="empty">还没有期限事项。可以给长期目标设定明确截止日。</div>'; return; }
  arr.forEach(g => {
    const st = deadlineState(g), row = document.createElement('div'); row.className = 'deadline-item' + (g.done ? ' done' : '');
    row.innerHTML = `<input type="checkbox" ${g.done ? 'checked' : ''} aria-label="标记完成"><span class="goal-dot ${deadlinePriority(g)}"></span><div class="deadline-body"><div class="deadline-text">${esc(g.text)}</div><div class="deadline-meta"><button class="deadline-date-btn" type="button">截止 ${esc(g.dueDate)}</button><span class="deadline-status ${st.cls}">${esc(st.text)}</span></div></div><button class="x" type="button">×</button>`;
    row.querySelector('input').onchange = x => { g.done = x.target.checked; g.completedAt = g.done ? v170Stamp() : ''; S.s('deadlineGoals', DG); renderDeadlines(); renderDeadlineOverview(); syncGoalOverviewCollapseState(); renderCal(); };
    row.querySelector('.deadline-date-btn').onclick = () => jumpToDate(g.dueDate);
    row.querySelector('.x').onclick = () => { if (confirm(`删除期限事项“${g.text}”？`)) { DG = DG.filter(x => x.id !== g.id); S.s('deadlineGoals', DG); renderDeadlines(); renderDeadlineOverview(); syncGoalOverviewCollapseState(); renderCal(); } };
    e.appendChild(row);
  });
}
function addDeadline() {
  const text = $('#deadlineInput').value.trim(), dueDate = $('#deadlineDate').value;
  if (!text) { alert('先写下要在截止日前完成的事项。'); return; }
  if (!dueDate) { alert('请选择截止日期。'); return; }
  DG.push({ id: uuid(), text, dueDate, priority: $('#deadlinePriority').value || 'medium', done: false, createdAt: v170Stamp(), completedAt: '' });
  S.s('deadlineGoals', DG); $('#deadlineInput').value = ''; renderDeadlines(); renderDeadlineOverview(); syncGoalOverviewCollapseState(); renderCal();
}
function renderDeadlineOverview() {
  const e = $('#deadlineOverviewList'); if (!e) return;
  const arr = [...DG].sort(deadlineSort), pending = arr.filter(x => !x.done), done = arr.filter(x => x.done).length;
  $('#deadlineOverviewProgress').textContent = `${done} / ${arr.length}`;
  if (!arr.length) { $('#deadlineOverviewLabel').textContent = '近期截止'; e.innerHTML = '<div class="empty">还没有设置期限事项。</div>'; return; }
  const next = pending[0];
  $('#deadlineOverviewLabel').textContent = next ? `最近：${next.dueDate.slice(5).replace('-', '/')} · ${deadlineState(next).text}` : '全部完成';
  e.innerHTML = '';
  arr.slice(0, 5).forEach(g => {
    const st = deadlineState(g), row = document.createElement('div'); row.className = 'deadline-overview-item' + (g.done ? ' done' : '');
    row.innerHTML = `<button class="overview-check" type="button">${g.done ? '✓' : ''}</button><span class="overview-dot ${deadlinePriority(g)}"></span><span class="overview-text" title="${esc(g.text)}">${esc(g.text)}</span><span class="deadline-overview-time ${st.cls === 'overdue' ? 'overdue' : (st.cls === 'soon' || st.cls === 'today' ? 'soon' : '')}">${esc(st.text)}</span>`;
    row.querySelector('button').onclick = () => { g.done = !g.done; g.completedAt = g.done ? v170Stamp() : ''; S.s('deadlineGoals', DG); renderDeadlines(); renderDeadlineOverview(); syncGoalOverviewCollapseState(); renderCal(); };
    e.appendChild(row);
  });
  if (arr.length > 5) e.insertAdjacentHTML('beforeend', `<div class="overview-more">还有 ${arr.length - 5} 项，在右侧“任务目标”中查看。</div>`);
}
function goalPriority(g) { return g?.priority || 'medium'; }
function renderGoal(el, obj, key, sk) {
  const e = $(el), arr = obj[key] || []; e.innerHTML = '';
  if (!arr.length) { e.innerHTML = '<div class="empty">还没有目标。</div>'; return; }
  arr.forEach((g, i) => {
    const r = document.createElement('div'); r.className = 'task' + (g.done ? ' done' : '');
    r.innerHTML = `<input type="checkbox" ${g.done ? 'checked' : ''}><span class="goal-dot ${goalPriority(g)}"></span><div class="txt">${esc(g.text)}</div><button class="x" type="button">×</button>`;
    r.querySelector('input').onchange = x => { g.done = x.target.checked; S.s(sk, obj); renderGoal(el, obj, key, sk); renderGoalOverview(); syncGoalOverviewCollapseState(); };
    r.querySelector('button').onclick = () => { arr.splice(i, 1); obj[key] = arr; S.s(sk, obj); renderGoal(el, obj, key, sk); renderGoalOverview(); syncGoalOverviewCollapseState(); };
    e.appendChild(r);
  });
}
function renderGoals() {
  const wk = weekKey(sel), mk = monthKey(sel); $('#weekLabel').textContent = wk; $('#monthLabel').textContent = mk;
  renderGoal('#weekGoals', WG, wk, 'weekGoals'); renderGoal('#monthGoals', MG, mk, 'monthGoals'); renderGoalOverview(); syncGoalOverviewCollapseState();
}
function addGoal(type) {
  const weekly = type === 'w', inp = weekly ? $('#weekInput') : $('#monthInput'), v = inp.value.trim(); if (!v) return;
  const obj = weekly ? WG : MG, key = weekly ? weekKey(sel) : monthKey(sel), sk = weekly ? 'weekGoals' : 'monthGoals';
  obj[key] = obj[key] || []; obj[key].push({ id: uuid(), text: v, done: false, priority: (weekly ? $('#weekPriority') : $('#monthPriority')).value || 'medium' });
  S.s(sk, obj); inp.value = ''; renderGoals();
}
function renderOverviewList(el, arr, obj, key, sk) {
  const e = $(el); e.innerHTML = '';
  if (!arr.length) { e.innerHTML = '<div class="empty">暂时没有待办。</div>'; return; }
  arr.slice(0, 5).forEach(g => {
    const row = document.createElement('div'); row.className = 'overview-item' + (g.done ? ' done' : '');
    row.innerHTML = `<button class="overview-check" type="button">${g.done ? '✓' : ''}</button><span class="overview-dot ${goalPriority(g)}"></span><span class="overview-text" title="${esc(g.text)}">${esc(g.text)}</span>`;
    row.querySelector('button').onclick = () => { g.done = !g.done; S.s(sk, obj); renderGoals(); };
    e.appendChild(row);
  });
  if (arr.length > 5) e.insertAdjacentHTML('beforeend', `<div class="overview-more">还有 ${arr.length - 5} 项，点击下方进入完整列表。</div>`);
}
function renderGoalOverview() {
  if (!$('#weekOverviewList')) return;
  const wk = weekKey(sel), weekArr = WG[wk] || [], mk = monthKey(new Date(view.getFullYear(), view.getMonth(), 1, 12)), monthArr = MG[mk] || [];
  const wa = startOfWeek(sel), wb = endOfWeek(sel), sw = schoolWeekNumber(sel);
  $('#weekOverviewLabel').textContent = `${wa.getMonth() + 1}/${wa.getDate()}—${wb.getMonth() + 1}/${wb.getDate()}${sw ? ` · 校历第${sw}周` : ''}`;
  $('#monthOverviewLabel').textContent = `${view.getFullYear()}年${view.getMonth() + 1}月`;
  $('#weekOverviewProgress').textContent = `${weekArr.filter(x => x.done).length} / ${weekArr.length}`;
  $('#monthOverviewProgress').textContent = `${monthArr.filter(x => x.done).length} / ${monthArr.length}`;
  renderOverviewList('#weekOverviewList', weekArr, WG, wk, 'weekGoals'); renderOverviewList('#monthOverviewList', monthArr, MG, mk, 'monthGoals');
}
function syncGoalOverviewCollapseState() {
  const shell = $('#goalOverviewsShell'); if (!shell) return;
  const wLen = (WG[weekKey(sel)] || []).length, mLen = (MG[monthKey(new Date(view.getFullYear(), view.getMonth(), 1, 12))] || []).length, dLen = DG.length, total = wLen + mLen + dLen;
  shell.classList.toggle('is-compact', total === 0 && !goalOverviewsForceOpen);
  const txt = $('#goalOverviewsBarText');
  if (txt) txt.textContent = total ? `本周 ${wLen} 项 · 本月 ${mLen} 项 · 期限事项 ${dLen} 项` : '本周任务 · 本月任务 · 期限事项（当前暂无待办，已自动收起以留出更大月历视野）';
}
function reflectionHasContent(r) { return [r?.q1, r?.q2, r?.q3].some(x => (x || '').trim()); }
function reflectionConfirmed(r) { if (!reflectionHasContent(r) || r.confirmRequired) return false; if (!r.completedAt || !r.updatedAt) return true; return new Date(r.completedAt).getTime() >= new Date(r.updatedAt).getTime() - 500; }
function reflectionTime(v) { if (!v) return ''; const d = new Date(v); return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); }
function renderReflectionState(r = R[fmt(sel)] || {}) {
  const sec = $('#reflectSection'), btn = $('#completeReflection'), feedback = $('#reflectionFeedback'), has = reflectionHasContent(r), done = reflectionConfirmed(r);
  sec.classList.toggle('reflect-complete', done); sec.classList.toggle('reflect-dirty', has && !done);
  if (!has) { $('#saved').textContent = ''; btn.textContent = '完成今日复盘'; feedback.textContent = '填写内容会自动保存草稿。'; }
  else if (done) { $('#saved').textContent = '✓ 已完成'; btn.textContent = '✓ 今日复盘已完成'; feedback.textContent = `已保存${r.completedAt ? ` · ${reflectionTime(r.completedAt)}` : ''}`; }
  else { $('#saved').textContent = '有未确认修改'; btn.textContent = '确认今日复盘'; feedback.textContent = '草稿已自动保存，点击确认完成。'; }
  updateSideBadges();
}
function renderSide() {
  const k = fmt(sel), li = lunar(sel), h = H[k], r = R[k] || {}, school = schoolWeekText(sel), distance = dayDiff(sel, now);
  $('#dateTitle').textContent = `${sel.getMonth() + 1}月${sel.getDate()}日 · 周${wd(sel)}`;
  const distanceEl = $('#dateDistance'); distanceEl.textContent = selectedDistanceText(sel); distanceEl.className = `date-distance ${distance === 0 ? 'today' : distance > 0 ? 'future' : 'past'}`;
  $('#dateSub').textContent = [`农历${li.fullText}`, school, li.term, ...li.fest, h?.name].filter(Boolean).join(' · ');
  if (!$('#deadlineInput').value.trim()) $('#deadlineDate').value = fmt(sel);
  renderV160TodayCommand(); renderSchedule(); renderLearningMini(); renderTasks(); renderDeadlines(); renderGoals();
  ['q1', 'q2', 'q3'].forEach(id => { $('#' + id).value = r[id] || ''; }); renderReflectionState(r);
}
let reflectTimer = null;
function saveR() {
  const key = fmt(sel), draft = { q1: $('#q1').value, q2: $('#q2').value, q3: $('#q3').value };
  clearTimeout(reflectTimer); $('#saved').textContent = '草稿保存中…';
  $('#reflectSection').classList.add('reflect-dirty'); $('#reflectSection').classList.remove('reflect-complete');
  reflectTimer = setTimeout(() => { R[key] = { ...(R[key] || {}), ...draft, updatedAt: v170Stamp(), confirmRequired: true }; S.s('reflections', R); renderStreak(); if (fmt(sel) === key) renderReflectionState(R[key]); }, 260);
}
function completeReflection() {
  clearTimeout(reflectTimer);
  const key = fmt(sel), draft = { q1: $('#q1').value, q2: $('#q2').value, q3: $('#q3').value };
  if (![draft.q1, draft.q2, draft.q3].some(x => x.trim())) { alert('先写下一点今天的复盘，再确认完成吧。'); return; }
  const stamp = v170Stamp(); R[key] = { ...(R[key] || {}), ...draft, updatedAt: stamp, completedAt: stamp, confirmRequired: false };
  S.s('reflections', R); renderReflectionState(R[key]); renderStreak();
}
function renderMonthStat() {
  const all = []; for (let day = 1; day <= 31; day++) { const d = new Date(view.getFullYear(), view.getMonth(), day, 12); if (d.getMonth() !== view.getMonth()) break; all.push(...allTasksFor(d)); }
  const done = all.filter(x => x.done).length; $('#monthProgress').textContent = `${done} / ${all.length}`; $('#monthRate').textContent = all.length ? `完成率 ${Math.round(done / all.length * 100)}%` : '暂无任务';
}
function renderTodayStat() {
  const arr = allTasksFor(now).filter(x => !x.done), high = arr.filter(x => (x.priority || 'medium') === 'high').length;
  $('#todayTodo').textContent = `${arr.length} 项`; $('#todayHigh').textContent = high ? `${high} 项高优先` : '无高优先';
}
function renderStreak() {
  let n = 0; const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  while (true) { const r = R[fmt(d)]; if (r && [r.q1, r.q2, r.q3].some(x => (x || '').trim())) { n++; d.setDate(d.getDate() - 1); } else break; }
  $('#streak').textContent = `${n} 天`;
}
function annivLabel(a) {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12), b = parse(a.date);
  if (a.repeat) { const n = new Date(t.getFullYear(), b.getMonth(), b.getDate(), 12); if (n < t) n.setFullYear(n.getFullYear() + 1); const left = Math.round((n - t) / 86400000), since = Math.max(0, Math.round((t - b) / 86400000)); return left === 0 ? `今天 · 第 ${since + 1} 天` : `还有 ${left} 天`; }
  const x = Math.round((b - t) / 86400000); return x > 0 ? `还有 ${x} 天` : x === 0 ? '就是今天' : `已经 ${Math.abs(x)} 天`;
}
function renderAnniv() {
  const e = $('#annivCards'); e.innerHTML = '';
  if (!A.length) { e.innerHTML = '<div class="empty" style="padding:6px">还没有纪念日，点击右上角添加。</div>'; return; }
  A.forEach(a => {
    const c = document.createElement('div'); c.className = 'anniv';
    c.innerHTML = `<button class="del" type="button" title="删除">×</button><b>♥ ${esc(a.name)}</b><div class="count">${annivLabel(a)}</div><small>${a.date}${a.repeat ? ' · 每年重复' : ''}</small>`;
    c.querySelector('.del').onclick = () => { if (confirm(`删除纪念日“${a.name}”？`)) { A = A.filter(x => x.id !== a.id); S.s('anniversaries', A); renderAnniv(); renderAnnivManage(); renderCal(); } };
    e.appendChild(c);
  });
}
function renderAnnivManage() {
  const e = $('#annivManage'); e.innerHTML = '<h4 style="margin:8px 0">已有纪念日</h4>';
  if (!A.length) { e.innerHTML += '<div class="empty">暂无。</div>'; return; }
  A.forEach(a => {
    const d = document.createElement('div'); d.className = 'manage-item';
    d.innerHTML = `<div class="grow"><b>${esc(a.name)}</b><div class="note" style="margin:2px 0 0">${a.date}${a.repeat ? ' · 每年重复' : ''}</div></div><button class="btn sm" type="button">删除</button>`;
    d.querySelector('button').onclick = () => { A = A.filter(x => x.id !== a.id); S.s('anniversaries', A); renderAnniv(); renderAnnivManage(); renderCal(); };
    e.appendChild(d);
  });
}
function nextTerm() { try { const t = nextSolarTerm(now); if (!t) { $('#nextTerm').textContent = '—'; return; } const n = dayDiff(t.date, now); $('#nextTerm').textContent = n === 0 ? `今日 · ${t.name}` : `${t.name} · ${n} 天`; } catch { $('#nextTerm').textContent = '—'; } }

/* ===== 通知 & 复盘中心 ===== */
async function askNotify() {
  if (!('Notification' in window)) { alert('当前浏览器不支持网页通知。'); return; }
  if (Notification.permission === 'denied') { alert('提醒权限已被浏览器关闭，请在浏览器网站权限中重新允许通知。'); return; }
  const p = await Notification.requestPermission(); updateNotifyUI();
  if (p === 'granted') new Notification('苏伊温德日历', { body: '任务提醒已经开启。' });
}
function updateNotifyUI() {
  const btn = $('#notifyBtn');
  if (!('Notification' in window)) { if (btn) btn.style.display = 'none'; $('#notifyBanner')?.classList.remove('show'); return; }
  const p = Notification.permission, label = btn?.querySelector('.notify-label'), icon = btn?.querySelector('.action-icon');
  if (p === 'granted') { if (icon) icon.textContent = '🔔'; if (label) label.textContent = '提醒已开启'; }
  else if (p === 'denied') { if (icon) icon.textContent = '🔕'; if (label) label.textContent = '提醒已关闭'; }
  else { if (icon) icon.textContent = '🔔'; if (label) label.textContent = '开启提醒'; }
  $('#notifyBanner')?.classList.toggle('show', p === 'default');
}
function checkReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const t = new Date(), today = fmt(t), hhmm = `${pad(t.getHours())}:${pad(t.getMinutes())}`, sent = S.g('sentReminders', {});
  allTasksFor(t).forEach(task => {
    if (task.done || !task.reminder || task.reminder !== hhmm) return;
    const key = `${today}|${task.id}|${hhmm}`; if (sent[key]) return;
    new Notification('苏伊温德日历 · 到时间啦', { body: task.text }); sent[key] = Date.now();
  });
  Object.keys(sent).forEach(k => { if (Date.now() - sent[k] > 7 * 86400000) delete sent[k]; }); S.s('sentReminders', sent);
}
function collectPeriod(a, b) {
  const days = eachDate(a, b); let taskTotal = 0, taskDone = 0, highTotal = 0, highDone = 0, reflectDays = 0;
  const wrong = [], right = [], better = [];
  days.forEach(d => {
    const arr = allTasksFor(d); taskTotal += arr.length; taskDone += arr.filter(x => x.done).length;
    const hi = arr.filter(x => (x.priority || 'medium') === 'high'); highTotal += hi.length; highDone += hi.filter(x => x.done).length;
    const r = R[fmt(d)] || {};
    if ([r.q1, r.q2, r.q3].some(x => (x || '').trim())) reflectDays++;
    if ((r.q1 || '').trim()) wrong.push({ date: d, text: r.q1.trim() });
    if ((r.q2 || '').trim()) right.push({ date: d, text: r.q2.trim() });
    if ((r.q3 || '').trim()) better.push({ date: d, text: r.q3.trim() });
  });
  return { days, taskTotal, taskDone, highTotal, highDone, reflectDays, wrong, right, better };
}
function renderReviewList(selStr, arr) {
  const e = $(selStr); e.innerHTML = '';
  if (!arr.length) { e.innerHTML = '<div class="empty">这一段还没有内容。</div>'; return; }
  arr.forEach(x => e.insertAdjacentHTML('beforeend', `<div class="review-day"><b>${x.date.getMonth() + 1}月${x.date.getDate()}日 · 周${wd(x.date)}</b><p>${esc(x.text)}</p></div>`));
}
function renderTrend(selStr, groups) {
  const e = $(selStr); e.innerHTML = ''; const max = Math.max(1, ...groups.map(g => g.total));
  groups.forEach(g => { const h = g.total ? Math.max(6, Math.round((g.done / max) * 85)) : 3; const pct = g.total ? Math.round(g.done / g.total * 100) : 0; e.insertAdjacentHTML('beforeend', `<div class="barwrap"><div class="bar" style="height:${h}px" title="${g.done}/${g.total} · ${pct}%"></div><div class="barlabel">${esc(g.label)}</div></div>`); });
}
function autoSummary(data, label) {
  const rate = data.taskTotal ? Math.round(data.taskDone / data.taskTotal * 100) : 0, highRate = data.highTotal ? Math.round(data.highDone / data.highTotal * 100) : 0;
  const lines = [`${label}共记录 ${data.taskTotal} 项任务，完成 ${data.taskDone} 项，完成率 ${rate}%。`, `高优先级任务完成 ${data.highDone}/${data.highTotal}${data.highTotal ? `（${highRate}%）` : ''}。`, `共有 ${data.reflectDays} 天写了每日复盘。`];
  if (data.wrong.length) lines.push(`“做错了什么”记录了 ${data.wrong.length} 条。`);
  if (data.right.length) lines.push(`“做对了什么”记录了 ${data.right.length} 条。`);
  if (data.better.length) lines.push(`“明天怎么做得更好”记录了 ${data.better.length} 条。`);
  return lines.join('\n');
}
function manualKey(type, d) { return type === 'week' ? `week:${weekKey(d)}` : `month:${monthKey(d)}`; }
function renderWeekReview() {
  const a = startOfWeek(sel), b = endOfWeek(sel), data = collectPeriod(a, b), rate = data.taskTotal ? Math.round(data.taskDone / data.taskTotal * 100) : 0;
  $('#wDone').textContent = `${data.taskDone} / ${data.taskTotal}`; $('#wRate').textContent = `${rate}%`; $('#wReflectDays').textContent = `${data.reflectDays} / 7`; $('#wHigh').textContent = `${data.highDone} / ${data.highTotal}`;
  renderReviewList('#weekWrong', data.wrong); renderReviewList('#weekRight', data.right); renderReviewList('#weekBetter', data.better);
  $('#weekAuto').textContent = autoSummary(data, '本周'); renderTrend('#weekTrend', data.days.map(d => { const arr = allTasksFor(d); return { label: wd(d), done: arr.filter(x => x.done).length, total: arr.length }; }));
  $('#weekManual').value = S.g('reviewNotes', {})[manualKey('week', sel)] || '';
}
function monthWeeks(d) {
  const y = d.getFullYear(), m = d.getMonth(), first = new Date(y, m, 1, 12), last = new Date(y, m + 1, 0, 12), groups = [];
  let cur = startOfWeek(first), i = 1;
  while (cur <= last) {
    const end = endOfWeek(cur), a = cur < first ? first : new Date(cur), b = end > last ? last : new Date(end), arr = [];
    eachDate(a, b).forEach(x => arr.push(...allTasksFor(x)));
    groups.push({ label: `W${i++}`, done: arr.filter(x => x.done).length, total: arr.length }); cur = new Date(end); cur.setDate(cur.getDate() + 1);
  }
  return groups;
}
function renderMonthReview() {
  const y = sel.getFullYear(), m = sel.getMonth(), a = new Date(y, m, 1, 12), b = new Date(y, m + 1, 0, 12), data = collectPeriod(a, b), rate = data.taskTotal ? Math.round(data.taskDone / data.taskTotal * 100) : 0;
  $('#mDone').textContent = `${data.taskDone} / ${data.taskTotal}`; $('#mRate').textContent = `${rate}%`; $('#mReflectDays').textContent = `${data.reflectDays}`; $('#mHigh').textContent = `${data.highDone} / ${data.highTotal}`;
  renderReviewList('#monthWrong', data.wrong); renderReviewList('#monthRight', data.right); renderReviewList('#monthBetter', data.better);
  $('#monthAuto').textContent = autoSummary(data, '本月'); renderTrend('#monthTrend', monthWeeks(sel));
  $('#monthManual').value = S.g('reviewNotes', {})[manualKey('month', sel)] || '';
}
function saveReviewNote(type) { const notes = S.g('reviewNotes', {}); notes[manualKey(type, sel)] = type === 'week' ? $('#weekManual').value : $('#monthManual').value; S.s('reviewNotes', notes); }
function reviewMarkdown(type) {
  const isWeek = type === 'week', a = isWeek ? startOfWeek(sel) : new Date(sel.getFullYear(), sel.getMonth(), 1, 12), b = isWeek ? endOfWeek(sel) : new Date(sel.getFullYear(), sel.getMonth() + 1, 0, 12);
  const data = collectPeriod(a, b), title = isWeek ? `${fmt(a)} ~ ${fmt(b)} 周复盘` : `${sel.getFullYear()}年${sel.getMonth() + 1}月 月复盘`;
  const lines = [`# ${title}`, '', `- 任务完成：${data.taskDone}/${data.taskTotal}`, `- 完成率：${data.taskTotal ? Math.round(data.taskDone / data.taskTotal * 100) : 0}%`, `- 高优先级完成：${data.highDone}/${data.highTotal}`, `- 复盘天数：${data.reflectDays}`, ''];
  const sec = (name, arr) => { lines.push(`## ${name}`, ''); if (!arr.length) lines.push('暂无记录。', ''); else arr.forEach(x => lines.push(`### ${fmt(x.date)}`, '', x.text, '')); };
  sec('做错了什么', data.wrong); sec('做对了什么', data.right); sec(isWeek ? '下周要怎么做得更好' : '下个月要怎么做得更好', data.better);
  lines.push(`## 我的${isWeek ? '本周' : '本月'}总结`, '', (S.g('reviewNotes', {})[manualKey(type, sel)] || '').trim() || '暂无。', '');
  return { name: `${title.replace(/[~:/\\*?"<>|]/g, '-')}.md`, text: lines.join('\n') };
}
function downloadText(name, text) { const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); }
function openReview() { $('#reviewModal').classList.add('show'); renderWeekReview(); renderMonthReview(); renderAIStored(); }
function reviewPayload(type) {
  const isWeek = type === 'week', a = isWeek ? startOfWeek(sel) : new Date(sel.getFullYear(), sel.getMonth(), 1, 12), b = isWeek ? endOfWeek(sel) : new Date(sel.getFullYear(), sel.getMonth() + 1, 0, 12), data = collectPeriod(a, b);
  return { type, period: { start: fmt(a), end: fmt(b) }, metrics: { taskTotal: data.taskTotal, taskDone: data.taskDone, highTotal: data.highTotal, highDone: data.highDone, reflectionDays: data.reflectDays }, reflections: { wrong: data.wrong.map(x => ({ date: fmt(x.date), text: x.text })), right: data.right.map(x => ({ date: fmt(x.date), text: x.text })), better: data.better.map(x => ({ date: fmt(x.date), text: x.text })) }, manualNote: S.g('reviewNotes', {})[manualKey(type, sel)] || '' };
}
function localSmartSummary(type) {
  const p = reviewPayload(type), m = p.metrics, rate = m.taskTotal ? Math.round(m.taskDone / m.taskTotal * 100) : 0, hi = m.highTotal ? Math.round(m.highDone / m.highTotal * 100) : 0;
  const period = type === 'week' ? '这周' : '这个月', next = type === 'week' ? '下周' : '下个月', allBetter = p.reflections.better.map(x => x.text).filter(Boolean);
  return [`【整体】${period}共安排 ${m.taskTotal} 项任务，完成 ${m.taskDone} 项，完成率 ${rate}%。复盘 ${m.reflectionDays} 天。`, `【重点】高优先级任务完成 ${m.highDone}/${m.highTotal}${m.highTotal ? `，完成率 ${hi}%` : ''}。`, `【反思记录】做错/不足 ${p.reflections.wrong.length} 条；做对/有效 ${p.reflections.right.length} 条；改进计划 ${p.reflections.better.length} 条。`, allBetter.length ? `【${next}行动】优先从已写下的改进项开始：${allBetter.slice(0, 3).join('；')}` : `【${next}行动】先补一条最具体、最容易执行的改进动作。`].join('\n\n');
}
function aiStoreKey(type) { return `${type}:${type === 'week' ? weekKey(sel) : monthKey(sel)}`; }
function renderAIStored() {
  const a = S.g('aiSummaries', {});
  if ($('#weekAI')) $('#weekAI').textContent = a[aiStoreKey('week')]?.text || '点击“生成 AI 总结”后，会基于本周任务与每日三问生成一份结构化总结。';
  if ($('#monthAI')) $('#monthAI').textContent = a[aiStoreKey('month')]?.text || '点击“生成 AI 总结”后，会基于本月任务与每日三问生成一份结构化总结。';
}
async function generateAI(type) {
  const btn = type === 'week' ? $('#aiWeekBtn') : $('#aiMonthBtn'), out = type === 'week' ? $('#weekAI') : $('#monthAI'), old = btn.textContent;
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>生成中';
  try {
    const res = await fetch('/api/summary', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(reviewPayload(type)) });
    if (!res.ok) throw new Error();
    const data = await res.json(); if (!data.summary) throw new Error();
    out.textContent = data.summary;
  } catch { out.textContent = localSmartSummary(type) + '\n\n（当前未连接 AI 服务，以上为本地结构化总结。）'; }
  finally { const all = S.g('aiSummaries', {}); all[aiStoreKey(type)] = { text: out.textContent, updatedAt: v170Stamp() }; S.s('aiSummaries', all); btn.disabled = false; btn.textContent = old; }
}
function copyText(text) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => v156Toast('✓ 已复制', true)).catch(() => alert('复制失败，请手动选择文本。'));
  else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); v156Toast('✓ 已复制', true); }
}

/* ===== 学习核心逻辑 ===== */
function learningEntryDate(v) { if (!v) return ''; return typeof v === 'string' ? v.slice(0, 10) : (v.date || String(v.at || '').slice(0, 10)); }
function learningDoneCount(map) { return Object.keys(map || {}).filter(k => !!map[k]).length; }
function learningPct(done, total) { return total ? Math.min(100, Math.round(done / total * 100)) : 0; }
function nextNumber(total, map) { for (let i = 1; i <= total; i++) if (!map?.[String(i)]) return i; return null; }
function englishLessonInfo(i) { return ENGLISH_VOCAB_LESSONS[Number(i) - 1] || null; }
function englishLessonLabel(i) { const x = englishLessonInfo(i); return x ? `Unit ${x.unit} · Lesson ${x.lesson}` : '—'; }
function englishDoneCount(map) { let n = 0; for (let i = 1; i <= ENGLISH_LESSON_TOTAL; i++) if (map?.[String(i)]) n++; return n; }
function nextEnglishLesson(map) { return nextNumber(ENGLISH_LESSON_TOTAL, map); }
function englishRound1Complete() { return englishDoneCount(LS.english.round1) >= ENGLISH_LESSON_TOTAL; }
function skillItemById(id) { return ENGLISH_SKILLS.find(x => Number(x.id) === Number(id)) || null; }
function skillDurationMinutes(x) { const s = typeof x === 'string' ? x : (x?.duration || '0:00'), m = /^(\d+):(\d+)$/.exec(s); return m ? Number(m[1]) + Number(m[2]) / 60 : 0; }
function skillMinutesHuman(min) { min = Math.round(Math.max(0, min)); return min >= 60 ? `${Math.floor(min / 60)}小时${String(min % 60).padStart(2, '0')}分` : `${min}分钟`; }
function nextSkillPlanId() { return ENGLISH_SKILL_PLAN_ORDER.find(id => !LS.english.skills[String(id)]) || null; }
function currentSkillPlanBlock() {
  for (const b of ENGLISH_SKILL_DAILY_BLOCKS) {
    const left = b.ids.filter(id => !LS.english.skills[String(id)]);
    if (left.length) return { ...b, left, minutes: left.reduce((n, id) => n + skillDurationMinutes(skillItemById(id)), 0) };
  }
  return null;
}
function skillBlockLabel(b) { return b ? `技巧 Day ${b.day} · ${b.stage} · 约 ${skillMinutesHuman(b.minutes)}` : '技巧课已完成'; }
function skillBlockLessonText(b) { return b ? b.left.map(id => `第${id}节`).join('、') : ''; }
function nextFinanceDay() { for (const d of FINANCE_EXEC_ORDER) if (!LS.finance.completions[String(d)]) return d; return null; }
function nextMathDay() { for (let d = 1; d <= 48; d++) if (!LS.math.completions[String(d)]) return d; return null; }
function financeItem(day) { return FINANCE_PLAN.find(x => x.originalDay === Number(day)); }
function mathItem(day) { return MATH_PLAN.find(x => x.day === Number(day)); }
function financeExecPosition(day) { return FINANCE_EXEC_ORDER.indexOf(Number(day)); }
function financePhaseByPosition(pos) { return FINANCE_PHASES.find(x => pos >= x.start && pos <= x.end) || FINANCE_PHASES[FINANCE_PHASES.length - 1]; }
function financePhaseDone(phase) { return FINANCE_EXEC_ORDER.slice(phase.start, phase.end + 1).filter(d => LS.finance.completions[String(d)]).length; }
function mathDayDuration(x) { return (x?.lectures || []).reduce((s, l) => s + durationSeconds(l.duration), 0); }

function isMilitaryKey(k) { return k >= LEARNING_CONFIG.militaryStart && k <= LEARNING_CONFIG.militaryEnd; }
function isResumeOrLaterKey(k) { return k >= LEARNING_CONFIG.resumeDate; }
function formalAdvanceAllowed(k = learningTodayKey()) { return isMilitaryKey(k) || isResumeOrLaterKey(k); }
function v158DateDay(k) { return parse(k).getDay(); }
function v158IsWeeklyRestDay(k) { return v158DateDay(k) === 6; }
function v158IsFlexLeaveDay(k) { return !!LS.lifePolicy?.flex?.used?.[k]; }
function v158IsProtectedRestDay(k) { return v158IsWeeklyRestDay(k) || v158IsFlexLeaveDay(k); }
function isLearningBusyKey(k) { return !!LS.busyDates[k] || v158IsProtectedRestDay(k); }
function v158DailyTargetMin(k) { return v158IsProtectedRestDay(k) ? 0 : (v158DateDay(k) === 0 ? LS.lifePolicy.sundayTargetMin : LS.lifePolicy.weekdayTargetMin); }
function v158ScheduledMonthMinutes(month) { const [y, m] = month.split('-').map(Number), d = new Date(y, m - 1, 1, 12), end = new Date(y, m, 0, 12); let n = 0; for (; d <= end; d.setDate(d.getDate() + 1)) n += v158DailyTargetMin(fmt(d)); return n; }
function v158ScheduledWeekMinutes(date = learningTodayDate()) { const a = startOfWeek(date), b = endOfWeek(date), d = new Date(a); let n = 0; for (; d <= b; d.setDate(d.getDate() + 1)) n += v158DailyTargetMin(fmt(d)); return n; }

function countdownLabel(x) { return x?.endDate && x.endDate !== x.date ? `${x.date} — ${x.endDate}` : x?.date || '—'; }
function englishExamCountdown() { return (LS.countdowns || []).find(x => x.id === 'goal-english-b') || null; }
function englishContentDeadline() { const k = englishExamCountdown()?.date || ''; return k ? addDaysKey(k, -3) : ''; }
function learningAllCountdowns() { return [...(LS.countdowns || [])].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'zh-CN')); }
function learningUpcomingCountdowns() { const k = learningTodayKey(); return learningAllCountdowns().filter(x => (x.endDate || x.date) >= k).sort((a, b) => (a.date < k ? k : a.date).localeCompare(b.date < k ? k : b.date)); }
function learningNearestCountdown() { return learningUpcomingCountdowns()[0] || null; }
function learningCountdownsOnDate(k) { return (LS.countdowns || []).filter(x => k >= x.date && k <= (x.endDate || x.date)); }
function learningCountdownText(date, endDate = '') {
  const n = dayDiff(parse(date), learningTodayDate());
  if (endDate && v150DateOk(endDate) && learningTodayKey() >= date && learningTodayKey() <= endDate) return '正在进行';
  return n > 0 ? `还有 ${n} 天` : n === 0 ? '就是今天' : `已过去 ${Math.abs(n)} 天`;
}
function saveCountdownEdit(id, title, date, endDate, kind, note) {
  title = String(title || '').trim(); date = String(date || '').trim(); endDate = String(endDate || '').trim();
  if (!title || !v150DateOk(date)) { alert('请填写名称和有效日期。'); return false; }
  if (endDate && (!v150DateOk(endDate) || endDate < date)) { alert('结束日期不能早于开始日期。'); return false; }
  const i = LS.countdowns.findIndex(x => x.id === id); if (i < 0) return false;
  LS.countdowns[i] = { ...LS.countdowns[i], title, date, endDate: endDate || '', kind: String(kind || '考试'), note: String(note || '').trim() };
  persistLearningState(); return true;
}
function addLearningCountdown(title, date, kind, note, endDate = '') {
  title = String(title || '').trim(); date = String(date || '').trim(); endDate = String(endDate || '').trim();
  if (!title) { alert('先写一个考试 / 考证名称。'); return; }
  if (!v150DateOk(date)) { alert('请选择开始日期。'); return; }
  if (endDate && (!v150DateOk(endDate) || endDate < date)) { alert('结束日期不能早于开始日期。'); return; }
  if ((LS.countdowns || []).some(x => x.title === title && x.date === date)) { alert('这个倒数日已经存在。'); return; }
  LS.countdowns.push({ id: uuid(), title, date, endDate: endDate || '', kind: String(kind || '考试'), note: String(note || '').trim(), createdAt: v170Stamp() });
  persistLearningState(); renderLearningAll();
}
function removeLearningCountdown(id) {
  const x = (LS.countdowns || []).find(c => c.id === id); if (!x || !confirm(`删除倒数日“${x.title}”？`)) return;
  LS.countdowns = LS.countdowns.filter(c => c.id !== id); persistLearningState(); renderLearningAll();
}
function learningReviewFor(k) { if (!LS.english.reviews[k]) LS.english.reviews[k] = { morning: false, evening: false, weekly: false }; return LS.english.reviews[k]; }
function setLearningReview(kind, checked, k = learningTodayKey()) { learningReviewFor(k)[kind] = !!checked; persistLearningState(); renderLearningAll(); }
function v159ReadingVocab(k = learningTodayKey()) {
  const x = learningReviewFor(k).readingVocab;
  return x && typeof x === 'object' ? { done: !!x.done, count: Math.max(0, Number(x.count) || 0), note: String(x.note || ''), updatedAt: String(x.updatedAt || '') } : { done: false, count: 0, note: '', updatedAt: '' };
}
function v159SaveReadingVocab(k, done, count, note) {
  learningReviewFor(k).readingVocab = { done: !!done, count: Math.max(0, Math.min(99, Number(count) || 0)), note: String(note || '').trim(), updatedAt: v170Stamp() };
  persistLearningState(); renderLearningAll();
}
function v159EnglishStudyDay(k) { return parse(k).getDay() !== 6 && !isLearningBusyKey(k) && !v158IsFlexLeaveDay(k); }
function projectEnglishRound1() {
  const done = englishDoneCount(LS.english.round1), rem = Math.max(0, ENGLISH_LESSON_TOTAL - done);
  if (!rem) { const last = Array.from({ length: ENGLISH_LESSON_TOTAL }, (_, i) => learningEntryDate(LS.english.round1[String(i + 1)])).filter(Boolean).sort().pop(); return { date: last || learningTodayKey(), pace: 0 }; }
  let d = learningTodayDate(), left = rem, guard = 0;
  if (fmt(d) < LEARNING_CONFIG.militaryStart) d = parse(LEARNING_CONFIG.militaryStart);
  while (left > 0 && guard < 240) { if (v159EnglishStudyDay(fmt(d))) left -= 1; if (left > 0) d.setDate(d.getDate() + 1); guard++; }
  return { date: fmt(d), pace: 1 };
}
function learningStatusClass(projected, target) { return projected <= target ? 'safe' : projected <= addDaysKey(target, 7) ? 'warn' : 'danger'; }
function learningCompletionItemsOnDate(k) {
  const out = [];
  for (let i = 1; i <= ENGLISH_LESSON_TOTAL; i++) {
    if (learningEntryDate(LS.english.round1[String(i)]) === k) out.push(`英语一轮 · ${englishLessonLabel(i)}`);
    if (learningEntryDate(LS.english.round2[String(i)]) === k) out.push(`英语二轮 · ${englishLessonLabel(i)}`);
  }
  ENGLISH_SKILLS.forEach(s => { if (learningEntryDate(LS.english.skills[String(s.id)]) === k) out.push(`四级技巧 · ${s.module} #${s.id}`); });
  FINANCE_EXEC_ORDER.forEach(d => { if (learningEntryDate(LS.finance.completions[String(d)]) === k) { const x = financeItem(d); out.push(`财经 · ${x?.subject || ''} ${x?.title || `Day${d}`}`); } });
  for (let d = 1; d <= 48; d++) if (learningEntryDate(LS.math.completions[String(d)]) === k) out.push(`高数 · Day ${d}`);
  if (LS.english.reviews?.[k]?.weekly) out.push('英语 · 一周总复习');
  const rv = v159ReadingVocab(k); if (rv.done) out.push(`英语 · 阅读精读${rv.count ? ` · 生词 ${rv.count} 个` : ''}${rv.note ? ` · ${rv.note}` : ''}`);
  LS.freeLogs.filter(x => x.date === k).forEach(x => out.push(`自主 · ${x.track || '学习'} ${x.text || ''}`));
  return out;
}
function learningCalendarTags(d) {
  const k = fmt(d), tags = [], cds = learningCountdownsOnDate(k);
  if (cds.length) tags.push(`<span class="tag learning-countdown">⌛ ${esc(cds[0].title)}${cds.length > 1 ? ` +${cds.length - 1}` : ''}</span>`);
  if (isMilitaryKey(k)) tags.push('<span class="tag learning">军训</span>');
  if (LS.busyDates[k] || v158IsFlexLeaveDay(k)) tags.push(`<span class="tag learning-busy">${v158IsFlexLeaveDay(k) ? '调休' : '缓冲'}</span>`);
  const n = learningCompletionItemsOnDate(k).length;
  if (n) tags.push(`<span class="tag learning">学 ${n}</span>`);
  return tags.slice(0, 2).join('');
}
function learningMark(map, id, checked, dateKey = learningTodayKey()) { const key = String(id); if (checked) map[key] = { date: dateKey, at: v170Stamp() }; else delete map[key]; persistLearningState(); }
function persistLearningState() { S.s('learningState', LS); renderLearningOverview(); renderLearningMini(); renderV160TodayCommand(); renderCal(); }
function toggleLearningBusy(k = learningTodayKey()) {
  if (LS.busyDates[k]) { delete LS.busyDates[k]; persistLearningState(); renderLearningAll(); return; }
  const reason = prompt('今天为什么需要缓冲？可以写“志愿 / 考试 / 临时任务”，也可以留空。', ''); if (reason === null) return;
  LS.busyDates[k] = { reason: reason.trim(), createdAt: v170Stamp() }; persistLearningState(); renderLearningAll();
}
function addBusyDate(date, reason) { if (!date) return; LS.busyDates[date] = { reason: (reason || '').trim(), createdAt: v170Stamp() }; persistLearningState(); renderLearningAll(); }
function removeBusyDate(date) { delete LS.busyDates[date]; persistLearningState(); renderLearningAll(); }
function addFreeLearningLog(track, text, k = learningTodayKey()) { if (!text.trim()) return; LS.freeLogs.push({ id: uuid(), date: k, track, text: text.trim(), at: v170Stamp() }); persistLearningState(); renderLearningAll(); }
function removeFreeLearningLog(id) { LS.freeLogs = LS.freeLogs.filter(x => x.id !== id); persistLearningState(); renderLearningAll(); }

/* ===== 计时器 & 复习 & 睡眠 & 质量 & 制度 ===== */
function energyFor(k = learningTodayKey()) { return LS.energy[k] || 'normal'; }
function setEnergy(mode, k = learningTodayKey()) { LS.energy[k] = mode; persistLearningState(); renderLearningAll(); }
const energyLabel = mode => mode === 'high' ? '高能量' : mode === 'low' ? '低负荷' : '标准';
const energyPlan = mode => mode === 'low' ? { focus: 25, shortBreak: 5, longBreak: 15 } : { focus: 50, shortBreak: 10, longBreak: 20 };
const energyModeExplanation = mode => mode === 'high' ? '<b>高能量</b> 完成当天核心量后，额外给 1 个“可选加量”任务；不做不欠账。' : mode === 'low' ? '<b>低负荷</b> 只保留最核心任务，复习和第二主科可以后移。' : '<b>标准</b> 只完成当天计划量，不主动加量；这是默认模式。';

function studyWeekRange() { return [fmt(startOfWeek(learningTodayDate())), fmt(endOfWeek(learningTodayDate()))]; }
function sessionDate(s) { return String(s?.dateKey || '') || beijingDateKey(s?.startAt || s?.endAt || ''); }
function studySessionsBetween(a, b) { return (LS.studyTimer.sessions || []).filter(x => { const k = sessionDate(x); return k >= a && k <= b; }); }
function studySecondsBetween(a, b, subject = '') { return studySessionsBetween(a, b).filter(x => !subject || x.subject === subject).reduce((sum, x) => sum + Number(x.focusSeconds || 0), 0); }
function activeStudyFocusSeconds() { const a = LS.studyTimer.active; if (!a) return 0; let total = Number(a.focusAccumSec || 0); if (a.phase === 'focus') total += Math.max(0, Math.floor((Date.now() - Date.parse(a.phaseStartedAt)) / 1000)); return total; }
function currentPhaseSeconds() { const a = LS.studyTimer.active; return a ? Math.max(0, Math.floor((Date.now() - Date.parse(a.phaseStartedAt)) / 1000)) : 0; }
function todayStudySeconds(subject = '') { const k = learningTodayKey(); return studySecondsBetween(k, k, subject) + (LS.studyTimer.active && (!subject || LS.studyTimer.active.subject === subject) ? activeStudyFocusSeconds() : 0); }
function weekStudySeconds(subject = '') { const [a, b] = studyWeekRange(); return studySecondsBetween(a, b, subject) + (LS.studyTimer.active && (!subject || LS.studyTimer.active.subject === subject) && learningTodayKey() >= a && learningTodayKey() <= b ? activeStudyFocusSeconds() : 0); }
function v158SessionClass(x) { return V158_TIME_CLASSES[x?.timeClass] ? x.timeClass : v158DefaultClassForSubject(x?.subject); }
function v158SessionCounts(x) { return V158_CORE_CLASSES.has(v158SessionClass(x)); }
function v158EffectiveSecondsBetween(a, b) {
  let sec = (LS.studyTimer.sessions || []).filter(x => { const k = sessionDate(x); return k >= a && k <= b && v158SessionCounts(x); }).reduce((s, x) => s + Number(x.focusSeconds || 0), 0);
  const act = LS.studyTimer.active; if (act && v158SessionCounts(act)) { const k = learningTodayKey(); if (k >= a && k <= b) sec += activeStudyFocusSeconds(); }
  return sec;
}
function v158EffectiveTodaySeconds() { const k = learningTodayKey(); return v158EffectiveSecondsBetween(k, k); }
function v158EffectiveWeekSeconds() { const [a, b] = studyWeekRange(); return v158EffectiveSecondsBetween(a, b); }
function v158EffectiveMonthSeconds(month) { const [y, m] = month.split('-').map(Number); return v158EffectiveSecondsBetween(`${month}-01`, fmt(new Date(y, m, 0, 12))); }
function learningDeviceId() { try { let id = localStorage.getItem('zx_learningDeviceId') || ''; if (!id) { id = 'dev-' + uuid(); localStorage.setItem('zx_learningDeviceId', id); } return id; } catch { return 'dev-unknown'; } }
function v150Notify(title, body) { try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body }); } catch {} }
function syncStudyTimerLoop() {
  if (LS.studyTimer.active) { if (!studyTimerInterval) studyTimerInterval = setInterval(studyTimerTick, 1000); }
  else if (studyTimerInterval) { clearInterval(studyTimerInterval); studyTimerInterval = null; }
}
function forceStudyLedgerSyncSoon() { clearTimeout(window.__studyLedgerSyncTimer); window.__studyLedgerSyncTimer = setTimeout(async () => { try { if (sb && sbUser) await uploadCloud(true); } catch {} }, 120); }
function startStudy(subject, energy, note = '', timeClass = '') {
  if (LS.studyTimer.active) { alert('已经有一段学习正在进行，请先结束当前学习。'); return; }
  if (!STUDY_SUBJECTS.includes(subject)) subject = '其他';
  const tc = V158_TIME_CLASSES[timeClass] ? timeClass : v158DefaultClassForSubject(subject), nowIso = v170Stamp();
  LS.studyTimer.active = { id: uuid(), subject, energy: energy || energyFor(), timeClass: tc, note: String(note || '').trim(), sessionStartedAt: nowIso, phase: 'focus', phaseStartedAt: nowIso, focusAccumSec: 0, breakAccumSec: 0, blocksCompleted: 0, blocksSinceLong: 0, lastEyeMark: 0 };
  persistLearningState(); syncStudyTimerLoop(); renderLearningAll(); studyTimerTick();
}
function startStudyBreak() {
  const a = LS.studyTimer.active; if (!a) return;
  if (a.phase === 'focus') { a.focusAccumSec = Number(a.focusAccumSec || 0) + currentPhaseSeconds(); a.blocksCompleted = Number(a.blocksCompleted || 0) + 1; a.blocksSinceLong = Number(a.blocksSinceLong || 0) + 1; }
  a.phase = 'break'; a.phaseStartedAt = v170Stamp(); a.focusDueNotified = false; persistLearningState(); renderLearningPanel();
}
function skipBreakAndContinue() {
  const a = LS.studyTimer.active; if (!a) return;
  if (a.phase === 'focus') { a.focusAccumSec = Number(a.focusAccumSec || 0) + currentPhaseSeconds(); a.blocksCompleted = Number(a.blocksCompleted || 0) + 1; a.blocksSinceLong = Number(a.blocksSinceLong || 0) + 1; }
  if (a.blocksSinceLong >= 2) a.blocksSinceLong = 0;
  a.phase = 'focus'; a.phaseStartedAt = v170Stamp(); a.lastEyeMark = 0; a.focusDueNotified = false; persistLearningState(); renderLearningPanel();
}
function startNextFocus() {
  const a = LS.studyTimer.active; if (!a) return;
  if (a.blocksSinceLong >= 2) a.blocksSinceLong = 0;
  a.phase = 'focus'; a.phaseStartedAt = v170Stamp(); a.lastEyeMark = 0; a.focusDueNotified = false; persistLearningState(); renderLearningPanel();
}
function finishStudy() {
  const a = LS.studyTimer.active; if (!a) return;
  let focus = Number(a.focusAccumSec || 0), br = Number(a.breakAccumSec || 0);
  if (a.phase === 'focus') focus += Math.max(0, Math.floor((Date.now() - Date.parse(a.phaseStartedAt)) / 1000));
  else if (a.phase === 'break') br += currentPhaseSeconds();
  focus = Math.max(0, Math.round(focus));
  const rec = { id: a.id || uuid(), deviceId: learningDeviceId(), subject: a.subject, energy: a.energy, timeClass: V158_TIME_CLASSES[a.timeClass] ? a.timeClass : v158DefaultClassForSubject(a.subject), note: a.note, startAt: a.sessionStartedAt || a.phaseStartedAt || v170Stamp(), endAt: v170Stamp(), focusSeconds: focus, breakSeconds: Math.max(0, Math.round(br)), blocks: a.blocksCompleted || 0, recordedAt: v170Stamp() };
  LS.studyTimer.sessions = mergeStudyLedger([...(LS.studyTimer.sessions || []), rec], LS.studyTimer.deletedSessionIds || [], [], []).sessions;
  LS.studyTimer.active = null; syncStudyTimerLoop(); persistLearningState();
  studyTimerNotice = `已记录：${rec.subject} · ${secHuman(rec.focusSeconds)} · ${V158_TIME_CLASSES[rec.timeClass].label}`;
  renderLearningAll(); forceStudyLedgerSyncSoon();
}
function addManualStudySession(subject, dateKey, minutes, note = '', timeClass = '') {
  const min = Math.round(Number(minutes));
  if (!STUDY_SUBJECTS.includes(subject)) subject = '其他';
  if (!v150DateOk(dateKey)) { alert('请选择日期。'); return; }
  if (!Number.isFinite(min) || min <= 0 || min > 720) { alert('学习时长请填写 1—720 分钟。'); return; }
  const tc = V158_TIME_CLASSES[timeClass] ? timeClass : v158DefaultClassForSubject(subject), startAt = beijingAnchorIso(dateKey, '12:00');
  LS.studyTimer.sessions.push({ id: 'manual-' + uuid(), manual: true, dateKey, deviceId: learningDeviceId(), subject, energy: 'normal', timeClass: tc, note: String(note || '').trim(), startAt, endAt: new Date(Date.parse(startAt) + min * 60000).toISOString(), focusSeconds: min * 60, breakSeconds: 0, blocks: 0, recordedAt: v170Stamp() });
  persistLearningState(); studyTimerNotice = `已手动补记：${subject} · ${min} 分钟 · ${V158_TIME_CLASSES[tc].label}`;
  forceStudyLedgerSyncSoon(); renderLearningTimer(); renderLearningOverview();
}
function removeStudySession(id) {
  if (!confirm('删除这条学习计时记录？')) return;
  LS.studyTimer.sessions = LS.studyTimer.sessions.filter(x => x.id !== id);
  if (!Array.isArray(LS.studyTimer.deletedSessionIds)) LS.studyTimer.deletedSessionIds = [];
  if (!LS.studyTimer.deletedSessionIds.includes(id)) LS.studyTimer.deletedSessionIds.push(id);
  persistLearningState(); renderLearningAll();
}
function studyTimerTick() {
  const a = LS.studyTimer.active; if (!a) { syncStudyTimerLoop(); updateTimerDOM(); return; }
  const p = energyPlan(a.energy), elapsed = currentPhaseSeconds();
  if (a.phase === 'focus') {
    const eyeMark = Math.floor(elapsed / (20 * 60));
    if (eyeMark > Number(a.lastEyeMark || 0)) { a.lastEyeMark = eyeMark; originalSet('learningState', LS); v150Notify('看远 20 秒', '把视线移到约 6 米外，让眼睛和身体短暂放松。'); }
    if (elapsed >= p.focus * 60 && !a.focusDueNotified) { a.focusDueNotified = true; originalSet('learningState', LS); v150Notify('到建议休息点了', `已经专注 ${p.focus} 分钟。收尾后建议离屏休息。`); if ($('#learningModal')?.classList.contains('show') && activeLearningTab === 'timer') renderLearningPanel(); return; }
  } else if (a.phase === 'break') {
    const breakMin = a.blocksSinceLong >= 2 ? p.longBreak : p.shortBreak;
    if (elapsed >= breakMin * 60) { a.breakAccumSec = Number(a.breakAccumSec || 0) + breakMin * 60; a.phase = 'ready'; a.phaseStartedAt = v170Stamp(); originalSet('learningState', LS); v150Notify('休息结束', '如果状态合适，可以开始下一轮。'); if ($('#learningModal')?.classList.contains('show') && activeLearningTab === 'timer') renderLearningPanel(); return; }
  }
  updateTimerDOM();
}
function updateTimerDOM() {
  const qt = $('#v155QuickTime'); if (qt && LS.studyTimer.active) qt.textContent = secHuman(activeStudyFocusSeconds());
  const c = $('#liveTimerClock'), ph = $('#liveTimerPhase'), hi = $('#liveTimerHint'); if (!c) return;
  const a = LS.studyTimer.active;
  if (!a) { c.textContent = '00:00'; if (ph) ph.textContent = '尚未开始'; if (hi) hi.textContent = '选择科目与有效口径后开始计时。'; return; }
  const p = energyPlan(a.energy), elapsed = currentPhaseSeconds();
  if (a.phase === 'focus') {
    const left = p.focus * 60 - elapsed;
    c.textContent = left >= 0 ? timeClock(left) : `+${timeClock(Math.abs(left))}`;
    ph.textContent = left >= 0 ? `${a.subject} · 专注中 · 第 ${(a.blocksCompleted || 0) + 1} 轮` : `${a.subject} · 已到建议休息点`;
    hi.textContent = left >= 0 ? `本轮建议 ${p.focus} 分钟 · 约 ${timeClock(20 * 60 - (elapsed % (20 * 60)))} 后看远 20 秒 · 已累计 ${secHuman(activeStudyFocusSeconds())}` : `已超过建议专注时长 ${secHuman(Math.abs(left))}；学习时间仍如实记录。`;
  } else if (a.phase === 'break_due') { c.textContent = '00:00'; ph.textContent = '本轮完成 · 该休息了'; hi.textContent = `建议 ${a.blocksSinceLong >= 2 ? p.longBreak : p.shortBreak} 分钟离屏休息。`; }
  else if (a.phase === 'break') { const mins = a.blocksSinceLong >= 2 ? p.longBreak : p.shortBreak; c.textContent = timeClock(Math.max(0, mins * 60 - elapsed)); ph.textContent = '休息中'; hi.textContent = '离开屏幕、起身走动、补水。'; }
  else { c.textContent = '00:00'; ph.textContent = '休息完成'; hi.textContent = '状态合适再开始下一轮，不必强撑。'; }
}

function spacedReviewSources() {
  const out = [], settings = LS.spacedReviews.settings || {};
  if (settings.finance !== false) FINANCE_EXEC_ORDER.forEach(id => { const k = learningEntryDate(LS.finance.completions[String(id)]); if (k) { const x = financeItem(id); out.push({ track: '财经', trackKey: 'finance', id: String(id), completed: k, title: `${x?.subject || '财经'} · ${x?.title || `原 Day ${id}`}` }); } });
  if (settings.math !== false) for (let id = 1; id <= 48; id++) { const k = learningEntryDate(LS.math.completions[String(id)]); if (k) out.push({ track: '高数', trackKey: 'math', id: String(id), completed: k, title: `高数 Day ${id}` }); }
  if (settings.skills !== false) ENGLISH_SKILLS.forEach(x => { const k = learningEntryDate(LS.english.skills[String(x.id)]); if (k) out.push({ track: '四级技巧', trackKey: 'skills', id: String(x.id), completed: k, title: `${x.module} · ${x.title}` }); });
  return out;
}
function spacedReviewItems() {
  const out = [];
  for (const src of spacedReviewSources()) for (const off of REVIEW_OFFSETS) { const key = `${src.trackKey}:${src.id}:${off}`, due = addDaysKey(src.completed, off); out.push({ ...src, offset: off, key, due, done: LS.spacedReviews.done[key] }); }
  return out.sort((a, b) => a.due.localeCompare(b.due));
}
function reviewBacklog() { const k = learningTodayKey(); return spacedReviewItems().filter(x => x.due <= k && !x.done); }
function dueReviews() { const all = reviewBacklog().sort((a, b) => a.due.localeCompare(b.due) || b.offset - a.offset); return all.slice(0, Math.max(1, Math.floor((Math.max(5, Number(LS.spacedReviews.settings.dailyBudgetMin) || 15)) / 5))); }
function upcomingReviews(limit = 12) { const k = learningTodayKey(); return spacedReviewItems().filter(x => x.due > k && !x.done).slice(0, limit); }
function markReviewDone(key) { LS.spacedReviews.done[key] = { date: learningTodayKey(), at: v170Stamp() }; persistLearningState(); renderLearningAll(); }
function setReviewSetting(name, val) { LS.spacedReviews.settings[name] = !!val; persistLearningState(); renderLearningAll(); }

function sleepMinutes(bed, wake) { if (!/^\d{2}:\d{2}$/.test(bed || '') || !/^\d{2}:\d{2}$/.test(wake || '')) return 0; const [bh, bm] = bed.split(':').map(Number), [wh, wm] = wake.split(':').map(Number); let a = bh * 60 + bm, b = wh * 60 + wm; if (b <= a) b += 1440; return Math.max(0, b - a); }
function sleepRecord(k) { return LS.sleep.records[k] || null; }
function saveSleepRecord(k, bed, asleep, wake, difficulty, sleepiness, nap, note) { if (!k || !bed || !asleep || !wake) { alert('请填写日期、上床/估计睡着/起床时间。'); return; } LS.sleep.records[k] = { date: k, bed, asleep, wake, difficulty: Number(difficulty) || 3, sleepiness: Number(sleepiness) || 3, nap: Math.max(0, Number(nap) || 0), note: String(note || '').trim(), updatedAt: v170Stamp() }; persistLearningState(); renderLearningAll(); }
const sleepDurationMin = r => r ? sleepMinutes(r.asleep, r.wake) : 0;
const sleepAvg = (arr, fn) => arr.length ? arr.reduce((s, x) => s + fn(x), 0) / arr.length : 0;
const sleepHuman = min => `${Math.floor(min / 60)}小时${Math.round(min % 60)}分`;

const v160DayDiff = (a, b) => (!a || !b) ? NaN : Math.round((parse(b) - parse(a)) / 86400000);
const v160RetrievalValid = x => { const delay = v160DayDiff(x.sourceDate, x.testDate); return delay >= 5 && delay <= 9 && Number(x.items) >= 10 && Number(x.score) >= 0 && Number(x.score) <= 100; };
const v160ErrorValid = x => !!x.sameDifficulty && Number(x.before) > 0 && Number(x.before) <= 100 && Number(x.after) >= 0 && Number(x.after) <= 100;
const v160ErrorImprove = x => { const a = Number(x.before), b = Number(x.after); return a > 0 ? ((a - b) / a * 100) : 0; };
function v160QualityMonthStats(month) {
  const q = LS.quality, r = q.retrievalTests.filter(x => String(x.testDate || '').startsWith(month) && v160RetrievalValid(x)), e = q.errorChecks.filter(x => String(x.date || '').startsWith(month) && v160ErrorValid(x));
  return { retrieval: r.length ? r.reduce((s, x) => s + Number(x.score || 0), 0) / r.length : 0, retrievalCount: r.length, errorImprove: e.length ? e.reduce((s, x) => s + v160ErrorImprove(x), 0) / e.length : 0, lowErrorMaintained: e.some(x => Number(x.before) <= 10 && Number(x.after) <= 10), errorCount: e.length };
}
function v160AddRetrieval(subject, sourceDate, testDate, score, items, note) {
  score = Number(score); items = Math.round(Number(items));
  if (!sourceDate || !testDate || !Number.isFinite(score) || score < 0 || score > 100 || !Number.isFinite(items) || items < 1) { alert('请完整填写学习日期、测验日期、分数和题目数。'); return; }
  const item = { id: uuid(), subject: String(subject || '其他'), sourceDate, testDate, score, items, note: String(note || '').trim(), createdAt: v170Stamp() };
  LS.quality.retrievalTests.unshift(item); LS.quality.retrievalTests = LS.quality.retrievalTests.slice(0, 300);
  persistLearningState(); renderLearningAll(); v156Toast(v160RetrievalValid(item) ? '✓ 已记入有效延迟提取' : '已记录；需满足 5—9 天且 ≥10 项才计入月评级', true);
}
function v160AddError(subject, date, before, after, sameDifficulty, note) {
  before = Number(before); after = Number(after);
  if (!date || !Number.isFinite(before) || before < 0 || before > 100 || !Number.isFinite(after) || after < 0 || after > 100) { alert('请填写 0—100% 的前测与后测错误率。'); return; }
  LS.quality.errorChecks.unshift({ id: uuid(), subject: String(subject || '其他'), date, before, after, sameDifficulty: !!sameDifficulty, note: String(note || '').trim(), createdAt: v170Stamp() });
  LS.quality.errorChecks = LS.quality.errorChecks.slice(0, 300); persistLearningState(); renderLearningAll();
  v156Toast(sameDifficulty ? '✓ 错误率对照已记录' : '已记录；不同难度对照不计入月评级', true);
}
function v160RemoveQuality(kind, id) {
  if (kind === 'r') { LS.v170.tombstones.retrieval = [id, ...LS.v170.tombstones.retrieval.filter(x => x !== id)].slice(0, 1000); LS.quality.retrievalTests = LS.quality.retrievalTests.filter(x => x.id !== id); }
  else { LS.v170.tombstones.errors = [id, ...LS.v170.tombstones.errors.filter(x => x !== id)].slice(0, 1000); LS.quality.errorChecks = LS.quality.errorChecks.filter(x => x.id !== id); }
  persistLearningState(); renderLearningAll();
}

function v158MonthFlexDates(month) { return Object.keys(LS.lifePolicy.flex.used || {}).filter(k => k.startsWith(month)).sort(); }
function v158MonthExtraLeaveReductionMin(month) { const dates = v158MonthFlexDates(month); return dates.length <= 2 ? 0 : dates.slice(2).reduce((s, k) => s + (v158DateDay(k) === 0 ? 270 : 330), 0); }
function v158RecentMonthKeys(month, n = 3) { const [y, m] = month.split('-').map(Number), out = [], d = new Date(y, m - 1, 1, 12); for (let i = 0; i < n; i++) { out.unshift(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); d.setMonth(d.getMonth() - 1); } return out; }
function v158AdjustedTimeThresholds(month) {
  const leaveCount = v158MonthFlexDates(month).length, rawReduction = v158MonthExtraLeaveReductionMin(month);
  const avg = v158RecentMonthKeys(month, 3).map(m => v158EffectiveMonthSeconds(m) / 3600).reduce((a, b) => a + b, 0) / 3;
  const holiday = leaveCount >= 3 && avg >= 120, reduction = holiday ? rawReduction / 60 : 0;
  return { s: Math.max(0, 138 - reduction), a: Math.max(0, 128 - reduction), b: Math.max(0, 120 - reduction), holiday, leaveCount, reduction, avg };
}
function v158MonthSleepStats(month) { const arr = Object.values(LS.sleep?.records || {}).filter(x => x?.date?.startsWith(month)); return { count: arr.length, avgMin: arr.length ? arr.reduce((s, x) => s + sleepDurationMin(x), 0) / arr.length : 0 }; }
function v158Metric(month) {
  const x = LS.lifePolicy.monthlyMetrics[month] || {}, auto = v160QualityMonthStats(month);
  const m = { cop: Math.max(0, Number(x.cop) || 0), retrieval: Math.max(0, Number(x.retrieval) || 0), retrievalCount: Math.max(0, Math.round(Number(x.retrievalCount) || 0)), errorImprove: Number.isFinite(Number(x.errorImprove)) ? Number(x.errorImprove) : 0, lowErrorMaintained: !!x.lowErrorMaintained };
  if (auto.retrievalCount) { m.retrieval = auto.retrieval; m.retrievalCount = auto.retrievalCount; }
  if (auto.errorCount) { m.errorImprove = auto.errorImprove; m.lowErrorMaintained = auto.lowErrorMaintained; }
  return m;
}
function v158ScoreMonth(month) {
  const h = v158EffectiveMonthSeconds(month) / 3600, t = v158AdjustedTimeThresholds(month), m = v158Metric(month), err = m.lowErrorMaintained ? 25 : m.errorImprove;
  const timeScore = h >= t.s ? 35 : h >= t.a ? 31 : h >= t.b ? 27 : h >= Math.max(0, 110 - t.reduction) ? 20 : 10;
  const copScore = m.cop >= 100 ? 25 : m.cop >= 95 ? 23 : m.cop >= 85 ? 19 : m.cop >= 70 ? 13 : 6;
  const retScore = m.retrieval >= 88 ? 25 : m.retrieval >= 82 ? 22 : m.retrieval >= 75 ? 18 : m.retrieval >= 68 ? 12 : 6;
  const errScore = err >= 25 ? 15 : err >= 15 ? 12 : err >= 0 ? 9 : 0, total = timeScore + copScore + retScore + errScore;
  let grade = 'C';
  if (total >= 90 && h >= t.s && m.cop >= 100 && m.retrieval >= 88 && err >= 25) grade = 'S';
  else if (total >= 80 && h >= t.a && m.cop >= 95 && m.retrieval >= 82 && err >= 15) grade = 'A';
  else if (total >= 70 && h >= t.b && m.cop >= 85 && m.retrieval >= 75 && err >= 0) grade = 'B';
  if (m.retrievalCount < 8 && (grade === 'S' || grade === 'A')) grade = 'B';
  const sleep = v158MonthSleepStats(month);
  if (grade === 'S' && sleep.count >= 14 && sleep.avgMin < 420) grade = 'A';
  return { grade, total, timeScore, copScore, retScore, errScore, h, t, m, err, sleep, tokens: grade === 'S' ? 3 : grade === 'A' ? 2 : grade === 'B' ? 1 : 0 };
}
const v158GradeAction = g => g === 'S' ? '维持方案，不给下月加码。' : g === 'A' ? '维持原方案，这是长期理想常态。' : g === 'B' ? '做 30 分钟诊断；下月新内容量最多下调 5%。' : '做 60 分钟根因分析；下月新内容量下调 10%，执行 14 天针对性修正。';
function v158SetMonthlyMetrics(month, cop, retrieval, retrievalCount, errorImprove, lowErrorMaintained) { LS.lifePolicy.monthlyMetrics[month] = { cop: Math.max(0, Number(cop) || 0), retrieval: Math.max(0, Number(retrieval) || 0), retrievalCount: Math.max(0, Math.round(Number(retrievalCount) || 0)), errorImprove: Number(errorImprove) || 0, lowErrorMaintained: !!lowErrorMaintained, updatedAt: v170Stamp() }; persistLearningState(); renderLearningAll(); }
function v158SettleMonth(month) { const r = v158ScoreMonth(month); LS.lifePolicy.settlements[month] = { grade: r.grade, tokens: r.tokens, total: r.total, settledAt: v170Stamp() }; persistLearningState(); renderLearningAll(); v156Toast(`✓ ${month} 已结算为 ${r.grade} 级月`, true); }
function v158TokenBalance() { return Object.values(LS.lifePolicy.settlements || {}).reduce((s, x) => s + Number(x?.tokens || 0), 0); }
function v158UseFlexLeave(k, reason = '') {
  if (!v150DateOk(k)) { alert('请选择有效日期。'); return; }
  if (v158IsWeeklyRestDay(k)) { alert('周六本来就是固定休息日，不消耗调休。'); return; }
  if (LS.lifePolicy.flex.used[k]) { alert('这一天已经使用调休。'); return; }
  if (LS.lifePolicy.flex.balance <= 0) { alert('当前没有可用调休余额。'); return; }
  LS.lifePolicy.flex.used[k] = { date: k, reason: String(reason || '').trim() || '调休', usedAt: v170Stamp() };
  LS.lifePolicy.flex.balance--; persistLearningState(); renderLearningAll(); v156Toast('✓ 调休已生效，不产生学习债', true);
}
function v158CancelFlexLeave(k) { if (!LS.lifePolicy.flex.used[k] || !confirm(`取消 ${k} 的调休？`)) return; delete LS.lifePolicy.flex.used[k]; LS.lifePolicy.flex.balance = Math.min(LS.lifePolicy.flex.cap, LS.lifePolicy.flex.balance + 1); persistLearningState(); renderLearningAll(); }
function v158InboxAdd(text) { text = String(text || '').trim(); if (!text) return; LS.lifePolicy.restInbox.unshift({ id: uuid(), text, createdAt: v170Stamp() }); LS.lifePolicy.restInbox = LS.lifePolicy.restInbox.slice(0, 30); persistLearningState(); renderLearningAll(); }
function v158InboxRemove(id) { LS.lifePolicy.restInbox = LS.lifePolicy.restInbox.filter(x => x.id !== id); persistLearningState(); renderLearningAll(); }

/* ===== 燃尽图 ===== */
const BURNDOWN_TRACKS = {
  english1: { label: '英语词汇 · 第一轮', short: '英语一轮', total: ENGLISH_LESSON_TOTAL, start: '2026-10-13', unit: 'Lesson', map: () => LS.english.round1 },
  english2: { label: '英语词汇 · 第二轮', short: '英语二轮', total: ENGLISH_LESSON_TOTAL, start: () => burndownRound2Start(), unit: 'Lesson', map: () => LS.english.round2 },
  skills: { label: '英语四级 · 技巧课', short: '四级技巧', total: () => ENGLISH_SKILLS.length, start: () => burndownEarliestCompletion(LS.english.skills) || '2026-10-13', unit: '节', map: () => LS.english.skills },
  finance: { label: '财经综合 · 80任务', short: '财经', total: 80, start: () => burndownEarliestCompletion(LS.finance.completions) || LEARNING_CONFIG.resumeDate, unit: '任务', map: () => LS.finance.completions },
  math: { label: '高数 · 48计划日', short: '高数', total: 48, start: () => burndownEarliestCompletion(LS.math.completions) || LEARNING_CONFIG.resumeDate, unit: '计划日', map: () => LS.math.completions }
};
const bdDate = v => typeof v === 'function' ? v() : v, bdNum = v => Number(typeof v === 'function' ? v() : v) || 0;
function burndownCompletionDates(map) { return Object.values(map || {}).map(learningEntryDate).filter(v150DateOk).sort(); }
function burndownEarliestCompletion(map) { return burndownCompletionDates(map)[0] || ''; }
function burndownRound2Start() { const a = burndownCompletionDates(LS.english.round1); return englishRound1Complete() && a.length ? addDaysKey(a[a.length - 1], 1) : ''; }
function burndownTarget(key) { const saved = String(LS.burndown?.targets?.[key] || ''); if (v150DateOk(saved)) return saved; if ((key === 'english2' || key === 'skills') && englishContentDeadline()) return englishContentDeadline(); return ''; }
function burndownTrack(key) { const c = BURNDOWN_TRACKS[key] || BURNDOWN_TRACKS.english1; return { ...c, total: bdNum(c.total), start: bdDate(c.start), map: c.map() }; }
function burndownActualPoints(track, today = learningTodayKey()) {
  const dates = burndownCompletionDates(track.map).filter(k => k <= today), counts = {}; dates.forEach(k => { counts[k] = (counts[k] || 0) + 1; });
  const start = track.start || burndownEarliestCompletion(track.map) || today; let rem = track.total; const out = [{ date: start, remaining: track.total }];
  Object.keys(counts).sort().forEach(k => { if (k < start) return; rem = Math.max(0, rem - counts[k]); out.push({ date: k, remaining: rem }); });
  if (out[out.length - 1].date !== today) out.push({ date: today, remaining: Math.max(0, track.total - dates.length) }); else out[out.length - 1].remaining = Math.max(0, track.total - dates.length);
  return out;
}
function burndownObservedStats(track) {
  const today = learningTodayKey(), start = track.start || burndownEarliestCompletion(track.map) || today, windowStart = addDaysKey(today, -6), obsStart = start > windowStart ? start : windowStart;
  const days = Math.max(1, dayDiff(parse(today), parse(obsStart)) + 1), recent = burndownCompletionDates(track.map).filter(k => k >= obsStart && k <= today).length;
  return { days, recent, weekly: recent / days * 7 };
}
function burndownForecast(track) {
  const done = learningDoneCount(track.map), remaining = Math.max(0, track.total - done), stats = burndownObservedStats(track), today = learningTodayKey();
  if (!remaining) return { date: today, stats };
  if (stats.recent <= 0 || stats.days < 3) return { date: '', stats };
  return { date: addDaysKey(today, Math.ceil(remaining / (stats.recent / stats.days))), stats };
}
function burndownPlannedRemaining(track, target, date = learningTodayKey()) {
  if (!track.start || !v150DateOk(track.start) || !target || !v150DateOk(target) || target <= track.start) return null;
  if (date <= track.start) return track.total; if (date >= target) return 0;
  return Math.max(0, track.total * (1 - Math.max(0, dayDiff(parse(date), parse(track.start))) / Math.max(1, dayDiff(parse(target), parse(track.start)))));
}
function burndownStatus(track, target, forecast) {
  const rem = Math.max(0, track.total - learningDoneCount(track.map)); if (!rem) return { label: '已燃尽', cls: 'green', detail: '这一阶段已经全部完成。' };
  const plan = burndownPlannedRemaining(track, target); if (plan === null) return { label: '持续推进', cls: 'blue', detail: '未设置目标日，仅展示真实进度与速度。' };
  if (forecast.date && target && forecast.date > target) return { label: '可能影响目标', cls: 'red', detail: `按近 7 日速度，预计 ${forecast.date} 完成。` };
  const diff = rem - plan;
  return diff <= -0.75 ? { label: '领先', cls: 'green', detail: `比基准线多完成约 ${Math.max(1, Math.round(-diff))} ${track.unit}。` } : diff >= 0.75 ? { label: '需要调整', cls: 'orange', detail: `比基准线少完成约 ${Math.max(1, Math.round(diff))} ${track.unit}。` } : { label: '正常', cls: 'blue', detail: '实际进度基本贴着基准线。' };
}
function burndownSvg(track, target, forecast) {
  const today = learningTodayKey(), start = track.start || burndownEarliestCompletion(track.map) || today, actual = burndownActualPoints(track, today);
  let end = today; for (const k of [target, forecast.date]) if (v150DateOk(k) && k > end) end = k;
  if (dayDiff(parse(end), parse(start)) < 7) end = addDaysKey(start, 7); if (dayDiff(parse(end), parse(start)) > 365) end = addDaysKey(start, 365);
  const W = 760, Hh = 280, L = 52, Rr = 18, Tt = 18, B = 40, plotW = W - L - Rr, plotH = Hh - Tt - B, totalDays = Math.max(1, dayDiff(parse(end), parse(start))), maxY = Math.max(1, track.total);
  const x = k => L + Math.max(0, Math.min(totalDays, dayDiff(parse(k), parse(start)))) / totalDays * plotW, y = v => Tt + (1 - Math.max(0, Math.min(maxY, v)) / maxY) * plotH;
  const poly = pts => pts.map(p => `${x(p.date).toFixed(1)},${y(p.remaining).toFixed(1)}`).join(' ');
  const grid = [0, .25, .5, .75, 1].map(f => { const yy = y(maxY * f); return `<line x1="${L}" y1="${yy}" x2="${W - Rr}" y2="${yy}" stroke="var(--line-soft)" stroke-width="1"/><text x="${L - 9}" y="${yy + 3}" text-anchor="end" font-size="10" fill="var(--muted)">${Math.round(maxY * f)}</text>`; }).join('');
  const base = (target && v150DateOk(target) && target > start) ? `<line x1="${x(start)}" y1="${y(track.total)}" x2="${x(target)}" y2="${y(0)}" stroke="var(--muted)" stroke-opacity="0.55" stroke-width="2"/>` : '';
  const actualLine = actual.length > 1 ? `<polyline points="${poly(actual)}" fill="none" stroke="var(--green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  const actualDots = actual.slice(1).map(p => `<circle cx="${x(p.date)}" cy="${y(p.remaining)}" r="3.2" fill="var(--green)"/>`).join('');
  const forecastLine = (forecast.date && v150DateOk(forecast.date) && forecast.date >= today) ? `<line x1="${x(today)}" y1="${y(Math.max(0, track.total - learningDoneCount(track.map)))}" x2="${x(forecast.date)}" y2="${y(0)}" stroke="var(--yellow)" stroke-width="2.5" stroke-dasharray="8 6"/>` : '';
  const ticks = [start, today, target].filter(v150DateOk).filter((v, i, a) => a.indexOf(v) === i).sort().map(k => `<line x1="${x(k)}" y1="${Hh - B}" x2="${x(k)}" y2="${Hh - B + 5}" stroke="var(--line-strong)"/><text x="${x(k)}" y="${Hh - 14}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${k.slice(5).replace('-', '/')}</text>`).join('');
  return `<svg class="burndown-chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(track.label)}燃尽图">${grid}<line x1="${L}" y1="${Tt}" x2="${L}" y2="${Hh - B}" stroke="var(--line-strong)"/><line x1="${L}" y1="${Hh - B}" x2="${W - Rr}" y2="${Hh - B}" stroke="var(--line-strong)"/>${base}${actualLine}${actualDots}${forecastLine}<line x1="${x(today)}" y1="${Tt}" x2="${x(today)}" y2="${Hh - B}" stroke="var(--line-strong)" stroke-dasharray="3 5"/>${ticks}<text x="${L}" y="12" font-size="10.5" fill="var(--muted)">剩余 ${esc(track.unit)}</text></svg>`;
}
function setBurndownTarget(key, value) { value = String(value || ''); if (value && !v150DateOk(value)) { alert('请选择有效目标日期。'); return; } LS.burndown.targets[key] = value; persistLearningState(); renderLearningAll(); }
function burndownInlineHtml(keys, title = '进度趋势与预计完成') {
  keys = Array.isArray(keys) && keys.length ? keys : ['english1']; let selected = String(LS.burndown?.selected || ''); if (!keys.includes(selected)) selected = keys[0];
  const track = burndownTrack(selected), target = burndownTarget(selected), done = learningDoneCount(track.map), remaining = Math.max(0, track.total - done), forecast = burndownForecast(track), status = burndownStatus(track, target, forecast), planned = burndownPlannedRemaining(track, target), pct = learningPct(done, track.total);
  const buttons = keys.length > 1 ? `<div class="subject-burndown-tabs">${keys.map(k => `<button class="btn sm ${k === selected ? 'active' : ''}" type="button" data-inline-bd-track="${k}">${esc(BURNDOWN_TRACKS[k].short)}</button>`).join('')}</div>` : '';
  return `<div class="learning-section-card"><details class="subject-burndown" open><summary><span>${esc(title)}</span><span class="learning-chip ${status.cls}">${status.label}</span></summary><div class="subject-burndown-body">${buttons}<div class="burndown-metrics"><div class="burndown-metric"><small>剩余</small><b>${remaining} / ${track.total}</b><span>已完成 ${pct}%</span></div><div class="burndown-metric"><small>基准今日应剩</small><b>${planned === null ? '—' : Math.max(0, Math.round(planned))}</b><span>${target ? `目标 ${target}` : '未设置目标日'}</span></div><div class="burndown-metric"><small>近 7 日速度</small><b>${forecast.stats.days ? `${forecast.stats.weekly.toFixed(forecast.stats.weekly >= 10 ? 0 : 1)} ${track.unit}/周` : '—'}</b><span>只看真实完成记录</span></div><div class="burndown-metric"><small>预计完成</small><b>${remaining === 0 ? '已完成' : (forecast.date || '积累 3 天后预测')}</b><span>${status.detail}</span></div></div><div class="burndown-chart-wrap">${burndownSvg(track, target, forecast)}</div><div class="burndown-legend"><span><i class="burndown-dot base"></i>固定基准</span><span><i class="burndown-dot actual"></i>真实进度</span><span><i class="burndown-dot forecast"></i>动态预测</span></div><div class="burndown-settings"><label><span>目标完成日（可留空）</span><input id="inlineBdTargetDate" type="date" value="${target || ''}"></label><button class="btn primary" id="saveInlineBdTarget" type="button">保存目标日</button></div></div></details></div>`;
}
function bindInlineBurndown(keys) {
  keys = Array.isArray(keys) && keys.length ? keys : ['english1']; let selected = String(LS.burndown?.selected || ''); if (!keys.includes(selected)) selected = keys[0];
  document.querySelectorAll('[data-inline-bd-track]').forEach(b => { b.onclick = () => { LS.burndown.selected = b.dataset.inlineBdTrack; persistLearningState(); renderLearningAll(); }; });
  const save = $('#saveInlineBdTarget'); if (save) save.onclick = () => setBurndownTarget(selected, $('#inlineBdTargetDate').value);
}

/* ===== V1.7.0 项目 / 生活 / 节奏 / 报告 / 修复后的全局搜索 ===== */
function v170ProjectById(id) { return LS.v170.projects.find(p => p.id === id); }
function v170AddProject(name, kind, deadline, note) { name = String(name || '').trim(); if (!name) { alert('请填写项目名称。'); return; } const stamp = v170Stamp(); LS.v170.projects.unshift(v170NormalizeProject({ id: uuid(), name, kind, deadline, note, createdAt: stamp, updatedAt: stamp })); persistLearningState(); renderLearningAll(); v156Toast('✓ 项目已创建', true); }
function v170UpdateProject(id, name, kind, deadline, status, note) { const p = v170ProjectById(id); if (!p) return; p.name = String(name || p.name).trim() || p.name; p.kind = String(kind || p.kind); p.deadline = v150DateOk(deadline) ? deadline : ''; p.status = ['active', 'paused', 'done'].includes(status) ? status : p.status; p.note = String(note || ''); p.updatedAt = v170Stamp(); persistLearningState(); renderLearningAll(); }
function v170DeleteProject(id) { const p = v170ProjectById(id); if (!p || !confirm(`删除项目“${p.name}”？`)) return; v160CreateSafetyBackup('删除项目前', true); LS.v170.tombstones.projects = [id, ...LS.v170.tombstones.projects.filter(x => x !== id)].slice(0, 500); LS.v170.projects = LS.v170.projects.filter(x => x.id !== id); persistLearningState(); renderLearningAll(); }
function v170AddMilestone(pid, title, dueDate) { title = String(title || '').trim(); if (!title) return; const p = v170ProjectById(pid); if (!p) return; p.milestones.unshift({ id: uuid(), title, dueDate: v150DateOk(dueDate) ? dueDate : '', done: false, doneAt: '', updatedAt: v170Stamp() }); p.updatedAt = v170Stamp(); persistLearningState(); renderLearningAll(); }
function v170ToggleMilestone(pid, mid, done) { const p = v170ProjectById(pid), m = p?.milestones.find(x => x.id === mid); if (!m) return; m.done = !!done; m.doneAt = done ? v170Stamp() : ''; m.updatedAt = v170Stamp(); p.updatedAt = v170Stamp(); persistLearningState(); renderLearningAll(); }
function v170DeleteMilestone(pid, mid) { const p = v170ProjectById(pid); if (!p) return; LS.v170.tombstones.milestones = [mid, ...LS.v170.tombstones.milestones.filter(x => x !== mid)].slice(0, 1000); p.milestones = p.milestones.filter(x => x.id !== mid); p.updatedAt = v170Stamp(); persistLearningState(); renderLearningAll(); }
function v170AddProjectLog(pid, date, minutes, note) { const p = v170ProjectById(pid); minutes = Math.max(0, Math.round(Number(minutes) || 0)); note = String(note || '').trim(); if (!p || !v150DateOk(date) || (!minutes && !note)) { alert('请填写日期，并至少填写分钟数或记录内容。'); return; } p.logs.unshift({ id: uuid(), date, minutes, note, createdAt: v170Stamp(), updatedAt: v170Stamp() }); p.logs = p.logs.slice(0, 500); p.updatedAt = v170Stamp(); persistLearningState(); renderLearningAll(); v156Toast('✓ 项目投入已记录（不计入专转本核心时长）', true); }
function v170DeleteProjectLog(pid, lid) { const p = v170ProjectById(pid); if (!p) return; LS.v170.tombstones.logs = [lid, ...LS.v170.tombstones.logs.filter(x => x !== lid)].slice(0, 1000); p.logs = p.logs.filter(x => x.id !== lid); p.updatedAt = v170Stamp(); persistLearningState(); renderLearningAll(); }
function v170ProjectMinutes(p, start = '', end = '') { return (p.logs || []).filter(x => (!start || x.date >= start) && (!end || x.date <= end)).reduce((n, x) => n + Number(x.minutes || 0), 0); }
function v170LifeRecord(k = learningTodayKey()) { const x = LS.v170.life.checkins[k]; return x && typeof x === 'object' ? x : { date: k, move: false, outdoors: false, social: false, hobby: false, happiness: 0, note: '' }; }
function v170SaveLife(k, data) { LS.v170.life.checkins[k] = { date: k, move: !!data.move, outdoors: !!data.outdoors, social: !!data.social, hobby: !!data.hobby, happiness: Math.max(0, Math.min(5, Number(data.happiness) || 0)), note: String(data.note || ''), updatedAt: v170Stamp() }; persistLearningState(); renderLearningAll(); v156Toast('✓ 生活记录已保存（不参与学习评级）', true); }
function v170RecentKeys(days = 7) { const out = [], d = learningTodayDate(); for (let i = days - 1; i >= 0; i--) { const x = new Date(d); x.setDate(x.getDate() - i); out.push(fmt(x)); } return out; }
function v170Adaptive() {
  const today = learningTodayKey(), keys = v170RecentKeys(7), sleep = keys.map(k => LS.sleep?.records?.[k]).filter(Boolean);
  const avgSleep = sleep.length ? sleep.reduce((n, x) => n + sleepDurationMin(x), 0) / sleep.length : 0, short = sleep.filter(x => sleepDurationMin(x) < 360).length;
  const heavy = keys.filter(k => v158EffectiveSecondsBetween(k, k) >= 270 * 60).length, week = v158EffectiveWeekSeconds() / 3600, target = v158ScheduledWeekMinutes() / 60;
  const q = v160QualityMonthStats(today.slice(0, 7)), manual = energyFor(today), rest = v158IsProtectedRestDay(today);
  let mode = 'normal', title = '标准推进', tab = 'today'; const reasons = [];
  if (rest) { mode = 'rest'; title = v158IsWeeklyRestDay(today) ? '完整休息' : '合法调休'; tab = 'policy'; reasons.push('今天本来就是 0 小时目标，不需要额外证明自律。'); }
  else if (manual === 'low' || (sleep.length >= 3 && avgSleep < 390) || short >= 2 || heavy >= 5) {
    mode = 'low'; title = '恢复优先 · 低负荷'; tab = 'review';
    if (manual === 'low') reasons.push('你今天已经手动选择低负荷模式。');
    if (sleep.length >= 3 && avgSleep < 390) reasons.push(`近 7 天已记录睡眠平均 ${sleepHuman(avgSleep)}，先保护恢复。`);
    if (short >= 2) reasons.push(`近 7 天有 ${short} 晚不足 6 小时。`);
    if (heavy >= 5) reasons.push(`近 7 天有 ${heavy} 天核心有效学习达到 4.5 小时以上，连续负荷偏高。`);
  } else if (q.retrievalCount >= 2 && q.retrieval < 75) { mode = 'quality'; title = '质量优先 · 少加新内容'; tab = 'quality'; reasons.push(`本月有效延迟提取均分 ${q.retrieval.toFixed(0)}%，当前更值得处理“记不住”。`); }
  else { reasons.push(`本周核心有效学习 ${week.toFixed(1)}h / 排程 ${target.toFixed(1)}h。`); if (sleep.length) reasons.push(`近 7 天已记录睡眠平均 ${sleepHuman(avgSleep)}。`); reasons.push('没有触发明显恢复风险信号，按正常节奏推进即可。'); }
  return { mode, title, tab, reasons, avgSleep, sleepN: sleep.length, short, heavy, week, target, q };
}
function v170ReportData(type) {
  let a, b, label;
  if (type === 'week') { [a, b] = studyWeekRange(); label = `${a} — ${b} 周报告`; }
  else { const m = learningTodayKey().slice(0, 7), [y, mo] = m.split('-').map(Number); a = `${m}-01`; b = fmt(new Date(y, mo, 0, 12)); label = `${m} 月报告`; }
  const sec = v158EffectiveSecondsBetween(a, b); let scheduled = 0; for (const d = parse(a), e = parse(b); d <= e; d.setDate(d.getDate() + 1)) scheduled += v158DailyTargetMin(fmt(d));
  const by = {}; for (const sub of ['英语', '财经', '高数']) by[sub] = (LS.studyTimer.sessions || []).filter(x => sessionDate(x) >= a && sessionDate(x) <= b && x.subject === sub && v158SessionCounts(x)).reduce((n, x) => n + Number(x.focusSeconds || 0), 0);
  const sleepArr = Object.values(LS.sleep?.records || {}).filter(r => r?.date >= a && r?.date <= b), sleep = { n: sleepArr.length, avg: sleepArr.length ? sleepArr.reduce((n, r) => n + sleepDurationMin(r), 0) / sleepArr.length : 0, good: sleepArr.filter(r => sleepDurationMin(r) >= 420).length };
  const q = LS.quality, r = q.retrievalTests.filter(x => x.testDate >= a && x.testDate <= b && v160RetrievalValid(x)), er = q.errorChecks.filter(x => x.date >= a && x.date <= b && v160ErrorValid(x));
  const quality = { r, er, retrieval: r.length ? r.reduce((n, x) => n + Number(x.score), 0) / r.length : 0, error: er.length ? er.reduce((n, x) => n + v160ErrorImprove(x), 0) / er.length : 0 };
  const life = Object.values(LS.v170.life.checkins || {}).filter(x => x?.date >= a && x?.date <= b), projects = LS.v170.projects.reduce((n, p) => n + v170ProjectMinutes(p, a, b), 0), ratio = scheduled ? sec / (scheduled * 60) : 0;
  let next = '保持当前节奏，不需要为了追求 S 额外加码。';
  if (sleep.n >= 3 && sleep.avg < 420) next = '优先把睡眠和恢复拉回稳定，再考虑增加新内容。';
  else if (quality.r.length >= 2 && quality.retrieval < 75) next = '减少单纯输入，把更多时间放到延迟提取、错题重做和闭卷回忆。';
  else if (ratio < 0.8) next = '先检查拖延、学校事务或计划是否过重，不要用下周爆肝偿还“学习债”。';
  const text = `# ${label}\n\n学习投入\n- 核心有效学习：${(sec / 3600).toFixed(1)}h / 排程 ${(scheduled / 60).toFixed(1)}h（${Math.round(ratio * 100)}%）\n- 英语 ${(by['英语'] / 3600).toFixed(1)}h · 财经 ${(by['财经'] / 3600).toFixed(1)}h · 高数 ${(by['高数'] / 3600).toFixed(1)}h\n\n学习质量\n- 有效延迟提取：${quality.r.length} 次${quality.r.length ? `，均分 ${quality.retrieval.toFixed(0)}%` : ''}\n- 同难度错误率对照：${quality.er.length} 次${quality.er.length ? `，平均改善 ${quality.error.toFixed(1)}%` : ''}\n\n恢复与生活\n- 睡眠记录：${sleep.n} 晚${sleep.n ? `，平均 ${sleepHuman(sleep.avg)}，≥7h ${sleep.good} 晚` : ''}\n- 生活记录：${life.length} 天（不参与学习评级）\n- 其他成长项目投入：${(projects / 60).toFixed(1)}h（不计入专转本核心时长）\n\n下一步\n${next}`;
  return { a, b, label, text };
}
function v170SearchAll(q, type = 'all') {
  q = String(q || '').trim().toLowerCase(); if (!q) return [];
  const out = [], add = (t, date, title, detail, tab = 'today', jumpSide = '') => { if ((type === 'all' || type === t) && `${title} ${detail} ${date} ${t}`.toLowerCase().includes(q)) out.push({ t, date, title, detail, tab, jumpSide }); };
  for (const [date, arr] of Object.entries(T || {})) for (const x of (Array.isArray(arr) ? arr : [])) add('任务', date, x.text || '任务', `${pLabel(x.priority || 'medium')}优先级`, 'today', 'tasks');
  for (const x of LS.studyTimer.sessions || []) add('学习', sessionDate(x), `${x.subject} · ${secHuman(x.focusSeconds)}`, x.note || '', 'stats');
  for (const x of LS.quality?.retrievalTests || []) add('质量', x.testDate, `${x.subject} · 延迟提取 ${x.score}%`, x.note || '', 'quality');
  for (const x of LS.quality?.errorChecks || []) add('质量', x.date, `${x.subject} · 错误率 ${x.before}%→${x.after}%`, x.note || '', 'quality');
  for (const x of LS.freeLogs || []) add('学习', x.date, `${x.track || '学习'} · 自主记录`, x.text || '', 'today');
  for (const p of LS.v170.projects) {
    add('项目', p.deadline || '', p.name, p.note || '', 'projects');
    for (const m of p.milestones) add('项目', m.dueDate || '', `${p.name} · ${m.title}`, m.done ? '已完成' : '未完成', 'projects');
    for (const l of p.logs) add('项目', l.date, `${p.name} · ${l.minutes || 0}分钟`, l.note || '', 'projects');
  }
  const reflectLabels = { q1: '做错了什么', q2: '做对了什么', q3: '明天怎么做得更好', wrong: '做错了什么', right: '做对了什么', better: '怎么做得更好' };
  for (const [date, r] of Object.entries(R || {})) { if (!r) continue; for (const k of ['q1', 'q2', 'q3', 'wrong', 'right', 'better']) if ((r[k] || '').trim()) add('复盘', date, reflectLabels[k], r[k].trim(), 'today', 'reflect'); }
  return out.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 100);
}

/* ===== 首页行动卡 & 学习管理 18 栏目渲染器 ===== */
function v160NextAction() {
  const k = learningTodayKey();
  if (v158IsWeeklyRestDay(k)) return { title: '今天休息，不需要学习', meta: '周六 0 小时目标。把恢复、约会、运动和生活认真过好。', tab: 'policy', button: '查看休息制度' };
  if (v158IsFlexLeaveDay(k)) return { title: '今天是合法调休日', meta: '被取消的学习时数不会形成学习债。', tab: 'policy', button: '查看调休' };
  if (LS.studyTimer.active) return { title: `继续 ${LS.studyTimer.active.subject} 计时`, meta: `当前已累计 ${secHuman(activeStudyFocusSeconds())}，先把这一段做完。`, tab: 'timer', button: '继续计时' };
  const due = dueReviews();
  if (due.length) return { title: `先做：${due[0].track} · ${due[0].title}`, meta: `有 ${due.length} 项到期复习。先做一次主动提取，再看答案。`, tab: 'review', button: '开始复习' };
  const todayItems = learningCompletionItemsOnDate(k);
  const r1today = Object.values(LS.english.round1 || {}).some(v => learningEntryDate(v) === k);
  const r2today = Object.values(LS.english.round2 || {}).some(v => learningEntryDate(v) === k);
  const nextR1 = nextEnglishLesson(LS.english.round1), nextR2 = nextEnglishLesson(LS.english.round2);
  if (nextR1 && !r1today) return { title: `英语：${englishLessonLabel(nextR1)}`, meta: '今天只计划 1 个新 Lesson；完成后不自动加第 2 个。', tab: 'english', button: '打开英语' };
  if (!nextR1 && nextR2 && !r2today) return { title: `英语二轮：${englishLessonLabel(nextR2)}`, meta: '二轮同样按当天计划推进，不用追时长。', tab: 'english', button: '打开英语' };
  if (!v159ReadingVocab(k).done) return { title: '英语：阅读精读 + 高价值生词', meta: '只收影响理解、反复出现、高频词和固定搭配。', tab: 'today', button: '打开今日学习' };
  const fd = nextFinanceDay(), md = nextMathDay();
  if (!isLearningBusyKey(k) && formalAdvanceAllowed(k) && fd) return { title: `财经：原 Day ${fd}`, meta: `${financeItem(fd)?.subject || ''} · ${financeItem(fd)?.title || ''}`, tab: 'finance', button: '打开财经' };
  if (!isLearningBusyKey(k) && formalAdvanceAllowed(k) && md) return { title: `高数：Day ${md}`, meta: '按当天真实状态推进；疲劳时允许降档。', tab: 'math', button: '打开高数' };
  return { title: '今天的核心任务已基本收尾', meta: todayItems.length ? '可以做轻量复习，达到时长后安心休息。' : '从最重要的一项开始，不需要同时打开所有任务。', tab: 'today', button: '打开今日学习' };
}

function renderV160TodayCommand() {
  const e = $('#v160TodayCommandBody'), stat = $('#v160CommandStat'); if (!e || !stat) return;
  const selected = fmt(sel), today = learningTodayKey();
  if (selected !== today) {
    stat.textContent = '';
    e.innerHTML = `<div class="v160-command-card"><h4>正在查看 ${selected}</h4><p>“现在做什么”只对今天给行动建议，避免把未来计划提前变成压力。</p><div class="v160-command-actions"><button class="btn full-span" id="v160BackToday" type="button">回到今天</button></div></div>`;
    $('#v160BackToday').onclick = () => $('#todayBtn').click();
    return;
  }
  const rest = v158IsProtectedRestDay(today), target = v158DailyTargetMin(today) * 60, done = v158EffectiveTodaySeconds();
  const pct = target ? Math.min(100, Math.round(done / target * 100)) : 100, a = v160NextAction(), rhythm = v170Adaptive();
  stat.textContent = rest ? '休息日' : `${secHuman(done)} / ${target ? secHuman(target) : '0分钟'}`;
  e.innerHTML = `<div class="v160-command-card"><div class="learning-row spread"><div><h4>${esc(a.title)}</h4><p>${esc(a.meta)}</p></div><span class="learning-chip ${rest ? 'green' : 'blue'}">${rest ? '0h 目标' : pct + '%'}</span></div><div class="v160-command-progress"><i style="width:${pct}%"></i></div><div class="v160-command-actions"><button class="btn primary" id="v160OpenNext" type="button">${esc(a.button)}</button>${!rest ? '<button class="btn" id="v160OpenTimer" type="button">开始计时</button>' : '<button class="btn" id="v160OpenLife" type="button">记录生活</button>'}<button class="btn" id="v160OpenQuality" type="button">记录质量</button><button class="btn" id="v170RhythmShortcut" type="button">节奏：${esc(rhythm.title.split('·')[0].trim())}</button></div></div>`;
  $('#v160OpenNext').onclick = () => openLearning(a.tab);
  if ($('#v160OpenTimer')) $('#v160OpenTimer').onclick = () => openLearning('timer');
  if ($('#v160OpenLife')) $('#v160OpenLife').onclick = () => openLearning('life');
  $('#v160OpenQuality').onclick = () => openLearning('quality');
  $('#v170RhythmShortcut').onclick = () => openLearning('rhythm');
}

function renderLearningMini() {
  const e = $('#learningMini'); if (!e) return;
  const k = fmt(sel);
  if (v158IsWeeklyRestDay(k) || v158IsFlexLeaveDay(k)) {
    const rest = v158IsWeeklyRestDay(k);
    e.innerHTML = `<div class="learning-mini-status"><span class="learning-chip green">${rest ? '完全休息日' : '调休'}</span></div><div class="learning-mini-line"><b>${rest ? '周六固定周休' : '合法调休日'}</b> · 0 小时强制目标 · 不产生学习债</div>`;
    $('#learningMiniStat').textContent = '休息'; return;
  }
  const isToday = k === learningTodayKey(), items = learningCompletionItemsOnDate(k), mil = isMilitaryKey(k), busy = isLearningBusyKey(k), cds = learningCountdownsOnDate(k), chips = [];
  if (cds.length) chips.push(`<span class="learning-chip blue">⌛ ${esc(cds[0].title)}${cds.length > 1 ? ` +${cds.length - 1}` : ''}</span>`);
  if (mil) chips.push('<span class="learning-chip orange">军训弹性保护</span>');
  if (busy) chips.push('<span class="learning-chip red">缓冲日</span>');
  if (items.length) chips.push(`<span class="learning-chip green">完成 ${items.length} 项</span>`);
  if (isToday && LS.studyTimer.active) chips.push(`<span class="learning-chip green">计时 · ${esc(LS.studyTimer.active.subject)}</span>`);
  let lines = cds.map(x => `<div class="learning-mini-line"><b>${esc(x.kind || '考试')}</b> · ${esc(x.title)} · ${countdownLabel(x)}</div>`).join('');
  if (items.length) { lines += items.slice(0, 4).map(x => `<div class="learning-mini-line">✓ ${esc(x)}</div>`).join(''); if (items.length > 4) lines += `<div class="learning-source-note">还有 ${items.length - 4} 项记录。</div>`; }
  else if (isToday) {
    const r1 = nextEnglishLesson(LS.english.round1), sb = currentSkillPlanBlock(), fd = nextFinanceDay(), md = nextMathDay(), rv = v159ReadingVocab(k);
    lines += `<div class="learning-mini-line"><b>英语</b> · ${r1 ? englishLessonLabel(r1) : `二轮 ${englishDoneCount(LS.english.round2)}/${ENGLISH_LESSON_TOTAL}`} · ${sb ? `技巧 Day ${sb.day}` : '技巧完成'} · 精读 ${rv.done ? '✓' : '待做'}</div>`;
    if (!busy && formalAdvanceAllowed(k)) lines += `<div class="learning-mini-line"><b>${mil ? '可选推进' : '今日队列'}</b> · 财经 ${fd ? `原 Day ${fd}` : '已完成'} · 高数 ${md ? `Day ${md}` : '已完成'}</div>`;
  } else if (!cds.length) lines = '<div class="learning-empty">动态计划根据实时进度生成，此处显示该日已完成记录。</div>';
  e.innerHTML = `<div class="learning-mini-status">${chips.join('') || '<span class="learning-chip">动态队列</span>'}</div>${lines}`;
  $('#learningMiniStat').textContent = items.length ? `${items.length} 项` : '';
}

function renderLearningOverview() {
  if (!$('#learnEnglishMetric')) return;
  const r1 = englishDoneCount(LS.english.round1), r2 = englishDoneCount(LS.english.round2), sk = learningDoneCount(LS.english.skills), n1 = nextEnglishLesson(LS.english.round1), sb = currentSkillPlanBlock();
  $('#learnEnglishMetric').textContent = `${r1}/${ENGLISH_LESSON_TOTAL} · ${sk}/${ENGLISH_SKILLS.length}`;
  $('#learnEnglishBar').style.width = `${learningPct(r1 + sk, ENGLISH_LESSON_TOTAL + ENGLISH_SKILLS.length)}%`;
  $('#learnEnglishNote').textContent = `词汇一轮 ${n1 ? englishLessonLabel(n1) : '已完成'} · ${sb ? `技巧 Day ${sb.day}` : '技巧已完成'}${englishRound1Complete() ? ` · 二轮 ${r2}/${ENGLISH_LESSON_TOTAL}` : ''}`;
  const f = learningDoneCount(LS.finance.completions), m = learningDoneCount(LS.math.completions), fd = nextFinanceDay(), fp = fd ? financePhaseByPosition(financeExecPosition(fd)) : null;
  $('#learnFinanceMetric').textContent = `${f} / 80`; $('#learnFinanceBar').style.width = `${learningPct(f, 80)}%`; $('#learnFinanceNote').textContent = fd ? `${fp.name} · 下一项原 Day ${fd}` : '80 天全部完成';
  $('#learnMathMetric').textContent = `${m} / 48`; $('#learnMathBar').style.width = `${learningPct(m, 48)}%`; $('#learnMathNote').textContent = nextMathDay() ? `下一项 Day ${nextMathDay()}` : '48 天全部完成';
  const nearest = learningNearestCountdown();
  if (nearest) {
    const left = dayDiff(parse(nearest.date), learningTodayDate());
    $('#learnCountdownMetric').textContent = left > 0 ? `还有 ${left} 天` : left === 0 ? '今天' : (nearest.endDate && nearest.endDate >= learningTodayKey() ? '进行中' : '已结束');
    $('#learnCountdownNote').textContent = `${nearest.title} · ${countdownLabel(nearest)}`;
    $('#learnCountdownBar').style.width = `${left <= 0 ? 100 : left >= 60 ? 6 : Math.max(6, Math.round((1 - left / 60) * 100))}%`;
  } else { $('#learnCountdownMetric').textContent = '暂无'; $('#learnCountdownNote').textContent = '可在“倒数日”中添加'; $('#learnCountdownBar').style.width = '0%'; }
  const w = v158EffectiveWeekSeconds(), target = v158ScheduledWeekMinutes() * 60;
  $('#learnStudyMetric').textContent = secHuman(w); $('#learnStudyBar').style.width = `${target ? Math.min(100, Math.round(w / target * 100)) : 0}%`;
  $('#learnStudyNote').textContent = `有效口径 · 目标 ${secHuman(target)} · 今天 ${secHuman(v158EffectiveTodaySeconds())}`;
}

function renderLearningBanner() {
  const e = $('#learningBanner'); if (!e) return;
  const k = learningTodayKey();
  if (v158IsWeeklyRestDay(k) || v158IsFlexLeaveDay(k)) {
    const rest = v158IsWeeklyRestDay(k);
    e.innerHTML = `<div><strong>${rest ? '今天是周六完全休息日' : '今天已使用调休'}</strong><div class="small">${rest ? '0 小时目标；固定周休不可储存。' : '今天取消的排程不会形成学习债。'}</div></div><div class="learning-row"><span class="learning-chip green">调休余额 ${LS.lifePolicy.flex.balance} 天</span><button class="btn sm" id="v158OpenPolicy" type="button">查看制度</button></div>`;
    $('#v158OpenPolicy').onclick = () => { activeLearningTab = 'policy'; renderLearningAll(); }; return;
  }
  const mil = isMilitaryKey(k), busy = isLearningBusyKey(k), nearest = learningNearestCountdown(), mode = energyFor(k);
  const title = mil ? '军训弹性保护期' : busy ? '今天已设为缓冲日' : `今日能量：${energyLabel(mode)}`;
  const desc = mil ? '10/12—10/25：英语照常；高数/财经可自愿推进正式 Day，不设每日欠账。' : busy ? '今天不强制推进正式队列；先保留最轻的复习。' : '提前完成就整体前移；临时忙就整体顺延。学习时间只记录真实专注。';
  e.innerHTML = `<div><strong>${title}</strong><div class="small">${desc}</div></div><div class="learning-row"><span class="learning-chip green">今日有效目标 ${v158DailyTargetMin(k) / 60}h</span>${nearest ? `<span class="learning-chip blue">${esc(nearest.title)} · ${learningCountdownText(nearest.date, nearest.endDate)}</span>` : ''}<button class="btn sm ${busy ? '' : 'learning-danger-btn'}" id="toggleBusyToday" type="button">${busy ? '恢复正常计划' : '今天很忙'}</button></div>`;
  $('#toggleBusyToday').onclick = () => toggleLearningBusy(k);
}

function ensureQuickTimerBar() {
  const panel = $('#learningPanel'); if (!panel) return;
  let q = $('#v155QuickTimer'); if (!q) { q = document.createElement('div'); q.id = 'v155QuickTimer'; panel.parentNode.insertBefore(q, panel); }
  const a = LS.studyTimer.active, sec = a ? activeStudyFocusSeconds() : todayStudySeconds();
  q.className = 'v155-quick-timer' + (a ? ' running' : '');
  q.innerHTML = `<div class="v155-quick-main"><b>${a ? `正在学习 · ${esc(a.subject)}` : '学习计时'}</b><small>${a ? (a.note ? esc(a.note) : '已先保存在本机，结束后立即同步') : `今天已记录 ${secHuman(todayStudySeconds())} · 高频入口`}</small></div><div class="v155-quick-time" id="v155QuickTime">${secHuman(sec)}</div><button class="btn ${a ? 'learning-danger-btn' : 'primary'}" id="v155QuickBtn" type="button">${a ? '结束并保存' : '打开计时'}</button>`;
  $('#v155QuickBtn').onclick = () => { if (LS.studyTimer.active) finishStudy(); else { activeLearningTab = 'timer'; renderLearningAll(); } };
}
function openLearning(tab = 'today') { activeLearningTab = tab; $('#learningModal').classList.add('show'); renderLearningAll(); if (sbUser) refreshCloudMeta(); }
function closeLearning() { $('#learningModal').classList.remove('show'); }
function renderLearningAll() { renderLearningOverview(); renderLearningBanner(); renderLearningPanel(); renderLearningMini(); renderV160TodayCommand(); }
function renderLearningPanel() {
  document.querySelectorAll('[data-learning-tab]').forEach(b => b.classList.toggle('active', b.dataset.learningTab === activeLearningTab));
  const map = { today: renderLearningToday, timer: renderLearningTimer, stats: renderLearningStats, quality: renderV160Quality, sleep: renderSleep, policy: renderV158Policy, rhythm: renderV170Rhythm, projects: renderV170Projects, reports: renderV170Reports, search: renderV170Search, life: renderV170Life, review: renderSpacedReviews, english: renderLearningEnglish, finance: renderLearningFinance, math: renderLearningMath, countdowns: renderLearningCountdowns, roadmap: renderRoadmap, schedule: renderLearningSchedule };
  (map[activeLearningTab] || renderLearningToday)();
  ensureQuickTimerBar();
}

function englishRoundListHtml(map, round) {
  return Array.from({ length: 10 }, (_, u) => u + 1).map(unit => {
    const arr = ENGLISH_VOCAB_LESSONS.filter(x => x.unit === unit), doneN = arr.filter(x => !!map[String(x.i)]).length;
    const rows = arr.map(x => { const v = map[String(x.i)], done = !!v; return `<label class="learning-item ${done ? 'done' : ''}"><input type="checkbox" data-en-r${round}="${x.i}" ${done ? 'checked' : ''}><div><div class="learning-item-title">Unit ${x.unit} · Lesson ${x.lesson}</div><div class="learning-item-meta">${esc(x.range)} · ${durationHuman(x.seconds)}${x.parts > 1 ? ` · 分 ${x.parts} 段：${esc(x.partNames.join('；'))}` : ''}${round === 2 ? ' · 二轮建议倍速 + 主动检索' : ''}</div></div><span class="learning-item-date">${done ? esc(learningEntryDate(v)) : ''}</span></label>`; }).join('');
    return `<div class="learning-module-title"><span>Unit ${unit}</span><span>${doneN}/4</span></div><div class="learning-item-list">${rows}</div>`;
  }).join('');
}

function renderLearningToday() {
  const k = learningTodayKey(), d = learningTodayDate(), e = $('#learningPanel');
  if (v158IsWeeklyRestDay(k) || v158IsFlexLeaveDay(k)) {
    const rest = v158IsWeeklyRestDay(k), inbox = LS.lifePolicy.restInbox || [];
    e.innerHTML = `<div class="v158-rest-hero"><span class="learning-chip green">${rest ? '固定周休' : '调休'}</span><h3>${rest ? '周六 · 完全休息日' : '调休日 · 合法休假'}</h3><p>${rest ? '今天没有任何强制学习任务，也没有“欠账”。约会、散步、运动、看电影、打游戏都可以；别用打卡维持焦虑。' : '今天原本的学习目标已经合法取消，不需要明天补回来。'}</p></div>
    <div class="learning-section-card"><h4>焦虑时不要“偷学”，先把念头放进 Inbox</h4><div class="v158-inline-form"><input id="v158InboxText" type="text" autocomplete="off" placeholder="例如：周日先做高数错题第3题"><button class="btn" id="v158InboxAdd" type="button">记下，今天不做</button></div>${inbox.length ? inbox.slice(0, 8).map(x => `<div class="v158-inbox-row"><span>${esc(x.text)}</span><button class="x" type="button" data-v158-inbox-remove="${x.id}">×</button></div>`).join('') : '<div class="learning-empty" style="margin-top:8px">Inbox 为空。很好，今天就去生活。</div>'}</div>
    <div class="learning-section-card"><h4>今天建议做什么</h4><div class="learning-status-box"><b>适合：</b>约会、户外、运动、朋友、兴趣、正常游戏、睡够。<br><b>不建议：</b>模拟考、学新章节、为了连续打卡背单词、刷备考焦虑视频、熬夜到凌晨。</div></div>`;
    $('#v158InboxAdd').onclick = () => v158InboxAdd($('#v158InboxText').value);
    document.querySelectorAll('[data-v158-inbox-remove]').forEach(b => { b.onclick = () => v158InboxRemove(b.dataset.v158InboxRemove); });
    return;
  }
  const mil = isMilitaryKey(k), busy = isLearningBusyKey(k), monday = d.getDay() === 1, mode = energyFor(k), r = learningReviewFor(k), todayItems = learningCompletionItemsOnDate(k), due = dueReviews(), free = LS.freeLogs.filter(x => x.date === k), fd = nextFinanceDay(), md = nextMathDay(), nextR1 = nextEnglishLesson(LS.english.round1), nextR2 = nextEnglishLesson(LS.english.round2), block = currentSkillPlanBlock(), nearest = learningUpcomingCountdowns().slice(0, 3), rv = v159ReadingVocab(k), lesson = nextR1 ? englishLessonLabel(nextR1) : (nextR2 ? `二轮 ${englishLessonLabel(nextR2)}` : '词汇轮次已完成'), target = v158DailyTargetMin(k), core = v158EffectiveTodaySeconds();
  let tasks = [];
  if (nextR1) tasks.push({ rank: '核心', cls: 'core', title: `词汇一轮 · ${englishLessonLabel(nextR1)}`, meta: '计划量固定 1 个 Lesson；完成今天这一节就达标。', action: 'r1' });
  else if (nextR2) tasks.push({ rank: '核心', cls: 'core', title: `词汇二轮 · ${englishLessonLabel(nextR2)}`, meta: '第一轮完成后独立推进二轮。', action: 'r2' });
  if (block) tasks.push({ rank: '核心', cls: 'core', title: skillBlockLabel(block), meta: `${skillBlockLessonText(block)} · 技巧学习同时精读阅读题，只背高价值生词。`, action: 'skillpage', button: '去英语页' });
  if (monday && !r.weekly) tasks.push({ rank: '复习', cls: 'extra', title: '英语 · 一周总复习', meta: '保留周复习，同时照常推进当天新 Lesson。', action: 'weekly' });
  if (!busy && formalAdvanceAllowed(k)) {
    if (fd) tasks.push({ rank: mil ? '自选' : (mode === 'low' ? '可后移' : '核心'), cls: mil || mode === 'low' ? 'extra' : 'core', title: `财经 · 原 Day ${fd}${mil ? '（自愿推进）' : ''}`, meta: `${financeItem(fd)?.subject || ''} · ${financeItem(fd)?.title || ''}`, action: 'finance' });
    if (md && (mil || mode === 'high' || mode === 'normal')) tasks.push({ rank: mil ? '自选' : (mode === 'high' ? '核心' : '建议'), cls: mil || mode !== 'high' ? 'extra' : 'core', title: `高数 · Day ${md}${mil ? '（自愿推进）' : ''}`, meta: `${mathItem(md)?.lectures?.length || 0} 个视频 · ${durationHuman(mathDayDuration(mathItem(md)))}`, action: 'math' });
  }
  if (busy) tasks = tasks.filter(x => ['weekly', 'r1', 'r2', 'skillpage'].includes(x.action));
  if (!tasks.length) tasks.push({ rank: '完成', cls: 'extra', title: '今天没有必须推进的新内容', meta: '可以做复习、计时学习，或者直接休息。', action: '' });
  const taskHtml = tasks.map(x => `<div class="cockpit-task ${x.cls}"><span class="rank">${x.rank}</span><div><div class="cockpit-task-title">${esc(x.title)}</div><div class="cockpit-task-meta">${esc(x.meta)}</div></div>${x.action ? `<button class="btn sm" type="button" data-cockpit-action="${x.action}">${esc(x.button || '完成')}</button>` : ''}</div>`).join('');

  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>${d.getDay() === 0 ? '周日中等学习日' : '常规学习日'} · 今日有效时长</h4><div class="learning-source-note">只统计 CORE-DEEP / CORE-RETRIEVAL / ACTIVE-CLASS。达到目标后可安心休息与娱乐。</div></div><span class="learning-chip green">${secHuman(core)} / ${Math.floor(target / 60)}小时${target % 60 ? target % 60 + '分' : ''}</span></div></div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>今日学习 · ${k} · 周${wd(d)}</h4><div class="learning-source-note">${mil ? '军训弹性保护：英语照常，高数/财经自愿推进不欠账。' : '英语采用“1 个词汇 Lesson + 技巧课 + 阅读精读生词”三件套。'}</div></div><span class="learning-chip ${mil ? 'orange' : busy ? 'red' : 'green'}">${mil ? '军训弹性' : busy ? '缓冲' : '正常'}</span></div><div class="energy-switch" style="margin-top:9px"><button class="btn sm ${mode === 'high' ? 'active' : ''}" type="button" data-energy="high">高能量</button><button class="btn sm ${mode === 'normal' ? 'active' : ''}" type="button" data-energy="normal">标准</button><button class="btn sm ${mode === 'low' ? 'active' : ''}" type="button" data-energy="low">低负荷</button></div><div class="v155-mode-note">${energyModeExplanation(mode)}</div></div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>英语今日结构</h4><div class="learning-source-note"><b>① ${esc(lesson)}</b>（计划 1 个）　② 技巧课　③ 阅读精读 + 高价值生词</div></div><span class="learning-chip blue">1 Lesson / 日</span></div><div style="margin-top:9px"><label class="learning-review-check"><input id="v159ReadingDone" type="checkbox" ${rv.done ? 'checked' : ''}><span><b>阅读精读 / 生词提取</b><small>优先影响理解、反复出现、高频词和固定搭配。</small></span></label></div><div class="v158-inline-form" style="margin-top:8px"><label>今天收了几个词<input id="v159ReadingCount" type="number" min="0" max="99" value="${rv.count}"></label><input id="v159ReadingNote" type="text" autocomplete="off" value="${esc(rv.note)}" placeholder="可选：阅读材料 / 卡壳词"><button class="btn" id="v159ReadingSave" type="button">保存</button></div></div>
  <div class="cockpit-grid"><div class="cockpit-stack"><div class="learning-section-card"><div class="learning-row spread"><h4>今天先做什么</h4><span class="learning-chip">${energyLabel(mode)}模式</span></div>${taskHtml}${mode === 'high' ? '<div class="learning-status-box safe" style="margin-top:9px"><b>高能量加量（可选）</b><br>核心英语量完成后，再从高数 / 财经 / 错题回忆里任选一项；不完成不欠账。</div>' : ''}</div>
  <div class="learning-section-card"><div class="learning-row spread"><h4>固定词汇复习</h4><span class="learning-chip">早晚 + 周一</span></div><div class="learning-review-grid"><label class="learning-review-check"><input type="checkbox" id="reviewMorning" ${r.morning ? 'checked' : ''}><span><b>早上复习昨日词汇</b><small>快速主动回忆。</small></span></label><label class="learning-review-check"><input type="checkbox" id="reviewEvening" ${r.evening ? 'checked' : ''}><span><b>晚上复习昨日词汇</b><small>睡前检索卡壳词。</small></span></label><label class="learning-review-check" style="${monday ? '' : 'opacity:.48'}"><input type="checkbox" id="reviewWeekly" ${r.weekly ? 'checked' : ''} ${monday ? '' : 'disabled'}><span><b>周一一周总复习</b><small>${monday ? '今天执行。' : '仅周一开启。'}</small></span></label></div></div>
  <div class="learning-section-card"><div class="learning-row spread"><h4>到期复习</h4><button class="btn sm" id="openReviewToday" type="button">查看复习</button></div>${due.length ? due.slice(0, 4).map(x => `<div class="learning-mini-line"><b>${esc(x.track)}</b> · ${esc(x.title)} · 第${x.offset}天</div>`).join('') : '<div class="learning-empty">今天没有自动到期复习。</div>'}</div></div>
  <div class="cockpit-stack"><div class="learning-section-card"><div class="learning-row spread"><h4>专注计时</h4><b>${secHuman(todayStudySeconds())}</b></div><button class="btn primary" id="openTimerToday" type="button" style="width:100%;margin-top:9px">开始 / 查看计时</button></div>
  <div class="learning-section-card"><div class="learning-row spread"><h4>近期节点</h4><button class="btn sm" id="openCountdownsToday" type="button">管理</button></div>${nearest.length ? nearest.map(x => `<div class="learning-mini-line"><b>${esc(x.title)}</b> · ${learningCountdownText(x.date, x.endDate)}</div>`).join('') : '<div class="learning-empty">暂无倒数日。</div>'}</div>
  <div class="learning-section-card"><h4>自主学习记录</h4><div class="learning-free-row"><select id="freeTrack"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select><input id="freeText" type="text" autocomplete="off" data-lpignore="true" placeholder="写下额外学习内容"><button class="btn" id="addFreeLog" type="button">记录</button></div>${free.length ? free.map(x => `<div class="learning-free-log"><span>${esc(x.track)} · ${esc(x.text)}</span><button class="x" type="button" data-free-id="${x.id}">×</button></div>`).join('') : '<div class="learning-empty">今天还没有自主学习记录。</div>'}</div>
  <div class="learning-section-card"><h4>今天已经完成</h4>${todayItems.length ? todayItems.map(x => `<div class="learning-mini-line">✓ ${esc(x)}</div>`).join('') : '<div class="learning-empty">正式学习项目还没有打勾。</div>'}</div></div></div>`;

  document.querySelectorAll('[data-energy]').forEach(b => { b.onclick = () => setEnergy(b.dataset.energy, k); });
  $('#v159ReadingSave').onclick = () => v159SaveReadingVocab(k, $('#v159ReadingDone').checked, $('#v159ReadingCount').value, $('#v159ReadingNote').value);
  $('#v159ReadingDone').onchange = () => v159SaveReadingVocab(k, $('#v159ReadingDone').checked, $('#v159ReadingCount').value, $('#v159ReadingNote').value);
  $('#reviewMorning').onchange = x => setLearningReview('morning', x.target.checked, k);
  $('#reviewEvening').onchange = x => setLearningReview('evening', x.target.checked, k);
  if (monday) $('#reviewWeekly').onchange = x => setLearningReview('weekly', x.target.checked, k);
  document.querySelectorAll('[data-cockpit-action]').forEach(b => {
    b.onclick = () => {
      const a = b.dataset.cockpitAction;
      if (a === 'weekly') setLearningReview('weekly', true, k);
      else if (a === 'r1') learningMark(LS.english.round1, nextEnglishLesson(LS.english.round1), true, k);
      else if (a === 'r2') learningMark(LS.english.round2, nextEnglishLesson(LS.english.round2), true, k);
      else if (a === 'skillpage') { activeLearningTab = 'english'; renderLearningAll(); return; }
      else if (a === 'finance') learningMark(LS.finance.completions, nextFinanceDay(), true, k);
      else if (a === 'math') learningMark(LS.math.completions, nextMathDay(), true, k);
      renderLearningAll();
    };
  });
  $('#openTimerToday').onclick = () => { activeLearningTab = 'timer'; renderLearningAll(); };
  $('#openReviewToday').onclick = () => { activeLearningTab = 'review'; renderLearningAll(); };
  $('#openCountdownsToday').onclick = () => { activeLearningTab = 'countdowns'; renderLearningAll(); };
  $('#addFreeLog').onclick = () => addFreeLearningLog($('#freeTrack').value, $('#freeText').value, k);
  document.querySelectorAll('[data-free-id]').forEach(b => { b.onclick = () => removeFreeLearningLog(b.dataset.freeId); });
}

function renderLearningTimer() {
  const e = $('#learningPanel'), a = LS.studyTimer.active, mode = energyFor(), todayTotal = todayStudySeconds();
  const notice = studyTimerNotice ? `<div class="learning-status-box safe" style="margin-bottom:10px"><b>${esc(studyTimerNotice)}</b> · 已先保存到本机，并立即尝试同步云端。</div>` : '';
  const classOptions = Object.entries(V158_TIME_CLASSES).map(([k, v]) => `<option value="${k}">${v.label}${v.count ? ' · 计入有效' : ' · 另记'}</option>`).join('');
  const controls = a ? `<div class="timer-controls">${(a.phase === 'focus' && a.focusDueNotified) || a.phase === 'break_due' ? '<button class="btn primary" id="startBreakBtn" type="button">开始休息</button><button class="btn" id="skipBreakBtn" type="button">继续下一轮</button>' : a.phase === 'ready' ? '<button class="btn primary" id="nextFocusBtn" type="button">开始下一轮</button>' : ''}<button class="btn learning-danger-btn" id="finishStudyBtn" type="button">结束并保存</button></div>` : '';
  const recent = [...(LS.studyTimer.sessions || [])].sort((x, y) => String(y.recordedAt || y.endAt || '').localeCompare(String(x.recordedAt || x.endAt || ''))).slice(0, 6);
  const touch = v156TouchDevice(), vib = !!navigator.vibrate;

  e.innerHTML = notice + `<div class="learning-section-card"><div class="learning-row spread"><div><h4>学习计时</h4><div class="learning-source-note">先写入本机账本再同步云端。<b>只有 CORE-DEEP / CORE-RETRIEVAL / ACTIVE-CLASS 进入月度有效时长。</b></div></div><span class="learning-chip green">今天 ${secHuman(todayTotal)}</span></div>
  ${!a ? `<div class="timer-start-grid" style="margin-top:10px"><select id="studySubject">${STUDY_SUBJECTS.map(x => `<option>${x}</option>`).join('')}</select><select id="studyTimeClass">${classOptions}</select><select id="studyEnergy"><option value="normal" ${mode === 'normal' ? 'selected' : ''}>标准 · 50/10</option><option value="high" ${mode === 'high' ? 'selected' : ''}>高能量 · 50/10</option><option value="low" ${mode === 'low' ? 'selected' : ''}>低负荷 · 25/5</option></select><input id="studyNote" type="text" autocomplete="off" data-lpignore="true" placeholder="可选：今天具体学什么"><button class="btn primary" id="startStudyBtn" type="button">开始学习</button></div>` : ''}
  <div class="v155-feedback-row"><label><input type="checkbox" id="v155Haptic" ${LS.uiFeedback.haptic ? 'checked' : ''}> 手机震动</label><label><input type="checkbox" id="v155Sound" ${LS.uiFeedback.sound ? 'checked' : ''}> 点击音效</label><button class="btn sm" id="v156FeedbackTest" type="button">测试确认反馈</button><span class="v156-feedback-capability">${touch ? (vib ? '当前设备支持尝试震动。' : '当前浏览器未提供震动接口。') : '桌面端不执行震动。'} 音效默认关闭。</span></div></div>
  <div class="timer-shell"><div class="timer-face"><div class="timer-subject">${a ? `${esc(a.subject)} · ${energyLabel(a.energy)}` : '科学学习节奏'}</div><div class="timer-clock" id="liveTimerClock">00:00</div><div class="timer-phase" id="liveTimerPhase">${a ? '准备中' : '尚未开始'}</div><div class="timer-hint" id="liveTimerHint"></div>${controls}</div><div class="learning-section-card"><h4>默认节奏</h4><div class="eye-rule"><div><b>50 分钟专注</b><small>标准 / 高能量；低负荷 25 分钟。</small></div><div><b>10 分钟离屏</b><small>每两轮后长休息；低负荷更短。</small></div><div><b>20-20-20 护眼</b><small>每 20 分钟看约 6 米外至少 20 秒。</small></div></div></div></div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>手动补记</h4><div class="learning-source-note">忘记开始计时或漏记时兜底使用。</div></div><span class="learning-chip blue">兜底</span></div><div class="timer-start-grid" style="margin-top:10px"><select id="manualStudySubject">${STUDY_SUBJECTS.map(x => `<option>${x}</option>`).join('')}</select><select id="manualStudyTimeClass">${classOptions}</select><input id="manualStudyDate" type="date" value="${learningTodayKey()}"><input id="manualStudyMinutes" type="number" min="1" max="720" inputmode="numeric" placeholder="分钟数"><button class="btn primary" id="manualStudyAdd" type="button">补记</button></div><input id="manualStudyNote" type="text" autocomplete="off" data-lpignore="true" placeholder="备注（可选）" style="margin-top:8px"></div>
  <div class="learning-section-card"><div class="learning-row spread"><h4>最近学习记录</h4><button class="btn sm" id="openStatsFromTimer" type="button">查看全部</button></div>${recent.length ? recent.map(x => `<div class="study-log-row"><b>${esc(x.subject)}</b><span>${secHuman(x.focusSeconds)}</span><span>${x.manual ? `${esc(sessionDate(x))} · 手动补记` : beijingDateTimeLabel(x.startAt)}${x.note ? ` · ${esc(x.note)}` : ''}</span><span class="learning-chip">${v158SessionCounts(x) ? '有效' : '另记'}</span><button class="x" type="button" data-study-remove="${x.id}">×</button></div>`).join('') : '<div class="learning-empty">还没有学习记录。</div>'}</div>`;

  if ($('#startStudyBtn')) $('#startStudyBtn').onclick = () => { studyTimerNotice = ''; startStudy($('#studySubject').value, $('#studyEnergy').value, $('#studyNote').value, $('#studyTimeClass').value); };
  if ($('#startBreakBtn')) $('#startBreakBtn').onclick = startStudyBreak;
  if ($('#skipBreakBtn')) $('#skipBreakBtn').onclick = skipBreakAndContinue;
  if ($('#nextFocusBtn')) $('#nextFocusBtn').onclick = startNextFocus;
  if ($('#finishStudyBtn')) $('#finishStudyBtn').onclick = finishStudy;
  $('#manualStudyAdd').onclick = () => addManualStudySession($('#manualStudySubject').value, $('#manualStudyDate').value, $('#manualStudyMinutes').value, $('#manualStudyNote').value, $('#manualStudyTimeClass').value);
  $('#openStatsFromTimer').onclick = () => { activeLearningTab = 'stats'; renderLearningAll(); };
  $('#v155Haptic').onchange = ev => { LS.uiFeedback.haptic = ev.target.checked; persistLearningState(); };
  $('#v155Sound').onchange = ev => { LS.uiFeedback.sound = ev.target.checked; persistLearningState(); };
  $('#v156FeedbackTest').onclick = () => { const b = $('#v156FeedbackTest'); b.classList.add('v156-important'); feedbackClick(b, { forceHaptic: true, forceSound: LS.uiFeedback.sound, showToast: false }); v156Toast('✓ 确认反馈已触发', true); };
  document.querySelectorAll('[data-study-remove]').forEach(b => { b.onclick = () => removeStudySession(b.dataset.studyRemove); });
  updateTimerDOM();
}

function renderLearningStats() {
  const e = $('#learningPanel'), [wa, wb] = studyWeekRange(), weekCore = v158EffectiveWeekSeconds(), weekTarget = v158ScheduledWeekMinutes() * 60, month = v158MonthKeyFromDateKey(learningTodayKey()), monthCore = v158EffectiveMonthSeconds(month), monthTarget = v158ScheduledMonthMinutes(month) * 60, totalWeek = weekStudySeconds();
  const sessions = [...(LS.studyTimer.sessions || [])].sort((a, b) => String(b.recordedAt || b.endAt || '').localeCompare(String(a.recordedAt || a.endAt || ''))).slice(0, 40);
  const byClass = Object.entries(V158_TIME_CLASSES).map(([k, v]) => { const sec = studySessionsBetween(wa, wb).filter(x => v158SessionClass(x) === k).reduce((s, x) => s + Number(x.focusSeconds || 0), 0); return `<div class="study-stat"><small>${esc(v.label)} · 本周</small><b>${secHuman(sec)}</b><i style="--w:${weekCore ? Math.min(100, Math.round(sec / weekCore * 100)) : 0}%"></i></div>`; }).join('');
  const sleepArr = Object.values(LS.sleep.records || {}).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const sleepBanner = sleepArr.length ? `<div class="learning-section-card"><div class="learning-row spread"><div><h4>睡眠 × 学习</h4><div class="learning-source-note">近 ${sleepArr.length} 天平均睡眠 ${sleepHuman(sleepAvg(sleepArr, sleepDurationMin))}。不用睡眠换 S。</div></div><button class="btn sm" id="v158OpenSleep" type="button">记录睡眠</button></div></div>` : '';
  e.innerHTML = sleepBanner + `<div class="learning-section-card"><div class="learning-row spread"><div><h4>有效学习统计</h4><div class="learning-source-note">总记录照实保留；只有三类核心认知活动进入月度“有效时长”。</div></div><span class="learning-chip blue">${wa} — ${wb}</span></div><div class="v158-policy-grid"><div class="v158-policy-card"><small>本周核心有效</small><b>${secHuman(weekCore)}</b><small>目标 ${secHuman(weekTarget)}</small></div><div class="v158-policy-card"><small>本周全部记录</small><b>${secHuman(totalWeek)}</b><small>含竞赛/行政等</small></div><div class="v158-policy-card"><small>本月核心有效</small><b>${secHuman(monthCore)}</b><small>目标 ${secHuman(monthTarget)}</small></div><div class="v158-policy-card"><small>调休余额</small><b>${LS.lifePolicy.flex.balance} 天</b><small>每月 +2，最高 6</small></div></div></div>
  <div class="learning-section-card"><h4>本周分类</h4><div class="study-stat-grid">${byClass}</div></div>
  <div class="learning-section-card"><h4>最近学习记录</h4>${sessions.length ? sessions.map(x => `<div class="study-log-row"><b>${esc(x.subject)}</b><span>${secHuman(x.focusSeconds)}</span><span>${x.manual ? `${esc(sessionDate(x))} · 手动补记` : beijingDateTimeLabel(x.startAt)} · ${esc(V158_TIME_CLASSES[v158SessionClass(x)].label)}${x.note ? ` · ${esc(x.note)}` : ''}</span><span class="learning-chip">${v158SessionCounts(x) ? '有效' : '另记'}</span><button class="x" type="button" data-study-remove="${x.id}">×</button></div>`).join('') : '<div class="learning-empty">还没有计时记录。</div>'}</div>`;
  if ($('#v158OpenSleep')) $('#v158OpenSleep').onclick = () => { activeLearningTab = 'sleep'; renderLearningAll(); };
  document.querySelectorAll('[data-study-remove]').forEach(b => { b.onclick = () => removeStudySession(b.dataset.studyRemove); });
}

function renderV160Quality() {
  const e = $('#learningPanel'), month = v158MonthKeyFromDateKey(learningTodayKey()), a = v160QualityMonthStats(month), r = LS.quality.retrievalTests.slice(0, 20), er = LS.quality.errorChecks.slice(0, 20), defSrc = addDaysKey(learningTodayKey(), -7);
  const retRows = r.length ? r.map(x => { const delay = v160DayDiff(x.sourceDate, x.testDate), valid = v160RetrievalValid(x); return `<div class="v160-quality-row"><b>${esc(x.testDate)}</b><span>${esc(x.subject)}</span><span class="v160-hide-mobile">${Number.isFinite(delay) ? delay : '—'} 天</span><span><span class="${valid ? 'ok' : 'bad'}">${x.score}% · ${x.items}项 ${valid ? '✓有效' : '仅记录'}</span>${x.note ? ` · ${esc(x.note)}` : ''}</span><button class="x" type="button" data-v160-rm-r="${x.id}">×</button></div>`; }).join('') : '<div class="learning-empty">还没有延迟提取记录。</div>';
  const errRows = er.length ? er.map(x => { const valid = v160ErrorValid(x), im = v160ErrorImprove(x); return `<div class="v160-quality-row"><b>${esc(x.date)}</b><span>${esc(x.subject)}</span><span class="v160-hide-mobile">${x.before}%→${x.after}%</span><span><span class="${valid ? 'ok' : 'bad'}">${im >= 0 ? '+' : ''}${im.toFixed(1)}% ${valid ? '✓同难度' : '仅记录'}</span>${x.note ? ` · ${esc(x.note)}` : ''}</span><button class="x" type="button" data-v160-rm-e="${x.id}">×</button></div>`; }).join('') : '<div class="learning-empty">还没有错误率对照记录。</div>';
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>学习质量 · ${month}</h4><div class="learning-source-note">只看一周后还会不会、同类错误有没有减少。月评级优先读取这里的有效记录。</div></div><span class="learning-chip green">真实记录优先</span></div><div class="v160-quality-grid"><div class="v160-quality-stat"><small>有效延迟测验</small><b>${a.retrievalCount} 次</b><small>5—9天 + ≥10评分项</small></div><div class="v160-quality-stat"><small>延迟提取均分</small><b>${a.retrievalCount ? a.retrieval.toFixed(0) + '%' : '—'}</b><small>A/S 至少 8 次</small></div><div class="v160-quality-stat"><small>有效错误率对照</small><b>${a.errorCount} 次</b><small>同难度前后测</small></div><div class="v160-quality-stat"><small>平均错误率改善</small><b>${a.errorCount ? a.errorImprove.toFixed(1) + '%' : '—'}</b><small>${a.lowErrorMaintained ? '已满足低错率保持' : '月初≤10%可记保持'}</small></div></div></div>
  <div class="learning-section-card"><h4>记录一次 7±2 天延迟提取</h4><div class="v160-quality-form"><label>科目<select id="v160RetSubject"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select></label><label>原学习日期<input id="v160RetSource" type="date" value="${defSrc}"></label><label>测验日期<input id="v160RetDate" type="date" value="${learningTodayKey()}"></label><label>得分 %<input id="v160RetScore" type="number" min="0" max="100" placeholder="如 84"></label><label>评分项数<input id="v160RetItems" type="number" min="1" max="999" placeholder="≥10"></label><button class="btn primary" id="v160RetAdd" type="button">记录</button><input id="v160RetNote" class="wide" type="text" autocomplete="off" placeholder="可选：章节 / 套题 / 错题组"></div><div style="margin-top:8px">${retRows}</div></div>
  <div class="learning-section-card"><h4>记录一次同难度错误率对照</h4><div class="v160-quality-form"><label>科目<select id="v160ErrSubject"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select></label><label>日期<input id="v160ErrDate" type="date" value="${learningTodayKey()}"></label><label>前测错误率 %<input id="v160ErrBefore" type="number" min="0" max="100" placeholder="如 30"></label><label>后测错误率 %<input id="v160ErrAfter" type="number" min="0" max="100" placeholder="如 18"></label><label class="check"><input id="v160ErrSame" type="checkbox" checked> 同难度 / 同口径</label><button class="btn primary" id="v160ErrAdd" type="button">记录</button><input id="v160ErrNote" class="wide" type="text" autocomplete="off" placeholder="可选：题型 / 章节"></div><div style="margin-top:8px">${errRows}</div></div>`;
  $('#v160RetAdd').onclick = () => v160AddRetrieval($('#v160RetSubject').value, $('#v160RetSource').value, $('#v160RetDate').value, $('#v160RetScore').value, $('#v160RetItems').value, $('#v160RetNote').value);
  $('#v160ErrAdd').onclick = () => v160AddError($('#v160ErrSubject').value, $('#v160ErrDate').value, $('#v160ErrBefore').value, $('#v160ErrAfter').value, $('#v160ErrSame').checked, $('#v160ErrNote').value);
  document.querySelectorAll('[data-v160-rm-r]').forEach(b => { b.onclick = () => v160RemoveQuality('r', b.dataset.v160RmR); });
  document.querySelectorAll('[data-v160-rm-e]').forEach(b => { b.onclick = () => v160RemoveQuality('e', b.dataset.v160RmE); });
}

function renderSleep() {
  const e = $('#learningPanel'), today = learningTodayKey(), r = sleepRecord(today) || {}, arr = Object.values(LS.sleep.records).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date)), recent = arr.slice(0, 7);
  const avg = sleepAvg(recent, sleepDurationMin), avgD = sleepAvg(recent, x => Number(x.difficulty || 0)), avgS = sleepAvg(recent, x => Number(x.sleepiness || 0)), nap = sleepAvg(recent, x => Number(x.nap || 0));
  let verdict = '数据还少，先连续记录。';
  if (recent.length >= 4) verdict = (avg >= 465 && avgD <= 2.5 && avgS <= 2.5) ? '目前更像“睡够了”：白天状态和起床难度都不错。' : (avg < 450 || avgD >= 3.5 || avgS >= 3.5) ? '目前有睡眠不足信号，先别为了早起硬砍睡眠。' : '处在中间区间，再记录几天看趋势。';
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>睡眠实验</h4><div class="learning-source-note">记录估计睡着时间，重点看睡眠时长与第二天状态是否匹配；多设备按日期安全合并。</div></div><span class="learning-chip blue">近 7 天 ${recent.length} 条</span></div><div class="sleep-summary" style="margin-top:10px"><div><small>平均睡眠</small><b>${recent.length ? sleepHuman(avg) : '—'}</b></div><div><small>起床难度</small><b>${recent.length ? avgD.toFixed(1) + '/5' : '—'}</b></div><div><small>白天困意</small><b>${recent.length ? avgS.toFixed(1) + '/5' : '—'}</b></div><div><small>平均午睡</small><b>${recent.length ? Math.round(nap) + ' 分' : '—'}</b></div></div><div class="learning-status-box ${recent.length >= 4 && avg < 450 ? 'warn' : 'safe'}" style="margin-top:10px"><b>阶段判断</b><br>${verdict}</div></div>
  <div class="learning-section-card"><h4>今天 / 今早记录</h4><div class="sleep-form"><label>日期<input id="slDate" type="date" value="${today}"></label><label>上床<input id="slBed" type="time" value="${r.bed || '21:45'}"></label><label>估计睡着<input id="slAsleep" type="time" value="${r.asleep || '22:30'}"></label><label>起床<input id="slWake" type="time" value="${r.wake || '05:30'}"></label><label>起床难度<select id="slDiff">${[1, 2, 3, 4, 5].map(x => `<option value="${x}" ${Number(r.difficulty || 2) === x ? 'selected' : ''}>${x} / 5</option>`).join('')}</select></label><label>白天困意<select id="slSleepy">${[1, 2, 3, 4, 5].map(x => `<option value="${x}" ${Number(r.sleepiness || 2) === x ? 'selected' : ''}>${x} / 5</option>`).join('')}</select></label><label>午睡分钟<input id="slNap" type="number" min="0" max="240" value="${Number(r.nap || 0)}"></label><label>备注<input id="slNote" type="text" autocomplete="off" value="${esc(r.note || '')}" placeholder="军训很累 / 无异常"></label></div><button class="btn primary" id="slSave" type="button" style="margin-top:10px">保存睡眠记录</button></div>
  <div class="learning-section-card"><h4>最近记录</h4>${arr.length ? arr.slice(0, 10).map(x => `<div class="sleep-row"><b>${x.date.slice(5)}</b><span>${x.asleep}→${x.wake} · ${sleepHuman(sleepDurationMin(x))} · 午睡 ${Number(x.nap || 0)} 分</span><span class="sleep-score">困 ${x.sleepiness}/5</span></div>`).join('') : '<div class="learning-empty">还没有睡眠记录。</div>'}</div>`;
  $('#slSave').onclick = () => saveSleepRecord($('#slDate').value, $('#slBed').value, $('#slAsleep').value, $('#slWake').value, $('#slDiff').value, $('#slSleepy').value, $('#slNap').value, $('#slNote').value);
}

function renderV158Policy() {
  const e = $('#learningPanel'), month = v158MonthKeyFromDateKey(learningTodayKey()), score = v158ScoreMonth(month), autoQ = v160QualityMonthStats(month), settled = LS.lifePolicy.settlements[month], leaveDates = Object.entries(LS.lifePolicy.flex.used || {}).sort((a, b) => a[0].localeCompare(b[0])), planMin = v158ScheduledMonthMinutes(month), reward = v158TokenBalance();
  const classes = Object.entries(V158_TIME_CLASSES).map(([, v]) => `<div class="v158-class-item ${v.count ? 'core' : 'other'}"><b>${esc(v.label)}</b><br>${esc(v.help)}<br><span class="learning-chip ${v.count ? 'green' : ''}">${v.count ? '计入有效时长' : '另记，不进月时长'}</span></div>`).join('');
  const adjustment = score.t.holiday ? `假期月已启用：本月降低 ${score.t.reduction.toFixed(1)}h；近 3 月均值 ${score.t.avg.toFixed(1)}h。` : score.t.leaveCount >= 3 ? `本月用了 ${score.t.leaveCount} 天调休，但近 3 月均值 ${score.t.avg.toFixed(1)}h＜120h，暂不启用额外门槛下调。` : '本月使用 0—2 天调休时，S/A/B 时数门槛保持 138/128/120h。';
  const autoNote = (autoQ.retrievalCount || autoQ.errorCount) ? `<div class="learning-status-box safe" style="margin-top:9px"><b>自动质量数据已接管部分月评：</b> ${autoQ.retrievalCount ? `延迟提取 ${autoQ.retrievalCount} 次 / ${autoQ.retrieval.toFixed(0)}%` : '延迟提取用手动值'}；${autoQ.errorCount ? `错误率对照 ${autoQ.errorCount} 次 / 改善 ${autoQ.errorImprove.toFixed(1)}%` : '错误率用手动值'}。</div>` : '';
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>个人成长制度 · ${APP_VERSION}</h4><div class="learning-source-note">目标不是最大化“痛苦时长”，而是长期最大化会做、记得住、身体稳定、还能认真生活的能力。</div></div><span class="learning-chip green">A 是长期理想常态</span></div><div class="v158-policy-grid"><div class="v158-policy-card"><small>周一—周五</small><b>5.5h</b><small>核心有效目标</small></div><div class="v158-policy-card"><small>周六</small><b>0h</b><small>固定完全休息</small></div><div class="v158-policy-card"><small>周日</small><b>4.5h</b><small>中等学习</small></div><div class="v158-policy-card"><small>标准周</small><b>32h</b><small>不含合法调休</small></div></div>${autoNote}</div>
  <div class="learning-section-card"><h4>有效学习时长分类</h4><div class="v158-class-grid">${classes}</div></div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>调休账户</h4><div class="learning-source-note">每月自动 +2 天，最高 6 天；周六本来就休息，不消耗调休。</div></div><span class="learning-chip blue">余额 ${LS.lifePolicy.flex.balance} / 6 天</span></div><div class="v158-inline-form"><input id="v158LeaveDate" type="date" value="${learningTodayKey()}"><input id="v158LeaveReason" type="text" autocomplete="off" placeholder="约会 / 旅行 / 私事"><button class="btn primary" id="v158UseLeave" type="button">使用 1 天调休</button></div><div style="margin-top:8px">${leaveDates.length ? leaveDates.map(([k, v]) => `<div class="v158-leave-row"><b>${k}</b><span>${esc(v.reason || '调休')}</span><button class="x" type="button" data-v158-leave-remove="${k}">×</button></div>`).join('') : '<div class="learning-empty">还没有使用调休。</div>'}</div></div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>${month} 月度评级</h4><div class="learning-source-note">有效时数 35 + 核心进度 25 + 延迟提取 25 + 错误率改善 15 = 100 分。</div></div><span class="v158-grade ${score.grade.toLowerCase()}">${score.grade}</span></div><div class="v158-policy-grid"><div class="v158-policy-card"><small>核心有效时长</small><b>${score.h.toFixed(1)}h</b><small>本月排程 ${(planMin / 60).toFixed(1)}h</small></div><div class="v158-policy-card"><small>COP 完成率</small><b>${score.m.cop.toFixed(0)}%</b><small>S≥100 / A≥95</small></div><div class="v158-policy-card"><small>延迟提取</small><b>${score.m.retrieval.toFixed(0)}%</b><small>${score.m.retrievalCount} 次（A/S≥8次）</small></div><div class="v158-policy-card"><small>错误率改善</small><b>${score.err.toFixed(0)}%</b><small>${score.m.lowErrorMaintained ? '低错率≤10%保持' : '同难度前后测'}</small></div></div>
  <div class="v158-inline-form"><label>COP %<input id="v158Cop" type="number" min="0" max="200" value="${score.m.cop}"></label><label>延迟提取均分 %<input id="v158Retrieval" type="number" min="0" max="100" value="${score.m.retrieval}"></label><label>有效测验次数<input id="v158RetrievalCount" type="number" min="0" max="99" value="${score.m.retrievalCount}"></label><label>错误率改善 %<input id="v158Error" type="number" min="-100" max="100" value="${score.m.errorImprove}"></label><label class="check"><input id="v158LowError" type="checkbox" ${score.m.lowErrorMaintained ? 'checked' : ''}> 低错率保持</label><button class="btn" id="v158SaveMetrics" type="button">保存月度数据</button></div>
  <div class="learning-status-box ${score.grade === 'C' ? 'warn' : 'safe'}" style="margin-top:10px"><b>当前 ${score.grade} 级 · ${score.total}/100 分</b><br>${v158GradeAction(score.grade)}<br>${adjustment}${score.sleep.count ? `<br>本月已记录睡眠 ${score.sleep.count} 晚，平均 ${sleepHuman(score.sleep.avgMin)}。` : ''}</div>
  <table class="v158-score-table"><tr><th>维度</th><th>得分</th><th>当前</th></tr><tr><td>有效时数</td><td>${score.timeScore}/35</td><td>S≥${score.t.s.toFixed(1)}h / A≥${score.t.a.toFixed(1)}h / B≥${score.t.b.toFixed(1)}h</td></tr><tr><td>COP</td><td>${score.copScore}/25</td><td>${score.m.cop.toFixed(0)}%</td></tr><tr><td>延迟提取</td><td>${score.retScore}/25</td><td>${score.m.retrieval.toFixed(0)}%</td></tr><tr><td>错误率改善</td><td>${score.errScore}/15</td><td>${score.err.toFixed(0)}%</td></tr></table>
  <div class="learning-row" style="margin-top:10px"><button class="btn primary" id="v158Settle" type="button">${settled ? '重新结算' : '结算本月'}</button><span class="learning-chip">本月奖励 ${score.tokens} 枚</span><span class="learning-chip green">累计已结算 ${reward} 枚代币</span></div></div>`;
  $('#v158UseLeave').onclick = () => v158UseFlexLeave($('#v158LeaveDate').value, $('#v158LeaveReason').value);
  document.querySelectorAll('[data-v158-leave-remove]').forEach(b => { b.onclick = () => v158CancelFlexLeave(b.dataset.v158LeaveRemove); });
  $('#v158SaveMetrics').onclick = () => v158SetMonthlyMetrics(month, $('#v158Cop').value, $('#v158Retrieval').value, $('#v158RetrievalCount').value, $('#v158Error').value, $('#v158LowError').checked);
  $('#v158Settle').onclick = () => v158SettleMonth(month);
}

function renderV170Rhythm() {
  const e = $('#learningPanel'), a = v170Adaptive(), label = { rest: '休息', low: '低负荷', quality: '质量优先', normal: '标准' }[a.mode];
  e.innerHTML = `<div class="v170-rhythm-hero"><span class="learning-chip ${a.mode === 'normal' || a.mode === 'rest' ? 'green' : 'orange'}">今日建议 · ${label}</span><h3>${esc(a.title)}</h3><p>基于你自己的学习、睡眠和质量记录给出的节奏建议，不会擅自改掉计划。</p><div class="v170-reason-list">${a.reasons.map(x => `<div class="v170-reason">${esc(x)}</div>`).join('')}</div><div class="v170-report-actions"><button class="btn primary" id="v170ApplyRhythm" type="button">应用建议</button><button class="btn" id="v170OpenRhythmTarget" type="button">打开对应页面</button></div></div>
  <div class="learning-section-card"><div class="v170-grid"><div class="v170-card"><small>近 7 天高负荷天</small><b>${a.heavy} 天</b><p>核心有效学习 ≥4.5h 的天数。</p></div><div class="v170-card"><small>近 7 天睡眠</small><b>${a.sleepN ? a.sleepN + '晚 / ' + sleepHuman(a.avgSleep) : '未记录'}</b><p>不因未记录而扣分。</p></div><div class="v170-card"><small>本周核心有效</small><b>${a.week.toFixed(1)}h</b><p>排程约 ${a.target.toFixed(1)}h。</p></div></div></div>`;
  $('#v170OpenRhythmTarget').onclick = () => { activeLearningTab = a.tab; renderLearningAll(); };
  $('#v170ApplyRhythm').onclick = () => { if (a.mode === 'rest') { activeLearningTab = 'today'; renderLearningAll(); return; } if (a.mode === 'low') { setEnergy('low', learningTodayKey()); v156Toast('✓ 今日已切换低负荷', true); } else if (a.mode === 'normal') { setEnergy('normal', learningTodayKey()); v156Toast('✓ 今日保持标准模式', true); } else { activeLearningTab = 'quality'; renderLearningAll(); return; } renderLearningAll(); };
}

function renderV170Projects() {
  const e = $('#learningPanel'), projects = [...LS.v170.projects].sort((a, b) => (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1) || String(a.deadline || '9999').localeCompare(String(b.deadline || '9999')));
  const html = projects.map(p => {
    const done = p.milestones.filter(x => x.done).length, total = p.milestones.length, mins = v170ProjectMinutes(p);
    const mil = p.milestones.slice(0, 8).map(m => `<div class="v170-milestone"><input type="checkbox" data-v170-ms-toggle="${p.id}|${m.id}" ${m.done ? 'checked' : ''}><span>${esc(m.title)}</span><span class="date">${m.dueDate || '—'}</span><button class="x" type="button" data-v170-ms-del="${p.id}|${m.id}">×</button></div>`).join('');
    const logs = p.logs.slice(0, 5).map(x => `<div class="v170-log"><b>${x.date}</b><span class="mins">${x.minutes ? x.minutes + '分钟' : '—'}</span><span>${esc(x.note || '项目投入')}</span><button class="x" type="button" data-v170-log-del="${p.id}|${x.id}">×</button></div>`).join('');
    return `<div class="v170-project"><div class="v170-project-head"><div><h4>${esc(p.name)}</h4><div class="v170-project-meta"><span class="learning-chip">${esc(p.kind)}</span><span class="learning-chip ${p.status === 'done' ? 'green' : p.status === 'paused' ? 'orange' : 'blue'}">${p.status === 'done' ? '已完成' : p.status === 'paused' ? '暂停' : '进行中'}</span>${p.deadline ? `<span class="learning-chip">截止 ${p.deadline}</span>` : ''}<span class="learning-chip">累计 ${(mins / 60).toFixed(1)}h</span></div></div><button class="x" type="button" data-v170-project-del="${p.id}">×</button></div>
    <div class="v170-project-form" style="margin-top:9px"><input id="v170Name-${p.id}" value="${esc(p.name)}"><select id="v170Kind-${p.id}"><option ${p.kind === '竞赛项目' ? 'selected' : ''}>竞赛项目</option><option ${p.kind === '长期项目' ? 'selected' : ''}>长期项目</option><option ${p.kind === '求职项目' ? 'selected' : ''}>求职项目</option><option ${p.kind === '个人项目' ? 'selected' : ''}>个人项目</option></select><input id="v170Deadline-${p.id}" type="date" value="${p.deadline}"><select id="v170Status-${p.id}"><option value="active" ${p.status === 'active' ? 'selected' : ''}>进行中</option><option value="paused" ${p.status === 'paused' ? 'selected' : ''}>暂停</option><option value="done" ${p.status === 'done' ? 'selected' : ''}>已完成</option></select><input class="wide" id="v170Note-${p.id}" value="${esc(p.note)}" placeholder="项目备注"><button class="btn" type="button" data-v170-project-save="${p.id}">保存项目</button></div>
    <div class="learning-source-note" style="margin-top:8px">里程碑 ${done}/${total} · 项目投入单独统计，不进入专转本核心有效时长。</div><div style="margin-top:6px">${mil || '<div class="learning-empty">暂无里程碑。</div>'}</div>
    <div class="v170-project-form" style="margin-top:7px"><input class="wide" id="v170MsTitle-${p.id}" placeholder="新增里程碑"><input id="v170MsDate-${p.id}" type="date"><button class="btn" type="button" data-v170-ms-add="${p.id}">加里程碑</button></div>
    <div style="margin-top:6px">${logs || '<div class="learning-empty">暂无项目投入记录。</div>'}</div>
    <div class="v170-project-form" style="margin-top:7px"><input id="v170LogDate-${p.id}" type="date" value="${learningTodayKey()}"><input id="v170LogMin-${p.id}" type="number" min="0" max="720" placeholder="分钟"><input class="wide" id="v170LogNote-${p.id}" placeholder="今天推进了什么"><button class="btn" type="button" data-v170-log-add="${p.id}">记录投入</button></div></div>`;
  }).join('');
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>项目模式</h4><div class="learning-source-note">比赛、作品集、求职准备各有里程碑与投入记录，默认不冒充专转本核心学习时长。</div></div><span class="learning-chip green">能力成长 ≠ 只看备考</span></div><div class="v170-project-form" style="margin-top:10px"><input id="v170ProjectName" class="wide" placeholder="新项目名称"><select id="v170ProjectKind"><option>竞赛项目</option><option>长期项目</option><option>求职项目</option><option>个人项目</option></select><input id="v170ProjectDeadline" type="date"><input id="v170ProjectNote" class="wide" placeholder="可选：为什么做 / 预期成果"><button class="btn primary" id="v170ProjectAdd" type="button">新增项目</button></div></div>${html || '<div class="learning-section-card"><div class="learning-empty">还没有项目。</div></div>'}`;
  $('#v170ProjectAdd').onclick = () => v170AddProject($('#v170ProjectName').value, $('#v170ProjectKind').value, $('#v170ProjectDeadline').value, $('#v170ProjectNote').value);
  document.querySelectorAll('[data-v170-project-save]').forEach(b => { b.onclick = () => { const id = b.dataset.v170ProjectSave; v170UpdateProject(id, $(`#v170Name-${id}`).value, $(`#v170Kind-${id}`).value, $(`#v170Deadline-${id}`).value, $(`#v170Status-${id}`).value, $(`#v170Note-${id}`).value); }; });
  document.querySelectorAll('[data-v170-project-del]').forEach(b => { b.onclick = () => v170DeleteProject(b.dataset.v170ProjectDel); });
  document.querySelectorAll('[data-v170-ms-add]').forEach(b => { b.onclick = () => { const id = b.dataset.v170MsAdd; v170AddMilestone(id, $(`#v170MsTitle-${id}`).value, $(`#v170MsDate-${id}`).value); }; });
  document.querySelectorAll('[data-v170-ms-toggle]').forEach(x => { x.onchange = ev => { const [p, m] = x.dataset.v170MsToggle.split('|'); v170ToggleMilestone(p, m, ev.target.checked); }; });
  document.querySelectorAll('[data-v170-ms-del]').forEach(b => { b.onclick = () => { const [p, m] = b.dataset.v170MsDel.split('|'); v170DeleteMilestone(p, m); }; });
  document.querySelectorAll('[data-v170-log-add]').forEach(b => { b.onclick = () => { const id = b.dataset.v170LogAdd; v170AddProjectLog(id, $(`#v170LogDate-${id}`).value, $(`#v170LogMin-${id}`).value, $(`#v170LogNote-${id}`).value); }; });
  document.querySelectorAll('[data-v170-log-del]').forEach(b => { b.onclick = () => { const [p, l] = b.dataset.v170LogDel.split('|'); v170DeleteProjectLog(p, l); }; });
}

function renderV170Reports() {
  const e = $('#learningPanel'), w = v170ReportData('week'), m = v170ReportData('month');
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>自动报告</h4><div class="learning-source-note">只总结真实数据，不生成鸡汤。</div></div><span class="learning-chip green">事实 → 判断 → 下一步</span></div><div class="review-tabs" style="margin-top:10px"><button class="btn active" id="v170ReportWeek" type="button">本周</button><button class="btn" id="v170ReportMonth" type="button">本月</button></div><div id="v170ReportText" class="v170-report" style="margin-top:9px">${esc(w.text)}</div><div class="v170-report-actions"><button class="btn primary" id="v170ReportCopy" type="button">复制报告</button><button class="btn" id="v170ReportDownload" type="button">下载 Markdown</button></div></div>`;
  let cur = w; const show = x => { cur = x; $('#v170ReportText').textContent = x.text; $('#v170ReportWeek').classList.toggle('active', x === w); $('#v170ReportMonth').classList.toggle('active', x === m); };
  $('#v170ReportWeek').onclick = () => show(w); $('#v170ReportMonth').onclick = () => show(m);
  $('#v170ReportCopy').onclick = () => copyText(cur.text); $('#v170ReportDownload').onclick = () => downloadText(`${cur.label.replace(/\s+/g, '_')}.md`, cur.text);
}

function renderV170Search() {
  const e = $('#learningPanel');
  e.innerHTML = `<div class="learning-section-card"><h4>全局搜索与历史</h4><div class="v170-searchbar"><input id="v170SearchQ" type="text" autocomplete="off" placeholder="搜任务、章节、项目、错题、每日复盘……"><select id="v170SearchType"><option value="all">全部类型</option><option>任务</option><option>学习</option><option>质量</option><option>项目</option><option>复盘</option></select><button class="btn primary" id="v170SearchGo" type="button">搜索</button></div><div id="v170SearchResults" class="v170-search-results"><div class="learning-empty">输入关键词开始搜索（已支持检索每日复盘 q1/q2/q3 全文）。</div></div></div>`;
  const run = () => {
    const r = v170SearchAll($('#v170SearchQ').value, $('#v170SearchType').value), box = $('#v170SearchResults');
    box.innerHTML = r.length ? r.map((x, i) => `<div class="v170-search-row"><b>${x.date || '—'}</b><span class="type"><span class="learning-chip">${esc(x.t)}</span></span><span><b>${esc(x.title)}</b><br><small>${esc(x.detail)}</small></span><button class="btn sm" type="button" data-v170-search-open="${i}">定位</button></div>`).join('') : '<div class="learning-empty">没有匹配记录。</div>';
    document.querySelectorAll('[data-v170-search-open]').forEach(b => { b.onclick = () => { const x = r[Number(b.dataset.v170SearchOpen)]; if (x.jumpSide && v150DateOk(x.date)) { closeLearning(); jumpToDate(x.date, x.jumpSide); } else { activeLearningTab = x.tab; renderLearningAll(); } }; });
  };
  $('#v170SearchGo').onclick = run; $('#v170SearchQ').onkeydown = ev => { if (ev.key === 'Enter') run(); };
}

function renderV170Life() {
  const e = $('#learningPanel'), k = learningTodayKey(), x = v170LifeRecord(k), arr = Object.values(LS.v170.life.checkins || {}).filter(Boolean).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 14), avg = arr.filter(i => i.happiness > 0), h = avg.length ? avg.reduce((n, i) => n + Number(i.happiness), 0) / avg.length : 0;
  const hist = arr.map(r => `<div class="v170-life-row"><b>${r.date}</b><span>${[r.move ? '运动/活动' : '', r.outdoors ? '户外' : '', r.social ? '社交/约会' : '', r.hobby ? '兴趣' : ''].filter(Boolean).join(' · ') || '只记录了感受'}${r.happiness ? ` · 幸福感 ${r.happiness}/5` : ''}${r.note ? ` · ${esc(r.note)}` : ''}</span></div>`).join('');
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>生活不是学习之后的奖励</h4><div class="learning-source-note">不设连续打卡、不参与 S/A/B/C、不因空白变红。</div></div><span class="learning-chip green">非 KPI</span></div><div class="v170-life-grid" style="margin-top:10px"><label class="v170-life-check"><input id="v170LifeMove" type="checkbox" ${x.move ? 'checked' : ''}> 有活动/运动</label><label class="v170-life-check"><input id="v170LifeOut" type="checkbox" ${x.outdoors ? 'checked' : ''}> 有户外/散步</label><label class="v170-life-check"><input id="v170LifeSocial" type="checkbox" ${x.social ? 'checked' : ''}> 有社交/约会</label><label class="v170-life-check"><input id="v170LifeHobby" type="checkbox" ${x.hobby ? 'checked' : ''}> 有兴趣娱乐</label></div><div class="v170-project-form" style="margin-top:9px"><label>今天幸福感（1—5）<input id="v170LifeHappy" type="number" min="1" max="5" value="${x.happiness || ''}"></label><input class="wide" id="v170LifeNote" value="${esc(x.note)}" placeholder="今天值得记住的小事"><button class="btn primary" id="v170LifeSave" type="button">保存今天</button></div></div>
  <div class="learning-section-card"><div class="v170-grid"><div class="v170-card"><small>近 14 天有记录</small><b>${arr.length} 天</b><p>提醒自己人生不只有学习。</p></div><div class="v170-card"><small>幸福感均值</small><b>${avg.length ? h.toFixed(1) + '/5' : '—'}</b><p>只看趋势，不做奖惩。</p></div><div class="v170-card"><small>今天</small><b>${[x.move, x.outdoors, x.social, x.hobby].filter(Boolean).length} 项生活</b><p>哪怕今天只休息，也完全有效。</p></div></div><div class="v170-life-history">${hist || '<div class="learning-empty">还没有生活记录。</div>'}</div></div>`;
  $('#v170LifeSave').onclick = () => v170SaveLife(k, { move: $('#v170LifeMove').checked, outdoors: $('#v170LifeOut').checked, social: $('#v170LifeSocial').checked, hobby: $('#v170LifeHobby').checked, happiness: $('#v170LifeHappy').value, note: $('#v170LifeNote').value });
}

function renderSpacedReviews() {
  const e = $('#learningPanel'), all = reviewBacklog(), due = dueReviews(), up = upcomingReviews(), settings = LS.spacedReviews.settings, budget = Math.max(5, Number(settings.dailyBudgetMin) || 15);
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>复习预算</h4><div class="learning-source-note">每天只拿固定预算做最值得的几项，其余留在队列里等待。</div></div><span class="learning-chip green">今天最多 ${budget} 分钟</span></div><div class="v155-review-budget"><div><small>今日建议</small><b>${due.length} 项</b></div><div><small>总待复习</small><b>${all.length} 项</b></div><div><small>单项预算</small><b>≈ 5 分钟</b></div></div><div class="learning-row" style="margin-top:10px"><label class="small">每日预算 <input id="v155ReviewBudget" type="number" min="5" max="45" step="5" value="${budget}" style="width:74px"> 分钟</label><label class="check"><input id="revFinance" type="checkbox" ${settings.finance !== false ? 'checked' : ''}>财经</label><label class="check"><input id="revMath" type="checkbox" ${settings.math !== false ? 'checked' : ''}>高数</label><label class="check"><input id="revSkills" type="checkbox" ${settings.skills !== false ? 'checked' : ''}>四级技巧</label></div></div>
  <div class="learning-section-card"><h4>今天只做这些</h4>${due.length ? due.map(x => `<div class="review-due"><div><div class="review-due-title">${esc(x.track)} · ${esc(x.title)}</div><div class="review-due-meta">第 ${x.offset} 天 · 原计划 ${x.due}</div></div><button class="btn sm" type="button" data-review-done="${x.key}">完成</button></div>`).join('') : '<div class="learning-empty">今天没有必须占用复习预算的项目。</div>'}</div>
  <div class="learning-section-card"><h4>后面的队列</h4>${up.length ? up.slice(0, 8).map(x => `<div class="learning-mini-line"><b>${x.due}</b> · ${esc(x.track)} · ${esc(x.title)}</div>`).join('') : '<div class="learning-empty">暂无未来复习任务。</div>'}</div>`;
  $('#v155ReviewBudget').onchange = x => { LS.spacedReviews.settings.dailyBudgetMin = Math.max(5, Math.min(45, Number(x.target.value) || 15)); persistLearningState(); renderLearningAll(); };
  $('#revFinance').onchange = x => setReviewSetting('finance', x.target.checked); $('#revMath').onchange = x => setReviewSetting('math', x.target.checked); $('#revSkills').onchange = x => setReviewSetting('skills', x.target.checked);
  document.querySelectorAll('[data-review-done]').forEach(b => { b.onclick = () => markReviewDone(b.dataset.reviewDone); });
}

function renderLearningEnglish() {
  const e = $('#learningPanel'), r1 = englishDoneCount(LS.english.round1), r2 = englishDoneCount(LS.english.round2), sk = learningDoneCount(LS.english.skills), next = nextEnglishLesson(LS.english.round1), proj = projectEnglishRound1(), cls = learningStatusClass(proj.date, LEARNING_CONFIG.round1SoftTarget), n2 = nextEnglishLesson(LS.english.round2), nextSkill = nextSkillPlanId(), block = currentSkillPlanBlock();
  const skillHtml = ['阅读', '听力', '翻译', '写作'].map(mod => {
    const arr = ENGLISH_SKILL_PLAN_ORDER.map(skillItemById).filter(x => x && x.module === mod), doneN = arr.filter(x => LS.english.skills[String(x.id)]).length;
    return `<div class="learning-module-title"><span>${mod}篇</span><span>${doneN}/${arr.length}</span></div><div class="learning-item-list">${arr.map(s => { const v = LS.english.skills[String(s.id)], done = !!v; return `<label class="learning-item ${done ? 'done' : ''}"><input type="checkbox" data-en-skill="${s.id}" ${done ? 'checked' : ''}><div><div class="learning-item-title">${String(s.id).padStart(2, '0')} · ${esc(s.title)}</div><div class="learning-item-meta">${esc(s.duration)} · 刘晓燕《就这样过英语四级》</div></div><span class="learning-item-date">${done ? esc(learningEntryDate(v)) : ''}</span></label>`; }).join('')}</div>`;
  }).join('');
  const planRows = ENGLISH_SKILL_DAILY_BLOCKS.map(b => { const min = b.ids.reduce((n, id) => n + skillDurationMinutes(skillItemById(id)), 0), done = b.ids.every(id => !!LS.english.skills[String(id)]), active = block && block.day === b.day; return `<div class="learning-mini-line" style="${active ? 'font-weight:700;border-color:var(--accent)' : ''}">${done ? '✓' : '○'} <b>Day ${b.day}</b> · ${esc(b.stage)} · ${skillMinutesHuman(min)} · ${b.ids.map(id => `#${id}`).join(' / ')}</div>`; }).join('');
  const r2card = englishRound1Complete() ? `<div class="learning-section-card"><div class="learning-row spread"><h4>第二轮词汇 · ${r2}/${ENGLISH_LESSON_TOTAL}</h4>${n2 ? `<button class="btn primary" id="doneNextR2" type="button">今天完成 ${englishLessonLabel(n2)}</button>` : '<span class="learning-chip green">已完成</span>'}</div>${englishRoundListHtml(LS.english.round2, 2)}</div>` : `<div class="learning-section-card"><div class="learning-lock">第二轮词汇在第一轮 ${ENGLISH_LESSON_TOTAL}/${ENGLISH_LESSON_TOTAL} 完成后解锁；技巧课已提前并行。</div></div>`;
  const keys = englishRound1Complete() ? ['english1', 'english2', 'skills'] : ['english1', 'skills'];

  e.innerHTML = burndownInlineHtml(keys, '英语进度趋势') + `<div class="learning-section-card"><div class="learning-row spread"><div><h4>英语执行口径 · ${APP_VERSION}</h4><div class="learning-source-note">计划量固定为 <b>1 个 Lesson / 学习日</b>；技巧课并行推进；阅读精读只筛选高价值生词。</div></div><span class="learning-chip green">1 Lesson / 日</span></div></div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>英语四级词汇 · 第一轮 ${r1}/${ENGLISH_LESSON_TOTAL}</h4><div class="learning-source-note">10 个 Unit × 4 个逻辑 Lesson = 40 个 Lesson。</div></div>${next ? `<button class="btn primary" id="doneNextR1" type="button">今天完成 ${englishLessonLabel(next)}</button>` : '<span class="learning-chip green">第一轮完成</span>'}</div><div class="learning-status-box ${cls}" style="margin-top:9px"><b>动态预测：${dateHuman(proj.date)}</b><br>软目标 ${dateHuman(LEARNING_CONFIG.round1SoftTarget)}；技巧课不受此目标锁定。</div>${englishRoundListHtml(LS.english.round1, 1)}</div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>四级技巧 · ${sk}/${ENGLISH_SKILLS.length}</h4><div class="learning-source-note">推进顺序：<b>阅读 → 听力 → 翻译 → 写作</b>。</div></div>${nextSkill ? `<button class="btn primary" id="doneNextSkill" type="button">完成下一节 · #${nextSkill}</button>` : '<span class="learning-chip green">技巧完成</span>'}</div>${block ? `<div class="learning-status-box safe" style="margin-top:9px"><b>当前：${esc(skillBlockLabel(block))}</b><br>剩余课程：${esc(skillBlockLessonText(block))}。</div>` : ''}<details class="subject-burndown" open style="margin-top:10px"><summary><span>14 个标准学习日计划表</span><span class="learning-chip blue">总视频约 25小时50分</span></summary><div class="subject-burndown-body">${planRows}</div></details>${skillHtml}</div>` + r2card;
  bindInlineBurndown(keys);
  document.querySelectorAll('[data-en-r1]').forEach(x => { x.onchange = ev => { learningMark(LS.english.round1, x.dataset.enR1, ev.target.checked); renderLearningAll(); }; });
  document.querySelectorAll('[data-en-r2]').forEach(x => { x.onchange = ev => { learningMark(LS.english.round2, x.dataset.enR2, ev.target.checked); renderLearningAll(); }; });
  document.querySelectorAll('[data-en-skill]').forEach(x => { x.onchange = ev => { learningMark(LS.english.skills, x.dataset.enSkill, ev.target.checked); renderLearningAll(); }; });
  if ($('#doneNextR1')) $('#doneNextR1').onclick = () => { learningMark(LS.english.round1, nextEnglishLesson(LS.english.round1), true); renderLearningAll(); };
  if ($('#doneNextR2')) $('#doneNextR2').onclick = () => { learningMark(LS.english.round2, nextEnglishLesson(LS.english.round2), true); renderLearningAll(); };
  if ($('#doneNextSkill')) $('#doneNextSkill').onclick = () => { const id = nextSkillPlanId(); if (id) learningMark(LS.english.skills, id, true); renderLearningAll(); };
}

function renderLearningFinance() {
  const e = $('#learningPanel'), done = learningDoneCount(LS.finance.completions), next = nextFinanceDay(), pos = next ? financeExecPosition(next) : -1, item = next ? financeItem(next) : null, phase = next ? financePhaseByPosition(pos) : FINANCE_PHASES[3], k = learningTodayKey(), paused = !formalAdvanceAllowed(k);
  const phaseHtml = FINANCE_PHASES.map(p => `<div><small>${p.name}</small><b>${financePhaseDone(p)} / ${p.total}</b><div class="learning-source-note">${p.note}</div></div>`).join('');
  const list = FINANCE_EXEC_ORDER.map((d, idx) => { const x = financeItem(d), v = LS.finance.completions[String(d)], isdone = !!v; return `<label class="learning-item ${isdone ? 'done' : ''}"><input type="checkbox" data-fin="${d}" ${isdone ? 'checked' : ''}><div><div class="learning-item-title">实际 ${idx + 1} · 原 Day ${d} · ${esc(x.subject)}｜${esc(x.title)}</div><div class="learning-item-meta">${esc(financePhaseByPosition(idx).name)} · ${esc(x.target || '')} · 原表第 ${x.sourcePage} 页</div></div><span class="learning-item-date">${isdone ? esc(learningEntryDate(v)) : ''}</span></label>`; }).join('');
  e.innerHTML = (isMilitaryKey(k) ? '<div class="learning-status-box safe" style="margin-bottom:10px"><b>军训弹性保护</b>：今天可自愿完成财经正式 Day；不学也不欠账。</div>' : '') + burndownInlineHtml(['finance'], '财经进度趋势') + `<div class="learning-section-card"><h4>财经综合 · 会计优先闭环</h4><div class="learning-source-note">会计完整闭环 → 财管完整闭环 → 经济学完整闭环 → 三科收官（80 天不删内容）。</div><div class="learning-phase">${phaseHtml}</div></div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>下一项</h4>${item ? `<div class="learning-big-next">${phase.name} · 原 Day ${next} · ${esc(item.title)}</div><div class="learning-source-note">${esc(item.subject)} · ${esc(item.target || '')}</div>` : '<div class="learning-big-next">80 天全部完成</div>'}</div>${item && !paused ? '<button class="btn primary" id="doneNextFin" type="button">今天完成</button>' : ''}</div></div>
  <div class="learning-section-card"><h4>完整执行队列 · ${done}/80</h4><div class="learning-item-list">${list}</div></div>`;
  bindInlineBurndown(['finance']);
  document.querySelectorAll('[data-fin]').forEach(x => { x.onchange = ev => { if (!formalAdvanceAllowed(learningTodayKey()) && ev.target.checked) { ev.target.checked = false; alert('当前日期尚未进入正式推进阶段。'); return; } learningMark(LS.finance.completions, x.dataset.fin, ev.target.checked); renderLearningAll(); }; });
  if ($('#doneNextFin')) $('#doneNextFin').onclick = () => { learningMark(LS.finance.completions, nextFinanceDay(), true); renderLearningAll(); };
}

function renderLearningMath() {
  const e = $('#learningPanel'), done = learningDoneCount(LS.math.completions), next = nextMathDay(), x = next ? mathItem(next) : null, k = learningTodayKey(), paused = !formalAdvanceAllowed(k);
  const nextDetail = x ? `<div class="learning-course-detail"><b>视频：</b> ${x.lectures.length} 节 · ${durationHuman(mathDayDuration(x))}<ul>${x.lectures.map(l => `<li>${esc(l.title)}${l.duration ? ` <span class="learning-chip">${esc(l.duration)}</span>` : ''}</li>`).join('')}</ul><b>打铁：</b> ${x.drills.length ? `${Math.min(...x.drills)}—${Math.max(...x.drills)}（共 ${x.drills.length} 项）` : '无配套编号'}</div>` : '';
  const list = MATH_PLAN.map(item => { const v = LS.math.completions[String(item.day)], isdone = !!v; return `<div class="learning-item ${isdone ? 'done' : ''}"><input type="checkbox" data-math="${item.day}" ${isdone ? 'checked' : ''}><div><div class="learning-item-title">Day ${item.day} · ${item.lectures[0] ? esc(item.lectures[0].title.replace(/^第\d+讲-/, '')) : '高数学习'}</div><div class="learning-item-meta">${item.lectures.length} 节视频 · ${durationHuman(mathDayDuration(item))} · 打铁 ${item.drills.length ? `${Math.min(...item.drills)}—${Math.max(...item.drills)}` : '—'} · 第 ${item.sourcePage} 页</div><details class="learning-course-detail"><summary>查看当天明细</summary><ul>${item.lectures.map(l => `<li>${esc(l.title)}${l.duration ? ` · ${esc(l.duration)}` : ''}</li>`).join('')}</ul><div>打铁：${item.drills.join('、') || '—'}</div></details></div><span class="learning-item-date">${isdone ? esc(learningEntryDate(v)) : ''}</span></div>`; }).join('');
  e.innerHTML = (isMilitaryKey(k) ? '<div class="learning-status-box safe" style="margin-bottom:10px"><b>军训弹性保护</b>：今天可自愿完成高数正式 Day；不学也不欠账。</div>' : '') + burndownInlineHtml(['math'], '高数进度趋势') + `<div class="learning-section-card"><h4>高数 · 机构 48 天零基础计划</h4><div class="learning-source-note">保持原 48 天顺序，提前完成即刻前移，临时忙停在当前 Day 不产生逾期。</div></div>
  <div class="learning-section-card"><div class="learning-row spread"><div><h4>下一项</h4>${x ? `<div class="learning-big-next">高数 Day ${next}</div>` : '<div class="learning-big-next">48 天全部完成</div>'}</div>${x && !paused ? `<button class="btn primary" id="doneNextMath" type="button">今天完成 Day ${next}</button>` : ''}</div>${nextDetail}</div>
  <div class="learning-section-card"><h4>完整 48 天计划 · ${done}/48</h4><div class="learning-item-list">${list}</div></div>`;
  bindInlineBurndown(['math']);
  document.querySelectorAll('[data-math]').forEach(el => { el.onchange = ev => { if (!formalAdvanceAllowed(learningTodayKey()) && ev.target.checked) { ev.target.checked = false; alert('当前日期尚未进入正式推进阶段。'); return; } learningMark(LS.math.completions, el.dataset.math, ev.target.checked); renderLearningAll(); }; });
  if ($('#doneNextMath')) $('#doneNextMath').onclick = () => { learningMark(LS.math.completions, nextMathDay(), true); renderLearningAll(); };
}

function renderLearningCountdowns() {
  const e = $('#learningPanel'), today = learningTodayKey(), mine = learningAllCountdowns(), edit = editingCountdownId ? mine.find(x => x.id === editingCountdownId) : null;
  const list = mine.length ? mine.map(x => { const end = x.endDate || x.date, past = end < today, n = dayDiff(parse(x.date), learningTodayDate()); return `<div class="learning-countdown-row ${past ? 'past' : ''}"><div><div class="learning-countdown-title">${esc(x.title)} <span class="learning-chip">${esc(x.kind || '考试')}</span></div><div class="learning-countdown-meta">${countdownLabel(x)}${x.note ? ` · ${esc(x.note)}` : ''}</div></div><div class="learning-countdown-days ${n === 0 ? 'today' : ''}">${learningCountdownText(x.date, x.endDate)}</div><div class="countdown-actions"><button class="btn countdown-edit" type="button" data-countdown-edit="${x.id}">编辑</button><button class="x" type="button" data-countdown-remove="${x.id}" title="删除">×</button></div></div>`; }).join('') : '<div class="learning-empty">还没有倒数日。</div>';
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>${edit ? '编辑倒数日' : '添加考试 / 考证倒数日'}</h4><div class="learning-source-note">所有节点均支持修改与删除，可选结束日期用于考试窗口。</div></div>${edit ? '<button class="btn sm" id="cancelCountdownEdit" type="button">取消编辑</button>' : ''}</div><div class="learning-countdown-form v150"><input id="countdownTitle" type="text" autocomplete="off" data-lpignore="true" placeholder="考试 / 考证名称" value="${edit ? esc(edit.title) : ''}"><input id="countdownDate" type="date" value="${edit?.date || today}"><input id="countdownEndDate" type="date" value="${edit?.endDate || ''}" title="结束日期（可选）"><select id="countdownKind">${['考试', '考证', '升学考试', '报名', '面试', '其他'].map(k => `<option ${edit?.kind === k ? 'selected' : ''}>${k}</option>`).join('')}</select><input id="countdownNote" type="text" autocomplete="off" data-lpignore="true" placeholder="备注（可选）" value="${edit ? esc(edit.note) : ''}"><button class="btn primary" id="saveCountdownBtn" type="button">${edit ? '保存修改' : '添加'}</button></div></div><div class="learning-section-card"><div class="learning-row spread"><h4>我的倒数日 · ${mine.length}</h4><span class="learning-chip blue">全部可编辑 / 删除</span></div><div class="learning-countdown-list">${list}</div></div>`;
  $('#saveCountdownBtn').onclick = () => { if (edit) { if (saveCountdownEdit(edit.id, $('#countdownTitle').value, $('#countdownDate').value, $('#countdownEndDate').value, $('#countdownKind').value, $('#countdownNote').value)) { editingCountdownId = ''; renderLearningAll(); } } else addLearningCountdown($('#countdownTitle').value, $('#countdownDate').value, $('#countdownKind').value, $('#countdownNote').value, $('#countdownEndDate').value); };
  if ($('#cancelCountdownEdit')) $('#cancelCountdownEdit').onclick = () => { editingCountdownId = ''; renderLearningAll(); };
  document.querySelectorAll('[data-countdown-edit]').forEach(b => { b.onclick = () => { editingCountdownId = b.dataset.countdownEdit; renderLearningAll(); }; });
  document.querySelectorAll('[data-countdown-remove]').forEach(b => { b.onclick = () => { editingCountdownId = ''; removeLearningCountdown(b.dataset.countdownRemove); }; });
}

function renderRoadmap() {
  const e = $('#learningPanel'), events = learningAllCountdowns();
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><div><h4>2026—2029 年度路线图</h4><div class="learning-source-note">路线图直接读取“倒数日”，修改一次日期全站同步更新。</div></div><button class="btn sm" id="roadmapEditDates" type="button">管理日期</button></div></div><div class="roadmap">${[2026, 2027, 2028, 2029].map(y => { const theme = ROADMAP_THEMES[y] || ['阶段', ''], arr = events.filter(x => Number(x.date.slice(0, 4)) === y); return `<div class="roadmap-year"><div class="roadmap-year-label">${y}</div><div class="roadmap-card"><div class="roadmap-theme">${theme[0]}</div><div class="roadmap-note">${theme[1]}</div>${arr.length ? arr.map(x => `<div class="roadmap-event"><div><b>${esc(x.title)}</b><small>${esc(x.kind)} · ${countdownLabel(x)}${x.note ? ` · ${esc(x.note)}` : ''}</small></div><span class="learning-chip ${x.date >= learningTodayKey() ? 'blue' : ''}">${learningCountdownText(x.date, x.endDate)}</span></div>`).join('') : '<div class="learning-empty">这一年暂时没有固定考试节点。</div>'}</div></div>`; }).join('')}</div>`;
  $('#roadmapEditDates').onclick = () => { activeLearningTab = 'countdowns'; renderLearningAll(); };
}

function renderLearningSchedule() {
  const e = $('#learningPanel'), busy = Object.entries(LS.busyDates).sort((a, b) => a[0].localeCompare(b[0]));
  const milestones = [{ date: LEARNING_CONFIG.resumeDate, text: '军训结束：财经 / 高数恢复正常每日队列。' }, ...(LS.countdowns || []).map(x => ({ date: x.date, text: `${esc(x.title)} <span class="learning-chip">${esc(x.kind || '考试')}</span> · ${countdownLabel(x)}` }))].sort((a, b) => a.date.localeCompare(b.date));
  e.innerHTML = `<div class="learning-section-card"><div class="learning-row spread"><h4>计划节点</h4><button class="btn sm" id="scheduleEditCountdowns" type="button">编辑倒数日</button></div><div class="learning-mini-line"><b>10/12—10/25</b> · 军训弹性保护：英语照常；财经/高数可自愿推进不欠账。</div>${milestones.map(x => `<div class="learning-mini-line"><b>${x.date}</b> · ${x.text}</div>`).join('')}</div>
  <div class="learning-section-card"><h4>添加缓冲日</h4><div class="learning-free-row"><input id="busyDateInput" type="date" value="${learningTodayKey()}"><input id="busyReasonInput" type="text" autocomplete="off" data-lpignore="true" placeholder="例如：志愿活动 / 考试 / 临时作业"><button class="btn" id="addBusyDateBtn" type="button">设为缓冲</button></div><div class="learning-busy-list">${busy.length ? busy.map(([k, v]) => `<div class="learning-busy-row"><b>${k}</b><span>${esc(v.reason || '临时忙')}</span><button class="x" type="button" data-busy-remove="${k}">×</button></div>`).join('') : '<div class="learning-empty">暂无手动缓冲日。</div>'}</div></div>
  <div class="learning-section-card"><h4>调度规则</h4><div class="learning-status-box"><b>英语一轮：</b>10 Unit × 4 Lesson = 40 Lesson；固定 1 Lesson / 学习日，周一额外总复习，周六/调休不安排。<br><b>四级技巧：</b>与词汇并行，顺序为阅读 → 听力 → 翻译 → 写作。<br><b>财经：</b>会计优先闭环，原 Day 编号保留。<br><b>高数：</b>保持机构 48 天顺序。<br><b>缓冲：</b>临时忙不算失败；恢复后接着下一项。</div></div>`;
  $('#scheduleEditCountdowns').onclick = () => { activeLearningTab = 'countdowns'; renderLearningAll(); };
  $('#addBusyDateBtn').onclick = () => addBusyDate($('#busyDateInput').value, $('#busyReasonInput').value);
  document.querySelectorAll('[data-busy-remove]').forEach(b => { b.onclick = () => removeBusyDate(b.dataset.busyRemove); });
}

function v170RenderQuick() {
  const b = $('#v170QuickBody'); if (!b) return;
  const projects = LS.v170.projects.filter(p => p.status === 'active');
  b.innerHTML = `<div class="v170-quick-grid"><div class="v170-quick-card"><h4>马上开始学习</h4><p>直接进入计时器，不需要先翻计划。</p><button class="btn primary" id="v170QuickTimer" type="button">打开计时器</button> <button class="btn" id="v170QuickLow" type="button">切低负荷</button></div>
  <div class="v170-quick-card"><h4>快速加今日任务</h4><div class="v170-quick-form"><input id="v170QuickTask" type="text" autocomplete="off" placeholder="今天还要做什么"><button class="btn" id="v170QuickTaskAdd" type="button">添加</button></div></div>
  <div class="v170-quick-card"><h4>记录项目投入</h4><div class="v170-quick-form"><select id="v170QuickProject">${projects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('') || '<option value="">暂无进行中项目</option>'}</select><input id="v170QuickProjectMin" type="number" min="0" max="720" placeholder="分钟"><input id="v170QuickProjectNote" style="grid-column:1/-1" placeholder="推进了什么"><button class="btn" id="v170QuickProjectAdd" type="button">记录</button></div></div>
  <div class="v170-quick-card"><h4>生活也要记得过</h4><p>快速标记今天发生过的生活，不计分。</p><div class="v170-life-grid"><label class="v170-life-check"><input id="v170QLMove" type="checkbox"> 活动</label><label class="v170-life-check"><input id="v170QLSocial" type="checkbox"> 社交</label><label class="v170-life-check"><input id="v170QLHobby" type="checkbox"> 兴趣</label><label class="v170-life-check"><input id="v170QLOut" type="checkbox"> 户外</label></div><button class="btn" id="v170QuickLifeSave" type="button" style="margin-top:8px">保存生活标记</button></div></div>`;
  $('#v170QuickTimer').onclick = () => { $('#v170QuickModal').classList.remove('show'); openLearning('timer'); };
  $('#v170QuickLow').onclick = () => { setEnergy('low', learningTodayKey()); v156Toast('✓ 今天切到低负荷', true); $('#v170QuickModal').classList.remove('show'); };
  $('#v170QuickTaskAdd').onclick = () => { const text = $('#v170QuickTask').value.trim(); if (!text) return; const k = learningTodayKey(); T[k] = T[k] || []; T[k].push({ id: uuid(), text, priority: 'medium', done: false, reminder: '', createdAt: v170Stamp() }); S.s('tasks', T); renderCal(); renderSide(); v156Toast('✓ 今日任务已添加', true); $('#v170QuickTask').value = ''; };
  $('#v170QuickProjectAdd').onclick = () => { const id = $('#v170QuickProject').value; if (id) v170AddProjectLog(id, learningTodayKey(), $('#v170QuickProjectMin').value, $('#v170QuickProjectNote').value); };
  $('#v170QuickLifeSave').onclick = () => { const old = v170LifeRecord(); v170SaveLife(learningTodayKey(), { ...old, move: old.move || $('#v170QLMove').checked, social: old.social || $('#v170QLSocial').checked, hobby: old.hobby || $('#v170QLHobby').checked, outdoors: old.outdoors || $('#v170QLOut').checked }); $('#v170QuickModal').classList.remove('show'); };
}

/* ===== 快照、备份、云同步与诊断 ===== */
function snapshotData() { return { version: 21, savedAt: v170Stamp(), tasks: T, recurringTasks: RT, weekGoals: WG, monthGoals: MG, deadlineGoals: DG, scheduleOverrides: SO, scheduleConfig: SC, reflections: R, anniversaries: A, reviewNotes: S.g('reviewNotes', {}), aiSummaries: S.g('aiSummaries', {}), learningState: LS }; }
function applySnapshot(data) {
  if (!data || typeof data !== 'object') throw new Error('invalid data');
  syncSuppressed = true;
  try {
    T = data.tasks || {}; RT = (data.recurringTasks || []).map(r => ({ ...r, endDate: r.endDate || '', doneDates: r.doneDates || [], skipDates: r.skipDates || [] }));
    WG = data.weekGoals || {}; MG = data.monthGoals || {}; DG = (data.deadlineGoals || []).map(g => ({ ...g, id: g.id || uuid(), priority: g.priority || 'medium', done: !!g.done, completedAt: g.completedAt || '' }));
    SO = data.scheduleOverrides || {}; SC = data.scheduleConfig || { disabledCourseIds: [] }; if (!Array.isArray(SC.disabledCourseIds)) SC.disabledCourseIds = [];
    R = data.reflections || {}; A = (data.anniversaries || []).map(a => ({ ...a, id: a.id || uuid() })); LS = normalizeLearningState(data.learningState || {});
    originalSet('tasks', T); originalSet('recurringTasks', RT); originalSet('weekGoals', WG); originalSet('monthGoals', MG); originalSet('deadlineGoals', DG);
    originalSet('scheduleOverrides', SO); originalSet('scheduleConfig', SC); originalSet('reflections', R); originalSet('anniversaries', A);
    originalSet('reviewNotes', data.reviewNotes || {}); originalSet('aiSummaries', data.aiSummaries || {}); originalSet('learningState', LS);
  } finally { syncSuppressed = false; }
  syncStudyTimerLoop(); renderCal(); renderSide(); renderAnniv(); renderStreak(); renderAIStored(); renderLearningOverview();
}
function v170Counts(data = snapshotData()) {
  const ls = data?.learningState || {}, q = ls.quality || {}, v = ls.v170 || {};
  return { tasks: Object.values(data.tasks || {}).reduce((n, a) => n + (Array.isArray(a) ? a.length : 0), 0), study: Array.isArray(ls.studyTimer?.sessions) ? ls.studyTimer.sessions.length : 0, sleep: Object.keys(ls.sleep?.records || {}).length, retrieval: Array.isArray(q.retrievalTests) ? q.retrievalTests.length : 0, errors: Array.isArray(q.errorChecks) ? q.errorChecks.length : 0, projects: Array.isArray(v.projects) ? v.projects.length : 0, life: Object.keys(v.life?.checkins || {}).length };
}
function v160BackupHistory() { try { const x = JSON.parse(localStorage.getItem(V160_BACKUP_KEY) || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } }
function v160SetBackupHistory(arr) { try { localStorage.setItem(V160_BACKUP_KEY, JSON.stringify(arr.slice(0, 7))); return true; } catch { return false; } }
function v160CreateSafetyBackup(reason = '手动快照', quiet = false) {
  const data = snapshotData(), item = { id: uuid(), reason, dateKey: learningTodayKey(), createdAt: v170Stamp(), counts: v170Counts(data), data };
  let arr = v160BackupHistory(); arr.unshift(item); arr = arr.slice(0, 7);
  if (!v160SetBackupHistory(arr)) { try { v160SetBackupHistory(arr.slice(0, 2)); } catch {} if (!quiet) alert('浏览器存储空间不足，请先导出 JSON。'); return null; }
  v160RenderBackupHistory(); if (!quiet) v156Toast('✓ 已创建安全快照', true); return item;
}
function v160ExportSnapshot(item) { const blob = new Blob([JSON.stringify(item.data, null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `苏伊温德日历_内部快照_${String(item.createdAt).slice(0, 10)}_${item.reason}.json`; a.click(); URL.revokeObjectURL(a.href); }
function v160RestoreSnapshot(id) {
  const item = v160BackupHistory().find(x => x.id === id); if (!item) return;
  if (!confirm(`恢复“${item.reason}”快照？\n创建时间：${fmtSyncTime(item.createdAt)}\n\n当前数据会先留一份操作前快照。`)) return;
  v160CreateSafetyBackup('恢复内部快照前', true); applySnapshot(item.data);
  saveSyncMeta({ ...syncMeta(), localUpdatedAt: v170Stamp(), conflict: false }); markCloudDirty();
  setCloudStatus(sbUser ? 'busy' : 'off', sbUser ? '本地已恢复 · 待上传' : '已恢复 · 仅本地'); v160RenderBackupHistory();
  alert('内部快照已恢复。确认无误后可手动点击“上传本地数据”。');
}
function v160DeleteSnapshot(id) { if (!confirm('删除这份内部快照？')) return; v160SetBackupHistory(v160BackupHistory().filter(x => x.id !== id)); v160RenderBackupHistory(); }
function v160RenderBackupHistory() {
  const e = $('#v160BackupHistory'); if (!e) return;
  const arr = v160BackupHistory();
  e.innerHTML = arr.length ? arr.map(x => `<div class="v160-backup-row"><div><b>${esc(x.reason)} · ${fmtSyncTime(x.createdAt)}</b><small>学习 ${x.counts?.study || 0} · 睡眠 ${x.counts?.sleep || 0} · 项目 ${x.counts?.projects || 0} · 生活 ${x.counts?.life || 0}</small></div><div class="v160-backup-actions"><button class="btn sm" type="button" data-v160-backup-export="${x.id}">导出</button><button class="btn sm" type="button" data-v160-backup-restore="${x.id}">恢复</button><button class="x" type="button" data-v160-backup-delete="${x.id}">×</button></div></div>`).join('') + '<div class="v170-history-note">最多保留 7 份。导入/下载前自动留档；日常修改每 30 分钟最多留一份滚动历史。</div>' : '<div class="learning-empty">还没有内部快照。</div>';
  document.querySelectorAll('[data-v160-backup-export]').forEach(b => { b.onclick = () => { const x = v160BackupHistory().find(i => i.id === b.dataset.v160BackupExport); if (x) v160ExportSnapshot(x); }; });
  document.querySelectorAll('[data-v160-backup-restore]').forEach(b => { b.onclick = () => v160RestoreSnapshot(b.dataset.v160BackupRestore); });
  document.querySelectorAll('[data-v160-backup-delete]').forEach(b => { b.onclick = () => v160DeleteSnapshot(b.dataset.v160BackupDelete); });
}
function v160EnsureDailyBackup() { const today = learningTodayKey(); if (!v160BackupHistory().some(x => (x.dateKey || beijingDateKey(x.createdAt || '')) === today)) v160CreateSafetyBackup('每日自动快照', true); v160RenderBackupHistory(); }
function v170UndoLatest() { const arr = v160BackupHistory(); if (!arr.length) { alert('还没有可恢复的内部快照。'); return; } v160RestoreSnapshot(arr[0].id); }
function exportData() { const blob = new Blob([JSON.stringify(snapshotData(), null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `苏伊温德日历备份_${fmt(now)}.json`; a.click(); URL.revokeObjectURL(a.href); }
async function importData(file) {
  v160CreateSafetyBackup('导入 JSON 前', true);
  try {
    const data = JSON.parse(await file.text()); if (!data || typeof data !== 'object') throw new Error();
    if (!confirm('导入会用备份数据替换当前日历数据，继续吗？')) return;
    applySnapshot(data); alert('本地备份已恢复。若要让云端也采用这份数据，请再点击“上传本地数据”。');
  } catch { alert('无法读取这个备份文件。'); }
}

function studyLedger(raw) { const st = raw?.learningState?.studyTimer || raw?.studyTimer || {}; return { sessions: Array.isArray(st.sessions) ? st.sessions : [], deleted: Array.isArray(st.deletedSessionIds) ? st.deletedSessionIds : [] }; }
function mergeStudyLedger(localSessions, localDeleted, remoteSessions, remoteDeleted) {
  const deleted = new Set([...(localDeleted || []), ...(remoteDeleted || [])]), byId = new Map();
  for (const x of [...(remoteSessions || []), ...(localSessions || [])]) { if (!x || !x.id || deleted.has(x.id)) continue; const prev = byId.get(x.id); if (!prev || String(x.recordedAt || x.endAt || '') >= String(prev.recordedAt || prev.endAt || '')) byId.set(x.id, x); }
  let sessions = [...byId.values()];
  for (const rec of sessions.filter(x => x?.recoveryKey)) { const twin = sessions.find(x => x !== rec && !x?.recoveryKey && x.subject === rec.subject && sessionDate(x) === sessionDate(rec) && Math.abs(Number(x.focusSeconds || 0) - Number(rec.focusSeconds || 0)) <= 120 && Math.abs(Date.parse(x.startAt || 0) - Date.parse(rec.startAt || 0)) <= 20 * 60 * 1000); if (twin) sessions = sessions.filter(x => x !== rec); }
  return { sessions: sessions.sort((a, b) => String(a.startAt || '').localeCompare(String(b.startAt || ''))), deletedSessionIds: [...deleted].slice(-1000) };
}
function sleepRecordsFromPayload(payload) { const r = payload?.learningState?.sleep?.records; return r && typeof r === 'object' && !Array.isArray(r) ? r : {}; }
function mergeSleepRecords(l, r) {
  l = l && typeof l === 'object' ? l : {}; r = r && typeof r === 'object' ? r : {}; const out = {};
  for (const k of new Set([...Object.keys(r), ...Object.keys(l)])) { const a = l[k], b = r[k]; out[k] = (a && b) ? ((Date.parse(b.updatedAt || '') || 0) > (Date.parse(a.updatedAt || '') || 0) ? b : a) : (a || b); }
  return out;
}
function v170MergeItems(local, remote, tombs = []) {
  const dead = new Set(tombs || []), m = new Map();
  for (const x of [...(remote || []), ...(local || [])]) { if (!x?.id || dead.has(x.id)) continue; const prev = m.get(x.id); if (!prev || (Date.parse(x.updatedAt || x.createdAt || '') || 0) >= (Date.parse(prev.updatedAt || prev.createdAt || '') || 0)) m.set(x.id, x); }
  return [...m.values()];
}
function v170MergeProjects(local, remote, tombs = [], mTombs = [], lTombs = []) {
  const dead = new Set(tombs || []), lm = new Map((local || []).map(x => [x.id, v170NormalizeProject(x)])), rm = new Map((remote || []).map(x => [x.id, v170NormalizeProject(x)])), out = [];
  for (const id of new Set([...lm.keys(), ...rm.keys()])) {
    if (dead.has(id)) continue;
    const a = lm.get(id), b = rm.get(id);
    if (!a) { const x = v170NormalizeProject(b); x.milestones = v170MergeItems([], x.milestones, mTombs); x.logs = v170MergeItems([], x.logs, lTombs); out.push(x); continue; }
    if (!b) { const x = v170NormalizeProject(a); x.milestones = v170MergeItems(x.milestones, [], mTombs); x.logs = v170MergeItems(x.logs, [], lTombs); out.push(x); continue; }
    const base = (Date.parse(a.updatedAt) || 0) >= (Date.parse(b.updatedAt) || 0) ? { ...a } : { ...b };
    base.milestones = v170MergeItems(a.milestones, b.milestones, mTombs); base.logs = v170MergeItems(a.logs, b.logs, lTombs); out.push(v170NormalizeProject(base));
  }
  return out;
}
function v170MergeCheckins(l, r) { const out = {}; for (const k of new Set([...Object.keys(r || {}), ...Object.keys(l || {})])) { const a = l?.[k], b = r?.[k]; out[k] = (a && b) ? ((Date.parse(b.updatedAt || '') || 0) > (Date.parse(a.updatedAt || '') || 0) ? b : a) : (a || b); } return out; }
function v170MergedState(local, remote) {
  const a = v170NormalizeState(local), b = v170NormalizeState(remote), t = { projects: [...new Set([...a.tombstones.projects, ...b.tombstones.projects])], milestones: [...new Set([...a.tombstones.milestones, ...b.tombstones.milestones])], logs: [...new Set([...a.tombstones.logs, ...b.tombstones.logs])], retrieval: [...new Set([...a.tombstones.retrieval, ...b.tombstones.retrieval])], errors: [...new Set([...a.tombstones.errors, ...b.tombstones.errors])] };
  return { version: 1, projects: v170MergeProjects(a.projects, b.projects, t.projects, t.milestones, t.logs), life: { checkins: v170MergeCheckins(a.life.checkins, b.life.checkins) }, settings: a.settings, migrations: { ...b.migrations, ...a.migrations }, tombstones: t };
}
function mergeRemoteStudyLedgerIntoLocal(remotePayload, { persist = true } = {}) {
  const before = JSON.stringify([LS.studyTimer.sessions, LS.studyTimer.deletedSessionIds || [], LS.sleep?.records, LS.quality, LS.v170]);
  const remote = studyLedger(remotePayload), mergedLedger = mergeStudyLedger(LS.studyTimer.sessions, LS.studyTimer.deletedSessionIds, remote.sessions, remote.deleted), sleepMerged = mergeSleepRecords(LS.sleep?.records || {}, sleepRecordsFromPayload(remotePayload));
  const rls = remotePayload?.learningState || {}, mergedV = v170MergedState(LS.v170, rls.v170), tr = new Set(mergedV.tombstones.retrieval), te = new Set(mergedV.tombstones.errors), rq = rls.quality || {};
  LS.studyTimer.sessions = mergedLedger.sessions; LS.studyTimer.deletedSessionIds = mergedLedger.deletedSessionIds; LS.sleep = { records: sleepMerged };
  LS.quality = { retrievalTests: v170MergeItems(LS.quality.retrievalTests, rq.retrievalTests || [], tr), errorChecks: v170MergeItems(LS.quality.errorChecks, rq.errorChecks || [], te) };
  LS.v170 = mergedV;
  const changed = before !== JSON.stringify([LS.studyTimer.sessions, LS.studyTimer.deletedSessionIds || [], LS.sleep?.records, LS.quality, LS.v170]);
  if (changed && persist) { originalSet('learningState', LS); renderLearningOverview(); renderLearningMini(); renderV160TodayCommand(); if ($('#learningModal')?.classList.contains('show')) renderLearningPanel(); }
  return changed;
}
function stableCloneWithoutStudyLedger(payload) {
  const x = JSON.parse(JSON.stringify(payload || {})); delete x.savedAt; delete x.version;
  if (x.learningState) { delete x.learningState.version; if (x.learningState.studyTimer) { x.learningState.studyTimer.sessions = []; x.learningState.studyTimer.deletedSessionIds = []; x.learningState.studyTimer.active = null; } if (x.learningState.sleep) x.learningState.sleep.records = {}; x.learningState.quality = { retrievalTests: [], errorChecks: [] }; x.learningState.v170 = v170DefaultState(); }
  return x;
}
function stableStringify(v) { return (v === null || typeof v !== 'object') ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(stableStringify).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}'; }
function studyOnlyDifference(a, b) { return stableStringify(stableCloneWithoutStudyLedger(a)) === stableStringify(stableCloneWithoutStudyLedger(b)); }
function v170PrepareRemotePayload(remotePayload) {
  const x = JSON.parse(JSON.stringify(remotePayload || {})); x.learningState = x.learningState || {};
  const mergedLedger = mergeStudyLedger(LS.studyTimer.sessions, LS.studyTimer.deletedSessionIds, studyLedger(x).sessions, studyLedger(x).deleted), mergedSleep = mergeSleepRecords(LS.sleep?.records || {}, sleepRecordsFromPayload(x));
  x.learningState.studyTimer = { ...(x.learningState.studyTimer || {}), sessions: mergedLedger.sessions, deletedSessionIds: mergedLedger.deletedSessionIds, active: LS.studyTimer.active };
  x.learningState.sleep = { records: mergedSleep };
  const mv = v170MergedState(LS.v170, x.learningState.v170), tr = new Set(mv.tombstones.retrieval), te = new Set(mv.tombstones.errors), rq = x.learningState.quality || {};
  x.learningState.quality = { retrievalTests: v170MergeItems(LS.quality.retrievalTests, rq.retrievalTests || [], tr), errorChecks: v170MergeItems(LS.quality.errorChecks, rq.errorChecks || [], te) };
  x.learningState.v170 = mv; return x;
}

let sb = null, sbUser = null, sbAuthSubscription = null, sbConfigFingerprint = '', sbSessionRestoring = false, sbRestorePromise = null;
const cloudCfg = () => S.g('cloudConfig', { url: '', key: '' });
const cloudCfgFingerprint = c => `${String(c?.url || '').trim()}::${String(c?.key || '').trim()}`;
const syncMeta = () => S.g('syncMeta', { localUpdatedAt: '', lastSyncedAt: '', lastSyncedCloudAt: '', cloudUpdatedAt: '', conflict: false });
function saveSyncMeta(patch) { const next = { ...syncMeta(), ...patch }; originalSet('syncMeta', next); renderSyncMeta(); return next; }
function fmtSyncTime(v) { if (!v) return '—'; const d = new Date(v); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('zh-CN', { timeZone: LEARNING_TIME_ZONE, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }); }
const isAfter = (a, b, slack = 700) => !a ? false : !b ? true : new Date(a).getTime() > new Date(b).getTime() + slack;
const localIsDirty = (m = syncMeta()) => !!m.localUpdatedAt && (!m.lastSyncedAt || isAfter(m.localUpdatedAt, m.lastSyncedAt, 0));
const remoteChangedSinceSync = (remoteAt, m = syncMeta()) => !!remoteAt && !!m.lastSyncedCloudAt && isAfter(remoteAt, m.lastSyncedCloudAt);
function renderSyncMeta() {
  const m = syncMeta();
  if ($('#localUpdatedLabel')) $('#localUpdatedLabel').textContent = fmtSyncTime(m.localUpdatedAt);
  if ($('#cloudUpdatedLabel')) $('#cloudUpdatedLabel').textContent = fmtSyncTime(m.cloudUpdatedAt);
  if ($('#lastSyncedLabel')) $('#lastSyncedLabel').textContent = fmtSyncTime(m.lastSyncedAt);
  if ($('#syncStateLabel')) $('#syncStateLabel').textContent = m.conflict ? '⚠ 需要处理冲突' : (sbSessionRestoring && !sbUser ? '恢复登录中' : (sbUser ? '正常' : '未登录'));
  if ($('#syncConflictBox')) $('#syncConflictBox').classList.toggle('show', !!m.conflict);
}
function setCloudStatus(state, text) { const dot = $('#cloudDot'); if (dot) dot.className = 'cloud-dot' + (state === 'on' ? ' on' : state === 'busy' ? ' busy' : ''); if ($('#cloudText')) $('#cloudText').textContent = text; }
async function fetchCloudState() { return (!sb || !sbUser) ? { data: null, error: null } : await sb.from('calendar_state').select('payload,updated_at').eq('user_id', sbUser.id).maybeSingle(); }
async function refreshCloudMeta() {
  if (!sb || !sbUser) { renderSyncMeta(); return; }
  const { data, error } = await fetchCloudState(); if (error) return;
  const cloudAt = data?.updated_at || ''; if (data?.payload) mergeRemoteStudyLedgerIntoLocal(data.payload);
  const m = syncMeta();
  if (cloudAt && !m.lastSyncedCloudAt) { const baseline = v170Stamp(); saveSyncMeta({ cloudUpdatedAt: cloudAt, lastSyncedCloudAt: cloudAt, lastSyncedAt: m.lastSyncedAt || baseline, localUpdatedAt: m.localUpdatedAt || baseline, conflict: false }); return; }
  const conflict = localIsDirty(m) && remoteChangedSinceSync(cloudAt, m);
  saveSyncMeta({ cloudUpdatedAt: cloudAt, conflict }); if (conflict) setCloudStatus('off', '发现冲突');
}
async function recoverSupabaseSession() {
  if (!sb) return null; if (sbRestorePromise) return sbRestorePromise;
  const client = sb; sbSessionRestoring = true; if (!sbUser) setCloudStatus('busy', '恢复登录'); updateCloudUI();
  sbRestorePromise = (async () => {
    try {
      const { data, error } = await client.auth.getSession(); if (client !== sb) return null;
      const session = data?.session || null; if (error && !session) throw error;
      if (!session) { sbUser = null; setCloudStatus('off', '未登录'); return null; }
      sbUser = session.user || sbUser || null;
      if (!sbUser) { const ur = await client.auth.getUser(); if (client !== sb) return null; if (ur?.data?.user) sbUser = ur.data.user; }
      if (sbUser) { setCloudStatus('on', error ? '待联网' : '已同步'); setTimeout(() => { if (client === sb && sbUser) refreshCloudMeta(); }, 0); }
      else setCloudStatus('busy', '待联网');
      return sbUser;
    } catch { if (client === sb) setCloudStatus('off', '网络异常'); return sbUser; }
    finally { if (client === sb) { sbSessionRestoring = false; updateCloudUI(); } sbRestorePromise = null; }
  })();
  return sbRestorePromise;
}
function initSupabase(force = false) {
  const c = cloudCfg();
  if (!c.url || !c.key || !window.supabase) { if (sbAuthSubscription?.unsubscribe) sbAuthSubscription.unsubscribe(); sbAuthSubscription = null; sb = null; sbUser = null; sbConfigFingerprint = ''; setCloudStatus('off', '仅本地'); updateCloudUI(); return null; }
  const fp = cloudCfgFingerprint(c); if (sb && sbConfigFingerprint === fp && !force) { if (!sbUser && !sbSessionRestoring) recoverSupabaseSession(); return sb; }
  if (sbAuthSubscription?.unsubscribe) sbAuthSubscription.unsubscribe();
  sbAuthSubscription = null; sbRestorePromise = null; sbSessionRestoring = false; sbUser = null;
  try { sb = window.supabase.createClient(c.url, c.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }); } catch { sb = null; }
  if (!sb) { sbConfigFingerprint = ''; setCloudStatus('off', '配置错误'); updateCloudUI(); return null; }
  sbConfigFingerprint = fp; setCloudStatus('busy', '恢复登录');
  const listener = sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') { sbUser = null; setCloudStatus('off', '未登录'); }
    else if (session) { sbUser = session.user || sbUser || null; setCloudStatus(sbUser ? 'on' : 'busy', sbUser ? '已登录' : '续期中'); }
    updateCloudUI(); renderSyncMeta(); if (sbUser) setTimeout(() => refreshCloudMeta(), 0);
  });
  sbAuthSubscription = listener?.data?.subscription || null; recoverSupabaseSession(); return sb;
}
function updateCloudUI() {
  const user = sbUser;
  if (sbSessionRestoring && !user) { $('#accountTitle').textContent = '正在恢复本设备登录…'; $('#accountInfo').textContent = '正在读取已保存的登录状态并自动续期，请稍候。'; }
  else { $('#accountTitle').textContent = user ? `已登录 · ${user.email || '账号'}` : '未登录'; $('#accountInfo').textContent = user ? '本设备已开启长期登录与自动续期。' : '登录一次后，本设备会持久保存登录状态并自动续期。'; }
  $('#signOutBtn').disabled = !user; $('#uploadCloud').disabled = !user; $('#downloadCloud').disabled = !user; renderSyncMeta();
}
function ensureSupabaseReady() {
  const c = cloudCfg(); if (!c.url || !c.key) { alert('请先填写并保存 Supabase Project URL 和 publishable key。'); return false; }
  if (!window.supabase) { alert('云同步组件没有加载成功。'); return false; }
  if (!sb) initSupabase(); if (!sb) { alert('Supabase 配置无法初始化。'); return false; }
  return true;
}
async function saveCloudConfig() {
  const url = $('#sbUrl').value.trim(), key = $('#sbKey').value.trim(); if (!url || !key) { alert('请完整填写 Supabase Project URL 和 key。'); return; }
  S.s('cloudConfig', { url, key }); const client = initSupabase(true);
  setTimeout(() => { recoverSupabaseSession().then(retryPendingCloudSync); }, 800);
  alert(client ? '云端配置已保存。' : '配置已保存，但初始化失败。');
}
async function signUp() {
  if (!ensureSupabaseReady()) return; const email = $('#sbEmail').value.trim(), password = $('#sbPassword').value; if (!email || !password) { alert('请填写邮箱和密码。'); return; }
  setCloudStatus('busy', '注册中'); const { data, error } = await sb.auth.signUp({ email, password });
  if (error) { alert(error.message); setCloudStatus('off', '注册失败'); return; }
  if (data.session) { sbUser = data.user || null; updateCloudUI(); setCloudStatus('on', '已登录'); alert('注册并登录成功。'); }
  else { sbUser = null; updateCloudUI(); setCloudStatus('off', '请验证邮箱'); alert('注册成功，请先到邮箱完成验证。'); }
}
async function signIn() {
  if (!ensureSupabaseReady()) return; const email = $('#sbEmail').value.trim(), password = $('#sbPassword').value; if (!email || !password) { alert('请填写邮箱和密码。'); return; }
  setCloudStatus('busy', '登录中'); const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { alert(error.message); setCloudStatus('off', '登录失败'); return; }
  sbUser = data.user; updateCloudUI(); setCloudStatus('on', '已登录'); await refreshCloudMeta();
}
async function signOut() { if (sb) await sb.auth.signOut(); sbUser = null; updateCloudUI(); setCloudStatus('off', '未登录'); }
async function uploadCloud(silent = false, force = false) {
  if (!sb || !sbUser) { if (!silent) alert('请先登录云端账号。'); return; }
  setCloudStatus('busy', '检查云端'); const current = await fetchCloudState();
  if (current.error) { setCloudStatus('off', '同步失败'); if (!silent) alert(current.error.message); return; }
  const remoteAt = current.data?.updated_at || '', m = syncMeta(), beforeMerge = snapshotData(), remotePayload = current.data?.payload || null;
  if (remotePayload) mergeRemoteStudyLedgerIntoLocal(remotePayload);
  const afterMerge = snapshotData(); let conflict = remoteChangedSinceSync(remoteAt, m) && localIsDirty(m);
  if (conflict && remotePayload && studyOnlyDifference(beforeMerge, remotePayload)) conflict = false;
  if (conflict && !force) {
    saveSyncMeta({ cloudUpdatedAt: remoteAt, conflict: true }); setCloudStatus('off', '发现冲突'); if (silent) return;
    if (!confirm(`检测到同步冲突：\n\n本地：${fmtSyncTime(m.localUpdatedAt)}\n云端：${fmtSyncTime(remoteAt)}\n\n继续上传将覆盖云端其他数据，确定吗？`)) return;
  }
  setCloudStatus('busy', '上传中'); const stamp = v170Stamp();
  const { data, error } = await sb.from('calendar_state').upsert({ user_id: sbUser.id, payload: afterMerge, updated_at: stamp }, { onConflict: 'user_id' }).select('updated_at').single();
  if (error) { setCloudStatus('off', '同步失败'); if (!silent) alert(error.message); return; }
  const cloudAt = data?.updated_at || stamp, syncedAt = v170Stamp();
  saveSyncMeta({ lastSyncedCloudAt: cloudAt, cloudUpdatedAt: cloudAt, lastSyncedAt: syncedAt, localUpdatedAt: syncedAt, conflict: false });
  clearCloudDirty(); setCloudStatus('on', '已同步'); if (!silent) v156Toast('✓ 本地数据已安全上传到云端', true);
}
async function downloadCloud(force = false) {
  v160CreateSafetyBackup('下载云端前', true);
  if (!sb || !sbUser) { alert('请先登录云端账号。'); return; }
  setCloudStatus('busy', '检查云端'); const { data, error } = await fetchCloudState();
  if (error) { setCloudStatus('off', '下载失败'); alert(error.message); return; }
  if (!data?.payload) { setCloudStatus('on', '云端为空'); alert('云端还没有日历数据。'); return; }
  const m = syncMeta(), remoteAt = data.updated_at || '', dirty = localIsDirty(m);
  if (dirty && !force) { if (!confirm(`本机存在未同步修改。\n本地：${fmtSyncTime(m.localUpdatedAt)}\n云端：${fmtSyncTime(remoteAt)}\n可合并账本会安全合并，其他数据以云端为准，继续吗？`)) { setCloudStatus('on', '已登录'); return; } }
  else if (!confirm(`云端更新时间：${fmtSyncTime(remoteAt)}。\n可合并账本会安全合并，其他数据使用云端版本，继续吗？`)) { setCloudStatus('on', '已登录'); return; }
  applySnapshot(v170PrepareRemotePayload(data.payload));
  const syncedAt = v170Stamp(); saveSyncMeta({ lastSyncedCloudAt: remoteAt, cloudUpdatedAt: remoteAt, lastSyncedAt: syncedAt, localUpdatedAt: syncedAt, conflict: false });
  clearCloudDirty(); setCloudStatus('on', '已同步'); v156Toast('✓ 云端数据已恢复并合并账本', true);
}
function markCloudDirty() { cloudDirty = true; try { localStorage.setItem('zx_cloudDirty', '1'); } catch {} }
function clearCloudDirty() { cloudDirty = false; try { localStorage.removeItem('zx_cloudDirty'); } catch {} }
function flushCloudSyncOnLeave() { if (cloudDirty) try { localStorage.setItem('zx_cloudDirty', '1'); } catch {} }
function retryPendingCloudSync() { try { if (localStorage.getItem('zx_cloudDirty') === '1') { cloudDirty = true; setTimeout(() => { if (sb && sbUser) uploadCloud(true); }, 1800); } } catch {} }
function scheduleCloudSync() { clearTimeout(syncTimer); syncTimer = setTimeout(async () => { if (!sb || !sbUser) return; if (syncMeta().conflict) { setCloudStatus('off', '发现冲突'); return; } await uploadCloud(true); }, 1800); }
async function recoverSessionAndRetrySync() { if (!sb && window.supabase) initSupabase(); if (sb) await recoverSupabaseSession(); if (sbUser) await refreshCloudMeta(); retryPendingCloudSync(); }

async function v160StorageEstimate() { try { if (navigator.storage?.estimate) { const x = await navigator.storage.estimate(); return { usage: Number(x.usage) || 0, quota: Number(x.quota) || 0 }; } } catch {} return { usage: 0, quota: 0 }; }
const v160Bytes = n => !n ? '—' : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;
function v160LocalStorageBytes() { let n = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k) || ''; n += (k.length + v.length) * 2; } } catch {} return n; }
const v160DiagCard = (label, value, cls = '') => `<div class="v160-diag ${cls}"><small>${esc(label)}</small><b>${esc(value)}</b></div>`;

async function v160RunDiagnostics() {
  const out = $('#v160Diagnostics'); if (!out) return;
  out.innerHTML = '<div class="learning-empty">正在检查……</div>';
  const lc = v170Counts(snapshotData()), m = syncMeta(), storage = await v160StorageEstimate(), backups = v160BackupHistory();
  let cloud = null, cloudAt = '', cloudErr = '';
  if (sb && sbUser) { try { const r = await fetchCloudState(); if (r.error) cloudErr = r.error.message || '读取失败'; else if (r.data?.payload) { cloud = v170Counts(r.data.payload); cloudAt = r.data.updated_at || ''; } } catch (e) { cloudErr = String(e?.message || e); } }
  let cache = '未检测'; try { if ('caches' in window) { const keys = await caches.keys(); cache = keys.filter(x => x.includes('suiwind-calendar')).join(', ') || '无缓存'; } } catch {}
  const compare = (l, c) => c == null ? '云端未读取' : `${l} / 云端 ${c}${l === c ? ' ✓' : '（请对照同步时间）'}`;
  out.innerHTML = `<div class="v160-diagnostics-grid">${v160DiagCard('App 版本', APP_VERSION, 'good')}${v160DiagCard('同步状态', m.conflict ? '需要处理冲突' : (sbUser ? '已登录' : '仅本地'), m.conflict ? 'warn' : (sbUser ? 'good' : ''))}${v160DiagCard('学习记录', cloud ? compare(lc.study, cloud.study) : String(lc.study), cloud && lc.study === cloud.study ? 'good' : '')}${v160DiagCard('睡眠记录', cloud ? compare(lc.sleep, cloud.sleep) : String(lc.sleep), cloud && lc.sleep === cloud.sleep ? 'good' : '')}${v160DiagCard('学习质量', `延迟提取 ${lc.retrieval} · 错误率 ${lc.errors}`)}${v160DiagCard('固定课表', activeCourseList().length ? `已导入 ${activeCourseList().length} 门（本地私密）` : '未导入（公网源码零泄露）', 'good')}${v160DiagCard('云端最后修改', cloudAt ? fmtSyncTime(cloudAt) : (cloudErr || '未读取'), cloudErr ? 'warn' : '')}${v160DiagCard('本地最后修改', fmtSyncTime(m.localUpdatedAt))}${v160DiagCard('最近成功同步', fmtSyncTime(m.lastSyncedAt))}${v160DiagCard('内部快照', `${backups.length}/7 · 最近 ${backups[0] ? fmtSyncTime(backups[0].createdAt) : '—'}`, backups.length ? 'good' : 'warn')}${v160DiagCard('Service Worker 缓存', cache, cache.includes(APP_CACHE_TAG) ? 'good' : 'warn')}${v160DiagCard('浏览器存储', storage.usage ? `${v160Bytes(storage.usage)} / ${v160Bytes(storage.quota)}` : v160Bytes(v160LocalStorageBytes()))}</div>`;
}
async function v170CompareCloud() {
  const box = $('#v170CloudCompare'); if (!box) return;
  const local = v170Counts(snapshotData());
  if (!sb || !sbUser) { box.innerHTML = '<div class="learning-empty">未登录云端，当前只需保护本地备份。</div>'; return; }
  box.innerHTML = '<div class="learning-empty">正在比较……</div>';
  const { data, error } = await fetchCloudState();
  if (error || !data?.payload) { box.innerHTML = `<div class="learning-empty">${error ? esc(error.message) : '云端暂无数据。'}</div>`; return; }
  const cloud = v170Counts(data.payload), rows = [['任务', local.tasks, cloud.tasks], ['学习计时', local.study, cloud.study], ['睡眠', local.sleep, cloud.sleep], ['延迟提取', local.retrieval, cloud.retrieval], ['错误率对照', local.errors, cloud.errors], ['项目', local.projects, cloud.projects], ['生活记录', local.life, cloud.life]];
  box.innerHTML = `<table class="v170-sync-table"><tr><th>数据</th><th>本地</th><th>云端</th><th>判断</th></tr>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[1] === r[2] ? '数量一致' : '有差异'}</td></tr>`).join('')}</table><div class="v170-sync-note"><b>本地修改：</b>${fmtSyncTime(syncMeta().localUpdatedAt)}　<b>云端修改：</b>${fmtSyncTime(data.updated_at)}<br>${APP_VERSION} 自动合并学习计时、睡眠、质量、项目与生活记录。</div>`;
}

/* ===== 交互反馈、主题、菜单与 SW ===== */
const v156TouchDevice = () => !!(navigator.maxTouchPoints > 0 || matchMedia('(pointer:coarse)').matches);
function v156ImportantButton(b) {
  if (!b) return false;
  if (b.matches('.primary,.learning-danger-btn,.reflect-confirm,[data-review-done]')) return true;
  return ['startStudyBtn', 'finishStudyBtn', 'v155QuickBtn', 'manualStudyAdd', 'slSave', 'completeReflection', 'saveA', 'addTask', 'addDeadline', 'addWeek', 'addMonth', 'addScheduleCourse', 'saveCloudConfig', 'signInBtn', 'uploadCloud', 'downloadCloud', 'doneNextR1', 'doneNextR2', 'doneNextSkill', 'doneNextFin', 'doneNextMath'].includes(b.id);
}
let v156ToastTimer = null;
function v156Toast(message, success = false) {
  let t = $('#v156Toast'); if (!t) { t = document.createElement('div'); t.id = 'v156Toast'; t.className = 'v156-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  t.textContent = message; t.className = 'v156-toast' + (success ? ' success' : '');
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(v156ToastTimer); v156ToastTimer = setTimeout(() => t.classList.remove('show'), 1400);
}
function v156PlayTone(strong = false, force = false) {
  if (!force && !LS.uiFeedback.sound) return;
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = window.__v155Audio || (window.__v155Audio = new C()); if (c.state === 'suspended') c.resume();
    const t0 = c.currentTime;
    [strong ? 520 : 470, strong ? 690 : 520].slice(0, strong ? 2 : 1).forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(strong ? 0.032 : 0.02, t0 + i * 0.035);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07 + i * 0.035);
      o.connect(g); g.connect(c.destination); o.start(t0 + i * 0.035); o.stop(t0 + 0.08 + i * 0.035);
    });
  } catch {}
}
function feedbackClick(button, { forceHaptic = false, forceSound = false, showToast = true } = {}) {
  const important = v156ImportantButton(button), touch = v156TouchDevice();
  if ((forceHaptic || LS.uiFeedback.haptic) && touch && navigator.vibrate) try { navigator.vibrate(important || forceHaptic ? 22 : 7); } catch {}
  if (forceSound || LS.uiFeedback.sound) v156PlayTone(important, forceSound);
  if (important) {
    button.classList.add('v156-important', 'v156-confirm-pop'); setTimeout(() => button.classList.remove('v156-confirm-pop'), 340);
    if (showToast && !['swUpdateApplyBtn', 'baziClose', 'baziEmptyImport'].includes(button.id)) v156Toast(`✓ 已确认 · ${(button.textContent || '操作').trim().replace(/\s+/g, ' ').slice(0, 24)}`, true);
  }
}
function applyTheme(theme) {
  const dark = theme === 'dark'; document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  try { localStorage.setItem('zx_theme', dark ? 'dark' : 'light'); } catch {}
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', dark ? '#141915' : '#eef2eb');
  const icon = $('#themeToggleIcon'); if (icon) icon.textContent = dark ? '☀' : '☾';
  const btn = $('#themeToggleBtn'); if (btn) btn.title = dark ? '切换为浅色雾茶绿主题' : '切换为晚自习护眼暗色主题';
}
function closeMoreMenu() { $('#moreMenuDropdown')?.classList.remove('open'); $('#moreMenuBtn')?.setAttribute('aria-expanded', 'false'); }
function toggleMoreMenu(ev) { ev.stopPropagation(); const dd = $('#moreMenuDropdown'); if (!dd) return; const open = !dd.classList.contains('open'); dd.classList.toggle('open', open); $('#moreMenuBtn')?.setAttribute('aria-expanded', String(open)); }
function setupServiceWorker() {
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  let waitingWorker = null; const bar = $('#swUpdateBar');
  const showUpdate = w => { waitingWorker = w; bar?.classList.add('show'); };
  $('#swUpdateApplyBtn').onclick = () => { if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' }); else location.reload(); };
  $('#swUpdateDismissBtn').onclick = () => bar?.classList.remove('show');
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
  navigator.serviceWorker.register('./sw.js').then(reg => {
    if (reg.waiting) showUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing; if (!nw) return;
      nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw); });
    });
  }).catch(() => {});
}

function bindEvents() {
  document.addEventListener('pointerdown', e => { const b = e.target.closest('.btn'); if (!b) return; b.classList.add('press-feedback'); setTimeout(() => b.classList.remove('press-feedback'), 140); }, true);
  document.addEventListener('click', e => { const b = e.target.closest('.btn'); if (b && b.id !== 'v156FeedbackTest') feedbackClick(b); if (!e.target.closest('.more-menu-wrap')) closeMoreMenu(); }, true);
  document.addEventListener('change', e => { const x = e.target; if (!(x instanceof HTMLInputElement) || x.type !== 'checkbox' || !x.closest('.task,.deadline-item,.learning-item,.learning-review-check,.review-due')) return; if (x.checked) { if (LS.uiFeedback.haptic && v156TouchDevice() && navigator.vibrate) try { navigator.vibrate(18); } catch {} v156Toast('✓ 已标记完成', true); } }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMoreMenu(); ['learningModal', 'cloudModal', 'v170QuickModal', 'reviewModal', 'scheduleModal', 'repeatActionModal', 'modal'].forEach(id => $('#' + id)?.classList.remove('show')); } });

  $('#themeToggleBtn').onclick = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  $('#moreMenuBtn').onclick = toggleMoreMenu;
  $('#baziBtn').addEventListener('click', closeMoreMenu);
  $('#toggleGoalOverviewsBtn').onclick = () => { goalOverviewsForceOpen = true; syncGoalOverviewCollapseState(); };
  $('#collapseGoalOverviewsBtn').onclick = () => { goalOverviewsForceOpen = false; $('#goalOverviewsShell').classList.add('is-compact'); };
  document.querySelectorAll('[data-side-tab]').forEach(b => { b.onclick = () => setSideTab(b.dataset.sideTab); });

  $('#cloudBtn').onclick = () => { if (!sb && window.supabase) initSupabase(); const c = cloudCfg(); $('#sbUrl').value = c.url || ''; $('#sbKey').value = c.key || ''; $('#cloudModal').classList.add('show'); updateCloudUI(); v160RenderBackupHistory(); if (sbUser) refreshCloudMeta(); setTimeout(() => { v170CompareCloud(); v160RunDiagnostics(); }, 60); };
  $('#closeCloud').onclick = () => $('#cloudModal').classList.remove('show');
  $('#cloudModal').onclick = e => { if (e.target === $('#cloudModal')) $('#cloudModal').classList.remove('show'); };
  $('#saveCloudConfig').onclick = saveCloudConfig; $('#signUpBtn').onclick = signUp; $('#signInBtn').onclick = signIn; $('#signOutBtn').onclick = signOut;
  $('#uploadCloud').onclick = () => uploadCloud(false); $('#downloadCloud').onclick = () => downloadCloud(false);
  $('#v160CreateBackup').onclick = () => v160CreateSafetyBackup('手动快照'); $('#v160RunDiagnostics').onclick = v160RunDiagnostics;
  $('#v170CompareCloud').onclick = v170CompareCloud; $('#v170UndoBtn').onclick = v170UndoLatest;

  $('#v170QuickBtn').onclick = () => { $('#v170QuickModal').classList.add('show'); v170RenderQuick(); };
  $('#v170CloseQuick').onclick = () => $('#v170QuickModal').classList.remove('show');
  $('#v170QuickModal').onclick = e => { if (e.target === $('#v170QuickModal')) $('#v170QuickModal').classList.remove('show'); };

  $('#learningBtn').onclick = () => openLearning('today'); $('#openLearningFromSide').onclick = () => openLearning('today');
  $('#closeLearning').onclick = closeLearning; $('#learningModal').onclick = e => { if (e.target === $('#learningModal')) closeLearning(); };
  document.querySelectorAll('[data-learning-tab]').forEach(b => { b.onclick = () => { activeLearningTab = b.dataset.learningTab; renderLearningPanel(); if (sbUser && ['stats', 'timer'].includes(activeLearningTab)) refreshCloudMeta(); }; });

  $('#reviewBtn').onclick = openReview; $('#closeReview').onclick = () => $('#reviewModal').classList.remove('show');
  $('#reviewModal').onclick = e => { if (e.target === $('#reviewModal')) $('#reviewModal').classList.remove('show'); };
  $('#weeklyTab').onclick = () => { $('#weeklyTab').classList.add('active'); $('#monthlyTab').classList.remove('active'); $('#weeklyReview').classList.add('active'); $('#monthlyReview').classList.remove('active'); renderWeekReview(); };
  $('#monthlyTab').onclick = () => { $('#monthlyTab').classList.add('active'); $('#weeklyTab').classList.remove('active'); $('#monthlyReview').classList.add('active'); $('#weeklyReview').classList.remove('active'); renderMonthReview(); };
  $('#weekManual').oninput = () => saveReviewNote('week'); $('#monthManual').oninput = () => saveReviewNote('month');
  $('#exportWeekMd').onclick = () => { const x = reviewMarkdown('week'); downloadText(x.name, x.text); };
  $('#exportMonthMd').onclick = () => { const x = reviewMarkdown('month'); downloadText(x.name, x.text); };
  $('#aiWeekBtn').onclick = () => generateAI('week'); $('#aiMonthBtn').onclick = () => generateAI('month');
  $('#copyWeekAI').onclick = () => copyText($('#weekAI').textContent); $('#copyMonthAI').onclick = () => copyText($('#monthAI').textContent);

  $('#jumpWeekGoals').onclick = () => { setSideTab('tasks'); $('#weekGoalsSection').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  $('#jumpMonthGoals').onclick = () => { if (sel.getFullYear() !== view.getFullYear() || sel.getMonth() !== view.getMonth()) { sel = new Date(view.getFullYear(), view.getMonth(), 1, 12); renderCal(); renderSide(); } setSideTab('tasks'); $('#monthGoalsSection').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  $('#jumpDeadlineGoals').onclick = () => { setSideTab('tasks'); $('#deadlineGoalsSection').scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  const goToday = () => { sel = new Date(now); view = new Date(now.getFullYear(), now.getMonth(), 1); renderCal(); renderSide(); };
  $('#todayBtn').onclick = goToday; $('#calTodayBtn').onclick = goToday;
  $('#prevBtn').onclick = () => { view.setMonth(view.getMonth() - 1); renderCal(); };
  $('#nextBtn').onclick = () => { view.setMonth(view.getMonth() + 1); renderCal(); };
  $('#yearSelect').onchange = e => { const y = Number(e.target.value); if (!Number.isFinite(y)) return; const m = view.getMonth(); view = new Date(y, m, 1, 12); sel = new Date(y, m, 1, 12); renderCal(); renderSide(); };

  $('#addTask').onclick = addTask; $('#taskInput').onkeydown = e => { if (e.key === 'Enter') addTask(); };
  $('#repeat').onchange = syncRepeatEndUI; syncRepeatEndUI();
  $('#clearComposer').onclick = () => { $('#taskInput').value = ''; $('#reminder').value = ''; $('#priority').value = 'medium'; $('#repeat').value = 'none'; $('#repeatEnd').value = ''; syncRepeatEndUI(); };
  $('#addDeadline').onclick = addDeadline; $('#deadlineInput').onkeydown = e => { if (e.key === 'Enter') addDeadline(); };
  $('#addWeek').onclick = () => addGoal('w'); $('#addMonth').onclick = () => addGoal('m');
  $('#weekInput').onkeydown = e => { if (e.key === 'Enter') addGoal('w'); }; $('#monthInput').onkeydown = e => { if (e.key === 'Enter') addGoal('m'); };
  ['q1', 'q2', 'q3'].forEach(id => { $('#' + id).oninput = saveR; }); $('#completeReflection').onclick = completeReflection;

  $('#scheduleEditBtn').onclick = openScheduleModal; $('#closeScheduleModal').onclick = closeScheduleModal;
  $('#scheduleModal').onclick = e => { if (e.target === $('#scheduleModal')) closeScheduleModal(); };
  $('#schedulePreset').onchange = e => { fillScheduleForm(activeCourseList().find(x => x.id === e.target.value) || null); };
  $('#clearScheduleForm').onclick = clearScheduleForm; $('#addScheduleCourse').onclick = addScheduleCourseForSelectedDate;
  $('#importScheduleBtn').onclick = () => $('#importScheduleFile').click();
  $('#importScheduleFile').onchange = e => { if (e.target.files[0]) importScheduleProfile(e.target.files[0]); e.target.value = ''; };
  $('#exportScheduleBtn').onclick = exportScheduleProfile; $('#clearBaseScheduleBtn').onclick = clearBaseScheduleProfile;

  $('#closeRepeatAction').onclick = closeRecurringAction;
  $('#repeatSkipOne').onclick = () => finishRecurringAction('skip'); $('#repeatEndFromHere').onclick = () => finishRecurringAction('end'); $('#repeatDeleteAll').onclick = () => finishRecurringAction('all');
  $('#repeatActionModal').onclick = e => { if (e.target === $('#repeatActionModal')) closeRecurringAction(); };

  const openAnnivModal = () => { closeMoreMenu(); $('#modal').classList.add('show'); $('#aDate').value = fmt(sel); renderAnnivManage(); };
  $('#annivBtn').onclick = openAnnivModal; $('#annivManageBtn').onclick = openAnnivModal;
  $('#cancelA').onclick = () => $('#modal').classList.remove('show'); $('#modal').onclick = e => { if (e.target === $('#modal')) $('#modal').classList.remove('show'); };
  $('#saveA').onclick = () => { const name = $('#aName').value.trim(), date = $('#aDate').value; if (!name || !date) return; A.push({ id: uuid(), name, date, repeat: $('#aRepeat').checked }); S.s('anniversaries', A); $('#aName').value = ''; renderAnniv(); renderAnnivManage(); renderCal(); };

  $('#exportBtn').onclick = exportData; $('#importBtn').onclick = () => $('#importFile').click();
  $('#importFile').onchange = e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; };
  $('#notifyBtn').onclick = () => { closeMoreMenu(); askNotify(); }; $('#bannerNotify').onclick = askNotify;

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushCloudSyncOnLeave(); else recoverSessionAndRetrySync(); });
  window.addEventListener('pagehide', flushCloudSyncOnLeave);
  window.addEventListener('pageshow', recoverSessionAndRetrySync);
  window.addEventListener('focus', recoverSessionAndRetrySync);
}

applyTheme(localStorage.getItem('zx_theme') === 'dark' ? 'dark' : 'light');
bindEvents();
syncStudyTimerLoop();
setTimeout(v160EnsureDailyBackup, 300);
renderCal(); renderSide(); renderAnniv(); renderStreak(); nextTerm(); updateNotifyUI(); checkReminders(); renderAIStored(); renderLearningOverview(); initSupabase();
setTimeout(recoverSessionAndRetrySync, 1500);
window.addEventListener('load', () => setTimeout(recoverSessionAndRetrySync, 500));
setInterval(checkReminders, 30000);
setupServiceWorker();
})();
