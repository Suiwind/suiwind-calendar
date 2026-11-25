/* 苏伊温德日历 · 小六壬三流派排盘引擎（古法六宫 / 江氏进阶 / 道传九宫）
 * 独立本地优先模块：零第三方依赖，复明日历现有农历转换与 AI 配置桥接
 */
(() => {
'use strict';

const HISTORY_KEY = 'suiwind_xlr_history_v1';
const MAX_HISTORY = 50;

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
const ico = (id, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

/* ===== 基础历法常量 ===== */
const SHICHEN_LIST = [
  { idx: 1, zhi: '子', zhiIdx: 0, label: '子时 (23:00–01:00)', wx: '水' },
  { idx: 2, zhi: '丑', zhiIdx: 1, label: '丑时 (01:00–03:00)', wx: '土' },
  { idx: 3, zhi: '寅', zhiIdx: 2, label: '寅时 (03:00–05:00)', wx: '木' },
  { idx: 4, zhi: '卯', zhiIdx: 3, label: '卯时 (05:00–07:00)', wx: '木' },
  { idx: 5, zhi: '辰', zhiIdx: 4, label: '辰时 (07:00–09:00)', wx: '土' },
  { idx: 6, zhi: '巳', zhiIdx: 5, label: '巳时 (09:00–11:00)', wx: '火' },
  { idx: 7, zhi: '午', zhiIdx: 6, label: '午时 (11:00–13:00)', wx: '火' },
  { idx: 8, zhi: '未', zhiIdx: 7, label: '未时 (13:00–15:00)', wx: '土' },
  { idx: 9, zhi: '申', zhiIdx: 8, label: '申时 (15:00–17:00)', wx: '金' },
  { idx: 10, zhi: '酉', zhiIdx: 9, label: '酉时 (17:00–19:00)', wx: '金' },
  { idx: 11, zhi: '戌', zhiIdx: 10, label: '戌时 (19:00–21:00)', wx: '土' },
  { idx: 12, zhi: '亥', zhiIdx: 11, label: '亥时 (21:00–23:00)', wx: '水' }
];

const LUNAR_MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const LUNAR_DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

const ZHI_WX = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WX_KEY_MAP = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' };

const SIX_GODS = [
  { name: '青龙', wx: '木', brief: '喜庆、正直、贵人、正财、光明顺达' },
  { name: '朱雀', wx: '火', brief: '文书、消息、口舌、沟通、声名急切' },
  { name: '勾陈', wx: '土', brief: '迟滞、稳重、田宅、熟人、旧事牵绊' },
  { name: '白虎', wx: '金', brief: '刚猛、决断、血光、官非、压力冲突' },
  { name: '玄武', wx: '水', brief: '暗昧、隐情、变动、防失察与虚言' },
  { name: '腾蛇', wx: '土', brief: '虚惊、多变、反复、思虑纠缠、怪异' }
];

const SIX_REL_BRIEF = {
  自身: '卦主本身 / 所问主体，为全盘生克参照中心',
  父母: '生我者：长辈、文书、合同、靠山、房屋、庇护',
  兄弟: '同我者：同辈、朋友、合作与竞争、精力/钱财分流',
  子孙: '我生者：产出、解忧、技术、下属、福气与好心情',
  妻财: '我克者：钱财、收益、资源、结果、感情所求对象',
  官鬼: '克我者：压力、规则、上级、官方、工作考核或隐疾'
};

const TOPICS = [
  { key: 'general', label: '综合断事' },
  { key: 'career', label: '事业学业' },
  { key: 'wealth', label: '求财交易' },
  { key: 'love', label: '感情人际' },
  { key: 'travel', label: '出行远行' },
  { key: 'lost', label: '失物寻人' },
  { key: 'health', label: '健康身心' }
];

const SCHOOLS = {
  classic: { key: 'classic', name: '古法六宫', count: 6, sub: '大安至空亡 · 经典三传' },
  jiang: { key: 'jiang', name: '江氏进阶', count: 6, sub: '装十二地支 · 六亲 · 六神' },
  dao: { key: 'dao', name: '道传九宫', count: 9, sub: '后天八卦九宫 · 病符桃花天德' }
};

/* ===== 九宫神煞资料库（前六宫为传统六宫，后三宫为道传扩展） ===== */
const PALACES = [
  {
    idx: 0, id: 'daan', name: '大安', wx: '木', wxKey: 'wood',
    auspice: '大吉', tone: 'pos', bagua: '震', dir: '正东', palm: '食指根部',
    tagline: '身不动时 · 稳守顺遂',
    verse: '大安事事昌，求财在坤方，失物去不远，宅舍保安康；行人身未动，病者主无妨，将军回田野，仔细兴推详。',
    meaning: '主安定、稳固、顺遂、有依靠，利守正与长期积累，忌盲目折腾或急于求成。',
    advice: '宜稳步推进、按计划落实、借力长辈或平台资源；忌频繁变更方向。',
    topics: {
      general: '格局平稳向好，事情根基扎实，按既有节奏稳步推进即可水到渠成。',
      career: '岗位与学业运势稳健，利考证、备考、长期项目深耕，易得前辈认可。',
      wealth: '正财平稳，宜稳健配置与实在收益，不宜高风险短线博弈；偏西南方有利。',
      love: '关系安定温和、细水长流；单身者宜在熟悉圈层或熟人引荐中结缘。',
      travel: '行程安稳无虞，但出发可能偏稳偏慢，宜提前确认班次与随身证件。',
      lost: '失物并未走远，多仍在原地附近、家中或常待角落（偏西南/低处），细找可复得。',
      health: '整体无大碍，重在规律作息、调理肝气与筋骨舒展。'
    }
  },
  {
    idx: 1, id: 'liulian', name: '留连', wx: '木', wxKey: 'wood',
    auspice: '小凶', tone: 'warn', bagua: '巽', dir: '东南', palm: '食指指尖',
    tagline: '人未归时 · 缓滞牵连',
    verse: '留连事难成，求谋日未明，官事只宜缓，去者未回程；失物南方见，急讨方心称，更须防口舌，人口且平平。',
    meaning: '主拖延、反复、牵绊与悬而未决（巽木入风、古法亦论缓滞），并非绝路，而是周期拉长、细节纠缠。',
    advice: '宜耐心复核条款与进度、留出缓冲期、以柔化滞；忌情绪化催促或草率拍板。',
    topics: {
      general: '短期难见干脆结果，流程易拖沓或反复拉扯，宜做好持久战与备选方案。',
      career: '审批、反馈或成绩进度偏慢，需主动跟进关键节点，避免陷入无效内耗。',
      wealth: '资金回笼较慢，交易易有附加条件或延迟结算，合同细节务必逐条核对。',
      love: '彼此牵挂却不够明朗，易因旧事或犹豫产生拉扯，宜坦诚沟通破除猜忌。',
      travel: '行程易遇晚点、改期或临时耽搁，行前留足中转时间，暂不急于远行。',
      lost: '物件可能被遮挡或暂留他人处，偏南方/东南方寻找，需及时追问方有线索。',
      health: '易有慢性疲劳、思虑过重或旧疾反复，宜减负静养、规律排解压力。'
    }
  },
  {
    idx: 2, id: 'suxi', name: '速喜', wx: '火', wxKey: 'fire',
    auspice: '上吉', tone: 'pos', bagua: '离', dir: '正南', palm: '中指指尖',
    tagline: '人便至时 · 喜讯速达',
    verse: '速喜喜来临，求财向南行，失物申未午，逢人路上寻；官事有福德，病者无祸侵，田宅六畜吉，行人有信音。',
    meaning: '主喜庆、明朗、响应迅速与当机立断，好消息往往很快落定，贵在趁热打铁。',
    advice: '宜果断推进、主动表达与争取机会；忌犹豫错过窗口期或因得意忘形疏漏细节。',
    topics: {
      general: '局面迅速明朗，喜讯与积极反馈近在眼前，利快节奏决策与推进。',
      career: '面试、答辩、汇报、竞赛表现亮眼，易快速收到好消息或阶段性突破。',
      wealth: '求财时机佳，利快速周转、创意与信息类收益，偏南方或线上拓展有利。',
      love: '互动升温快、氛围明朗，适合表白、约会、破冰或迎来好消息。',
      travel: '动身顺利、消息灵通，宜说走就走的短途或高效行程，一路顺畅。',
      lost: '很快会有眉目，多在明亮处、正南方向或经由旁人提醒找到（午/未/申时应验佳）。',
      health: '恢复速度快，精神提振；稍留意用眼、心火偏旺与晚睡问题。'
    }
  },
  {
    idx: 3, id: 'chikou', name: '赤口', wx: '金', wxKey: 'metal',
    auspice: '中凶', tone: 'neg', bagua: '兑', dir: '正西', palm: '无名指尖',
    tagline: '官事凶时 · 防口舌锋芒',
    verse: '赤口主口舌，官非切宜防，失物速速讨，行人有惊慌；六畜多作怪，病者出西方，更须防咀咒，诚恐染瘟皇。',
    meaning: '主口舌争执、锋芒冲突、突发惊扰与硬碰硬，利冷静止损与规则留痕，忌意气用事。',
    advice: '宜谨言慎行、留存书面凭证、避开正面冲突；忌冲动争辩、轻信口头承诺。',
    topics: {
      general: '易起分歧、摩擦或突发波折，重在克制情绪、守住边界与底线。',
      career: '职场或协作中防意见相左与甩锅，重要交付务必文字留痕、按章办事。',
      wealth: '防破财、议价争执或合同纠纷，大额支出与借贷建议暂缓或严审条款。',
      love: '言语易带刺，小事容易升级为争吵，先降温再谈事，避免翻旧账。',
      travel: '注意交通安全与突发变动，远离喧闹冲突场景，金属锐器及行程细节多加留意。',
      lost: '需立刻寻找与及时追讨，拖延则难寻；留意西方、金属/白色物件旁或公共区域。',
      health: '防上火、咽喉呼吸不适、磕碰擦伤或情绪急躁，宜饮食清淡、静心缓气。'
    }
  },
  {
    idx: 4, id: 'xiaoji', name: '小吉', wx: '水', wxKey: 'water',
    auspice: '中吉', tone: 'pos', bagua: '坎', dir: '正北', palm: '无名指根',
    tagline: '人和吉时 · 贵人相合',
    verse: '小吉最吉昌，路上好商量，阴人来报喜，失物在坤方；行人即便至，交关甚是强，凡事皆和合，病者叩穹苍。',
    meaning: '主和合、贵人相助、洽谈顺遂与水到渠成，虽非轰烈暴发，却胜在润物无声、事事好商量。',
    advice: '宜协作共赢、主动联络人脉、温和协商；忌单打独斗或过度计较小节。',
    topics: {
      general: '人和运极佳，许多难题通过沟通与协作都能顺利化解，结果令人舒心。',
      career: '利团队合作、商务洽谈、跨部门对接与请教女性贵人，易达成双赢协议。',
      wealth: '合作生财、和气生财，交易谈判顺畅，适合稳步扩展客源与副业合作。',
      love: '和合默契、桃花温和，适合约会互动、修补关系或经亲友牵线结识良缘。',
      travel: '一路顺风，旅途易得热心人指点帮助，出行与返程皆顺意。',
      lost: '有寻回之机，多在西南/正北方向、水边或经由女性/熟人帮忙留意而找回。',
      health: '气血渐和、趋势向好，注意补水保暖与肾气/睡眠养护。'
    }
  },
  {
    idx: 5, id: 'kongwang', name: '空亡', wx: '土', wxKey: 'earth',
    auspice: '下凶', tone: 'neg', bagua: '中宫', dir: '中央', palm: '中指指根',
    tagline: '音信稀时 · 事易落空',
    verse: '空亡事不祥，阴人多乖张，求财无利益，行人有灾殃；失物寻不见，官事有刑伤，病人逢暗鬼，解禳保安康。',
    meaning: '主虚浮、落空、预期落差与信息断层；但于「求静、放下、止损、内省、摆脱烦扰」反有清空释怀之象。',
    advice: '宜及时止损、降低执念、以静制动或调整目标；忌强求结果、盲目投入沉没成本。',
    topics: {
      general: '所求之事易生落空或变数，当下不宜硬推，宜暂停复盘、去伪存真。',
      career: '画饼或口头许诺难兑现，宜先抓手里确定性高的任务，另谋更稳路径。',
      wealth: '求财无利反防虚耗，切忌冲动消费、高风险投机与轻信他人画饼。',
      love: '沟通易失焦或期待落空，给彼此留一点冷静空间，看清真实心意再做决定。',
      travel: '行程易取消、扑空或白跑一趟，出发前务必二次确认对方时间与地点。',
      lost: '较难在短期找回，或已离手较久，可排查中心常用区域，同时做好备选安排。',
      health: '精力易透支或心情低落，宜放空休整、少刷消耗性信息，必要时及时就医检查。'
    }
  },
  {
    idx: 6, id: 'bingfu', name: '病符', wx: '土', wxKey: 'earth',
    auspice: '小凶', tone: 'neg', bagua: '坤', dir: '西南', palm: '坤宫（西南）',
    tagline: '病灶隐忧 · 先治其本',
    verse: '病符主病态，诸事有瑕疵，先寻症结处，调理方可移；求谋防疲惫，合作查隐隙，静养待转机，切莫强硬支。',
    meaning: '道传九宫专神，主隐藏缺陷、状态疲惫、系统卡点或身心欠佳，重在「先诊断、再修复」。',
    advice: '宜做全面体检式复盘，优先修复薄弱环节；忌带病硬撑或忽视早期预警信号。',
    topics: {
      general: '事情内部存在隐性卡点或资源损耗，先找根因修补，再谈扩张推进。',
      career: '易感倦怠或项目暴露前期遗留问题，适合集中清债、修补漏洞、重整节奏。',
      wealth: '防隐性扣费、维护成本或不良资产拖累，理财以排查风险为主。',
      love: '关系中存在未说破的心结或疲惫感，需要温和正视问题而非冷处理。',
      travel: '留意旅途水土不服、疲劳驾驶或设备小故障，行前做好检查与备药。',
      lost: '物品可能受损、被压在杂物下或遗落西南方位，寻找时注意翻查角落。',
      health: '重点关注身体信号、脾胃与免疫状态，早睡减压，不适则尽早检查调理。'
    }
  },
  {
    idx: 7, id: 'taohua', name: '桃花', wx: '土', wxKey: 'earth',
    auspice: '平吉', tone: 'warn', bagua: '艮', dir: '东北', palm: '艮宫（东北）',
    tagline: '人缘情牵 · 亦防虚浮',
    verse: '桃花主人缘，情思易牵连，社交多助力，审美颇占先；谋事防分心，求财辨虚言，守正清界限，方得长久缘。',
    meaning: '道传九宫专神，主人缘魅力、情感牵动、审美创作与社交互动，吉则助缘生辉，偏则分心迷乱。',
    advice: '宜善用人缘、表达魅力与创意优势；忌被情绪或浮华表象牵走注意力。',
    topics: {
      general: '人际活跃、吸引力增强，适合展示、社交与文化审美类事项，注意保持清醒界限。',
      career: '利公关、内容创作、设计审美、客户维系与面试好感度，但需防分心拖延主业。',
      wealth: '利靠口碑、人脉与审美溢价生财，但注意克制情绪消费与人情虚耗。',
      love: '异性缘与互动热度上升，单身易逢心动契机；有伴者宜保持边界、增进仪式感。',
      travel: '旅途愉悦轻松、易结识有趣同伴，偏东北方或文艺休闲目的地体验佳。',
      lost: '可能遗落在娱乐、聚会、妆饰或人多之处，向同行熟人打听较易有消息。',
      health: '情绪起伏略受人际影响，宜克制熬夜社交，保持作息与内心松弛。'
    }
  },
  {
    idx: 8, id: 'tiande', name: '天德', wx: '金', wxKey: 'metal',
    auspice: '大吉', tone: 'pos', bagua: '乾', dir: '西北', palm: '乾宫（西北）',
    tagline: '贵人扶佑 · 逢凶化吉',
    verse: '天德主贵人，逢凶可化吉，长辈上司助，正道自通达；谋事得倚靠，出行有庇护，德行配其位，万事展宏图。',
    meaning: '道传九宫至吉之神，居乾金高位，主贵人提携、逢凶化吉、正气得助与格局跃升。',
    advice: '宜走正道、主动向资深前辈/权威请益、承接重要责任；忌短视投机。',
    topics: {
      general: '格局高远且有贵人护持，纵有小阻亦能迎刃而解，宜大胆走阳光正道。',
      career: '易获导师、上司或权威平台赏识提携，利升迁、重要考核、核心项目立项。',
      wealth: '贵人带财、正财丰厚，适合正规渠道与高信用伙伴合作，西北方有利。',
      love: '缘分端正靠谱，易得双方家庭或长辈认可，关系踏实有担当。',
      travel: '一路平安顺遂，遇事易得贵人解围，远行与差旅皆吉利。',
      lost: '有较大机会失而复得，可向管理方、失物招领处或长辈/西北方向查询。',
      health: '正气充足、恢复力强，适合规律运动与建立长期健康习惯。'
    }
  }
];

/* 盘面空间排布顺序 */
const PALM_ORDER_6 = [1, 2, 3, 0, 5, 4];          // 左手三指：上排 留连/速喜/赤口，下排 大安/空亡/小吉
const LOSHU_ORDER_9 = [1, 2, 6, 0, 5, 3, 7, 4, 8]; // 洛书九宫（上南下北左东右西）

/* ===== 五行生克计算 ===== */
const WX_GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const WX_OVER = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

function wxRelation(fromWx, toWx) {
  if (fromWx === toWx) return { label: '比和', tone: 'neutral', desc: `${fromWx}与${toWx}同气相助，节奏平稳持恒` };
  if (WX_GEN[fromWx] === toWx) return { label: '顺生', tone: 'pos', desc: `${fromWx}生${toWx}，前势助推后局，顺理成章` };
  if (WX_GEN[toWx] === fromWx) return { label: '反生', tone: 'pos', desc: `${toWx}生${fromWx}，后局回护前因，得滋养扶持` };
  if (WX_OVER[fromWx] === toWx) return { label: '克出', tone: 'warn', desc: `${fromWx}克${toWx}，主动推进可控，但需耗力费心` };
  if (WX_OVER[toWx] === fromWx) return { label: '受克', tone: 'neg', desc: `${toWx}克${fromWx}，过程遇阻受制，宜审慎化解` };
  return { label: '平', tone: 'neutral', desc: '五行平和' };
}

/* ===== 北京时间与农历精确换算 ===== */
let lunarFmt = null;
function bjNowParts() {
  if (window.SUIWIND_BRIDGE?.bjParts) {
    const p = window.SUIWIND_BRIDGE.bjParts(new Date());
    if (p) return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour, minute: +p.minute };
  }
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes() };
}

function hourToShichen(hour) {
  return Math.floor(((Number(hour) + 1) % 24) / 2) + 1; // 23,0 -> 1(子) ... 21,22 -> 12(亥)
}

function parseChineseMonth(raw) {
  const s = String(raw || '').trim();
  const isLeap = s.startsWith('闰');
  const clean = s.replace(/^闰/, '').replace(/月+$/, '');
  const map = {
    正: 1, 一: 1, '1': 1, 二: 2, '2': 2, 三: 3, '3': 3, 四: 4, '4': 4,
    五: 5, '5': 5, 六: 6, '6': 6, 七: 7, '7': 7, 八: 8, '8': 8,
    九: 9, '9': 9, 十: 10, '10': 10, 冬: 11, 十一: 11, '11': 11, 腊: 12, 十二: 12, '12': 12
  };
  return { month: map[clean] || 1, isLeap };
}

function parseChineseDay(raw) {
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 1 && n <= 30) return n;
  const idx = LUNAR_DAY_NAMES.indexOf(String(raw || '').trim());
  return idx >= 0 ? idx + 1 : 1;
}

function solarToLunarParts(dateStr) {
  const [y, m, d] = String(dateStr || '').split('-').map(Number);
  const dt = (y && m && d) ? new Date(y, m - 1, d, 12, 0, 0) : new Date();
  try {
    if (!lunarFmt) {
      lunarFmt = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    const parts = lunarFmt.formatToParts(dt);
    const mRaw = parts.find(p => p.type === 'month')?.value || '正月';
    const dRaw = parts.find(p => p.type === 'day')?.value || '1';
    const { month, isLeap } = parseChineseMonth(mRaw);
    const day = parseChineseDay(dRaw);
    const monthName = (isLeap ? '闰' : '') + LUNAR_MONTH_NAMES[month - 1];
    const dayName = LUNAR_DAY_NAMES[day - 1] || `第${day}日`;
    return { month, day, isLeap, monthName, dayName, fullText: `${monthName}${dayName}` };
  } catch {
    return { month: 1, day: 1, isLeap: false, monthName: '正月', dayName: '初一', fullText: '正月初一' };
  }
}

/* ===== 江氏六宫装地支 / 六亲 / 六神 ===== */
function buildJiangBoard(bodyIdx, shichenIdx) {
  const shichenZhi = (shichenIdx - 1 + 12) % 12; // 0=子 .. 11=亥
  const meWx = ZHI_WX[shichenZhi];
  const dragonStart = shichenZhi % 6;            // 子午大安(0), 丑未留连(1), 寅申速喜(2), 卯酉赤口(3), 辰戌小吉(4), 巳亥空亡(5)

  // 先按顺时针隔位装地支，记录每个宫位信息
  const slots = new Array(6);
  let siblingAssigned = false;

  for (let k = 0; k < 6; k++) {
    const pIdx = (bodyIdx + k) % 6;
    const zIdx = (shichenZhi + k * 2) % 12;
    const zWx = ZHI_WX[zIdx];
    const godIdx = (pIdx - dragonStart + 6) % 6;

    let relation = '';
    if (k === 0) {
      relation = '自身';
    } else if (zWx === meWx) {
      relation = '兄弟';
      siblingAssigned = true;
    } else if (meWx !== '土' && zWx === '土' && !siblingAssigned) {
      // 江氏秘法：非土身宫无同类五行，以身宫顺时针碰到的第一个土支作兄弟
      relation = '兄弟';
      siblingAssigned = true;
    } else if (WX_GEN[zWx] === meWx) {
      relation = '父母';
    } else if (WX_GEN[meWx] === zWx) {
      relation = '子孙';
    } else if (WX_OVER[zWx] === meWx) {
      relation = '官鬼';
    } else if (WX_OVER[meWx] === zWx) {
      relation = '妻财';
    } else {
      relation = '兄弟';
    }

    slots[pIdx] = {
      palaceIdx: pIdx,
      zhiIdx: zIdx,
      zhi: ZHI_NAMES[zIdx],
      zhiWx: zWx,
      zhiWxKey: WX_KEY_MAP[zWx],
      relation,
      relationBrief: SIX_REL_BRIEF[relation] || '',
      god: SIX_GODS[godIdx],
      isBody: k === 0
    };
  }

  return {
    bodyIdx,
    shichenZhi,
    shichenName: `${ZHI_NAMES[shichenZhi]}时`,
    meWx,
    dragonStartPalace: PALACES[dragonStart].name,
    slots
  };
}

/* ===== 核心排盘算法（纯函数，便于测试与复现） ===== */
function computeCast(params) {
  const schoolKey = SCHOOLS[params.school] ? params.school : 'classic';
  const school = SCHOOLS[schoolKey];
  const count = school.count;

  const n1 = Math.max(1, Math.floor(Number(params.n1) || 1));
  const n2 = Math.max(1, Math.floor(Number(params.n2) || 1));
  const n3 = Math.max(1, Math.floor(Number(params.n3) || 1));
  const shichenIdx = Math.min(12, Math.max(1, Math.floor(Number(params.shichenIdx) || 1)));

  const i1 = (n1 - 1) % count;
  const i2 = (i1 + n2 - 1) % count;
  const i3 = (i2 + n3 - 1) % count;

  const p1 = PALACES[i1];
  const p2 = PALACES[i2];
  const p3 = PALACES[i3];

  const rel12 = wxRelation(p1.wx, p2.wx);
  const rel23 = wxRelation(p2.wx, p3.wx);
  const rel13 = wxRelation(p1.wx, p3.wx);

  const jiang = schoolKey === 'jiang' ? buildJiangBoard(i3, shichenIdx) : null;

  return {
    id: params.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
    createdAt: params.createdAt || new Date().toISOString(),
    school: schoolKey,
    schoolName: school.name,
    mode: params.mode || 'time',
    modeLabel: params.modeLabel || '时间起课',
    inputSummary: params.inputSummary || `${n1} · ${n2} · ${n3}`,
    stepLabels: params.stepLabels || ['初传（起）', '中传（承）', '末传（落宫）'],
    nums: [n1, n2, n3],
    shichenIdx,
    question: String(params.question || '').trim(),
    topic: TOPICS.some(t => t.key === params.topic) ? params.topic : 'general',
    steps: [
      { stage: 1, title: '初传', sub: params.stepLabels?.[0] || '起因', num: n1, palaceIdx: i1, palace: p1 },
      { stage: 2, title: '中传', sub: params.stepLabels?.[1] || '经过', num: n2, palaceIdx: i2, palace: p2 },
      { stage: 3, title: '末传', sub: params.stepLabels?.[2] || '结果', num: n3, palaceIdx: i3, palace: p3 }
    ],
    main: p3,
    relations: { r12: rel12, r23: rel23, r13: rel13 },
    jiang,
    aiText: params.aiText || ''
  };
}

/* ===== 本地历史记录 ===== */
function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
function saveHistory(list) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY))); } catch {}
}

/* ===== 页面状态与渲染 ===== */
const state = {
  school: 'classic',
  mode: 'time',
  calKind: 'solar',
  numKind: 'three',
  activeTopic: 'general',
  inspectedPalaceIdx: null,
  currentCast: null,
  history: [],
  initialized: false
};

function notify(msg, success = false) {
  if (window.SUIWIND_BRIDGE?.toast) window.SUIWIND_BRIDGE.toast(msg, success);
}

function pad2(n) { return String(n).padStart(2, '0'); }

function syncThemeIcon() {
  const el = $('xlrThemeIcon');
  if (!el) return;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  el.innerHTML = ico(dark ? 'sun' : 'moon');
}

function populateSelects() {
  const shichenOpts = SHICHEN_LIST.map(s => `<option value="${s.idx}">${s.label}</option>`).join('');
  ['xlrShichen', 'xlrLunarShichen', 'xlrNumShichen'].forEach(id => {
    const el = $(id);
    if (el) el.innerHTML = shichenOpts;
  });
  const mEl = $('xlrLunarMonth');
  if (mEl) {
    mEl.innerHTML = LUNAR_MONTH_NAMES.map((name, i) => `<option value="${i + 1}">${name} (${i + 1})</option>`).join('');
  }
  const dEl = $('xlrLunarDay');
  if (dEl) {
    dEl.innerHTML = LUNAR_DAY_NAMES.map((name, i) => `<option value="${i + 1}">${name} (${i + 1})</option>`).join('');
  }
}

function resetTimeToNow() {
  const p = bjNowParts();
  const dateStr = `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
  const sc = hourToShichen(p.hour);
  if ($('xlrDate')) $('xlrDate').value = dateStr;
  if ($('xlrShichen')) $('xlrShichen').value = String(sc);
  if ($('xlrNumShichen')) $('xlrNumShichen').value = String(sc);

  const l = solarToLunarParts(dateStr);
  if ($('xlrLunarMonth')) $('xlrLunarMonth').value = String(l.month);
  if ($('xlrLunarDay')) $('xlrLunarDay').value = String(l.day);
  if ($('xlrLunarShichen')) $('xlrLunarShichen').value = String(sc);
  updateLunarPreview();
}

function updateLunarPreview() {
  const preview = $('xlrLunarPreview');
  if (!preview) return;
  if (state.calKind === 'solar') {
    const dVal = $('xlrDate')?.value || '';
    const sc = Number($('xlrShichen')?.value || 1);
    const l = solarToLunarParts(dVal);
    const sInfo = SHICHEN_LIST[sc - 1] || SHICHEN_LIST[0];
    preview.textContent = `公历 ${dVal || '今日'} → 农历 ${l.fullText}${l.isLeap ? '（按本月数计）' : ''} · ${sInfo.zhi}时（起数：月 ${l.month} / 日 ${l.day} / 时 ${sc}）`;
  } else {
    const lm = Number($('xlrLunarMonth')?.value || 1);
    const ld = Number($('xlrLunarDay')?.value || 1);
    const sc = Number($('xlrLunarShichen')?.value || 1);
    const sInfo = SHICHEN_LIST[sc - 1] || SHICHEN_LIST[0];
    preview.textContent = `手选农历 ${LUNAR_MONTH_NAMES[lm - 1]}${LUNAR_DAY_NAMES[ld - 1]} · ${sInfo.zhi}时（起数：月 ${lm} / 日 ${ld} / 时 ${sc}）`;
  }
}

function syncModeUI() {
  document.querySelectorAll('[data-xlr-school]').forEach(btn => {
    const on = btn.dataset.xlrSchool === state.school;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('[data-xlr-mode]').forEach(btn => {
    const on = btn.dataset.xlrMode === state.mode;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if ($('xlrPanelTime')) $('xlrPanelTime').hidden = state.mode !== 'time';
  if ($('xlrPanelNumber')) $('xlrPanelNumber').hidden = state.mode !== 'number';
  if ($('xlrPanelRandom')) $('xlrPanelRandom').hidden = state.mode !== 'random';

  if ($('xlrSolarFields')) $('xlrSolarFields').hidden = state.calKind !== 'solar';
  if ($('xlrLunarFields')) $('xlrLunarFields').hidden = state.calKind !== 'lunar';
  $('xlrCalSolarBtn')?.classList.toggle('active', state.calKind === 'solar');
  $('xlrCalLunarBtn')?.classList.toggle('active', state.calKind === 'lunar');

  if ($('xlrNum3Wrap')) $('xlrNum3Wrap').hidden = state.numKind !== 'three';
  if ($('xlrNumShichenWrap')) $('xlrNumShichenWrap').hidden = state.numKind !== 'two-time';
  $('xlrNum3Btn')?.classList.toggle('active', state.numKind === 'three');
  $('xlrNum2Btn')?.classList.toggle('active', state.numKind === 'two-time');

  if ($('xlrCastBtnText')) {
    $('xlrCastBtnText').textContent = state.mode === 'random' ? '随机起课排盘' : '立即排盘';
  }
  updateLunarPreview();
}

function gatherCastParams(forceRandom = false) {
  const mode = forceRandom ? 'random' : state.mode;
  const question = $('xlrQuestion')?.value.trim() || '';
  const topic = $('xlrTopic')?.value || 'general';
  const nowParts = bjNowParts();
  const nowShichen = hourToShichen(nowParts.hour);

  if (mode === 'time') {
    if (state.calKind === 'solar') {
      const dVal = $('xlrDate')?.value || `${nowParts.year}-${pad2(nowParts.month)}-${pad2(nowParts.day)}`;
      const sc = Number($('xlrShichen')?.value || nowShichen);
      const l = solarToLunarParts(dVal);
      const sInfo = SHICHEN_LIST[sc - 1] || SHICHEN_LIST[0];
      return {
        school: state.school, mode: 'time', modeLabel: '时间起课',
        n1: l.month, n2: l.day, n3: sc, shichenIdx: sc,
        inputSummary: `农历 ${l.fullText} ${sInfo.zhi}时（公历 ${dVal}）`,
        stepLabels: [`月数 ${l.month}（${l.monthName}）`, `日数 ${l.day}（${l.dayName}）`, `时辰 ${sc}（${sInfo.zhi}时）`],
        question, topic
      };
    }
    const lm = Number($('xlrLunarMonth')?.value || 1);
    const ld = Number($('xlrLunarDay')?.value || 1);
    const sc = Number($('xlrLunarShichen')?.value || nowShichen);
    const sInfo = SHICHEN_LIST[sc - 1] || SHICHEN_LIST[0];
    return {
      school: state.school, mode: 'time', modeLabel: '农历起课',
      n1: lm, n2: ld, n3: sc, shichenIdx: sc,
      inputSummary: `农历 ${LUNAR_MONTH_NAMES[lm - 1]}${LUNAR_DAY_NAMES[ld - 1]} ${sInfo.zhi}时`,
      stepLabels: [`月数 ${lm}（${LUNAR_MONTH_NAMES[lm - 1]}）`, `日数 ${ld}（${LUNAR_DAY_NAMES[ld - 1]}）`, `时辰 ${sc}（${sInfo.zhi}时）`],
      question, topic
    };
  }

  if (mode === 'number') {
    const n1 = Math.max(1, Math.floor(Number($('xlrNum1')?.value) || 1));
    const n2 = Math.max(1, Math.floor(Number($('xlrNum2')?.value) || 1));
    if (state.numKind === 'two-time') {
      const sc = Number($('xlrNumShichen')?.value || nowShichen);
      const sInfo = SHICHEN_LIST[sc - 1] || SHICHEN_LIST[0];
      return {
        school: state.school, mode: 'number', modeLabel: '两数加时起课',
        n1, n2, n3: sc, shichenIdx: sc,
        inputSummary: `报数 ${n1} · ${n2} + ${sInfo.zhi}时`,
        stepLabels: [`第一数 ${n1}`, `第二数 ${n2}`, `时辰 ${sc}（${sInfo.zhi}时）`],
        question, topic
      };
    }
    const n3 = Math.max(1, Math.floor(Number($('xlrNum3')?.value) || 1));
    const sInfo = SHICHEN_LIST[nowShichen - 1] || SHICHEN_LIST[0];
    return {
      school: state.school, mode: 'number', modeLabel: '三数起课',
      n1, n2, n3, shichenIdx: nowShichen,
      inputSummary: `三数 ${n1} · ${n2} · ${n3}（${sInfo.zhi}时）`,
      stepLabels: [`第一数 ${n1}`, `第二数 ${n2}`, `第三数 ${n3}`],
      question, topic
    };
  }

  // 随机起课
  const rng = () => {
    if (window.crypto?.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return (buf[0] % 99) + 1;
    }
    return Math.floor(Math.random() * 99) + 1;
  };
  const r1 = rng(), r2 = rng(), r3 = rng();
  const sInfo = SHICHEN_LIST[nowShichen - 1] || SHICHEN_LIST[0];
  if ($('xlrRandomSeedNote')) $('xlrRandomSeedNote').textContent = `本次起数：${r1} · ${r2} · ${r3}（${sInfo.zhi}时）`;
  return {
    school: state.school, mode: 'random', modeLabel: '随机起课',
    n1: r1, n2: r2, n3: r3, shichenIdx: nowShichen,
    inputSummary: `随机三数 ${r1} · ${r2} · ${r3}（${sInfo.zhi}时）`,
    stepLabels: [`随机一 ${r1}`, `随机二 ${r2}`, `随机三 ${r3}`],
    question, topic
  };
}

function renderCast(cast) {
  if (!cast) return;
  state.currentCast = cast;
  state.activeTopic = cast.topic || 'general';
  state.inspectedPalaceIdx = cast.main.idx;

  // 1. 抬头与落宫 Hero
  const metaParts = [cast.schoolName, cast.modeLabel, cast.inputSummary];
  if (cast.question) metaParts.push(`占题：${cast.question}`);
  if ($('xlrResMeta')) $('xlrResMeta').textContent = metaParts.join(' · ');

  const main = cast.main;
  const heroName = $('xlrResMainName');
  if (heroName) {
    heroName.textContent = main.name;
    heroName.dataset.wx = main.wxKey;
  }
  const ausEl = $('xlrResAuspice');
  if (ausEl) {
    ausEl.textContent = main.auspice;
    ausEl.className = `xlr-badge tone-${main.tone}`;
  }
  const wxEl = $('xlrResWx');
  if (wxEl) {
    wxEl.textContent = `五行 · ${main.wx}`;
    wxEl.dataset.wx = main.wxKey;
  }
  const dirEl = $('xlrResDir');
  if (dirEl) dirEl.textContent = `${main.bagua}宫 · ${main.dir}`;
  if ($('xlrResTagline')) $('xlrResTagline').textContent = main.tagline;
  if ($('xlrResVerse')) $('xlrResVerse').textContent = main.verse;

  // 2. 三传流转与生克
  const count = SCHOOLS[cast.school].count;
  if ($('xlrStepsRule')) {
    $('xlrStepsRule').textContent = `起大安顺数（${count} 宫循环）`;
  }

  const stepsBox = $('xlrStepsFlow');
  if (stepsBox) {
    const jiangSlots = cast.jiang?.slots;
    stepsBox.innerHTML = cast.steps.map((st, idx) => {
      const p = st.palace;
      const js = jiangSlots ? jiangSlots[p.idx] : null;
      const rel = idx === 0 ? cast.relations.r12 : idx === 1 ? cast.relations.r23 : null;
      const card = `
        <div class="xlr-step-card${idx === 2 ? ' is-final' : ''}" data-wx="${p.wxKey}">
          <div class="xlr-step-head">
            <span class="xlr-step-tag s${st.stage}">${st.title}</span>
            <span class="xlr-step-sub">${esc(st.sub)}</span>
          </div>
          <div class="xlr-step-name">${p.name}</div>
          <div class="xlr-step-meta">
            <span>${p.wx} · ${p.auspice}</span>
            <span>${p.bagua} · ${p.dir}</span>
          </div>
          ${js ? `<div class="xlr-step-jiang">${js.zhi}${js.zhiWx} · ${js.relation} · ${js.god.name}</div>` : ''}
        </div>`;
      const arrow = rel ? `
        <div class="xlr-step-arrow tone-${rel.tone}" title="${esc(rel.desc)}">
          <span class="xlr-arrow-rel">${rel.label}</span>
          <svg class="ico ico-sm" aria-hidden="true"><use href="#i-chevron-right"/></svg>
        </div>` : '';
      return card + arrow;
    }).join('');
  }

  const wxFlow = $('xlrWxFlow');
  if (wxFlow) {
    const [s1, s2, s3] = cast.steps;
    wxFlow.innerHTML = `
      <div class="xlr-wx-item"><b>初 → 中（${s1.palace.wx} → ${s2.palace.wx} · ${cast.relations.r12.label}）</b><span>${esc(cast.relations.r12.desc)}</span></div>
      <div class="xlr-wx-item"><b>中 → 末（${s2.palace.wx} → ${s3.palace.wx} · ${cast.relations.r23.label}）</b><span>${esc(cast.relations.r23.desc)}</span></div>
      <div class="xlr-wx-item"><b>初 → 末（${s1.palace.wx} → ${s3.palace.wx} · ${cast.relations.r13.label}）</b><span>${esc(cast.relations.r13.desc)}</span></div>
    `;
  }

  // 3. 可视化掌诀 / 九宫盘
  renderBoard(cast);

  // 4. 江氏全盘表
  const jWrap = $('xlrJiangTableWrap');
  if (jWrap) {
    if (cast.jiang) {
      jWrap.hidden = false;
      if ($('xlrJiangMeta')) {
        $('xlrJiangMeta').textContent = `身宫：${cast.main.name}（${ZHI_NAMES[cast.jiang.shichenZhi]}${cast.jiang.meWx}） · ${cast.jiang.dragonStartPalace}起青龙`;
      }
      const stepMap = getStepMarkers(cast);
      const tbody = $('xlrJiangTableBody');
      if (tbody) {
        tbody.innerHTML = PALACES.slice(0, 6).map(p => {
          const sl = cast.jiang.slots[p.idx];
          const tags = (stepMap[p.idx] || []).map(st => `<span class="xlr-mini-tag s${st}">${st === 1 ? '初' : st === 2 ? '中' : '末'}</span>`).join('');
          return `
            <tr class="${sl.isBody ? 'is-body' : ''}">
              <td><b>${p.name}</b> <span class="xlr-td-sub">${p.dir}</span></td>
              <td>${tags || '<span class="xlr-td-sub">—</span>'}</td>
              <td><span class="xlr-wx-dot" data-wx="${sl.zhiWxKey}"></span>${sl.zhi}${sl.zhiWx}</td>
              <td><b>${sl.relation}</b></td>
              <td>${sl.god.name}</td>
              <td class="xlr-td-brief">${esc(sl.relationBrief)}；${esc(sl.god.brief)}</td>
            </tr>`;
        }).join('');
      }
    } else {
      jWrap.hidden = true;
    }
  }

  // 5. 分类断语
  renderInterpret(cast);

  // 6. AI 输出区
  const aiOut = $('xlrAiOutput');
  if (aiOut) {
    if (cast.aiText) {
      aiOut.hidden = false;
      aiOut.classList.remove('loading');
      aiOut.textContent = cast.aiText;
    } else {
      aiOut.hidden = true;
      aiOut.textContent = '';
    }
  }
}

function getStepMarkers(cast) {
  const map = {};
  cast.steps.forEach(s => {
    if (!map[s.palaceIdx]) map[s.palaceIdx] = [];
    map[s.palaceIdx].push(s.stage);
  });
  return map;
}

function renderBoard(cast) {
  const board = $('xlrBoard');
  const title = $('xlrBoardTitle');
  if (!board) return;
  const isDao = cast.school === 'dao';
  const order = isDao ? LOSHU_ORDER_9 : PALM_ORDER_6;
  const stepMap = getStepMarkers(cast);

  board.className = `xlr-board ${isDao ? 'is-9' : 'is-6'}`;
  if (title) {
    title.textContent = isDao ? '道传九宫八卦盘（上南下北 · 左东右西）' : '左手六宫掌诀图（顺时针流转）';
  }

  board.innerHTML = order.map(idx => {
    const p = PALACES[idx];
    const marks = stepMap[idx] || [];
    const isFinal = marks.includes(3);
    const isHit = marks.length > 0;
    const isSel = state.inspectedPalaceIdx === idx;
    const sl = cast.jiang?.slots?.[idx] || null;
    const badges = marks.map(st => `<span class="xlr-cell-stage s${st}">${st === 1 ? '初' : st === 2 ? '中' : '末'}</span>`).join('');

    return `
      <button type="button" class="xlr-cell${isHit ? ' is-hit' : ''}${isFinal ? ' is-final' : ''}${isSel ? ' is-selected' : ''}" data-palace-idx="${idx}" data-wx="${p.wxKey}">
        <div class="xlr-cell-top">
          <span class="xlr-cell-pos">${isDao ? `${p.bagua} · ${p.dir}` : p.palm}</span>
          <span class="xlr-cell-stages">${badges}</span>
        </div>
        <div class="xlr-cell-name">${p.name}</div>
        <div class="xlr-cell-sub">
          <span class="xlr-cell-wx">${p.wx}</span>
          <span class="xlr-cell-aus tone-${p.tone}">${p.auspice}</span>
        </div>
        ${sl ? `
          <div class="xlr-cell-jiang">
            <span>${sl.zhi}${sl.zhiWx}</span>
            <b>${sl.relation}</b>
            <span>${sl.god.name}</span>
          </div>` : ''}
      </button>`;
  }).join('');

  board.querySelectorAll('[data-palace-idx]').forEach(btn => {
    btn.onclick = () => {
      state.inspectedPalaceIdx = Number(btn.dataset.palaceIdx);
      renderBoard(cast);
      renderCellInspect(cast);
    };
  });

  renderCellInspect(cast);
}

function renderCellInspect(cast) {
  const box = $('xlrCellInspect');
  if (!box) return;
  const idx = state.inspectedPalaceIdx ?? cast.main.idx;
  const p = PALACES[idx] || cast.main;
  const sl = cast.jiang?.slots?.[idx] || null;
  const marks = getStepMarkers(cast)[idx] || [];
  const markText = marks.length
    ? marks.map(s => s === 1 ? '初传' : s === 2 ? '中传' : '末传落宫').join(' / ')
    : '本课未落传（参考宫位）';

  box.innerHTML = `
    <div class="xlr-inspect-head">
      <strong>${p.name} · ${p.bagua}宫（${p.dir} / 五行属${p.wx} / ${p.auspice}）</strong>
      <span class="xlr-inspect-mark">${markText}</span>
    </div>
    <p class="xlr-inspect-text">${esc(p.meaning)}</p>
    ${sl ? `<p class="xlr-inspect-jiang"><b>江氏装卦：</b>${sl.zhi}${sl.zhiWx} · 六亲「${sl.relation}」（${esc(sl.relationBrief)}） · 六神「${sl.god.name}」（${esc(sl.god.brief)}）</p>` : ''}
  `;
}

function renderInterpret(cast) {
  const pills = $('xlrTopicPills');
  const box = $('xlrInterpret');
  if (!box) return;
  const main = cast.main;

  if (pills) {
    pills.innerHTML = TOPICS.map(t => `
      <button type="button" class="xlr-topic-pill${state.activeTopic === t.key ? ' active' : ''}" role="tab" aria-selected="${state.activeTopic === t.key ? 'true' : 'false'}" data-xlr-tview="${t.key}">${t.label}</button>
    `).join('');
    pills.querySelectorAll('[data-xlr-tview]').forEach(btn => {
      btn.onclick = () => {
        state.activeTopic = btn.dataset.xlrTview;
        renderInterpret(cast);
      };
    });
  }

  const curTopicObj = TOPICS.find(t => t.key === state.activeTopic) || TOPICS[0];
  const topicText = main.topics[state.activeTopic] || main.topics.general;
  const startPalace = cast.steps[0].palace;
  const midPalace = cast.steps[1].palace;

  box.innerHTML = `
    <div class="xlr-interp-focus">
      <span class="xlr-interp-eyebrow">${curTopicObj.label}重点参考</span>
      <p class="xlr-interp-main">${esc(topicText)}</p>
    </div>
    <div class="xlr-interp-grid">
      <div class="xlr-interp-block">
        <h4>象意总论</h4>
        <p>${esc(main.meaning)}</p>
      </div>
      <div class="xlr-interp-block">
        <h4>行动建议与宜忌</h4>
        <p>${esc(main.advice)}</p>
      </div>
      <div class="xlr-interp-block">
        <h4>三传脉络</h4>
        <p>由「${startPalace.name}（${startPalace.tagline.split('·')[1]?.trim() || startPalace.auspice}）」起念，经「${midPalace.name}（${midPalace.auspice}）」流转，终落「${main.name}（${main.auspice}）」。整体从初传至末传呈「${cast.relations.r13.label}」之势。</p>
      </div>
      <div class="xlr-interp-block">
        <h4>方位与时空提示</h4>
        <p>主应方位：${main.dir}（${main.bagua}宫） · 掌位：${main.palm} · 主星五行：${main.wx}。</p>
      </div>
    </div>
  `;
}

function renderHistory() {
  const listEl = $('xlrHistoryList');
  const countEl = $('xlrHistoryCount');
  if (countEl) countEl.textContent = `${state.history.length} 条记录`;
  if (!listEl) return;

  if (!state.history.length) {
    listEl.innerHTML = '<div class="xlr-history-empty">暂无排盘记录。点击左侧「立即排盘」后会自动保存于本机。</div>';
    return;
  }

  listEl.innerHTML = state.history.map(item => {
    const active = state.currentCast && state.currentCast.id === item.id;
    const path = item.steps.map(s => s.palace.name).join(' → ');
    const dt = new Date(item.createdAt);
    const timeStr = Number.isNaN(dt.getTime()) ? '' : `${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
    const qLabel = item.question || `${TOPICS.find(t => t.key === item.topic)?.label || '综合断事'} · ${item.modeLabel}`;
    return `
      <div class="xlr-hist-item${active ? ' active' : ''}" data-xlr-open="${esc(item.id)}">
        <div class="xlr-hist-top">
          <span class="xlr-hist-palace tone-${item.main.tone}">${item.main.name}</span>
          <span class="xlr-hist-school">${esc(item.schoolName)}</span>
          <span class="xlr-hist-time">${timeStr}</span>
          <button type="button" class="x xlr-hist-del" data-xlr-del="${esc(item.id)}" aria-label="删除此条记录">${ico('x', 'ico-sm')}</button>
        </div>
        <div class="xlr-hist-q">${esc(qLabel)}</div>
        <div class="xlr-hist-path">${esc(path)} · ${esc(item.inputSummary)}</div>
      </div>`;
  }).join('');

  listEl.querySelectorAll('[data-xlr-open]').forEach(row => {
    row.onclick = e => {
      if (e.target.closest('[data-xlr-del]')) return;
      const found = state.history.find(x => x.id === row.dataset.xlrOpen);
      if (!found) return;
      state.school = found.school;
      state.mode = found.mode || 'time';
      if ($('xlrQuestion')) $('xlrQuestion').value = found.question || '';
      if ($('xlrTopic')) $('xlrTopic').value = found.topic || 'general';
      syncModeUI();
      renderCast(found);
      renderHistory();
    };
  });
  listEl.querySelectorAll('[data-xlr-del]').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const id = btn.dataset.xlrDel;
      state.history = state.history.filter(x => x.id !== id);
      saveHistory(state.history);
      renderHistory();
    };
  });
}

/* ===== 结构化 Prompt 与 AI 解卦 ===== */
function buildPromptText(cast) {
  const topicLabel = TOPICS.find(t => t.key === cast.topic)?.label || '综合断事';
  const lines = [
    `【小六壬排盘记录】`,
    `- 流派：${cast.schoolName}`,
    `- 起课方式：${cast.modeLabel}（${cast.inputSummary}）`,
    `- 占测分类：${topicLabel}`,
    `- 所问之事：${cast.question || '（未填具体占题，请作综合解读）'}`,
    `- 三传路径：${cast.steps.map(s => `${s.title}「${s.palace.name}」(${s.palace.wx}/${s.palace.auspice})`).join(' → ')}`,
    `- 五行生克：初→中 ${cast.relations.r12.label}；中→末 ${cast.relations.r23.label}；初→末 ${cast.relations.r13.label}`,
    `- 末传落宫：${cast.main.name}（${cast.main.bagua}宫 · ${cast.main.dir} · ${cast.main.wx} · ${cast.main.auspice}）`,
    `- 传统断辞：${cast.main.verse}`
  ];
  if (cast.jiang) {
    lines.push(`- 江氏装卦（身宫 ${cast.main.name} · ${ZHI_NAMES[cast.jiang.shichenZhi]}${cast.jiang.meWx}，${cast.jiang.dragonStartPalace}起青龙）：`);
    PALACES.slice(0, 6).forEach(p => {
      const sl = cast.jiang.slots[p.idx];
      lines.push(`  · ${p.name}：${sl.zhi}${sl.zhiWx} / ${sl.relation} / ${sl.god.name}`);
    });
  }
  lines.push('', '请结合上述排盘流派、三传五行生克与我的占题，给出清醒、克制、具体可落地的三段式解读：1）核心趋势判断；2）过程关键变数与注意点；3）接下来最务实的 2 条行动建议。');
  return lines.join('\n');
}

async function runAiInterpret() {
  const cast = state.currentCast;
  if (!cast) return;
  const bridge = window.SUIWIND_BRIDGE;
  const cfg = bridge?.getAiCfg?.();
  if (!cfg?.apiKey) {
    bridge?.openAiModal?.();
    notify('请先在 AI 助手设置中填写 API Key');
    return;
  }
  const btn = $('xlrAiBtn'), out = $('xlrAiOutput');
  if (!btn || !out) return;
  btn.disabled = true;
  out.hidden = false;
  out.classList.add('loading');
  out.textContent = '正在结合三传生克与所问之事推演解读…';
  try {
    const sys = `${cfg.persona || '温暖克制、清醒真诚、有洞察力。'} 你精通中国传统小六壬（古法/江氏/道传）文化解析，回答不神叨、不恐吓，注重逻辑推演与现实可行建议，控制在 320 字以内。`;
    const reply = await bridge.callAI(sys, buildPromptText(cast));
    out.classList.remove('loading');
    out.textContent = reply;
    cast.aiText = reply;
    const hit = state.history.find(x => x.id === cast.id);
    if (hit) {
      hit.aiText = reply;
      saveHistory(state.history);
    }
    notify('AI 解卦已完成', true);
  } catch (err) {
    out.classList.remove('loading');
    out.textContent = `解卦失败：${err.message}`;
  } finally {
    btn.disabled = false;
  }
}

/* ===== 执行起课并保存 ===== */
function executeCast(save = true, forceRandom = false) {
  updateLunarPreview();
  const params = gatherCastParams(forceRandom);
  const cast = computeCast(params);
  renderCast(cast);
  if (save) {
    state.history = [cast, ...state.history.filter(x => x.id !== cast.id)].slice(0, MAX_HISTORY);
    saveHistory(state.history);
    renderHistory();
  }
  return cast;
}

/* ===== 开关全屏容器 ===== */
function syncBodyOverflow() {
  const baziOpen = $('baziPage')?.classList.contains('bazi-open');
  const xlrOpen = $('xlrPage')?.classList.contains('xlr-open');
  document.body.style.overflow = (baziOpen || xlrOpen) ? 'hidden' : '';
}

function open() {
  const page = $('xlrPage');
  if (!page) return;
  if (!state.initialized) {
    state.initialized = true;
    state.history = loadHistory();
    populateSelects();
    resetTimeToNow();
    syncModeUI();
    renderHistory();
    // 首次进入自动按当前北京时间起一盘预览（不污染历史列表，点击排盘才记入历史）
    executeCast(false, false);
  }
  syncThemeIcon();
  page.classList.add('xlr-open');
  page.setAttribute('aria-hidden', 'false');
  syncBodyOverflow();
  $('xlrClose')?.focus();
}

function close() {
  const page = $('xlrPage');
  if (!page) return;
  page.classList.remove('xlr-open');
  page.setAttribute('aria-hidden', 'true');
  syncBodyOverflow();
  $('xlrBtn')?.focus();
}

function init() {
  if (!$('xlrBtn') || !$('xlrPage')) return;

  $('xlrBtn').addEventListener('click', open);
  $('xlrClose')?.addEventListener('click', close);
  $('xlrThemeBtn')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (window.SUIWIND_BRIDGE?.applyTheme) window.SUIWIND_BRIDGE.applyTheme(next);
    else document.documentElement.setAttribute('data-theme', next);
    syncThemeIcon();
  });

  // 监听主页面深浅主题变化，实时同步图标
  new MutationObserver(syncThemeIcon).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // 流派切换：若已有当前排盘则按同一组起数实时重算切换流派视角
  document.querySelectorAll('[data-xlr-school]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.school = btn.dataset.xlrSchool;
      syncModeUI();
      if (state.currentCast) {
        const cur = state.currentCast;
        const recast = computeCast({
          school: state.school,
          mode: cur.mode,
          modeLabel: cur.modeLabel,
          n1: cur.nums[0], n2: cur.nums[1], n3: cur.nums[2],
          shichenIdx: cur.shichenIdx,
          inputSummary: cur.inputSummary,
          stepLabels: cur.stepLabels,
          question: $('xlrQuestion')?.value.trim() ?? cur.question,
          topic: $('xlrTopic')?.value || cur.topic
        });
        renderCast(recast);
      }
    });
  });

  document.querySelectorAll('[data-xlr-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.xlrMode;
      syncModeUI();
    });
  });

  document.querySelectorAll('[data-xlr-cal]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.calKind = btn.dataset.xlrCal;
      syncModeUI();
    });
  });

  document.querySelectorAll('[data-xlr-numkind]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.numKind = btn.dataset.xlrNumkind;
      syncModeUI();
    });
  });

  ['xlrDate', 'xlrShichen', 'xlrLunarMonth', 'xlrLunarDay', 'xlrLunarShichen'].forEach(id => {
    $(id)?.addEventListener('change', updateLunarPreview);
  });

  $('xlrNowBtn')?.addEventListener('click', () => {
    resetTimeToNow();
    notify('已重置为当前北京时间');
  });

  $('xlrTopic')?.addEventListener('change', () => {
    if (state.currentCast) {
      state.activeTopic = $('xlrTopic').value || 'general';
      state.currentCast.topic = state.activeTopic;
      renderInterpret(state.currentCast);
    }
  });

  // 移动端点击流派或起课方式顶栏时自动展开起课参数区
  document.querySelector('.xlr-composer-top')?.addEventListener('click', () => {
    document.querySelector('.xlr-composer')?.classList.remove('is-collapsed');
  });

  const collapseAfterMobileCast = () => {
    if (window.matchMedia('(max-width:720px)').matches) {
      document.querySelector('.xlr-composer')?.classList.add('is-collapsed');
      $('xlrResultCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  $('xlrCastBtn')?.addEventListener('click', () => {
    executeCast(true, false);
    notify('排盘完成，已存入记录', true);
    collapseAfterMobileCast();
  });

  $('xlrQuickRandomBtn')?.addEventListener('click', () => {
    state.mode = 'random';
    syncModeUI();
    executeCast(true, true);
    notify('已随机起课并存入记录', true);
    collapseAfterMobileCast();
  });

  $('xlrCopyPromptBtn')?.addEventListener('click', () => {
    if (!state.currentCast) return;
    const text = buildPromptText(state.currentCast);
    if (window.SUIWIND_BRIDGE?.copyText) window.SUIWIND_BRIDGE.copyText(text);
    else navigator.clipboard?.writeText(text);
  });

  $('xlrAiBtn')?.addEventListener('click', runAiInterpret);

  $('xlrClearHistoryBtn')?.addEventListener('click', () => {
    if (!state.history.length) return;
    if (!confirm('清空本机保存的全部小六壬排盘记录？')) return;
    state.history = [];
    saveHistory([]);
    renderHistory();
    notify('排盘记录已清空');
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if ($('aiModal')?.classList.contains('show')) return;
    if ($('xlrPage')?.classList.contains('xlr-open')) close();
  });

  window.SUIWIND_XLR = { computeCast, buildJiangBoard, solarToLunarParts, open, close };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
