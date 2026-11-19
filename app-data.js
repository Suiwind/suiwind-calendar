/* 苏伊温德日历 V2.0.0 · 静态课程与基础数据层
 * 仅存放公开课程大纲、节气与制度常量；不含个人真实课表、教室及隐私记录。
 */
(function(global){
'use strict';

const APP_VERSION = 'V2.0.0';
const APP_CACHE_TAG = 'v200';
const LEARNING_TIME_ZONE = 'Asia/Shanghai';

const LEARNING_CONFIG = {
  militaryStart: '2026-10-12',
  militaryEnd: '2026-10-25',
  resumeDate: '2026-10-26',
  examDate: '2026-12-13',
  contentDeadline: '2026-12-10',
  round1SoftTarget: '2026-11-18',
  transferPlanStart: '2026-10-12',
  transferWindowStart: '2029-03-20',
  transferWindowEnd: '2029-03-31',
  transferStatus: '待官方公布'
};

const DEFAULT_LEARNING_COUNTDOWNS = [
  {id:'preset-putonghua-20261114',title:'普通话考试',date:'2026-11-14',kind:'考证',note:'普通话水平测试'}
];

const V150_MILESTONES = [
  {id:'goal-putonghua-20261114',title:'普通话考试',date:'2026-11-14',kind:'考证',note:'普通话水平测试'},
  {id:'goal-english-b',title:'英语三级 B 考试',date:'2026-12-13',kind:'考试',note:'当前计划节点，可随官方/学校通知修改'},
  {id:'goal-wps-2027',title:'计算机二级 WPS',date:'2027-03-27',endDate:'2027-03-29',kind:'考证',note:'预计考试窗口，待官方公布后修改'},
  {id:'goal-cet4-2027',title:'英语四级 CET4',date:'2027-06-12',kind:'考试',note:'预计日期，待官方公布后修改'},
  {id:'goal-cet6-2027',title:'英语六级 CET6',date:'2027-12-11',kind:'考试',note:'预计日期，待官方公布后修改'},
  {id:'goal-transfer',title:'2029 江苏专转本预计窗口',date:'2029-03-20',endDate:'2029-03-31',kind:'升学考试',note:'预计 3 月下旬，待江苏省教育考试院公布后修改'}
];

const REVIEW_OFFSETS = [1, 3, 7, 14, 30];
const STUDY_SUBJECTS = ['英语', '财经', '高数', '其他'];

const ROADMAP_THEMES = {
  2026: ['基础打底年', '把英语词汇与学习习惯真正建立起来；财经、高数启动，并完成普通话 / 三级B等近期节点。'],
  2027: ['能力提升年', '英语证书与计算机能力并行，四级、六级和 WPS 等节点按实际通知动态调整。'],
  2028: ['强化沉淀年', '专转本进入系统强化：持续刷题、复盘与查漏补缺，给 2029 冲刺留足余量。'],
  2029: ['冲刺应考年', '以江苏专转本正式考试通知为准，围绕最终节点做收口、模拟与状态管理。']
};

const V158_TIME_CLASSES = {
  'CORE-DEEP': {label:'CORE-DEEP 深度学习', count:true, group:'核心', help:'做题、学新内容、案例分析等持续认知加工。'},
  'CORE-RETRIEVAL': {label:'CORE-RETRIEVAL 提取复习', count:true, group:'核心', help:'闭卷回忆、错题提取、间隔复习、模拟测验。'},
  'ACTIVE-CLASS': {label:'ACTIVE-CLASS 主动网课/课堂', count:true, group:'核心', help:'专注听课并做笔记/题目，课后能闭卷回忆。'},
  'OTHER-ACADEMIC': {label:'OTHER-ACADEMIC 其他学业/竞赛', count:false, group:'其他', help:'职规赛、安全竞赛、非专转本核心学习。'},
  'ADMIN': {label:'ADMIN 行政/排版/找资料', count:false, group:'其他', help:'PPT排版、下载资料、整理文件、计划等。'},
  'REST': {label:'REST 休息/娱乐', count:false, group:'其他', help:'恢复、游戏、约会、散步等，不冒充学习。'}
};

const ENGLISH_SKILL_PLAN_ORDER = [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,10,11,12,13,14,15,16,17,18,6,7,8,9,1,2,3,4,5];
const ENGLISH_SKILL_DAILY_BLOCKS = [
  {day:1,ids:[19,20],stage:'阅读 · 仔细阅读'},
  {day:2,ids:[21,22,23],stage:'阅读 · 仔细阅读'},
  {day:3,ids:[24,25,26],stage:'阅读 · 仔细阅读'},
  {day:4,ids:[27,28,29,30],stage:'阅读 · 仔细阅读 → 长篇阅读'},
  {day:5,ids:[31,32,33],stage:'阅读 · 长篇阅读'},
  {day:6,ids:[34,35,36,37,38],stage:'阅读 · 词汇理解 / 收尾'},
  {day:7,ids:[10,11],stage:'听力 · 短篇新闻'},
  {day:8,ids:[12,13],stage:'听力 · 新闻 → 长对话'},
  {day:9,ids:[14,15],stage:'听力 · 长对话'},
  {day:10,ids:[16,17],stage:'听力 · 篇章'},
  {day:11,ids:[18,6,7],stage:'听力收尾 → 翻译'},
  {day:12,ids:[8,9,1],stage:'翻译收尾 → 写作'},
  {day:13,ids:[2,3],stage:'写作 · 扩写 / 论证'},
  {day:14,ids:[4,5],stage:'写作 · 题型精讲'}
];

const FINANCE_PLAN=[{"originalDay":1,"subject":"会计基础","title":"会计概述","target":"2个掌握考点","sourcePage":3},{"originalDay":2,"subject":"会计基础","title":"会计科目与账户","target":"3个掌握考点","sourcePage":3},{"originalDay":3,"subject":"会计基础","title":"会计记账方法","target":"4个掌握考点","sourcePage":3},{"originalDay":4,"subject":"会计基础","title":"会计凭证","target":"2个掌握考点","sourcePage":3},{"originalDay":5,"subject":"会计基础","title":"会计账簿","target":"3个掌握考点","sourcePage":3},{"originalDay":6,"subject":"会计基础","title":"账务处理程序","target":"2个掌握考点","sourcePage":3},{"originalDay":7,"subject":"会计基础","title":"经济业务核算——筹资与采购","target":"3个掌握考点","sourcePage":3},{"originalDay":8,"subject":"会计基础","title":"经济业务核算——生产","target":"3个掌握考点","sourcePage":3},{"originalDay":9,"subject":"会计基础","title":"经济业务核算——销售与财务成果","target":"4个掌握考点","sourcePage":3},{"originalDay":10,"subject":"会计基础","title":"财产清查","target":"3个掌握考点","sourcePage":3},{"originalDay":11,"subject":"会计基础","title":"会计报表","target":"2个掌握考点","sourcePage":3},{"originalDay":12,"subject":"财务管理","title":"总论","target":"1个掌握考点","sourcePage":3},{"originalDay":13,"subject":"财务管理","title":"货币时间价值","target":"4个掌握考点","sourcePage":3},{"originalDay":14,"subject":"财务管理","title":"筹资管理","target":"2个掌握考点","sourcePage":3},{"originalDay":15,"subject":"财务管理","title":"资金预测","target":"3个掌握考点","sourcePage":3},{"originalDay":16,"subject":"财务管理","title":"资本成本","target":"3个掌握考点","sourcePage":3},{"originalDay":17,"subject":"财务管理","title":"投资管理","target":"4个掌握考点","sourcePage":3},{"originalDay":18,"subject":"财务管理","title":"营运资本管理","target":"4个掌握考点","sourcePage":3},{"originalDay":19,"subject":"财务管理","title":"股利分配管理","target":"3个掌握考点","sourcePage":3},{"originalDay":20,"subject":"经济学","title":"经济学概述","target":"1个掌握考点","sourcePage":3},{"originalDay":21,"subject":"经济学","title":"供给与需求","target":"5个掌握考点","sourcePage":3},{"originalDay":22,"subject":"经济学","title":"消费者行为","target":"3个掌握考点","sourcePage":3},{"originalDay":23,"subject":"经济学","title":"生产者行为","target":"3个掌握考点","sourcePage":4},{"originalDay":24,"subject":"经济学","title":"成本与收益","target":"4个掌握考点","sourcePage":4},{"originalDay":25,"subject":"经济学","title":"市场结构","target":"2个掌握考点","sourcePage":4},{"originalDay":26,"subject":"经济学","title":"收入分配","target":"1个掌握考点","sourcePage":4},{"originalDay":27,"subject":"经济学","title":"市场失灵与政府干预","target":"2个掌握考点","sourcePage":4},{"originalDay":28,"subject":"经济学","title":"国民收入","target":"3个掌握考点","sourcePage":4},{"originalDay":29,"subject":"经济学","title":"经济周期与增长","target":"0个掌握考点","sourcePage":4},{"originalDay":30,"subject":"经济学","title":"失业与通货膨胀","target":"2个掌握考点","sourcePage":4},{"originalDay":31,"subject":"经济学","title":"宏观经济政策","target":"3个掌握考点","sourcePage":4},{"originalDay":32,"subject":"三科综合","title":"考纲划重点直播课","target":"2个掌握考点","sourcePage":4},{"originalDay":33,"subject":"三科综合","title":"薄弱点清单","target":"1个掌握考点","sourcePage":4},{"originalDay":34,"subject":"会计基础","title":"第1-2章","target":"1个掌握考点","sourcePage":5},{"originalDay":35,"subject":"会计基础","title":"第3章借贷记账法","target":"3个掌握考点","sourcePage":5},{"originalDay":36,"subject":"会计基础","title":"第4-6章","target":"2个掌握考点","sourcePage":5},{"originalDay":37,"subject":"会计基础","title":"第7章（上）筹资采购生产","target":"3个掌握考点","sourcePage":5},{"originalDay":38,"subject":"会计基础","title":"第7章（下）销售与财务成果","target":"3个掌握考点","sourcePage":5},{"originalDay":39,"subject":"会计基础","title":"第8-9章","target":"3个掌握考点","sourcePage":5},{"originalDay":40,"subject":"会计基础","title":"综合套题与错题","target":"2个掌握考点","sourcePage":5},{"originalDay":41,"subject":"财务管理","title":"第1-2章","target":"3个掌握考点","sourcePage":5},{"originalDay":42,"subject":"财务管理","title":"第3-4章","target":"3个掌握考点","sourcePage":5},{"originalDay":43,"subject":"财务管理","title":"第5章资本成本","target":"3个掌握考点","sourcePage":5},{"originalDay":44,"subject":"财务管理","title":"第6章投资管理","target":"3个掌握考点","sourcePage":5},{"originalDay":45,"subject":"财务管理","title":"第7章营运资本","target":"3个掌握考点","sourcePage":5},{"originalDay":46,"subject":"财务管理","title":"第8章股利分配","target":"2个掌握考点","sourcePage":5},{"originalDay":47,"subject":"财务管理","title":"综合套题与错题","target":"2个掌握考点","sourcePage":5},{"originalDay":48,"subject":"经济学","title":"第1-2章","target":"3个掌握考点","sourcePage":5},{"originalDay":49,"subject":"经济学","title":"第3-4章","target":"2个掌握考点","sourcePage":5},{"originalDay":50,"subject":"经济学","title":"第5章成本与收益","target":"3个掌握考点","sourcePage":5},{"originalDay":51,"subject":"经济学","title":"第6章市场结构","target":"3个掌握考点","sourcePage":5},{"originalDay":52,"subject":"经济学","title":"第7-8章","target":"1个掌握考点","sourcePage":5},{"originalDay":53,"subject":"经济学","title":"第9章国民收入","target":"3个掌握考点","sourcePage":5},{"originalDay":54,"subject":"经济学","title":"第10-11章","target":"1个掌握考点","sourcePage":5},{"originalDay":55,"subject":"经济学","title":"第12章宏观经济政策","target":"3个掌握考点","sourcePage":5},{"originalDay":56,"subject":"经济学","title":"综合套题与错题","target":"2个掌握考点","sourcePage":5},{"originalDay":57,"subject":"会计基础","title":"筹资采购与生产业务","target":"4个掌握考点","sourcePage":5},{"originalDay":58,"subject":"会计基础","title":"销售财务成果与综合默写","target":"4个掌握考点","sourcePage":6},{"originalDay":59,"subject":"财务管理","title":"时间价值筹资与投资","target":"4个掌握考点","sourcePage":6},{"originalDay":60,"subject":"财务管理","title":"营运资本与股利分配","target":"3个掌握考点","sourcePage":6},{"originalDay":61,"subject":"经济学","title":"微观图形（趋势及原因）","target":"2个掌握考点","sourcePage":6},{"originalDay":62,"subject":"经济学","title":"宏观图形与速记（趋势及原因）","target":"2个掌握考点","sourcePage":6},{"originalDay":63,"subject":"会计基础","title":"会计（试算平衡与错账更正）","target":"2个掌握考点","sourcePage":6},{"originalDay":64,"subject":"会计基础","title":"会计（经济业务核算）","target":"4个掌握考点","sourcePage":6},{"originalDay":65,"subject":"会计基础","title":"会计（报表与成本折旧）","target":"2个掌握考点","sourcePage":6},{"originalDay":66,"subject":"会计基础","title":"会计（综合提高）","target":"2个掌握考点","sourcePage":6},{"originalDay":67,"subject":"财务管理","title":"财管（货币时间价值与资金预测）","target":"2个掌握考点","sourcePage":6},{"originalDay":68,"subject":"财务管理","title":"财管（资本成本）","target":"2个掌握考点","sourcePage":6},{"originalDay":69,"subject":"财务管理","title":"财管（投资决策）","target":"3个掌握考点","sourcePage":6},{"originalDay":70,"subject":"财务管理","title":"财管（营运资本管理）","target":"2个掌握考点","sourcePage":6},{"originalDay":71,"subject":"财务管理","title":"财管（综合提高）","target":"2个掌握考点","sourcePage":6},{"originalDay":72,"subject":"经济学","title":"经济学（弹性与消费者均衡）","target":"3个掌握考点","sourcePage":6},{"originalDay":73,"subject":"经济学","title":"经济学（成本与厂商均衡）","target":"3个掌握考点","sourcePage":6},{"originalDay":74,"subject":"经济学","title":"经济学（GDP与乘数）","target":"2个掌握考点","sourcePage":6},{"originalDay":75,"subject":"经济学","title":"经济学（综合提高）","target":"2个掌握考点","sourcePage":6},{"originalDay":76,"subject":"三科综合","title":"三科易混点对比梳理","target":"3个掌握考点","sourcePage":6},{"originalDay":77,"subject":"三科综合","title":"三科错题回顾","target":"3个掌握考点","sourcePage":6},{"originalDay":78,"subject":"三科综合","title":"薄弱点最后突破","target":"2个掌握考点","sourcePage":6},{"originalDay":79,"subject":"三科综合","title":"必背清单过一遍","target":"3个掌握考点","sourcePage":6},{"originalDay":80,"subject":"三科综合","title":"年前学习收官总结","target":"3个掌握考点","sourcePage":6}];
const FINANCE_EXEC_ORDER=[1,2,3,4,5,6,7,8,9,10,11,34,35,36,37,38,39,40,57,58,63,64,65,66,12,13,14,15,16,17,18,19,41,42,43,44,45,46,47,59,60,67,68,69,70,71,20,21,22,23,24,25,26,27,28,29,30,31,48,49,50,51,52,53,54,55,56,61,62,72,73,74,75,32,33,76,77,78,79,80];
const FINANCE_PHASES=[
  {name:'会计闭环',start:0,end:23,total:24,note:'基础 → 习题 → 分录 → 计算/综合'},
  {name:'财管闭环',start:24,end:45,total:22,note:'基础 → 习题 → 公式 → 计算'},
  {name:'经济学闭环',start:46,end:72,total:27,note:'基础 → 习题 → 图形 → 计算'},
  {name:'三科收官',start:73,end:79,total:7,note:'考纲 / 薄弱点 / 错题 / 必背 / 总结'}
];
const MATH_PLAN=[{"day":1,"lectures":[{"title":"第1讲-分数运算和去括号","duration":"9:37"},{"title":"第2讲-分式运算","duration":"11:23"},{"title":"第3讲-解方程根与系数的关系","duration":"11:28"},{"title":"第4讲-绝对值","duration":"3:19"},{"title":"第5讲-直线方程","duration":"6:24"},{"title":"第6讲-圆的方程","duration":"9:45"},{"title":"第7讲-抛物线方程","duration":"7:15"},{"title":"第8讲-三角函数","duration":"9:47"}],"drills":[1,2,3,4],"sourcePage":1},{"day":2,"lectures":[{"title":"第9讲-区间表示","duration":"4:39"},{"title":"第10讲-函数定义和表示","duration":"14:59"},{"title":"第11讲-函数性质奇偶性","duration":"9:46"},{"title":"第12讲-函数性质单调有界周期性","duration":"9:07"},{"title":"第13讲-复合函数和反函数","duration":"8:51"},{"title":"第14讲-幂函数","duration":"10:42"},{"title":"第15讲-指数函数","duration":"7:05"}],"drills":[5,6,7,8],"sourcePage":1},{"day":3,"lectures":[{"title":"第16讲-对数函数","duration":"7:19"},{"title":"第17讲-三角函数","duration":"9:34"},{"title":"第18讲-三角函数公式","duration":"6:14"},{"title":"第19讲-反正弦和反余弦三角函数","duration":"12:21"},{"title":"第20讲-反正切和反余切三角函数","duration":"7:39"},{"title":"第21讲-初等函数和分段函数","duration":"5:56"}],"drills":[9],"sourcePage":1},{"day":4,"lectures":[{"title":"第22讲-数列极限","duration":"10:15"},{"title":"第23讲-无穷处极限","duration":"8:30"},{"title":"第24讲-某一点处极限","duration":"8:48"},{"title":"第25讲-极限运算法则","duration":"9:55"},{"title":"第26讲-两个重要极限","duration":"14:32"}],"drills":[10,11,12,13,14,15,16,17,18],"sourcePage":2},{"day":5,"lectures":[{"title":"第27讲-无穷小量和无穷大量","duration":"14:33"},{"title":"第28讲-无穷小的比较","duration":"10:05"},{"title":"第29讲-等价无穷小","duration":"9:48"}],"drills":[19,20,21],"sourcePage":2},{"day":6,"lectures":[{"title":"第30讲-连续定义和判断","duration":"11:27"},{"title":"第31讲-间断点的分类和判断","duration":"18:12"},{"title":"第32讲-连续性定理","duration":"11:14"}],"drills":[22,23,24,25,26],"sourcePage":2},{"day":7,"lectures":[{"title":"第33讲-导数的定义","duration":"22:25"},{"title":"第34讲-利用导数定义求极限","duration":"9:07"},{"title":"第35讲-导数的几何意义","duration":"10:45"},{"title":"第36讲-连续可导的关系","duration":"13:11"},{"title":"第37讲-求导法则和基本函数求导公式","duration":"9:16"}],"drills":[27,28,29,30,31,32,33],"sourcePage":2},{"day":8,"lectures":[{"title":"第38讲-复合函数和反函数求导法则","duration":"12:30"},{"title":"第39讲-高阶导数","duration":"19:31"},{"title":"第40讲-分段函数求导法则","duration":"12:10"},{"title":"第41讲-隐函数求导法则","duration":"10:37"},{"title":"第42讲-含参求导法则","duration":"18:44"},{"title":"第43讲-微分","duration":"4:08"}],"drills":[34,35,36,37,38,39,40,41,42,43,44,45],"sourcePage":3},{"day":9,"lectures":[{"title":"第44讲-罗尔定理","duration":"8:06"},{"title":"第45讲-拉格朗日定理","duration":"9:34"}],"drills":[46,47,48,49],"sourcePage":3},{"day":10,"lectures":[{"title":"第46讲-洛必达法则0比0无穷比无穷","duration":"12:56"},{"title":"第47讲-洛必达法则其它类型","duration":"10:05"}],"drills":[50,51,52],"sourcePage":3},{"day":11,"lectures":[{"title":"第48讲-单调性证明一个不等号","duration":"15:30"},{"title":"第49讲-单调性证明两个不等号","duration":"12:11"}],"drills":[53,54,55],"sourcePage":3},{"day":12,"lectures":[{"title":"第50讲-极值的定义","duration":"11:49"},{"title":"第51讲-极值点的注意事项","duration":"9:44"},{"title":"第52讲-二导判定极值点法则","duration":"5:52"},{"title":"第53讲-最值","duration":"14:19"}],"drills":[56,57,58],"sourcePage":3},{"day":13,"lectures":[{"title":"第54讲-凹凸性","duration":"15:27"},{"title":"第55讲-渐近线","duration":"7:35"},{"title":"第56讲-函数性态综合研究","duration":"7:03"}],"drills":[59,60,61,62],"sourcePage":4},{"day":14,"lectures":[{"title":"第57讲-原函数与不定积分的概念","duration":"11:25"},{"title":"第58讲-不定积分的性质","duration":"5:08"},{"title":"第59讲-不定积分的基本公式","duration":"6:20"},{"title":"第60讲-直接积分法","duration":"9:25"}],"drills":[63,64,65,66,67],"sourcePage":4},{"day":15,"lectures":[{"title":"第61讲-凑微分法幂函数型","duration":"11:30"},{"title":"第62讲-凑微分法指数和对数型","duration":"10:15"},{"title":"第63讲-凑微分法反正弦和反正切型","duration":"14:22"},{"title":"第64讲-凑微分法综合型","duration":"8:14"}],"drills":[68,69,70,71],"sourcePage":4},{"day":16,"lectures":[{"title":"第65讲-第二类三角换元法","duration":"14:56"},{"title":"第66讲-第二类整体换元倒代法","duration":"9:15"}],"drills":[72,73,74],"sourcePage":4},{"day":17,"lectures":[{"title":"第67讲-分部积分法幂指幂三","duration":"10:08"},{"title":"第68讲-分部积分法幂函对幂反三","duration":"11:11"},{"title":"第69讲-分部积分法指三原函数","duration":"14:44"}],"drills":[75,76,77,78,79],"sourcePage":5},{"day":18,"lectures":[{"title":"第70讲-有理函数和无理函数积分","duration":"11:58"},{"title":"第71讲-定积分的定义","duration":"13:00"},{"title":"第72讲-定积分的几何意义","duration":"8:41"},{"title":"第73讲-定积分的性质-1","duration":"8:46"},{"title":"第74讲-定积分的性质-2","duration":"11:17"}],"drills":[80,81,82,83],"sourcePage":5},{"day":19,"lectures":[{"title":"第75讲-变上限积分","duration":"14:46"},{"title":"第76讲-牛顿莱布尼兹公式","duration":"7:54"}],"drills":[84,85,86,87,88,89,90],"sourcePage":5},{"day":20,"lectures":[{"title":"第77讲-定积分的换元积分法","duration":"8:17"},{"title":"第78讲-定积分的分部积分法","duration":"13:48"}],"drills":[91,92,93,94,95,96],"sourcePage":6},{"day":21,"lectures":[{"title":"第79讲-定积分的倒代法","duration":"3:12"},{"title":"第80讲-对称区间上的定积分","duration":"7:46"},{"title":"第81讲-点火公式","duration":"7:36"},{"title":"第82讲-无穷区间的反常积分广义积分","duration":"18:48"},{"title":"第83讲-无穷间断点的反常积分瑕积分","duration":"4:28"}],"drills":[97,98,99,100],"sourcePage":6},{"day":22,"lectures":[{"title":"第84讲-求面积","duration":"21:11"},{"title":"第85讲-旋转体的体积","duration":"10:08"},{"title":"第86讲-柱壳法","duration":"11:16"}],"drills":[101,102,103,104,105,106,107],"sourcePage":6},{"day":23,"lectures":[{"title":"第87讲-多元函数概念","duration":"12:43"},{"title":"第88讲-多元函数极限和连续","duration":"12:10"},{"title":"第89讲-多元函数的偏导数","duration":"16:10"},{"title":"第90讲-全微分","duration":"12:09"}],"drills":[108,109,110,111,112,113],"sourcePage":7},{"day":24,"lectures":[{"title":"第91讲-二阶偏导数","duration":"10:34"},{"title":"第92讲-多元复合函数偏导数","duration":"16:47"},{"title":"第93讲-隐函数求二阶偏导","duration":"13:22"}],"drills":[114,115,116,117,118,119],"sourcePage":7},{"day":25,"lectures":[{"title":"第94讲-二元函数的极值","duration":"17:49"},{"title":"第95讲-二元函数的最值","duration":"8:59"},{"title":"第96讲-条件极值","duration":"12:33"}],"drills":[120,121,122],"sourcePage":7},{"day":26,"lectures":[{"title":"第97讲-二重积分的概念和性质","duration":"11:11"},{"title":"第98讲-二重积分的积分区域分类","duration":"18:50"},{"title":"第99讲-二次积分和交换积分次序","duration":"13:34"}],"drills":[123,124,125,126],"sourcePage":8},{"day":27,"lectures":[{"title":"第100讲-直角坐标系下二重积分的计算","duration":"16:07"}],"drills":[127,128,129,130,131],"sourcePage":8},{"day":28,"lectures":[{"title":"第101讲-极坐标系如何表示积分区域","duration":"20:43"},{"title":"第102讲-极坐标系下二重积分的计算","duration":"8:37"},{"title":"第103讲-利用对称性简化二重积分的计算","duration":"12:42"}],"drills":[132,133,134,135,136,137],"sourcePage":8},{"day":29,"lectures":[{"title":"第104讲-无穷级数的概念","duration":"11:12"},{"title":"第105讲-几何级数","duration":"11:00"},{"title":"第106讲-常数项级数的性质","duration":"13:19"},{"title":"第107讲-正项级数的比较判别法","duration":"12:36"},{"title":"第108讲-正项级数的比较判别法极限形式","duration":"7:26"},{"title":"第109讲-正项级数的比值判别法","duration":"7:59"}],"drills":[138,139,140,141,142],"sourcePage":9},{"day":30,"lectures":[{"title":"第110讲-交错级数的莱布尼兹判别法","duration":"11:17"},{"title":"第111讲-幂级数收敛半径和收敛域","duration":"10:33"},{"title":"第112讲-幂级数的各种变型","duration":"18:24"}],"drills":[143,144,145,146,147,148],"sourcePage":9},{"day":31,"lectures":[{"title":"第113讲-常微分方程基本概念","duration":"17:44"},{"title":"第114讲-一阶变量可分离微分方程","duration":"9:33"},{"title":"第115讲-一阶齐次微分方程","duration":"10:08"}],"drills":[149,150,151,152,153,154,155],"sourcePage":9},{"day":32,"lectures":[{"title":"第116讲-一阶线性微分方程","duration":"13:52"},{"title":"第117讲-一阶微分方程解简单应用题","duration":"12:10"}],"drills":[156,157,158,159,160,161],"sourcePage":10},{"day":33,"lectures":[{"title":"第118讲-二阶线性微分方程解的性质","duration":"13:51"},{"title":"第119讲-二阶常系数齐次线性微分方程通解求法","duration":"8:52"}],"drills":[162,163,164,165],"sourcePage":10},{"day":34,"lectures":[{"title":"第120讲-二阶常系数非齐次线性微分方程通解求法","duration":"17:04"},{"title":"第121讲-二阶常系数非齐次线性微分方程通解典型案例","duration":"7:15"}],"drills":[166,167,168,169],"sourcePage":10},{"day":35,"lectures":[{"title":"第122讲-二阶三阶行列式求法","duration":"13:55"},{"title":"第123讲-排列与逆序数","duration":"10:13"},{"title":"第124讲-对换与n阶行列式定义","duration":"14:01"},{"title":"第125讲-几种特殊行列式","duration":"8:20"},{"title":"第126讲-行列式性质-转置和交换","duration":"8:31"},{"title":"第127讲-行列式性质-数乘","duration":"8:42"},{"title":"第128讲-行列式性质-拆分","duration":"10:12"},{"title":"第129讲-行列式性质-倍加","duration":"11:44"}],"drills":[170],"sourcePage":11},{"day":36,"lectures":[{"title":"第130讲-综合应用行列式性质计算","duration":"14:58"}],"drills":[171,172,173,174,175,176,177,178],"sourcePage":11},{"day":37,"lectures":[{"title":"第131讲-余子式和代数余子式","duration":"12:08"},{"title":"第132讲-行列式按行或列展开","duration":"9:47"},{"title":"第133讲-逆用行列式按行或列展开","duration":"10:54"},{"title":"第134讲-逆用行列式按行或列展开典型案例","duration":"14:44"}],"drills":[179,180,181,182,183],"sourcePage":11},{"day":38,"lectures":[{"title":"第135讲-矩阵概念和几种特殊矩阵","duration":"14:58"},{"title":"第136讲-矩阵加法和数乘运算","duration":"6:36"},{"title":"第137讲-矩阵的乘法","duration":"13:45"},{"title":"第138讲-方幂和可交换矩阵","duration":"12:00"},{"title":"第139讲-矩阵的转置和对称矩阵","duration":"9:24"},{"title":"第140讲-方阵的行列式","duration":"9:42"}],"drills":[184,185,186,187],"sourcePage":12},{"day":39,"lectures":[{"title":"第141讲-分块矩阵","duration":"8:40"},{"title":"第142讲-分块方式","duration":"9:54"},{"title":"第143讲-分块矩阵的典型案例","duration":"7:00"},{"title":"第144讲-逆矩阵的定义","duration":"14:19"},{"title":"第145讲-非奇异矩阵和伴随矩阵","duration":"11:32"},{"title":"第146讲-矩阵可逆的充分必要条件","duration":"6:49"}],"drills":[188,189,190],"sourcePage":12},{"day":40,"lectures":[{"title":"第147讲-逆矩阵的性质","duration":"10:38"},{"title":"第148讲-初等变换与初等矩阵","duration":"21:37"},{"title":"第149讲-初等矩阵的逆矩阵","duration":"8:49"},{"title":"第150讲-行阶梯形最简形矩阵和等价标准形","duration":"18:47"}],"drills":[191,192,193,194],"sourcePage":12},{"day":41,"lectures":[{"title":"第151讲-等价矩阵","duration":"6:57"},{"title":"第152讲-初等行变换求逆矩阵","duration":"12:48"},{"title":"第153讲-矩阵可逆充要条件和几种特殊逆矩阵的求法","duration":"9:44"},{"title":"第154讲-矩阵方程的求法1","duration":"11:15"},{"title":"第155讲-矩阵方程的求法2","duration":"10:36"}],"drills":[195,196,197,198,199,200],"sourcePage":13},{"day":42,"lectures":[{"title":"第156讲-k阶子式和矩阵的秩","duration":"11:02"},{"title":"第157讲-求矩阵秩的方法1","duration":"9:09"},{"title":"第158讲-求矩阵秩的方法2","duration":"9:05"},{"title":"第159讲-求矩阵秩的方法3","duration":"10:44"}],"drills":[201,202,203],"sourcePage":13},{"day":43,"lectures":[{"title":"第160讲-秩的性质","duration":"5:00"},{"title":"第161讲-伴随矩阵的性质","duration":"7:34"},{"title":"第162讲-向量定义和运算","duration":"11:54"},{"title":"第163讲-线性方程组的消元法","duration":"15:37"}],"drills":[204,205,206],"sourcePage":13},{"day":44,"lectures":[{"title":"第164讲-非齐次线性方程组解的判定1","duration":"11:57"},{"title":"第165讲-非齐次线性方程组解的判定2","duration":"8:51"},{"title":"第166讲-齐次线性方程组解的判定","duration":"10:46"},{"title":"第167讲-系数为方阵的线性方程组解的判定","duration":"13:21"}],"drills":[207,208,209,210,211,212],"sourcePage":14},{"day":45,"lectures":[{"title":"第168讲-向量组的线性组合和表示条件","duration":"14:19"},{"title":"第169讲-向量组线性表示","duration":"13:13"},{"title":"第170讲-等价向量组","duration":"8:41"}],"drills":[213,214,215,216],"sourcePage":14},{"day":46,"lectures":[{"title":"第171讲-向量线性相关与无关的定义","duration":"15:42"},{"title":"第172讲-向量组线性相关性的判定","duration":"12:51"},{"title":"第173讲-向量组线性相关性的性质","duration":"14:58"},{"title":"第174讲-极大线性无关组和向量组的秩的定义","duration":"9:49"},{"title":"第175讲-极大线性无关组和向量组的秩的求法","duration":"13:04"}],"drills":[217,218,219],"sourcePage":14},{"day":47,"lectures":[{"title":"第176讲-矩阵的秩与向量组秩的关系","duration":"9:33"},{"title":"第177讲-齐次线性方程组解的结构","duration":"6:11"},{"title":"第178讲-齐次线性方程组解的基础解系和通解1","duration":"12:47"},{"title":"第179讲-齐次线性方程组解的基础解系和通解2","duration":"11:44"}],"drills":[222,223,224,225,226],"sourcePage":15},{"day":48,"lectures":[{"title":"第180讲-非齐次线性方程组解的结构","duration":"8:41"},{"title":"第181讲-非齐次线性方程组的通解求法1、2","duration":"20:55"}],"drills":[227,228,229,230,231],"sourcePage":15}];
const ENGLISH_SKILLS=[{"id":1,"module":"写作","title":"写作题型概述+写作提分秘诀1","duration":"52:25"},{"id":2,"module":"写作","title":"写作提分秘诀2（扩写与改写）","duration":"41:04"},{"id":3,"module":"写作","title":"写作论证方式与典型例题","duration":"58:31"},{"id":4,"module":"写作","title":"写作题型精讲1—议论文","duration":"58:14"},{"id":5,"module":"写作","title":"写作题型精讲2—书信+应用文","duration":"33:42"},{"id":6,"module":"翻译","title":"翻译题型概述+选词组句妙招1","duration":"36:53"},{"id":7,"module":"翻译","title":"翻译组句妙招2（长短句形意合）","duration":"40:17"},{"id":8,"module":"翻译","title":"翻译步骤及典型例题+名师带练1","duration":"26:09"},{"id":9,"module":"翻译","title":"翻译名师带练2+3","duration":"26:55"},{"id":10,"module":"听力","title":"听力理解题型概述+短篇新闻 典型例题","duration":"56:45"},{"id":11,"module":"听力","title":"短篇新闻 名师带练1（2023.12.2）","duration":"49:49"},{"id":12,"module":"听力","title":"短篇新闻 名师带练2（2024.12.2）","duration":"44:27"},{"id":13,"module":"听力","title":"长对话解题密钥+典型例题（2023.6.2）","duration":"70:33"},{"id":14,"module":"听力","title":"长对话 名师带练1（2024.12.2）","duration":"50:13"},{"id":15,"module":"听力","title":"长对话 名师带练2（2024.6.2）","duration":"61:38"},{"id":16,"module":"听力","title":"篇章听力解题密钥+典型例题（2024.6.1）","duration":"51:07"},{"id":17,"module":"听力","title":"篇章听力 名师带练1（2024.12.2）","duration":"50:40"},{"id":18,"module":"听力","title":"篇章听力 名师带练2（2023.6.2）","duration":"53:01"},{"id":19,"module":"阅读","title":"仔细阅读概述+例题1","duration":"62:04"},{"id":20,"module":"阅读","title":"仔细阅读主旨细节例题2-8","duration":"51:10"},{"id":21,"module":"阅读","title":"仔细阅读出题点总结","duration":"18:10"},{"id":22,"module":"阅读","title":"仔细阅读 典型例题1","duration":"48:33"},{"id":23,"module":"阅读","title":"仔细阅读 典型例题2","duration":"35:35"},{"id":24,"module":"阅读","title":"仔细阅读 名师带练1","duration":"41:25"},{"id":25,"module":"阅读","title":"仔细阅读 名师带练2","duration":"34:25"},{"id":26,"module":"阅读","title":"仔细阅读 名师带练3","duration":"45:00"},{"id":27,"module":"阅读","title":"仔细阅读 名师带练4","duration":"31:29"},{"id":28,"module":"阅读","title":"仔细阅读 名师带练5","duration":"27:15"},{"id":29,"module":"阅读","title":"仔细阅读 名师带练6","duration":"27:55"},{"id":30,"module":"阅读","title":"长篇阅读概述+例题分析","duration":"43:41"},{"id":31,"module":"阅读","title":"长篇阅读 典型例题","duration":"33:14"},{"id":32,"module":"阅读","title":"长篇阅读 名师带练1","duration":"45:43"},{"id":33,"module":"阅读","title":"长篇阅读 名师带练2","duration":"19:49"},{"id":34,"module":"阅读","title":"词汇理解概述+例题分析","duration":"20:39"},{"id":35,"module":"阅读","title":"词汇理解 典型例题","duration":"27:56"},{"id":36,"module":"阅读","title":"词汇理解 名师带练1","duration":"37:04"},{"id":37,"module":"阅读","title":"词汇理解 名师带练2","duration":"31:02"},{"id":38,"module":"阅读","title":"告别的话","duration":"05:42"}];
const ENGLISH_LESSON_TOTAL=40;
const ENGLISH_VIDEO_SEGMENT_TOTAL=44;
const ENGLISH_VOCAB_LESSONS=[
  {i:1,unit:1,lesson:1,range:'space → noticeable',seconds:3519,parts:1},
  {i:2,unit:1,lesson:2,range:'coast → incline',seconds:2495,parts:1},
  {i:3,unit:1,lesson:3,range:'ancestor → powder',seconds:4579,parts:2,partNames:['3-1 ancestor → aggressive','3-2 move → powder']},
  {i:4,unit:1,lesson:4,range:'cure → namely',seconds:4918,parts:2,partNames:['4-1 cure → temporary','4-2 abundant → namely']},
  {i:5,unit:2,lesson:1,range:'ambition → anxious',seconds:3960,parts:1},
  {i:6,unit:2,lesson:2,range:'sign → tolerate',seconds:3133,parts:1},
  {i:7,unit:2,lesson:3,range:'beam → basin',seconds:2978,parts:1},
  {i:8,unit:2,lesson:4,range:'engage → compass',seconds:4983,parts:2,partNames:['4-1 engage → flavour','4-2 typical → compass']},
  {i:9,unit:3,lesson:1,range:'count → decade',seconds:3483,parts:1},
  {i:10,unit:3,lesson:2,range:'outcome → fold',seconds:2827,parts:1},
  {i:11,unit:3,lesson:3,range:'substance → employment',seconds:3487,parts:1},
  {i:12,unit:3,lesson:4,range:'luxury → thrust',seconds:3600,parts:1},
  {i:13,unit:4,lesson:1,range:'observe → obtain',seconds:3660,parts:1},
  {i:14,unit:4,lesson:2,range:'species → pursue',seconds:2923,parts:1},
  {i:15,unit:4,lesson:3,range:'translate → click',seconds:2887,parts:1},
  {i:16,unit:4,lesson:4,range:'pose → protest',seconds:3474,parts:1},
  {i:17,unit:5,lesson:1,range:'conduct → hack',seconds:3367,parts:1},
  {i:18,unit:5,lesson:2,range:'democratic → register',seconds:3147,parts:1},
  {i:19,unit:5,lesson:3,range:'concentrate → version',seconds:3394,parts:1},
  {i:20,unit:5,lesson:4,range:'tutor → infrastructure',seconds:2968,parts:1},
  {i:21,unit:6,lesson:1,range:'paste → hardware',seconds:2772,parts:1},
  {i:22,unit:6,lesson:2,range:'press → loophole',seconds:3595,parts:1},
  {i:23,unit:6,lesson:3,range:'cause → collaborate',seconds:4181,parts:2,partNames:['3-1 cause → accompany','3-2 manage → collaborate']},
  {i:24,unit:6,lesson:4,range:'profit → antique',seconds:3600,parts:1},
  {i:25,unit:7,lesson:1,range:'margin → pessimistic',seconds:1913,parts:1},
  {i:26,unit:7,lesson:2,range:'opt → oversight',seconds:2897,parts:1},
  {i:27,unit:7,lesson:3,range:'device → steer',seconds:2756,parts:1},
  {i:28,unit:7,lesson:4,range:'applaud → sweat',seconds:1994,parts:1},
  {i:29,unit:8,lesson:1,range:'deliver → owe',seconds:2711,parts:1},
  {i:30,unit:8,lesson:2,range:'combine → roar',seconds:3720,parts:1},
  {i:31,unit:8,lesson:3,range:'bitter → scale',seconds:3281,parts:1},
  {i:32,unit:8,lesson:4,range:'tap → ambassador',seconds:3082,parts:1},
  {i:33,unit:9,lesson:1,range:'pack → queue',seconds:2426,parts:1},
  {i:34,unit:9,lesson:2,range:'considerate → envy',seconds:3600,parts:1},
  {i:35,unit:9,lesson:3,range:'apply → ankle',seconds:2130,parts:1},
  {i:36,unit:9,lesson:4,range:'respond → address',seconds:3388,parts:1},
  {i:37,unit:10,lesson:1,range:'giant → potential',seconds:2189,parts:1},
  {i:38,unit:10,lesson:2,range:'scent → comprehend',seconds:2875,parts:1},
  {i:39,unit:10,lesson:3,range:'drama → limb',seconds:3137,parts:1},
  {i:40,unit:10,lesson:4,range:'caution → furthermore',seconds:2975,parts:1}
];

const SOLAR_TERM_NAMES = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
const SOLAR_TERM_MINUTES = [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];
const LUNAR_FESTIVALS = {
  '正月-1':'春节','正月-15':'元宵节','五月-5':'端午节','七月-7':'七夕',
  '八月-15':'中秋节','九月-9':'重阳节','十二月-8':'腊八节'
};
const SOLAR_FESTIVALS = {'01-01':'元旦','05-01':'劳动节','10-01':'国庆节'};

const HOLIDAY_RANGES = [
  ['2026-01-01','2026-01-03','holiday','元旦假期'],
  ['2026-02-15','2026-02-23','holiday','春节假期'],
  ['2026-04-04','2026-04-06','holiday','清明假期'],
  ['2026-05-01','2026-05-05','holiday','劳动节假期'],
  ['2026-06-19','2026-06-21','holiday','端午假期'],
  ['2026-09-25','2026-09-27','holiday','中秋假期'],
  ['2026-10-01','2026-10-07','holiday','国庆假期']
];
const HOLIDAY_WORKDAYS = ['2026-01-04','2026-02-14','2026-02-28','2026-05-09','2026-09-20','2026-10-10'];

const DEFAULT_SCHEDULE_PROFILE = {
  term: {start:'2026-08-31', end:'2027-02-21', weeks:25},
  activityPeriod: {start:'2026-09-07', end:'2027-01-08'},
  breaks: [['2026-09-25','2026-09-27'],['2026-10-01','2026-10-11'],['2027-01-01','2027-01-03']],
  autoRules: {
    morningStudy: {enabled:false, triggerStart:'08:20', start:'07:40', end:'08:10', name:'早自习', room:'', note:''},
    eveningStudy: {enabled:false, days:[1,2,3,4], start:'19:00', end:'20:30', name:'晚自习', room:''},
    sundayCommentary: {enabled:false, day:0, start:'19:30', end:'19:45', name:'晚点评', room:'', note:''}
  },
  courses: []
};

global.SUIWIND_DATA = {
  APP_VERSION, APP_CACHE_TAG, LEARNING_TIME_ZONE,
  LEARNING_CONFIG, DEFAULT_LEARNING_COUNTDOWNS, V150_MILESTONES,
  REVIEW_OFFSETS, STUDY_SUBJECTS, ROADMAP_THEMES, V158_TIME_CLASSES,
  ENGLISH_SKILL_PLAN_ORDER, ENGLISH_SKILL_DAILY_BLOCKS,
  FINANCE_PLAN, FINANCE_EXEC_ORDER, FINANCE_PHASES,
  MATH_PLAN, ENGLISH_SKILLS, ENGLISH_LESSON_TOTAL, ENGLISH_VIDEO_SEGMENT_TOTAL, ENGLISH_VOCAB_LESSONS,
  SOLAR_TERM_NAMES, SOLAR_TERM_MINUTES, LUNAR_FESTIVALS, SOLAR_FESTIVALS,
  HOLIDAY_RANGES, HOLIDAY_WORKDAYS, DEFAULT_SCHEDULE_PROFILE
};
})(window);
