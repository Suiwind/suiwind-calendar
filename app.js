(()=>{
const $=s=>document.querySelector(s);
const S={g:(k,f)=>{try{return JSON.parse(localStorage.getItem('zx_'+k))??f}catch{return f}},s:(k,v)=>localStorage.setItem('zx_'+k,JSON.stringify(v))};


let T=S.g('tasks',{}), WG=S.g('weekGoals',{}), MG=S.g('monthGoals',{}), R=S.g('reflections',{}), A=S.g('anniversaries',[]), RT=S.g('recurringTasks',[]), DG=S.g('deadlineGoals',[]), SO=S.g('scheduleOverrides',{}), SC=S.g('scheduleConfig',{disabledCourseIds:[]});
const LEARNING_CONFIG={militaryStart:'2026-10-12',militaryEnd:'2026-10-25',resumeDate:'2026-10-26',examDate:'2026-12-13',contentDeadline:'2026-12-10',round1SoftTarget:'2026-11-18',transferPlanStart:'2026-10-12',transferWindowStart:'2029-03-20',transferWindowEnd:'2029-03-31',transferStatus:'待官方公布'};
const DEFAULT_LEARNING_COUNTDOWNS=[{id:'preset-putonghua-20261114',title:'普通话考试',date:'2026-11-14',kind:'考证',note:'普通话水平测试'}];
const FINANCE_PLAN=[{"originalDay":1,"subject":"会计基础","title":"会计概述","target":"2个掌握考点","sourcePage":3},{"originalDay":2,"subject":"会计基础","title":"会计科目与账户","target":"3个掌握考点","sourcePage":3},{"originalDay":3,"subject":"会计基础","title":"会计记账方法","target":"4个掌握考点","sourcePage":3},{"originalDay":4,"subject":"会计基础","title":"会计凭证","target":"2个掌握考点","sourcePage":3},{"originalDay":5,"subject":"会计基础","title":"会计账簿","target":"3个掌握考点","sourcePage":3},{"originalDay":6,"subject":"会计基础","title":"账务处理程序","target":"2个掌握考点","sourcePage":3},{"originalDay":7,"subject":"会计基础","title":"经济业务核算——筹资与采购","target":"3个掌握考点","sourcePage":3},{"originalDay":8,"subject":"会计基础","title":"经济业务核算——生产","target":"3个掌握考点","sourcePage":3},{"originalDay":9,"subject":"会计基础","title":"经济业务核算——销售与财务成果","target":"4个掌握考点","sourcePage":3},{"originalDay":10,"subject":"会计基础","title":"财产清查","target":"3个掌握考点","sourcePage":3},{"originalDay":11,"subject":"会计基础","title":"会计报表","target":"2个掌握考点","sourcePage":3},{"originalDay":12,"subject":"财务管理","title":"总论","target":"1个掌握考点","sourcePage":3},{"originalDay":13,"subject":"财务管理","title":"货币时间价值","target":"4个掌握考点","sourcePage":3},{"originalDay":14,"subject":"财务管理","title":"筹资管理","target":"2个掌握考点","sourcePage":3},{"originalDay":15,"subject":"财务管理","title":"资金预测","target":"3个掌握考点","sourcePage":3},{"originalDay":16,"subject":"财务管理","title":"资本成本","target":"3个掌握考点","sourcePage":3},{"originalDay":17,"subject":"财务管理","title":"投资管理","target":"4个掌握考点","sourcePage":3},{"originalDay":18,"subject":"财务管理","title":"营运资本管理","target":"4个掌握考点","sourcePage":3},{"originalDay":19,"subject":"财务管理","title":"股利分配管理","target":"3个掌握考点","sourcePage":3},{"originalDay":20,"subject":"经济学","title":"经济学概述","target":"1个掌握考点","sourcePage":3},{"originalDay":21,"subject":"经济学","title":"供给与需求","target":"5个掌握考点","sourcePage":3},{"originalDay":22,"subject":"经济学","title":"消费者行为","target":"3个掌握考点","sourcePage":3},{"originalDay":23,"subject":"经济学","title":"生产者行为","target":"3个掌握考点","sourcePage":4},{"originalDay":24,"subject":"经济学","title":"成本与收益","target":"4个掌握考点","sourcePage":4},{"originalDay":25,"subject":"经济学","title":"市场结构","target":"2个掌握考点","sourcePage":4},{"originalDay":26,"subject":"经济学","title":"收入分配","target":"1个掌握考点","sourcePage":4},{"originalDay":27,"subject":"经济学","title":"市场失灵与政府干预","target":"2个掌握考点","sourcePage":4},{"originalDay":28,"subject":"经济学","title":"国民收入","target":"3个掌握考点","sourcePage":4},{"originalDay":29,"subject":"经济学","title":"经济周期与增长","target":"0个掌握考点","sourcePage":4},{"originalDay":30,"subject":"经济学","title":"失业与通货膨胀","target":"2个掌握考点","sourcePage":4},{"originalDay":31,"subject":"经济学","title":"宏观经济政策","target":"3个掌握考点","sourcePage":4},{"originalDay":32,"subject":"三科综合","title":"考纲划重点直播课","target":"2个掌握考点","sourcePage":4},{"originalDay":33,"subject":"三科综合","title":"薄弱点清单","target":"1个掌握考点","sourcePage":4},{"originalDay":34,"subject":"会计基础","title":"第1-2章","target":"1个掌握考点","sourcePage":5},{"originalDay":35,"subject":"会计基础","title":"第3章借贷记账法","target":"3个掌握考点","sourcePage":5},{"originalDay":36,"subject":"会计基础","title":"第4-6章","target":"2个掌握考点","sourcePage":5},{"originalDay":37,"subject":"会计基础","title":"第7章（上）筹资采购生产","target":"3个掌握考点","sourcePage":5},{"originalDay":38,"subject":"会计基础","title":"第7章（下）销售与财务成果","target":"3个掌握考点","sourcePage":5},{"originalDay":39,"subject":"会计基础","title":"第8-9章","target":"3个掌握考点","sourcePage":5},{"originalDay":40,"subject":"会计基础","title":"综合套题与错题","target":"2个掌握考点","sourcePage":5},{"originalDay":41,"subject":"财务管理","title":"第1-2章","target":"3个掌握考点","sourcePage":5},{"originalDay":42,"subject":"财务管理","title":"第3-4章","target":"3个掌握考点","sourcePage":5},{"originalDay":43,"subject":"财务管理","title":"第5章资本成本","target":"3个掌握考点","sourcePage":5},{"originalDay":44,"subject":"财务管理","title":"第6章投资管理","target":"3个掌握考点","sourcePage":5},{"originalDay":45,"subject":"财务管理","title":"第7章营运资本","target":"3个掌握考点","sourcePage":5},{"originalDay":46,"subject":"财务管理","title":"第8章股利分配","target":"2个掌握考点","sourcePage":5},{"originalDay":47,"subject":"财务管理","title":"综合套题与错题","target":"2个掌握考点","sourcePage":5},{"originalDay":48,"subject":"经济学","title":"第1-2章","target":"3个掌握考点","sourcePage":5},{"originalDay":49,"subject":"经济学","title":"第3-4章","target":"2个掌握考点","sourcePage":5},{"originalDay":50,"subject":"经济学","title":"第5章成本与收益","target":"3个掌握考点","sourcePage":5},{"originalDay":51,"subject":"经济学","title":"第6章市场结构","target":"3个掌握考点","sourcePage":5},{"originalDay":52,"subject":"经济学","title":"第7-8章","target":"1个掌握考点","sourcePage":5},{"originalDay":53,"subject":"经济学","title":"第9章国民收入","target":"3个掌握考点","sourcePage":5},{"originalDay":54,"subject":"经济学","title":"第10-11章","target":"1个掌握考点","sourcePage":5},{"originalDay":55,"subject":"经济学","title":"第12章宏观经济政策","target":"3个掌握考点","sourcePage":5},{"originalDay":56,"subject":"经济学","title":"综合套题与错题","target":"2个掌握考点","sourcePage":5},{"originalDay":57,"subject":"会计基础","title":"筹资采购与生产业务","target":"4个掌握考点","sourcePage":5},{"originalDay":58,"subject":"会计基础","title":"销售财务成果与综合默写","target":"4个掌握考点","sourcePage":6},{"originalDay":59,"subject":"财务管理","title":"时间价值筹资与投资","target":"4个掌握考点","sourcePage":6},{"originalDay":60,"subject":"财务管理","title":"营运资本与股利分配","target":"3个掌握考点","sourcePage":6},{"originalDay":61,"subject":"经济学","title":"微观图形（趋势及原因）","target":"2个掌握考点","sourcePage":6},{"originalDay":62,"subject":"经济学","title":"宏观图形与速记（趋势及原因）","target":"2个掌握考点","sourcePage":6},{"originalDay":63,"subject":"会计基础","title":"会计（试算平衡与错账更正）","target":"2个掌握考点","sourcePage":6},{"originalDay":64,"subject":"会计基础","title":"会计（经济业务核算）","target":"4个掌握考点","sourcePage":6},{"originalDay":65,"subject":"会计基础","title":"会计（报表与成本折旧）","target":"2个掌握考点","sourcePage":6},{"originalDay":66,"subject":"会计基础","title":"会计（综合提高）","target":"2个掌握考点","sourcePage":6},{"originalDay":67,"subject":"财务管理","title":"财管（货币时间价值与资金预测）","target":"2个掌握考点","sourcePage":6},{"originalDay":68,"subject":"财务管理","title":"财管（资本成本）","target":"2个掌握考点","sourcePage":6},{"originalDay":69,"subject":"财务管理","title":"财管（投资决策）","target":"3个掌握考点","sourcePage":6},{"originalDay":70,"subject":"财务管理","title":"财管（营运资本管理）","target":"2个掌握考点","sourcePage":6},{"originalDay":71,"subject":"财务管理","title":"财管（综合提高）","target":"2个掌握考点","sourcePage":6},{"originalDay":72,"subject":"经济学","title":"经济学（弹性与消费者均衡）","target":"3个掌握考点","sourcePage":6},{"originalDay":73,"subject":"经济学","title":"经济学（成本与厂商均衡）","target":"3个掌握考点","sourcePage":6},{"originalDay":74,"subject":"经济学","title":"经济学（GDP与乘数）","target":"2个掌握考点","sourcePage":6},{"originalDay":75,"subject":"经济学","title":"经济学（综合提高）","target":"2个掌握考点","sourcePage":6},{"originalDay":76,"subject":"三科综合","title":"三科易混点对比梳理","target":"3个掌握考点","sourcePage":6},{"originalDay":77,"subject":"三科综合","title":"三科错题回顾","target":"3个掌握考点","sourcePage":6},{"originalDay":78,"subject":"三科综合","title":"薄弱点最后突破","target":"2个掌握考点","sourcePage":6},{"originalDay":79,"subject":"三科综合","title":"必背清单过一遍","target":"3个掌握考点","sourcePage":6},{"originalDay":80,"subject":"三科综合","title":"年前学习收官总结","target":"3个掌握考点","sourcePage":6}];
const FINANCE_EXEC_ORDER=[1,2,3,4,5,6,7,8,9,10,11,34,35,36,37,38,39,40,57,58,63,64,65,66,12,13,14,15,16,17,18,19,41,42,43,44,45,46,47,59,60,67,68,69,70,71,20,21,22,23,24,25,26,27,28,29,30,31,48,49,50,51,52,53,54,55,56,61,62,72,73,74,75,32,33,76,77,78,79,80];
const MATH_PLAN=[{"day":1,"lectures":[{"title":"第1讲-分数运算和去括号","duration":"9:37"},{"title":"第2讲-分式运算","duration":"11:23"},{"title":"第3讲-解方程根与系数的关系","duration":"11:28"},{"title":"第4讲-绝对值","duration":"3:19"},{"title":"第5讲-直线方程","duration":"6:24"},{"title":"第6讲-圆的方程","duration":"9:45"},{"title":"第7讲-抛物线方程","duration":"7:15"},{"title":"第8讲-三角函数","duration":"9:47"}],"drills":[1,2,3,4],"sourcePage":1},{"day":2,"lectures":[{"title":"第9讲-区间表示","duration":"4:39"},{"title":"第10讲-函数定义和表示","duration":"14:59"},{"title":"第11讲-函数性质奇偶性","duration":"9:46"},{"title":"第12讲-函数性质单调有界周期性","duration":"9:07"},{"title":"第13讲-复合函数和反函数","duration":"8:51"},{"title":"第14讲-幂函数","duration":"10:42"},{"title":"第15讲-指数函数","duration":"7:05"}],"drills":[5,6,7,8],"sourcePage":1},{"day":3,"lectures":[{"title":"第16讲-对数函数","duration":"7:19"},{"title":"第17讲-三角函数","duration":"9:34"},{"title":"第18讲-三角函数公式","duration":"6:14"},{"title":"第19讲-反正弦和反余弦三角函数","duration":"12:21"},{"title":"第20讲-反正切和反余切三角函数","duration":"7:39"},{"title":"第21讲-初等函数和分段函数","duration":"5:56"}],"drills":[9],"sourcePage":1},{"day":4,"lectures":[{"title":"第22讲-数列极限","duration":"10:15"},{"title":"第23讲-无穷处极限","duration":"8:30"},{"title":"第24讲-某一点处极限","duration":"8:48"},{"title":"第25讲-极限运算法则","duration":"9:55"},{"title":"第26讲-两个重要极限","duration":"14:32"}],"drills":[10,11,12,13,14,15,16,17,18],"sourcePage":2},{"day":5,"lectures":[{"title":"第27讲-无穷小量和无穷大量","duration":"14:33"},{"title":"第28讲-无穷小的比较","duration":"10:05"},{"title":"第29讲-等价无穷小","duration":"9:48"}],"drills":[19,20,21],"sourcePage":2},{"day":6,"lectures":[{"title":"第30讲-连续定义和判断","duration":"11:27"},{"title":"第31讲-间断点的分类和判断","duration":"18:12"},{"title":"第32讲-连续性定理","duration":"11:14"}],"drills":[22,23,24,25,26],"sourcePage":2},{"day":7,"lectures":[{"title":"第33讲-导数的定义","duration":"22:25"},{"title":"第34讲-利用导数定义求极限","duration":"9:07"},{"title":"第35讲-导数的几何意义","duration":"10:45"},{"title":"第36讲-连续可导的关系","duration":"13:11"},{"title":"第37讲-求导法则和基本函数求导公式","duration":"9:16"}],"drills":[27,28,29,30,31,32,33],"sourcePage":2},{"day":8,"lectures":[{"title":"第38讲-复合函数和反函数求导法则","duration":"12:30"},{"title":"第39讲-高阶导数","duration":"19:31"},{"title":"第40讲-分段函数求导法则","duration":"12:10"},{"title":"第41讲-隐函数求导法则","duration":"10:37"},{"title":"第42讲-含参求导法则","duration":"18:44"},{"title":"第43讲-微分","duration":"4:08"}],"drills":[34,35,36,37,38,39,40,41,42,43,44,45],"sourcePage":3},{"day":9,"lectures":[{"title":"第44讲-罗尔定理","duration":"8:06"},{"title":"第45讲-拉格朗日定理","duration":"9:34"}],"drills":[46,47,48,49],"sourcePage":3},{"day":10,"lectures":[{"title":"第46讲-洛必达法则0比0无穷比无穷","duration":"12:56"},{"title":"第47讲-洛必达法则其它类型","duration":"10:05"}],"drills":[50,51,52],"sourcePage":3},{"day":11,"lectures":[{"title":"第48讲-单调性证明一个不等号","duration":"15:30"},{"title":"第49讲-单调性证明两个不等号","duration":"12:11"}],"drills":[53,54,55],"sourcePage":3},{"day":12,"lectures":[{"title":"第50讲-极值的定义","duration":"11:49"},{"title":"第51讲-极值点的注意事项","duration":"9:44"},{"title":"第52讲-二导判定极值点法则","duration":"5:52"},{"title":"第53讲-最值","duration":"14:19"}],"drills":[56,57,58],"sourcePage":3},{"day":13,"lectures":[{"title":"第54讲-凹凸性","duration":"15:27"},{"title":"第55讲-渐近线","duration":"7:35"},{"title":"第56讲-函数性态综合研究","duration":"7:03"}],"drills":[59,60,61,62],"sourcePage":4},{"day":14,"lectures":[{"title":"第57讲-原函数与不定积分的概念","duration":"11:25"},{"title":"第58讲-不定积分的性质","duration":"5:08"},{"title":"第59讲-不定积分的基本公式","duration":"6:20"},{"title":"第60讲-直接积分法","duration":"9:25"}],"drills":[63,64,65,66,67],"sourcePage":4},{"day":15,"lectures":[{"title":"第61讲-凑微分法幂函数型","duration":"11:30"},{"title":"第62讲-凑微分法指数和对数型","duration":"10:15"},{"title":"第63讲-凑微分法反正弦和反正切型","duration":"14:22"},{"title":"第64讲-凑微分法综合型","duration":"8:14"}],"drills":[68,69,70,71],"sourcePage":4},{"day":16,"lectures":[{"title":"第65讲-第二类三角换元法","duration":"14:56"},{"title":"第66讲-第二类整体换元倒代法","duration":"9:15"}],"drills":[72,73,74],"sourcePage":4},{"day":17,"lectures":[{"title":"第67讲-分部积分法幂指幂三","duration":"10:08"},{"title":"第68讲-分部积分法幂函对幂反三","duration":"11:11"},{"title":"第69讲-分部积分法指三原函数","duration":"14:44"}],"drills":[75,76,77,78,79],"sourcePage":5},{"day":18,"lectures":[{"title":"第70讲-有理函数和无理函数积分","duration":"11:58"},{"title":"第71讲-定积分的定义","duration":"13:00"},{"title":"第72讲-定积分的几何意义","duration":"8:41"},{"title":"第73讲-定积分的性质-1","duration":"8:46"},{"title":"第74讲-定积分的性质-2","duration":"11:17"}],"drills":[80,81,82,83],"sourcePage":5},{"day":19,"lectures":[{"title":"第75讲-变上限积分","duration":"14:46"},{"title":"第76讲-牛顿莱布尼兹公式","duration":"7:54"}],"drills":[84,85,86,87,88,89,90],"sourcePage":5},{"day":20,"lectures":[{"title":"第77讲-定积分的换元积分法","duration":"8:17"},{"title":"第78讲-定积分的分部积分法","duration":"13:48"}],"drills":[91,92,93,94,95,96],"sourcePage":6},{"day":21,"lectures":[{"title":"第79讲-定积分的倒代法","duration":"3:12"},{"title":"第80讲-对称区间上的定积分","duration":"7:46"},{"title":"第81讲-点火公式","duration":"7:36"},{"title":"第82讲-无穷区间的反常积分广义积分","duration":"18:48"},{"title":"第83讲-无穷间断点的反常积分瑕积分","duration":"4:28"}],"drills":[97,98,99,100],"sourcePage":6},{"day":22,"lectures":[{"title":"第84讲-求面积","duration":"21:11"},{"title":"第85讲-旋转体的体积","duration":"10:08"},{"title":"第86讲-柱壳法","duration":"11:16"}],"drills":[101,102,103,104,105,106,107],"sourcePage":6},{"day":23,"lectures":[{"title":"第87讲-多元函数概念","duration":"12:43"},{"title":"第88讲-多元函数极限和连续","duration":"12:10"},{"title":"第89讲-多元函数的偏导数","duration":"16:10"},{"title":"第90讲-全微分","duration":"12:09"}],"drills":[108,109,110,111,112,113],"sourcePage":7},{"day":24,"lectures":[{"title":"第91讲-二阶偏导数","duration":"10:34"},{"title":"第92讲-多元复合函数偏导数","duration":"16:47"},{"title":"第93讲-隐函数求二阶偏导","duration":"13:22"}],"drills":[114,115,116,117,118,119],"sourcePage":7},{"day":25,"lectures":[{"title":"第94讲-二元函数的极值","duration":"17:49"},{"title":"第95讲-二元函数的最值","duration":"8:59"},{"title":"第96讲-条件极值","duration":"12:33"}],"drills":[120,121,122],"sourcePage":7},{"day":26,"lectures":[{"title":"第97讲-二重积分的概念和性质","duration":"11:11"},{"title":"第98讲-二重积分的积分区域分类","duration":"18:50"},{"title":"第99讲-二次积分和交换积分次序","duration":"13:34"}],"drills":[123,124,125,126],"sourcePage":8},{"day":27,"lectures":[{"title":"第100讲-直角坐标系下二重积分的计算","duration":"16:07"}],"drills":[127,128,129,130,131],"sourcePage":8},{"day":28,"lectures":[{"title":"第101讲-极坐标系如何表示积分区域","duration":"20:43"},{"title":"第102讲-极坐标系下二重积分的计算","duration":"8:37"},{"title":"第103讲-利用对称性简化二重积分的计算","duration":"12:42"}],"drills":[132,133,134,135,136,137],"sourcePage":8},{"day":29,"lectures":[{"title":"第104讲-无穷级数的概念","duration":"11:12"},{"title":"第105讲-几何级数","duration":"11:00"},{"title":"第106讲-常数项级数的性质","duration":"13:19"},{"title":"第107讲-正项级数的比较判别法","duration":"12:36"},{"title":"第108讲-正项级数的比较判别法极限形式","duration":"7:26"},{"title":"第109讲-正项级数的比值判别法","duration":"7:59"}],"drills":[138,139,140,141,142],"sourcePage":9},{"day":30,"lectures":[{"title":"第110讲-交错级数的莱布尼兹判别法","duration":"11:17"},{"title":"第111讲-幂级数收敛半径和收敛域","duration":"10:33"},{"title":"第112讲-幂级数的各种变型","duration":"18:24"}],"drills":[143,144,145,146,147,148],"sourcePage":9},{"day":31,"lectures":[{"title":"第113讲-常微分方程基本概念","duration":"17:44"},{"title":"第114讲-一阶变量可分离微分方程","duration":"9:33"},{"title":"第115讲-一阶齐次微分方程","duration":"10:08"}],"drills":[149,150,151,152,153,154,155],"sourcePage":9},{"day":32,"lectures":[{"title":"第116讲-一阶线性微分方程","duration":"13:52"},{"title":"第117讲-一阶微分方程解简单应用题","duration":"12:10"}],"drills":[156,157,158,159,160,161],"sourcePage":10},{"day":33,"lectures":[{"title":"第118讲-二阶线性微分方程解的性质","duration":"13:51"},{"title":"第119讲-二阶常系数齐次线性微分方程通解求法","duration":"8:52"}],"drills":[162,163,164,165],"sourcePage":10},{"day":34,"lectures":[{"title":"第120讲-二阶常系数非齐次线性微分方程通解求法","duration":"17:04"},{"title":"第121讲-二阶常系数非齐次线性微分方程通解典型案例","duration":"7:15"}],"drills":[166,167,168,169],"sourcePage":10},{"day":35,"lectures":[{"title":"第122讲-二阶三阶行列式求法","duration":"13:55"},{"title":"第123讲-排列与逆序数","duration":"10:13"},{"title":"第124讲-对换与n阶行列式定义","duration":"14:01"},{"title":"第125讲-几种特殊行列式","duration":"8:20"},{"title":"第126讲-行列式性质-转置和交换","duration":"8:31"},{"title":"第127讲-行列式性质-数乘","duration":"8:42"},{"title":"第128讲-行列式性质-拆分","duration":"10:12"},{"title":"第129讲-行列式性质-倍加","duration":"11:44"}],"drills":[170],"sourcePage":11},{"day":36,"lectures":[{"title":"第130讲-综合应用行列式性质计算","duration":"14:58"}],"drills":[171,172,173,174,175,176,177,178],"sourcePage":11},{"day":37,"lectures":[{"title":"第131讲-余子式和代数余子式","duration":"12:08"},{"title":"第132讲-行列式按行或列展开","duration":"9:47"},{"title":"第133讲-逆用行列式按行或列展开","duration":"10:54"},{"title":"第134讲-逆用行列式按行或列展开典型案例","duration":"14:44"}],"drills":[179,180,181,182,183],"sourcePage":11},{"day":38,"lectures":[{"title":"第135讲-矩阵概念和几种特殊矩阵","duration":"14:58"},{"title":"第136讲-矩阵加法和数乘运算","duration":"6:36"},{"title":"第137讲-矩阵的乘法","duration":"13:45"},{"title":"第138讲-方幂和可交换矩阵","duration":"12:00"},{"title":"第139讲-矩阵的转置和对称矩阵","duration":"9:24"},{"title":"第140讲-方阵的行列式","duration":"9:42"}],"drills":[184,185,186,187],"sourcePage":12},{"day":39,"lectures":[{"title":"第141讲-分块矩阵","duration":"8:40"},{"title":"第142讲-分块方式","duration":"9:54"},{"title":"第143讲-分块矩阵的典型案例","duration":"7:00"},{"title":"第144讲-逆矩阵的定义","duration":"14:19"},{"title":"第145讲-非奇异矩阵和伴随矩阵","duration":"11:32"},{"title":"第146讲-矩阵可逆的充分必要条件","duration":"6:49"}],"drills":[188,189,190],"sourcePage":12},{"day":40,"lectures":[{"title":"第147讲-逆矩阵的性质","duration":"10:38"},{"title":"第148讲-初等变换与初等矩阵","duration":"21:37"},{"title":"第149讲-初等矩阵的逆矩阵","duration":"8:49"},{"title":"第150讲-行阶梯形最简形矩阵和等价标准形","duration":"18:47"}],"drills":[191,192,193,194],"sourcePage":12},{"day":41,"lectures":[{"title":"第151讲-等价矩阵","duration":"6:57"},{"title":"第152讲-初等行变换求逆矩阵","duration":"12:48"},{"title":"第153讲-矩阵可逆充要条件和几种特殊逆矩阵的求法","duration":"9:44"},{"title":"第154讲-矩阵方程的求法1","duration":"11:15"},{"title":"第155讲-矩阵方程的求法2","duration":"10:36"}],"drills":[195,196,197,198,199,200],"sourcePage":13},{"day":42,"lectures":[{"title":"第156讲-k阶子式和矩阵的秩","duration":"11:02"},{"title":"第157讲-求矩阵秩的方法1","duration":"9:09"},{"title":"第158讲-求矩阵秩的方法2","duration":"9:05"},{"title":"第159讲-求矩阵秩的方法3","duration":"10:44"}],"drills":[201,202,203],"sourcePage":13},{"day":43,"lectures":[{"title":"第160讲-秩的性质","duration":"5:00"},{"title":"第161讲-伴随矩阵的性质","duration":"7:34"},{"title":"第162讲-向量定义和运算","duration":"11:54"},{"title":"第163讲-线性方程组的消元法","duration":"15:37"}],"drills":[204,205,206],"sourcePage":13},{"day":44,"lectures":[{"title":"第164讲-非齐次线性方程组解的判定1","duration":"11:57"},{"title":"第165讲-非齐次线性方程组解的判定2","duration":"8:51"},{"title":"第166讲-齐次线性方程组解的判定","duration":"10:46"},{"title":"第167讲-系数为方阵的线性方程组解的判定","duration":"13:21"}],"drills":[207,208,209,210,211,212],"sourcePage":14},{"day":45,"lectures":[{"title":"第168讲-向量组的线性组合和表示条件","duration":"14:19"},{"title":"第169讲-向量组线性表示","duration":"13:13"},{"title":"第170讲-等价向量组","duration":"8:41"}],"drills":[213,214,215,216],"sourcePage":14},{"day":46,"lectures":[{"title":"第171讲-向量线性相关与无关的定义","duration":"15:42"},{"title":"第172讲-向量组线性相关性的判定","duration":"12:51"},{"title":"第173讲-向量组线性相关性的性质","duration":"14:58"},{"title":"第174讲-极大线性无关组和向量组的秩的定义","duration":"9:49"},{"title":"第175讲-极大线性无关组和向量组的秩的求法","duration":"13:04"}],"drills":[217,218,219],"sourcePage":14},{"day":47,"lectures":[{"title":"第176讲-矩阵的秩与向量组秩的关系","duration":"9:33"},{"title":"第177讲-齐次线性方程组解的结构","duration":"6:11"},{"title":"第178讲-齐次线性方程组解的基础解系和通解1","duration":"12:47"},{"title":"第179讲-齐次线性方程组解的基础解系和通解2","duration":"11:44"}],"drills":[222,223,224,225,226],"sourcePage":15},{"day":48,"lectures":[{"title":"第180讲-非齐次线性方程组解的结构","duration":"8:41"},{"title":"第181讲-非齐次线性方程组的通解求法1、2","duration":"20:55"}],"drills":[227,228,229,230,231],"sourcePage":15}];
const ENGLISH_SKILLS=[{"id":1,"module":"写作","title":"写作题型概述+写作提分秘诀1","duration":"52:25"},{"id":2,"module":"写作","title":"写作提分秘诀2（扩写与改写）","duration":"41:04"},{"id":3,"module":"写作","title":"写作论证方式与典型例题","duration":"58:31"},{"id":4,"module":"写作","title":"写作题型精讲1—议论文","duration":"58:14"},{"id":5,"module":"写作","title":"写作题型精讲2—书信+应用文","duration":"33:42"},{"id":6,"module":"翻译","title":"翻译题型概述+选词组句妙招1","duration":"36:53"},{"id":7,"module":"翻译","title":"翻译组句妙招2（长短句形意合）","duration":"40:17"},{"id":8,"module":"翻译","title":"翻译步骤及典型例题+名师带练1","duration":"26:09"},{"id":9,"module":"翻译","title":"翻译名师带练2+3","duration":"26:55"},{"id":10,"module":"听力","title":"听力理解题型概述+短篇新闻 典型例题","duration":"56:45"},{"id":11,"module":"听力","title":"短篇新闻 名师带练1（2023.12.2）","duration":"49:49"},{"id":12,"module":"听力","title":"短篇新闻 名师带练2（2024.12.2）","duration":"44:27"},{"id":13,"module":"听力","title":"长对话解题密钥+典型例题（2023.6.2）","duration":"70:33"},{"id":14,"module":"听力","title":"长对话 名师带练1（2024.12.2）","duration":"50:13"},{"id":15,"module":"听力","title":"长对话 名师带练2（2024.6.2）","duration":"61:38"},{"id":16,"module":"听力","title":"篇章听力解题密钥+典型例题（2024.6.1）","duration":"51:07"},{"id":17,"module":"听力","title":"篇章听力 名师带练1（2024.12.2）","duration":"50:40"},{"id":18,"module":"听力","title":"篇章听力 名师带练2（2023.6.2）","duration":"53:01"},{"id":19,"module":"阅读","title":"仔细阅读概述+例题1","duration":"62:04"},{"id":20,"module":"阅读","title":"仔细阅读主旨细节例题2-8","duration":"51:10"},{"id":21,"module":"阅读","title":"仔细阅读出题点总结","duration":"18:10"},{"id":22,"module":"阅读","title":"仔细阅读 典型例题1","duration":"48:33"},{"id":23,"module":"阅读","title":"仔细阅读 典型例题2","duration":"35:35"},{"id":24,"module":"阅读","title":"仔细阅读 名师带练1","duration":"41:25"},{"id":25,"module":"阅读","title":"仔细阅读 名师带练2","duration":"34:25"},{"id":26,"module":"阅读","title":"仔细阅读 名师带练3","duration":"45:00"},{"id":27,"module":"阅读","title":"仔细阅读 名师带练4","duration":"31:29"},{"id":28,"module":"阅读","title":"仔细阅读 名师带练5","duration":"27:15"},{"id":29,"module":"阅读","title":"仔细阅读 名师带练6","duration":"27:55"},{"id":30,"module":"阅读","title":"长篇阅读概述+例题分析","duration":"43:41"},{"id":31,"module":"阅读","title":"长篇阅读 典型例题","duration":"33:14"},{"id":32,"module":"阅读","title":"长篇阅读 名师带练1","duration":"45:43"},{"id":33,"module":"阅读","title":"长篇阅读 名师带练2","duration":"19:49"},{"id":34,"module":"阅读","title":"词汇理解概述+例题分析","duration":"20:39"},{"id":35,"module":"阅读","title":"词汇理解 典型例题","duration":"27:56"},{"id":36,"module":"阅读","title":"词汇理解 名师带练1","duration":"37:04"},{"id":37,"module":"阅读","title":"词汇理解 名师带练2","duration":"31:02"},{"id":38,"module":"阅读","title":"告别的话","duration":"05:42"}];
// V1.5.4：词汇课按真实课程层级管理：10 Unit × 4 Lesson = 40 个逻辑 Lesson。
// 部分 Lesson 在课程平台拆成两个视频段，因此词汇正文共有 44 个视频段；加“使用说明”可见 45 个小节。
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
function englishLessonInfo(i){return ENGLISH_VOCAB_LESSONS[Number(i)-1]||null}
function englishLessonLabel(i){const x=englishLessonInfo(i);return x?`Unit ${x.unit} · Lesson ${x.lesson}`:'—'}
function englishLessonMeta(i){const x=englishLessonInfo(i);if(!x)return '';const split=x.parts>1?` · ${x.parts} 段视频（${x.partNames.join('；')}）`:'';return `${x.range} · ${durationHuman(x.seconds)}${split}`}
function englishDoneCount(map){let n=0;for(let i=1;i<=ENGLISH_LESSON_TOTAL;i++)if(map?.[String(i)])n++;return n}
function nextEnglishLesson(map){return nextNumber(ENGLISH_LESSON_TOTAL,map)}
function englishMapValues(map){const out=[];for(let i=1;i<=ENGLISH_LESSON_TOTAL;i++)if(map?.[String(i)])out.push(map[String(i)]);return out}
function formalAdvanceAllowed(k=learningTodayKey()){return isMilitaryKey(k)||isResumeOrLaterKey(k)}

const FINANCE_PHASES=[
  {name:'会计闭环',start:0,end:23,total:24,note:'基础 → 习题 → 分录 → 计算/综合'},
  {name:'财管闭环',start:24,end:45,total:22,note:'基础 → 习题 → 公式 → 计算'},
  {name:'经济学闭环',start:46,end:72,total:27,note:'基础 → 习题 → 图形 → 计算'},
  {name:'三科收官',start:73,end:79,total:7,note:'考纲 / 薄弱点 / 错题 / 必背 / 总结'}
];
const now=new Date(), pad=n=>String(n).padStart(2,'0'), fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c,12)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const uuid=()=>crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
let LS=normalizeLearningState(S.g('learningState',{}));
let view=new Date(now.getFullYear(),now.getMonth(),1), sel=new Date(now.getFullYear(),now.getMonth(),now.getDate());

const H={};function range(a,b,type,name){let d=parse(a),e=parse(b);for(;d<=e;d.setDate(d.getDate()+1))H[fmt(d)]={type,name}}
range('2026-01-01','2026-01-03','holiday','元旦假期');H['2026-01-04']={type:'work',name:'调休上班'};
range('2026-02-15','2026-02-23','holiday','春节假期');['2026-02-14','2026-02-28'].forEach(x=>H[x]={type:'work',name:'调休上班'});
range('2026-04-04','2026-04-06','holiday','清明假期');
range('2026-05-01','2026-05-05','holiday','劳动节假期');H['2026-05-09']={type:'work',name:'调休上班'};
range('2026-06-19','2026-06-21','holiday','端午假期');
range('2026-09-25','2026-09-27','holiday','中秋假期');
range('2026-10-01','2026-10-07','holiday','国庆假期');['2026-09-20','2026-10-10'].forEach(x=>H[x]={type:'work',name:'调休上班'});

const SOLAR_TERM_NAMES=['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
const SOLAR_TERM_MINUTES=[0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];
function solarTermDate(year,index){
  const ms=Date.UTC(1900,0,6,2,5)+31556925974.7*(year-1900)+SOLAR_TERM_MINUTES[index]*60000;
  const raw=new Date(ms);
  return new Date(raw.getUTCFullYear(),raw.getUTCMonth(),raw.getUTCDate(),12)
}
function solarTermForDate(d){
  const k=fmt(d),y=d.getFullYear();
  for(let i=0;i<24;i++)if(fmt(solarTermDate(y,i))===k)return SOLAR_TERM_NAMES[i];
  return ''
}
function nextSolarTerm(from){
  const base=new Date(from.getFullYear(),from.getMonth(),from.getDate(),12);
  let best=null;
  for(let y=base.getFullYear();y<=base.getFullYear()+1;y++){
    for(let i=0;i<24;i++){
      const date=solarTermDate(y,i);
      if(date<base)continue;
      if(!best||date<best.date)best={name:SOLAR_TERM_NAMES[i],date}
    }
  }
  return best
}
function lunarDayText(n){
  n=Number(n);
  const nums=['','一','二','三','四','五','六','七','八','九','十'];
  if(n<=0||n>30)return String(n||'');
  if(n<=10)return n===10?'初十':`初${nums[n]}`;
  if(n<20)return `十${nums[n-10]}`;
  if(n===20)return '二十';
  if(n<30)return `廿${nums[n-20]}`;
  return '三十'
}
const LUNAR_FESTIVALS={
  '正月-1':'春节','正月-15':'元宵节','五月-5':'端午节','七月-7':'七夕',
  '八月-15':'中秋节','九月-9':'重阳节','十二月-8':'腊八节'
};
const SOLAR_FESTIVALS={'01-01':'元旦','05-01':'劳动节','10-01':'国庆节'};
let chineseCalendarFormatter=null;
function lunar(d){
  try{
    if(!chineseCalendarFormatter)chineseCalendarFormatter=new Intl.DateTimeFormat('zh-CN-u-ca-chinese',{year:'numeric',month:'long',day:'numeric'});
    const parts=chineseCalendarFormatter.formatToParts(d);
    const month=(parts.find(x=>x.type==='month')?.value||'').replace(/月月$/,'月');
    const dayNum=Number(parts.find(x=>x.type==='day')?.value||0);
    const di=lunarDayText(dayNum),monthText=month.endsWith('月')?month:`${month}月`;
    const term=solarTermForDate(d),fest=[];
    const lunarFest=LUNAR_FESTIVALS[`${month}-${dayNum}`];
    if(lunarFest)fest.push(lunarFest);
    const solarFest=SOLAR_FESTIVALS[`${pad(d.getMonth()+1)}-${pad(d.getDate())}`];
    if(solarFest&&!fest.includes(solarFest))fest.push(solarFest);
    const text=dayNum===1?monthText:di;
    return{text,fullText:`${monthText}${di}`,fest,term}
  }catch{
    return{text:'农历',fullText:'—',fest:[],term:solarTermForDate(d)}
  }
}
function weekKey(d){let x=new Date(d),day=(x.getDay()+6)%7;x.setDate(x.getDate()-day+3);let f=new Date(x.getFullYear(),0,4,12),w=1+Math.round(((x-f)/86400000-3+(f.getDay()+6)%7)/7);return`${x.getFullYear()}-W${pad(w)}`}
const monthKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`, same=(a,b)=>fmt(a)===fmt(b), wd=d=>['日','一','二','三','四','五','六'][d.getDay()];

const SCHOOL_TERM={start:'2026-08-31',end:'2027-02-21',weeks:25};
function schoolWeekNumber(d){
  const day=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12),start=parse(SCHOOL_TERM.start),end=parse(SCHOOL_TERM.end);
  if(day<start||day>end)return null;
  const monday=startOfWeek(day),n=Math.floor((monday-start)/604800000)+1;
  return n>=1&&n<=SCHOOL_TERM.weeks?n:null
}
function schoolWeekText(d){const n=schoolWeekNumber(d);return n?`校历第${n}周`:''}

function weekNums(...ranges){const out=[];for(const [a,b] of ranges){for(let n=a;n<=b;n++)out.push(n)}return out}
const COURSE_SCHEDULE=[
  {id:'eng-mon',day:1,start:'10:20',end:'12:00',name:'大学英语1',teacher:'高岚',room:'主楼0420',weeks:weekNums([2,5],[9,18])},
  {id:'computer-mon',day:1,start:'14:00',end:'17:30',name:'大学计算机',teacher:'崔加祥',room:'1411',weeks:weekNums([2,5],[9,18])},
  {id:'management-tue',day:2,start:'08:20',end:'11:05',name:'管理学基础',teacher:'朱云芳',room:'1221',weeks:weekNums([2,5],[9,18])},
  {id:'mao-tue',day:2,start:'14:00',end:'15:40',name:'毛泽东思想和中国特色社会主义理论体系概论',teacher:'沈优',room:'主楼0311',weeks:weekNums([2,5],[9,18])},
  {id:'accounting-wed',day:3,start:'08:20',end:'12:00',name:'基础会计',teacher:'孙国生',room:'主楼0304',weeks:weekNums([2,5],[9,18])},
  {id:'eng-wed',day:3,start:'14:00',end:'15:40',name:'大学英语1',teacher:'高岚',room:'主楼0420',weeks:weekNums([2,5],[9,18])},
  {id:'security-thu',day:4,start:'08:20',end:'10:00',name:'国家安全教育',teacher:'陈芳',room:'1114',weeks:[9]},
  {id:'policy-thu',day:4,start:'10:20',end:'11:50',name:'形势与政策1',teacher:'王静静',room:'1218',weeks:[11,12],note:'1218 位于 1 号楼，第4节比主楼提前10分钟结束'},
  {id:'pe-thu',day:4,start:'14:00',end:'15:40',name:'大学体育1',teacher:'体育教研部',room:'',weeks:weekNums([3,4],[9,18])},
  {id:'finance-law-thu',day:4,start:'18:30',end:'21:05',name:'财经法规与会计职业道德',teacher:'顾逸薇',room:'主楼0303',weeks:weekNums([2,4],[9,18])},
  {id:'career-fri',day:5,start:'15:50',end:'17:30',name:'大学生职业生涯设计',teacher:'杨俊',room:'主楼0519',weeks:weekNums([9,12])}
];
const SCHOOL_ACTIVITY_START='2026-09-07', SCHOOL_ACTIVITY_END='2027-01-08';
const SCHOOL_BREAKS=[['2026-09-25','2026-09-27'],['2026-10-01','2026-10-11'],['2027-01-01','2027-01-03']];
function dateBetween(d,a,b){const k=fmt(d);return k>=a&&k<=b}
function isSchoolBreak(d){return SCHOOL_BREAKS.some(([a,b])=>dateBetween(d,a,b))}
function isHolidayLike(d){return isSchoolBreak(d)||H[fmt(d)]?.type==='holiday'}
function isHolidayEve(d){
  if(isHolidayLike(d))return false;
  const next=new Date(d);next.setDate(next.getDate()+1);
  return isHolidayLike(next)
}
function inSchoolActivityPeriod(d){return dateBetween(d,SCHOOL_ACTIVITY_START,SCHOOL_ACTIVITY_END)&&!isHolidayLike(d)}
function timeMinutes(v){const[h,m]=String(v||'0:0').split(':').map(Number);return h*60+m}
function schedulesOverlap(a,b){return Math.max(timeMinutes(a.start),timeMinutes(b.start))<Math.min(timeMinutes(a.end),timeMinutes(b.end))}
function scheduleOverrideFor(d){
  const k=fmt(d),raw=SO[k]||{};
  return {added:Array.isArray(raw.added)?raw.added:[],cancelled:Array.isArray(raw.cancelled)?raw.cancelled:[]}
}
function disabledCourseIds(){return Array.isArray(SC?.disabledCourseIds)?SC.disabledCourseIds:[]}
function saveScheduleState(){
  S.s('scheduleOverrides',SO);
  S.s('scheduleConfig',SC)
}
function baseCoursesFor(d){
  const week=schoolWeekNumber(d),day=d.getDay(),ov=scheduleOverrideFor(d),disabled=disabledCourseIds();
  if(!week)return [];
  return COURSE_SCHEDULE
    .filter(c=>c.day===day&&c.weeks.includes(week)&&!disabled.includes(c.id)&&!ov.cancelled.includes(c.id))
    .map(c=>({...c,type:'course',source:'base',baseId:c.id,id:`base:${c.id}`}))
}
function addedCoursesFor(d){
  return scheduleOverrideFor(d).added.map(c=>({...c,type:'course',source:'added',id:c.id||uuid()}))
}
function eveningClassExists(courses){
  const studyWindow={start:'19:00',end:'20:30'};
  return courses.some(c=>schedulesOverlap(c,studyWindow)||timeMinutes(c.start)>=18*60&&timeMinutes(c.start)<21*60)
}
function scheduleFor(d){
  const week=schoolWeekNumber(d),day=d.getDay();
  let events=[...baseCoursesFor(d),...addedCoursesFor(d)];
  const courses=[...events];
  if(courses.some(e=>e.start==='08:20'))events.push({id:'auto-morning-study',start:'07:40',end:'08:10',name:'早自习',teacher:'',room:'',type:'study',source:'auto',note:'当天 08:20 有课，提前到校自习'});
  const eveningCourse=eveningClassExists(courses),holidayEve=isHolidayEve(d);
  if(inSchoolActivityPeriod(d)&&[1,2,3,4].includes(day)&&!eveningCourse&&!holidayEve){
    events.push({id:'auto-evening-study',start:'19:00',end:'20:30',name:'晚自习',teacher:'',room:'主楼316',type:'study',source:'auto'})
  }
  if(inSchoolActivityPeriod(d)&&day===0)events.push({id:'auto-commentary',start:'19:30',end:'19:45',name:'晚点评',teacher:'',room:'主楼313',type:'commentary',source:'auto',note:'结束时间不定，约 10—15 分钟'});
  events.sort((a,b)=>timeMinutes(a.start)-timeMinutes(b.start));
  return events.map((e,i)=>({...e,conflict:events.some((x,j)=>j!==i&&schedulesOverlap(e,x))}))
}
function scheduleRuleText(d){
  if(!inSchoolActivityPeriod(d)||![1,2,3,4].includes(d.getDay()))return '';
  const courses=[...baseCoursesFor(d),...addedCoursesFor(d)];
  if(eveningClassExists(courses))return '今晚有晚间课程，已自动取消晚自习。';
  if(isHolidayEve(d))return '明日进入假期，今晚不安排晚自习。';
  return ''
}
function scheduleTypeLabel(e){return e.type==='study'?'自习':e.type==='commentary'?'点评':'课程'}
function removeCourseFromDate(e){
  const k=fmt(sel),ov=scheduleOverrideFor(sel);
  if(e.source==='base'){
    if(!confirm(`仅取消 ${fmt(sel)} 的“${e.name}”？其他周次的固定课仍会保留。`))return;
    SO[k]={...ov,cancelled:[...new Set([...ov.cancelled,e.baseId])]}
  }else if(e.source==='added'){
    if(!confirm(`删除 ${fmt(sel)} 临时添加的“${e.name}”？`))return;
    SO[k]={...ov,added:ov.added.filter(x=>x.id!==e.id)}
  }else return;
  saveScheduleState();renderSchedule();renderCal()
}
function renderSchedule(){
  const box=$('#dailySchedule'),stat=$('#scheduleStat'),rule=$('#scheduleRuleNote');if(!box)return;
  const events=scheduleFor(sel),week=schoolWeekNumber(sel);box.innerHTML='';
  stat.textContent=events.length?`${events.length} 项${week?` · 第${week}周`:''}`:(week?`第${week}周`:'');
  if(rule)rule.textContent=scheduleRuleText(sel);
  if(!events.length){
    const msg=week?(isHolidayLike(sel)?'今天属于校历假期，没有固定课表安排。':'今天没有固定课程、自习或晚点评。'):'当前日期不在本学期课表范围内。';
    box.innerHTML=`<div class="empty">${msg}</div>`;return
  }
  events.forEach(e=>{
    const row=document.createElement('div');row.className=`schedule-item ${e.type}${e.conflict?' conflict':''}`;
    const details=[e.teacher?`老师：${e.teacher}`:'',e.room?`地点：${e.room}`:'',e.note||'',e.source==='added'?'临时添加':'',e.conflict?'⚠ 与本日另一项安排时间重叠':''].filter(Boolean);
    row.innerHTML=`<div class="schedule-time">${esc(e.start)}–${esc(e.end)}</div><div class="schedule-main"><div class="schedule-name">${esc(e.name)}<span class="schedule-badge ${e.type}">${scheduleTypeLabel(e)}</span></div><div class="schedule-meta ${e.conflict?'schedule-warning':''}">${details.map(esc).join(' · ')}</div></div>${e.type==='course'?'<button class="schedule-remove" type="button" title="删除 / 取消这一天的课程">×</button>':'<span></span>'}`;
    const remove=row.querySelector('.schedule-remove');if(remove)remove.onclick=()=>removeCourseFromDate(e);
    box.appendChild(row)
  })
}
function presetLabel(c){
  return `${['日','一','二','三','四','五','六'][c.day]} · ${c.start}–${c.end} · ${c.name}${c.room?` · ${c.room}`:''}`
}
function populateSchedulePreset(){
  const select=$('#schedulePreset');if(!select)return;
  select.innerHTML='<option value="">自定义 / 临时课程</option>'+COURSE_SCHEDULE.map(c=>`<option value="${esc(c.id)}">周${esc(presetLabel(c))}</option>`).join('')
}
function fillScheduleForm(c){
  $('#scheduleName').value=c?.name||'';$('#scheduleStart').value=c?.start||'';$('#scheduleEnd').value=c?.end||'';
  $('#scheduleTeacher').value=c?.teacher||'';$('#scheduleRoom').value=c?.room||'';$('#scheduleNoteInput').value=c?.note||''
}
function clearScheduleForm(){if($('#schedulePreset'))$('#schedulePreset').value='';fillScheduleForm(null)}
function renderCancelledScheduleList(){
  const box=$('#cancelledScheduleList');if(!box)return;
  const ov=scheduleOverrideFor(sel),items=COURSE_SCHEDULE.filter(c=>ov.cancelled.includes(c.id));
  box.innerHTML='';
  if(!items.length){box.innerHTML='<div class="empty">今天没有被取消的固定课程。</div>';return}
  items.forEach(c=>{
    const row=document.createElement('div');row.className='schedule-manage-item';
    row.innerHTML=`<div class="grow"><b>${esc(c.name)}</b><small>${esc(c.start)}–${esc(c.end)}${c.room?` · ${esc(c.room)}`:''}</small></div><button class="btn" type="button">恢复</button>`;
    row.querySelector('button').onclick=()=>{
      const k=fmt(sel),cur=scheduleOverrideFor(sel);SO[k]={...cur,cancelled:cur.cancelled.filter(id=>id!==c.id)};
      saveScheduleState();renderSchedule();renderCancelledScheduleList();renderCal()
    };
    box.appendChild(row)
  })
}
function renderFixedScheduleList(){
  const box=$('#fixedScheduleList');if(!box)return;
  const disabled=disabledCourseIds();box.innerHTML='';
  COURSE_SCHEDULE.forEach(c=>{
    const off=disabled.includes(c.id),row=document.createElement('div');row.className='schedule-manage-item';
    row.innerHTML=`<div class="grow"><b>${esc(c.name)}</b><small>周${esc(presetLabel(c))}</small></div><button class="btn ${off?'':'ghost'}" type="button">${off?'重新启用':'停用'}</button>`;
    row.querySelector('button').onclick=()=>{
      const ids=new Set(disabledCourseIds());off?ids.delete(c.id):ids.add(c.id);SC={...SC,disabledCourseIds:[...ids]};
      saveScheduleState();renderFixedScheduleList();renderSchedule();renderCal()
    };
    box.appendChild(row)
  })
}
function openScheduleModal(){
  $('#scheduleModalDate').textContent=`${fmt(sel)} · 周${wd(sel)}${schoolWeekText(sel)?` · ${schoolWeekText(sel)}`:''}`;
  populateSchedulePreset();clearScheduleForm();renderCancelledScheduleList();renderFixedScheduleList();$('#scheduleModal').classList.add('show')
}
function closeScheduleModal(){$('#scheduleModal').classList.remove('show')}
function addScheduleCourseForSelectedDate(){
  const name=$('#scheduleName').value.trim(),start=$('#scheduleStart').value,end=$('#scheduleEnd').value;
  if(!name||!start||!end){alert('请填写课程名称、开始时间和结束时间。');return}
  if(timeMinutes(end)<=timeMinutes(start)){alert('结束时间需要晚于开始时间。');return}
  const k=fmt(sel),ov=scheduleOverrideFor(sel),course={
    id:uuid(),name,start,end,teacher:$('#scheduleTeacher').value.trim(),room:$('#scheduleRoom').value.trim(),note:$('#scheduleNoteInput').value.trim()
  };
  SO[k]={...ov,added:[...ov.added,course]};saveScheduleState();clearScheduleForm();renderSchedule();renderCal();
  alert(`已添加到 ${k} 的课表。`)
}

function annivOn(d){return A.filter(a=>{let q=parse(a.date);return a.repeat?q.getMonth()===d.getMonth()&&q.getDate()===d.getDate():a.date===fmt(d)})}

function dayDiff(a,b){
  const au=Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()),bu=Date.UTC(b.getFullYear(),b.getMonth(),b.getDate());
  return Math.round((au-bu)/86400000)
}
function selectedDistanceText(d){
  const n=dayDiff(d,now);return n===0?'今天':n>0?`${n} 天后`:`${Math.abs(n)} 天前`
}
function deadlineOn(d){return DG.filter(g=>g.dueDate===fmt(d))}
function deadlinePriority(g){return g?.priority||'medium'}
function completedDate(g){
  if(!g?.completedAt)return null;
  const d=new Date(g.completedAt);return Number.isNaN(d.getTime())?null:new Date(d.getFullYear(),d.getMonth(),d.getDate(),12)
}
function deadlineState(g){
  const due=parse(g.dueDate),today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  if(g.done){
    const c=completedDate(g)||today,n=dayDiff(due,c);
    if(n>0)return{text:`提前 ${n} 天完成`,cls:'done'};
    if(n===0)return{text:'截止当天完成',cls:'done'};
    return{text:`逾期 ${Math.abs(n)} 天完成`,cls:'done'}
  }
  const n=dayDiff(due,today);
  if(n>7)return{text:`${n} 天后截止`,cls:'future'};
  if(n>0)return{text:`还有 ${n} 天`,cls:'soon'};
  if(n===0)return{text:'今天截止',cls:'today'};
  return{text:`已逾期 ${Math.abs(n)} 天`,cls:'overdue'}
}
function deadlineSort(a,b){
  if(!!a.done!==!!b.done)return a.done?1:-1;
  const ad=parse(a.dueDate).getTime(),bd=parse(b.dueDate).getTime();
  if(ad!==bd)return ad-bd;
  return ({high:0,medium:1,low:2}[deadlinePriority(a)]??1)-({high:0,medium:1,low:2}[deadlinePriority(b)]??1)
}

function occurs(rule,d){
  const start=parse(rule.startDate), cur=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12),key=fmt(cur);
  if(cur<start)return false;
  if(rule.endDate&&cur>parse(rule.endDate))return false;
  if((rule.skipDates||[]).includes(key))return false;
  if(rule.repeat==='daily')return true;
  if(rule.repeat==='weekly')return cur.getDay()===start.getDay();
  if(rule.repeat==='monthly')return cur.getDate()===start.getDate();
  return key===rule.startDate;
}
function recurringFor(d){return RT.filter(r=>occurs(r,d)).map(r=>({...r, recurring:true, done:(r.doneDates||[]).includes(fmt(d)), occurrenceDate:fmt(d)}))}
function allTasksFor(d){return [...(T[fmt(d)]||[]).map(x=>({...x, recurring:false})), ...recurringFor(d)]}
function setTaskDone(task,d,done){
  if(task.recurring){
    const r=RT.find(x=>x.id===task.id); if(!r)return;
    r.doneDates=r.doneDates||[]; const k=fmt(d);
    if(done&&!r.doneDates.includes(k))r.doneDates.push(k); if(!done)r.doneDates=r.doneDates.filter(x=>x!==k);
    S.s('recurringTasks',RT);
  }else{
    const r=(T[fmt(d)]||[]).find(x=>x.id===task.id); if(r)r.done=done; S.s('tasks',T);
  }
}
let pendingRecurringAction=null;
function closeRecurringAction(){pendingRecurringAction=null;$('#repeatActionModal').classList.remove('show')}
function openRecurringAction(task,d){
  pendingRecurringAction={task,date:new Date(d)};
  $('#repeatActionDesc').textContent=`${task.text} · ${fmt(d)}`;
  $('#repeatActionModal').classList.add('show')
}
function finishRecurringAction(kind){
  if(!pendingRecurringAction)return;
  const {task,date}=pendingRecurringAction,r=RT.find(x=>x.id===task.id),key=fmt(date);if(!r){closeRecurringAction();return}
  if(kind==='skip'){
    r.skipDates=r.skipDates||[];if(!r.skipDates.includes(key))r.skipDates.push(key)
  }else if(kind==='end'){
    const prev=new Date(date);prev.setDate(prev.getDate()-1);
    if(prev<parse(r.startDate))RT=RT.filter(x=>x.id!==r.id);else r.endDate=fmt(prev)
  }else if(kind==='all')RT=RT.filter(x=>x.id!==r.id);
  S.s('recurringTasks',RT);closeRecurringAction();renderCal();renderTasks()
}
function removeTask(task,d){
  if(task.recurring)openRecurringAction(task,d);
  else{T[fmt(d)]=(T[fmt(d)]||[]).filter(x=>x.id!==task.id);S.s('tasks',T);renderCal();renderTasks()}
}

function pLabel(p){return p==='high'?'高':p==='low'?'低':'中'}
function rLabel(r){return r==='daily'?'每天':r==='weekly'?'每周':r==='monthly'?'每月':''}

function syncYearSelect(){
  const el=$('#yearSelect'); if(!el)return;
  const y=view.getFullYear();
  // 为以后“年计划 / 年回顾”预留较宽的年份范围；超出范围时会自动扩展。
  const start=Math.min(now.getFullYear()-5,y-1), end=Math.max(now.getFullYear()+10,y+1);
  const current=el.value;
  el.innerHTML='';
  for(let yr=start;yr<=end;yr++){
    const op=document.createElement('option');
    op.value=String(yr);op.textContent=`${yr}年`;
    if(yr===y)op.selected=true;
    el.appendChild(op);
  }
  if(current && Number(current)===y)el.value=current;
}

function renderCal(){
  syncYearSelect();
  $('#monthTitle').textContent=`${view.getMonth()+1}月`;let g=$('#calendar');g.innerHTML='';
  let y=view.getFullYear(),m=view.getMonth(),f=new Date(y,m,1,12),off=(f.getDay()+6)%7,start=new Date(y,m,1-off,12);
  for(let i=0;i<42;i++){
    let d=new Date(start);d.setDate(start.getDate()+i);let k=fmt(d),li=lunar(d),h=H[k],an=annivOn(d),ddl=deadlineOn(d),arr=allTasksFor(d),done=arr.filter(x=>x.done).length;
    let b=document.createElement('button');b.className='day'+(d.getMonth()!==m?' other':'')+(same(d,now)?' today':'')+(same(d,sel)?' selected':'');
    const dots=arr.filter(x=>!x.done).slice(0,4).map(x=>`<i class="pd ${x.priority||'medium'}"></i>`).join('');
    const schoolWeek=(d.getDay()===1)?schoolWeekNumber(d):null;
    b.innerHTML=`<div class="dtop"><span class="date-left"><span class="num">${d.getDate()}</span>${same(d,now)?'<span class="today-chip">今天</span>':''}</span><span class="lunar">${esc(li.text)}</span></div>
      <div class="tags">${schoolWeek?`<span class="school-week-badge">第${schoolWeek}周</span>`:''}${learningCalendarTags(d)}${ddl.length?`<span class="tag deadline ${ddl.every(x=>x.done)?'done':''}">${ddl.every(x=>x.done)?'✓':'⌛'} 截止${ddl.length>1?` ${ddl.length}`:''}</span>`:''}${h?`<span class="tag ${h.type}">${h.type==='holiday'?'休':'班'} · ${esc(h.name)}</span>`:''}${li.term?`<span class="tag term">${esc(li.term)}</span>`:''}${li.fest.slice(0,1).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}${an.slice(0,1).map(x=>`<span class="tag">♥ ${esc(x.name)}</span>`).join('')}</div>
      <div class="mini"><span>${arr.length?`✓ ${done}/${arr.length}`:''}</span><span class="priority-dots">${dots}</span></div>`;
    b.onclick=()=>{sel=new Date(d);renderCal();renderSide()};g.appendChild(b)
  }
  renderMonthStat();renderTodayStat();renderGoalOverview();renderDeadlineOverview();
}

function renderTasks(){
  const e=$('#tasks'), arr=allTasksFor(sel);e.innerHTML='';$('#taskStat').textContent=arr.length?`${arr.filter(x=>x.done).length}/${arr.length}`:'';
  if(!arr.length)e.innerHTML='<div class="empty">今天还没有任务。</div>';
  arr.sort((a,b)=>({high:0,medium:1,low:2}[a.priority||'medium']-({high:0,medium:1,low:2}[b.priority||'medium'])));
  arr.forEach(t=>{
    let r=document.createElement('div');r.className='task'+(t.done?' done':'');
    r.innerHTML=`<input type="checkbox" ${t.done?'checked':''}><div class="txt"><div>${esc(t.text)}</div><div class="meta"><span class="pill ${t.priority||'medium'}">${pLabel(t.priority||'medium')}优先级</span>${t.reminder?`<span class="pill reminder">⏰ ${esc(t.reminder)}</span>`:''}${t.recurring?`<span class="pill repeat">↻ ${rLabel(t.repeat)}${t.endDate?` · 到 ${esc(t.endDate)}`:''}</span>`:''}</div></div><button class="x">×</button>`;
    r.querySelector('input').onchange=x=>{setTaskDone(t,sel,x.target.checked);renderCal();renderTasks()};
    r.querySelector('button').onclick=()=>{removeTask(t,sel);renderCal();renderTasks()};e.appendChild(r)
  })
}
function syncRepeatEndUI(){
  const active=$('#repeat').value!=='none';$('#repeatEndWrap').hidden=!active;if(!active)$('#repeatEnd').value=''
}
function addTask(){
  let v=$('#taskInput').value.trim();if(!v)return;
  const data={id:uuid(),text:v,priority:$('#priority').value,reminder:$('#reminder').value||'',repeat:$('#repeat').value,done:false};
  if(data.repeat==='none'){let k=fmt(sel);T[k]=T[k]||[];T[k].push(data);S.s('tasks',T)}
  else{
    const endDate=$('#repeatEnd').value||'';
    if(endDate&&parse(endDate)<parse(fmt(sel))){alert('重复截止日期不能早于开始日期。');return}
    RT.push({...data,startDate:fmt(sel),endDate,doneDates:[],skipDates:[]});S.s('recurringTasks',RT)
  }
  $('#taskInput').value='';$('#reminder').value='';$('#repeat').value='none';$('#repeatEnd').value='';syncRepeatEndUI();renderCal();renderTasks()
}

function jumpToDate(dateText){
  const d=parse(dateText);sel=new Date(d);view=new Date(d.getFullYear(),d.getMonth(),1,12);renderCal();renderSide();
  document.querySelector('.calendar')?.scrollIntoView({behavior:'smooth',block:'start'})
}
function renderDeadlines(){
  const e=$('#deadlineGoals');if(!e)return;
  const arr=[...DG].sort(deadlineSort),pending=arr.filter(x=>!x.done);
  $('#deadlineStat').textContent=DG.length?`${pending.length} 未完成 / ${DG.length}`:'';
  e.innerHTML='';
  if(!arr.length){e.innerHTML='<div class="empty">还没有期限事项。可以给一个长期目标设定明确截止日。</div>';return}
  arr.forEach(g=>{
    const st=deadlineState(g),row=document.createElement('div');row.className='deadline-item'+(g.done?' done':'');
    row.innerHTML=`<input type="checkbox" ${g.done?'checked':''} aria-label="标记完成"><span class="goal-dot ${deadlinePriority(g)}" title="${pLabel(deadlinePriority(g))}优先级"></span><div class="deadline-body"><div class="deadline-text">${esc(g.text)}</div><div class="deadline-meta"><button class="deadline-date-btn" title="跳到截止日">截止 ${esc(g.dueDate)}</button><span class="deadline-status ${st.cls}">${esc(st.text)}</span></div></div><button class="x" title="删除">×</button>`;
    row.querySelector('input').onchange=x=>{
      g.done=x.target.checked;g.completedAt=g.done?new Date().toISOString():'';
      S.s('deadlineGoals',DG);renderDeadlines();renderDeadlineOverview();renderCal()
    };
    row.querySelector('.deadline-date-btn').onclick=()=>jumpToDate(g.dueDate);
    row.querySelector('.x').onclick=()=>{if(confirm(`删除期限事项“${g.text}”？`)){DG=DG.filter(x=>x.id!==g.id);S.s('deadlineGoals',DG);renderDeadlines();renderDeadlineOverview();renderCal()}};
    e.appendChild(row)
  })
}
function addDeadline(){
  const text=$('#deadlineInput').value.trim(),dueDate=$('#deadlineDate').value;
  if(!text){alert('先写下要在截止日前完成的事项。');return}
  if(!dueDate){alert('请选择截止日期。');return}
  DG.push({id:uuid(),text,dueDate,priority:$('#deadlinePriority').value||'medium',done:false,createdAt:new Date().toISOString(),completedAt:''});
  S.s('deadlineGoals',DG);$('#deadlineInput').value='';renderDeadlines();renderDeadlineOverview();renderCal()
}
function renderDeadlineOverview(){
  const e=$('#deadlineOverviewList');if(!e)return;
  const arr=[...DG].sort(deadlineSort),pending=arr.filter(x=>!x.done),done=arr.filter(x=>x.done).length;
  $('#deadlineOverviewProgress').textContent=`${done} / ${arr.length}`;
  if(!arr.length){$('#deadlineOverviewLabel').textContent='近期截止';e.innerHTML='<div class="empty">还没有设置期限事项。</div>';return}
  const next=pending[0];
  $('#deadlineOverviewLabel').textContent=next?`最近：${next.dueDate.slice(5).replace('-','/')} · ${deadlineState(next).text}`:'全部完成';
  e.innerHTML='';
  arr.slice(0,5).forEach(g=>{
    const st=deadlineState(g),row=document.createElement('div');row.className='deadline-overview-item'+(g.done?' done':'');
    row.innerHTML=`<button class="overview-check" title="${g.done?'标记为未完成':'提前完成 / 标记完成'}">${g.done?'✓':''}</button><span class="overview-dot ${deadlinePriority(g)}"></span><span class="overview-text" title="${esc(g.text)}">${esc(g.text)}</span><span class="deadline-overview-time ${st.cls==='overdue'?'overdue':st.cls==='soon'||st.cls==='today'?'soon':''}">${esc(st.text)}</span>`;
    row.querySelector('button').onclick=()=>{g.done=!g.done;g.completedAt=g.done?new Date().toISOString():'';S.s('deadlineGoals',DG);renderDeadlines();renderDeadlineOverview();renderCal()};
    e.appendChild(row)
  });
  if(arr.length>5)e.insertAdjacentHTML('beforeend',`<div class="overview-more">还有 ${arr.length-5} 项，在右侧“期限事项”中查看。</div>`)
}

function goalPriority(g){return g?.priority||'medium'}
function renderGoal(el,obj,key,sk){
  const e=$(el),arr=obj[key]||[];e.innerHTML='';
  if(!arr.length)e.innerHTML='<div class="empty">还没有目标。</div>';
  arr.forEach((g,i)=>{
    const r=document.createElement('div');r.className='task'+(g.done?' done':'');
    r.innerHTML=`<input type="checkbox" ${g.done?'checked':''}><span class="goal-dot ${goalPriority(g)}" title="${pLabel(goalPriority(g))}优先级"></span><div class="txt">${esc(g.text)}</div><button class="x">×</button>`;
    r.querySelector('input').onchange=x=>{g.done=x.target.checked;S.s(sk,obj);renderGoal(el,obj,key,sk);renderGoalOverview()};
    r.querySelector('button').onclick=()=>{arr.splice(i,1);obj[key]=arr;S.s(sk,obj);renderGoal(el,obj,key,sk);renderGoalOverview()};
    e.appendChild(r)
  })
}
function renderGoals(){
  const wk=weekKey(sel),mk=monthKey(sel);
  $('#weekLabel').textContent=wk;$('#monthLabel').textContent=mk;
  renderGoal('#weekGoals',WG,wk,'weekGoals');renderGoal('#monthGoals',MG,mk,'monthGoals');renderGoalOverview()
}
function addGoal(type){
  const weekly=type==='w',inp=weekly?$('#weekInput'):$('#monthInput'),v=inp.value.trim();if(!v)return;
  const obj=weekly?WG:MG,key=weekly?weekKey(sel):monthKey(sel),sk=weekly?'weekGoals':'monthGoals';
  const priority=(weekly?$('#weekPriority'):$('#monthPriority')).value||'medium';
  obj[key]=obj[key]||[];obj[key].push({id:uuid(),text:v,done:false,priority});S.s(sk,obj);inp.value='';renderGoals()
}
function renderOverviewList(el,arr,obj,key,sk){
  const e=$(el);e.innerHTML='';
  if(!arr.length){e.innerHTML='<div class="empty">暂时没有待办。</div>';return}
  arr.slice(0,5).forEach(g=>{
    const row=document.createElement('div');row.className='overview-item'+(g.done?' done':'');
    row.innerHTML=`<button class="overview-check" title="${g.done?'标记为未完成':'标记完成'}">${g.done?'✓':''}</button><span class="overview-dot ${goalPriority(g)}"></span><span class="overview-text" title="${esc(g.text)}">${esc(g.text)}</span>`;
    row.querySelector('button').onclick=()=>{g.done=!g.done;S.s(sk,obj);renderGoals()};
    e.appendChild(row)
  });
  if(arr.length>5)e.insertAdjacentHTML('beforeend',`<div class="overview-more">还有 ${arr.length-5} 项，点击下方进入完整列表。</div>`)
}
function renderGoalOverview(){
  if(!$('#weekOverviewList'))return;
  const wk=weekKey(sel),weekArr=WG[wk]||[];
  const monthDate=new Date(view.getFullYear(),view.getMonth(),1,12),mk=monthKey(monthDate),monthArr=MG[mk]||[];
  const wa=startOfWeek(sel),wb=endOfWeek(sel),sw=schoolWeekNumber(sel);
  $('#weekOverviewLabel').textContent=`${wa.getMonth()+1}/${wa.getDate()}—${wb.getMonth()+1}/${wb.getDate()}${sw?` · 校历第${sw}周`:''}`;
  $('#monthOverviewLabel').textContent=`${view.getFullYear()}年${view.getMonth()+1}月`;
  $('#weekOverviewProgress').textContent=`${weekArr.filter(x=>x.done).length} / ${weekArr.length}`;
  $('#monthOverviewProgress').textContent=`${monthArr.filter(x=>x.done).length} / ${monthArr.length}`;
  renderOverviewList('#weekOverviewList',weekArr,WG,wk,'weekGoals');renderOverviewList('#monthOverviewList',monthArr,MG,mk,'monthGoals')
}

function reflectionHasContent(r){return [r?.q1,r?.q2,r?.q3].some(x=>(x||'').trim())}
function reflectionConfirmed(r){
  if(!reflectionHasContent(r))return false;
  if(r.confirmRequired)return false;
  if(!r.completedAt)return true;
  if(!r.updatedAt)return true;
  return new Date(r.completedAt).getTime()>=new Date(r.updatedAt).getTime()-500
}
function reflectionTime(v){
  if(!v)return '';
  const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})
}
function renderReflectionState(r=R[fmt(sel)]||{}){
  const sec=$('#reflectSection'),btn=$('#completeReflection'),feedback=$('#reflectionFeedback'),has=reflectionHasContent(r),done=reflectionConfirmed(r);
  sec.classList.toggle('reflect-complete',done);sec.classList.toggle('reflect-dirty',has&&!done);
  if(!has){
    $('#saved').textContent='';btn.textContent='完成今日复盘';feedback.textContent='填写内容会自动保存草稿。'
  }else if(done){
    $('#saved').textContent='✓ 已完成';btn.textContent='✓ 今日复盘已完成';
    feedback.textContent=`已保存${r.completedAt?` · ${reflectionTime(r.completedAt)}`:''}`
  }else{
    $('#saved').textContent='有未确认修改';btn.textContent='确认今日复盘';feedback.textContent='草稿已自动保存，点击确认完成。'
  }
}
function renderSide(){
  const k=fmt(sel),li=lunar(sel),h=H[k],r=R[k]||{},school=schoolWeekText(sel),distance=dayDiff(sel,now);
  $('#dateTitle').textContent=`${sel.getMonth()+1}月${sel.getDate()}日 · 周${wd(sel)}`;
  const distanceEl=$('#dateDistance');distanceEl.textContent=selectedDistanceText(sel);distanceEl.className=`date-distance ${distance===0?'today':distance>0?'future':'past'}`;
  $('#dateSub').textContent=[`农历${li.fullText}`,school,li.term,...li.fest,h?.name].filter(Boolean).join(' · ');
  if(!$('#deadlineInput').value.trim())$('#deadlineDate').value=fmt(sel);
  renderSchedule();renderLearningMini();renderTasks();renderDeadlines();renderGoals();['q1','q2','q3'].forEach(id=>$('#'+id).value=r[id]||'');renderReflectionState(r)
}
let timer;
function saveR(){
  const key=fmt(sel),draft={q1:$('#q1').value,q2:$('#q2').value,q3:$('#q3').value};
  clearTimeout(timer);$('#saved').textContent='草稿保存中…';$('#reflectSection').classList.add('reflect-dirty');$('#reflectSection').classList.remove('reflect-complete');
  timer=setTimeout(()=>{
    const previous=R[key]||{},stamp=new Date().toISOString();
    R[key]={...previous,...draft,updatedAt:stamp,confirmRequired:true};S.s('reflections',R);renderStreak();
    if(fmt(sel)===key)renderReflectionState(R[key])
  },260)
}
function completeReflection(){
  clearTimeout(timer);
  const key=fmt(sel),draft={q1:$('#q1').value,q2:$('#q2').value,q3:$('#q3').value};
  if(![draft.q1,draft.q2,draft.q3].some(x=>x.trim())){alert('先写下一点今天的复盘，再确认完成吧。');return}
  const stamp=new Date().toISOString(),previous=R[key]||{};
  R[key]={...previous,...draft,updatedAt:stamp,completedAt:stamp,confirmRequired:false};S.s('reflections',R);renderReflectionState(R[key]);renderStreak()
}


function renderMonthStat(){
  let p=monthKey(view),all=[];for(let day=1;day<=31;day++){let d=new Date(view.getFullYear(),view.getMonth(),day,12);if(d.getMonth()!==view.getMonth())break;all.push(...allTasksFor(d))}
  let done=all.filter(x=>x.done).length;$('#monthProgress').textContent=`${done} / ${all.length}`;$('#monthRate').textContent=all.length?`完成率 ${Math.round(done/all.length*100)}%`:'本月还没有任务'
}
function renderTodayStat(){let arr=allTasksFor(now).filter(x=>!x.done),high=arr.filter(x=>(x.priority||'medium')==='high').length;$('#todayTodo').textContent=`${arr.length} 项`;$('#todayHigh').textContent=high?`其中 ${high} 项高优先级`:'没有高优先级待办'}
function renderStreak(){let n=0,d=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);while(true){let r=R[fmt(d)];if(r&&[r.q1,r.q2,r.q3].some(x=>(x||'').trim())){n++;d.setDate(d.getDate()-1)}else break}$('#streak').textContent=`${n} 天`}

function annivLabel(a){
  const t=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12),b=parse(a.date);
  if(a.repeat){let n=new Date(t.getFullYear(),b.getMonth(),b.getDate(),12);if(n<t)n.setFullYear(n.getFullYear()+1);let left=Math.round((n-t)/86400000),since=Math.max(0,Math.round((t-b)/86400000));return left===0?`今天 · 第 ${since+1} 天`:`还有 ${left} 天`}
  let x=Math.round((b-t)/86400000);return x>0?`还有 ${x} 天`:x===0?'就是今天':`已经 ${Math.abs(x)} 天`
}
function renderAnniv(){
  let e=$('#annivCards');e.innerHTML='';if(!A.length){e.innerHTML='<div class="empty" style="padding:8px">还没有纪念日，添加一个吧。</div>'}
  A.forEach(a=>{let c=document.createElement('div');c.className='anniv';c.innerHTML=`<button class="del" title="删除">×</button><b>♥ ${esc(a.name)}</b><div class="count">${annivLabel(a)}</div><small>${a.date}${a.repeat?' · 每年重复':''}</small>`;c.querySelector('.del').onclick=()=>{if(confirm(`删除纪念日“${a.name}”？`)){A=A.filter(x=>x.id!==a.id);S.s('anniversaries',A);renderAnniv();renderAnnivManage();renderCal()}};e.appendChild(c)});
}
function renderAnnivManage(){let e=$('#annivManage');e.innerHTML='<h4 style="margin:8px 0">已有纪念日</h4>';if(!A.length){e.innerHTML+='<div class="empty">暂无。</div>';return}A.forEach(a=>{let d=document.createElement('div');d.className='manage-item';d.innerHTML=`<div class="grow"><b>${esc(a.name)}</b><div class="note" style="margin:2px 0 0">${a.date}${a.repeat?' · 每年重复':''}</div></div><button class="btn">删除</button>`;d.querySelector('button').onclick=()=>{A=A.filter(x=>x.id!==a.id);S.s('anniversaries',A);renderAnniv();renderAnnivManage();renderCal()};e.appendChild(d)})}

function nextTerm(){
  try{
    const t=nextSolarTerm(now);
    if(!t){$('#nextTerm').textContent='—';return}
    const n=dayDiff(t.date,now);
    $('#nextTerm').textContent=n===0?`今日 · ${t.name}`:`${t.name} · ${n} 天`
  }catch{$('#nextTerm').textContent='—'}
}

function exportData(){
  const data=snapshotData();
  let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`苏伊温德日历备份_${fmt(now)}.json`;a.click();URL.revokeObjectURL(a.href)
}
async function importData(file){
  try{
    const data=JSON.parse(await file.text());
    if(!data||typeof data!=='object')throw new Error();
    if(!confirm('导入会用备份数据替换当前日历数据，继续吗？'))return;
    applySnapshot(data);alert('本地备份已恢复。若要让云端也采用这份数据，请再点击“上传本地数据”。')
  }catch{alert('无法读取这个备份文件。')}
}

async function askNotify(){
  if(!('Notification'in window)){alert('当前浏览器不支持网页通知。');return}
  if(Notification.permission==='denied'){alert('提醒权限已被浏览器关闭，请在浏览器的网站权限中重新允许通知。');return}
  const p=await Notification.requestPermission();updateNotifyUI();if(p==='granted')new Notification('苏伊温德日历',{body:'任务提醒已经开启。'})
}
function updateNotifyUI(){
  if(!('Notification'in window)){$('#notifyBtn').style.display='none';$('#notifyBanner').classList.remove('show');return}
  const p=Notification.permission,btn=$('#notifyBtn'),label=btn.querySelector('.notify-label'),icon=btn.querySelector('.action-icon');
  btn.classList.toggle('compact',p==='granted');
  if(p==='granted'){if(icon)icon.textContent='🔔';if(label)label.textContent='已开启';btn.title='提醒已开启'}
  else if(p==='denied'){if(icon)icon.textContent='🔕';if(label)label.textContent='已关闭';btn.title='通知权限已被浏览器关闭'}
  else{if(icon)icon.textContent='♢';if(label)label.textContent='开启提醒';btn.title='开启任务提醒'}
  $('#notifyBanner').classList.toggle('show',p==='default')
}
function checkReminders(){
  if(!('Notification'in window)||Notification.permission!=='granted')return;
  const t=new Date(),today=fmt(t),hhmm=`${pad(t.getHours())}:${pad(t.getMinutes())}`,sent=S.g('sentReminders',{});
  allTasksFor(t).forEach(task=>{
    if(task.done||!task.reminder||task.reminder!==hhmm)return;
    const key=`${today}|${task.id}|${hhmm}`;if(sent[key])return;
    new Notification('苏伊温德日历 · 到时间啦',{body:task.text});sent[key]=Date.now();
  });
  Object.keys(sent).forEach(k=>{if(Date.now()-sent[k]>7*86400000)delete sent[k]});S.s('sentReminders',sent)
}


function startOfWeek(d){
  let x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12),day=(x.getDay()+6)%7;
  x.setDate(x.getDate()-day);return x
}
function endOfWeek(d){let x=startOfWeek(d);x.setDate(x.getDate()+6);return x}
function eachDate(a,b){
  let out=[],d=new Date(a);for(;d<=b;d.setDate(d.getDate()+1))out.push(new Date(d));return out
}
function reviewEntryHtml(date,text){
  return `<div class="review-day"><b>${date.getMonth()+1}月${date.getDate()}日 · 周${wd(date)}</b><p>${esc(text)}</p></div>`
}
function collectPeriod(a,b){
  const days=eachDate(a,b);let taskTotal=0,taskDone=0,highTotal=0,highDone=0,reflectDays=0;
  const wrong=[],right=[],better=[];
  days.forEach(d=>{
    const arr=allTasksFor(d);taskTotal+=arr.length;taskDone+=arr.filter(x=>x.done).length;
    const hi=arr.filter(x=>(x.priority||'medium')==='high');highTotal+=hi.length;highDone+=hi.filter(x=>x.done).length;
    const r=R[fmt(d)]||{};
    if([r.q1,r.q2,r.q3].some(x=>(x||'').trim()))reflectDays++;
    if((r.q1||'').trim())wrong.push({date:d,text:r.q1.trim()});
    if((r.q2||'').trim())right.push({date:d,text:r.q2.trim()});
    if((r.q3||'').trim())better.push({date:d,text:r.q3.trim()});
  });
  return {days,taskTotal,taskDone,highTotal,highDone,reflectDays,wrong,right,better}
}
function renderReviewList(sel,arr){
  const e=$(sel);e.innerHTML='';
  if(!arr.length){e.innerHTML='<div class="empty">这一段还没有内容。</div>';return}
  arr.forEach(x=>e.insertAdjacentHTML('beforeend',reviewEntryHtml(x.date,x.text)))
}
function renderTrend(sel,groups){
  const e=$(sel);e.innerHTML='';const max=Math.max(1,...groups.map(g=>g.total));
  groups.forEach(g=>{
    const h=g.total?Math.max(6,Math.round((g.done/max)*85)):3;
    const pct=g.total?Math.round(g.done/g.total*100):0;
    e.insertAdjacentHTML('beforeend',`<div class="barwrap"><div class="bar" style="height:${h}px" title="${g.done}/${g.total} · ${pct}%"></div><div class="barlabel">${esc(g.label)}</div></div>`)
  })
}
function autoSummary(data,label){
  const rate=data.taskTotal?Math.round(data.taskDone/data.taskTotal*100):0;
  const highRate=data.highTotal?Math.round(data.highDone/data.highTotal*100):0;
  let lines=[
    `${label}共记录 ${data.taskTotal} 项任务，完成 ${data.taskDone} 项，完成率 ${rate}%。`,
    `高优先级任务完成 ${data.highDone}/${data.highTotal}${data.highTotal?`（${highRate}%）`:''}。`,
    `共有 ${data.reflectDays} 天写了每日复盘。`
  ];
  if(data.wrong.length)lines.push(`“做错了什么”记录了 ${data.wrong.length} 条。`);
  if(data.right.length)lines.push(`“做对了什么”记录了 ${data.right.length} 条。`);
  if(data.better.length)lines.push(`“明天怎么做得更好”记录了 ${data.better.length} 条。`);
  return lines.join('\n')
}
function manualKey(type,d){return type==='week'?`week:${weekKey(d)}`:`month:${monthKey(d)}`}
function renderWeekReview(){
  const a=startOfWeek(sel),b=endOfWeek(sel),data=collectPeriod(a,b),rate=data.taskTotal?Math.round(data.taskDone/data.taskTotal*100):0;
  $('#wDone').textContent=`${data.taskDone} / ${data.taskTotal}`;$('#wRate').textContent=`${rate}%`;
  $('#wReflectDays').textContent=`${data.reflectDays} / 7`;$('#wHigh').textContent=`${data.highDone} / ${data.highTotal}`;
  renderReviewList('#weekWrong',data.wrong);renderReviewList('#weekRight',data.right);renderReviewList('#weekBetter',data.better);
  $('#weekAuto').textContent=autoSummary(data,'本周');
  renderTrend('#weekTrend',data.days.map(d=>{let arr=allTasksFor(d);return{label:['日','一','二','三','四','五','六'][d.getDay()],done:arr.filter(x=>x.done).length,total:arr.length}}));
  $('#weekManual').value=S.g('reviewNotes',{})[manualKey('week',sel)]||''
}
function monthWeeks(d){
  const y=d.getFullYear(),m=d.getMonth(),first=new Date(y,m,1,12),last=new Date(y,m+1,0,12),groups=[];
  let cur=startOfWeek(first),i=1;
  while(cur<=last){
    let end=endOfWeek(cur),a=cur<first?first:new Date(cur),b=end>last?last:new Date(end),arr=[];
    eachDate(a,b).forEach(x=>arr.push(...allTasksFor(x)));
    groups.push({label:`W${i++}`,done:arr.filter(x=>x.done).length,total:arr.length});cur=new Date(end);cur.setDate(cur.getDate()+1)
  }
  return groups
}
function renderMonthReview(){
  const y=sel.getFullYear(),m=sel.getMonth(),a=new Date(y,m,1,12),b=new Date(y,m+1,0,12),data=collectPeriod(a,b),rate=data.taskTotal?Math.round(data.taskDone/data.taskTotal*100):0;
  $('#mDone').textContent=`${data.taskDone} / ${data.taskTotal}`;$('#mRate').textContent=`${rate}%`;
  $('#mReflectDays').textContent=`${data.reflectDays}`;$('#mHigh').textContent=`${data.highDone} / ${data.highTotal}`;
  renderReviewList('#monthWrong',data.wrong);renderReviewList('#monthRight',data.right);renderReviewList('#monthBetter',data.better);
  $('#monthAuto').textContent=autoSummary(data,'本月');renderTrend('#monthTrend',monthWeeks(sel));
  $('#monthManual').value=S.g('reviewNotes',{})[manualKey('month',sel)]||''
}
function saveReviewNote(type){
  let notes=S.g('reviewNotes',{}),key=manualKey(type,sel),value=type==='week'?$('#weekManual').value:$('#monthManual').value;
  notes[key]=value;S.s('reviewNotes',notes)
}
function reviewMarkdown(type){
  const isWeek=type==='week';
  const a=isWeek?startOfWeek(sel):new Date(sel.getFullYear(),sel.getMonth(),1,12);
  const b=isWeek?endOfWeek(sel):new Date(sel.getFullYear(),sel.getMonth()+1,0,12);
  const data=collectPeriod(a,b),title=isWeek?`${fmt(a)} ~ ${fmt(b)} 周复盘`:`${sel.getFullYear()}年${sel.getMonth()+1}月 月复盘`;
  const lines=[`# ${title}`,'',`- 任务完成：${data.taskDone}/${data.taskTotal}`,`- 完成率：${data.taskTotal?Math.round(data.taskDone/data.taskTotal*100):0}%`,`- 高优先级完成：${data.highDone}/${data.highTotal}`,`- 复盘天数：${data.reflectDays}`,''];
  const sec=(name,arr)=>{lines.push(`## ${name}`,'');if(!arr.length)lines.push('暂无记录。','');else arr.forEach(x=>lines.push(`### ${fmt(x.date)}`,'',x.text,''))}
  sec('做错了什么',data.wrong);sec('做对了什么',data.right);sec(isWeek?'下周要怎么做得更好':'下个月要怎么做得更好',data.better);
  const note=(S.g('reviewNotes',{})[manualKey(type,sel)]||'').trim();lines.push(`## 我的${isWeek?'本周':'本月'}总结`,'',note||'暂无。','');
  return {name:`${title.replace(/[~:/\\*?"<>|]/g,'-')}.md`,text:lines.join('\n')}
}
function downloadText(name,text){
  const blob=new Blob([text],{type:'text/markdown;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)
}
function openReview(){
  $('#reviewModal').classList.add('show');renderWeekReview();renderMonthReview();renderAIStored()
}



/* ===== V1.4.2 学习管理逻辑 ===== */
function defaultLearningState(){
  return {
    version:10,
    busyDates:{},
    freeLogs:[],
    countdowns:DEFAULT_LEARNING_COUNTDOWNS.map(x=>({...x})),
    english:{round1:{},round2:{},skills:{},reviews:{}},
    finance:{completions:{}},
    math:{completions:{}},
    energy:{},
    studyTimer:{active:null,sessions:[],deletedSessionIds:[]},
    spacedReviews:{done:{},settings:{finance:true,math:true,skills:true,dailyBudgetMin:15}},
    uiFeedback:{sound:false,haptic:true},
    sleep:{records:{}},
    quality:{retrievalTests:[],errorChecks:[]},
    burndown:{targets:{english1:'2026-11-18',english2:'',skills:'',finance:'',math:''},selected:'english1'},
    migrations:{}
  }
}
function normalizeLearningState(raw){
  const d=defaultLearningState(),x=(raw&&typeof raw==='object')?raw:{};
  d.version=Math.max(2,Number(x.version)||0);
  d.busyDates=(x.busyDates&&typeof x.busyDates==='object')?x.busyDates:{};
  d.freeLogs=Array.isArray(x.freeLogs)?x.freeLogs:[];
  const rawCountdowns=Array.isArray(x.countdowns)?x.countdowns:DEFAULT_LEARNING_COUNTDOWNS;
  d.countdowns=rawCountdowns.filter(c=>c&&c.title&&/^\d{4}-\d{2}-\d{2}$/.test(String(c.date||''))).map(c=>({id:String(c.id||uuid()),title:String(c.title).trim(),date:String(c.date),endDate:/^\d{4}-\d{2}-\d{2}$/.test(String(c.endDate||''))?String(c.endDate):'',kind:String(c.kind||'考试'),note:String(c.note||''),createdAt:String(c.createdAt||'')}));
  const en=x.english||{};
  d.english.round1=(en.round1&&typeof en.round1==='object')?en.round1:{};
  d.english.round2=(en.round2&&typeof en.round2==='object')?en.round2:{};
  d.english.skills=(en.skills&&typeof en.skills==='object')?en.skills:{};
  d.english.reviews=(en.reviews&&typeof en.reviews==='object')?en.reviews:{};
  d.finance.completions=(x.finance?.completions&&typeof x.finance.completions==='object')?x.finance.completions:{};
  d.math.completions=(x.math?.completions&&typeof x.math.completions==='object')?x.math.completions:{};
  d.energy=(x.energy&&typeof x.energy==='object')?x.energy:{};
  d.studyTimer=(x.studyTimer&&typeof x.studyTimer==='object')?x.studyTimer:{active:null,sessions:[],deletedSessionIds:[]};
  if(!Array.isArray(d.studyTimer.sessions))d.studyTimer.sessions=[];
  if(!Array.isArray(d.studyTimer.deletedSessionIds))d.studyTimer.deletedSessionIds=[];
  d.studyTimer.active=d.studyTimer.active&&typeof d.studyTimer.active==='object'?d.studyTimer.active:null;
  d.spacedReviews=(x.spacedReviews&&typeof x.spacedReviews==='object')?x.spacedReviews:d.spacedReviews;
  if(!d.spacedReviews.done||typeof d.spacedReviews.done!=='object')d.spacedReviews.done={};
  d.spacedReviews.settings={finance:d.spacedReviews.settings?.finance!==false,math:d.spacedReviews.settings?.math!==false,skills:d.spacedReviews.settings?.skills!==false,dailyBudgetMin:Math.max(5,Math.min(45,Number(d.spacedReviews.settings?.dailyBudgetMin)||15))};
  d.uiFeedback=(x.uiFeedback&&typeof x.uiFeedback==='object')?{sound:!!x.uiFeedback.sound,haptic:x.uiFeedback.haptic!==false}:{sound:false,haptic:true};
  d.sleep=(x.sleep&&typeof x.sleep==='object')?x.sleep:{records:{}};if(!d.sleep.records||typeof d.sleep.records!=='object')d.sleep.records={};
  d.quality=(x.quality&&typeof x.quality==='object')?x.quality:{retrievalTests:[],errorChecks:[]};if(!Array.isArray(d.quality.retrievalTests))d.quality.retrievalTests=[];if(!Array.isArray(d.quality.errorChecks))d.quality.errorChecks=[];
  d.burndown=(x.burndown&&typeof x.burndown==='object')?x.burndown:d.burndown;
  if(!d.burndown.targets||typeof d.burndown.targets!=='object')d.burndown.targets={english1:'2026-11-18',english2:'',skills:'',finance:'',math:''};
  d.migrations=(x.migrations&&typeof x.migrations==='object')?x.migrations:{};
  return d
}
function learningSave(){
  S.s('learningState',LS);
  renderLearningOverview();
  renderLearningMini();
  renderCal()
}
const LEARNING_TIME_ZONE='Asia/Shanghai';
const LEARNING_TZ_FORMATTER=new Intl.DateTimeFormat('en-CA',{timeZone:LEARNING_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
function beijingParts(value=new Date()){
  const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))return null;
  const parts={};LEARNING_TZ_FORMATTER.formatToParts(d).forEach(x=>{if(x.type!=='literal')parts[x.type]=x.value});return parts
}
function beijingDateKey(value=new Date()){const x=beijingParts(value);return x?`${x.year}-${x.month}-${x.day}`:''}
function beijingDateTimeLabel(value){const x=beijingParts(value);return x?`${x.year}-${x.month}-${x.day} ${x.hour}:${x.minute}`:'—'}
function learningTodayDate(){const x=beijingParts();return x?new Date(Number(x.year),Number(x.month)-1,Number(x.day),12):new Date()}
function learningTodayKey(){return beijingDateKey()}
function learningEntryDate(v){
  if(!v)return '';
  if(typeof v==='string')return v.slice(0,10);
  return v.date||String(v.at||'').slice(0,10)
}
function learningDoneCount(map){return Object.keys(map||{}).filter(k=>!!map[k]).length}
function learningPct(done,total){return total?Math.min(100,Math.round(done/total*100)):0}
function learningMark(map,id,checked,dateKey=learningTodayKey()){
  const key=String(id);
  if(checked)map[key]={date:dateKey,at:new Date().toISOString()};
  else delete map[key];
  learningSave()
}
function isMilitaryKey(k){return k>=LEARNING_CONFIG.militaryStart&&k<=LEARNING_CONFIG.militaryEnd}
function isLearningBusyKey(k){return !!LS.busyDates[k]}
function isExamKey(k){return k===LEARNING_CONFIG.examDate}
function learningCountdownsOnDate(k){return (LS.countdowns||[]).filter(x=>x.date===k)}
function learningCountdownText(date){
  const n=dayDiff(parse(date),learningTodayDate());
  return n>0?`还有 ${n} 天`:n===0?'就是今天':`已过去 ${Math.abs(n)} 天`
}
function learningSystemCountdowns(){
  return [
    {id:'system-english-b',title:'英语三级 B 考试',date:LEARNING_CONFIG.examDate,kind:'考试',note:'硬节点',system:true},
    {id:'system-transfer',title:'2029 江苏专转本预计窗口',date:LEARNING_CONFIG.transferWindowStart,kind:'升学考试',note:'待官方公布具体日期',system:true}
  ]
}
function learningAllCountdowns(){
  return [...(LS.countdowns||[]),...learningSystemCountdowns()].sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'zh-CN'))
}
function learningUpcomingCountdowns(){const k=learningTodayKey();return learningAllCountdowns().filter(x=>x.date>=k)}
function learningNearestCountdown(){return learningUpcomingCountdowns()[0]||null}
function addLearningCountdown(title,date,kind,note){
  title=String(title||'').trim();date=String(date||'').trim();
  if(!title){alert('先写一个考试 / 考证名称。');return}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){alert('请选择日期。');return}
  if((LS.countdowns||[]).some(x=>x.title===title&&x.date===date)){alert('这个倒数日已经存在。');return}
  LS.countdowns.push({id:uuid(),title,date,kind:String(kind||'考试'),note:String(note||'').trim(),createdAt:new Date().toISOString()});
  learningSave();renderLearningAll()
}
function removeLearningCountdown(id){
  const x=(LS.countdowns||[]).find(c=>c.id===id);if(!x)return;
  if(!confirm(`删除倒数日“${x.title}”？`))return;
  LS.countdowns=LS.countdowns.filter(c=>c.id!==id);learningSave();renderLearningAll()
}
function isTransferWindowKey(k){return k>=LEARNING_CONFIG.transferWindowStart&&k<=LEARNING_CONFIG.transferWindowEnd}
function isResumeOrLaterKey(k){return k>=LEARNING_CONFIG.resumeDate}
function englishRound1Complete(){return learningDoneCount(LS.english.round1)>=45}
function englishRound2Complete(){return learningDoneCount(LS.english.round2)>=45}
function englishSkillsComplete(){return learningDoneCount(LS.english.skills)>=ENGLISH_SKILLS.length}
function nextNumber(total,map){
  for(let i=1;i<=total;i++)if(!map[String(i)])return i;
  return null
}
function nextFinanceDay(){
  for(const d of FINANCE_EXEC_ORDER)if(!LS.finance.completions[String(d)])return d;
  return null
}
function nextMathDay(){
  for(let d=1;d<=48;d++)if(!LS.math.completions[String(d)])return d;
  return null
}
function financeItem(day){return FINANCE_PLAN.find(x=>x.originalDay===Number(day))}
function mathItem(day){return MATH_PLAN.find(x=>x.day===Number(day))}
function financeExecPosition(day){return FINANCE_EXEC_ORDER.indexOf(Number(day))}
function financePhaseByPosition(pos){return FINANCE_PHASES.find(x=>pos>=x.start&&pos<=x.end)||FINANCE_PHASES[FINANCE_PHASES.length-1]}
function financePhaseDone(phase){
  return FINANCE_EXEC_ORDER.slice(phase.start,phase.end+1).filter(d=>LS.finance.completions[String(d)]).length
}
function learningCompletionItemsOnDate(k){
  const out=[];
  for(let i=1;i<=45;i++){
    if(learningEntryDate(LS.english.round1[String(i)])===k)out.push(`英语一轮 Lesson ${i}`);
    if(learningEntryDate(LS.english.round2[String(i)])===k)out.push(`英语二轮 Lesson ${i}`)
  }
  ENGLISH_SKILLS.forEach(s=>{if(learningEntryDate(LS.english.skills[String(s.id)])===k)out.push(`四级技巧 · ${s.module} ${s.id}`)});
  FINANCE_EXEC_ORDER.forEach(d=>{if(learningEntryDate(LS.finance.completions[String(d)])===k){const x=financeItem(d);out.push(`财经 · ${x?.subject||''} ${x?.title||`Day${d}`}`)}});
  for(let d=1;d<=48;d++)if(learningEntryDate(LS.math.completions[String(d)])===k)out.push(`高数 · Day ${d}`);
  if(LS.english.reviews?.[k]?.weekly)out.push('英语 · 一周总复习');
  LS.freeLogs.filter(x=>x.date===k).forEach(x=>out.push(`自主 · ${x.track||'学习'} ${x.text||''}`));
  return out
}
function learningCalendarTags(d){
  const k=fmt(d),tags=[];
  const cds=learningCountdownsOnDate(k);
  if(cds.length)tags.push(`<span class="tag learning-countdown">⌛ ${esc(cds[0].title)}${cds.length>1?` +${cds.length-1}`:''}</span>`);
  if(isExamKey(k))tags.push('<span class="tag learning-exam">英语三级B</span>');
  if(isTransferWindowKey(k))tags.push('<span class="tag learning-exam">专转本预计</span>');
  if(isMilitaryKey(k))tags.push('<span class="tag learning">军训</span>');
  if(isLearningBusyKey(k))tags.push('<span class="tag learning-busy">缓冲</span>');
  const n=learningCompletionItemsOnDate(k).length;
  if(n)tags.push(`<span class="tag learning">学 ${n}</span>`);
  return tags.slice(0,2).join('')
}
function learningReviewFor(k){
  if(!LS.english.reviews[k])LS.english.reviews[k]={morning:false,evening:false,weekly:false};
  return LS.english.reviews[k]
}
function setLearningReview(kind,checked,k=learningTodayKey()){
  const r=learningReviewFor(k);r[kind]=!!checked;learningSave();renderLearningAll()
}
function toggleLearningBusy(k=learningTodayKey()){
  if(LS.busyDates[k]){
    delete LS.busyDates[k];learningSave();renderLearningAll();return
  }
  const reason=prompt('今天为什么需要缓冲？可以写“志愿 / 普通话考试 / 临时任务”，也可以留空。','');
  if(reason===null)return;
  LS.busyDates[k]={reason:reason.trim(),createdAt:new Date().toISOString()};
  learningSave();renderLearningAll()
}
function addBusyDate(date,reason){
  if(!date)return;
  LS.busyDates[date]={reason:(reason||'').trim(),createdAt:new Date().toISOString()};
  learningSave();renderLearningAll()
}
function removeBusyDate(date){
  delete LS.busyDates[date];learningSave();renderLearningAll()
}
function addFreeLearningLog(track,text,k=learningTodayKey()){
  if(!text.trim())return;
  LS.freeLogs.push({id:uuid(),date:k,track,text:text.trim(),at:new Date().toISOString()});
  learningSave();renderLearningAll()
}
function removeFreeLearningLog(id){
  LS.freeLogs=LS.freeLogs.filter(x=>x.id!==id);learningSave();renderLearningAll()
}
function addDaysKey(k,n){const d=parse(k);d.setDate(d.getDate()+n);return fmt(d)}
function maxDateKey(a,b){return a>b?a:b}
function countEligibleEnglishDays(startKey,endKey){
  if(startKey>endKey)return 0;
  let d=parse(startKey),e=parse(endKey),n=0;
  for(;d<=e;d.setDate(d.getDate()+1)){
    const k=fmt(d);
    if(d.getDay()!==1&&!isLearningBusyKey(k))n++
  }
  return n
}
function englishRecentPace(map){
  const cutoff=parse(addDaysKey(learningTodayKey(),-20)),byDay={};
  Object.values(map||{}).forEach(v=>{
    const k=learningEntryDate(v);if(!k)return;
    const d=parse(k);if(d>=cutoff)byDay[k]=(byDay[k]||0)+1
  });
  const vals=Object.values(byDay);
  if(!vals.length)return 1;
  return Math.max(.75,Math.min(3,vals.reduce((a,b)=>a+b,0)/vals.length))
}
function projectEnglishRound1(){
  const done=learningDoneCount(LS.english.round1),rem=Math.max(0,45-done);
  if(!rem)return {date:learningEntryDate(LS.english.round1['45'])||learningTodayKey(),pace:0};
  const pace=englishRecentPace(LS.english.round1);
  let d=learningTodayDate(),left=rem,guard=0;
  if(fmt(d)<LEARNING_CONFIG.militaryStart)d=parse(LEARNING_CONFIG.militaryStart);
  while(left>0&&guard<180){
    const k=fmt(d);
    if(d.getDay()!==1&&!isLearningBusyKey(k))left-=pace;
    if(left>0)d.setDate(d.getDate()+1);
    guard++
  }
  return {date:fmt(d),pace}
}
function dateHuman(k){if(!k)return '—';const d=parse(k);return `${d.getMonth()+1}月${d.getDate()}日`}
function learningStatusClass(projected,target){
  if(projected<=target)return 'safe';
  if(projected<=addDaysKey(target,7))return 'warn';
  return 'danger'
}
function durationSeconds(s){
  if(!s)return 0;const a=s.split(':').map(Number);return a.length===2?a[0]*60+a[1]:0
}
function durationHuman(sec){
  if(!sec)return '—';const m=Math.round(sec/60);return m>=60?`${Math.floor(m/60)}小时${m%60?`${m%60}分`:''}`:`约${m}分钟`
}
function mathDayDuration(x){return (x?.lectures||[]).reduce((s,l)=>s+durationSeconds(l.duration),0)}
function renderLearningOverview(){
  if(!$('#learnEnglishMetric'))return;
  const r1=learningDoneCount(LS.english.round1),r2=learningDoneCount(LS.english.round2),sk=learningDoneCount(LS.english.skills);
  if(!englishRound1Complete()){
    $('#learnEnglishMetric').textContent=`${r1} / 45`;
    $('#learnEnglishBar').style.width=`${learningPct(r1,45)}%`;
    $('#learnEnglishNote').textContent=`词汇第一轮 · 下一个 Lesson ${nextNumber(45,LS.english.round1)||'—'}`
  }else{
    const done=r2+sk,total=45+ENGLISH_SKILLS.length;
    $('#learnEnglishMetric').textContent=`${done} / ${total}`;
    $('#learnEnglishBar').style.width=`${learningPct(done,total)}%`;
    $('#learnEnglishNote').textContent=`第二轮 ${r2}/45 · 技巧 ${sk}/${ENGLISH_SKILLS.length}`
  }
  const f=learningDoneCount(LS.finance.completions),m=learningDoneCount(LS.math.completions);
  $('#learnFinanceMetric').textContent=`${f} / 80`;$('#learnFinanceBar').style.width=`${learningPct(f,80)}%`;
  const fd=nextFinanceDay(),fp=fd?financePhaseByPosition(financeExecPosition(fd)):null;
  $('#learnFinanceNote').textContent=fd?`${fp.name} · 下一项原 Day ${fd}`:'80 天全部完成';
  $('#learnMathMetric').textContent=`${m} / 48`;$('#learnMathBar').style.width=`${learningPct(m,48)}%`;
  $('#learnMathNote').textContent=nextMathDay()?`下一项 Day ${nextMathDay()}`:'48 天全部完成';
  const nearest=learningNearestCountdown();
  if(nearest){
    const left=dayDiff(parse(nearest.date),learningTodayDate());
    $('#learnCountdownMetric').textContent=left>0?`还有 ${left} 天`:left===0?'今天':'已结束';
    $('#learnCountdownNote').textContent=`${nearest.title} · ${nearest.date.slice(5).replace('-','/')} · ${nearest.kind}`;
    const horizon=60;$('#learnCountdownBar').style.width=`${left<=0?100:left>=horizon?6:Math.max(6,Math.round((1-left/horizon)*100))}%`;
  }else{
    $('#learnCountdownMetric').textContent='暂无';$('#learnCountdownNote').textContent='可在“倒数日”中添加';$('#learnCountdownBar').style.width='0%';
  }
  const transferStart=parse(LEARNING_CONFIG.transferPlanStart),transferWindow=parse(LEARNING_CONFIG.transferWindowStart),today=learningTodayDate();
  const transferTotal=Math.max(1,dayDiff(transferWindow,transferStart)),transferElapsed=Math.max(0,Math.min(transferTotal,dayDiff(today,transferStart)));
  const transferLeft=dayDiff(transferWindow,today);
  $('#learnTransferMetric').textContent=transferLeft>=0?`约 ${transferLeft} 天`:'待官方日期';
  $('#learnTransferBar').style.width=`${learningPct(transferElapsed,transferTotal)}%`;
  $('#learnTransferNote').textContent=`${LEARNING_CONFIG.transferStatus} · 预计窗口 2029/03/20—03/31`
}
let activeLearningTab='today';
function openLearning(tab='today'){
  activeLearningTab=tab;
  $('#learningModal').classList.add('show');
  renderLearningAll();
  if(sbUser)refreshCloudMeta()
}
function closeLearning(){$('#learningModal').classList.remove('show')}
function renderLearningAll(){
  renderLearningOverview();renderLearningBanner();renderLearningPanel();renderLearningMini()
}
function renderLearningBanner(){
  const e=$('#learningBanner');if(!e)return;
  const k=learningTodayKey(),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),examLeft=dayDiff(parse(LEARNING_CONFIG.examDate),learningTodayDate()),nearest=learningNearestCountdown();
  let title=mil?'军训保护期':busy?'今天已设为缓冲日':'动态计划正常运行';
  let desc=mil?'10/12—10/25：财经、高数正式进度冻结；英语照常，周一总复习、周二到周日推进新 Lesson。':busy?'今天不强制推进正式队列；英语复习仍可保留，想学多少都可以手动完成。':'完成得快，后面的队列自动前移；临时忙，未完成内容不会过期，只会继续成为下一项。';
  const nearChip=nearest?`<span class="learning-chip blue">${esc(nearest.title)} · ${learningCountdownText(nearest.date)}</span>`:'';
  e.innerHTML=`<div><strong>${title}</strong><div class="small">${desc}</div></div><div class="learning-row">${nearChip}<span class="learning-chip orange">三级B ${LEARNING_CONFIG.examDate.slice(5).replace('-','/')} · ${examLeft>=0?`还有 ${examLeft} 天`:'已结束'}</span><button class="btn ${busy?'':'learning-danger-btn'}" id="toggleBusyToday">${busy?'恢复正常计划':'今天很忙'}</button></div>`;
  $('#toggleBusyToday').onclick=()=>toggleLearningBusy(k)
}
function renderLearningPanel(){
  document.querySelectorAll('[data-learning-tab]').forEach(b=>b.classList.toggle('active',b.dataset.learningTab===activeLearningTab));
  if(activeLearningTab==='english')renderLearningEnglish();
  else if(activeLearningTab==='finance')renderLearningFinance();
  else if(activeLearningTab==='math')renderLearningMath();
  else if(activeLearningTab==='countdowns')renderLearningCountdowns();
  else if(activeLearningTab==='schedule')renderLearningSchedule();
  else renderLearningToday()
}
function renderLearningToday(){
  const e=$('#learningPanel'),k=learningTodayKey(),d=learningTodayDate(),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),monday=d.getDay()===1;
  const r=learningReviewFor(k),r1=learningDoneCount(LS.english.round1),todayItems=learningCompletionItemsOnDate(k);
  const nextR1=nextNumber(45,LS.english.round1),nextR2=nextNumber(45,LS.english.round2),nextSkill=nextNumber(ENGLISH_SKILLS.length,LS.english.skills);
  const fd=nextFinanceDay(),md=nextMathDay(),free=LS.freeLogs.filter(x=>x.date===k);
  let englishCore='';
  if(!englishRound1Complete()){
    englishCore=k<LEARNING_CONFIG.militaryStart
      ? `<div class="learning-lock">英语一轮从 ${dateHuman(LEARNING_CONFIG.militaryStart)} 启动。周一作为总复习 / 重启整理日，周二开始推进 Lesson 1。</div>`
      : monday
        ? `<div class="learning-status-box"><b>周一：不安排新 Lesson</b><br>今天只做本周总复习。需要额外学也可以去“英语”页手动完成。</div>`
        : `<div class="learning-status-box ${busy?'warn':'safe'}"><div class="learning-big-next">词汇一轮 · Lesson ${nextR1||'全部完成'}</div><div class="learning-source-note">${busy?'今天是缓冲日，不强制推进。':'这是今天的核心新词任务；如果这一节短、状态好，完成后可以继续下一节。'}</div>${nextR1?`<div class="learning-row" style="margin-top:8px"><button class="btn primary" id="todayDoneEnglish">${r1===0?'完成本节':'完成 Lesson '+nextR1}</button><span class="learning-chip">今日已背 ${Object.values(LS.english.round1).filter(v=>learningEntryDate(v)===k).length} 节</span></div>`:''}</div>`
  }else{
    const days=Math.max(1,dayDiff(parse(LEARNING_CONFIG.contentDeadline),d)+1),eligible=Math.max(1,countEligibleEnglishDays(k,LEARNING_CONFIG.contentDeadline));
    const r2rem=45-learningDoneCount(LS.english.round2),skrem=ENGLISH_SKILLS.length-learningDoneCount(LS.english.skills);
    englishCore=`<div class="learning-status-box ${busy?'warn':'safe'}"><div class="learning-big-next">第二轮 + 四级技巧课</div><div class="learning-source-note">第一轮已经完整结束。到 ${dateHuman(LEARNING_CONFIG.contentDeadline)} 前，按当前余量建议平均每个非周一学习日约 ${Math.max(0,(r2rem/eligible)).toFixed(1)} 节二轮词汇；技巧课平均每天约 ${(skrem/days).toFixed(1)} 节。</div><div class="learning-row" style="margin-top:8px">${nextR2?`<button class="btn primary" id="todayDoneR2">完成二轮 Lesson ${nextR2}</button>`:''}${nextSkill?`<button class="btn" id="todayDoneSkill">完成技巧课 ${nextSkill}</button>`:''}</div></div>`
  }
  e.innerHTML=`
    <div class="learning-section-card">
      <div class="learning-row spread"><div><h4>今天 · ${k} · 周${wd(d)}</h4><div class="learning-source-note">${mil?'军训保护期：财经 / 高数不推进正式计划。':isResumeOrLaterKey(k)?'已进入正常学习阶段。':'学习计划准备期。'}${busy?' · 已设为缓冲日。':''}</div></div><span class="learning-chip ${mil?'orange':busy?'red':'green'}">${mil?'军训':busy?'缓冲':'正常'}</span></div>
    </div>
    ${(()=>{const arr=learningUpcomingCountdowns().slice(0,3);return `<div class="learning-section-card"><div class="learning-row spread"><h4>近期考试 / 考证</h4><button class="btn" id="openCountdownsToday">管理倒数日</button></div>${arr.length?arr.map(x=>`<div class="learning-mini-line"><b>${esc(x.title)}</b> · ${x.date} · ${learningCountdownText(x.date)}</div>`).join(''):'<div class="learning-empty">暂无倒数日。</div>'}</div>`})()}
    <div class="learning-section-card">
      <h4>英语固定复习</h4>
      <div class="learning-review-grid">
        <label class="learning-review-check"><input type="checkbox" id="reviewMorning" ${r.morning?'checked':''}><span><b>早上复习昨日词汇</b><small>起床后快速回忆前一天新背内容。</small></span></label>
        <label class="learning-review-check"><input type="checkbox" id="reviewEvening" ${r.evening?'checked':''}><span><b>晚上复习昨日词汇</b><small>睡前再次检索，重点看卡壳词。</small></span></label>
        <label class="learning-review-check" style="${monday?'':'opacity:.48'}"><input type="checkbox" id="reviewWeekly" ${r.weekly?'checked':''} ${monday?'':'disabled'}><span><b>周一一周总复习</b><small>${monday?'今天执行，不安排新的核心 Lesson。':'仅周一开启。'}</small></span></label>
      </div>
    </div>
    <div class="learning-section-card"><h4>英语今日推进</h4>${englishCore}</div>
    <div class="learning-section-card">
      <h4>财经 / 高数</h4>
      ${(!isResumeOrLaterKey(k))?`<div class="learning-lock">${mil?'军训期间正式进度冻结。想学可以记为“自主学习”，不会推进 Day 队列。':'财经和高数正式计划从 10/26 恢复正常上课后启动。'}</div>`:busy?'<div class="learning-lock">今天是缓冲日，不自动推进财经和高数。</div>':`
        <div class="learning-row">
          ${fd?`<button class="btn" id="todayDoneFinance">完成财经下一项 · 原 Day ${fd}</button>`:'<span class="learning-chip green">财经已完成</span>'}
          ${md?`<button class="btn" id="todayDoneMath">完成高数 Day ${md}</button>`:'<span class="learning-chip green">高数已完成</span>'}
        </div>`}
    </div>
    <div class="learning-section-card">
      <h4>自主学习记录 <span class="learning-chip">不推进正式计划</span></h4>
      <div class="learning-free-row"><select id="freeTrack"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select><input id="freeText" type="text" name="free_learning_note_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="例如：军训后顺手看了会计第1章思维导图"><button class="btn" id="addFreeLog">记录</button></div>
      <div id="freeLogList">${free.length?free.map(x=>`<div class="learning-free-log"><span>${esc(x.track)} · ${esc(x.text)}</span><button class="x" data-free-id="${x.id}">×</button></div>`).join(''):'<div class="learning-empty">今天还没有自主学习记录。</div>'}</div>
    </div>
    <div class="learning-section-card">
      <h4>今天已经完成</h4>
      ${todayItems.length?todayItems.map(x=>`<div class="learning-mini-line">✓ ${esc(x)}</div>`).join(''):'<div class="learning-empty">正式学习项目还没有打勾。</div>'}
    </div>`;
  if($('#openCountdownsToday'))$('#openCountdownsToday').onclick=()=>{activeLearningTab='countdowns';renderLearningAll()};
  $('#reviewMorning').onchange=x=>setLearningReview('morning',x.target.checked,k);
  $('#reviewEvening').onchange=x=>setLearningReview('evening',x.target.checked,k);
  if(monday)$('#reviewWeekly').onchange=x=>setLearningReview('weekly',x.target.checked,k);
  if($('#todayDoneEnglish'))$('#todayDoneEnglish').onclick=()=>{learningMark(LS.english.round1,nextNumber(45,LS.english.round1),true,k);renderLearningAll()};
  if($('#todayDoneR2'))$('#todayDoneR2').onclick=()=>{learningMark(LS.english.round2,nextNumber(45,LS.english.round2),true,k);renderLearningAll()};
  if($('#todayDoneSkill'))$('#todayDoneSkill').onclick=()=>{learningMark(LS.english.skills,nextNumber(ENGLISH_SKILLS.length,LS.english.skills),true,k);renderLearningAll()};
  if($('#todayDoneFinance'))$('#todayDoneFinance').onclick=()=>{learningMark(LS.finance.completions,nextFinanceDay(),true,k);renderLearningAll()};
  if($('#todayDoneMath'))$('#todayDoneMath').onclick=()=>{learningMark(LS.math.completions,nextMathDay(),true,k);renderLearningAll()};
  $('#addFreeLog').onclick=()=>{addFreeLearningLog($('#freeTrack').value,$('#freeText').value,k)};
  document.querySelectorAll('[data-free-id]').forEach(b=>b.onclick=()=>removeFreeLearningLog(b.dataset.freeId))
}
function renderLearningEnglish(){
  const e=$('#learningPanel'),r1=learningDoneCount(LS.english.round1),r2=learningDoneCount(LS.english.round2),sk=learningDoneCount(LS.english.skills),next=nextNumber(45,LS.english.round1);
  const proj=projectEnglishRound1(),eligible=Math.max(1,countEligibleEnglishDays(maxDateKey(learningTodayKey(),LEARNING_CONFIG.militaryStart),LEARNING_CONFIG.round1SoftTarget)),required=Math.max(0,(45-r1)/eligible);
  const cls=learningStatusClass(proj.date,LEARNING_CONFIG.round1SoftTarget);
  const r1list=Array.from({length:45},(_,i)=>i+1).map(i=>{
    const v=LS.english.round1[String(i)],done=!!v;
    return `<label class="learning-item ${done?'done':''}"><input type="checkbox" data-en-r1="${i}" ${done?'checked':''}><div><div class="learning-item-title">Lesson ${i}</div><div class="learning-item-meta">${done?'第一轮已完成':'等待第一轮学习'}</div></div><span class="learning-item-date">${done?esc(learningEntryDate(v)):''}</span></label>`
  }).join('');
  let unlocked='';
  if(!englishRound1Complete()){
    unlocked=`<div class="learning-lock">完整完成第一轮 40/40 后，才会正式解锁“第二轮 + 38 节四级技巧课”。每周一的总复习属于第一轮内部的复盘，不计作二轮。</div>`
  }else{
    const r2list=Array.from({length:45},(_,i)=>i+1).map(i=>{
      const v=LS.english.round2[String(i)],done=!!v;
      return `<label class="learning-item ${done?'done':''}"><input type="checkbox" data-en-r2="${i}" ${done?'checked':''}><div><div class="learning-item-title">二轮 Lesson ${i}</div><div class="learning-item-meta">建议倍速重学 + 主动检索，不与第一轮完成记录混用。</div></div><span class="learning-item-date">${done?esc(learningEntryDate(v)):''}</span></label>`
    }).join('');
    const modules=['写作','翻译','听力','阅读'];
    const skillHtml=modules.map(mod=>{
      const arr=ENGLISH_SKILLS.filter(x=>x.module===mod),doneN=arr.filter(x=>LS.english.skills[String(x.id)]).length;
      return `<div class="learning-module-title"><span>${mod}篇</span><span>${doneN}/${arr.length}</span></div><div class="learning-item-list">${arr.map(s=>{
        const v=LS.english.skills[String(s.id)],done=!!v;
        return `<label class="learning-item ${done?'done':''}"><input type="checkbox" data-en-skill="${s.id}" ${done?'checked':''}><div><div class="learning-item-title">${String(s.id).padStart(2,'0')} · ${esc(s.title)}</div><div class="learning-item-meta">${esc(s.duration)} · 刘晓燕《就这样过英语四级》</div></div><span class="learning-item-date">${done?esc(learningEntryDate(v)):''}</span></label>`
      }).join('')}</div>`
    }).join('');
    unlocked=`
      <div class="learning-section-card">
        <div class="learning-row spread"><h4>第二轮词汇 · ${r2}/45</h4>${nextNumber(45,LS.english.round2)?`<button class="btn primary" id="doneNextR2">今天完成 Lesson ${nextNumber(45,LS.english.round2)}</button>`:'<span class="learning-chip green">已完成</span>'}</div>
        <div class="learning-item-list">${r2list}</div>
      </div>
      <div class="learning-section-card">
        <div class="learning-row spread"><h4>四级通关技巧 · ${sk}/${ENGLISH_SKILLS.length}</h4>${nextNumber(ENGLISH_SKILLS.length,LS.english.skills)?`<button class="btn primary" id="doneNextSkill">今天完成第 ${nextNumber(ENGLISH_SKILLS.length,LS.english.skills)} 节</button>`:'<span class="learning-chip green">已完成</span>'}</div>
        <div class="learning-source-note">与词汇二轮同步进行；内容必须在 ${dateHuman(LEARNING_CONFIG.contentDeadline)} 前尽量收官，为 12/11—12/12 留出三级B题型与错题缓冲。</div>
        ${skillHtml}
      </div>`
  }
  e.innerHTML=`
    <div class="learning-section-card">
      <div class="learning-row spread"><div><h4>英语四级词汇 · 第一轮 ${r1}/45</h4><div class="learning-source-note">周一只做一周总复习；周二到周日默认至少推进 1 个 Lesson。短课可以连续学 2 个甚至更多，完成后队列立即前移。</div></div>${next?`<button class="btn primary" id="doneNextR1">今天完成 Lesson ${next}</button>`:'<span class="learning-chip green">第一轮完成</span>'}</div>
      <div class="learning-status-box ${cls}" style="margin-top:9px"><b>动态预测：${dateHuman(proj.date)}</b><br>软目标 ${dateHuman(LEARNING_CONFIG.round1SoftTarget)}。按当前记录估算节奏约 ${proj.pace.toFixed(1)} Lesson / 实际学习日；若想守住软目标，从现在到目标日平均需要约 ${required.toFixed(1)} Lesson / 非周一学习日。</div>
      <div class="learning-item-list">${r1list}</div>
    </div>
    ${unlocked}`;
  document.querySelectorAll('[data-en-r1]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.round1,x.dataset.enR1,ev.target.checked);renderLearningAll()});
  document.querySelectorAll('[data-en-r2]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.round2,x.dataset.enR2,ev.target.checked);renderLearningAll()});
  document.querySelectorAll('[data-en-skill]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.skills,x.dataset.enSkill,ev.target.checked);renderLearningAll()});
  if($('#doneNextR1'))$('#doneNextR1').onclick=()=>{learningMark(LS.english.round1,nextNumber(45,LS.english.round1),true);renderLearningAll()};
  if($('#doneNextR2'))$('#doneNextR2').onclick=()=>{learningMark(LS.english.round2,nextNumber(45,LS.english.round2),true);renderLearningAll()};
  if($('#doneNextSkill'))$('#doneNextSkill').onclick=()=>{learningMark(LS.english.skills,nextNumber(ENGLISH_SKILLS.length,LS.english.skills),true);renderLearningAll()}
}
function renderLearningFinance(){
  const e=$('#learningPanel'),done=learningDoneCount(LS.finance.completions),next=nextFinanceDay(),pos=next?financeExecPosition(next):-1,item=next?financeItem(next):null,phase=next?financePhaseByPosition(pos):FINANCE_PHASES[3],k=learningTodayKey(),paused=!formalAdvanceAllowed(k);
  const phaseHtml=FINANCE_PHASES.map(p=>`<div><small>${p.name}</small><b>${financePhaseDone(p)} / ${p.total}</b><div class="learning-source-note">${p.note}</div></div>`).join('');
  const list=FINANCE_EXEC_ORDER.map((d,idx)=>{
    const x=financeItem(d),v=LS.finance.completions[String(d)],isdone=!!v,p=financePhaseByPosition(idx);
    return `<label class="learning-item ${isdone?'done':''}"><input type="checkbox" data-fin="${d}" ${isdone?'checked':''}><div><div class="learning-item-title">实际 ${idx+1} · 原 Day ${d} · ${esc(x.subject)}｜${esc(x.title)}</div><div class="learning-item-meta">${esc(p.name)} · ${esc(x.target||'')} · 机构原表第 ${x.sourcePage} 页摘要</div></div><span class="learning-item-date">${isdone?esc(learningEntryDate(v)):''}</span></label>`
  }).join('');
  e.innerHTML=`
    <div class="learning-section-card">
      <h4>财经综合 · 会计优先闭环</h4>
      <div class="learning-source-note">执行顺序已从机构原来的“会计基础 → 财管基础 → 经济学基础 → 统一强化”，调整为“会计完整闭环 → 财管完整闭环 → 经济学完整闭环 → 三科收官”。原 80 天内容一个不删，只改变执行顺序，用会计同时覆盖本学期基础会计闭卷期末。</div>
      <div class="learning-phase">${phaseHtml}</div>
    </div>
    <div class="learning-section-card">
      <div class="learning-row spread"><div><h4>下一项</h4>${item?`<div class="learning-big-next">${phase.name} · 原 Day ${next} · ${esc(item.title)}</div><div class="learning-source-note">${esc(item.subject)} · ${esc(item.target||'')}</div>`:'<div class="learning-big-next">80 天全部完成</div>'}</div>${item&&!paused?`<button class="btn primary" id="doneNextFin">今天完成</button>`:''}</div>
      ${paused&&item?`<div class="learning-lock" style="margin-top:8px">10/12—10/25 军训保护期：正式财经队列冻结。自主学习请到“今日”页记录，不推进这里的 Day。</div>`:''}
    </div>
    <div class="learning-section-card"><h4>完整执行队列 · ${done}/80</h4><div class="learning-item-list">${list}</div></div>`;
  document.querySelectorAll('[data-fin]').forEach(x=>x.onchange=ev=>{
    if(!formalAdvanceAllowed(learningTodayKey())&&ev.target.checked){ev.target.checked=false;alert('当前日期尚未进入军训弹性期或正式阶段，暂不推进财经 Day。');return}
    learningMark(LS.finance.completions,x.dataset.fin,ev.target.checked);renderLearningAll()
  });
  if($('#doneNextFin'))$('#doneNextFin').onclick=()=>{learningMark(LS.finance.completions,nextFinanceDay(),true);renderLearningAll()}
}
function renderLearningMath(){
  const e=$('#learningPanel'),done=learningDoneCount(LS.math.completions),next=nextMathDay(),x=next?mathItem(next):null,k=learningTodayKey(),paused=!formalAdvanceAllowed(k);
  const nextDetail=x?`<div class="learning-course-detail"><b>视频：</b> ${x.lectures.length} 节 · ${durationHuman(mathDayDuration(x))}<ul>${x.lectures.map(l=>`<li>${esc(l.title)}${l.duration?` <span class="learning-chip">${esc(l.duration)}</span>`:''}</li>`).join('')}</ul><b>打铁：</b> ${x.drills.length?`${Math.min(...x.drills)}—${Math.max(...x.drills)}（共 ${x.drills.length} 项）`:'本日无配套编号'}</div>`:'';
  const list=MATH_PLAN.map(x=>{
    const v=LS.math.completions[String(x.day)],isdone=!!v,dur=mathDayDuration(x),dr=x.drills.length?`${Math.min(...x.drills)}—${Math.max(...x.drills)}`:'—';
    return `<div class="learning-item ${isdone?'done':''}"><input type="checkbox" data-math="${x.day}" ${isdone?'checked':''}><div><div class="learning-item-title">Day ${x.day} · ${x.lectures[0]?esc(x.lectures[0].title.replace(/^第\d+讲-/,'')):'高数学习'}</div><div class="learning-item-meta">${x.lectures.length} 节视频 · ${durationHuman(dur)} · 打铁 ${dr} · 原表第 ${x.sourcePage} 页</div><details class="learning-course-detail"><summary>查看当天明细</summary><ul>${x.lectures.map(l=>`<li>${esc(l.title)}${l.duration?` · ${esc(l.duration)}`:''}</li>`).join('')}</ul><div>打铁：${x.drills.join('、')||'—'}</div></details></div><span class="learning-item-date">${isdone?esc(learningEntryDate(v)):''}</span></div>`
  }).join('');
  e.innerHTML=`
    <div class="learning-section-card">
      <h4>高数 · 机构 48 天零基础计划</h4>
      <div class="learning-source-note">保持机构原 48 天顺序。每个 Day 内的视频和“打铁”配套题作为一个整体完成；提前完成就立即推进下一 Day，临时忙则停在当前 Day，不产生逾期。</div>
    </div>
    <div class="learning-section-card">
      <div class="learning-row spread"><div><h4>下一项</h4>${x?`<div class="learning-big-next">高数 Day ${next}</div>`:'<div class="learning-big-next">48 天全部完成</div>'}</div>${x&&!paused?`<button class="btn primary" id="doneNextMath">今天完成 Day ${next}</button>`:''}</div>
      ${paused&&x?'<div class="learning-lock" style="margin-top:8px">军训期间正式高数计划冻结；想看课可以记为自主学习，不推进 Day。</div>':''}
      ${nextDetail}
    </div>
    <div class="learning-section-card"><h4>完整 48 天计划 · ${done}/48</h4><div class="learning-item-list">${list}</div></div>`;
  document.querySelectorAll('[data-math]').forEach(x=>x.onchange=ev=>{
    if(!formalAdvanceAllowed(learningTodayKey())&&ev.target.checked){ev.target.checked=false;alert('当前日期尚未进入军训弹性期或正式阶段，暂不推进高数 Day。');return}
    learningMark(LS.math.completions,x.dataset.math,ev.target.checked);renderLearningAll()
  });
  if($('#doneNextMath'))$('#doneNextMath').onclick=()=>{learningMark(LS.math.completions,nextMathDay(),true);renderLearningAll()}
}
function renderLearningCountdowns(){
  const e=$('#learningPanel'),today=learningTodayKey(),mine=[...(LS.countdowns||[])].sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'zh-CN'));
  const fixed=learningSystemCountdowns();
  const list=mine.length?mine.map(x=>{
    const past=x.date<today,n=dayDiff(parse(x.date),learningTodayDate());
    const cls=n===0?'today':'';
    return `<div class="learning-countdown-row ${past?'past':''}"><div><div class="learning-countdown-title">${esc(x.title)} <span class="learning-chip">${esc(x.kind||'考试')}</span></div><div class="learning-countdown-meta">${x.date}${x.note?` · ${esc(x.note)}`:''}</div></div><div class="learning-countdown-days ${cls}">${learningCountdownText(x.date)}</div><button class="x" data-countdown-remove="${x.id}" title="删除倒数日">×</button></div>`
  }).join(''):'<div class="learning-empty">还没有自定义倒数日。</div>';
  e.innerHTML=`
    <div class="learning-section-card">
      <h4>系统固定节点</h4>
      <div class="learning-countdown-fixed">
        ${fixed.map(x=>`<div><b>${esc(x.title)} · ${x.date}</b><small>${learningCountdownText(x.date)} · ${esc(x.note||'')}</small></div>`).join('')}
      </div>
      <div class="learning-source-note" style="margin-top:7px">英语三级 B 和 2029 专转本属于学习系统固定节点；下面的“我的倒数日”可以自行添加和删除。</div>
    </div>
    <div class="learning-section-card">
      <h4>添加考试 / 考证倒数日</h4>
      <div class="learning-countdown-form">
        <input id="countdownTitle" type="text" name="countdown_title_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="例如：计算机一级 / 教资笔试">
        <input id="countdownDate" type="date" value="${today}">
        <select id="countdownKind"><option>考试</option><option>考证</option><option>报名</option><option>面试</option><option>其他</option></select>
        <input id="countdownNote" type="text" name="countdown_note_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="备注（可选）">
        <button class="btn primary" id="addCountdownBtn">添加</button>
      </div>
      <div class="learning-source-note" style="margin-top:6px">添加后会进入学习管理总览，并在对应日期的日历格里显示。倒数日只负责提醒，不会自动把当天设成缓冲日；需要暂停学习队列时，可再到“调度”里设缓冲。</div>
    </div>
    <div class="learning-section-card">
      <div class="learning-row spread"><h4>我的倒数日 · ${mine.length}</h4><span class="learning-chip blue">可删除</span></div>
      <div class="learning-countdown-list">${list}</div>
    </div>`;
  $('#addCountdownBtn').onclick=()=>addLearningCountdown($('#countdownTitle').value,$('#countdownDate').value,$('#countdownKind').value,$('#countdownNote').value);
  document.querySelectorAll('[data-countdown-remove]').forEach(b=>b.onclick=()=>removeLearningCountdown(b.dataset.countdownRemove))
}
function renderLearningSchedule(){
  const e=$('#learningPanel'),busy=Object.entries(LS.busyDates).sort((a,b)=>a[0].localeCompare(b[0]));
  const milestones=[
    {date:LEARNING_CONFIG.resumeDate,text:'恢复正常上课：财经 / 高数正式队列开放。'},
    ...(LS.countdowns||[]).map(x=>({date:x.date,text:`${esc(x.title)} <span class="learning-chip">${esc(x.kind||'考试')}</span>`})),
    {date:LEARNING_CONFIG.contentDeadline,text:'英语内容收官目标：第二轮 + 38 节技巧课尽量结束。'},
    {date:LEARNING_CONFIG.examDate,text:'英语三级 B 考试（硬节点）。'},
    {date:LEARNING_CONFIG.transferWindowStart,text:'江苏普通高校专转本考试预计窗口开始（3/20—3/31，<strong>待官方公布后替换</strong>）。'}
  ].sort((a,b)=>a.date.localeCompare(b.date));
  const milestoneHtml=milestones.map(x=>`<div class="learning-mini-line"><b>${x.date}</b> · ${x.text}</div>`).join('');
  e.innerHTML=`
    <div class="learning-section-card">
      <h4>固定节点</h4>
      <div class="learning-mini-line"><b>10/12—10/25</b> · 军训保护期：财经、高数冻结；英语照常。</div>
      ${milestoneHtml}
    </div>
    <div class="learning-section-card">
      <div class="learning-row spread"><div><h4>长期目标 · 2029 江苏专转本</h4><div class="learning-big-next">预计 2029 年 3 月下旬</div><div class="learning-source-note">当前官方具体考试日期尚未公布。应用暂用 2029/03/20—03/31 作为“预计考试窗口”做长期倒计时与阶段规划；这不是官方考试日期，后续公布后直接替换，不影响现有学习记录。</div></div><span class="learning-chip orange">待官方公布</span></div>
    </div>
    <div class="learning-section-card">
      <h4>添加缓冲日</h4>
      <div class="learning-free-row"><input id="busyDateInput" type="date" value="${learningTodayKey()}"><input id="busyReasonInput" type="text" name="busy_reason_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="例如：志愿活动 / 普通话考试 / 临时作业"><button class="btn" id="addBusyDateBtn">设为缓冲</button></div>
      <div class="learning-source-note" style="margin-top:6px">缓冲日不会删除任务；它只让正式队列停住，下一次学习继续从未完成的第一项开始。</div>
      <div class="learning-busy-list">${busy.length?busy.map(([k,v])=>`<div class="learning-busy-row"><b>${k}</b><span>${esc(v.reason||'临时忙')}</span><button class="x" data-busy-remove="${k}">×</button></div>`).join(''):'<div class="learning-empty">暂无手动缓冲日。</div>'}</div>
    </div>
    <div class="learning-section-card">
      <h4>调度规则</h4>
      <div class="learning-status-box"><b>英语一轮</b>：周一总复习，周二—周日默认 1 Lesson；短课可当天连续完成多个，后续自动前移。<br><b>英语二轮</b>：第一轮 40/40 后才独立开始，和 38 节四级技巧课同步推进。<br><b>财经</b>：会计优先闭环，原 Day 编号保留，实际执行序号独立。<br><b>高数</b>：保持 48 天原顺序。<br><b>缓冲</b>：临时忙不算失败，不生成逾期；恢复后接着下一项。</div>
    </div>`;
  $('#addBusyDateBtn').onclick=()=>addBusyDate($('#busyDateInput').value,$('#busyReasonInput').value);
  document.querySelectorAll('[data-busy-remove]').forEach(b=>b.onclick=()=>removeBusyDate(b.dataset.busyRemove))
}
function renderLearningMini(){
  const e=$('#learningMini');if(!e)return;
  const k=fmt(sel),isToday=k===learningTodayKey(),items=learningCompletionItemsOnDate(k),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),cds=learningCountdownsOnDate(k);
  const chips=[];
  if(cds.length)chips.push(`<span class="learning-chip blue">⌛ ${esc(cds[0].title)}${cds.length>1?` +${cds.length-1}`:''}</span>`);
  if(isExamKey(k))chips.push('<span class="learning-chip red">英语三级B考试</span>');
  if(isTransferWindowKey(k))chips.push('<span class="learning-chip red">2029专转本预计窗口</span>');
  if(mil)chips.push('<span class="learning-chip orange">军训保护期</span>');
  if(busy)chips.push('<span class="learning-chip red">缓冲日</span>');
  if(items.length)chips.push(`<span class="learning-chip green">完成 ${items.length} 项</span>`);
  let lines=cds.map(x=>`<div class="learning-mini-line"><b>${esc(x.kind||'考试')}</b> · ${esc(x.title)} · ${x.date}</div>`).join('');
  if(items.length)lines+=items.slice(0,4).map(x=>`<div class="learning-mini-line">✓ ${esc(x)}</div>`).join('')+(items.length>4?`<div class="learning-source-note">还有 ${items.length-4} 项记录。</div>`:'');
  if(!items.length&&isToday){
    const r1=nextNumber(45,LS.english.round1),fd=nextFinanceDay(),md=nextMathDay();
    if(!englishRound1Complete())lines+=`<div class="learning-mini-line"><b>英语</b> · ${sel.getDay()===1?'周一总复习':`下一项 Lesson ${r1||'—'}`}</div>`;
    else lines+=`<div class="learning-mini-line"><b>英语</b> · 二轮 ${learningDoneCount(LS.english.round2)}/45 · 技巧 ${learningDoneCount(LS.english.skills)}/${ENGLISH_SKILLS.length}</div>`;
    if(!mil&&!busy&&isResumeOrLaterKey(k)){
      lines+=`<div class="learning-mini-line"><b>财经</b> · ${fd?`原 Day ${fd}`:'已完成'}　<b>高数</b> · ${md?`Day ${md}`:'已完成'}</div>`
    }
  }else if(!items.length&&!cds.length){
    lines='<div class="learning-empty">动态学习计划不提前锁死具体 Lesson；当天会根据实时进度生成。这里显示该日已完成记录。</div>'
  }
  e.innerHTML=`<div class="learning-mini-status">${chips.join('')||'<span class="learning-chip">动态队列</span>'}</div>${lines}`;
  $('#learningMiniStat').textContent=items.length?`${items.length} 项`:'';
}


/* ===== V1.5.0 学习中枢增强 ===== */
const V150_MILESTONES=[
  {id:'goal-putonghua-20261114',title:'普通话考试',date:'2026-11-14',kind:'考证',note:'普通话水平测试'},
  {id:'goal-english-b',title:'英语三级 B 考试',date:'2026-12-13',kind:'考试',note:'当前计划节点，可随官方/学校通知修改'},
  {id:'goal-wps-2027',title:'计算机二级 WPS',date:'2027-03-27',endDate:'2027-03-29',kind:'考证',note:'预计考试窗口，待官方公布后修改'},
  {id:'goal-cet4-2027',title:'英语四级 CET4',date:'2027-06-12',kind:'考试',note:'预计日期，待官方公布后修改'},
  {id:'goal-cet6-2027',title:'英语六级 CET6',date:'2027-12-11',kind:'考试',note:'预计日期，待官方公布后修改'},
  {id:'goal-transfer',title:'2029 江苏专转本预计窗口',date:'2029-03-20',endDate:'2029-03-31',kind:'升学考试',note:'预计 3 月下旬，待江苏省教育考试院公布后修改'}
];
const REVIEW_OFFSETS=[1,3,7,14,30];
const STUDY_SUBJECTS=['英语','财经','高数','其他'];
const ROADMAP_THEMES={
  2026:['基础打底年','把英语词汇与学习习惯真正建立起来；财经、高数启动，并完成普通话 / 三级B等近期节点。'],
  2027:['能力提升年','英语证书与计算机能力并行，四级、六级和 WPS 等节点按实际通知动态调整。'],
  2028:['强化沉淀年','专转本进入系统强化：持续刷题、复盘与查漏补缺，给 2029 冲刺留足余量。'],
  2029:['冲刺应考年','以江苏专转本正式考试通知为准，围绕最终节点做收口、模拟与状态管理。']
};
function v150DateOk(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))}
function v150Countdown(c){
  const date=String(c?.date||'');let endDate=String(c?.endDate||'');
  if(!v150DateOk(date))return null;if(!v150DateOk(endDate)||endDate<date)endDate='';
  return {id:String(c.id||uuid()),title:String(c.title||'').trim(),date,endDate,kind:String(c.kind||'考试'),note:String(c.note||''),createdAt:String(c.createdAt||'')}
}
function v150EnsureState(){
  LS.version=Math.max(7,Number(LS.version)||0);
  LS.energy=(LS.energy&&typeof LS.energy==='object')?LS.energy:{};
  LS.studyTimer=(LS.studyTimer&&typeof LS.studyTimer==='object')?LS.studyTimer:{active:null,sessions:[],deletedSessionIds:[]};
  if(!Array.isArray(LS.studyTimer.sessions))LS.studyTimer.sessions=[];
  if(!Array.isArray(LS.studyTimer.deletedSessionIds))LS.studyTimer.deletedSessionIds=[];
  LS.studyTimer.active=LS.studyTimer.active&&typeof LS.studyTimer.active==='object'?LS.studyTimer.active:null;
  LS.spacedReviews=(LS.spacedReviews&&typeof LS.spacedReviews==='object')?LS.spacedReviews:{done:{},settings:{finance:true,math:true,skills:true}};
  if(!LS.spacedReviews.done||typeof LS.spacedReviews.done!=='object')LS.spacedReviews.done={};
  LS.spacedReviews.settings={finance:LS.spacedReviews.settings?.finance!==false,math:LS.spacedReviews.settings?.math!==false,skills:LS.spacedReviews.settings?.skills!==false};
  LS.burndown=(LS.burndown&&typeof LS.burndown==='object')?LS.burndown:{targets:{},selected:'english1'};
  if(!LS.burndown.targets||typeof LS.burndown.targets!=='object')LS.burndown.targets={};
  const bdDefaults={english1:'2026-11-18',english2:'',skills:'',finance:'',math:''};
  for(const [k,v] of Object.entries(bdDefaults))if(typeof LS.burndown.targets[k]!=='string')LS.burndown.targets[k]=v;
  if(!['english1','english2','skills','finance','math'].includes(LS.burndown.selected))LS.burndown.selected='english1';
  LS.version=Math.max(6,Number(LS.version)||0);
  LS.countdowns=(Array.isArray(LS.countdowns)?LS.countdowns:[]).map(v150Countdown).filter(Boolean);
  if(!LS.migrations||typeof LS.migrations!=='object')LS.migrations={};
  if(!LS.migrations.editableMilestonesV150){
    for(const c of V150_MILESTONES){
      const duplicate=LS.countdowns.some(x=>x.id===c.id||(x.title===c.title&&x.date===c.date));
      if(!duplicate)LS.countdowns.push({...c,createdAt:new Date().toISOString()});
    }
    // 兼容 V1.4.2 里预置的普通话节点，避免重复。
    const seen=new Set();
    LS.countdowns=LS.countdowns.filter(x=>{const key=`${x.title}|${x.date}`;if(seen.has(key))return false;seen.add(key);return true});
    LS.migrations.editableMilestonesV150=true;
  }
  if(!LS.migrations.v153PersonalFixes){
    // 清掉旧自主学习区里残留的“高数衔接班”示例/旧记录。
    LS.freeLogs=(LS.freeLogs||[]).filter(x=>!(String(x?.track||'').trim()==='高数'&&String(x?.text||'').trim()==='高数衔接班'));
    // 2026-10-12 晚上 21:42（北京时间）高数 55 分钟：若真实记录已存在则不重复补记。
    const already=(LS.studyTimer.sessions||[]).some(x=>x?.subject==='高数'&&beijingDateKey(x.endAt||x.startAt)==='2026-10-12'&&Math.abs(Number(x.focusSeconds||0)-3300)<=120);
    if(!already){LS.studyTimer.sessions.push({id:'v153-recover-math-20261012-2142-55',recoveryKey:'math-20261012-2142-55',deviceId:'v153-recovery',subject:'高数',energy:'normal',note:'补记：高数学习 55 分钟',startAt:'2026-10-12T13:42:00.000Z',endAt:'2026-10-12T14:37:00.000Z',focusSeconds:3300,breakSeconds:0,blocks:1,recordedAt:new Date().toISOString()})}
    LS.migrations.v153PersonalFixes=true;
  }
  if(!LS.migrations.v154PersonalFixes){
    // 英语原先误按 45 个连续 Lesson 建模；实际逻辑 Lesson 为 10 Unit × 4 = 40。
    // 41—45 若曾产生旧记录，先存档再从正式进度中移出，避免错误计数。
    const overflow={round1:{},round2:{}};
    for(const n of ['41','42','43','44','45']){
      if(LS.english.round1?.[n]){overflow.round1[n]=LS.english.round1[n];delete LS.english.round1[n]}
      if(LS.english.round2?.[n]){overflow.round2[n]=LS.english.round2[n];delete LS.english.round2[n]}
    }
    if(Object.keys(overflow.round1).length||Object.keys(overflow.round2).length)LS.migrations.v154LegacyEnglishOverflow=overflow;

    // 用户明确确认：2026-10-13 已完整完成高数 Day 1、Day 2。
    if(!LS.math.completions['1'])LS.math.completions['1']={date:'2026-10-13',at:new Date().toISOString(),note:'军训弹性推进'};
    if(!LS.math.completions['2'])LS.math.completions['2']={date:'2026-10-13',at:new Date().toISOString(),note:'军训弹性推进'};

    // 补回当天中午漏记的高数 70 分钟；手动补记不伪造具体起止时间。
    const mathRecoveryId='v154-recover-math-20261013-70';
    if(!(LS.studyTimer.sessions||[]).some(x=>x?.id===mathRecoveryId||x?.recoveryKey==='math-20261013-70')){
      LS.studyTimer.sessions.push({id:mathRecoveryId,recoveryKey:'math-20261013-70',manual:true,dateKey:'2026-10-13',deviceId:'v154-recovery',subject:'高数',energy:'normal',note:'补记：中午高数 Day 1 漏记 70 分钟',startAt:'2026-10-13T04:00:00.000Z',endAt:'2026-10-13T05:10:00.000Z',focusSeconds:4200,breakSeconds:0,blocks:0,recordedAt:new Date().toISOString()});
    }

    // 英语当天误多计 30 分钟：从 2026-10-13 的英语学习账本中精确扣除 1800 秒。
    let subtract=1800;
    const deleted=new Set(LS.studyTimer.deletedSessionIds||[]);
    const eng=(LS.studyTimer.sessions||[]).filter(x=>x?.subject==='英语'&&beijingDateKey(x.startAt||x.endAt)==='2026-10-13').sort((a,b)=>String(b.endAt||b.recordedAt||'').localeCompare(String(a.endAt||a.recordedAt||'')));
    for(const old of eng){
      if(subtract<=0)break;
      const sec=Math.max(0,Number(old.focusSeconds||0));if(!sec)continue;
      deleted.add(old.id);
      LS.studyTimer.sessions=LS.studyTimer.sessions.filter(x=>x.id!==old.id);
      if(sec>subtract){
        LS.studyTimer.sessions.push({...old,id:`v154-adjust-${old.id}`,focusSeconds:sec-subtract,note:[old.note,'V1.5.4：扣除误多计 30 分钟'].filter(Boolean).join(' · '),recordedAt:new Date().toISOString()});subtract=0;
      }else subtract-=sec;
    }
    LS.studyTimer.deletedSessionIds=[...deleted].slice(-1000);
    LS.migrations.v154PersonalFixes=true;
  }
  LS.version=Math.max(8,Number(LS.version)||0);
  S.s('learningState',LS)
}
v150EnsureState();

// 覆盖导入时的学习状态规范化：保留 V1.5 新字段和可编辑日期范围。
normalizeLearningState=function(raw){
  const x=(raw&&typeof raw==='object')?raw:{};
  const d={version:8,busyDates:{},freeLogs:[],countdowns:[],english:{round1:{},round2:{},skills:{},reviews:{}},finance:{completions:{}},math:{completions:{}},energy:{},studyTimer:{active:null,sessions:[],deletedSessionIds:[]},spacedReviews:{done:{},settings:{finance:true,math:true,skills:true}},burndown:{targets:{english1:'2026-11-18',english2:'',skills:'',finance:'',math:''},selected:'english1'},migrations:{}};
  d.busyDates=(x.busyDates&&typeof x.busyDates==='object')?x.busyDates:{};d.freeLogs=Array.isArray(x.freeLogs)?x.freeLogs:[];
  d.countdowns=(Array.isArray(x.countdowns)?x.countdowns:[]).map(v150Countdown).filter(Boolean);
  const en=x.english||{};d.english.round1=(en.round1&&typeof en.round1==='object')?en.round1:{};d.english.round2=(en.round2&&typeof en.round2==='object')?en.round2:{};d.english.skills=(en.skills&&typeof en.skills==='object')?en.skills:{};d.english.reviews=(en.reviews&&typeof en.reviews==='object')?en.reviews:{};
  d.finance.completions=(x.finance?.completions&&typeof x.finance.completions==='object')?x.finance.completions:{};d.math.completions=(x.math?.completions&&typeof x.math.completions==='object')?x.math.completions:{};
  d.energy=(x.energy&&typeof x.energy==='object')?x.energy:{};
  d.studyTimer=(x.studyTimer&&typeof x.studyTimer==='object')?x.studyTimer:{active:null,sessions:[],deletedSessionIds:[]};if(!Array.isArray(d.studyTimer.sessions))d.studyTimer.sessions=[];if(!Array.isArray(d.studyTimer.deletedSessionIds))d.studyTimer.deletedSessionIds=[];
  d.spacedReviews=(x.spacedReviews&&typeof x.spacedReviews==='object')?x.spacedReviews:{done:{},settings:{finance:true,math:true,skills:true}};if(!d.spacedReviews.done||typeof d.spacedReviews.done!=='object')d.spacedReviews.done={};
  d.spacedReviews.settings={finance:d.spacedReviews.settings?.finance!==false,math:d.spacedReviews.settings?.math!==false,skills:d.spacedReviews.settings?.skills!==false};
  d.burndown=(x.burndown&&typeof x.burndown==='object')?x.burndown:d.burndown;
  if(!d.burndown.targets||typeof d.burndown.targets!=='object')d.burndown.targets={english1:'2026-11-18',english2:'',skills:'',finance:'',math:''};
  d.migrations=(x.migrations&&typeof x.migrations==='object')?x.migrations:{};
  LS=d;v150EnsureState();return LS
};
defaultLearningState=function(){return normalizeLearningState({})};

function countdownLabel(x){return x?.endDate&&x.endDate!==x.date?`${x.date} — ${x.endDate}`:x?.date||'—'}
function englishExamCountdown(){return (LS.countdowns||[]).find(x=>x.id==='goal-english-b')||null}
function transferCountdown(){return (LS.countdowns||[]).find(x=>x.id==='goal-transfer')||null}
function englishExamDate(){return englishExamCountdown()?.date||''}
function englishContentDeadline(){const k=englishExamDate();return k?addDaysKey(k,-3):''}
learningSystemCountdowns=function(){return []};
learningAllCountdowns=function(){return [...(LS.countdowns||[])].sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'zh-CN'))};
learningUpcomingCountdowns=function(){const k=learningTodayKey();return learningAllCountdowns().filter(x=>(x.endDate||x.date)>=k).sort((a,b)=>{const aa=a.date<k?k:a.date,bb=b.date<k?k:b.date;return aa.localeCompare(bb)})};
learningNearestCountdown=function(){return learningUpcomingCountdowns()[0]||null};
learningCountdownsOnDate=function(k){return (LS.countdowns||[]).filter(x=>k>=x.date&&k<=(x.endDate||x.date))};
learningCountdownText=function(date,endDate=''){
  const today=learningTodayDate(),n=dayDiff(parse(date),today);
  if(endDate&&v150DateOk(endDate)&&learningTodayKey()>=date&&learningTodayKey()<=endDate)return '正在进行';
  return n>0?`还有 ${n} 天`:n===0?'就是今天':`已过去 ${Math.abs(n)} 天`
};
isExamKey=function(k){const x=englishExamCountdown();return !!x&&k>=x.date&&k<=(x.endDate||x.date)};
isTransferWindowKey=function(k){const x=transferCountdown();return !!x&&k>=x.date&&k<=(x.endDate||x.date)};

function saveCountdownEdit(id,title,date,endDate,kind,note){
  title=String(title||'').trim();date=String(date||'').trim();endDate=String(endDate||'').trim();
  if(!title||!v150DateOk(date)){alert('请填写名称和有效日期。');return false}
  if(endDate&&(!v150DateOk(endDate)||endDate<date)){alert('结束日期不能早于开始日期。');return false}
  const i=LS.countdowns.findIndex(x=>x.id===id);if(i<0)return false;
  LS.countdowns[i]={...LS.countdowns[i],title,date,endDate:endDate||'',kind:String(kind||'考试'),note:String(note||'').trim()};learningSave();return true
}
addLearningCountdown=function(title,date,kind,note,endDate=''){
  title=String(title||'').trim();date=String(date||'').trim();endDate=String(endDate||'').trim();
  if(!title){alert('先写一个考试 / 考证名称。');return}
  if(!v150DateOk(date)){alert('请选择开始日期。');return}
  if(endDate&&(!v150DateOk(endDate)||endDate<date)){alert('结束日期不能早于开始日期。');return}
  if((LS.countdowns||[]).some(x=>x.title===title&&x.date===date)){alert('这个倒数日已经存在。');return}
  LS.countdowns.push({id:uuid(),title,date,endDate:endDate||'',kind:String(kind||'考试'),note:String(note||'').trim(),createdAt:new Date().toISOString()});learningSave();renderLearningAll()
};

function energyFor(k=learningTodayKey()){return LS.energy[k]||'normal'}
function setEnergy(mode,k=learningTodayKey()){LS.energy[k]=mode;learningSave();renderLearningAll()}
function energyLabel(mode){return mode==='high'?'高能量':mode==='low'?'低负荷':'标准'}
function energyPlan(mode){return mode==='low'?{focus:25,shortBreak:5,longBreak:15}:{focus:50,shortBreak:10,longBreak:20}}
function secHuman(sec){sec=Math.max(0,Math.round(sec||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);return h?`${h}小时${m?`${m}分`:''}`:`${m}分钟`}
function timeClock(sec){sec=Math.max(0,Math.floor(sec||0));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?`${pad(h)}:${pad(m)}:${pad(s)}`:`${pad(m)}:${pad(s)}`}
function studyWeekRange(){const a=startOfWeek(learningTodayDate()),b=endOfWeek(learningTodayDate());return [fmt(a),fmt(b)]}
function sessionDate(s){return beijingDateKey(s.startAt||s.endAt||'')}
function studySessionsBetween(a,b){return (LS.studyTimer.sessions||[]).filter(x=>{const k=sessionDate(x);return k>=a&&k<=b})}
function studySecondsBetween(a,b,subject=''){return studySessionsBetween(a,b).filter(x=>!subject||x.subject===subject).reduce((sum,x)=>sum+Number(x.focusSeconds||0),0)}
function todayStudySeconds(subject=''){const k=learningTodayKey();return studySecondsBetween(k,k,subject)+(LS.studyTimer.active&&(!subject||LS.studyTimer.active.subject===subject)?activeStudyFocusSeconds():0)}
function weekStudySeconds(subject=''){const[a,b]=studyWeekRange();return studySecondsBetween(a,b,subject)+(LS.studyTimer.active&&(!subject||LS.studyTimer.active.subject===subject)&&learningTodayKey()>=a&&learningTodayKey()<=b?activeStudyFocusSeconds():0)}
function monthStudySeconds(subject=''){const d=learningTodayDate(),a=`${d.getFullYear()}-${pad(d.getMonth()+1)}-01`,b=fmt(new Date(d.getFullYear(),d.getMonth()+1,0,12));return studySecondsBetween(a,b,subject)+(LS.studyTimer.active&&(!subject||LS.studyTimer.active.subject===subject)?activeStudyFocusSeconds():0)}
function activeStudyFocusSeconds(){const a=LS.studyTimer.active;if(!a)return 0;let total=Number(a.focusAccumSec||0);if(a.phase==='focus')total+=Math.max(0,Math.floor((Date.now()-Date.parse(a.phaseStartedAt))/1000));return total}
function currentPhaseSeconds(){const a=LS.studyTimer.active;if(!a)return 0;return Math.max(0,Math.floor((Date.now()-Date.parse(a.phaseStartedAt))/1000))}
function learningDeviceId(){let id='';try{id=localStorage.getItem('zx_learningDeviceId')||'';if(!id){id='dev-'+uuid();localStorage.setItem('zx_learningDeviceId',id)}}catch{id='dev-unknown'}return id}
function persistLearningState(){S.s('learningState',LS);renderLearningOverview();renderLearningMini();renderCal()}
function startStudy(subject,energy,note=''){
  if(LS.studyTimer.active){alert('已经有一段学习正在进行，请先结束当前学习。');return}
  if(!STUDY_SUBJECTS.includes(subject))subject='其他';
  const nowIso=new Date().toISOString();LS.studyTimer.active={id:uuid(),subject,energy:energy||energyFor(),note:String(note||'').trim(),sessionStartedAt:nowIso,phase:'focus',phaseStartedAt:nowIso,focusAccumSec:0,breakAccumSec:0,blocksCompleted:0,blocksSinceLong:0,lastEyeMark:0};persistLearningState();renderLearningAll();studyTimerTick()
}
function v150Notify(title,body){try{if('Notification'in window&&Notification.permission==='granted')new Notification(title,{body})}catch{}}
function completeFocusBlock(){const a=LS.studyTimer.active;if(!a||a.phase!=='focus')return;const p=energyPlan(a.energy);a.focusAccumSec=Number(a.focusAccumSec||0)+p.focus*60;a.blocksCompleted=Number(a.blocksCompleted||0)+1;a.blocksSinceLong=Number(a.blocksSinceLong||0)+1;a.phase='break_due';a.phaseStartedAt=new Date().toISOString();a.lastEyeMark=0;persistLearningState();v150Notify('本轮学习完成',`已专注 ${p.focus} 分钟，建议离开屏幕休息。`);renderLearningPanel()}
function startStudyBreak(){const a=LS.studyTimer.active;if(!a)return;if(a.phase==='focus'){a.focusAccumSec=Number(a.focusAccumSec||0)+currentPhaseSeconds();a.blocksCompleted=Number(a.blocksCompleted||0)+1;a.blocksSinceLong=Number(a.blocksSinceLong||0)+1}a.phase='break';a.phaseStartedAt=new Date().toISOString();a.focusDueNotified=false;persistLearningState();renderLearningPanel()}
function skipBreakAndContinue(){const a=LS.studyTimer.active;if(!a)return;if(a.phase==='focus'){a.focusAccumSec=Number(a.focusAccumSec||0)+currentPhaseSeconds();a.blocksCompleted=Number(a.blocksCompleted||0)+1;a.blocksSinceLong=Number(a.blocksSinceLong||0)+1}if(a.blocksSinceLong>=2)a.blocksSinceLong=0;a.phase='focus';a.phaseStartedAt=new Date().toISOString();a.lastEyeMark=0;a.focusDueNotified=false;persistLearningState();renderLearningPanel()}
function startNextFocus(){const a=LS.studyTimer.active;if(!a)return;if(a.blocksSinceLong>=2)a.blocksSinceLong=0;a.phase='focus';a.phaseStartedAt=new Date().toISOString();a.lastEyeMark=0;a.focusDueNotified=false;persistLearningState();renderLearningPanel()}
function finishStudy(){const a=LS.studyTimer.active;if(!a)return;let focus=Number(a.focusAccumSec||0),br=Number(a.breakAccumSec||0);if(a.phase==='focus')focus+=Math.max(0,Math.floor((Date.now()-Date.parse(a.phaseStartedAt))/1000));else if(a.phase==='break')br+=currentPhaseSeconds()
  LS.studyTimer.sessions.push({id:a.id,deviceId:learningDeviceId(),subject:a.subject,energy:a.energy,note:a.note,startAt:a.sessionStartedAt,endAt:new Date().toISOString(),focusSeconds:focus,breakSeconds:br,blocks:a.blocksCompleted||0,recordedAt:new Date().toISOString()});LS.studyTimer.active=null;persistLearningState();renderLearningAll()
}
function removeStudySession(id){if(!confirm('删除这条学习计时记录？'))return;LS.studyTimer.sessions=LS.studyTimer.sessions.filter(x=>x.id!==id);if(!Array.isArray(LS.studyTimer.deletedSessionIds))LS.studyTimer.deletedSessionIds=[];if(!LS.studyTimer.deletedSessionIds.includes(id))LS.studyTimer.deletedSessionIds.push(id);persistLearningState();renderLearningAll()}
function studyTimerTick(){
  const a=LS.studyTimer.active;if(!a){updateTimerDOM();return}
  const p=energyPlan(a.energy),elapsed=currentPhaseSeconds();
  if(a.phase==='focus'){
    const eyeMark=Math.floor(elapsed/(20*60));if(eyeMark>Number(a.lastEyeMark||0)){a.lastEyeMark=eyeMark;S.s('learningState',LS);v150Notify('看远 20 秒', '把视线移到约 6 米外，让眼睛和身体短暂放松。')}
    if(elapsed>=p.focus*60&&!a.focusDueNotified){a.focusDueNotified=true;S.s('learningState',LS);v150Notify('到建议休息点了',`已经专注 ${p.focus} 分钟。可以把这一小段收尾后离屏休息。`);renderLearningPanel();return}
  }else if(a.phase==='break'){
    const breakMin=a.blocksSinceLong>=2?p.longBreak:p.shortBreak;
    if(elapsed>=breakMin*60){a.breakAccumSec=Number(a.breakAccumSec||0)+breakMin*60;a.phase='ready';a.phaseStartedAt=new Date().toISOString();S.s('learningState',LS);v150Notify('休息结束', '如果状态合适，可以开始下一轮。');renderLearningPanel();return}
  }
  updateTimerDOM()
}
function updateTimerDOM(){
  const c=$('#liveTimerClock'),ph=$('#liveTimerPhase'),hi=$('#liveTimerHint');if(!c)return;const a=LS.studyTimer.active;
  if(!a){c.textContent='00:00';if(ph)ph.textContent='尚未开始';if(hi)hi.textContent='选择科目后开始计时。';return}
  const p=energyPlan(a.energy),elapsed=currentPhaseSeconds();
  if(a.phase==='focus'){const left=p.focus*60-elapsed;c.textContent=left>=0?timeClock(left):`+${timeClock(Math.abs(left))}`;ph.textContent=left>=0?`${a.subject} · 专注中 · 第 ${(a.blocksCompleted||0)+1} 轮`:`${a.subject} · 已到建议休息点`;const nextEye=20*60-(elapsed%(20*60));hi.textContent=left>=0?`本轮建议 ${p.focus} 分钟 · 约 ${timeClock(nextEye)} 后看远 20 秒 · 已累计 ${secHuman(activeStudyFocusSeconds())}`:`已超过建议专注时长 ${secHuman(Math.abs(left))}；学习时间仍会如实记录，收尾后建议离屏休息。`}
  else if(a.phase==='break_due'){c.textContent='00:00';ph.textContent='本轮完成 · 该休息了';hi.textContent=`建议 ${a.blocksSinceLong>=2?p.longBreak:p.shortBreak} 分钟离屏休息。`}
  else if(a.phase==='break'){const mins=a.blocksSinceLong>=2?p.longBreak:p.shortBreak;c.textContent=timeClock(Math.max(0,mins*60-elapsed));ph.textContent='休息中';hi.textContent='离开屏幕、起身走动、补水。'}
  else{c.textContent='00:00';ph.textContent='休息完成';hi.textContent='状态合适再开始下一轮，不必为了计时强撑。'}
}
setInterval(studyTimerTick,1000);

function reviewKey(track,id,offset){return `${track}:${id}:${offset}`}
function spacedReviewSources(){
  const out=[],settings=LS.spacedReviews.settings||{};
  if(settings.finance!==false)FINANCE_EXEC_ORDER.forEach(id=>{const v=LS.finance.completions[String(id)],k=learningEntryDate(v);if(k){const x=financeItem(id);out.push({track:'财经',trackKey:'finance',id:String(id),completed:k,title:`${x?.subject||'财经'} · ${x?.title||`原 Day ${id}`}`})}});
  if(settings.math!==false)for(let id=1;id<=48;id++){const v=LS.math.completions[String(id)],k=learningEntryDate(v);if(k)out.push({track:'高数',trackKey:'math',id:String(id),completed:k,title:`高数 Day ${id}`})}
  if(settings.skills!==false)ENGLISH_SKILLS.forEach(x=>{const v=LS.english.skills[String(x.id)],k=learningEntryDate(v);if(k)out.push({track:'四级技巧',trackKey:'skills',id:String(x.id),completed:k,title:`${x.module} · ${x.title}`})});
  return out
}
function spacedReviewItems(){const out=[];for(const src of spacedReviewSources())for(const off of REVIEW_OFFSETS){const key=reviewKey(src.trackKey,src.id,off),due=addDaysKey(src.completed,off),done=LS.spacedReviews.done[key];out.push({...src,offset:off,key,due,done})}return out.sort((a,b)=>a.due.localeCompare(b.due))}
function dueReviews(){const k=learningTodayKey();return spacedReviewItems().filter(x=>x.due<=k&&!x.done)}
function upcomingReviews(limit=12){const k=learningTodayKey();return spacedReviewItems().filter(x=>x.due>k&&!x.done).slice(0,limit)}
function markReviewDone(key){LS.spacedReviews.done[key]={date:learningTodayKey(),at:new Date().toISOString()};persistLearningState();renderLearningAll()}
function setReviewSetting(name,val){LS.spacedReviews.settings[name]=!!val;persistLearningState();renderLearningAll()}

function renderLearningTimer(){
  const e=$('#learningPanel'),a=LS.studyTimer.active,mode=energyFor(),p=energyPlan(a?.energy||mode),todayTotal=todayStudySeconds();
  const controls=a?`<div class="timer-controls">${a.phase==='focus'&&a.focusDueNotified?`<button class="btn primary" id="startBreakBtn">开始休息</button><button class="btn" id="skipBreakBtn">继续下一轮</button>`:a.phase==='break_due'?`<button class="btn primary" id="startBreakBtn">开始休息</button><button class="btn" id="skipBreakBtn">继续下一轮</button>`:a.phase==='ready'?`<button class="btn primary" id="nextFocusBtn">开始下一轮</button>`:''}<button class="btn learning-danger-btn" id="finishStudyBtn">结束学习</button></div>`:'';
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>学习计时</h4><div class="learning-source-note">只累计“专注阶段”，休息不计入学习时长；关闭页面后重新打开也能恢复当前阶段。</div></div><span class="learning-chip green">今天 ${secHuman(todayTotal)}</span></div>${!a?`<div class="timer-start-grid" style="margin-top:10px"><select id="studySubject">${STUDY_SUBJECTS.map(x=>`<option>${x}</option>`).join('')}</select><select id="studyEnergy"><option value="normal" ${mode==='normal'?'selected':''}>标准 · 50/10</option><option value="high" ${mode==='high'?'selected':''}>高能量 · 50/10</option><option value="low" ${mode==='low'?'selected':''}>低负荷 · 25/5</option></select><input id="studyNote" type="text" name="study_note_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="可选：今天具体学什么"><button class="btn primary" id="startStudyBtn">开始学习</button></div>`:''}</div>
  <div class="timer-shell"><div class="timer-face"><div class="timer-subject">${a?`${esc(a.subject)} · ${energyLabel(a.energy)}`:'科学学习节奏'}</div><div class="timer-clock" id="liveTimerClock">00:00</div><div class="timer-phase" id="liveTimerPhase">${a?'准备中':'尚未开始'}</div><div class="timer-hint" id="liveTimerHint"></div>${controls}</div><div class="learning-section-card"><h4>默认节奏</h4><div class="eye-rule"><div><b>50 分钟专注</b><small>标准 / 高能量模式。低负荷模式自动改为 25 分钟。</small></div><div><b>10 分钟离屏</b><small>每两轮后给 20 分钟长休息；低负荷为 5 / 15 分钟。</small></div><div><b>20-20-20 护眼</b><small>每 20 分钟看约 6 米外至少 20 秒，不计为正式休息。</small></div></div><div class="learning-source-note" style="margin-top:9px">没有一个对所有人都“唯一最科学”的番茄时长。这里采用 50/10 作为默认，并用短休息、长休息和 20-20-20 护眼把疲劳控制放在第一位；如果你今天已经很累，直接切换低负荷 25/5。</div></div></div>`;
  if($('#startStudyBtn'))$('#startStudyBtn').onclick=()=>startStudy($('#studySubject').value,$('#studyEnergy').value,$('#studyNote').value);
  if($('#startBreakBtn'))$('#startBreakBtn').onclick=startStudyBreak;if($('#skipBreakBtn'))$('#skipBreakBtn').onclick=skipBreakAndContinue;if($('#nextFocusBtn'))$('#nextFocusBtn').onclick=startNextFocus;if($('#finishStudyBtn'))$('#finishStudyBtn').onclick=finishStudy;updateTimerDOM()
}
function renderLearningStats(){
  const e=$('#learningPanel'),[wa,wb]=studyWeekRange(),today=learningTodayKey(),sessions=[...(LS.studyTimer.sessions||[])].sort((a,b)=>String(b.endAt||'').localeCompare(String(a.endAt||''))).slice(0,30),weekTotal=weekStudySeconds();
  const cards=STUDY_SUBJECTS.map(sub=>{const sec=weekStudySeconds(sub),w=weekTotal?Math.round(sec/weekTotal*100):0;return `<div class="study-stat"><small>${sub} · 本周</small><b>${secHuman(sec)}</b><i style="--w:${w}%"></i></div>`}).join('');
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>学习时间统计</h4><div class="learning-source-note">统计的是计时器记录的真实专注时间，不把休息时间混进去；日期与时间统一按北京时间（Asia/Shanghai）显示。</div></div><span class="learning-chip blue">${wa} — ${wb}</span></div><div class="study-stat-grid" style="margin-top:10px">${cards}</div></div><div class="learning-section-card"><h4>今天 / 本周 / 本月</h4><div class="study-stat-grid"><div class="study-stat"><small>今天</small><b>${secHuman(todayStudySeconds())}</b></div><div class="study-stat"><small>本周</small><b>${secHuman(weekTotal)}</b></div><div class="study-stat"><small>本月</small><b>${secHuman(monthStudySeconds())}</b></div><div class="study-stat"><small>已记录学习段</small><b>${LS.studyTimer.sessions.length}</b></div></div></div><div class="learning-section-card"><h4>最近学习记录</h4>${sessions.length?sessions.map(x=>`<div class="study-log-row"><b>${esc(x.subject)}</b><span>${secHuman(x.focusSeconds)}</span><span>${beijingDateTimeLabel(x.startAt)}${x.note?` · ${esc(x.note)}`:''}</span><button class="x" data-study-remove="${x.id}">×</button></div>`).join(''):'<div class="learning-empty">还没有计时记录。以后每次“开始学习 → 结束学习”都会自动留下记录。</div>'}</div>`;
  document.querySelectorAll('[data-study-remove]').forEach(b=>b.onclick=()=>removeStudySession(b.dataset.studyRemove))
}
function renderSpacedReviews(){
  const e=$('#learningPanel'),due=dueReviews(),up=upcomingReviews(),settings=LS.spacedReviews.settings;
  const row=x=>`<div class="review-due ${x.due<learningTodayKey()?'overdue':''}"><div><div class="review-due-title">${esc(x.track)} · ${esc(x.title)}</div><div class="review-due-meta">第 ${x.offset} 天复习 · 应复习 ${x.due}${x.due<learningTodayKey()?' · 已顺延到今天':''}</div></div><button class="btn" data-review-done="${x.key}">完成复习</button></div>`;
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>间隔复习</h4><div class="learning-source-note">完成正式学习后自动生成 +1、+3、+7、+14、+30 天复习。逾期不会消失，只会进入“待复习”。</div></div><span class="learning-chip ${due.length?'orange':'green'}">待复习 ${due.length}</span></div><div class="learning-row" style="margin-top:9px"><label class="check"><input id="revFinance" type="checkbox" ${settings.finance!==false?'checked':''}>财经</label><label class="check"><input id="revMath" type="checkbox" ${settings.math!==false?'checked':''}>高数</label><label class="check"><input id="revSkills" type="checkbox" ${settings.skills!==false?'checked':''}>四级技巧</label></div><div class="learning-source-note">英语单词不额外套这套算法：你已经有“早晚复习昨日 + 周一总复习”，避免重复堆任务。</div></div><div class="learning-section-card"><h4>今天应复习</h4>${due.length?due.map(row).join(''):'<div class="learning-empty">今天没有到期复习，放心推进新内容。</div>'}</div><div class="learning-section-card"><h4>接下来</h4>${up.length?up.map(x=>`<div class="learning-mini-line"><b>${x.due}</b> · ${esc(x.track)} · ${esc(x.title)} · 第${x.offset}天</div>`).join(''):'<div class="learning-empty">暂无未来复习任务。</div>'}</div>`;
  $('#revFinance').onchange=x=>setReviewSetting('finance',x.target.checked);$('#revMath').onchange=x=>setReviewSetting('math',x.target.checked);$('#revSkills').onchange=x=>setReviewSetting('skills',x.target.checked);document.querySelectorAll('[data-review-done]').forEach(b=>b.onclick=()=>markReviewDone(b.dataset.reviewDone))
}
function renderRoadmap(){
  const e=$('#learningPanel'),events=learningAllCountdowns(),years=[2026,2027,2028,2029];
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>2026—2029 年度路线图</h4><div class="learning-source-note">路线图直接读取“倒数日”，所以预测日期以后修改一次，这里、月历和今日学习会一起更新。</div></div><button class="btn" id="roadmapEditDates">管理日期</button></div></div><div class="roadmap">${years.map(y=>{const theme=ROADMAP_THEMES[y]||['阶段',''],arr=events.filter(x=>Number(x.date.slice(0,4))===y);return `<div class="roadmap-year"><div class="roadmap-year-label">${y}</div><div class="roadmap-card"><div class="roadmap-theme">${theme[0]}</div><div class="roadmap-note">${theme[1]}</div>${arr.length?arr.map(x=>`<div class="roadmap-event"><div><b>${esc(x.title)}</b><small>${esc(x.kind)} · ${countdownLabel(x)}${x.note?` · ${esc(x.note)}`:''}</small></div><span class="learning-chip ${x.date>=learningTodayKey()?'blue':''}">${learningCountdownText(x.date,x.endDate)}</span></div>`).join(''):'<div class="learning-empty">这一年暂时没有固定考试节点。</div>'}</div></div>`}).join('')}</div><div class="defer-note" style="margin-top:10px">暂缓但已保留在开发路线：薄弱点 / 错题系统、完整“人生事件”时间轴、根据长期数据自动调整学习强度的更高级推荐。等现有学习数据积累起来再做，会比现在空建一个壳更有价值。</div>`;
  $('#roadmapEditDates').onclick=()=>{activeLearningTab='countdowns';renderLearningAll()}
}


/* ===== V1.5.1 学习燃尽 ===== */
const BURNDOWN_TRACKS={
  english1:{label:'英语词汇 · 第一轮',short:'英语一轮',total:45,start:'2026-10-13',unit:'Lesson',map:()=>LS.english.round1},
  english2:{label:'英语词汇 · 第二轮',short:'英语二轮',total:45,start:()=>burndownRound2Start(),unit:'Lesson',map:()=>LS.english.round2},
  skills:{label:'英语四级 · 技巧课',short:'四级技巧',total:()=>ENGLISH_SKILLS.length,start:()=>burndownRound2Start(),unit:'节',map:()=>LS.english.skills},
  finance:{label:'财经综合 · 80任务',short:'财经',total:80,start:LEARNING_CONFIG.resumeDate,unit:'任务',map:()=>LS.finance.completions},
  math:{label:'高数 · 48计划日',short:'高数',total:48,start:LEARNING_CONFIG.resumeDate,unit:'计划日',map:()=>LS.math.completions}
};
function bdDate(v){return typeof v==='function'?v():v}
function bdNum(v){return Number(typeof v==='function'?v():v)||0}
function burndownCompletionDates(map){return Object.values(map||{}).map(learningEntryDate).filter(v150DateOk).sort()}
function burndownRound1CompletedDate(){const a=burndownCompletionDates(LS.english.round1);return a.length>=45?a[a.length-1]:''}
function burndownRound2Start(){const done=burndownRound1CompletedDate();return done?addDaysKey(done,1):''}
function burndownTarget(key){
  const saved=String(LS.burndown?.targets?.[key]||'');
  if(v150DateOk(saved))return saved;
  if((key==='english2'||key==='skills')&&englishContentDeadline())return englishContentDeadline();
  return ''
}
function burndownTrack(key){const c=BURNDOWN_TRACKS[key]||BURNDOWN_TRACKS.english1;return {...c,total:bdNum(c.total),start:bdDate(c.start),map:c.map()}}
function burndownEarliestCompletion(map){return burndownCompletionDates(map)[0]||''}
function burndownActualPoints(track,today=learningTodayKey()){
  const dates=burndownCompletionDates(track.map).filter(k=>k<=today),counts={};dates.forEach(k=>counts[k]=(counts[k]||0)+1);
  const start=track.start||burndownEarliestCompletion(track.map)||today;let rem=track.total,out=[{date:start,remaining:track.total}];
  Object.keys(counts).sort().forEach(k=>{if(k<start)return;rem=Math.max(0,rem-counts[k]);out.push({date:k,remaining:rem})});
  if(out[out.length-1].date!==today)out.push({date:today,remaining:Math.max(0,track.total-dates.length)});else out[out.length-1].remaining=Math.max(0,track.total-dates.length);
  return out
}
function burndownObservedStats(track){
  const today=learningTodayKey(),start=track.start||burndownEarliestCompletion(track.map)||today,windowStart=addDaysKey(today,-6),obsStart=start>windowStart?start:windowStart;
  const days=Math.max(1,dayDiff(parse(today),parse(obsStart))+1),recent=burndownCompletionDates(track.map).filter(k=>k>=obsStart&&k<=today).length,weekly=recent/days*7;
  return {days,recent,weekly}
}
function burndownForecast(track){
  const done=learningDoneCount(track.map),remaining=Math.max(0,track.total-done),stats=burndownObservedStats(track),today=learningTodayKey();
  if(!remaining)return {date:today,stats,confident:true};
  if(stats.recent<=0||stats.days<3)return {date:'',stats,confident:false};
  const perDay=stats.recent/stats.days,daysNeed=Math.ceil(remaining/perDay);return {date:addDaysKey(today,daysNeed),stats,confident:stats.days>=5}
}
function burndownPlannedRemaining(track,target,date=learningTodayKey()){
  if(!track.start||!v150DateOk(track.start)||!target||!v150DateOk(target)||target<=track.start)return null;
  if(date<=track.start)return track.total;if(date>=target)return 0;const totalDays=Math.max(1,dayDiff(parse(target),parse(track.start))),elapsed=Math.max(0,dayDiff(parse(date),parse(track.start)));return Math.max(0,track.total*(1-elapsed/totalDays))
}
function burndownStatus(track,target,forecast){
  const rem=Math.max(0,track.total-learningDoneCount(track.map));if(!rem)return {label:'已燃尽',cls:'green',detail:'这一阶段已经全部完成。'};
  const plan=burndownPlannedRemaining(track,target);if(plan===null)return {label:'持续推进',cls:'blue',detail:'未设置目标日，只展示真实进度与速度。'};
  if(forecast.date&&target&&forecast.date>target)return {label:'可能影响目标',cls:'red',detail:`按近7日速度，预计 ${forecast.date} 才完成。`};
  const diff=rem-plan;if(diff<=-0.75)return {label:'领先',cls:'green',detail:`比基准线约多完成 ${Math.max(1,Math.round(-diff))} ${track.unit}。`};
  if(diff>=0.75)return {label:'需要调整',cls:'orange',detail:`比基准线约少完成 ${Math.max(1,Math.round(diff))} ${track.unit}。`};
  return {label:'正常',cls:'blue',detail:'实际进度基本贴着基准线。'}
}
function burndownSvg(track,target,forecast){
  const today=learningTodayKey(),start=track.start||burndownEarliestCompletion(track.map)||today,actual=burndownActualPoints(track,today);let end=today;
  for(const k of [target,forecast.date])if(v150DateOk(k)&&k>end)end=k;
  if(dayDiff(parse(end),parse(start))<7)end=addDaysKey(start,7);if(dayDiff(parse(end),parse(start))>365)end=addDaysKey(start,365);
  const W=760,H=300,L=54,R=18,T=18,B=42,plotW=W-L-R,plotH=H-T-B,totalDays=Math.max(1,dayDiff(parse(end),parse(start))),maxY=Math.max(1,track.total);
  const x=k=>L+Math.max(0,Math.min(totalDays,dayDiff(parse(k),parse(start))))/totalDays*plotW,y=v=>T+(1-Math.max(0,Math.min(maxY,v))/maxY)*plotH;
  const poly=pts=>pts.map(p=>`${x(p.date).toFixed(1)},${y(p.remaining).toFixed(1)}`).join(' ');
  const grid=[0,.25,.5,.75,1].map(f=>{const yy=y(maxY*f),val=Math.round(maxY*f);return `<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="#ece6e1" stroke-width="1"/><text x="${L-9}" y="${yy+3}" text-anchor="end" font-size="10" fill="#8d837c">${val}</text>`}).join('');
  let base='';if(target&&v150DateOk(target)&&target>start)base=`<line x1="${x(start)}" y1="${y(track.total)}" x2="${x(target)}" y2="${y(0)}" stroke="#b8b0aa" stroke-width="2"/>`;
  const actualLine=actual.length>1?`<polyline points="${poly(actual)}" fill="none" stroke="#6ea98d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`:'';
  const actualDots=actual.slice(1).map(p=>`<circle cx="${x(p.date)}" cy="${y(p.remaining)}" r="3" fill="#6ea98d"/>`).join('');
  let forecastLine='';if(forecast.date&&v150DateOk(forecast.date)&&forecast.date>=today)forecastLine=`<line x1="${x(today)}" y1="${y(Math.max(0,track.total-learningDoneCount(track.map)))}" x2="${x(forecast.date)}" y2="${y(0)}" stroke="#d99a61" stroke-width="2.5" stroke-dasharray="8 6"/>`;
  const tickDates=[start,today,target].filter(v150DateOk).filter((v,i,a)=>a.indexOf(v)===i).sort();const ticks=tickDates.map(k=>`<line x1="${x(k)}" y1="${H-B}" x2="${x(k)}" y2="${H-B+5}" stroke="#a99e97"/><text x="${x(k)}" y="${H-15}" text-anchor="middle" font-size="10" fill="#8d837c">${k.slice(5).replace('-','/')}</text>`).join('');
  return `<svg class="burndown-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(track.label)}燃尽图"><rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="transparent"/>${grid}<line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#cfc5bd"/><line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#cfc5bd"/>${base}${actualLine}${actualDots}${forecastLine}<line x1="${x(today)}" y1="${T}" x2="${x(today)}" y2="${H-B}" stroke="#d9d1ca" stroke-dasharray="3 5"/>${ticks}<text x="${L}" y="12" font-size="10" fill="#8d837c">剩余 ${esc(track.unit)}</text></svg>`
}
function setBurndownTarget(key,value){value=String(value||'');if(value&&!v150DateOk(value)){alert('请选择有效目标日期。');return}LS.burndown.targets[key]=value;persistLearningState();renderLearningAll()}
function renderLearningBurndown(){
  const e=$('#learningPanel'),key=LS.burndown.selected||'english1',track=burndownTrack(key),target=burndownTarget(key),done=learningDoneCount(track.map),remaining=Math.max(0,track.total-done),forecast=burndownForecast(track),status=burndownStatus(track,target,forecast),planned=burndownPlannedRemaining(track,target),pct=learningPct(done,track.total);
  const buttons=Object.entries(BURNDOWN_TRACKS).map(([k,v])=>`<button class="btn ${k===key?'active':''}" data-bd-track="${k}">${esc(v.short)}</button>`).join('');
  const expected=planned===null?'—':`${Math.max(0,Math.round(planned))}`;const forecastText=remaining===0?'已完成':forecast.date?forecast.date:'积累 3 天记录后预测';const speed=forecast.stats.days?`${forecast.stats.weekly.toFixed(forecast.stats.weekly>=10?0:1)} ${track.unit}/周`:'—';
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>学习燃尽 · ${esc(track.label)}</h4><div class="learning-source-note">基准线不会因为“今天很忙”自动重写；实际线只来自你的真实打勾。动态预测只看最近学习速度。</div></div><div class="burndown-status"><span class="learning-chip ${status.cls}">${status.label}</span></div></div><div class="burndown-toolbar" style="margin-top:10px">${buttons}</div></div><div class="learning-section-card"><div class="burndown-metrics"><div class="burndown-metric"><small>剩余</small><b>${remaining} / ${track.total}</b><span>已完成 ${pct}%</span></div><div class="burndown-metric"><small>基准今日应剩</small><b>${expected}</b><span>${target?`目标 ${target}`:'先设置目标日才生成基准线'}</span></div><div class="burndown-metric"><small>近7日速度</small><b>${speed}</b><span>按当前阶段真实完成记录</span></div><div class="burndown-metric"><small>动态预计完成</small><b>${forecastText}</b><span>${status.detail}</span></div></div><div class="burndown-chart-wrap">${burndownSvg(track,target,forecast)}</div><div class="burndown-legend"><span><i class="burndown-dot base"></i>固定基准线</span><span><i class="burndown-dot actual"></i>真实燃尽线</span><span><i class="burndown-dot forecast"></i>动态预测线</span></div></div><div class="learning-section-card"><h4>目标设置</h4><div class="burndown-settings"><label><span>当前项目</span><input value="${esc(track.label)}" disabled></label><label><span>目标完成日（可改 / 可留空）</span><input id="bdTargetDate" type="date" value="${target||''}"></label><button class="btn primary" id="saveBdTarget">保存目标日</button></div><div class="burndown-explain" style="margin-top:10px"><b>怎么看：</b>真实线在基准线下方＝领先；在上方＝落后。缓冲日只影响未来真实推进，不会把历史基准线“偷偷挪走”。<br><b>口径：</b>英语一/二轮按 Lesson；四级技巧按节；财经按 80 个实际执行任务；高数按 48 个机构计划日。当前版本不拿未知课时强行做“加权工作量”，避免制造假精确。</div></div>`;
  document.querySelectorAll('[data-bd-track]').forEach(b=>b.onclick=()=>{LS.burndown.selected=b.dataset.bdTrack;persistLearningState();renderLearningAll()});$('#saveBdTarget').onclick=()=>setBurndownTarget(key,$('#bdTargetDate').value)
}

/* ===== V1.5.4 学科趋势前置 + 北京时间 + 多设备学习记录修复 ===== */
function burndownInlineHtml(keys,title='进度趋势与预计完成'){
  keys=Array.isArray(keys)&&keys.length?keys:['english1'];
  let selected=String(LS.burndown?.selected||'');if(!keys.includes(selected))selected=keys[0];
  const track=burndownTrack(selected),target=burndownTarget(selected),done=learningDoneCount(track.map),remaining=Math.max(0,track.total-done),forecast=burndownForecast(track),status=burndownStatus(track,target,forecast),planned=burndownPlannedRemaining(track,target),pct=learningPct(done,track.total);
  const expected=planned===null?'—':`${Math.max(0,Math.round(planned))}`,forecastText=remaining===0?'已完成':forecast.date?forecast.date:'积累 3 天记录后预测',speed=forecast.stats.days?`${forecast.stats.weekly.toFixed(forecast.stats.weekly>=10?0:1)} ${track.unit}/周`:'—';
  const buttons=keys.length>1?`<div class="subject-burndown-tabs">${keys.map(k=>`<button class="btn ${k===selected?'active':''}" data-inline-bd-track="${k}">${esc(BURNDOWN_TRACKS[k].short)}</button>`).join('')}</div>`:'';
  return `<div class="learning-section-card"><details class="subject-burndown" open><summary><span>${esc(title)}</span><span class="learning-chip ${status.cls}">${status.label}</span></summary><div class="subject-burndown-body">${buttons}<div class="burndown-metrics"><div class="burndown-metric"><small>剩余</small><b>${remaining} / ${track.total}</b><span>已完成 ${pct}%</span></div><div class="burndown-metric"><small>基准今日应剩</small><b>${expected}</b><span>${target?`目标 ${target}`:'未设置目标日'}</span></div><div class="burndown-metric"><small>近7日速度</small><b>${speed}</b><span>只看真实完成记录</span></div><div class="burndown-metric"><small>预计完成</small><b>${forecastText}</b><span>${status.detail}</span></div></div><div class="burndown-chart-wrap">${burndownSvg(track,target,forecast)}</div><div class="burndown-legend"><span><i class="burndown-dot base"></i>固定基准</span><span><i class="burndown-dot actual"></i>真实进度</span><span><i class="burndown-dot forecast"></i>动态预测</span></div><div class="burndown-settings"><label><span>目标完成日（可留空）</span><input id="inlineBdTargetDate" type="date" value="${target||''}"></label><button class="btn primary" id="saveInlineBdTarget">保存目标日</button></div></div></details></div>`
}
function bindInlineBurndown(keys){
  keys=Array.isArray(keys)&&keys.length?keys:['english1'];let selected=String(LS.burndown?.selected||'');if(!keys.includes(selected))selected=keys[0];
  document.querySelectorAll('[data-inline-bd-track]').forEach(b=>b.onclick=()=>{LS.burndown.selected=b.dataset.inlineBdTrack;persistLearningState();renderLearningAll()});
  const save=$('#saveInlineBdTarget');if(save)save.onclick=()=>setBurndownTarget(selected,$('#inlineBdTargetDate').value)
}
function appendSubjectBurndown(keys,title){const e=$('#learningPanel');if(!e)return;e.insertAdjacentHTML('afterbegin',burndownInlineHtml(keys,title));bindInlineBurndown(keys)}

function studyLedger(raw){const st=raw?.learningState?.studyTimer||raw?.studyTimer||{};return {sessions:Array.isArray(st.sessions)?st.sessions:[],deleted:Array.isArray(st.deletedSessionIds)?st.deletedSessionIds:[]}}
function mergeStudyLedger(localSessions,localDeleted,remoteSessions,remoteDeleted){
  const deleted=new Set([...(localDeleted||[]),...(remoteDeleted||[])]),byId=new Map();
  for(const x of [...(remoteSessions||[]),...(localSessions||[])]){if(!x||!x.id||deleted.has(x.id))continue;const prev=byId.get(x.id);if(!prev||String(x.recordedAt||x.endAt||'')>=String(prev.recordedAt||prev.endAt||''))byId.set(x.id,x)}
  let sessions=[...byId.values()];
  const recoveries=sessions.filter(x=>x?.recoveryKey);
  for(const rec of recoveries){
    const twin=sessions.find(x=>x!==rec&&!x?.recoveryKey&&x.subject===rec.subject&&sessionDate(x)===sessionDate(rec)&&Math.abs(Number(x.focusSeconds||0)-Number(rec.focusSeconds||0))<=120&&Math.abs(Date.parse(x.startAt||0)-Date.parse(rec.startAt||0))<=20*60*1000);
    if(twin)sessions=sessions.filter(x=>x!==rec)
  }
  return {sessions:sessions.sort((a,b)=>String(a.startAt||'').localeCompare(String(b.startAt||''))),deletedSessionIds:[...deleted].slice(-1000)}
}
function mergeRemoteStudyLedgerIntoLocal(remotePayload,{persist=true}={}){
  const remote=studyLedger(remotePayload),local=mergeStudyLedger(LS.studyTimer.sessions,LS.studyTimer.deletedSessionIds,remote.sessions,remote.deleted);
  const before=JSON.stringify([LS.studyTimer.sessions,LS.studyTimer.deletedSessionIds||[]]);LS.studyTimer.sessions=local.sessions;LS.studyTimer.deletedSessionIds=local.deletedSessionIds;
  const changed=before!==JSON.stringify([local.sessions,local.deletedSessionIds]);if(changed&&persist){originalSet('learningState',LS);renderLearningOverview();renderLearningMini();if($('#learningModal')?.classList.contains('show'))renderLearningPanel()}return changed
}
function stableCloneWithoutStudyLedger(payload){
  const x=JSON.parse(JSON.stringify(payload||{}));delete x.savedAt;delete x.version;if(x.learningState){delete x.learningState.version}if(x.learningState?.studyTimer){x.learningState.studyTimer.sessions=[];x.learningState.studyTimer.deletedSessionIds=[];x.learningState.studyTimer.active=null}return x
}
function stableStringify(v){if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(stableStringify).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stableStringify(v[k])).join(',')+'}'}
function studyOnlyDifference(localPayload,remotePayload){return stableStringify(stableCloneWithoutStudyLedger(localPayload))===stableStringify(stableCloneWithoutStudyLedger(remotePayload))}

renderLearningOverview=function(){
  if(!$('#learnEnglishMetric'))return;const r1=learningDoneCount(LS.english.round1),r2=learningDoneCount(LS.english.round2),sk=learningDoneCount(LS.english.skills);
  if(!englishRound1Complete()){$('#learnEnglishMetric').textContent=`${r1} / 45`;$('#learnEnglishBar').style.width=`${learningPct(r1,45)}%`;$('#learnEnglishNote').textContent=`词汇第一轮 · 下一个 Lesson ${nextNumber(45,LS.english.round1)||'—'}`}else{const done=r2+sk,total=45+ENGLISH_SKILLS.length;$('#learnEnglishMetric').textContent=`${done} / ${total}`;$('#learnEnglishBar').style.width=`${learningPct(done,total)}%`;$('#learnEnglishNote').textContent=`第二轮 ${r2}/45 · 技巧 ${sk}/${ENGLISH_SKILLS.length}`}
  const f=learningDoneCount(LS.finance.completions),m=learningDoneCount(LS.math.completions);$('#learnFinanceMetric').textContent=`${f} / 80`;$('#learnFinanceBar').style.width=`${learningPct(f,80)}%`;const fd=nextFinanceDay(),fp=fd?financePhaseByPosition(financeExecPosition(fd)):null;$('#learnFinanceNote').textContent=fd?`${fp.name} · 下一项原 Day ${fd}`:'80 天全部完成';$('#learnMathMetric').textContent=`${m} / 48`;$('#learnMathBar').style.width=`${learningPct(m,48)}%`;$('#learnMathNote').textContent=nextMathDay()?`下一项 Day ${nextMathDay()}`:'48 天全部完成';
  const nearest=learningNearestCountdown();if(nearest){const left=dayDiff(parse(nearest.date),learningTodayDate());$('#learnCountdownMetric').textContent=left>0?`还有 ${left} 天`:left===0?'今天':(nearest.endDate&&nearest.endDate>=learningTodayKey()?'进行中':'已结束');$('#learnCountdownNote').textContent=`${nearest.title} · ${countdownLabel(nearest)} · ${nearest.kind}`;const horizon=60;$('#learnCountdownBar').style.width=`${left<=0?100:left>=horizon?6:Math.max(6,Math.round((1-left/horizon)*100))}%`}else{$('#learnCountdownMetric').textContent='暂无';$('#learnCountdownNote').textContent='可在“倒数日”中添加';$('#learnCountdownBar').style.width='0%'}
  const w=weekStudySeconds();$('#learnStudyMetric').textContent=secHuman(w);$('#learnStudyBar').style.width=`${Math.min(100,Math.round(w/(20*3600)*100))}%`;$('#learnStudyNote').textContent=`今天 ${secHuman(todayStudySeconds())} · ${LS.studyTimer.active?'正在计时':'未开始计时'}`
};
renderLearningBanner=function(){
  const e=$('#learningBanner');if(!e)return;const k=learningTodayKey(),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),nearest=learningNearestCountdown(),mode=energyFor(k);let title=mil?'军训保护期':busy?'今天已设为缓冲日':`今日能量：${energyLabel(mode)}`;let desc=mil?'10/12—10/25：英语执行“词汇 Lesson + 技巧课”双主线；财经、高数可自愿推进但不欠账。':busy?'今天不强制推进正式队列；英语也可以主动减量，不把未完成变成债。':'英语词汇与技巧并行；提前完成就前移，临时忙就顺延。学习时间只记录真实专注。';const nearChip=nearest?`<span class="learning-chip blue">${esc(nearest.title)} · ${learningCountdownText(nearest.date,nearest.endDate)}</span>`:'';e.innerHTML=`<div><strong>${title}</strong><div class="small">${desc}</div></div><div class="learning-row">${nearChip}<button class="btn ${busy?'':'learning-danger-btn'}" id="toggleBusyToday">${busy?'恢复正常计划':'今天很忙'}</button></div>`;$('#toggleBusyToday').onclick=()=>toggleLearningBusy(k)
};
renderLearningPanel=function(){
  document.querySelectorAll('[data-learning-tab]').forEach(b=>b.classList.toggle('active',b.dataset.learningTab===activeLearningTab));
  if(activeLearningTab==='timer')renderLearningTimer();else if(activeLearningTab==='stats')renderLearningStats();else if(activeLearningTab==='review')renderSpacedReviews();else if(activeLearningTab==='roadmap')renderRoadmap();else if(activeLearningTab==='english')renderLearningEnglish();else if(activeLearningTab==='finance')renderLearningFinance();else if(activeLearningTab==='math')renderLearningMath();else if(activeLearningTab==='countdowns')renderLearningCountdowns();else if(activeLearningTab==='schedule')renderLearningSchedule();else renderLearningToday()
};
renderLearningToday=function(){
  const e=$('#learningPanel'),k=learningTodayKey(),d=learningTodayDate(),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),monday=d.getDay()===1,mode=energyFor(k),r=learningReviewFor(k),todayItems=learningCompletionItemsOnDate(k),due=dueReviews(),free=LS.freeLogs.filter(x=>x.date===k),fd=nextFinanceDay(),md=nextMathDay(),nextR1=nextNumber(45,LS.english.round1),nextR2=nextNumber(45,LS.english.round2),nextSkill=nextNumber(ENGLISH_SKILLS.length,LS.english.skills);
  const nearest=learningUpcomingCountdowns().slice(0,3);let tasks=[];
  if(monday&&!englishRound1Complete()){if(!r.weekly)tasks.push({rank:'必须',cls:'must',title:'英语 · 一周总复习',meta:'周一不默认安排新 Lesson，把本周词汇重新检索一遍。',action:'weekly'})}else if(!englishRound1Complete()&&k>=LEARNING_CONFIG.militaryStart&&nextR1)tasks.push({rank:'核心',cls:'core',title:`英语一轮 · Lesson ${nextR1}`,meta:'完成后如果这一节短、状态好，可以继续下一 Lesson。',action:'r1'});else if(englishRound1Complete()){if(nextR2)tasks.push({rank:'核心',cls:'core',title:`英语二轮 · Lesson ${nextR2}`,meta:'正式二轮，从 0/40 独立重新推进。',action:'r2'});if(nextSkill)tasks.push({rank:'核心',cls:'core',title:`四级技巧 · 第 ${nextSkill} 节`,meta:'与二轮同步，不提前占用一轮词汇时间。',action:'skill'})}
  if(!mil&&!busy&&isResumeOrLaterKey(k)){if(fd)tasks.push({rank:mode==='low'?'可后移':'核心',cls:mode==='low'?'extra':'core',title:`财经 · 原 Day ${fd}`,meta:`${financeItem(fd)?.subject||''} · ${financeItem(fd)?.title||''}`,action:'finance'});if(md&&(mode==='high'||mode==='normal'))tasks.push({rank:mode==='high'?'核心':'建议',cls:mode==='high'?'core':'extra',title:`高数 · Day ${md}`,meta:`${mathItem(md)?.lectures?.length||0} 个视频 · ${durationHuman(mathDayDuration(mathItem(md)))}`,action:'math'})}
  if(busy)tasks=tasks.filter(x=>x.action==='weekly'||x.action==='r1'||x.action==='r2');if(mil)tasks=tasks.filter(x=>['weekly','r1','r2','skill'].includes(x.action));if(!tasks.length)tasks.push({rank:'完成',cls:'extra',title:'今天没有必须推进的新内容',meta:'可以做复习、计时学习，或者直接休息。',action:''});
  const taskHtml=tasks.map((x,i)=>`<div class="cockpit-task ${x.cls}"><span class="rank">${x.rank}</span><div><div class="cockpit-task-title">${esc(x.title)}</div><div class="cockpit-task-meta">${esc(x.meta)}</div></div>${x.action?`<button class="btn" data-cockpit-action="${x.action}">完成</button>`:''}</div>`).join('');
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>今日学习 · ${k} · 周${wd(d)}</h4><div class="learning-source-note">状态决定“建议强度”，不会改掉你的正式学习记录。</div></div><span class="learning-chip ${mil?'orange':busy?'red':'green'}">${mil?'军训':busy?'缓冲':'正常'}</span></div><div class="energy-switch" style="margin-top:9px"><button class="btn ${mode==='high'?'active':''}" data-energy="high">高能量</button><button class="btn ${mode==='normal'?'active':''}" data-energy="normal">标准</button><button class="btn ${mode==='low'?'active':''}" data-energy="low">低负荷</button></div></div><div class="cockpit-grid"><div class="cockpit-stack"><div class="learning-section-card"><div class="learning-row spread"><h4>今天先做什么</h4><span class="learning-chip">${energyLabel(mode)}模式</span></div>${taskHtml}</div><div class="learning-section-card"><div class="learning-row spread"><h4>固定词汇复习</h4><span class="learning-chip">早晚 + 周一</span></div><div class="learning-review-grid"><label class="learning-review-check"><input type="checkbox" id="reviewMorning" ${r.morning?'checked':''}><span><b>早上复习昨日词汇</b><small>快速主动回忆。</small></span></label><label class="learning-review-check"><input type="checkbox" id="reviewEvening" ${r.evening?'checked':''}><span><b>晚上复习昨日词汇</b><small>睡前检索卡壳词。</small></span></label><label class="learning-review-check" style="${monday?'':'opacity:.48'}"><input type="checkbox" id="reviewWeekly" ${r.weekly?'checked':''} ${monday?'':'disabled'}><span><b>周一一周总复习</b><small>${monday?'今天执行。':'仅周一开启。'}</small></span></label></div></div><div class="learning-section-card"><div class="learning-row spread"><h4>到期复习</h4><button class="btn" id="openReviewToday">查看复习</button></div>${due.length?due.slice(0,4).map(x=>`<div class="learning-mini-line"><b>${esc(x.track)}</b> · ${esc(x.title)} · 第${x.offset}天</div>`).join(''):'<div class="learning-empty">今天没有自动到期复习。</div>'}</div></div><div class="cockpit-stack"><div class="learning-section-card"><div class="learning-row spread"><h4>专注计时</h4><button class="btn primary" id="openTimerToday">${LS.studyTimer.active?'查看计时':'开始学习'}</button></div><div class="learning-big-next">今天 ${secHuman(todayStudySeconds())}</div><div class="learning-source-note">本周 ${secHuman(weekStudySeconds())} · ${LS.studyTimer.active?`正在学习 ${esc(LS.studyTimer.active.subject)}`:'当前未计时'}</div></div><div class="learning-section-card"><div class="learning-row spread"><h4>近期考试 / 考证</h4><button class="btn" id="openCountdownsToday">管理</button></div>${nearest.length?nearest.map(x=>`<div class="learning-mini-line"><b>${esc(x.title)}</b> · ${countdownLabel(x)} · ${learningCountdownText(x.date,x.endDate)}</div>`).join(''):'<div class="learning-empty">暂无倒数日。</div>'}</div><div class="learning-section-card"><h4>自主学习记录</h4><div class="learning-free-row"><select id="freeTrack"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select><input id="freeText" type="text" name="free_learning_note_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="不推进正式队列的额外学习"><button class="btn" id="addFreeLog">记录</button></div>${free.length?free.map(x=>`<div class="learning-free-log"><span>${esc(x.track)} · ${esc(x.text)}</span><button class="x" data-free-id="${x.id}">×</button></div>`).join(''):'<div class="learning-empty">今天还没有自主学习记录。</div>'}</div><div class="learning-section-card"><h4>今天已经完成</h4>${todayItems.length?todayItems.map(x=>`<div class="learning-mini-line">✓ ${esc(x)}</div>`).join(''):'<div class="learning-empty">正式学习项目还没有打勾。</div>'}</div></div></div>`;
  document.querySelectorAll('[data-energy]').forEach(b=>b.onclick=()=>setEnergy(b.dataset.energy,k));$('#reviewMorning').onchange=x=>setLearningReview('morning',x.target.checked,k);$('#reviewEvening').onchange=x=>setLearningReview('evening',x.target.checked,k);if(monday)$('#reviewWeekly').onchange=x=>setLearningReview('weekly',x.target.checked,k);
  document.querySelectorAll('[data-cockpit-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.cockpitAction;if(a==='weekly'){setLearningReview('weekly',true,k)}else if(a==='r1')learningMark(LS.english.round1,nextNumber(45,LS.english.round1),true,k);else if(a==='r2')learningMark(LS.english.round2,nextNumber(45,LS.english.round2),true,k);else if(a==='skill')learningMark(LS.english.skills,nextNumber(ENGLISH_SKILLS.length,LS.english.skills),true,k);else if(a==='finance')learningMark(LS.finance.completions,nextFinanceDay(),true,k);else if(a==='math')learningMark(LS.math.completions,nextMathDay(),true,k);renderLearningAll()});
  $('#openTimerToday').onclick=()=>{activeLearningTab='timer';renderLearningAll()};$('#openReviewToday').onclick=()=>{activeLearningTab='review';renderLearningAll()};$('#openCountdownsToday').onclick=()=>{activeLearningTab='countdowns';renderLearningAll()};$('#addFreeLog').onclick=()=>addFreeLearningLog($('#freeTrack').value,$('#freeText').value,k);document.querySelectorAll('[data-free-id]').forEach(b=>b.onclick=()=>removeFreeLearningLog(b.dataset.freeId))
};

let editingCountdownId='';
renderLearningCountdowns=function(){
  const e=$('#learningPanel'),today=learningTodayKey(),mine=learningAllCountdowns(),edit=editingCountdownId?mine.find(x=>x.id===editingCountdownId):null;
  const list=mine.length?mine.map(x=>{const end=x.endDate||x.date,past=end<today,n=dayDiff(parse(x.date),learningTodayDate()),cls=n===0?'today':'';return `<div class="learning-countdown-row ${past?'past':''}"><div><div class="learning-countdown-title">${esc(x.title)} <span class="learning-chip">${esc(x.kind||'考试')}</span></div><div class="learning-countdown-meta">${countdownLabel(x)}${x.note?` · ${esc(x.note)}`:''}</div></div><div class="learning-countdown-days ${cls}">${learningCountdownText(x.date,x.endDate)}</div><div class="countdown-actions"><button class="btn countdown-edit" data-countdown-edit="${x.id}">编辑</button><button class="x" data-countdown-remove="${x.id}" title="删除倒数日">×</button></div></div>`}).join(''):'<div class="learning-empty">还没有倒数日。</div>';
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>${edit?'编辑倒数日':'添加考试 / 考证倒数日'}</h4><div class="learning-source-note">所有节点都由你控制：包括三级B和专转本预计窗口，也可以修改或删除。日期范围适合计算机考试、专转本“预计窗口”等情况。</div></div>${edit?'<button class="btn" id="cancelCountdownEdit">取消编辑</button>':''}</div><div class="learning-countdown-form v150"><input id="countdownTitle" type="text" name="countdown_title_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="考试 / 考证名称" value="${edit?esc(edit.title):''}"><input id="countdownDate" type="date" value="${edit?.date||today}"><input id="countdownEndDate" type="date" value="${edit?.endDate||''}" title="结束日期（可选）"><select id="countdownKind">${['考试','考证','升学考试','报名','面试','其他'].map(k=>`<option ${edit?.kind===k?'selected':''}>${k}</option>`).join('')}</select><input id="countdownNote" type="text" name="countdown_note_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="备注（可选）" value="${edit?esc(edit.note):''}"><button class="btn primary" id="saveCountdownBtn">${edit?'保存修改':'添加'}</button></div></div><div class="learning-section-card"><div class="learning-row spread"><h4>我的倒数日 · ${mine.length}</h4><span class="learning-chip blue">全部可编辑 / 删除</span></div><div class="learning-countdown-list">${list}</div></div>`;
  $('#saveCountdownBtn').onclick=()=>{if(edit){if(saveCountdownEdit(edit.id,$('#countdownTitle').value,$('#countdownDate').value,$('#countdownEndDate').value,$('#countdownKind').value,$('#countdownNote').value)){editingCountdownId='';renderLearningAll()}}else addLearningCountdown($('#countdownTitle').value,$('#countdownDate').value,$('#countdownKind').value,$('#countdownNote').value,$('#countdownEndDate').value)};
  if($('#cancelCountdownEdit'))$('#cancelCountdownEdit').onclick=()=>{editingCountdownId='';renderLearningAll()};document.querySelectorAll('[data-countdown-edit]').forEach(b=>b.onclick=()=>{editingCountdownId=b.dataset.countdownEdit;renderLearningAll()});document.querySelectorAll('[data-countdown-remove]').forEach(b=>b.onclick=()=>{editingCountdownId='';removeLearningCountdown(b.dataset.countdownRemove)})
};
renderLearningSchedule=function(){
  const e=$('#learningPanel'),busy=Object.entries(LS.busyDates).sort((a,b)=>a[0].localeCompare(b[0])),milestones=[{date:LEARNING_CONFIG.resumeDate,text:'恢复正常上课：财经 / 高数正式队列开放。'},...(LS.countdowns||[]).map(x=>({date:x.date,text:`${esc(x.title)} <span class="learning-chip">${esc(x.kind||'考试')}</span> · ${countdownLabel(x)}`}))].sort((a,b)=>a.date.localeCompare(b.date));
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><h4>计划节点</h4><button class="btn" id="scheduleEditCountdowns">编辑倒数日</button></div><div class="learning-mini-line"><b>10/12—10/25</b> · 军训保护期：财经、高数冻结；英语照常。</div>${milestones.map(x=>`<div class="learning-mini-line"><b>${x.date}</b> · ${x.text}</div>`).join('')}</div><div class="learning-section-card"><h4>添加缓冲日</h4><div class="learning-free-row"><input id="busyDateInput" type="date" value="${learningTodayKey()}"><input id="busyReasonInput" type="text" name="busy_reason_v152" autocomplete="off" autocapitalize="sentences" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="例如：志愿活动 / 普通话考试 / 临时作业"><button class="btn" id="addBusyDateBtn">设为缓冲</button></div><div class="learning-source-note" style="margin-top:6px">缓冲日不会删除任务；正式队列只是停住，恢复后继续下一项。</div><div class="learning-busy-list">${busy.length?busy.map(([k,v])=>`<div class="learning-busy-row"><b>${k}</b><span>${esc(v.reason||'临时忙')}</span><button class="x" data-busy-remove="${k}">×</button></div>`).join(''):'<div class="learning-empty">暂无手动缓冲日。</div>'}</div></div><div class="learning-section-card"><h4>调度规则</h4><div class="learning-status-box"><b>英语一轮</b>：周一总复习，周二—周日默认 1 Lesson；短课可连续学多个，队列即时前移。<br><b>英语二轮</b>：第一轮 40/40 后才独立开始，并与 38 节四级技巧课同步。<br><b>财经</b>：会计优先闭环，原 Day 编号保留。<br><b>高数</b>：保持机构 48 天顺序。<br><b>缓冲</b>：临时忙不算失败；恢复后接着下一项。<br><b>倒数日</b>：全部可编辑，不再存在不可修改的系统固定考试日期。</div></div>`;
  $('#scheduleEditCountdowns').onclick=()=>{activeLearningTab='countdowns';renderLearningAll()};$('#addBusyDateBtn').onclick=()=>addBusyDate($('#busyDateInput').value,$('#busyReasonInput').value);document.querySelectorAll('[data-busy-remove]').forEach(b=>b.onclick=()=>removeBusyDate(b.dataset.busyRemove))
};
learningCalendarTags=function(d){const k=fmt(d),tags=[],cds=learningCountdownsOnDate(k);if(cds.length)tags.push(`<span class="tag learning-countdown">⌛ ${esc(cds[0].title)}${cds.length>1?` +${cds.length-1}`:''}</span>`);if(isMilitaryKey(k))tags.push('<span class="tag learning">军训</span>');if(isLearningBusyKey(k))tags.push('<span class="tag learning-busy">缓冲</span>');const n=learningCompletionItemsOnDate(k).length;if(n)tags.push(`<span class="tag learning">学 ${n}</span>`);return tags.slice(0,2).join('')};
renderLearningMini=function(){const e=$('#learningMini');if(!e)return;const k=fmt(sel),isToday=k===learningTodayKey(),items=learningCompletionItemsOnDate(k),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),cds=learningCountdownsOnDate(k),chips=[];if(cds.length)chips.push(`<span class="learning-chip blue">⌛ ${esc(cds[0].title)}${cds.length>1?` +${cds.length-1}`:''}</span>`);if(mil)chips.push('<span class="learning-chip orange">军训保护期</span>');if(busy)chips.push('<span class="learning-chip red">缓冲日</span>');if(items.length)chips.push(`<span class="learning-chip green">完成 ${items.length} 项</span>`);if(isToday&&LS.studyTimer.active)chips.push(`<span class="learning-chip green">计时 · ${esc(LS.studyTimer.active.subject)}</span>`);let lines=cds.map(x=>`<div class="learning-mini-line"><b>${esc(x.kind||'考试')}</b> · ${esc(x.title)} · ${countdownLabel(x)}</div>`).join('');if(items.length)lines+=items.slice(0,4).map(x=>`<div class="learning-mini-line">✓ ${esc(x)}</div>`).join('')+(items.length>4?`<div class="learning-source-note">还有 ${items.length-4} 项记录。</div>`:'');if(!items.length&&isToday){const r1=nextNumber(45,LS.english.round1),fd=nextFinanceDay(),md=nextMathDay();lines+=`<div class="learning-mini-line"><b>今天专注</b> · ${secHuman(todayStudySeconds())}　<b>能量</b> · ${energyLabel(energyFor())}</div>`;if(!englishRound1Complete())lines+=`<div class="learning-mini-line"><b>英语</b> · ${sel.getDay()===1?'周一总复习':`下一项 Lesson ${r1||'—'}`}</div>`;else lines+=`<div class="learning-mini-line"><b>英语</b> · 二轮 ${learningDoneCount(LS.english.round2)}/45 · 技巧 ${learningDoneCount(LS.english.skills)}/${ENGLISH_SKILLS.length}</div>`;if(!mil&&!busy&&isResumeOrLaterKey(k))lines+=`<div class="learning-mini-line"><b>财经</b> · ${fd?`原 Day ${fd}`:'已完成'}　<b>高数</b> · ${md?`Day ${md}`:'已完成'}</div>`}else if(!items.length&&!cds.length)lines='<div class="learning-empty">动态计划不提前锁死具体 Lesson；当天根据实时进度生成。</div>';e.innerHTML=`<div class="learning-mini-status">${chips.join('')||'<span class="learning-chip">动态队列</span>'}</div>${lines}`;$('#learningMiniStat').textContent=items.length?`${items.length} 项`:''};

// 英语页中的收官日期随“英语三级B”倒数日自动变化。
const v142RenderLearningEnglish=renderLearningEnglish;
renderLearningEnglish=function(){v142RenderLearningEnglish();const deadline=englishContentDeadline();if(!deadline)return;const notes=document.querySelectorAll('#learningPanel .learning-source-note');notes.forEach(n=>{n.innerHTML=n.innerHTML.replace(/12月10日前/g,`${dateHuman(deadline)}前`).replace(/12\/11—12\/12/g,`${dateHuman(addDaysKey(deadline,1))}—${dateHuman(addDaysKey(deadline,2))}`)})};

const v152RenderEnglishBase=renderLearningEnglish, v152RenderFinanceBase=renderLearningFinance, v152RenderMathBase=renderLearningMath;
renderLearningEnglish=function(){v152RenderEnglishBase();appendSubjectBurndown(englishRound1Complete()?['english1','english2','skills']:['english1'],'英语进度趋势')};
renderLearningFinance=function(){v152RenderFinanceBase();appendSubjectBurndown(['finance'],'财经进度趋势')};

renderLearningMath=function(){v152RenderMathBase();appendSubjectBurndown(['math'],'高数进度趋势')};

/* ===== V1.5.4 词汇结构 / 计时可靠性 / 军训弹性推进 ===== */
englishRound1Complete=function(){return englishDoneCount(LS.english.round1)>=ENGLISH_LESSON_TOTAL};
englishRound2Complete=function(){return englishDoneCount(LS.english.round2)>=ENGLISH_LESSON_TOTAL};
englishRecentPace=function(map){
  const cutoff=parse(addDaysKey(learningTodayKey(),-20)),byDay={};
  englishMapValues(map).forEach(v=>{const k=learningEntryDate(v);if(!k)return;const d=parse(k);if(d>=cutoff)byDay[k]=(byDay[k]||0)+1});
  const vals=Object.values(byDay);if(!vals.length)return 1;return Math.max(.75,Math.min(3,vals.reduce((a,b)=>a+b,0)/vals.length))
};
projectEnglishRound1=function(){
  const done=englishDoneCount(LS.english.round1),rem=Math.max(0,ENGLISH_LESSON_TOTAL-done);
  if(!rem){const last=[...Array(ENGLISH_LESSON_TOTAL)].map((_,i)=>learningEntryDate(LS.english.round1[String(i+1)])).filter(Boolean).sort().pop();return {date:last||learningTodayKey(),pace:0}}
  const pace=englishRecentPace(LS.english.round1);let d=learningTodayDate(),left=rem,guard=0;if(fmt(d)<LEARNING_CONFIG.militaryStart)d=parse(LEARNING_CONFIG.militaryStart);
  while(left>0&&guard<180){const k=fmt(d);if(d.getDay()!==1&&!isLearningBusyKey(k))left-=pace;if(left>0)d.setDate(d.getDate()+1);guard++}return {date:fmt(d),pace}
};
learningCompletionItemsOnDate=function(k){
  const out=[];for(let i=1;i<=ENGLISH_LESSON_TOTAL;i++){if(learningEntryDate(LS.english.round1[String(i)])===k)out.push(`英语一轮 · ${englishLessonLabel(i)}`);if(learningEntryDate(LS.english.round2[String(i)])===k)out.push(`英语二轮 · ${englishLessonLabel(i)}`)}
  ENGLISH_SKILLS.forEach(s=>{if(learningEntryDate(LS.english.skills[String(s.id)])===k)out.push(`四级技巧 · ${s.module} ${s.id}`)});
  FINANCE_EXEC_ORDER.forEach(d=>{if(learningEntryDate(LS.finance.completions[String(d)])===k){const x=financeItem(d);out.push(`财经 · ${x?.subject||''} ${x?.title||`Day${d}`}`)}});
  for(let d=1;d<=48;d++)if(learningEntryDate(LS.math.completions[String(d)])===k)out.push(`高数 · Day ${d}`);
  if(LS.english.reviews?.[k]?.weekly)out.push('英语 · 一周总复习');LS.freeLogs.filter(x=>x.date===k).forEach(x=>out.push(`自主 · ${x.track||'学习'} ${x.text||''}`));return out
};

BURNDOWN_TRACKS.english1.total=ENGLISH_LESSON_TOTAL;BURNDOWN_TRACKS.english2.total=ENGLISH_LESSON_TOTAL;
BURNDOWN_TRACKS.english1.unit='Lesson';BURNDOWN_TRACKS.english2.unit='Lesson';
BURNDOWN_TRACKS.finance.start=()=>burndownEarliestCompletion(LS.finance.completions)||LEARNING_CONFIG.resumeDate;
BURNDOWN_TRACKS.math.start=()=>burndownEarliestCompletion(LS.math.completions)||LEARNING_CONFIG.resumeDate;
burndownRound1CompletedDate=function(){const a=burndownCompletionDates(LS.english.round1);return englishRound1Complete()?(a[a.length-1]||''):''};

function englishRoundListHtml(map,round){
  return Array.from({length:10},(_,u)=>u+1).map(unit=>{
    const arr=ENGLISH_VOCAB_LESSONS.filter(x=>x.unit===unit),doneN=arr.filter(x=>!!map[String(x.i)]).length;
    const rows=arr.map(x=>{const v=map[String(x.i)],done=!!v;return `<label class="learning-item ${done?'done':''}"><input type="checkbox" data-en-r${round}="${x.i}" ${done?'checked':''}><div><div class="learning-item-title">Unit ${x.unit} · Lesson ${x.lesson}</div><div class="learning-item-meta">${esc(x.range)} · ${durationHuman(x.seconds)}${x.parts>1?` · 分 ${x.parts} 段：${esc(x.partNames.join('；'))}`:''}${round===2?' · 二轮建议倍速 + 主动检索':''}</div></div><span class="learning-item-date">${done?esc(learningEntryDate(v)):''}</span></label>`}).join('');
    return `<div class="learning-module-title"><span>Unit ${unit}</span><span>${doneN}/4</span></div><div class="learning-item-list">${rows}</div>`
  }).join('')
}

renderLearningOverview=function(){
  if(!$('#learnEnglishMetric'))return;const r1=englishDoneCount(LS.english.round1),r2=englishDoneCount(LS.english.round2),sk=learningDoneCount(LS.english.skills),n1=nextEnglishLesson(LS.english.round1);
  if(!englishRound1Complete()){$('#learnEnglishMetric').textContent=`${r1} / ${ENGLISH_LESSON_TOTAL}`;$('#learnEnglishBar').style.width=`${learningPct(r1,ENGLISH_LESSON_TOTAL)}%`;$('#learnEnglishNote').textContent=`词汇第一轮 · ${n1?englishLessonLabel(n1):'已完成'}`}else{const done=r2+sk,total=ENGLISH_LESSON_TOTAL+ENGLISH_SKILLS.length;$('#learnEnglishMetric').textContent=`${done} / ${total}`;$('#learnEnglishBar').style.width=`${learningPct(done,total)}%`;$('#learnEnglishNote').textContent=`第二轮 ${r2}/${ENGLISH_LESSON_TOTAL} · 技巧 ${sk}/${ENGLISH_SKILLS.length}`}
  const f=learningDoneCount(LS.finance.completions),m=learningDoneCount(LS.math.completions);$('#learnFinanceMetric').textContent=`${f} / 80`;$('#learnFinanceBar').style.width=`${learningPct(f,80)}%`;const fd=nextFinanceDay(),fp=fd?financePhaseByPosition(financeExecPosition(fd)):null;$('#learnFinanceNote').textContent=fd?`${fp.name} · 下一项原 Day ${fd}`:'80 天全部完成';$('#learnMathMetric').textContent=`${m} / 48`;$('#learnMathBar').style.width=`${learningPct(m,48)}%`;$('#learnMathNote').textContent=nextMathDay()?`下一项 Day ${nextMathDay()}`:'48 天全部完成';
  const nearest=learningNearestCountdown();if(nearest){const left=dayDiff(parse(nearest.date),learningTodayDate());$('#learnCountdownMetric').textContent=left>0?`还有 ${left} 天`:left===0?'今天':(nearest.endDate&&nearest.endDate>=learningTodayKey()?'进行中':'已结束');$('#learnCountdownNote').textContent=`${nearest.title} · ${countdownLabel(nearest)} · ${nearest.kind}`;const horizon=60;$('#learnCountdownBar').style.width=`${left<=0?100:left>=horizon?6:Math.max(6,Math.round((1-left/horizon)*100))}%`}else{$('#learnCountdownMetric').textContent='暂无';$('#learnCountdownNote').textContent='可在“倒数日”中添加';$('#learnCountdownBar').style.width='0%'}
  const w=weekStudySeconds();$('#learnStudyMetric').textContent=secHuman(w);$('#learnStudyBar').style.width=`${Math.min(100,Math.round(w/(20*3600)*100))}%`;$('#learnStudyNote').textContent=`今天 ${secHuman(todayStudySeconds())} · ${LS.studyTimer.active?'正在计时':'未开始计时'}`
};
renderLearningBanner=function(){
  const e=$('#learningBanner');if(!e)return;const k=learningTodayKey(),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),nearest=learningNearestCountdown(),mode=energyFor(k);let title=mil?'军训弹性保护期':busy?'今天已设为缓冲日':`今日能量：${energyLabel(mode)}`;let desc=mil?'10/12—10/25：英语照常；高数/财经可以自愿推进正式 Day，但不设每日欠账，累了就停。':busy?'今天不强制推进正式队列；先保留最轻的复习和必要任务。':'提前完成就整体前移；临时忙就整体顺延。学习时间只记录真实专注，不用为了维持数字硬撑。';const nearChip=nearest?`<span class="learning-chip blue">${esc(nearest.title)} · ${learningCountdownText(nearest.date,nearest.endDate)}</span>`:'';e.innerHTML=`<div><strong>${title}</strong><div class="small">${desc}</div></div><div class="learning-row">${nearChip}<button class="btn ${busy?'':'learning-danger-btn'}" id="toggleBusyToday">${busy?'恢复正常计划':'今天很忙'}</button></div>`;$('#toggleBusyToday').onclick=()=>toggleLearningBusy(k)
};

renderLearningEnglish=function(){
  const e=$('#learningPanel'),r1=englishDoneCount(LS.english.round1),r2=englishDoneCount(LS.english.round2),sk=learningDoneCount(LS.english.skills),next=nextEnglishLesson(LS.english.round1),proj=projectEnglishRound1(),eligible=Math.max(1,countEligibleEnglishDays(maxDateKey(learningTodayKey(),LEARNING_CONFIG.militaryStart),LEARNING_CONFIG.round1SoftTarget)),required=Math.max(0,(ENGLISH_LESSON_TOTAL-r1)/eligible),cls=learningStatusClass(proj.date,LEARNING_CONFIG.round1SoftTarget);
  const r1list=englishRoundListHtml(LS.english.round1,1);let unlocked='';
  if(!englishRound1Complete())unlocked=`<div class="learning-lock">完整完成第一轮 ${ENGLISH_LESSON_TOTAL}/${ENGLISH_LESSON_TOTAL} 后，才正式解锁“第二轮 + ${ENGLISH_SKILLS.length} 节四级技巧课”。周一总复习属于第一轮内部复盘，不计作二轮。</div>`;
  else{const r2list=englishRoundListHtml(LS.english.round2,2),modules=['写作','翻译','听力','阅读'],skillHtml=modules.map(mod=>{const arr=ENGLISH_SKILLS.filter(x=>x.module===mod),doneN=arr.filter(x=>LS.english.skills[String(x.id)]).length;return `<div class="learning-module-title"><span>${mod}篇</span><span>${doneN}/${arr.length}</span></div><div class="learning-item-list">${arr.map(s=>{const v=LS.english.skills[String(s.id)],done=!!v;return `<label class="learning-item ${done?'done':''}"><input type="checkbox" data-en-skill="${s.id}" ${done?'checked':''}><div><div class="learning-item-title">${String(s.id).padStart(2,'0')} · ${esc(s.title)}</div><div class="learning-item-meta">${esc(s.duration)} · 刘晓燕《就这样过英语四级》</div></div><span class="learning-item-date">${done?esc(learningEntryDate(v)):''}</span></label>`}).join('')}</div>`}).join(''),n2=nextEnglishLesson(LS.english.round2),ns=nextNumber(ENGLISH_SKILLS.length,LS.english.skills);unlocked=`<div class="learning-section-card"><div class="learning-row spread"><h4>第二轮词汇 · ${r2}/${ENGLISH_LESSON_TOTAL}</h4>${n2?`<button class="btn primary" id="doneNextR2">今天完成 ${englishLessonLabel(n2)}</button>`:'<span class="learning-chip green">已完成</span>'}</div>${r2list}</div><div class="learning-section-card"><div class="learning-row spread"><h4>四级通关技巧 · ${sk}/${ENGLISH_SKILLS.length}</h4>${ns?`<button class="btn primary" id="doneNextSkill">今天完成第 ${ns} 节</button>`:'<span class="learning-chip green">已完成</span>'}</div><div class="learning-source-note">与词汇二轮同步；尽量在 ${dateHuman(englishContentDeadline())} 前收官，为考试前两天留整理与模拟空间。</div>${skillHtml}</div>`}
  e.innerHTML=burndownInlineHtml(englishRound1Complete()?['english1','english2','skills']:['english1'],'英语进度趋势')+`<div class="learning-section-card"><div class="learning-row spread"><div><h4>英语四级词汇 · 第一轮 ${r1}/${ENGLISH_LESSON_TOTAL}</h4><div class="learning-source-note">真实课程结构：10 个 Unit，每个 Unit 都是 Lesson 1—4；正文共 40 个逻辑 Lesson。4 个 Lesson 被拆成两段视频，所以正文是 44 个视频段；“使用说明”单独不计学习进度。</div></div>${next?`<button class="btn primary" id="doneNextR1">今天完成 ${englishLessonLabel(next)}</button>`:'<span class="learning-chip green">第一轮完成</span>'}</div><div class="learning-status-box ${cls}" style="margin-top:9px"><b>动态预测：${dateHuman(proj.date)}</b><br>软目标 ${dateHuman(LEARNING_CONFIG.round1SoftTarget)}。当前约 ${proj.pace.toFixed(1)} Lesson / 实际学习日；守住软目标平均还需约 ${required.toFixed(1)} Lesson / 非周一学习日。</div>${r1list}</div>${unlocked}`;
  bindInlineBurndown(englishRound1Complete()?['english1','english2','skills']:['english1']);document.querySelectorAll('[data-en-r1]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.round1,x.dataset.enR1,ev.target.checked);renderLearningAll()});document.querySelectorAll('[data-en-r2]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.round2,x.dataset.enR2,ev.target.checked);renderLearningAll()});document.querySelectorAll('[data-en-skill]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.skills,x.dataset.enSkill,ev.target.checked);renderLearningAll()});if($('#doneNextR1'))$('#doneNextR1').onclick=()=>{learningMark(LS.english.round1,nextEnglishLesson(LS.english.round1),true);renderLearningAll()};if($('#doneNextR2'))$('#doneNextR2').onclick=()=>{learningMark(LS.english.round2,nextEnglishLesson(LS.english.round2),true);renderLearningAll()};if($('#doneNextSkill'))$('#doneNextSkill').onclick=()=>{learningMark(LS.english.skills,nextNumber(ENGLISH_SKILLS.length,LS.english.skills),true);renderLearningAll()}
};

renderLearningToday=function(){
  const e=$('#learningPanel'),k=learningTodayKey(),d=learningTodayDate(),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),monday=d.getDay()===1,mode=energyFor(k),r=learningReviewFor(k),todayItems=learningCompletionItemsOnDate(k),due=dueReviews(),free=LS.freeLogs.filter(x=>x.date===k),fd=nextFinanceDay(),md=nextMathDay(),nextR1=nextEnglishLesson(LS.english.round1),nextR2=nextEnglishLesson(LS.english.round2),nextSkill=nextNumber(ENGLISH_SKILLS.length,LS.english.skills),nearest=learningUpcomingCountdowns().slice(0,3);let tasks=[];
  if(monday&&!englishRound1Complete()){if(!r.weekly)tasks.push({rank:'必须',cls:'must',title:'英语 · 一周总复习',meta:'周一不默认安排新 Lesson，把本周词汇重新检索一遍。',action:'weekly'})}else if(!englishRound1Complete()&&k>=LEARNING_CONFIG.militaryStart&&nextR1)tasks.push({rank:'核心',cls:'core',title:`英语一轮 · ${englishLessonLabel(nextR1)}`,meta:englishLessonMeta(nextR1),action:'r1'});else if(englishRound1Complete()){if(nextR2)tasks.push({rank:'核心',cls:'core',title:`英语二轮 · ${englishLessonLabel(nextR2)}`,meta:'正式二轮，从 0/40 独立推进。',action:'r2'});if(nextSkill)tasks.push({rank:'核心',cls:'core',title:`四级技巧 · 第 ${nextSkill} 节`,meta:'与二轮同步，不提前占用一轮词汇时间。',action:'skill'})}
  if(!busy&&formalAdvanceAllowed(k)){if(fd)tasks.push({rank:mil?'自选':(mode==='low'?'可后移':'核心'),cls:mil||mode==='low'?'extra':'core',title:`财经 · 原 Day ${fd}${mil?'（自愿推进）':''}`,meta:`${financeItem(fd)?.subject||''} · ${financeItem(fd)?.title||''}`,action:'finance'});if(md&&(mil||mode==='high'||mode==='normal'))tasks.push({rank:mil?'自选':(mode==='high'?'核心':'建议'),cls:mil||mode!=='high'?'extra':'core',title:`高数 · Day ${md}${mil?'（自愿推进）':''}`,meta:`${mathItem(md)?.lectures?.length||0} 个视频 · ${durationHuman(mathDayDuration(mathItem(md)))}`,action:'math'})}
  if(busy)tasks=tasks.filter(x=>x.action==='weekly'||x.action==='r1'||x.action==='r2');if(!tasks.length)tasks.push({rank:'完成',cls:'extra',title:'今天没有必须推进的新内容',meta:'可以做复习、计时学习，或者直接休息。',action:''});
  const taskHtml=tasks.map(x=>`<div class="cockpit-task ${x.cls}"><span class="rank">${x.rank}</span><div><div class="cockpit-task-title">${esc(x.title)}</div><div class="cockpit-task-meta">${esc(x.meta)}</div></div>${x.action?`<button class="btn" data-cockpit-action="${x.action}">完成</button>`:''}</div>`).join('');
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>今日学习 · ${k} · 周${wd(d)}</h4><div class="learning-source-note">${mil?'军训弹性保护：高数/财经可自愿推进，但不形成每日欠账。':'状态决定建议强度，不改掉真实记录。'}</div></div><span class="learning-chip ${mil?'orange':busy?'red':'green'}">${mil?'军训弹性':busy?'缓冲':'正常'}</span></div><div class="energy-switch" style="margin-top:9px"><button class="btn ${mode==='high'?'active':''}" data-energy="high">高能量</button><button class="btn ${mode==='normal'?'active':''}" data-energy="normal">标准</button><button class="btn ${mode==='low'?'active':''}" data-energy="low">低负荷</button></div></div><div class="cockpit-grid"><div class="cockpit-stack"><div class="learning-section-card"><div class="learning-row spread"><h4>今天先做什么</h4><span class="learning-chip">${energyLabel(mode)}模式</span></div>${taskHtml}</div><div class="learning-section-card"><div class="learning-row spread"><h4>固定词汇复习</h4><span class="learning-chip">早晚 + 周一</span></div><div class="learning-review-grid"><label class="learning-review-check"><input type="checkbox" id="reviewMorning" ${r.morning?'checked':''}><span><b>早上复习昨日词汇</b><small>快速主动回忆。</small></span></label><label class="learning-review-check"><input type="checkbox" id="reviewEvening" ${r.evening?'checked':''}><span><b>晚上复习昨日词汇</b><small>睡前检索卡壳词。</small></span></label><label class="learning-review-check" style="${monday?'':'opacity:.48'}"><input type="checkbox" id="reviewWeekly" ${r.weekly?'checked':''} ${monday?'':'disabled'}><span><b>周一一周总复习</b><small>${monday?'今天执行。':'仅周一开启。'}</small></span></label></div></div><div class="learning-section-card"><div class="learning-row spread"><h4>到期复习</h4><button class="btn" id="openReviewToday">查看复习</button></div>${due.length?due.slice(0,4).map(x=>`<div class="learning-mini-line"><b>${esc(x.track)}</b> · ${esc(x.title)} · 第${x.offset}天</div>`).join(''):'<div class="learning-empty">今天没有自动到期复习。</div>'}</div></div><div class="cockpit-stack"><div class="learning-section-card"><div class="learning-row spread"><h4>专注计时</h4><b>${secHuman(todayStudySeconds())}</b></div><button class="btn primary" id="openTimerToday" style="width:100%;margin-top:9px">开始 / 查看计时</button></div><div class="learning-section-card"><div class="learning-row spread"><h4>近期节点</h4><button class="btn" id="openCountdownsToday">管理</button></div>${nearest.length?nearest.map(x=>`<div class="learning-mini-line"><b>${esc(x.title)}</b> · ${learningCountdownText(x.date,x.endDate)}</div>`).join(''):'<div class="learning-empty">暂无倒数日。</div>'}</div><div class="learning-section-card"><h4>自主学习记录</h4><div class="learning-free-row"><select id="freeTrack"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select><input id="freeText" type="text" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="写下额外学习内容"><button class="btn" id="addFreeLog">记录</button></div>${free.length?free.map(x=>`<div class="learning-free-log"><span>${esc(x.track)} · ${esc(x.text)}</span><button class="x" data-free-id="${x.id}">×</button></div>`).join(''):'<div class="learning-empty">今天还没有自主学习记录。</div>'}</div><div class="learning-section-card"><h4>今天已经完成</h4>${todayItems.length?todayItems.map(x=>`<div class="learning-mini-line">✓ ${esc(x)}</div>`).join(''):'<div class="learning-empty">正式学习项目还没有打勾。</div>'}</div></div></div>`;
  document.querySelectorAll('[data-energy]').forEach(b=>b.onclick=()=>setEnergy(b.dataset.energy,k));$('#reviewMorning').onchange=x=>setLearningReview('morning',x.target.checked,k);$('#reviewEvening').onchange=x=>setLearningReview('evening',x.target.checked,k);if(monday)$('#reviewWeekly').onchange=x=>setLearningReview('weekly',x.target.checked,k);document.querySelectorAll('[data-cockpit-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.cockpitAction;if(a==='weekly')setLearningReview('weekly',true,k);else if(a==='r1')learningMark(LS.english.round1,nextEnglishLesson(LS.english.round1),true,k);else if(a==='r2')learningMark(LS.english.round2,nextEnglishLesson(LS.english.round2),true,k);else if(a==='skill')learningMark(LS.english.skills,nextNumber(ENGLISH_SKILLS.length,LS.english.skills),true,k);else if(a==='finance')learningMark(LS.finance.completions,nextFinanceDay(),true,k);else if(a==='math')learningMark(LS.math.completions,nextMathDay(),true,k);renderLearningAll()});$('#openTimerToday').onclick=()=>{activeLearningTab='timer';renderLearningAll()};$('#openReviewToday').onclick=()=>{activeLearningTab='review';renderLearningAll()};$('#openCountdownsToday').onclick=()=>{activeLearningTab='countdowns';renderLearningAll()};$('#addFreeLog').onclick=()=>addFreeLearningLog($('#freeTrack').value,$('#freeText').value,k);document.querySelectorAll('[data-free-id]').forEach(b=>b.onclick=()=>removeFreeLearningLog(b.dataset.freeId))
};

renderLearningSchedule=function(){
  const e=$('#learningPanel'),busy=Object.entries(LS.busyDates).sort((a,b)=>a[0].localeCompare(b[0])),milestones=[{date:LEARNING_CONFIG.resumeDate,text:'军训结束：财经 / 高数恢复正常每日队列。'},...(LS.countdowns||[]).map(x=>({date:x.date,text:`${esc(x.title)} <span class="learning-chip">${esc(x.kind||'考试')}</span> · ${countdownLabel(x)}`}))].sort((a,b)=>a.date.localeCompare(b.date));
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><h4>计划节点</h4><button class="btn" id="scheduleEditCountdowns">编辑倒数日</button></div><div class="learning-mini-line"><b>10/12—10/25</b> · 军训弹性保护：英语照常；财经/高数可自愿推进，但没有“今天必须完成”的欠账。</div>${milestones.map(x=>`<div class="learning-mini-line"><b>${x.date}</b> · ${x.text}</div>`).join('')}</div><div class="learning-section-card"><h4>添加缓冲日</h4><div class="learning-free-row"><input id="busyDateInput" type="date" value="${learningTodayKey()}"><input id="busyReasonInput" type="text" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="例如：志愿活动 / 普通话考试 / 临时作业"><button class="btn" id="addBusyDateBtn">设为缓冲</button></div><div class="learning-source-note" style="margin-top:6px">缓冲日不会删除任务；正式队列只是停住，恢复后继续下一项。</div><div class="learning-busy-list">${busy.length?busy.map(([k,v])=>`<div class="learning-busy-row"><b>${k}</b><span>${esc(v.reason||'临时忙')}</span><button class="x" data-busy-remove="${k}">×</button></div>`).join(''):'<div class="learning-empty">暂无手动缓冲日。</div>'}</div></div><div class="learning-section-card"><h4>调度规则</h4><div class="learning-status-box"><b>英语一轮</b>：按 Unit 1—10、每 Unit Lesson 1—4；每个学习日固定计划 1 个新 Lesson，周一也照常，再额外做一周总复习；周六/调休不安排，也不补债。<br><b>四级技巧</b>：立即与词汇并行，按“阅读 → 听力 → 翻译 → 写作”推进；阅读题/例题同时精读，筛选高价值生词进入复习，不以生词数量凑任务。<br><b>英语二轮</b>：第一轮 40/40 后独立开始。<br><b>军训期</b>：英语照常但允许按体力减量；高数/财经是“可推进、不欠账”；10/26 后恢复正常队列。<br><b>财经</b>：会计优先闭环，原 Day 编号保留。<br><b>高数</b>：保持机构 48 天顺序。<br><b>缓冲</b>：临时忙不算失败；恢复后接着下一项。</div></div>`;$('#scheduleEditCountdowns').onclick=()=>{activeLearningTab='countdowns';renderLearningAll()};$('#addBusyDateBtn').onclick=()=>addBusyDate($('#busyDateInput').value,$('#busyReasonInput').value);document.querySelectorAll('[data-busy-remove]').forEach(b=>b.onclick=()=>removeBusyDate(b.dataset.busyRemove))
};

// 军训期允许在学科页自愿勾选正式 Day；页面顶部明确提示“可推进、不欠账”。
renderLearningFinance=function(){v152RenderFinanceBase();appendSubjectBurndown(['finance'],'财经进度趋势');if(isMilitaryKey(learningTodayKey()))$('#learningPanel')?.insertAdjacentHTML('afterbegin','<div class="learning-status-box safe" style="margin-bottom:10px"><b>军训弹性保护</b>：今天可以自愿完成财经正式 Day；不学也不会形成逾期或欠账。</div>')};
renderLearningMath=function(){v152RenderMathBase();appendSubjectBurndown(['math'],'高数进度趋势');if(isMilitaryKey(learningTodayKey()))$('#learningPanel')?.insertAdjacentHTML('afterbegin','<div class="learning-status-box safe" style="margin-bottom:10px"><b>军训弹性保护</b>：今天可以自愿完成高数正式 Day；不学也不会形成逾期或欠账。</div>')};

renderLearningMini=function(){
  const e=$('#learningMini');if(!e)return;const k=fmt(sel),isToday=k===learningTodayKey(),items=learningCompletionItemsOnDate(k),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),cds=learningCountdownsOnDate(k),chips=[];if(cds.length)chips.push(`<span class="learning-chip blue">⌛ ${esc(cds[0].title)}${cds.length>1?` +${cds.length-1}`:''}</span>`);if(mil)chips.push('<span class="learning-chip orange">军训弹性保护</span>');if(busy)chips.push('<span class="learning-chip red">缓冲日</span>');if(items.length)chips.push(`<span class="learning-chip green">完成 ${items.length} 项</span>`);if(isToday&&LS.studyTimer.active)chips.push(`<span class="learning-chip green">计时 · ${esc(LS.studyTimer.active.subject)}</span>`);let lines=cds.map(x=>`<div class="learning-mini-line"><b>${esc(x.kind||'考试')}</b> · ${esc(x.title)} · ${countdownLabel(x)}</div>`).join('');if(items.length)lines+=items.slice(0,4).map(x=>`<div class="learning-mini-line">✓ ${esc(x)}</div>`).join('')+(items.length>4?`<div class="learning-source-note">还有 ${items.length-4} 项记录。</div>`:'');if(!items.length&&isToday){const r1=nextEnglishLesson(LS.english.round1),fd=nextFinanceDay(),md=nextMathDay();lines+=`<div class="learning-mini-line"><b>今天专注</b> · ${secHuman(todayStudySeconds())}　<b>能量</b> · ${energyLabel(energyFor())}</div>`;if(!englishRound1Complete())lines+=`<div class="learning-mini-line"><b>英语</b> · ${sel.getDay()===1?'周一总复习':(r1?englishLessonLabel(r1):'第一轮完成')}</div>`;else lines+=`<div class="learning-mini-line"><b>英语</b> · 二轮 ${englishDoneCount(LS.english.round2)}/${ENGLISH_LESSON_TOTAL} · 技巧 ${learningDoneCount(LS.english.skills)}/${ENGLISH_SKILLS.length}</div>`;if(!busy&&formalAdvanceAllowed(k))lines+=`<div class="learning-mini-line"><b>${mil?'可选推进':'今日队列'}</b> · 财经 ${fd?`原 Day ${fd}`:'已完成'}　高数 ${md?`Day ${md}`:'已完成'}</div>`}else if(!items.length&&!cds.length)lines='<div class="learning-empty">动态计划不提前锁死具体内容；当天根据实时进度生成。</div>';e.innerHTML=`<div class="learning-mini-status">${chips.join('')||'<span class="learning-chip">动态队列</span>'}</div>${lines}`;$('#learningMiniStat').textContent=items.length?`${items.length} 项`:''
};

// 手动补记与更可靠的结束落账。
let studyTimerNotice='';
sessionDate=function(s){return String(s?.dateKey||'')||beijingDateKey(s?.startAt||s?.endAt||'')};
function beijingAnchorIso(dateKey,time='12:00'){
  const [y,m,d]=String(dateKey||'').split('-').map(Number),[hh,mm]=String(time||'12:00').split(':').map(Number);if(!y||!m||!d)return new Date().toISOString();return new Date(Date.UTC(y,m-1,d,(hh||0)-8,mm||0,0)).toISOString()
}
function forceStudyLedgerSyncSoon(){
  clearTimeout(window.__studyLedgerSyncTimer);window.__studyLedgerSyncTimer=setTimeout(async()=>{try{if(sb&&sbUser)await uploadCloud(true)}catch{}},120)
}
function addManualStudySession(subject,dateKey,minutes,note=''){
  const min=Math.round(Number(minutes));if(!STUDY_SUBJECTS.includes(subject))subject='其他';if(!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey||''))){alert('请选择日期。');return}if(!Number.isFinite(min)||min<=0||min>720){alert('学习时长请填写 1—720 分钟。');return}
  const startAt=beijingAnchorIso(dateKey,'12:00'),endAt=new Date(Date.parse(startAt)+min*60000).toISOString();LS.studyTimer.sessions.push({id:'manual-'+uuid(),manual:true,dateKey,deviceId:learningDeviceId(),subject,energy:'normal',note:String(note||'').trim(),startAt,endAt,focusSeconds:min*60,breakSeconds:0,blocks:0,recordedAt:new Date().toISOString()});persistLearningState();studyTimerNotice=`已手动补记：${subject} · ${min} 分钟`;forceStudyLedgerSyncSoon();renderLearningTimer();renderLearningOverview()
}
finishStudy=function(){
  const a=LS.studyTimer.active;if(!a)return;let focus=Number(a.focusAccumSec||0),br=Number(a.breakAccumSec||0);if(a.phase==='focus')focus+=Math.max(0,Math.floor((Date.now()-Date.parse(a.phaseStartedAt))/1000));else if(a.phase==='break')br+=currentPhaseSeconds();focus=Math.max(0,Math.round(focus));
  const rec={id:a.id||uuid(),deviceId:learningDeviceId(),subject:a.subject,energy:a.energy,note:a.note,startAt:a.sessionStartedAt||a.phaseStartedAt||new Date().toISOString(),endAt:new Date().toISOString(),focusSeconds:focus,breakSeconds:Math.max(0,Math.round(br)),blocks:a.blocksCompleted||0,recordedAt:new Date().toISOString()};LS.studyTimer.sessions=mergeStudyLedger([...(LS.studyTimer.sessions||[]),rec],LS.studyTimer.deletedSessionIds||[],[],[]).sessions;LS.studyTimer.active=null;persistLearningState();studyTimerNotice=`已记录：${rec.subject} · ${secHuman(rec.focusSeconds)}`;renderLearningAll();forceStudyLedgerSyncSoon()
};
renderLearningTimer=function(){
  const e=$('#learningPanel'),a=LS.studyTimer.active,mode=energyFor(),todayTotal=todayStudySeconds(),notice=studyTimerNotice?`<div class="learning-status-box safe" style="margin-bottom:10px"><b>${esc(studyTimerNotice)}</b> · 已先保存到本机，并立即尝试同步云端。</div>`:'';
  const controls=a?`<div class="timer-controls">${a.phase==='focus'&&a.focusDueNotified||a.phase==='break_due'?'<button class="btn primary" id="startBreakBtn">开始休息</button><button class="btn" id="skipBreakBtn">继续下一轮</button>':a.phase==='ready'?'<button class="btn primary" id="nextFocusBtn">开始下一轮</button>':''}<button class="btn learning-danger-btn" id="finishStudyBtn">结束并保存</button></div>`:'';
  const recent=[...(LS.studyTimer.sessions||[])].sort((x,y)=>String(y.recordedAt||y.endAt||'').localeCompare(String(x.recordedAt||x.endAt||''))).slice(0,5);
  e.innerHTML=notice+`<div class="learning-section-card"><div class="learning-row spread"><div><h4>学习计时</h4><div class="learning-source-note">点击“结束并保存”时会先写入本机账本，再立即尝试同步云端。即使云端暂时失败，本机记录仍保留。</div></div><span class="learning-chip green">今天 ${secHuman(todayTotal)}</span></div>${!a?`<div class="timer-start-grid" style="margin-top:10px"><select id="studySubject">${STUDY_SUBJECTS.map(x=>`<option>${x}</option>`).join('')}</select><select id="studyEnergy"><option value="normal" ${mode==='normal'?'selected':''}>标准 · 50/10</option><option value="high" ${mode==='high'?'selected':''}>高能量 · 50/10</option><option value="low" ${mode==='low'?'selected':''}>低负荷 · 25/5</option></select><input id="studyNote" type="text" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="可选：今天具体学什么"><button class="btn primary" id="startStudyBtn">开始学习</button></div>`:''}</div><div class="timer-shell"><div class="timer-face"><div class="timer-subject">${a?`${esc(a.subject)} · ${energyLabel(a.energy)}`:'科学学习节奏'}</div><div class="timer-clock" id="liveTimerClock">00:00</div><div class="timer-phase" id="liveTimerPhase">${a?'准备中':'尚未开始'}</div><div class="timer-hint" id="liveTimerHint"></div>${controls}</div><div class="learning-section-card"><h4>默认节奏</h4><div class="eye-rule"><div><b>50 分钟专注</b><small>标准 / 高能量；低负荷 25 分钟。</small></div><div><b>10 分钟离屏</b><small>每两轮后长休息；低负荷更短。</small></div><div><b>20-20-20 护眼</b><small>每 20 分钟看约 6 米外至少 20 秒。</small></div></div></div></div><div class="learning-section-card"><div class="learning-row spread"><div><h4>手动补记</h4><div class="learning-source-note">自动计时漏记、忘记开始计时，或者需要修复某天的数据时使用。这里只补“真实专注时间”。</div></div><span class="learning-chip blue">兜底</span></div><div class="timer-start-grid" style="margin-top:10px"><select id="manualStudySubject">${STUDY_SUBJECTS.map(x=>`<option>${x}</option>`).join('')}</select><input id="manualStudyDate" type="date" value="${learningTodayKey()}"><input id="manualStudyMinutes" type="number" min="1" max="720" inputmode="numeric" placeholder="分钟数"><button class="btn primary" id="manualStudyAdd">补记</button></div><input id="manualStudyNote" type="text" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="备注（可选，例如：午休后高数 Day 1）" style="width:100%;margin-top:8px"></div><div class="learning-section-card"><div class="learning-row spread"><h4>最近 5 条学习记录</h4><button class="btn" id="openStatsFromTimer">查看全部</button></div>${recent.length?recent.map(x=>`<div class="study-log-row"><b>${esc(x.subject)}</b><span>${secHuman(x.focusSeconds)}</span><span>${x.manual?`${esc(sessionDate(x))} · 手动补记`:beijingDateTimeLabel(x.startAt)}${x.note?` · ${esc(x.note)}`:''}</span><button class="x" data-study-remove="${x.id}">×</button></div>`).join(''):'<div class="learning-empty">还没有学习记录。</div>'}</div>`;
  if($('#startStudyBtn'))$('#startStudyBtn').onclick=()=>{studyTimerNotice='';startStudy($('#studySubject').value,$('#studyEnergy').value,$('#studyNote').value)};if($('#startBreakBtn'))$('#startBreakBtn').onclick=startStudyBreak;if($('#skipBreakBtn'))$('#skipBreakBtn').onclick=skipBreakAndContinue;if($('#nextFocusBtn'))$('#nextFocusBtn').onclick=startNextFocus;if($('#finishStudyBtn'))$('#finishStudyBtn').onclick=finishStudy;$('#manualStudyAdd').onclick=()=>addManualStudySession($('#manualStudySubject').value,$('#manualStudyDate').value,$('#manualStudyMinutes').value,$('#manualStudyNote').value);$('#openStatsFromTimer').onclick=()=>{activeLearningTab='stats';renderLearningAll()};document.querySelectorAll('[data-study-remove]').forEach(b=>b.onclick=()=>removeStudySession(b.dataset.studyRemove));updateTimerDOM()
};
renderLearningStats=function(){
  const e=$('#learningPanel'),[wa,wb]=studyWeekRange(),sessions=[...(LS.studyTimer.sessions||[])].sort((a,b)=>String(b.recordedAt||b.endAt||'').localeCompare(String(a.recordedAt||a.endAt||''))).slice(0,40),weekTotal=weekStudySeconds();const cards=STUDY_SUBJECTS.map(sub=>{const sec=weekStudySeconds(sub),w=weekTotal?Math.round(sec/weekTotal*100):0;return `<div class="study-stat"><small>${sub} · 本周</small><b>${secHuman(sec)}</b><i style="--w:${w}%"></i></div>`}).join('');
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>学习时间统计</h4><div class="learning-source-note">自动计时和手动补记统一进入同一份账本；日期与时间按北京时间统计。</div></div><span class="learning-chip blue">${wa} — ${wb}</span></div><div class="study-stat-grid" style="margin-top:10px">${cards}</div></div><div class="learning-section-card"><h4>今天 / 本周 / 本月</h4><div class="study-stat-grid"><div class="study-stat"><small>今天</small><b>${secHuman(todayStudySeconds())}</b></div><div class="study-stat"><small>本周</small><b>${secHuman(weekTotal)}</b></div><div class="study-stat"><small>本月</small><b>${secHuman(monthStudySeconds())}</b></div><div class="study-stat"><small>已记录学习段</small><b>${LS.studyTimer.sessions.length}</b></div></div></div><div class="learning-section-card"><h4>最近学习记录</h4>${sessions.length?sessions.map(x=>`<div class="study-log-row"><b>${esc(x.subject)}</b><span>${secHuman(x.focusSeconds)}</span><span>${x.manual?`${esc(sessionDate(x))} · 手动补记`:beijingDateTimeLabel(x.startAt)}${x.note?` · ${esc(x.note)}`:''}</span><button class="x" data-study-remove="${x.id}">×</button></div>`).join(''):'<div class="learning-empty">还没有计时记录。</div>'}</div>`;document.querySelectorAll('[data-study-remove]').forEach(b=>b.onclick=()=>removeStudySession(b.dataset.studyRemove))
};

function snapshotData(){
  return {
    version:21,
    savedAt:new Date().toISOString(),
    tasks:T,
    recurringTasks:RT,
    weekGoals:WG,
    monthGoals:MG,
    deadlineGoals:DG,
    scheduleOverrides:SO,
    scheduleConfig:SC,
    reflections:R,
    anniversaries:A,
    reviewNotes:S.g('reviewNotes',{}),
    aiSummaries:S.g('aiSummaries',{}),
    learningState:LS
  }
}
let syncSuppressed=false;
function applySnapshot(data){
  if(!data||typeof data!=='object')throw new Error('invalid data');
  syncSuppressed=true;
  try{
    T=data.tasks||{};RT=(data.recurringTasks||[]).map(r=>({...r,endDate:r.endDate||'',doneDates:r.doneDates||[],skipDates:r.skipDates||[]}));WG=data.weekGoals||{};MG=data.monthGoals||{};
    DG=(data.deadlineGoals||[]).map(g=>({...g,id:g.id||uuid(),priority:g.priority||'medium',done:!!g.done,completedAt:g.completedAt||''}));
    SO=data.scheduleOverrides||{};SC=data.scheduleConfig||{disabledCourseIds:[]};if(!Array.isArray(SC.disabledCourseIds))SC.disabledCourseIds=[];
    R=data.reflections||{};A=(data.anniversaries||[]).map(a=>({...a,id:a.id||uuid()}));
    LS=normalizeLearningState(data.learningState||{});
    S.s('tasks',T);S.s('recurringTasks',RT);S.s('weekGoals',WG);S.s('monthGoals',MG);S.s('deadlineGoals',DG);
    S.s('scheduleOverrides',SO);S.s('scheduleConfig',SC);
    S.s('reflections',R);S.s('anniversaries',A);S.s('reviewNotes',data.reviewNotes||{});
    S.s('aiSummaries',data.aiSummaries||{});S.s('learningState',LS);
  }finally{syncSuppressed=false}
  

renderCal();renderSide();renderAnniv();renderStreak();renderAIStored();renderLearningMini();
}

let sb=null,sbUser=null,sbAccessToken='',syncTimer=null;
let sbAuthSubscription=null,sbConfigFingerprint='',sbSessionRestoring=false,sbRestorePromise=null;
function cloudCfg(){return S.g('cloudConfig',{url:'',key:''})}
function cloudCfgFingerprint(c){return `${String(c?.url||'').trim()}::${String(c?.key||'').trim()}`}

function syncMeta(){return S.g('syncMeta',{localUpdatedAt:'',lastSyncedAt:'',lastSyncedCloudAt:'',cloudUpdatedAt:'',conflict:false})}
function saveSyncMeta(patch){
  const next={...syncMeta(),...patch};
  originalSet('syncMeta',next);
  renderSyncMeta();
  return next
}
function fmtSyncTime(v){
  if(!v)return '—';
  const d=new Date(v);if(Number.isNaN(d.getTime()))return '—';
  return d.toLocaleString('zh-CN',{timeZone:LEARNING_TIME_ZONE,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})
}
function isAfter(a,b,slack=700){
  if(!a)return false;if(!b)return true;
  return new Date(a).getTime()>new Date(b).getTime()+slack
}
function localIsDirty(m=syncMeta()){
  return !!m.localUpdatedAt && (!m.lastSyncedAt || isAfter(m.localUpdatedAt,m.lastSyncedAt,0))
}
function remoteChangedSinceSync(remoteAt,m=syncMeta()){
  return !!remoteAt && !!m.lastSyncedCloudAt && isAfter(remoteAt,m.lastSyncedCloudAt)
}
function renderSyncMeta(){
  const m=syncMeta();
  if($('#localUpdatedLabel'))$('#localUpdatedLabel').textContent=fmtSyncTime(m.localUpdatedAt);
  if($('#cloudUpdatedLabel'))$('#cloudUpdatedLabel').textContent=fmtSyncTime(m.cloudUpdatedAt);
  if($('#lastSyncedLabel'))$('#lastSyncedLabel').textContent=fmtSyncTime(m.lastSyncedAt);
  if($('#syncStateLabel'))$('#syncStateLabel').textContent=m.conflict?'⚠ 需要处理冲突':(sbSessionRestoring&&!sbUser?'恢复登录中':(sbUser?'正常':'未登录'));
  if($('#syncConflictBox'))$('#syncConflictBox').classList.toggle('show',!!m.conflict)
}
function setCloudStatus(state,text){
  const dot=$('#cloudDot');dot.className='cloud-dot'+(state==='on'?' on':state==='busy'?' busy':'');
  $('#cloudText').textContent=text
}
async function fetchCloudState(){
  if(!sb||!sbUser)return {data:null,error:null};
  return await sb.from('calendar_state').select('payload,updated_at').eq('user_id',sbUser.id).maybeSingle()
}
async function refreshCloudMeta(){
  if(!sb||!sbUser){renderSyncMeta();return}
  const {data,error}=await fetchCloudState();
  if(error)return;
  const cloudAt=data?.updated_at||'';
  if(data?.payload)mergeRemoteStudyLedgerIntoLocal(data.payload);
  const m=syncMeta();
  if(cloudAt&&!m.lastSyncedCloudAt){
    const baseline=new Date().toISOString();
    saveSyncMeta({cloudUpdatedAt:cloudAt,lastSyncedCloudAt:cloudAt,lastSyncedAt:m.lastSyncedAt||baseline,localUpdatedAt:m.localUpdatedAt||baseline,conflict:false});
    return
  }
  const conflict=localIsDirty(m) && remoteChangedSinceSync(cloudAt,m);
  saveSyncMeta({cloudUpdatedAt:cloudAt,conflict});
  if(conflict)setCloudStatus('off','发现同步冲突')
}
async function recoverSupabaseSession(){
  if(!sb)return null;
  if(sbRestorePromise)return sbRestorePromise;
  const client=sb;
  sbSessionRestoring=true;
  if(!sbUser)setCloudStatus('busy','恢复登录中');
  updateCloudUI();
  sbRestorePromise=(async()=>{
    try{
      const {data,error}=await client.auth.getSession();
      if(client!==sb)return null;
      const session=data?.session||null;
      if(error&&!session)throw error;
      if(!session){
        sbUser=null;sbAccessToken='';
        setCloudStatus('off','云端未登录');
        return null
      }
      sbAccessToken=session.access_token||'';
      sbUser=session.user||sbUser||null;
      if(!sbUser){
        const userResult=await client.auth.getUser();
        if(client!==sb)return null;
        if(userResult?.data?.user)sbUser=userResult.data.user
      }
      if(sbUser){
        setCloudStatus('on',error?'登录已保存 · 网络待恢复':'云端已登录');
        setTimeout(()=>{if(client===sb&&sbUser)refreshCloudMeta()},0)
      }else{
        setCloudStatus('busy','登录已保存 · 等待联网')
      }
      return sbUser
    }catch(e){
      if(client===sb)setCloudStatus('off','网络异常 · 登录状态已保留');
      return sbUser
    }finally{
      if(client===sb){sbSessionRestoring=false;updateCloudUI()}
      sbRestorePromise=null
    }
  })();
  return sbRestorePromise
}
function initSupabase(force=false){
  const c=cloudCfg();
  if(!c.url||!c.key||!window.supabase){
    if(sbAuthSubscription?.unsubscribe)sbAuthSubscription.unsubscribe();
    sbAuthSubscription=null;sb=null;sbUser=null;sbAccessToken='';sbConfigFingerprint='';
    setCloudStatus('off','仅本地');updateCloudUI();return null
  }
  const fingerprint=cloudCfgFingerprint(c);
  if(sb&&sbConfigFingerprint===fingerprint&&!force){
    if(!sbUser&&!sbSessionRestoring)recoverSupabaseSession();
    return sb
  }
  if(sbAuthSubscription?.unsubscribe)sbAuthSubscription.unsubscribe();
  sbAuthSubscription=null;sbRestorePromise=null;sbSessionRestoring=false;sbUser=null;sbAccessToken='';
  try{
    sb=window.supabase.createClient(c.url,c.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
  }catch{sb=null}
  if(!sb){sbConfigFingerprint='';setCloudStatus('off','配置错误');updateCloudUI();return null}
  sbConfigFingerprint=fingerprint;
  setCloudStatus('busy','恢复登录中');
  const authListener=sb.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'){
      sbUser=null;sbAccessToken='';setCloudStatus('off','云端未登录')
    }else if(session){
      sbUser=session.user||sbUser||null;
      sbAccessToken=session.access_token||sbAccessToken||'';
      setCloudStatus(sbUser?'on':'busy',sbUser?'云端已登录':'登录续期中')
    }
    updateCloudUI();renderSyncMeta();
    if(sbUser)setTimeout(()=>refreshCloudMeta(),0)
  });
  sbAuthSubscription=authListener?.data?.subscription||null;
  recoverSupabaseSession();
  return sb
}
function updateCloudUI(){
  const user=sbUser;
  if(sbSessionRestoring&&!user){
    $('#accountTitle').textContent='正在恢复本设备登录…';
    $('#accountInfo').textContent='正在读取已保存的登录状态并自动续期，请稍候。';
  }else{
    $('#accountTitle').textContent=user?`已登录 · ${user.email||'账号'}`:'未登录';
    $('#accountInfo').textContent=user?'本设备已开启长期登录与自动续期；除非主动退出或清除网站数据，否则会自动恢复云同步。':'登录一次后，本设备会持久保存登录状态并自动续期；主动退出或清除网站数据后需重新登录。';
  }
  $('#signOutBtn').disabled=!user;$('#uploadCloud').disabled=!user;$('#downloadCloud').disabled=!user;
  renderSyncMeta()
}
function ensureSupabaseReady(){
  const c=cloudCfg();
  if(!c.url||!c.key){alert('请先填写并保存 Supabase Project URL 和 publishable key。');return false}
  if(!window.supabase){alert('云同步组件没有加载成功，请刷新页面后重试。');return false}
  if(!sb)initSupabase();
  if(!sb){alert('Supabase 配置无法初始化，请检查 Project URL 和 key。');return false}
  return true
}
async function saveCloudConfig(){
  const url=$('#sbUrl').value.trim(),key=$('#sbKey').value.trim();
  if(!url||!key){alert('请完整填写 Supabase Project URL 和 publishable key。');return}
  S.s('cloudConfig',{url,key});
  const client=initSupabase(true);
  setTimeout(()=>{recoverSupabaseSession().then(retryPendingCloudSync)},800);
  alert(client?'云端配置已保存。':'配置已保存，但初始化失败，请检查 URL 和 key。')
}
async function signUp(){
  if(!ensureSupabaseReady())return;
  const email=$('#sbEmail').value.trim(),password=$('#sbPassword').value;
  if(!email||!password){alert('请填写邮箱和密码。');return}
  setCloudStatus('busy','注册中');
  const {data,error}=await sb.auth.signUp({email,password});
  if(error){alert(error.message);setCloudStatus('off','注册失败');return}
  if(data.session){
    sbUser=data.user||null;sbAccessToken=data.session?.access_token||'';updateCloudUI();setCloudStatus('on','云端已登录');
    alert('注册并登录成功。')
  }else{
    sbUser=null;updateCloudUI();setCloudStatus('off','请验证邮箱');
    alert('注册成功。请先到邮箱完成验证，然后回来点击“登录”。')
  }
}
async function signIn(){
  if(!ensureSupabaseReady())return;
  const email=$('#sbEmail').value.trim(),password=$('#sbPassword').value;
  if(!email||!password){alert('请填写邮箱和密码。');return}
  setCloudStatus('busy','登录中');
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  if(error){alert(error.message);setCloudStatus('off','登录失败');return}
  sbUser=data.user;sbAccessToken=data.session?.access_token||'';updateCloudUI();setCloudStatus('on','云端已登录');await refreshCloudMeta()
}
async function signOut(){
  if(sb)await sb.auth.signOut();sbUser=null;sbAccessToken='';updateCloudUI();setCloudStatus('off','云端未登录')
}
async function uploadCloud(silent=false,force=false){
  if(!sb||!sbUser){if(!silent)alert('请先登录云端账号。');return}
  setCloudStatus('busy','检查云端');
  const current=await fetchCloudState();
  if(current.error){setCloudStatus('off','同步失败');if(!silent)alert(current.error.message);return}
  const remoteAt=current.data?.updated_at||'';
  const m=syncMeta();
  const beforeMerge=snapshotData(),remotePayload=current.data?.payload||null;
  if(remotePayload)mergeRemoteStudyLedgerIntoLocal(remotePayload);
  const afterMerge=snapshotData();
  let conflict=remoteChangedSinceSync(remoteAt,m) && localIsDirty(m);
  if(conflict&&remotePayload&&studyOnlyDifference(beforeMerge,remotePayload))conflict=false;
  if(conflict&&!force){
    saveSyncMeta({cloudUpdatedAt:remoteAt,conflict:true});setCloudStatus('off','发现同步冲突');
    if(silent)return;
    const ok=confirm(`检测到除学习计时记录之外的同步冲突：\n\n本地最后修改：${fmtSyncTime(m.localUpdatedAt)}\n云端最后修改：${fmtSyncTime(remoteAt)}\n\n学习计时记录已经自动合并；继续“上传”仍会用本机的其他数据覆盖云端。确定覆盖吗？`);
    if(!ok)return;
  }
  setCloudStatus('busy','上传中');
  const stamp=new Date().toISOString();
  const {data,error}=await sb.from('calendar_state').upsert({user_id:sbUser.id,payload:afterMerge,updated_at:stamp},{onConflict:'user_id'}).select('updated_at').single();
  if(error){setCloudStatus('off','同步失败');if(!silent)alert(error.message);return}
  const cloudAt=data?.updated_at||stamp, syncedAt=new Date().toISOString();
  saveSyncMeta({lastSyncedCloudAt:cloudAt,cloudUpdatedAt:cloudAt,lastSyncedAt:syncedAt,localUpdatedAt:syncedAt,conflict:false});
  clearCloudDirty();setCloudStatus('on','已同步');if(!silent)alert('本地数据已安全上传到云端。')
}
async function downloadCloud(force=false){
  if(!sb||!sbUser){alert('请先登录云端账号。');return}
  setCloudStatus('busy','检查云端');
  const {data,error}=await fetchCloudState();
  if(error){setCloudStatus('off','下载失败');alert(error.message);return}
  if(!data?.payload){setCloudStatus('on','云端为空');alert('云端还没有日历数据。');return}
  const m=syncMeta(), remoteAt=data.updated_at||'';
  const dirty=localIsDirty(m);
  if(dirty&&!force){
    const ok=confirm(`本机存在尚未确认同步的修改：\n\n本地最后修改：${fmtSyncTime(m.localUpdatedAt)}\n云端最后修改：${fmtSyncTime(remoteAt)}\n\n继续“下载”会用云端数据覆盖本机。确定继续吗？`);
    if(!ok){setCloudStatus('on','云端已登录');return}
  }else if(!confirm(`云端数据更新时间：${fmtSyncTime(remoteAt)}。\n用它覆盖当前本地数据吗？`)){
    setCloudStatus('on','云端已登录');return
  }
  const remotePayload=JSON.parse(JSON.stringify(data.payload));
  const mergedLedger=mergeStudyLedger(LS.studyTimer.sessions,LS.studyTimer.deletedSessionIds,studyLedger(remotePayload).sessions,studyLedger(remotePayload).deleted);
  if(!remotePayload.learningState)remotePayload.learningState={};if(!remotePayload.learningState.studyTimer)remotePayload.learningState.studyTimer={active:null,sessions:[]};
  remotePayload.learningState.studyTimer.sessions=mergedLedger.sessions;remotePayload.learningState.studyTimer.deletedSessionIds=mergedLedger.deletedSessionIds;
  // 当前计时段属于本设备，下载云端时不覆盖它。
  remotePayload.learningState.studyTimer.active=LS.studyTimer.active;
  applySnapshot(remotePayload);
  const syncedAt=new Date().toISOString();
  saveSyncMeta({lastSyncedCloudAt:remoteAt,cloudUpdatedAt:remoteAt,lastSyncedAt:syncedAt,localUpdatedAt:syncedAt,conflict:false});
  clearCloudDirty();setCloudStatus('on','已同步');alert('云端数据已安全恢复到本机。')
}

// ---------- V1.0 关闭 / 切后台时尽力同步 ----------
let cloudDirty = false;
let lastCloudFlushAt = 0;

function markCloudDirty(){
  cloudDirty = true;
  try{ localStorage.setItem('zx_cloudDirty','1'); }catch{}
}

function clearCloudDirty(){
  cloudDirty = false;
  try{ localStorage.removeItem('zx_cloudDirty'); }catch{}
}

function flushCloudSyncOnLeave(){
  // V1.5.2：离开页面时不再用整份本地快照盲目覆盖云端。
  // 正常停留时由防抖同步完成；若来不及，保留 dirty 标记，下一次打开/聚焦时先拉取并合并再上传。
  if(!cloudDirty)return;
  try{localStorage.setItem('zx_cloudDirty','1')}catch{}
}

function retryPendingCloudSync(){
  try{
    if(localStorage.getItem('zx_cloudDirty') === '1'){
      cloudDirty = true;
      setTimeout(()=>{ if(sb && sbUser) uploadCloud(true); }, 1800);
    }
  }catch{}
}

function scheduleCloudSync(){
  clearTimeout(syncTimer);syncTimer=setTimeout(async()=>{
    if(!sb||!sbUser)return;
    const m=syncMeta();
    if(m.conflict){setCloudStatus('off','发现同步冲突');return}
    await uploadCloud(true)
  },1800)
}
const originalSet=S.s;
S.s=(k,v)=>{
  originalSet(k,v);
  if(syncSuppressed)return;
  if(!['sentReminders','cloudConfig','syncMeta'].includes(k)){
    const stamp=new Date().toISOString();
    const m=syncMeta();
    originalSet('syncMeta',{...m,localUpdatedAt:stamp});
    markCloudDirty();renderSyncMeta();scheduleCloudSync()
  }
};

function reviewPayload(type){
  const isWeek=type==='week';
  const a=isWeek?startOfWeek(sel):new Date(sel.getFullYear(),sel.getMonth(),1,12);
  const b=isWeek?endOfWeek(sel):new Date(sel.getFullYear(),sel.getMonth()+1,0,12);
  const data=collectPeriod(a,b);
  return {
    type,
    period:{start:fmt(a),end:fmt(b)},
    metrics:{taskTotal:data.taskTotal,taskDone:data.taskDone,highTotal:data.highTotal,highDone:data.highDone,reflectionDays:data.reflectDays},
    reflections:{
      wrong:data.wrong.map(x=>({date:fmt(x.date),text:x.text})),
      right:data.right.map(x=>({date:fmt(x.date),text:x.text})),
      better:data.better.map(x=>({date:fmt(x.date),text:x.text}))
    },
    manualNote:(S.g('reviewNotes',{})[manualKey(type,sel)]||'')
  }
}
function localSmartSummary(type){
  const p=reviewPayload(type),m=p.metrics,rate=m.taskTotal?Math.round(m.taskDone/m.taskTotal*100):0,hi=m.highTotal?Math.round(m.highDone/m.highTotal*100):0;
  const period=type==='week'?'这周':'这个月',next=type==='week'?'下周':'下个月';
  const allBetter=p.reflections.better.map(x=>x.text).filter(Boolean);
  const lines=[
    `【整体】${period}共安排 ${m.taskTotal} 项任务，完成 ${m.taskDone} 项，完成率 ${rate}%。复盘 ${m.reflectionDays} 天。`,
    `【重点】高优先级任务完成 ${m.highDone}/${m.highTotal}${m.highTotal?`，完成率 ${hi}%`:''}。`,
    `【反思记录】做错/不足 ${p.reflections.wrong.length} 条；做对/有效 ${p.reflections.right.length} 条；改进计划 ${p.reflections.better.length} 条。`,
    allBetter.length?`【${next}行动】优先从你已经写下的改进项开始：${allBetter.slice(0,3).join('；')}`:`【${next}行动】先补一条最具体、最容易执行的改进动作。`
  ];
  return lines.join('\n\n')
}
function aiStoreKey(type){return `${type}:${type==='week'?weekKey(sel):monthKey(sel)}`}
function renderAIStored(){
  const a=S.g('aiSummaries',{});
  const wk=a[aiStoreKey('week')],mk=a[aiStoreKey('month')];
  if($('#weekAI'))$('#weekAI').textContent=wk?.text||'点击“生成 AI 总结”后，会基于本周任务与每日三问生成一份结构化总结。';
  if($('#monthAI'))$('#monthAI').textContent=mk?.text||'点击“生成 AI 总结”后，会基于本月任务与每日三问生成一份结构化总结。'
}
async function generateAI(type){
  const btn=type==='week'?$('#aiWeekBtn'):$('#aiMonthBtn'),out=type==='week'?$('#weekAI'):$('#monthAI');
  const old=btn.textContent;btn.disabled=true;btn.innerHTML='<span class="spinner"></span>生成中';
  try{
    const res=await fetch('/api/summary',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(reviewPayload(type))});
    if(!res.ok)throw new Error(await res.text());
    const data=await res.json(); if(!data.summary)throw new Error('empty');
    out.textContent=data.summary;
  }catch(e){
    out.textContent=localSmartSummary(type)+'\n\n（当前未连接 AI 服务，以上为本地结构化总结。）'
  }finally{
    const all=S.g('aiSummaries',{});all[aiStoreKey(type)]={text:out.textContent,updatedAt:new Date().toISOString()};S.s('aiSummaries',all);
    btn.disabled=false;btn.textContent=old
  }
}
async function copyText(text){
  try{await navigator.clipboard.writeText(text);alert('已复制。')}catch{alert('复制失败，请手动选择文本。')}
}




$('#cloudBtn').onclick=()=>{
  if(!sb&&window.supabase)initSupabase();
  const c=cloudCfg();$('#sbUrl').value=c.url||'';$('#sbKey').value=c.key||'';
  $('#cloudModal').classList.add('show');updateCloudUI();if(sbUser)refreshCloudMeta()
};
$('#closeCloud').onclick=()=>$('#cloudModal').classList.remove('show');
$('#cloudModal').onclick=e=>{if(e.target===$('#cloudModal'))$('#cloudModal').classList.remove('show')};
$('#saveCloudConfig').onclick=saveCloudConfig;
$('#signUpBtn').onclick=signUp;$('#signInBtn').onclick=signIn;$('#signOutBtn').onclick=signOut;
$('#uploadCloud').onclick=()=>uploadCloud(false);$('#downloadCloud').onclick=downloadCloud;
$('#aiWeekBtn').onclick=()=>generateAI('week');$('#aiMonthBtn').onclick=()=>generateAI('month');
$('#copyWeekAI').onclick=()=>copyText($('#weekAI').textContent);$('#copyMonthAI').onclick=()=>copyText($('#monthAI').textContent);


$('#learningBtn').onclick=()=>openLearning('today');
$('#openLearningFromSide').onclick=()=>openLearning('today');
$('#closeLearning').onclick=closeLearning;
$('#learningModal').onclick=e=>{if(e.target===$('#learningModal'))closeLearning()};
document.querySelectorAll('[data-learning-tab]').forEach(b=>b.onclick=()=>{activeLearningTab=b.dataset.learningTab;renderLearningPanel();if(sbUser&&['stats','timer'].includes(activeLearningTab))refreshCloudMeta()});

$('#reviewBtn').onclick=openReview;
$('#closeReview').onclick=()=>$('#reviewModal').classList.remove('show');
$('#reviewModal').onclick=e=>{if(e.target===$('#reviewModal'))$('#reviewModal').classList.remove('show')};
$('#weeklyTab').onclick=()=>{$('#weeklyTab').classList.add('active');$('#monthlyTab').classList.remove('active');$('#weeklyReview').classList.add('active');$('#monthlyReview').classList.remove('active');renderWeekReview()};
$('#monthlyTab').onclick=()=>{$('#monthlyTab').classList.add('active');$('#weeklyTab').classList.remove('active');$('#monthlyReview').classList.add('active');$('#weeklyReview').classList.remove('active');renderMonthReview()};
$('#weekManual').oninput=()=>saveReviewNote('week');
$('#monthManual').oninput=()=>saveReviewNote('month');
$('#exportWeekMd').onclick=()=>{const x=reviewMarkdown('week');downloadText(x.name,x.text)};
$('#exportMonthMd').onclick=()=>{const x=reviewMarkdown('month');downloadText(x.name,x.text)};

$('#jumpWeekGoals').onclick=()=>$('#weekGoalsSection').scrollIntoView({behavior:'smooth',block:'center'});
$('#jumpMonthGoals').onclick=()=>{
  if(sel.getFullYear()!==view.getFullYear()||sel.getMonth()!==view.getMonth()){
    sel=new Date(view.getFullYear(),view.getMonth(),1,12);renderCal();renderSide()
  }
  $('#monthGoalsSection').scrollIntoView({behavior:'smooth',block:'center'})
};
$('#completeReflection').onclick=completeReflection;
$('#jumpDeadlineGoals').onclick=()=>$('#deadlineGoalsSection').scrollIntoView({behavior:'smooth',block:'center'});
$('#addDeadline').onclick=addDeadline;
$('#deadlineInput').onkeydown=e=>{if(e.key==='Enter')addDeadline()};

$('#prevBtn').onclick=()=>{view.setMonth(view.getMonth()-1);renderCal()};$('#nextBtn').onclick=()=>{view.setMonth(view.getMonth()+1);renderCal()};
$('#yearSelect').onchange=e=>{
  const y=Number(e.target.value);
  if(!Number.isFinite(y))return;
  const m=view.getMonth();
  view=new Date(y,m,1,12);
  // 年份切换后，把右侧详情定位到该年当前所显示月份的 1 日，避免详情仍停留在旧年份。
  sel=new Date(y,m,1,12);
  renderCal();renderSide();
};
$('#todayBtn').onclick=()=>{sel=new Date(now);view=new Date(now.getFullYear(),now.getMonth(),1);renderCal();renderSide()};
$('#addTask').onclick=addTask;$('#taskInput').onkeydown=e=>{if(e.key==='Enter')addTask()};
$('#repeat').onchange=syncRepeatEndUI;syncRepeatEndUI();
$('#clearComposer').onclick=()=>{$('#taskInput').value='';$('#reminder').value='';$('#priority').value='medium';$('#repeat').value='none';$('#repeatEnd').value='';syncRepeatEndUI()};
$('#scheduleEditBtn').onclick=openScheduleModal;
$('#closeScheduleModal').onclick=closeScheduleModal;
$('#scheduleModal').onclick=e=>{if(e.target===$('#scheduleModal'))closeScheduleModal()};
$('#schedulePreset').onchange=e=>{const c=COURSE_SCHEDULE.find(x=>x.id===e.target.value);fillScheduleForm(c||null)};
$('#clearScheduleForm').onclick=clearScheduleForm;
$('#addScheduleCourse').onclick=addScheduleCourseForSelectedDate;

$('#closeRepeatAction').onclick=closeRecurringAction;$('#repeatSkipOne').onclick=()=>finishRecurringAction('skip');$('#repeatEndFromHere').onclick=()=>finishRecurringAction('end');$('#repeatDeleteAll').onclick=()=>finishRecurringAction('all');
$('#repeatActionModal').onclick=e=>{if(e.target===$('#repeatActionModal'))closeRecurringAction()};
$('#addWeek').onclick=()=>addGoal('w');$('#addMonth').onclick=()=>addGoal('m');$('#weekInput').onkeydown=e=>{if(e.key==='Enter')addGoal('w')};$('#monthInput').onkeydown=e=>{if(e.key==='Enter')addGoal('m')};['q1','q2','q3'].forEach(id=>$('#'+id).oninput=saveR);

let modal=$('#modal');$('#annivBtn').onclick=()=>{modal.classList.add('show');$('#aDate').value=fmt(sel);renderAnnivManage()};$('#cancelA').onclick=()=>modal.classList.remove('show');
$('#saveA').onclick=()=>{let name=$('#aName').value.trim(),date=$('#aDate').value;if(!name||!date)return;A.push({id:uuid(),name,date,repeat:$('#aRepeat').checked});S.s('anniversaries',A);$('#aName').value='';renderAnniv();renderAnnivManage();renderCal()};
modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show')};

$('#exportBtn').onclick=exportData;$('#importBtn').onclick=()=>$('#importFile').click();$('#importFile').onchange=e=>{if(e.target.files[0])importData(e.target.files[0]);e.target.value=''};
$('#notifyBtn').onclick=askNotify;$('#bannerNotify').onclick=askNotify;

async function recoverSessionAndRetrySync(){
  if(!sb&&window.supabase)initSupabase();
  if(sb)await recoverSupabaseSession();
  if(sbUser)await refreshCloudMeta();
  retryPendingCloudSync()
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushCloudSyncOnLeave();else recoverSessionAndRetrySync()});
window.addEventListener('pagehide',()=>{flushCloudSyncOnLeave()});
window.addEventListener('pageshow',()=>{recoverSessionAndRetrySync()});
window.addEventListener('focus',()=>{recoverSessionAndRetrySync()});


/* ===== V1.5.5 高频计时 / 按钮反馈 / 复习预算 / 睡眠统计 ===== */
LS.uiFeedback=LS.uiFeedback&&typeof LS.uiFeedback==='object'?LS.uiFeedback:{sound:false,haptic:true};
LS.sleep=LS.sleep&&typeof LS.sleep==='object'?LS.sleep:{records:{}};
if(!LS.sleep.records||typeof LS.sleep.records!=='object')LS.sleep.records={};
if(!LS.spacedReviews.settings||typeof LS.spacedReviews.settings!=='object')LS.spacedReviews.settings={};
if(!Number.isFinite(Number(LS.spacedReviews.settings.dailyBudgetMin)))LS.spacedReviews.settings.dailyBudgetMin=15;

function v155Save(){persistLearningState()}
function timerActiveSeconds(){const a=LS.studyTimer.active;if(!a)return 0;let sec=Number(a.focusAccumSec||0);if(a.phase==='focus')sec+=Math.max(0,Math.floor((Date.now()-Date.parse(a.phaseStartedAt))/1000));return sec}
function ensureQuickTimerBar(){
  const panel=$('#learningPanel');if(!panel)return;let q=$('#v155QuickTimer');if(!q){q=document.createElement('div');q.id='v155QuickTimer';panel.parentNode.insertBefore(q,panel)}
  const a=LS.studyTimer.active,sec=a?timerActiveSeconds():todayStudySeconds();q.className='v155-quick-timer'+(a?' running':'');q.innerHTML=`<div class="v155-quick-main"><b>${a?`正在学习 · ${esc(a.subject)}`:'学习计时'}</b><small>${a?(a.note?esc(a.note):'已先保存在本机，结束后立即同步'):`今天已记录 ${secHuman(todayStudySeconds())} · 高频入口`}</small></div><div class="v155-quick-time" id="v155QuickTime">${a?secHuman(sec):secHuman(todayStudySeconds())}</div><button class="btn ${a?'learning-danger-btn':'primary'}" id="v155QuickBtn">${a?'结束并保存':'打开计时'}</button>`;
  $('#v155QuickBtn').onclick=()=>{if(LS.studyTimer.active)finishStudy();else{activeLearningTab='timer';renderLearningAll()}}
}
const v155RenderAllBase=renderLearningAll;
renderLearningAll=function(){v155RenderAllBase();ensureQuickTimerBar();renderButtonFeedbackSettingsIfNeeded()};
const v155UpdateTimerDOMBase=updateTimerDOM;
updateTimerDOM=function(){v155UpdateTimerDOMBase();const x=$('#v155QuickTime');if(x&&LS.studyTimer.active)x.textContent=secHuman(timerActiveSeconds())};

function v156TouchDevice(){return !!(navigator.maxTouchPoints>0||matchMedia('(pointer:coarse)').matches)}
function v156ImportantButton(b){
  if(!b)return false;
  if(b.matches('.primary,.learning-danger-btn,.reflect-confirm,[data-review-done]'))return true;
  return ['startStudyBtn','finishStudyBtn','v155QuickBtn','manualStudyAdd','slSave','completeReflection','saveA','addTask','addDeadline','addWeek','addMonth','addScheduleCourse','saveCloudConfig','signInBtn','uploadCloud','downloadCloud','todayDoneEnglish','todayDoneR2','todayDoneSkill','todayDoneFinance','todayDoneMath','doneNextR1','doneNextR2','doneNextSkill','doneNextFin','doneNextMath'].includes(b.id);
}
function v156EnsureToast(){let t=$('#v156Toast');if(!t){t=document.createElement('div');t.id='v156Toast';t.className='v156-toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');document.body.appendChild(t)}return t}
let v156ToastTimer=null;
function v156Toast(message,success=false){const t=v156EnsureToast();t.textContent=message;t.className='v156-toast'+(success?' success':'');requestAnimationFrame(()=>t.classList.add('show'));clearTimeout(v156ToastTimer);v156ToastTimer=setTimeout(()=>t.classList.remove('show'),1150)}
function v156PlayTone(strong=false,force=false){if(!force&&!LS.uiFeedback.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=window.__v155Audio||(window.__v155Audio=new C());if(c.state==='suspended')c.resume();const now=c.currentTime;[strong?520:470,strong?690:520].slice(0,strong?2:1).forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.setValueAtTime(strong ? .032 : .02,now+i*.035);g.gain.exponentialRampToValueAtTime(.0001,now+.07+i*.035);o.connect(g);g.connect(c.destination);o.start(now+i*.035);o.stop(now+.08+i*.035)})}catch{}}
function feedbackClick(button,{forceHaptic=false,forceSound=false,showToast=true}={}){
  const important=v156ImportantButton(button),touch=v156TouchDevice();
  if((forceHaptic||LS.uiFeedback.haptic)&&touch&&navigator.vibrate)try{navigator.vibrate(important||forceHaptic?22:7)}catch{}
  if(forceSound||LS.uiFeedback.sound)v156PlayTone(important,forceSound);
  if(important){button.classList.add('v156-important','v156-confirm-pop');setTimeout(()=>button.classList.remove('v156-confirm-pop'),340);if(showToast){const label=(button.textContent||'操作').trim().replace(/\s+/g,' ').slice(0,24);v156Toast(`✓ 已确认 · ${label}`,true)}}
}
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn');if(!b)return;b.classList.add('press-feedback');setTimeout(()=>b.classList.remove('press-feedback'),140)},true);
document.addEventListener('click',e=>{const b=e.target.closest('.btn');if(b&&b.id!=='v156FeedbackTest')feedbackClick(b)},true);
document.addEventListener('change',e=>{const x=e.target;if(!(x instanceof HTMLInputElement)||x.type!=='checkbox')return;if(!x.closest('.task,.deadline-item,.learning-item,.learning-review-check,.review-due'))return;if(x.checked){if(LS.uiFeedback.haptic&&v156TouchDevice()&&navigator.vibrate)try{navigator.vibrate(18)}catch{};v156Toast('✓ 已标记完成',true)}},true);
function renderButtonFeedbackSettingsIfNeeded(){
  if(activeLearningTab!=='timer')return;const host=$('#learningPanel .learning-section-card');if(!host||$('#v155FeedbackSettings'))return;const touch=v156TouchDevice(),vib=!!navigator.vibrate;const d=document.createElement('div');d.id='v155FeedbackSettings';d.className='v155-feedback-row';d.innerHTML=`<label><input type="checkbox" id="v155Haptic" ${LS.uiFeedback.haptic?'checked':''}> 手机震动</label><label><input type="checkbox" id="v155Sound" ${LS.uiFeedback.sound?'checked':''}> 点击音效</label><button class="btn" id="v156FeedbackTest" type="button">测试确认反馈</button><span class="v156-feedback-capability">视觉回弹始终开启；重要操作反馈更强。${touch?(vib?'当前设备可尝试震动，仍可能受系统/浏览器设置限制。':'当前浏览器未提供震动接口。'):'当前为桌面/鼠标环境，不执行震动。'} 音效默认关闭。</span>`;host.appendChild(d);$('#v155Haptic').onchange=e=>{LS.uiFeedback.haptic=e.target.checked;v155Save()};$('#v155Sound').onchange=e=>{LS.uiFeedback.sound=e.target.checked;v155Save()};$('#v156FeedbackTest').onclick=()=>{const b=$('#v156FeedbackTest');b.classList.add('v156-important');feedbackClick(b,{forceHaptic:true,forceSound:LS.uiFeedback.sound,showToast:false});v156Toast('✓ 确认反馈已触发',true)}
}

function energyModeExplanation(mode){return mode==='high'?'<b>高能量</b>完成当天核心量后，额外给 1 个“可选加量”任务；不做不欠账。':mode==='low'?'<b>低负荷</b>只保留最核心任务，复习和第二主科可以后移。':'<b>标准</b>只完成当天计划量，不主动加量；这是默认模式。'}
const v155TodayBase=renderLearningToday;
renderLearningToday=function(){v155TodayBase();const e=$('#learningPanel'),mode=energyFor();const sw=e.querySelector('.energy-switch');if(sw&&!e.querySelector('.v155-mode-note')){const n=document.createElement('div');n.className='v155-mode-note';n.innerHTML=energyModeExplanation(mode);sw.parentNode.appendChild(n)}
  if(mode==='high'&&!e.querySelector('#v155HighExtra')){const first=e.querySelector('.cockpit-stack .learning-section-card');if(first){const n=document.createElement('div');n.id='v155HighExtra';n.className='learning-status-box safe';const nextE=nextEnglishLesson(englishRound1Complete()?LS.english.round2:LS.english.round1),fd=nextFinanceDay(),md=nextMathDay();let tip=nextE?`英语再推进 ${englishLessonLabel(nextE)}`:(md?`高数再推进 Day ${md}`:(fd?`财经再推进原 Day ${fd}`:'做 20—30 分钟错题/回忆'));n.innerHTML=`<b>高能量加量（可选）</b><br>${tip}。只在核心量完成且仍然清醒时做，不完成不形成欠账。`;first.appendChild(n)}}
};

function reviewBacklog(){const k=learningTodayKey();return spacedReviewItems().filter(x=>x.due<=k&&!x.done)}
dueReviews=function(){const all=reviewBacklog().sort((a,b)=>a.due.localeCompare(b.due)||b.offset-a.offset),budget=Math.max(5,Number(LS.spacedReviews.settings.dailyBudgetMin)||15),limit=Math.max(1,Math.floor(budget/5));return all.slice(0,limit)};
renderSpacedReviews=function(){
  const e=$('#learningPanel'),all=reviewBacklog(),due=dueReviews(),up=upcomingReviews(),settings=LS.spacedReviews.settings,budget=Math.max(5,Number(settings.dailyBudgetMin)||15);
  const row=x=>`<div class="review-due"><div><div class="review-due-title">${esc(x.track)} · ${esc(x.title)}</div><div class="review-due-meta">第 ${x.offset} 天 · 原计划 ${x.due}</div></div><button class="btn" data-review-done="${x.key}">完成</button></div>`;
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>复习预算</h4><div class="learning-source-note">不再把逾期复习无限堆成“欠债”。每天只拿固定预算做最值得的几项，其余留在队列里等待。</div></div><span class="learning-chip green">今天最多 ${budget} 分钟</span></div><div class="v155-review-budget"><div><small>今日建议</small><b>${due.length} 项</b></div><div><small>总待复习</small><b>${all.length} 项</b></div><div><small>单项默认预算</small><b>≈ 5 分钟</b></div></div><div class="learning-row" style="margin-top:10px"><label class="small">每日预算 <input id="v155ReviewBudget" type="number" min="5" max="45" step="5" value="${budget}" style="width:72px"> 分钟</label><label class="check"><input id="revFinance" type="checkbox" ${settings.finance!==false?'checked':''}>财经</label><label class="check"><input id="revMath" type="checkbox" ${settings.math!==false?'checked':''}>高数</label><label class="check"><input id="revSkills" type="checkbox" ${settings.skills!==false?'checked':''}>四级技巧</label></div></div><div class="learning-section-card"><h4>今天只做这些</h4>${due.length?due.map(row).join(''):'<div class="learning-empty">今天没有必须占用复习预算的项目，放心推进新内容。</div>'}</div><div class="learning-section-card"><h4>后面的队列</h4><div class="learning-source-note">没有做完的不会变红催债，只保留顺序。</div>${up.length?up.slice(0,8).map(x=>`<div class="learning-mini-line"><b>${x.due}</b> · ${esc(x.track)} · ${esc(x.title)}</div>`).join(''):'<div class="learning-empty">暂无未来复习任务。</div>'}</div>`;
  $('#v155ReviewBudget').onchange=x=>{LS.spacedReviews.settings.dailyBudgetMin=Math.max(5,Math.min(45,Number(x.target.value)||15));v155Save();renderLearningAll()};$('#revFinance').onchange=x=>setReviewSetting('finance',x.target.checked);$('#revMath').onchange=x=>setReviewSetting('math',x.target.checked);$('#revSkills').onchange=x=>setReviewSetting('skills',x.target.checked);document.querySelectorAll('[data-review-done]').forEach(b=>b.onclick=()=>markReviewDone(b.dataset.reviewDone))
};

function sleepMinutes(bed,wake){if(!/^\d{2}:\d{2}$/.test(bed||'')||!/^\d{2}:\d{2}$/.test(wake||''))return 0;const [bh,bm]=bed.split(':').map(Number),[wh,wm]=wake.split(':').map(Number);let a=bh*60+bm,b=wh*60+wm;if(b<=a)b+=1440;return Math.max(0,b-a)}
function sleepRecord(k){return LS.sleep.records[k]||null}
function saveSleepRecord(k,bed,asleep,wake,difficulty,sleepiness,nap,note){if(!k||!bed||!asleep||!wake){alert('请填写日期、上床/估计睡着/起床时间。');return}LS.sleep.records[k]={date:k,bed,asleep,wake,difficulty:Number(difficulty)||3,sleepiness:Number(sleepiness)||3,nap:Math.max(0,Number(nap)||0),note:String(note||'').trim(),updatedAt:new Date().toISOString()};v155Save();renderLearningAll()}
function sleepDurationMin(r){return r?sleepMinutes(r.asleep,r.wake):0}
function sleepAvg(arr,fn){return arr.length?arr.reduce((s,x)=>s+fn(x),0)/arr.length:0}
function sleepHuman(min){return `${Math.floor(min/60)}小时${Math.round(min%60)}分`}
function renderSleep(){const e=$('#learningPanel'),today=learningTodayKey(),r=sleepRecord(today)||{},arr=Object.values(LS.sleep.records).filter(Boolean).sort((a,b)=>b.date.localeCompare(a.date)),recent=arr.slice(0,7),avg=sleepAvg(recent,sleepDurationMin),avgD=sleepAvg(recent,x=>Number(x.difficulty||0)),avgS=sleepAvg(recent,x=>Number(x.sleepiness||0)),nap=sleepAvg(recent,x=>Number(x.nap||0));let verdict='数据还少，先连续记录。';if(recent.length>=4){if(avg>=465&&avgD<=2.5&&avgS<=2.5)verdict='目前更像“睡够了”：白天状态和起床难度都不错。';else if(avg<450||avgD>=3.5||avgS>=3.5)verdict='目前有睡眠不足信号，先别为了早起硬砍睡眠。';else verdict='处在中间区间，再记录几天看趋势。'}
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>睡眠实验</h4><div class="learning-source-note">记录“估计睡着时间”，不追求精确到分钟；重点看睡眠时长和第二天状态是否匹配。V1.5.7 起睡眠记录按日期在本机与云端安全合并，旧云端不再直接清空本机记录。</div></div><span class="learning-chip blue">近 7 天 ${recent.length} 条</span></div><div class="sleep-summary" style="margin-top:10px"><div><small>平均睡眠</small><b>${recent.length?sleepHuman(avg):'—'}</b></div><div><small>起床难度</small><b>${recent.length?avgD.toFixed(1)+'/5':'—'}</b></div><div><small>白天困意</small><b>${recent.length?avgS.toFixed(1)+'/5':'—'}</b></div><div><small>平均午睡</small><b>${recent.length?Math.round(nap)+' 分':'—'}</b></div></div><div class="learning-status-box ${recent.length>=4&&avg<450?'warn':'safe'}" style="margin-top:10px"><b>阶段判断</b><br>${verdict}</div></div><div class="learning-section-card"><h4>今天 / 今早记录</h4><div class="sleep-form"><label>日期<input id="slDate" type="date" value="${today}"></label><label>上床<input id="slBed" type="time" value="${r.bed||'21:45'}"></label><label>估计睡着<input id="slAsleep" type="time" value="${r.asleep||'22:30'}"></label><label>起床<input id="slWake" type="time" value="${r.wake||'05:30'}"></label><label>起床难度<select id="slDiff">${[1,2,3,4,5].map(x=>`<option value="${x}" ${Number(r.difficulty||2)===x?'selected':''}>${x} / 5</option>`).join('')}</select></label><label>白天困意<select id="slSleepy">${[1,2,3,4,5].map(x=>`<option value="${x}" ${Number(r.sleepiness||2)===x?'selected':''}>${x} / 5</option>`).join('')}</select></label><label>午睡分钟<input id="slNap" type="number" min="0" max="240" value="${Number(r.nap||0)}"></label><label>备注<input id="slNote" type="text" autocomplete="off" value="${esc(r.note||'')}" placeholder="军训很累 / 无异常"></label></div><button class="btn primary" id="slSave" style="margin-top:10px">保存睡眠记录</button></div><div class="learning-section-card"><h4>最近记录</h4>${arr.length?arr.slice(0,10).map(x=>`<div class="sleep-row"><b>${x.date.slice(5)}</b><span>${x.asleep}→${x.wake} · ${sleepHuman(sleepDurationMin(x))} · 午睡 ${Number(x.nap||0)} 分</span><span class="sleep-score">困 ${x.sleepiness}/5</span></div>`).join(''):'<div class="learning-empty">还没有睡眠记录。</div>'}</div>`;
  $('#slSave').onclick=()=>saveSleepRecord($('#slDate').value,$('#slBed').value,$('#slAsleep').value,$('#slWake').value,$('#slDiff').value,$('#slSleepy').value,$('#slNap').value,$('#slNote').value)
}
const v155PanelBase=renderLearningPanel;
renderLearningPanel=function(){if(activeLearningTab==='sleep'){document.querySelectorAll('[data-learning-tab]').forEach(b=>b.classList.toggle('active',b.dataset.learningTab==='sleep'));renderSleep()}else v155PanelBase();ensureQuickTimerBar();renderButtonFeedbackSettingsIfNeeded()};

// 学习统计页顺带显示最近睡眠均值，方便对照精力与学习时长。
const v155StatsBase=renderLearningStats;
renderLearningStats=function(){v155StatsBase();const arr=Object.values(LS.sleep.records||{}).filter(Boolean).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);if(arr.length){const avg=sleepAvg(arr,sleepDurationMin),box=document.createElement('div');box.className='learning-section-card';box.innerHTML=`<div class="learning-row spread"><div><h4>睡眠 × 学习</h4><div class="learning-source-note">近 ${arr.length} 天平均睡眠 ${sleepHuman(avg)}。用这组数据观察“睡多久时，高数/财经最清醒”。</div></div><button class="btn" id="v155OpenSleep">记录睡眠</button></div>`;$('#learningPanel').prepend(box);$('#v155OpenSleep').onclick=()=>{activeLearningTab='sleep';renderLearningAll()}}};


/* ===== V1.5.7 英语双主线 + 睡眠数据安全合并 ===== */
// 技巧课不再等待词汇一轮完成：阅读 → 听力 → 翻译 → 写作。
// 保留原课程 id，避免已有完成记录因为重排而失效。
const ENGLISH_SKILL_PLAN_ORDER=[19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,10,11,12,13,14,15,16,17,18,6,7,8,9,1,2,3,4,5];
const ENGLISH_SKILL_DAILY_BLOCKS=[
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
function skillItemById(id){return ENGLISH_SKILLS.find(x=>Number(x.id)===Number(id))||null}
function skillDurationMinutes(x){const s=typeof x==='string'?x:(x?.duration||'0:00'),m=/^(\d+):(\d+)$/.exec(s);return m?Number(m[1])+Number(m[2])/60:0}
function skillMinutesHuman(min){min=Math.round(Math.max(0,min));return min>=60?`${Math.floor(min/60)}小时${String(min%60).padStart(2,'0')}分`:`${min}分钟`}
function nextSkillPlanId(){return ENGLISH_SKILL_PLAN_ORDER.find(id=>!LS.english.skills[String(id)])||null}
function currentSkillPlanBlock(){
  for(const b of ENGLISH_SKILL_DAILY_BLOCKS){const left=b.ids.filter(id=>!LS.english.skills[String(id)]);if(left.length){const min=left.reduce((n,id)=>n+skillDurationMinutes(skillItemById(id)),0);return {...b,left,minutes:min}}
  }return null
}
function skillPlanProgress(){const done=ENGLISH_SKILL_PLAN_ORDER.filter(id=>!!LS.english.skills[String(id)]).length;return {done,total:ENGLISH_SKILL_PLAN_ORDER.length}}
function skillBlockLabel(b){if(!b)return '技巧课已完成';return `技巧 Day ${b.day} · ${b.stage} · 约 ${skillMinutesHuman(b.minutes)}`}
function skillBlockLessonText(b){return b?b.left.map(id=>`第${id}节`).join('、'):''}

// 英语总览：第一轮和技巧课现在是并行双主线。
renderLearningOverview=function(){
  if(!$('#learnEnglishMetric'))return;const r1=englishDoneCount(LS.english.round1),r2=englishDoneCount(LS.english.round2),sk=learningDoneCount(LS.english.skills),n1=nextEnglishLesson(LS.english.round1),sb=currentSkillPlanBlock();
  $('#learnEnglishMetric').textContent=`${r1}/${ENGLISH_LESSON_TOTAL} · ${sk}/${ENGLISH_SKILLS.length}`;
  $('#learnEnglishBar').style.width=`${learningPct(r1+sk,ENGLISH_LESSON_TOTAL+ENGLISH_SKILLS.length)}%`;
  $('#learnEnglishNote').textContent=`词汇一轮 ${n1?englishLessonLabel(n1):'已完成'} · ${sb?`技巧 Day ${sb.day} ${sb.stage}`:'技巧已完成'}${englishRound1Complete()?` · 二轮 ${r2}/${ENGLISH_LESSON_TOTAL}`:''}`;
  const f=learningDoneCount(LS.finance.completions),m=learningDoneCount(LS.math.completions);$('#learnFinanceMetric').textContent=`${f} / 80`;$('#learnFinanceBar').style.width=`${learningPct(f,80)}%`;const fd=nextFinanceDay(),fp=fd?financePhaseByPosition(financeExecPosition(fd)):null;$('#learnFinanceNote').textContent=fd?`${fp.name} · 下一项原 Day ${fd}`:'80 天全部完成';$('#learnMathMetric').textContent=`${m} / 48`;$('#learnMathBar').style.width=`${learningPct(m,48)}%`;$('#learnMathNote').textContent=nextMathDay()?`下一项 Day ${nextMathDay()}`:'48 天全部完成';
  const nearest=learningNearestCountdown();if(nearest){const left=dayDiff(parse(nearest.date),learningTodayDate());$('#learnCountdownMetric').textContent=left>0?`还有 ${left} 天`:left===0?'今天':(nearest.endDate&&nearest.endDate>=learningTodayKey()?'进行中':'已结束');$('#learnCountdownNote').textContent=`${nearest.title} · ${countdownLabel(nearest)} · ${nearest.kind}`;const horizon=60;$('#learnCountdownBar').style.width=`${left<=0?100:left>=horizon?6:Math.max(6,Math.round((1-left/horizon)*100))}%`}else{$('#learnCountdownMetric').textContent='暂无';$('#learnCountdownNote').textContent='可在“倒数日”中添加';$('#learnCountdownBar').style.width='0%'}
  const w=weekStudySeconds();$('#learnStudyMetric').textContent=secHuman(w);$('#learnStudyBar').style.width=`${Math.min(100,Math.round(w/(20*3600)*100))}%`;$('#learnStudyNote').textContent=`今天 ${secHuman(todayStudySeconds())} · ${LS.studyTimer.active?'正在计时':'未开始计时'}`
};

renderLearningEnglish=function(){
  const e=$('#learningPanel'),r1=englishDoneCount(LS.english.round1),r2=englishDoneCount(LS.english.round2),sk=learningDoneCount(LS.english.skills),next=nextEnglishLesson(LS.english.round1),proj=projectEnglishRound1(),eligible=Math.max(1,countEligibleEnglishDays(maxDateKey(learningTodayKey(),LEARNING_CONFIG.militaryStart),LEARNING_CONFIG.round1SoftTarget)),required=Math.max(0,(ENGLISH_LESSON_TOTAL-r1)/eligible),cls=learningStatusClass(proj.date,LEARNING_CONFIG.round1SoftTarget),r1list=englishRoundListHtml(LS.english.round1,1),n2=nextEnglishLesson(LS.english.round2),nextSkill=nextSkillPlanId(),block=currentSkillPlanBlock();
  const modules=['阅读','听力','翻译','写作'];
  const skillHtml=modules.map(mod=>{const arr=ENGLISH_SKILL_PLAN_ORDER.map(skillItemById).filter(x=>x&&x.module===mod),doneN=arr.filter(x=>LS.english.skills[String(x.id)]).length;return `<div class="learning-module-title"><span>${mod}篇</span><span>${doneN}/${arr.length}</span></div><div class="learning-item-list">${arr.map(s=>{const v=LS.english.skills[String(s.id)],done=!!v;return `<label class="learning-item ${done?'done':''}"><input type="checkbox" data-en-skill="${s.id}" ${done?'checked':''}><div><div class="learning-item-title">${String(s.id).padStart(2,'0')} · ${esc(s.title)}</div><div class="learning-item-meta">${esc(s.duration)} · 刘晓燕《就这样过英语四级》</div></div><span class="learning-item-date">${done?esc(learningEntryDate(v)):''}</span></label>`}).join('')}</div>`}).join('');
  const planRows=ENGLISH_SKILL_DAILY_BLOCKS.map(b=>{const min=b.ids.reduce((n,id)=>n+skillDurationMinutes(skillItemById(id)),0),done=b.ids.every(id=>!!LS.english.skills[String(id)]),active=block&&block.day===b.day;return `<div class="learning-mini-line" style="${active?'font-weight:700':''}">${done?'✓':'○'} <b>Day ${b.day}</b> · ${esc(b.stage)} · ${skillMinutesHuman(min)} · ${b.ids.map(id=>`#${id}`).join(' / ')}</div>`}).join('');
  const r2card=englishRound1Complete()?`<div class="learning-section-card"><div class="learning-row spread"><h4>第二轮词汇 · ${r2}/${ENGLISH_LESSON_TOTAL}</h4>${n2?`<button class="btn primary" id="doneNextR2">今天完成 ${englishLessonLabel(n2)}</button>`:'<span class="learning-chip green">已完成</span>'}</div>${englishRoundListHtml(LS.english.round2,2)}</div>`:`<div class="learning-section-card"><div class="learning-lock">第二轮词汇仍保持原规则：第一轮 ${ENGLISH_LESSON_TOTAL}/${ENGLISH_LESSON_TOTAL} 完成后再开始。技巧课已经提前并行，不需要等第一轮结束。</div></div>`;
  e.innerHTML=burndownInlineHtml(englishRound1Complete()?['english1','english2','skills']:['english1','skills'],'英语进度趋势')+
  `<div class="learning-section-card"><div class="learning-row spread"><div><h4>英语四级词汇 · 第一轮 ${r1}/${ENGLISH_LESSON_TOTAL}</h4><div class="learning-source-note">每个学习日计划固定 1 个词汇 Lesson；不再因为课短或状态好自动建议第 2 个。第一次见词不要求一次记牢，后续通过阅读、真题和复习反复重逢。</div></div>${next?`<button class="btn primary" id="doneNextR1">今天完成 ${englishLessonLabel(next)}</button>`:'<span class="learning-chip green">第一轮完成</span>'}</div><div class="learning-status-box ${cls}" style="margin-top:9px"><b>动态预测：${dateHuman(proj.date)}</b><br>软目标 ${dateHuman(LEARNING_CONFIG.round1SoftTarget)}；技巧课不再受这个目标锁定。</div>${r1list}</div>`+
  `<div class="learning-section-card"><div class="learning-row spread"><div><h4>四级技巧 · ${sk}/${ENGLISH_SKILLS.length}</h4><div class="learning-source-note">新顺序：<b>阅读 → 听力 → 翻译 → 写作</b>。技巧课与词汇并行推进；阅读相关内容同时做精读，只筛选真正影响理解、反复出现或高频的词进入生词复习。不要见词就背。军训特别累时允许减量，不制造欠账。</div></div>${nextSkill?`<button class="btn primary" id="doneNextSkill">完成下一节 · #${nextSkill}</button>`:'<span class="learning-chip green">技巧完成</span>'}</div>${block?`<div class="learning-status-box safe" style="margin-top:9px"><b>当前：${esc(skillBlockLabel(block))}</b><br>剩余课程：${esc(skillBlockLessonText(block))}。整组只作为约 2 小时的目标块，具体完成几节按当天体力。</div>`:''}<details class="subject-burndown" open style="margin-top:10px"><summary><span>14 个标准学习日计划表</span><span class="learning-chip blue">总视频约 25小时50分</span></summary><div class="subject-burndown-body">${planRows}</div></details>${skillHtml}</div>`+r2card;
  bindInlineBurndown(englishRound1Complete()?['english1','english2','skills']:['english1','skills']);
  document.querySelectorAll('[data-en-r1]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.round1,x.dataset.enR1,ev.target.checked);renderLearningAll()});
  document.querySelectorAll('[data-en-r2]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.round2,x.dataset.enR2,ev.target.checked);renderLearningAll()});
  document.querySelectorAll('[data-en-skill]').forEach(x=>x.onchange=ev=>{learningMark(LS.english.skills,x.dataset.enSkill,ev.target.checked);renderLearningAll()});
  if($('#doneNextR1'))$('#doneNextR1').onclick=()=>{learningMark(LS.english.round1,nextEnglishLesson(LS.english.round1),true);renderLearningAll()};
  if($('#doneNextR2'))$('#doneNextR2').onclick=()=>{learningMark(LS.english.round2,nextEnglishLesson(LS.english.round2),true);renderLearningAll()};
  if($('#doneNextSkill'))$('#doneNextSkill').onclick=()=>{const id=nextSkillPlanId();if(id)learningMark(LS.english.skills,id,true);renderLearningAll()}
};

renderLearningToday=function(){
  const e=$('#learningPanel'),k=learningTodayKey(),d=learningTodayDate(),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),monday=d.getDay()===1,mode=energyFor(k),r=learningReviewFor(k),todayItems=learningCompletionItemsOnDate(k),due=dueReviews(),free=LS.freeLogs.filter(x=>x.date===k),fd=nextFinanceDay(),md=nextMathDay(),nextR1=nextEnglishLesson(LS.english.round1),nextR2=nextEnglishLesson(LS.english.round2),block=currentSkillPlanBlock(),nearest=learningUpcomingCountdowns().slice(0,3);let tasks=[];
  if(nextR1)tasks.push({rank:'核心',cls:'core',title:`词汇一轮 · ${englishLessonLabel(nextR1)}`,meta:'计划量固定 1 个 Lesson；完成今天这一节就达标，不再自动加第 2 个。',action:'r1'});
  else if(nextR2)tasks.push({rank:'核心',cls:'core',title:`词汇二轮 · ${englishLessonLabel(nextR2)}`,meta:'第一轮完成后独立推进二轮。',action:'r2'});
  if(block)tasks.push({rank:'核心',cls:'core',title:skillBlockLabel(block),meta:`${skillBlockLessonText(block)} · 技巧学习同时精读阅读题，只筛选并背高价值生词。`,action:'skillpage',button:'去英语页'});
  if(monday&&!r.weekly)tasks.push({rank:'复习',cls:'extra',title:'英语 · 一周总复习',meta:'保留周复习，但不再因此取消当天的新 Lesson。',action:'weekly'});
  if(!busy&&formalAdvanceAllowed(k)){if(fd)tasks.push({rank:mil?'自选':(mode==='low'?'可后移':'核心'),cls:mil||mode==='low'?'extra':'core',title:`财经 · 原 Day ${fd}${mil?'（自愿推进）':''}`,meta:`${financeItem(fd)?.subject||''} · ${financeItem(fd)?.title||''}`,action:'finance'});if(md&&(mil||mode==='high'||mode==='normal'))tasks.push({rank:mil?'自选':(mode==='high'?'核心':'建议'),cls:mil||mode!=='high'?'extra':'core',title:`高数 · Day ${md}${mil?'（自愿推进）':''}`,meta:`${mathItem(md)?.lectures?.length||0} 个视频 · ${durationHuman(mathDayDuration(mathItem(md)))}`,action:'math'})}
  if(busy)tasks=tasks.filter(x=>['weekly','r1','r2','skillpage'].includes(x.action));if(!tasks.length)tasks.push({rank:'完成',cls:'extra',title:'今天没有必须推进的新内容',meta:'可以做复习、计时学习，或者直接休息。',action:''});
  const taskHtml=tasks.map(x=>`<div class="cockpit-task ${x.cls}"><span class="rank">${x.rank}</span><div><div class="cockpit-task-title">${esc(x.title)}</div><div class="cockpit-task-meta">${esc(x.meta)}</div></div>${x.action?`<button class="btn" data-cockpit-action="${x.action}">${esc(x.button||'完成')}</button>`:''}</div>`).join('');
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>今日学习 · ${k} · 周${wd(d)}</h4><div class="learning-source-note">${mil?'军训弹性保护：英语照常，但疲劳时允许把 2 小时技巧目标主动降档；高数/财经不形成每日欠账。':'英语采用“1 个词汇 Lesson + 技巧课 + 阅读精读生词”三件套；状态差就减量，不把计划变成债。'}</div></div><span class="learning-chip ${mil?'orange':busy?'red':'green'}">${mil?'军训弹性':busy?'缓冲':'正常'}</span></div><div class="energy-switch" style="margin-top:9px"><button class="btn ${mode==='high'?'active':''}" data-energy="high">高能量</button><button class="btn ${mode==='normal'?'active':''}" data-energy="normal">标准</button><button class="btn ${mode==='low'?'active':''}" data-energy="low">低负荷</button></div><div class="v155-mode-note">${energyModeExplanation(mode)}</div></div><div class="cockpit-grid"><div class="cockpit-stack"><div class="learning-section-card"><div class="learning-row spread"><h4>今天先做什么</h4><span class="learning-chip">${energyLabel(mode)}模式</span></div>${taskHtml}</div><div class="learning-section-card"><div class="learning-row spread"><h4>固定词汇复习</h4><span class="learning-chip">早晚 + 周一</span></div><div class="learning-review-grid"><label class="learning-review-check"><input type="checkbox" id="reviewMorning" ${r.morning?'checked':''}><span><b>早上复习昨日词汇</b><small>快速主动回忆。</small></span></label><label class="learning-review-check"><input type="checkbox" id="reviewEvening" ${r.evening?'checked':''}><span><b>晚上复习昨日词汇</b><small>睡前检索卡壳词。</small></span></label><label class="learning-review-check" style="${monday?'':'opacity:.48'}"><input type="checkbox" id="reviewWeekly" ${r.weekly?'checked':''} ${monday?'':'disabled'}><span><b>周一一周总复习</b><small>${monday?'今天执行。':'仅周一开启。'}</small></span></label></div></div><div class="learning-section-card"><div class="learning-row spread"><h4>到期复习</h4><button class="btn" id="openReviewToday">查看复习</button></div>${due.length?due.slice(0,4).map(x=>`<div class="learning-mini-line"><b>${esc(x.track)}</b> · ${esc(x.title)} · 第${x.offset}天</div>`).join(''):'<div class="learning-empty">今天没有自动到期复习。</div>'}</div></div><div class="cockpit-stack"><div class="learning-section-card"><div class="learning-row spread"><h4>专注计时</h4><b>${secHuman(todayStudySeconds())}</b></div><button class="btn primary" id="openTimerToday" style="width:100%;margin-top:9px">开始 / 查看计时</button></div><div class="learning-section-card"><div class="learning-row spread"><h4>近期节点</h4><button class="btn" id="openCountdownsToday">管理</button></div>${nearest.length?nearest.map(x=>`<div class="learning-mini-line"><b>${esc(x.title)}</b> · ${learningCountdownText(x.date,x.endDate)}</div>`).join(''):'<div class="learning-empty">暂无倒数日。</div>'}</div><div class="learning-section-card"><h4>自主学习记录</h4><div class="learning-free-row"><select id="freeTrack"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select><input id="freeText" type="text" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="写下额外学习内容"><button class="btn" id="addFreeLog">记录</button></div>${free.length?free.map(x=>`<div class="learning-free-log"><span>${esc(x.track)} · ${esc(x.text)}</span><button class="x" data-free-id="${x.id}">×</button></div>`).join(''):'<div class="learning-empty">今天还没有自主学习记录。</div>'}</div><div class="learning-section-card"><h4>今天已经完成</h4>${todayItems.length?todayItems.map(x=>`<div class="learning-mini-line">✓ ${esc(x)}</div>`).join(''):'<div class="learning-empty">正式学习项目还没有打勾。</div>'}</div></div></div>`;
  if(mode==='high'&&!e.querySelector('#v155HighExtra')){const first=e.querySelector('.cockpit-stack .learning-section-card');if(first){const n=document.createElement('div');n.id='v155HighExtra';n.className='learning-status-box safe';n.innerHTML='<b>高能量加量（可选）</b><br>核心英语量完成后，再从高数 / 财经 / 错题回忆里任选一项；不完成不欠账。';first.appendChild(n)}}
  document.querySelectorAll('[data-energy]').forEach(b=>b.onclick=()=>setEnergy(b.dataset.energy,k));$('#reviewMorning').onchange=x=>setLearningReview('morning',x.target.checked,k);$('#reviewEvening').onchange=x=>setLearningReview('evening',x.target.checked,k);if(monday)$('#reviewWeekly').onchange=x=>setLearningReview('weekly',x.target.checked,k);
  document.querySelectorAll('[data-cockpit-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.cockpitAction;if(a==='weekly')setLearningReview('weekly',true,k);else if(a==='r1')learningMark(LS.english.round1,nextEnglishLesson(LS.english.round1),true,k);else if(a==='r2')learningMark(LS.english.round2,nextEnglishLesson(LS.english.round2),true,k);else if(a==='skillpage'){activeLearningTab='english';renderLearningAll();return}else if(a==='finance')learningMark(LS.finance.completions,nextFinanceDay(),true,k);else if(a==='math')learningMark(LS.math.completions,nextMathDay(),true,k);renderLearningAll()});
  $('#openTimerToday').onclick=()=>{activeLearningTab='timer';renderLearningAll()};$('#openReviewToday').onclick=()=>{activeLearningTab='review';renderLearningAll()};$('#openCountdownsToday').onclick=()=>{activeLearningTab='countdowns';renderLearningAll()};$('#addFreeLog').onclick=()=>addFreeLearningLog($('#freeTrack').value,$('#freeText').value,k);document.querySelectorAll('[data-free-id]').forEach(b=>b.onclick=()=>removeFreeLearningLog(b.dataset.freeId))
};

// 首页小卡也同时展示词汇和技巧，不再等第一轮结束才看见技巧。
renderLearningMini=function(){
  const e=$('#learningMini');if(!e)return;const k=fmt(sel),isToday=k===learningTodayKey(),items=learningCompletionItemsOnDate(k),mil=isMilitaryKey(k),busy=isLearningBusyKey(k),cds=learningCountdownsOnDate(k),chips=[];if(cds.length)chips.push(`<span class="learning-chip blue">⌛ ${esc(cds[0].title)}${cds.length>1?` +${cds.length-1}`:''}</span>`);if(mil)chips.push('<span class="learning-chip orange">军训弹性保护</span>');if(busy)chips.push('<span class="learning-chip red">缓冲日</span>');if(items.length)chips.push(`<span class="learning-chip green">完成 ${items.length} 项</span>`);if(isToday&&LS.studyTimer.active)chips.push(`<span class="learning-chip green">计时 · ${esc(LS.studyTimer.active.subject)}</span>`);let lines=cds.map(x=>`<div class="learning-mini-line"><b>${esc(x.kind||'考试')}</b> · ${esc(x.title)} · ${countdownLabel(x)}</div>`).join('');if(items.length)lines+=items.slice(0,4).map(x=>`<div class="learning-mini-line">✓ ${esc(x)}</div>`).join('')+(items.length>4?`<div class="learning-source-note">还有 ${items.length-4} 项记录。</div>`:'');if(!items.length&&isToday){const r1=nextEnglishLesson(LS.english.round1),sb=currentSkillPlanBlock(),fd=nextFinanceDay(),md=nextMathDay();lines+=`<div class="learning-mini-line"><b>今天专注</b> · ${secHuman(todayStudySeconds())}　<b>能量</b> · ${energyLabel(energyFor())}</div>`;lines+=`<div class="learning-mini-line"><b>英语</b> · ${r1?englishLessonLabel(r1):`二轮 ${englishDoneCount(LS.english.round2)}/${ENGLISH_LESSON_TOTAL}`} · ${sb?`技巧 Day ${sb.day} 约 ${skillMinutesHuman(sb.minutes)}`:'技巧已完成'}</div>`;if(!busy&&formalAdvanceAllowed(k))lines+=`<div class="learning-mini-line"><b>${mil?'可选推进':'今日队列'}</b> · 财经 ${fd?`原 Day ${fd}`:'已完成'}　高数 ${md?`Day ${md}`:'已完成'}</div>`}else if(!items.length&&!cds.length)lines='<div class="learning-empty">动态计划根据实时进度生成。</div>';e.innerHTML=`<div class="learning-mini-status">${chips.join('')||'<span class="learning-chip">动态队列</span>'}</div>${lines}`;$('#learningMiniStat').textContent=items.length?`${items.length} 项`:''
};

// 睡眠数据：与学习计时一样采用“合并而不是整块覆盖”。同一天两边都有记录时，updatedAt 更新者优先；时间缺失时优先保留本机。
function sleepRecordsFromPayload(payload){const r=payload?.learningState?.sleep?.records;return r&&typeof r==='object'&&!Array.isArray(r)?r:{}}
function sleepRecordStamp(r){const t=Date.parse(r?.updatedAt||'');return Number.isFinite(t)?t:0}
function mergeSleepRecords(localRecords,remoteRecords){
  const l=localRecords&&typeof localRecords==='object'?localRecords:{},r=remoteRecords&&typeof remoteRecords==='object'?remoteRecords:{},out={};
  for(const k of new Set([...Object.keys(r),...Object.keys(l)])){const a=l[k],b=r[k];if(a&&b){const at=sleepRecordStamp(a),bt=sleepRecordStamp(b);out[k]=bt>at?b:a}else out[k]=a||b}
  return out
}
function mergeRemoteStudyLedgerIntoLocal(remotePayload,{persist=true}={}){
  const remote=studyLedger(remotePayload),local=mergeStudyLedger(LS.studyTimer.sessions,LS.studyTimer.deletedSessionIds,remote.sessions,remote.deleted),sleepMerged=mergeSleepRecords(LS.sleep?.records||{},sleepRecordsFromPayload(remotePayload));
  const before=JSON.stringify([LS.studyTimer.sessions,LS.studyTimer.deletedSessionIds||[],LS.sleep?.records||{}]);LS.studyTimer.sessions=local.sessions;LS.studyTimer.deletedSessionIds=local.deletedSessionIds;LS.sleep=LS.sleep&&typeof LS.sleep==='object'?LS.sleep:{records:{}};LS.sleep.records=sleepMerged;
  const changed=before!==JSON.stringify([local.sessions,local.deletedSessionIds,sleepMerged]);if(changed&&persist){originalSet('learningState',LS);renderLearningOverview();renderLearningMini();if($('#learningModal')?.classList.contains('show'))renderLearningPanel()}return changed
}
function stableCloneWithoutStudyLedger(payload){
  const x=JSON.parse(JSON.stringify(payload||{}));delete x.savedAt;delete x.version;if(x.learningState){delete x.learningState.version}if(x.learningState?.studyTimer){x.learningState.studyTimer.sessions=[];x.learningState.studyTimer.deletedSessionIds=[];x.learningState.studyTimer.active=null}if(x.learningState?.sleep)x.learningState.sleep.records={};return x
}
async function downloadCloud(force=false){
  if(!sb||!sbUser){alert('请先登录云端账号。');return}
  setCloudStatus('busy','检查云端');const {data,error}=await fetchCloudState();if(error){setCloudStatus('off','下载失败');alert(error.message);return}if(!data?.payload){setCloudStatus('on','云端为空');alert('云端还没有日历数据。');return}
  const m=syncMeta(),remoteAt=data.updated_at||'',dirty=localIsDirty(m);if(dirty&&!force){const ok=confirm(`本机存在尚未确认同步的修改：\n\n本地最后修改：${fmtSyncTime(m.localUpdatedAt)}\n云端最后修改：${fmtSyncTime(remoteAt)}\n\n继续下载时，学习计时与睡眠记录会先自动合并；其他数据仍以云端版本为准。确定继续吗？`);if(!ok){setCloudStatus('on','云端已登录');return}}else if(!confirm(`云端数据更新时间：${fmtSyncTime(remoteAt)}。\n学习计时与睡眠记录会安全合并；其他数据使用云端版本。继续吗？`)){setCloudStatus('on','云端已登录');return}
  const remotePayload=JSON.parse(JSON.stringify(data.payload)),mergedLedger=mergeStudyLedger(LS.studyTimer.sessions,LS.studyTimer.deletedSessionIds,studyLedger(remotePayload).sessions,studyLedger(remotePayload).deleted),mergedSleep=mergeSleepRecords(LS.sleep?.records||{},sleepRecordsFromPayload(remotePayload));
  if(!remotePayload.learningState)remotePayload.learningState={};if(!remotePayload.learningState.studyTimer)remotePayload.learningState.studyTimer={active:null,sessions:[]};remotePayload.learningState.studyTimer.sessions=mergedLedger.sessions;remotePayload.learningState.studyTimer.deletedSessionIds=mergedLedger.deletedSessionIds;remotePayload.learningState.studyTimer.active=LS.studyTimer.active;if(!remotePayload.learningState.sleep)remotePayload.learningState.sleep={records:{}};remotePayload.learningState.sleep.records=mergedSleep;
  applySnapshot(remotePayload);const syncedAt=new Date().toISOString();saveSyncMeta({lastSyncedCloudAt:remoteAt,cloudUpdatedAt:remoteAt,lastSyncedAt:syncedAt,localUpdatedAt:syncedAt,conflict:false});clearCloudDirty();setCloudStatus('on','已同步');alert('云端数据已恢复；学习计时与睡眠记录已安全合并。')
}



/* ===== V1.5.8 学习—休息—调休—奖励制度 ===== */
const V158_TIME_CLASSES={
  'CORE-DEEP':{label:'CORE-DEEP 深度学习',count:true,group:'核心',help:'做题、学新内容、案例分析等持续认知加工。'},
  'CORE-RETRIEVAL':{label:'CORE-RETRIEVAL 提取复习',count:true,group:'核心',help:'闭卷回忆、错题提取、间隔复习、模拟测验。'},
  'ACTIVE-CLASS':{label:'ACTIVE-CLASS 主动网课/课堂',count:true,group:'核心',help:'专注听课并做笔记/题目，课后能闭卷回忆。'},
  'OTHER-ACADEMIC':{label:'OTHER-ACADEMIC 其他学业/竞赛',count:false,group:'其他',help:'职规赛、安全竞赛、非专转本核心学习。'},
  'ADMIN':{label:'ADMIN 行政/排版/找资料',count:false,group:'其他',help:'PPT排版、下载资料、整理文件、计划等。'},
  'REST':{label:'REST 休息/娱乐',count:false,group:'其他',help:'恢复、游戏、约会、散步等，不冒充学习。'}
};
const V158_CORE_CLASSES=new Set(Object.keys(V158_TIME_CLASSES).filter(k=>V158_TIME_CLASSES[k].count));
function v158PolicyDefault(){return {version:1,weeklyRestDay:6,weekdayTargetMin:330,sundayTargetMin:270,flex:{balance:0,cap:6,monthlyCredit:2,lastCreditMonth:'',used:{}},monthlyMetrics:{},settlements:{},restInbox:[],migrations:{}}}
function v158NormalizePolicy(raw){
  const d=v158PolicyDefault(),x=raw&&typeof raw==='object'?raw:{};
  d.weeklyRestDay=6;d.weekdayTargetMin=330;d.sundayTargetMin=270;
  const f=x.flex&&typeof x.flex==='object'?x.flex:{};d.flex.balance=Math.max(0,Math.min(6,Number(f.balance)||0));d.flex.cap=6;d.flex.monthlyCredit=2;d.flex.lastCreditMonth=/^\d{4}-\d{2}$/.test(String(f.lastCreditMonth||''))?String(f.lastCreditMonth):'';d.flex.used=f.used&&typeof f.used==='object'?f.used:{};
  d.monthlyMetrics=x.monthlyMetrics&&typeof x.monthlyMetrics==='object'?x.monthlyMetrics:{};d.settlements=x.settlements&&typeof x.settlements==='object'?x.settlements:{};d.restInbox=Array.isArray(x.restInbox)?x.restInbox:[];d.migrations=x.migrations&&typeof x.migrations==='object'?x.migrations:{};return d
}
function v158MonthKeyFromDateKey(k){return String(k||'').slice(0,7)}
function v158NextMonthKey(m){const [y,mo]=String(m).split('-').map(Number),d=new Date(y,mo,1,12);return `${d.getFullYear()}-${pad(d.getMonth()+1)}`}
function v158EnsureFlexAccrual(){
  const f=LS.lifePolicy.flex,current=v158MonthKeyFromDateKey(learningTodayKey());
  if(!f.lastCreditMonth){f.lastCreditMonth=current;f.balance=Math.min(f.cap,f.balance+f.monthlyCredit);return true}
  let cursor=f.lastCreditMonth,changed=false,guard=0;while(cursor<current&&guard<48){cursor=v158NextMonthKey(cursor);if(f.balance<f.cap)f.balance=Math.min(f.cap,f.balance+f.monthlyCredit);f.lastCreditMonth=cursor;changed=true;guard++}return changed
}
function v158DefaultClassForSubject(subject){return ['英语','财经','高数'].includes(subject)?'CORE-DEEP':'OTHER-ACADEMIC'}
function v158EnsurePolicy(){
  LS.lifePolicy=v158NormalizePolicy(LS.lifePolicy);let changed=v158EnsureFlexAccrual();
  if(!LS.lifePolicy.migrations.v158SessionClasses){
    for(const x of LS.studyTimer.sessions||[]){if(!V158_TIME_CLASSES[x.timeClass]){x.timeClass=v158DefaultClassForSubject(x.subject);x.classificationSource='V1.5.8旧记录兼容';changed=true}}
    if(LS.studyTimer.active&&!V158_TIME_CLASSES[LS.studyTimer.active.timeClass]){LS.studyTimer.active.timeClass=v158DefaultClassForSubject(LS.studyTimer.active.subject);changed=true}
    LS.lifePolicy.migrations.v158SessionClasses=true;changed=true
  }
  LS.version=Math.max(10,Number(LS.version)||0);return changed
}
const v158NormalizeBase=normalizeLearningState;
normalizeLearningState=function(raw){const d=v158NormalizeBase(raw);d.lifePolicy=v158NormalizePolicy(raw?.lifePolicy);LS=d;v158EnsurePolicy();return LS};
v158EnsurePolicy();

function v158DateDay(k){return parse(k).getDay()}
function v158IsWeeklyRestDay(k){return v158DateDay(k)===6}
function v158IsFlexLeaveDay(k){return !!LS.lifePolicy?.flex?.used?.[k]}
function v158IsProtectedRestDay(k){return v158IsWeeklyRestDay(k)||v158IsFlexLeaveDay(k)}
function v158DailyTargetMin(k){if(v158IsProtectedRestDay(k))return 0;return v158DateDay(k)===0?LS.lifePolicy.sundayTargetMin:LS.lifePolicy.weekdayTargetMin}
function v158ScheduledMonthMinutes(month){const [y,m]=month.split('-').map(Number);let d=new Date(y,m-1,1,12),end=new Date(y,m,0,12),n=0;for(;d<=end;d.setDate(d.getDate()+1))n+=v158DailyTargetMin(fmt(d));return n}
function v158ScheduledWeekMinutes(date=learningTodayDate()){const a=startOfWeek(date),b=endOfWeek(date);let d=new Date(a),n=0;for(;d<=b;d.setDate(d.getDate()+1))n+=v158DailyTargetMin(fmt(d));return n}
function v158SessionClass(x){return V158_TIME_CLASSES[x?.timeClass]?x.timeClass:v158DefaultClassForSubject(x?.subject)}
function v158SessionCounts(x){return V158_CORE_CLASSES.has(v158SessionClass(x))}
function v158EffectiveSecondsBetween(a,b){let sec=(LS.studyTimer.sessions||[]).filter(x=>{const k=sessionDate(x);return k>=a&&k<=b&&v158SessionCounts(x)}).reduce((s,x)=>s+Number(x.focusSeconds||0),0);const act=LS.studyTimer.active;if(act&&v158SessionCounts(act)){const k=learningTodayKey();if(k>=a&&k<=b)sec+=activeStudyFocusSeconds()}return sec}
function v158EffectiveTodaySeconds(){const k=learningTodayKey();return v158EffectiveSecondsBetween(k,k)}
function v158EffectiveMonthSeconds(month){const [y,m]=month.split('-').map(Number),a=`${month}-01`,b=fmt(new Date(y,m,0,12));return v158EffectiveSecondsBetween(a,b)}
function v158EffectiveWeekSeconds(){const [a,b]=studyWeekRange();return v158EffectiveSecondsBetween(a,b)}
function v158MonthFlexDates(month){return Object.keys(LS.lifePolicy.flex.used||{}).filter(k=>k.startsWith(month)).sort()}
function v158MonthExtraLeaveReductionMin(month){const dates=v158MonthFlexDates(month);if(dates.length<=2)return 0;return dates.slice(2).reduce((s,k)=>s+(v158DateDay(k)===0?270:330),0)}
function v158RecentMonthKeys(month,n=3){const [y,m]=month.split('-').map(Number),out=[];let d=new Date(y,m-1,1,12);for(let i=0;i<n;i++){out.unshift(`${d.getFullYear()}-${pad(d.getMonth()+1)}`);d.setMonth(d.getMonth()-1)}return out}
function v158MovingAverageHours(month){const ms=v158RecentMonthKeys(month,3),vals=ms.map(m=>v158EffectiveMonthSeconds(m)/3600);return vals.reduce((a,b)=>a+b,0)/vals.length}
function v158AdjustedTimeThresholds(month){const leaveCount=v158MonthFlexDates(month).length,rawReduction=v158MonthExtraLeaveReductionMin(month),avg=v158MovingAverageHours(month),holiday=leaveCount>=3&&avg>=120,reduction=holiday?rawReduction/60:0;return {s:Math.max(0,138-reduction),a:Math.max(0,128-reduction),b:Math.max(0,120-reduction),holiday,leaveCount,reduction,avg}}
function v158MonthSleepStats(month){const arr=Object.values(LS.sleep?.records||{}).filter(x=>x?.date?.startsWith(month));const total=arr.reduce((s,x)=>s+sleepDurationMin(x),0);return {count:arr.length,avgMin:arr.length?total/arr.length:0,goodNights:arr.filter(x=>sleepDurationMin(x)>=420).length}}
function v158Metric(month){const x=LS.lifePolicy.monthlyMetrics[month]||{};return {cop:Math.max(0,Number(x.cop)||0),retrieval:Math.max(0,Number(x.retrieval)||0),retrievalCount:Math.max(0,Math.round(Number(x.retrievalCount)||0)),errorImprove:Number.isFinite(Number(x.errorImprove))?Number(x.errorImprove):0,lowErrorMaintained:!!x.lowErrorMaintained}}
function v158ScoreMonth(month){
  const h=v158EffectiveMonthSeconds(month)/3600,t=v158AdjustedTimeThresholds(month),m=v158Metric(month),err=m.lowErrorMaintained?25:m.errorImprove;
  let timeScore=h>=t.s?35:h>=t.a?31:h>=t.b?27:h>=Math.max(0,110-t.reduction)?20:10;
  let copScore=m.cop>=100?25:m.cop>=95?23:m.cop>=85?19:m.cop>=70?13:6;
  let retScore=m.retrieval>=88?25:m.retrieval>=82?22:m.retrieval>=75?18:m.retrieval>=68?12:6;
  let errScore=err>=25?15:err>=15?12:err>=0?9:0,total=timeScore+copScore+retScore+errScore;
  let grade='C';if(total>=90&&h>=t.s&&m.cop>=100&&m.retrieval>=88&&err>=25)grade='S';else if(total>=80&&h>=t.a&&m.cop>=95&&m.retrieval>=82&&err>=15)grade='A';else if(total>=70&&h>=t.b&&m.cop>=85&&m.retrieval>=75&&err>=0)grade='B';
  if(m.retrievalCount<8&&(grade==='S'||grade==='A'))grade='B';
  const sleep=v158MonthSleepStats(month);if(grade==='S'&&sleep.count>=14&&sleep.avgMin<420)grade='A';
  return {grade,total,timeScore,copScore,retScore,errScore,h,t,m,err,sleep,tokens:grade==='S'?3:grade==='A'?2:grade==='B'?1:0}
}
function v158GradeAction(g){return g==='S'?'维持方案，不给下月加码。':g==='A'?'维持原方案，这是长期理想常态。':g==='B'?'做30分钟诊断；下月新内容量最多下调5%。':'做60分钟根因分析；下月新内容量下调10%，执行14天针对性修正。'}
function v158SavePolicy(){S.s('learningState',LS);renderLearningOverview();renderLearningMini();renderCal()}
function v158SetMonthlyMetrics(month,cop,retrieval,retrievalCount,errorImprove,lowErrorMaintained){LS.lifePolicy.monthlyMetrics[month]={cop:Math.max(0,Number(cop)||0),retrieval:Math.max(0,Number(retrieval)||0),retrievalCount:Math.max(0,Math.round(Number(retrievalCount)||0)),errorImprove:Number(errorImprove)||0,lowErrorMaintained:!!lowErrorMaintained,updatedAt:new Date().toISOString()};v158SavePolicy();renderLearningAll()}
function v158SettleMonth(month){const r=v158ScoreMonth(month);LS.lifePolicy.settlements[month]={grade:r.grade,tokens:r.tokens,total:r.total,settledAt:new Date().toISOString()};v158SavePolicy();renderLearningAll();v156Toast(`✓ ${month} 已结算为 ${r.grade} 级月`,true)}
function v158TokenBalance(){return Object.values(LS.lifePolicy.settlements||{}).reduce((s,x)=>s+Number(x?.tokens||0),0)}
function v158UseFlexLeave(k,reason=''){if(!v150DateOk(k)){alert('请选择有效日期。');return}if(v158IsWeeklyRestDay(k)){alert('周六本来就是固定休息日，不消耗调休。');return}if(LS.lifePolicy.flex.used[k]){alert('这一天已经使用调休。');return}if(LS.lifePolicy.flex.balance<=0){alert('当前没有可用调休余额。');return}LS.lifePolicy.flex.used[k]={date:k,reason:String(reason||'').trim()||'调休',usedAt:new Date().toISOString()};LS.lifePolicy.flex.balance--;v158SavePolicy();renderLearningAll();v156Toast('✓ 调休已生效，不产生学习债',true)}
function v158CancelFlexLeave(k){if(!LS.lifePolicy.flex.used[k])return;if(!confirm(`取消 ${k} 的调休？该天将恢复原学习目标。`))return;delete LS.lifePolicy.flex.used[k];LS.lifePolicy.flex.balance=Math.min(LS.lifePolicy.flex.cap,LS.lifePolicy.flex.balance+1);v158SavePolicy();renderLearningAll()}
function v158InboxAdd(text){text=String(text||'').trim();if(!text)return;LS.lifePolicy.restInbox.unshift({id:uuid(),text,createdAt:new Date().toISOString()});LS.lifePolicy.restInbox=LS.lifePolicy.restInbox.slice(0,30);v158SavePolicy();renderLearningAll()}
function v158InboxRemove(id){LS.lifePolicy.restInbox=LS.lifePolicy.restInbox.filter(x=>x.id!==id);v158SavePolicy();renderLearningAll()}

const v158BusyBase=isLearningBusyKey;
isLearningBusyKey=function(k){return v158BusyBase(k)||v158IsProtectedRestDay(k)};
countEligibleEnglishDays=function(startKey,endKey){if(startKey>endKey)return 0;let d=parse(startKey),e=parse(endKey),n=0;for(;d<=e;d.setDate(d.getDate()+1)){const k=fmt(d);if(d.getDay()!==1&&!isLearningBusyKey(k))n++}return n};
projectEnglishRound1=function(){const done=englishDoneCount(LS.english.round1),rem=Math.max(0,ENGLISH_LESSON_TOTAL-done);if(!rem){const last=[...Array(ENGLISH_LESSON_TOTAL)].map((_,i)=>learningEntryDate(LS.english.round1[String(i+1)])).filter(Boolean).sort().pop();return {date:last||learningTodayKey(),pace:0}}const pace=englishRecentPace(LS.english.round1);let d=learningTodayDate(),left=rem,guard=0;if(fmt(d)<LEARNING_CONFIG.militaryStart)d=parse(LEARNING_CONFIG.militaryStart);while(left>0&&guard<180){const k=fmt(d);if(d.getDay()!==1&&!isLearningBusyKey(k))left-=pace;if(left>0)d.setDate(d.getDate()+1);guard++}return {date:fmt(d),pace}};

startStudy=function(subject,energy,note='',timeClass=''){
  if(LS.studyTimer.active){alert('已经有一段学习正在进行，请先结束当前学习。');return}if(!STUDY_SUBJECTS.includes(subject))subject='其他';
  const tc=V158_TIME_CLASSES[timeClass]?timeClass:(V158_TIME_CLASSES[$('#studyTimeClass')?.value]?$('#studyTimeClass').value:v158DefaultClassForSubject(subject));const nowIso=new Date().toISOString();LS.studyTimer.active={id:uuid(),subject,energy:energy||energyFor(),timeClass:tc,note:String(note||'').trim(),sessionStartedAt:nowIso,phase:'focus',phaseStartedAt:nowIso,focusAccumSec:0,breakAccumSec:0,blocksCompleted:0,blocksSinceLong:0,lastEyeMark:0};persistLearningState();renderLearningAll();studyTimerTick()
};
finishStudy=function(){const a=LS.studyTimer.active;if(!a)return;let focus=Number(a.focusAccumSec||0),br=Number(a.breakAccumSec||0);if(a.phase==='focus')focus+=Math.max(0,Math.floor((Date.now()-Date.parse(a.phaseStartedAt))/1000));else if(a.phase==='break')br+=currentPhaseSeconds();focus=Math.max(0,Math.round(focus));const rec={id:a.id||uuid(),deviceId:learningDeviceId(),subject:a.subject,energy:a.energy,timeClass:V158_TIME_CLASSES[a.timeClass]?a.timeClass:v158DefaultClassForSubject(a.subject),note:a.note,startAt:a.sessionStartedAt||a.phaseStartedAt||new Date().toISOString(),endAt:new Date().toISOString(),focusSeconds:focus,breakSeconds:Math.max(0,Math.round(br)),blocks:a.blocksCompleted||0,recordedAt:new Date().toISOString()};LS.studyTimer.sessions=mergeStudyLedger([...(LS.studyTimer.sessions||[]),rec],LS.studyTimer.deletedSessionIds||[],[],[]).sessions;LS.studyTimer.active=null;persistLearningState();studyTimerNotice=`已记录：${rec.subject} · ${secHuman(rec.focusSeconds)} · ${V158_TIME_CLASSES[rec.timeClass].label}`;renderLearningAll();forceStudyLedgerSyncSoon()};
addManualStudySession=function(subject,dateKey,minutes,note='',timeClass=''){const min=Math.round(Number(minutes));if(!STUDY_SUBJECTS.includes(subject))subject='其他';if(!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey||''))){alert('请选择日期。');return}if(!Number.isFinite(min)||min<=0||min>720){alert('学习时长请填写 1—720 分钟。');return}const tc=V158_TIME_CLASSES[timeClass]?timeClass:(V158_TIME_CLASSES[$('#manualStudyTimeClass')?.value]?$('#manualStudyTimeClass').value:v158DefaultClassForSubject(subject));const startAt=beijingAnchorIso(dateKey,'12:00'),endAt=new Date(Date.parse(startAt)+min*60000).toISOString();LS.studyTimer.sessions.push({id:'manual-'+uuid(),manual:true,dateKey,deviceId:learningDeviceId(),subject,energy:'normal',timeClass:tc,note:String(note||'').trim(),startAt,endAt,focusSeconds:min*60,breakSeconds:0,blocks:0,recordedAt:new Date().toISOString()});persistLearningState();studyTimerNotice=`已手动补记：${subject} · ${min} 分钟 · ${V158_TIME_CLASSES[tc].label}`;forceStudyLedgerSyncSoon();renderLearningTimer();renderLearningOverview()};

const v158TimerBase=renderLearningTimer;
renderLearningTimer=function(){v158TimerBase();const e=$('#learningPanel'),grids=e.querySelectorAll('.timer-start-grid');const options=Object.entries(V158_TIME_CLASSES).map(([k,v])=>`<option value="${k}">${v.label}${v.count?' · 计入有效时长':' · 不计入'}</option>`).join('');if(grids[0]&&!$('#studyTimeClass')){const sel=document.createElement('select');sel.id='studyTimeClass';sel.innerHTML=options;grids[0].insertBefore(sel,grids[0].children[1]||null)}if(grids[1]&&!$('#manualStudyTimeClass')){const sel=document.createElement('select');sel.id='manualStudyTimeClass';sel.innerHTML=options;grids[1].insertBefore(sel,grids[1].children[1]||null)}const note=e.querySelector('.learning-section-card .learning-source-note');if(note)note.innerHTML+=' <b>只有 CORE-DEEP / CORE-RETRIEVAL / ACTIVE-CLASS 进入月度有效学习时长。</b>';const logs=e.querySelectorAll('.study-log-row');logs.forEach(row=>{const id=row.querySelector('[data-study-remove]')?.dataset.studyRemove,rec=(LS.studyTimer.sessions||[]).find(x=>x.id===id);if(rec){const span=document.createElement('span');span.className='learning-chip';span.textContent=V158_TIME_CLASSES[v158SessionClass(rec)].group==='核心'?'有效':'另记';row.insertBefore(span,row.lastElementChild)}})};

function renderV158Stats(){const e=$('#learningPanel'),[wa,wb]=studyWeekRange(),weekCore=v158EffectiveWeekSeconds(),weekTarget=v158ScheduledWeekMinutes()*60,month=v158MonthKeyFromDateKey(learningTodayKey()),monthCore=v158EffectiveMonthSeconds(month),monthTarget=v158ScheduledMonthMinutes(month)*60,totalWeek=weekStudySeconds(),sessions=[...(LS.studyTimer.sessions||[])].sort((a,b)=>String(b.recordedAt||b.endAt||'').localeCompare(String(a.recordedAt||a.endAt||''))).slice(0,40);const byClass=Object.entries(V158_TIME_CLASSES).map(([k,v])=>{const sec=studySessionsBetween(wa,wb).filter(x=>v158SessionClass(x)===k).reduce((s,x)=>s+Number(x.focusSeconds||0),0);return `<div class="study-stat"><small>${esc(v.label)} · 本周</small><b>${secHuman(sec)}</b><i style="--w:${weekCore?Math.min(100,Math.round(sec/weekCore*100)):0}%"></i></div>`}).join('');e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>有效学习统计</h4><div class="learning-source-note">总记录照实保留；只有三类核心认知活动进入 S/A/B/C 的“有效时长”。</div></div><span class="learning-chip blue">${wa} — ${wb}</span></div><div class="v158-policy-grid"><div class="v158-policy-card"><small>本周核心有效</small><b>${secHuman(weekCore)}</b><small>排程目标 ${secHuman(weekTarget)}</small></div><div class="v158-policy-card"><small>本周全部记录</small><b>${secHuman(totalWeek)}</b><small>含竞赛/行政等</small></div><div class="v158-policy-card"><small>本月核心有效</small><b>${secHuman(monthCore)}</b><small>排程目标 ${secHuman(monthTarget)}</small></div><div class="v158-policy-card"><small>调休余额</small><b>${LS.lifePolicy.flex.balance} 天</b><small>每月 +2，最高 6</small></div></div></div><div class="learning-section-card"><h4>本周分类</h4><div class="study-stat-grid">${byClass}</div></div><div class="learning-section-card"><h4>最近学习记录</h4>${sessions.length?sessions.map(x=>`<div class="study-log-row"><b>${esc(x.subject)}</b><span>${secHuman(x.focusSeconds)}</span><span>${x.manual?`${esc(sessionDate(x))} · 手动补记`:beijingDateTimeLabel(x.startAt)} · ${esc(V158_TIME_CLASSES[v158SessionClass(x)].label)}${x.note?` · ${esc(x.note)}`:''}</span><button class="x" data-study-remove="${x.id}">×</button></div>`).join(''):'<div class="learning-empty">还没有计时记录。</div>'}</div>`;const arr=Object.values(LS.sleep.records||{}).filter(Boolean).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);if(arr.length){const avg=sleepAvg(arr,sleepDurationMin),box=document.createElement('div');box.className='learning-section-card';box.innerHTML=`<div class="learning-row spread"><div><h4>睡眠 × 学习</h4><div class="learning-source-note">近 ${arr.length} 天平均睡眠 ${sleepHuman(avg)}。睡眠是学习能力底盘，不用睡眠换 S。</div></div><button class="btn" id="v158OpenSleep">记录睡眠</button></div>`;e.prepend(box);$('#v158OpenSleep').onclick=()=>{activeLearningTab='sleep';renderLearningAll()}}document.querySelectorAll('[data-study-remove]').forEach(b=>b.onclick=()=>removeStudySession(b.dataset.studyRemove))}
renderLearningStats=renderV158Stats;

function renderV158Policy(){
  v158EnsureFlexAccrual();const e=$('#learningPanel'),month=v158MonthKeyFromDateKey(learningTodayKey()),metric=v158Metric(month),score=v158ScoreMonth(month),settled=LS.lifePolicy.settlements[month],leaveDates=Object.entries(LS.lifePolicy.flex.used||{}).sort((a,b)=>a[0].localeCompare(b[0])),sleep=score.sleep,planMin=v158ScheduledMonthMinutes(month),reward=v158TokenBalance();
  const classes=Object.entries(V158_TIME_CLASSES).map(([k,v])=>`<div class="v158-class-item ${v.count?'core':'other'}"><b>${esc(v.label)}</b><br>${esc(v.help)}<br><span class="learning-chip ${v.count?'green':''}">${v.count?'计入有效时长':'另记，不进月时长'}</span></div>`).join('');
  const adjustment=score.t.holiday?`假期月已启用：第3个起的合法调休按原排程等额降低时数门槛，本月降低 ${score.t.reduction.toFixed(1)}h；近3月移动平均 ${score.t.avg.toFixed(1)}h。`:score.t.leaveCount>=3?`本月用了 ${score.t.leaveCount} 天调休，但近3月有效时长均值 ${score.t.avg.toFixed(1)}h＜120h，暂不启用额外门槛下调。`:'本月使用0—2天调休时，S/A/B 时数门槛保持 138/128/120h。';
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>个人成长制度 · V1.7.2</h4><div class="learning-source-note">目标不是最大化“痛苦时长”，而是长期最大化会做、记得住、身体稳定、还能认真生活的能力。</div></div><span class="learning-chip green">A 是长期理想常态</span></div><div class="v158-policy-grid"><div class="v158-policy-card"><small>周一—周五</small><b>5.5h</b><small>核心有效学习目标</small></div><div class="v158-policy-card"><small>周六</small><b>0h</b><small>固定完全休息，不可储存</small></div><div class="v158-policy-card"><small>周日</small><b>4.5h</b><small>中等学习，晚间返校</small></div><div class="v158-policy-card"><small>标准周</small><b>32h</b><small>不含合法调休</small></div></div></div><div class="learning-section-card"><h4>什么能算“有效学习时长”</h4><div class="v158-class-grid">${classes}</div><div class="learning-source-note" style="margin-top:9px">计时判定：直接服务核心目标 × 主动认知加工 × 建议连续≥10分钟 × 有可检查产出。10分钟是防灌水管理规则，不是心理学神奇阈值。</div></div><div class="learning-section-card"><div class="learning-row spread"><div><h4>调休账户</h4><div class="learning-source-note">每月自动 +2 天，最高 6 天；周六本来就休息，不消耗调休。使用后被取消的学习时数直接消失，不形成学习债。</div></div><span class="learning-chip blue">余额 ${LS.lifePolicy.flex.balance} / 6 天</span></div><div class="v158-inline-form"><input id="v158LeaveDate" type="date" value="${learningTodayKey()}"><input id="v158LeaveReason" type="text" autocomplete="off" placeholder="约会 / 旅行 / 私事"><button class="btn primary" id="v158UseLeave">使用1天调休</button></div><div style="margin-top:8px">${leaveDates.length?leaveDates.map(([k,v])=>`<div class="v158-leave-row"><b>${k}</b><span>${esc(v.reason||'调休')}</span><button class="x" data-v158-leave-remove="${k}">×</button></div>`).join(''):'<div class="learning-empty">还没有使用调休。</div>'}</div></div><div class="learning-section-card"><div class="learning-row spread"><div><h4>${month} 月度评级</h4><div class="learning-source-note">有效时数35 + 核心进度25 + 延迟提取25 + 错误率改善15 = 100分。S不是每月KPI。</div></div><span class="v158-grade ${score.grade.toLowerCase()}">${score.grade}</span></div><div class="v158-policy-grid"><div class="v158-policy-card"><small>核心有效时长</small><b>${score.h.toFixed(1)}h</b><small>本月排程 ${Math.round(planMin/60*10)/10}h</small></div><div class="v158-policy-card"><small>COP完成率</small><b>${score.m.cop.toFixed(0)}%</b><small>S≥100 / A≥95 / B≥85</small></div><div class="v158-policy-card"><small>延迟提取</small><b>${score.m.retrieval.toFixed(0)}%</b><small>${score.m.retrievalCount} 次；A/S至少8次</small></div><div class="v158-policy-card"><small>错误率改善</small><b>${score.err.toFixed(0)}%</b><small>${score.m.lowErrorMaintained?'低错率≤10%保持':'按同难度前后测'}</small></div></div><div class="v158-inline-form"><label>COP %<input id="v158Cop" type="number" min="0" max="200" value="${score.m.cop}"></label><label>延迟提取均分 %<input id="v158Retrieval" type="number" min="0" max="100" value="${score.m.retrieval}"></label><label>有效延迟测验次数<input id="v158RetrievalCount" type="number" min="0" max="99" value="${score.m.retrievalCount}"></label><label>错误率改善 %<input id="v158Error" type="number" min="-100" max="100" value="${score.m.errorImprove}"></label><label class="check"><input id="v158LowError" type="checkbox" ${score.m.lowErrorMaintained?'checked':''}> 月初≤10%且月底仍≤10%</label><button class="btn" id="v158SaveMetrics">保存月度数据</button></div><div class="learning-status-box ${score.grade==='C'?'warn':'safe'}" style="margin-top:10px"><b>当前 ${score.grade} 级 · ${score.total}/100 分</b><br>${v158GradeAction(score.grade)}<br>${adjustment}${sleep.count?`<br>本月已记录睡眠 ${sleep.count} 晚，平均 ${sleepHuman(sleep.avgMin)}。`:''}</div><table class="v158-score-table"><tr><th>维度</th><th>得分</th><th>当前</th></tr><tr><td>有效时数</td><td>${score.timeScore}/35</td><td>S≥${score.t.s.toFixed(1)}h / A≥${score.t.a.toFixed(1)}h / B≥${score.t.b.toFixed(1)}h</td></tr><tr><td>COP</td><td>${score.copScore}/25</td><td>${score.m.cop.toFixed(0)}%</td></tr><tr><td>延迟提取</td><td>${score.retScore}/25</td><td>${score.m.retrieval.toFixed(0)}%</td></tr><tr><td>错误率改善</td><td>${score.errScore}/15</td><td>${score.err.toFixed(0)}%</td></tr></table><div class="learning-row" style="margin-top:10px"><button class="btn primary" id="v158Settle">${settled?'重新结算':'结算本月'}</button><span class="learning-chip">本月奖励 ${score.tokens} 枚</span><span class="learning-chip green">累计已结算 ${reward} 枚代币</span><span class="learning-chip">1枚＝50元娱乐预算或等值体验</span></div></div><div class="learning-section-card"><h4>娱乐与健康边界</h4><div class="learning-status-box"><b>学习达成后可以安心娱乐。</b><br>周一—周四建议游戏≤90分钟；周五≤120分钟；周六最自由，建议总量≤3小时；周日≤60分钟。任何一天都不拿睡眠支付娱乐或学习成本，尽量留出≥7小时睡眠机会。周六不建议用“只背10个词维持打卡”、模拟考、学新章、刷Study With Me、打开绩效Dashboard来破坏休息边界。</div></div>`;
  $('#v158UseLeave').onclick=()=>v158UseFlexLeave($('#v158LeaveDate').value,$('#v158LeaveReason').value);document.querySelectorAll('[data-v158-leave-remove]').forEach(b=>b.onclick=()=>v158CancelFlexLeave(b.dataset.v158LeaveRemove));$('#v158SaveMetrics').onclick=()=>v158SetMonthlyMetrics(month,$('#v158Cop').value,$('#v158Retrieval').value,$('#v158RetrievalCount').value,$('#v158Error').value,$('#v158LowError').checked);$('#v158Settle').onclick=()=>v158SettleMonth(month)
}

const v158TodayBase=renderLearningToday;
renderLearningToday=function(){const k=learningTodayKey(),d=learningTodayDate(),e=$('#learningPanel'),rest=v158IsWeeklyRestDay(k),leave=v158IsFlexLeaveDay(k);if(rest||leave){const title=rest?'周六 · 完全休息日':'调休日 · 合法休假',desc=rest?'今天没有任何强制学习任务，也没有“欠账”。约会、散步、运动、看电影、打游戏都可以；别用打卡维持焦虑。':'今天原本的学习目标已经合法取消，不需要明天补回来。休息就是制度的一部分。';const inbox=LS.lifePolicy.restInbox||[];e.innerHTML=`<div class="v158-rest-hero"><span class="learning-chip green">${rest?'固定周休':'调休'}</span><h3>${title}</h3><p>${desc}</p></div><div class="learning-section-card"><h4>焦虑时不要“偷学”，先把念头放进 Inbox</h4><div class="v158-inline-form"><input id="v158InboxText" class="full" type="text" autocomplete="off" placeholder="例如：周日先做高数错题第3题"><button class="btn" id="v158InboxAdd">记下，今天不做</button></div>${inbox.length?inbox.slice(0,8).map(x=>`<div class="v158-inbox-row"><span>${esc(x.text)}</span><button class="x" data-v158-inbox-remove="${x.id}">×</button></div>`).join(''):'<div class="learning-empty" style="margin-top:8px">Inbox 为空。很好，今天就去生活。</div>'}</div><div class="learning-section-card"><h4>今天建议做什么</h4><div class="learning-status-box"><b>适合：</b>约会、户外、运动、朋友、兴趣、正常游戏、睡够。<br><b>不建议：</b>模拟考、学新章节、为了连续打卡背单词、刷备考焦虑视频、熬夜到凌晨。<br><b>如果真的自发想学：</b>制度不禁止，但不要把它变成“周六也必须学”的新义务。</div></div>`;$('#v158InboxAdd').onclick=()=>v158InboxAdd($('#v158InboxText').value);document.querySelectorAll('[data-v158-inbox-remove]').forEach(b=>b.onclick=()=>v158InboxRemove(b.dataset.v158InboxRemove));return}v158TodayBase();const target=v158DailyTargetMin(k),core=v158EffectiveTodaySeconds(),box=document.createElement('div');box.className='learning-section-card';box.innerHTML=`<div class="learning-row spread"><div><h4>${d.getDay()===0?'周日中等学习日':'常规学习日'} · 今日有效时长</h4><div class="learning-source-note">只统计 CORE-DEEP / CORE-RETRIEVAL / ACTIVE-CLASS。达到目标后可以安心休息和娱乐，不需要为了“更卷”继续硬坐。</div></div><span class="learning-chip green">${secHuman(core)} / ${Math.floor(target/60)}小时${target%60?target%60+'分':''}</span></div>${d.getDay()===0?'<div class="learning-source-note" style="margin-top:7px">周日晚上返校/晚点评，今天目标固定为4.5小时，不按工作日5.5小时要求。</div>':''}`;e.prepend(box)};

const v158BannerBase=renderLearningBanner;
renderLearningBanner=function(){const k=learningTodayKey(),e=$('#learningBanner');if(v158IsWeeklyRestDay(k)||v158IsFlexLeaveDay(k)){const rest=v158IsWeeklyRestDay(k);e.innerHTML=`<div><strong>${rest?'今天是周六完全休息日':'今天已使用调休'}</strong><div class="small">${rest?'0 小时目标；固定周休不可储存，也不需要通过学习赚取。':'今天取消的排程不会形成学习债。'}</div></div><div class="learning-row"><span class="learning-chip green">调休余额 ${LS.lifePolicy.flex.balance} 天</span><button class="btn" id="v158OpenPolicy">查看制度</button></div>`;$('#v158OpenPolicy').onclick=()=>{activeLearningTab='policy';renderLearningAll()};return}v158BannerBase();const chip=document.createElement('span');chip.className='learning-chip green';chip.textContent=`今日有效目标 ${v158DailyTargetMin(k)/60}h`;e.querySelector('.learning-row')?.prepend(chip)};

const v158MiniBase=renderLearningMini;
renderLearningMini=function(){const k=fmt(sel),e=$('#learningMini');if(v158IsWeeklyRestDay(k)||v158IsFlexLeaveDay(k)){if(!e)return;const rest=v158IsWeeklyRestDay(k);e.innerHTML=`<div class="learning-mini-status"><span class="learning-chip green">${rest?'完全休息日':'调休'}</span></div><div class="learning-mini-line"><b>${rest?'周六固定周休':'合法调休日'}</b> · 0 小时强制目标 · 不产生学习债</div>`;$('#learningMiniStat').textContent='休息';return}v158MiniBase()};

const v158OverviewBase=renderLearningOverview;
renderLearningOverview=function(){v158OverviewBase();if(!$('#learnStudyMetric'))return;const w=v158EffectiveWeekSeconds(),target=v158ScheduledWeekMinutes()*60;$('#learnStudyMetric').textContent=secHuman(w);$('#learnStudyBar').style.width=`${target?Math.min(100,Math.round(w/target*100)):0}%`;$('#learnStudyNote').textContent=`有效口径 · 本周目标 ${secHuman(target)} · 今天 ${secHuman(v158EffectiveTodaySeconds())}`};

const v158PanelBase=renderLearningPanel;
renderLearningPanel=function(){document.querySelectorAll('[data-learning-tab]').forEach(b=>b.classList.toggle('active',b.dataset.learningTab===activeLearningTab));if(activeLearningTab==='policy'){renderV158Policy();ensureQuickTimerBar();renderButtonFeedbackSettingsIfNeeded();return}v158PanelBase()};

const v158RenderAllBase=renderLearningAll;
renderLearningAll=function(){v158EnsureFlexAccrual();v158RenderAllBase()};


/* ===== V1.5.9 英语减负：1 Lesson / 日 + 技巧并行 + 阅读精读生词 ===== */
// 这是一条计划负荷规则，不限制用户自愿多学；系统只把 1 个新 Lesson 视为当日计划完成。
function v159EnglishStudyDay(k){
  const d=parse(k);
  return d.getDay()!==6 && !isLearningBusyKey(k) && !v158IsFlexLeaveDay(k)
}
countEligibleEnglishDays=function(startKey,endKey){
  if(startKey>endKey)return 0;
  let d=parse(startKey),e=parse(endKey),n=0;
  for(;d<=e;d.setDate(d.getDate()+1)){const k=fmt(d);if(v159EnglishStudyDay(k))n++}
  return n
};
projectEnglishRound1=function(){
  const done=englishDoneCount(LS.english.round1),rem=Math.max(0,ENGLISH_LESSON_TOTAL-done);
  if(!rem){const last=[...Array(ENGLISH_LESSON_TOTAL)].map((_,i)=>learningEntryDate(LS.english.round1[String(i+1)])).filter(Boolean).sort().pop();return {date:last||learningTodayKey(),pace:0}}
  let d=learningTodayDate(),left=rem,guard=0;if(fmt(d)<LEARNING_CONFIG.militaryStart)d=parse(LEARNING_CONFIG.militaryStart);
  while(left>0&&guard<240){const k=fmt(d);if(v159EnglishStudyDay(k))left-=1;if(left>0)d.setDate(d.getDate()+1);guard++}
  return {date:fmt(d),pace:1}
};
function v159ReadingVocab(k=learningTodayKey()){
  const r=learningReviewFor(k),x=r.readingVocab;
  if(x&&typeof x==='object')return {done:!!x.done,count:Math.max(0,Number(x.count)||0),note:String(x.note||''),updatedAt:String(x.updatedAt||'')};
  return {done:false,count:0,note:'',updatedAt:''}
}
function v159SaveReadingVocab(k,done,count,note){
  const r=learningReviewFor(k);
  r.readingVocab={done:!!done,count:Math.max(0,Math.min(99,Number(count)||0)),note:String(note||'').trim(),updatedAt:new Date().toISOString()};
  learningSave();renderLearningAll()
}
const v159CompletionBase=learningCompletionItemsOnDate;
learningCompletionItemsOnDate=function(k){
  const out=v159CompletionBase(k),rv=v159ReadingVocab(k);
  if(rv.done)out.push(`英语 · 阅读精读${rv.count?` · 生词 ${rv.count} 个`:''}${rv.note?` · ${rv.note}`:''}`);
  return out
};

const v159EnglishBase=renderLearningEnglish;
renderLearningEnglish=function(){
  v159EnglishBase();
  const e=$('#learningPanel');if(!e)return;
  const card=document.createElement('div');card.className='learning-section-card v159-english-policy';
  card.innerHTML=`<div class="learning-row spread"><div><h4>现在的英语执行口径 · V1.6.0</h4><div class="learning-source-note">词汇基础阶段不追速度：计划量固定为 <b>1 个 Lesson / 学习日</b>。技巧课继续并行；做阅读题或阅读技巧课时，再把真正值得记的生词放进语境里学。</div></div><span class="learning-chip green">不再建议第 2 个 Lesson</span></div><div class="learning-status-box safe" style="margin-top:9px"><b>一天英语完成线：</b>1 个词汇 Lesson + 当天技巧课合理进度 + 阅读精读生词。<br><b>生词筛选：</b>优先“影响理解 / 反复遇到 / 高频常用 / 固定搭配”的词；建议一次只抓约 10—20 个高价值词，不要求把文章所有陌生词都背下来。<br><b>周一：</b>仍学 1 个新 Lesson，同时做周复习。<b>周六/调休：</b>0 个，不补债。</div>`;
  const first=e.querySelector('.learning-section-card');if(first)first.insertAdjacentElement('afterend',card);else e.prepend(card)
};

const v159TodayBase=renderLearningToday;
renderLearningToday=function(){
  v159TodayBase();
  const k=learningTodayKey(),e=$('#learningPanel');if(!e||v158IsWeeklyRestDay(k)||v158IsFlexLeaveDay(k))return;
  const rv=v159ReadingVocab(k),nextR1=nextEnglishLesson(LS.english.round1),nextR2=nextEnglishLesson(LS.english.round2),lesson=nextR1?englishLessonLabel(nextR1):(nextR2?`二轮 ${englishLessonLabel(nextR2)}`:'词汇轮次已完成');
  const card=document.createElement('div');card.className='learning-section-card v159-reading-vocab';
  card.innerHTML=`<div class="learning-row spread"><div><h4>英语今日结构</h4><div class="learning-source-note"><b>① ${esc(lesson)}</b>（今天只计划 1 个）　② 技巧课　③ 阅读精读 + 高价值生词</div></div><span class="learning-chip blue">1 Lesson / 日</span></div><div class="learning-review-grid" style="margin-top:9px"><label class="learning-review-check"><input id="v159ReadingDone" type="checkbox" ${rv.done?'checked':''}><span><b>阅读精读 / 生词提取</b><small>不是见词就背；优先影响理解、反复出现、高频词和固定搭配。</small></span></label></div><div class="v158-inline-form" style="margin-top:8px"><label>今天收了几个词<input id="v159ReadingCount" type="number" min="0" max="99" value="${rv.count}"></label><input id="v159ReadingNote" class="full" type="text" autocomplete="off" value="${esc(rv.note)}" placeholder="可选：阅读材料 / 最容易卡住的词"><button class="btn" id="v159ReadingSave">保存</button></div><div class="learning-source-note" style="margin-top:7px">数量只是记录，不是 KPI。10—20 个是筛词参考，不需要为了凑数硬收生词。</div>`;
  const cards=e.querySelectorAll('.learning-section-card');if(cards.length)cards[Math.min(1,cards.length-1)].insertAdjacentElement('afterend',card);else e.prepend(card);
  $('#v159ReadingSave').onclick=()=>v159SaveReadingVocab(k,$('#v159ReadingDone').checked,$('#v159ReadingCount').value,$('#v159ReadingNote').value);
  $('#v159ReadingDone').onchange=()=>v159SaveReadingVocab(k,$('#v159ReadingDone').checked,$('#v159ReadingCount').value,$('#v159ReadingNote').value)
};

const v159MiniBase=renderLearningMini;
renderLearningMini=function(){
  v159MiniBase();
  const k=fmt(sel),e=$('#learningMini');if(!e||k!==learningTodayKey()||v158IsWeeklyRestDay(k)||v158IsFlexLeaveDay(k))return;
  const rv=v159ReadingVocab(k),line=document.createElement('div');line.className='learning-mini-line';line.innerHTML=`<b>英语口径</b> · 1 Lesson / 日 · 技巧并行 · 精读生词 ${rv.done?`✓${rv.count?` ${rv.count}个`:''}`:'待做'}`;e.appendChild(line)
};



/* ===== V1.6.0 稳定性与学习质量版 ===== */
const V160_BACKUP_KEY='zx_v160BackupHistory';
function v160Quality(){
  if(!LS.quality||typeof LS.quality!=='object')LS.quality={retrievalTests:[],errorChecks:[]};
  if(!Array.isArray(LS.quality.retrievalTests))LS.quality.retrievalTests=[];
  if(!Array.isArray(LS.quality.errorChecks))LS.quality.errorChecks=[];
  return LS.quality
}
function v160SaveQuality(){S.s('learningState',LS);renderLearningOverview();renderLearningMini();renderCal()}
function v160DayDiff(a,b){if(!a||!b)return NaN;return Math.round((parse(b)-parse(a))/86400000)}
function v160RetrievalValid(x){const delay=v160DayDiff(x.sourceDate,x.testDate);return delay>=5&&delay<=9&&Number(x.items)>=10&&Number(x.score)>=0&&Number(x.score)<=100}
function v160ErrorValid(x){return !!x.sameDifficulty&&Number(x.before)>0&&Number(x.before)<=100&&Number(x.after)>=0&&Number(x.after)<=100}
function v160ErrorImprove(x){const a=Number(x.before),b=Number(x.after);return a>0?((a-b)/a*100):0}
function v160QualityMonthStats(month){
  const q=v160Quality(),r=q.retrievalTests.filter(x=>String(x.testDate||'').startsWith(month)&&v160RetrievalValid(x)),e=q.errorChecks.filter(x=>String(x.date||'').startsWith(month)&&v160ErrorValid(x));
  const retrieval=r.length?r.reduce((s,x)=>s+Number(x.score||0),0)/r.length:0;
  const errorImprove=e.length?e.reduce((s,x)=>s+v160ErrorImprove(x),0)/e.length:0;
  const lowErrorMaintained=e.some(x=>Number(x.before)<=10&&Number(x.after)<=10);
  return {retrieval,retrievalCount:r.length,errorImprove,lowErrorMaintained,errorCount:e.length,retrievalAll:q.retrievalTests.filter(x=>String(x.testDate||'').startsWith(month)).length,errorAll:q.errorChecks.filter(x=>String(x.date||'').startsWith(month)).length}
}
const v160MetricBase=v158Metric;
v158Metric=function(month){
  const m=v160MetricBase(month),a=v160QualityMonthStats(month);
  if(a.retrievalCount){m.retrieval=a.retrieval;m.retrievalCount=a.retrievalCount}
  if(a.errorCount){m.errorImprove=a.errorImprove;m.lowErrorMaintained=a.lowErrorMaintained}
  return m
};
function v160AddRetrieval(subject,sourceDate,testDate,score,items,note){
  score=Number(score);items=Math.round(Number(items));if(!sourceDate||!testDate||!Number.isFinite(score)||score<0||score>100||!Number.isFinite(items)||items<1){alert('请完整填写学习日期、测验日期、分数和题目数。');return}
  v160Quality().retrievalTests.unshift({id:uuid(),subject:String(subject||'其他'),sourceDate,testDate,score,items,note:String(note||'').trim(),createdAt:new Date().toISOString()});
  LS.quality.retrievalTests=LS.quality.retrievalTests.slice(0,300);v160SaveQuality();renderLearningAll();v156Toast(v160RetrievalValid(LS.quality.retrievalTests[0])?'✓ 已记入有效延迟提取':'已记录；需满足 5—9 天且 ≥10 个评分项才计入月评级',true)
}
function v160AddError(subject,date,before,after,sameDifficulty,note){
  before=Number(before);after=Number(after);if(!date||!Number.isFinite(before)||before<0||before>100||!Number.isFinite(after)||after<0||after>100){alert('请填写 0—100% 的前测与后测错误率。');return}
  v160Quality().errorChecks.unshift({id:uuid(),subject:String(subject||'其他'),date,before,after,sameDifficulty:!!sameDifficulty,note:String(note||'').trim(),createdAt:new Date().toISOString()});
  LS.quality.errorChecks=LS.quality.errorChecks.slice(0,300);v160SaveQuality();renderLearningAll();v156Toast(sameDifficulty?'✓ 错误率对照已记录':'已记录；不同难度对照不会计入月评级',true)
}
function v160RemoveQuality(kind,id){const q=v160Quality();const key=kind==='r'?'retrievalTests':'errorChecks';q[key]=q[key].filter(x=>x.id!==id);v160SaveQuality();renderLearningAll()}
function v160DefaultSourceDate(){const d=learningTodayDate();d.setDate(d.getDate()-7);return fmt(d)}
function renderV160Quality(){
  const e=$('#learningPanel'),month=v158MonthKeyFromDateKey(learningTodayKey()),a=v160QualityMonthStats(month),q=v160Quality(),r=q.retrievalTests.slice(0,20),er=q.errorChecks.slice(0,20);
  const retRows=r.length?r.map(x=>{const delay=v160DayDiff(x.sourceDate,x.testDate),valid=v160RetrievalValid(x);return `<div class="v160-quality-row"><b>${esc(x.testDate)}</b><span>${esc(x.subject)}</span><span class="v160-hide-mobile">${Number.isFinite(delay)?delay:'—'} 天</span><span><span class="${valid?'ok':'bad'}">${x.score}% · ${x.items}项 ${valid?'✓有效':'仅记录'}</span>${x.note?` · ${esc(x.note)}`:''}</span><button class="x" data-v160-rm-r="${x.id}">×</button></div>`}).join(''):'<div class="learning-empty">还没有延迟提取记录。</div>';
  const errRows=er.length?er.map(x=>{const valid=v160ErrorValid(x),im=v160ErrorImprove(x);return `<div class="v160-quality-row"><b>${esc(x.date)}</b><span>${esc(x.subject)}</span><span class="v160-hide-mobile">${x.before}%→${x.after}%</span><span><span class="${valid?'ok':'bad'}">${im>=0?'+':''}${im.toFixed(1)}% ${valid?'✓同难度':'仅记录'}</span>${x.note?` · ${esc(x.note)}`:''}</span><button class="x" data-v160-rm-e="${x.id}">×</button></div>`}).join(''):'<div class="learning-empty">还没有错误率对照记录。</div>';
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>学习质量 · ${month}</h4><div class="learning-source-note">这里不统计“坐了多久”，只看一周后还会不会、同类错误有没有减少。月评级优先读取这里的有效记录；没有记录时才使用制度页的手动值。</div></div><span class="learning-chip green">真实记录优先</span></div><div class="v160-quality-grid"><div class="v160-quality-stat"><small>有效延迟测验</small><b>${a.retrievalCount} 次</b><small>5—9天 + ≥10评分项</small></div><div class="v160-quality-stat"><small>延迟提取均分</small><b>${a.retrievalCount?a.retrieval.toFixed(0)+'%':'—'}</b><small>A/S 至少 8 次</small></div><div class="v160-quality-stat"><small>有效错误率对照</small><b>${a.errorCount} 次</b><small>同难度前后测</small></div><div class="v160-quality-stat"><small>平均错误率改善</small><b>${a.errorCount?a.errorImprove.toFixed(1)+'%':'—'}</b><small>${a.lowErrorMaintained?'已满足低错率保持':'月初≤10%时可记录保持'}</small></div></div></div><div class="learning-section-card"><h4>记录一次 7±2 天延迟提取</h4><div class="v160-quality-form"><label>科目<select id="v160RetSubject"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select></label><label>原学习日期<input id="v160RetSource" type="date" value="${v160DefaultSourceDate()}"></label><label>测验日期<input id="v160RetDate" type="date" value="${learningTodayKey()}"></label><label>得分 %<input id="v160RetScore" type="number" min="0" max="100" placeholder="例如 84"></label><label>评分项数<input id="v160RetItems" type="number" min="1" max="999" placeholder="≥10"></label><button class="btn primary" id="v160RetAdd">记录</button><input id="v160RetNote" class="wide" type="text" autocomplete="off" placeholder="可选：章节 / 阅读套题 / 错题组"></div><div class="learning-source-note" style="margin-top:7px">只有间隔 5—9 天且至少 10 个可评分项目才进入月度“延迟提取”指标；其他记录保留，但不参与评级。</div><div style="margin-top:8px">${retRows}</div></div><div class="learning-section-card"><h4>记录一次同难度错误率对照</h4><div class="v160-quality-form"><label>科目<select id="v160ErrSubject"><option>英语</option><option>财经</option><option>高数</option><option>其他</option></select></label><label>日期<input id="v160ErrDate" type="date" value="${learningTodayKey()}"></label><label>前测错误率 %<input id="v160ErrBefore" type="number" min="0" max="100" placeholder="例如 30"></label><label>后测错误率 %<input id="v160ErrAfter" type="number" min="0" max="100" placeholder="例如 18"></label><label class="check"><input id="v160ErrSame" type="checkbox" checked> 同难度 / 同口径</label><button class="btn primary" id="v160ErrAdd">记录</button><input id="v160ErrNote" class="wide" type="text" autocomplete="off" placeholder="可选：题型 / 章节 / 模拟卷"></div><div class="learning-source-note" style="margin-top:7px">错误率改善 =（前测错误率－后测错误率）÷前测错误率。不同难度的两次测试不能拿来“制造进步”。</div><div style="margin-top:8px">${errRows}</div></div>`;
  $('#v160RetAdd').onclick=()=>v160AddRetrieval($('#v160RetSubject').value,$('#v160RetSource').value,$('#v160RetDate').value,$('#v160RetScore').value,$('#v160RetItems').value,$('#v160RetNote').value);
  $('#v160ErrAdd').onclick=()=>v160AddError($('#v160ErrSubject').value,$('#v160ErrDate').value,$('#v160ErrBefore').value,$('#v160ErrAfter').value,$('#v160ErrSame').checked,$('#v160ErrNote').value);
  document.querySelectorAll('[data-v160-rm-r]').forEach(b=>b.onclick=()=>v160RemoveQuality('r',b.dataset.v160RmR));document.querySelectorAll('[data-v160-rm-e]').forEach(b=>b.onclick=()=>v160RemoveQuality('e',b.dataset.v160RmE))
}

const v160PanelBase=renderLearningPanel;
renderLearningPanel=function(){
  document.querySelectorAll('[data-learning-tab]').forEach(b=>b.classList.toggle('active',b.dataset.learningTab===activeLearningTab));
  if(activeLearningTab==='quality'){renderV160Quality();ensureQuickTimerBar();renderButtonFeedbackSettingsIfNeeded();return}
  v160PanelBase();
  if(activeLearningTab==='policy'){
    const month=v158MonthKeyFromDateKey(learningTodayKey()),a=v160QualityMonthStats(month),first=$('#learningPanel .learning-section-card');
    if(first&&(a.retrievalCount||a.errorCount)){const n=document.createElement('div');n.className='learning-status-box safe';n.style.marginTop='9px';n.innerHTML=`<b>V1.6.0 自动质量数据已接管部分月评：</b> ${a.retrievalCount?`延迟提取 ${a.retrievalCount} 次 / ${a.retrieval.toFixed(0)}%`:'延迟提取仍用手动值'}；${a.errorCount?`错误率对照 ${a.errorCount} 次 / 改善 ${a.errorImprove.toFixed(1)}%`:'错误率仍用手动值'}。`;first.appendChild(n)}
  }
};

function v160SnapshotCounts(data=snapshotData()){
  const ls=data?.learningState||{},q=ls.quality||{};return {tasks:Object.values(data.tasks||{}).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0),study:Array.isArray(ls.studyTimer?.sessions)?ls.studyTimer.sessions.length:0,sleep:Object.keys(ls.sleep?.records||{}).length,retrieval:Array.isArray(q.retrievalTests)?q.retrievalTests.length:0,errors:Array.isArray(q.errorChecks)?q.errorChecks.length:0}
}
function v160BackupHistory(){try{const x=JSON.parse(localStorage.getItem(V160_BACKUP_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function v160SetBackupHistory(arr){try{localStorage.setItem(V160_BACKUP_KEY,JSON.stringify(arr.slice(0,3)));return true}catch(e){return false}}
function v160CreateSafetyBackup(reason='手动快照',quiet=false){
  const data=snapshotData(),item={id:uuid(),reason,dateKey:learningTodayKey(),createdAt:new Date().toISOString(),counts:v160SnapshotCounts(data),data};let arr=v160BackupHistory();arr.unshift(item);arr=arr.slice(0,3);
  if(!v160SetBackupHistory(arr)){try{arr=arr.slice(0,1);v160SetBackupHistory(arr)}catch{}if(!quiet)alert('浏览器存储空间不足，无法保存内部快照；请先导出 JSON 备份。');return null}
  v160RenderBackupHistory();if(!quiet)v156Toast('✓ 已创建安全快照',true);return item
}
function v160ExportSnapshot(item){const blob=new Blob([JSON.stringify(item.data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`苏伊温德日历_内部快照_${String(item.createdAt).slice(0,10)}_${item.reason}.json`;a.click();URL.revokeObjectURL(a.href)}
function v160RestoreSnapshot(id){const arr=v160BackupHistory(),item=arr.find(x=>x.id===id);if(!item)return;if(!confirm(`恢复“${item.reason}”快照？\n创建时间：${fmtSyncTime(item.createdAt)}\n\n当前数据会先再留一份操作前快照，然后替换为该快照。`))return;v160CreateSafetyBackup('恢复内部快照前',true);applySnapshot(item.data);const stamp=new Date().toISOString();saveSyncMeta({...syncMeta(),localUpdatedAt:stamp,conflict:false});markCloudDirty();setCloudStatus(sbUser?'busy':'off',sbUser?'本地已恢复 · 待手动上传':'已恢复 · 仅本地');v160RenderBackupHistory();renderV160TodayCommand();alert('内部快照已恢复。为避免误覆盖云端，本次不会自动上传；确认无误后可手动“上传本地数据”。')}
function v160DeleteSnapshot(id){if(!confirm('删除这份内部快照？此操作不会删除当前日历数据。'))return;v160SetBackupHistory(v160BackupHistory().filter(x=>x.id!==id));v160RenderBackupHistory()}
function v160RenderBackupHistory(){const e=$('#v160BackupHistory');if(!e)return;const arr=v160BackupHistory();e.innerHTML=arr.length?arr.map(x=>`<div class="v160-backup-row"><div><b>${esc(x.reason)} · ${fmtSyncTime(x.createdAt)}</b><small>学习 ${x.counts?.study||0} 条 · 睡眠 ${x.counts?.sleep||0} 条 · 延迟提取 ${x.counts?.retrieval||0} 条 · 错误率 ${x.counts?.errors||0} 条</small></div><div class="v160-backup-actions"><button class="btn" data-v160-backup-export="${x.id}">导出</button><button class="btn" data-v160-backup-restore="${x.id}">恢复</button><button class="x" data-v160-backup-delete="${x.id}">×</button></div></div>`).join(''):'<div class="learning-empty">还没有内部快照。系统每天首次打开会自动创建一份，最多保留 3 份。</div>';document.querySelectorAll('[data-v160-backup-export]').forEach(b=>b.onclick=()=>{const x=v160BackupHistory().find(i=>i.id===b.dataset.v160BackupExport);if(x)v160ExportSnapshot(x)});document.querySelectorAll('[data-v160-backup-restore]').forEach(b=>b.onclick=()=>v160RestoreSnapshot(b.dataset.v160BackupRestore));document.querySelectorAll('[data-v160-backup-delete]').forEach(b=>b.onclick=()=>v160DeleteSnapshot(b.dataset.v160BackupDelete))}
function v160EnsureDailyBackup(){const today=learningTodayKey(),arr=v160BackupHistory();if(!arr.some(x=>(x.dateKey||beijingDateKey(x.createdAt||''))===today))v160CreateSafetyBackup('每日自动快照',true);v160RenderBackupHistory()}

async function v160StorageEstimate(){try{if(navigator.storage?.estimate){const x=await navigator.storage.estimate();return {usage:Number(x.usage)||0,quota:Number(x.quota)||0}}}catch{}return {usage:0,quota:0}}
function v160Bytes(n){if(!n)return '—';if(n<1024)return `${n} B`;if(n<1048576)return `${(n/1024).toFixed(1)} KB`;return `${(n/1048576).toFixed(1)} MB`}
function v160LocalStorageBytes(){let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),v=localStorage.getItem(k)||'';n+=(k.length+v.length)*2}}catch{}return n}
function v160DiagCard(label,value,cls=''){return `<div class="v160-diag ${cls}"><small>${esc(label)}</small><b>${esc(value)}</b></div>`}
async function v160RunDiagnostics(){
  const out=$('#v160Diagnostics');if(!out)return;out.innerHTML='<div class="learning-empty">正在检查……</div>';const local=snapshotData(),lc=v160SnapshotCounts(local),m=syncMeta(),storage=await v160StorageEstimate(),backups=v160BackupHistory();let cloud=null,cloudAt='',cloudErr='';
  if(sb&&sbUser){try{const r=await fetchCloudState();if(r.error)cloudErr=r.error.message||'读取失败';else if(r.data?.payload){cloud=v160SnapshotCounts(r.data.payload);cloudAt=r.data.updated_at||''}}catch(e){cloudErr=String(e?.message||e)}}
  let cache='未检测';try{if('caches'in window){const keys=await caches.keys();cache=keys.filter(x=>x.includes('suiwind-calendar')).join(', ')||'无缓存'}}catch{}
  const syncCls=m.conflict?'warn':(sbUser?'good':'');const compare=(name,l,c)=>c==null?'云端未读取':`${l} / 云端 ${c}${l===c?' ✓':'（数量不同，未必是丢失；先检查最近同步时间）'}`;
  out.innerHTML=`<div class="v160-diagnostics-grid">${v160DiagCard('App版本','V1.7.2','good')}${v160DiagCard('同步状态',m.conflict?'需要处理冲突':(sbUser?'已登录':'仅本地'),syncCls)}${v160DiagCard('本地学习记录',cloud?compare('学习',lc.study,cloud.study):String(lc.study),cloud&&lc.study===cloud.study?'good':'')}${v160DiagCard('本地睡眠记录',cloud?compare('睡眠',lc.sleep,cloud.sleep):String(lc.sleep),cloud&&lc.sleep===cloud.sleep?'good':'')}${v160DiagCard('学习质量记录',`延迟提取 ${lc.retrieval} · 错误率 ${lc.errors}`)}${v160DiagCard('云端最后修改',cloudAt?fmtSyncTime(cloudAt):(cloudErr||'未读取'),cloudErr?'warn':'')}${v160DiagCard('本地最后修改',fmtSyncTime(m.localUpdatedAt))}${v160DiagCard('最近成功同步',fmtSyncTime(m.lastSyncedAt))}${v160DiagCard('内部快照',`${backups.length}/7 · 最近 ${backups[0]?fmtSyncTime(backups[0].createdAt):'—'}`,backups.length?'good':'warn')}${v160DiagCard('Service Worker缓存',cache.includes('v170')?cache:cache,cache.includes('v170')?'good':'warn')}${v160DiagCard('浏览器存储占用',storage.usage?`${v160Bytes(storage.usage)} / ${v160Bytes(storage.quota)}`:v160Bytes(v160LocalStorageBytes()))}${v160DiagCard('localStorage估算',v160Bytes(v160LocalStorageBytes()))}</div><div class="learning-source-note" style="margin-top:8px">诊断只读。记录数量不同并不自动等于丢数据：可能只是有尚未同步的新记录；应结合“最近成功同步”和修改时间判断。</div>`
}

const v160ImportBase=importData;
importData=async function(file){v160CreateSafetyBackup('导入 JSON 前',true);return await v160ImportBase(file)};
const v160DownloadCloudBase=downloadCloud;
downloadCloud=async function(force=false){v160CreateSafetyBackup('下载云端前',true);return await v160DownloadCloudBase(force)};

function v160NextAction(){
  const k=learningTodayKey();if(v158IsWeeklyRestDay(k))return {title:'今天休息，不需要学习',meta:'周六 0 小时目标。把恢复、约会、运动和生活认真过好。',tab:'policy',button:'查看休息制度'};if(v158IsFlexLeaveDay(k))return {title:'今天是合法调休日',meta:'被取消的学习时数不会形成学习债。',tab:'policy',button:'查看调休'};if(LS.studyTimer.active)return {title:`继续 ${LS.studyTimer.active.subject} 计时`,meta:`当前已累计 ${secHuman(activeStudyFocusSeconds())}，先把这一段做完。`,tab:'timer',button:'继续计时'};
  const due=dueReviews();if(due.length)return {title:`先做：${due[0].track} · ${due[0].title}`,meta:`有 ${due.length} 项到期复习。先做一次主动提取，再看答案。`,tab:'review',button:'开始复习'};
  const todayItems=learningCompletionItemsOnDate(k),r1today=Object.values(LS.english.round1||{}).some(v=>learningEntryDate(v)===k),r2today=Object.values(LS.english.round2||{}).some(v=>learningEntryDate(v)===k),nextR1=nextEnglishLesson(LS.english.round1),nextR2=nextEnglishLesson(LS.english.round2);
  if(nextR1&&!r1today)return {title:`英语：${englishLessonLabel(nextR1)}`,meta:'今天只计划 1 个新 Lesson；完成后不自动加第 2 个。',tab:'english',button:'打开英语'};
  if(!nextR1&&nextR2&&!r2today)return {title:`英语二轮：${englishLessonLabel(nextR2)}`,meta:'二轮同样按当天计划推进，不用追时长。',tab:'english',button:'打开英语'};
  const rv=v159ReadingVocab(k);if(!rv.done)return {title:'英语：阅读精读 + 高价值生词',meta:'只收影响理解、反复出现、高频词和固定搭配。',tab:'today',button:'打开今日学习'};
  const fd=nextFinanceDay(),md=nextMathDay();if(!isLearningBusyKey(k)&&formalAdvanceAllowed(k)&&fd)return {title:`财经：原 Day ${fd}`,meta:`${financeItem(fd)?.subject||''} · ${financeItem(fd)?.title||''}`,tab:'finance',button:'打开财经'};if(!isLearningBusyKey(k)&&formalAdvanceAllowed(k)&&md)return {title:`高数：Day ${md}`,meta:'按当天真实状态推进；疲劳时允许降档。',tab:'math',button:'打开高数'};
  return {title:'今天的核心任务已基本收尾',meta:todayItems.length?'可以做轻量复习，达到时长后安心休息。':'从最重要的一项开始，不需要同时打开所有任务。',tab:'today',button:'打开今日学习'}
}
function renderV160TodayCommand(){
  const e=$('#v160TodayCommandBody'),stat=$('#v160CommandStat');if(!e||!stat)return;const selected=fmt(sel),today=learningTodayKey();if(selected!==today){stat.textContent='';e.innerHTML=`<div class="v160-command-card"><h4>你正在查看 ${selected}</h4><p>“现在做什么”只对今天给行动建议，避免把未来计划提前变成压力。</p><div class="v160-command-actions"><button class="btn" id="v160BackToday">回到今天</button></div></div>`;$('#v160BackToday').onclick=()=>$('#todayBtn').click();return}
  const rest=v158IsProtectedRestDay(today),target=v158DailyTargetMin(today)*60,done=v158EffectiveTodaySeconds(),pct=target?Math.min(100,Math.round(done/target*100)):100,a=v160NextAction();stat.textContent=rest?'休息日':`${secHuman(done)} / ${target?secHuman(target):'0分钟'}`;e.innerHTML=`<div class="v160-command-card"><div class="learning-row spread"><div><h4>${esc(a.title)}</h4><p>${esc(a.meta)}</p></div><span class="learning-chip ${rest?'green':'blue'}">${rest?'0h 目标':pct+'%'}</span></div><div class="v160-command-progress"><i style="width:${pct}%"></i></div><div class="v160-command-actions"><button class="btn primary" id="v160OpenNext">${esc(a.button)}</button>${!rest?'<button class="btn" id="v160OpenTimer">开始计时</button>':''}<button class="btn" id="v160OpenQuality">记录学习质量</button></div></div>`;$('#v160OpenNext').onclick=()=>openLearning(a.tab);if($('#v160OpenTimer'))$('#v160OpenTimer').onclick=()=>openLearning('timer');$('#v160OpenQuality').onclick=()=>openLearning('quality')
}
const v160RenderSideBase=renderSide;
renderSide=function(){v160RenderSideBase();renderV160TodayCommand()};

const v160CloudBase=$('#cloudBtn').onclick;
$('#cloudBtn').onclick=()=>{v160CloudBase();v160RenderBackupHistory();setTimeout(()=>v160RunDiagnostics(),50)};
$('#v160CreateBackup').onclick=()=>v160CreateSafetyBackup('手动快照');$('#v160RunDiagnostics').onclick=v160RunDiagnostics;
$('#downloadCloud').onclick=()=>downloadCloud(false);


/* ===== V1.7.1 自适应个人系统 ===== */
function v170DefaultState(){return {version:1,projects:[],life:{checkins:{}},settings:{adaptive:true},tombstones:{projects:[],milestones:[],logs:[],retrieval:[],errors:[]},migrations:{}}}
function v170NormalizeProject(p){
  p=p&&typeof p==='object'?p:{};return {id:String(p.id||uuid()),name:String(p.name||'未命名项目'),kind:String(p.kind||'成长项目'),deadline:v150DateOk(p.deadline)?p.deadline:'',status:['active','paused','done'].includes(p.status)?p.status:'active',note:String(p.note||''),createdAt:String(p.createdAt||new Date().toISOString()),updatedAt:String(p.updatedAt||p.createdAt||new Date().toISOString()),milestones:Array.isArray(p.milestones)?p.milestones.map(x=>({id:String(x.id||uuid()),title:String(x.title||'里程碑'),dueDate:v150DateOk(x.dueDate)?x.dueDate:'',done:!!x.done,doneAt:String(x.doneAt||''),updatedAt:String(x.updatedAt||x.doneAt||new Date().toISOString())})):[],logs:Array.isArray(p.logs)?p.logs.map(x=>({id:String(x.id||uuid()),date:v150DateOk(x.date)?x.date:learningTodayKey(),minutes:Math.max(0,Math.round(Number(x.minutes)||0)),note:String(x.note||''),createdAt:String(x.createdAt||new Date().toISOString()),updatedAt:String(x.updatedAt||x.createdAt||new Date().toISOString())})):[]}
}
function v170NormalizeState(raw){const d=v170DefaultState(),x=raw&&typeof raw==='object'?raw:{};d.projects=(Array.isArray(x.projects)?x.projects:[]).map(v170NormalizeProject);d.life={checkins:(x.life?.checkins&&typeof x.life.checkins==='object')?x.life.checkins:{}};d.settings={adaptive:x.settings?.adaptive!==false};const t=x.tombstones||{};d.tombstones={projects:Array.isArray(t.projects)?t.projects:[],milestones:Array.isArray(t.milestones)?t.milestones:[],logs:Array.isArray(t.logs)?t.logs:[],retrieval:Array.isArray(t.retrieval)?t.retrieval:[],errors:Array.isArray(t.errors)?t.errors:[]};d.migrations=x.migrations&&typeof x.migrations==='object'?x.migrations:{};return d}
function v170SeedDefaults(){
  LS.v170=v170NormalizeState(LS.v170);if(LS.v170.migrations.seedProjectsV170)return false;
  const now=new Date().toISOString(),seed=[['职业规划大赛','竞赛项目'],['安全知识竞赛','竞赛项目'],['审计数据分析作品集','长期项目']];
  for(const [name,kind] of seed)if(!LS.v170.projects.some(p=>p.name===name))LS.v170.projects.push(v170NormalizeProject({id:uuid(),name,kind,status:'active',createdAt:now,updatedAt:now}));
  LS.v170.migrations.seedProjectsV170=true;return true
}
const v170NormalizeBase=normalizeLearningState;
normalizeLearningState=function(raw){const d=v170NormalizeBase(raw);d.v170=v170NormalizeState(raw?.v170);LS=d;v170SeedDefaults();LS.version=Math.max(12,Number(LS.version)||0);return LS};
LS.v170=v170NormalizeState(LS.v170);const v170Seeded=v170SeedDefaults();LS.version=Math.max(12,Number(LS.version)||0);if(v170Seeded)originalSet('learningState',LS);
function v170Save(){S.s('learningState',LS);renderLearningOverview();renderLearningMini();renderV160TodayCommand();renderCal()}
function v170Stamp(){return new Date().toISOString()}
function v170ProjectById(id){return LS.v170.projects.find(p=>p.id===id)}
function v170AddProject(name,kind,deadline,note){name=String(name||'').trim();if(!name){alert('请填写项目名称。');return}const now=v170Stamp();LS.v170.projects.unshift(v170NormalizeProject({id:uuid(),name,kind,deadline,note,createdAt:now,updatedAt:now}));v170Save();renderLearningAll();v156Toast('✓ 项目已创建',true)}
function v170UpdateProject(id,name,kind,deadline,status,note){const p=v170ProjectById(id);if(!p)return;p.name=String(name||p.name).trim()||p.name;p.kind=String(kind||p.kind);p.deadline=v150DateOk(deadline)?deadline:'';p.status=['active','paused','done'].includes(status)?status:p.status;p.note=String(note||'');p.updatedAt=v170Stamp();v170Save();renderLearningAll()}
function v170DeleteProject(id){const p=v170ProjectById(id);if(!p||!confirm(`删除项目“${p.name}”？项目日志和里程碑也会一起删除。`))return;v160CreateSafetyBackup('删除项目前',true);LS.v170.tombstones.projects=[id,...LS.v170.tombstones.projects.filter(x=>x!==id)].slice(0,500);LS.v170.projects=LS.v170.projects.filter(x=>x.id!==id);v170Save();renderLearningAll()}
function v170AddMilestone(pid,title,dueDate){title=String(title||'').trim();if(!title)return;const p=v170ProjectById(pid);if(!p)return;p.milestones.unshift({id:uuid(),title,dueDate:v150DateOk(dueDate)?dueDate:'',done:false,doneAt:'',updatedAt:v170Stamp()});p.updatedAt=v170Stamp();v170Save();renderLearningAll()}
function v170ToggleMilestone(pid,mid,done){const p=v170ProjectById(pid),m=p?.milestones.find(x=>x.id===mid);if(!m)return;m.done=!!done;m.doneAt=done?v170Stamp():'';m.updatedAt=v170Stamp();p.updatedAt=v170Stamp();v170Save();renderLearningAll()}
function v170DeleteMilestone(pid,mid){const p=v170ProjectById(pid);if(!p)return;LS.v170.tombstones.milestones=[mid,...LS.v170.tombstones.milestones.filter(x=>x!==mid)].slice(0,1000);p.milestones=p.milestones.filter(x=>x.id!==mid);p.updatedAt=v170Stamp();v170Save();renderLearningAll()}
function v170AddProjectLog(pid,date,minutes,note){const p=v170ProjectById(pid);minutes=Math.max(0,Math.round(Number(minutes)||0));note=String(note||'').trim();if(!p||!v150DateOk(date)||(!minutes&&!note)){alert('请填写日期，并至少填写分钟数或记录内容。');return}p.logs.unshift({id:uuid(),date,minutes,note,createdAt:v170Stamp(),updatedAt:v170Stamp()});p.logs=p.logs.slice(0,500);p.updatedAt=v170Stamp();v170Save();renderLearningAll();v156Toast('✓ 项目投入已记录（不计入专转本核心时长）',true)}
function v170DeleteProjectLog(pid,lid){const p=v170ProjectById(pid);if(!p)return;LS.v170.tombstones.logs=[lid,...LS.v170.tombstones.logs.filter(x=>x!==lid)].slice(0,1000);p.logs=p.logs.filter(x=>x.id!==lid);p.updatedAt=v170Stamp();v170Save();renderLearningAll()}
function v170ProjectMinutes(p,start='',end=''){return (p.logs||[]).filter(x=>(!start||x.date>=start)&&(!end||x.date<=end)).reduce((n,x)=>n+Number(x.minutes||0),0)}
function renderV170Projects(){
  const e=$('#learningPanel'),projects=[...LS.v170.projects].sort((a,b)=>(a.status==='active'?0:1)-(b.status==='active'?0:1)||String(a.deadline||'9999').localeCompare(String(b.deadline||'9999')));
  const html=projects.map(p=>{const done=p.milestones.filter(x=>x.done).length,total=p.milestones.length,mins=v170ProjectMinutes(p),mil=p.milestones.slice(0,8).map(m=>`<div class="v170-milestone"><input type="checkbox" data-v170-ms-toggle="${p.id}|${m.id}" ${m.done?'checked':''}><span>${esc(m.title)}</span><span class="date">${m.dueDate||'—'}</span><button class="x" data-v170-ms-del="${p.id}|${m.id}">×</button></div>`).join(''),logs=p.logs.slice(0,5).map(x=>`<div class="v170-log"><b>${x.date}</b><span class="mins">${x.minutes?x.minutes+'分钟':'—'}</span><span>${esc(x.note||'项目投入')}</span><button class="x" data-v170-log-del="${p.id}|${x.id}">×</button></div>`).join('');return `<div class="v170-project"><div class="v170-project-head"><div><h4>${esc(p.name)}</h4><div class="v170-project-meta"><span class="learning-chip">${esc(p.kind)}</span><span class="learning-chip ${p.status==='done'?'green':p.status==='paused'?'orange':'blue'}">${p.status==='done'?'已完成':p.status==='paused'?'暂停':'进行中'}</span>${p.deadline?`<span class="learning-chip">截止 ${p.deadline}</span>`:''}<span class="learning-chip">累计 ${(mins/60).toFixed(1)}h</span></div></div><button class="x" data-v170-project-del="${p.id}">×</button></div><div class="v170-project-form" style="margin-top:9px"><input id="v170Name-${p.id}" value="${esc(p.name)}"><select id="v170Kind-${p.id}"><option ${p.kind==='竞赛项目'?'selected':''}>竞赛项目</option><option ${p.kind==='长期项目'?'selected':''}>长期项目</option><option ${p.kind==='求职项目'?'selected':''}>求职项目</option><option ${p.kind==='个人项目'?'selected':''}>个人项目</option></select><input id="v170Deadline-${p.id}" type="date" value="${p.deadline}"><select id="v170Status-${p.id}"><option value="active" ${p.status==='active'?'selected':''}>进行中</option><option value="paused" ${p.status==='paused'?'selected':''}>暂停</option><option value="done" ${p.status==='done'?'selected':''}>已完成</option></select><input class="wide" id="v170Note-${p.id}" value="${esc(p.note)}" placeholder="项目备注"><button class="btn" data-v170-project-save="${p.id}">保存项目</button></div><div class="learning-source-note" style="margin-top:8px">里程碑 ${done}/${total} · 项目投入单独统计，不进入专转本核心有效时长。</div><div style="margin-top:6px">${mil||'<div class="learning-empty">暂无里程碑。</div>'}</div><div class="v170-project-form" style="margin-top:7px"><input class="wide" id="v170MsTitle-${p.id}" placeholder="新增里程碑"><input id="v170MsDate-${p.id}" type="date"><button class="btn" data-v170-ms-add="${p.id}">加里程碑</button></div><div style="margin-top:6px">${logs||'<div class="learning-empty">暂无项目投入记录。</div>'}</div><div class="v170-project-form" style="margin-top:7px"><input id="v170LogDate-${p.id}" type="date" value="${learningTodayKey()}"><input id="v170LogMin-${p.id}" type="number" min="0" max="720" placeholder="分钟"><input class="wide" id="v170LogNote-${p.id}" placeholder="今天推进了什么"><button class="btn" data-v170-log-add="${p.id}">记录投入</button></div></div>`}).join('');
  e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>项目模式</h4><div class="learning-source-note">比赛、作品集、求职准备都能有自己的里程碑与投入记录，但默认不冒充专转本核心学习时长。</div></div><span class="learning-chip green">能力成长 ≠ 只看备考</span></div><div class="v170-project-form" style="margin-top:10px"><input id="v170ProjectName" class="wide" placeholder="新项目名称"><select id="v170ProjectKind"><option>竞赛项目</option><option>长期项目</option><option>求职项目</option><option>个人项目</option></select><input id="v170ProjectDeadline" type="date"><input id="v170ProjectNote" class="wide" placeholder="可选：为什么做 / 预期成果"><button class="btn primary" id="v170ProjectAdd">新增项目</button></div></div>${html||'<div class="learning-section-card"><div class="learning-empty">还没有项目。</div></div>'}`;
  $('#v170ProjectAdd').onclick=()=>v170AddProject($('#v170ProjectName').value,$('#v170ProjectKind').value,$('#v170ProjectDeadline').value,$('#v170ProjectNote').value);document.querySelectorAll('[data-v170-project-save]').forEach(b=>b.onclick=()=>{const id=b.dataset.v170ProjectSave;v170UpdateProject(id,$(`#v170Name-${id}`).value,$(`#v170Kind-${id}`).value,$(`#v170Deadline-${id}`).value,$(`#v170Status-${id}`).value,$(`#v170Note-${id}`).value)});document.querySelectorAll('[data-v170-project-del]').forEach(b=>b.onclick=()=>v170DeleteProject(b.dataset.v170ProjectDel));document.querySelectorAll('[data-v170-ms-add]').forEach(b=>b.onclick=()=>{const id=b.dataset.v170MsAdd;v170AddMilestone(id,$(`#v170MsTitle-${id}`).value,$(`#v170MsDate-${id}`).value)});document.querySelectorAll('[data-v170-ms-toggle]').forEach(x=>x.onchange=e=>{const [p,m]=x.dataset.v170MsToggle.split('|');v170ToggleMilestone(p,m,e.target.checked)});document.querySelectorAll('[data-v170-ms-del]').forEach(b=>b.onclick=()=>{const[p,m]=b.dataset.v170MsDel.split('|');v170DeleteMilestone(p,m)});document.querySelectorAll('[data-v170-log-add]').forEach(b=>b.onclick=()=>{const id=b.dataset.v170LogAdd;v170AddProjectLog(id,$(`#v170LogDate-${id}`).value,$(`#v170LogMin-${id}`).value,$(`#v170LogNote-${id}`).value)});document.querySelectorAll('[data-v170-log-del]').forEach(b=>b.onclick=()=>{const[p,l]=b.dataset.v170LogDel.split('|');v170DeleteProjectLog(p,l)})
}
function v170LifeRecord(k=learningTodayKey()){const x=LS.v170.life.checkins[k];return x&&typeof x==='object'?x:{date:k,move:false,outdoors:false,social:false,hobby:false,happiness:0,note:''}}
function v170SaveLife(k,data){LS.v170.life.checkins[k]={date:k,move:!!data.move,outdoors:!!data.outdoors,social:!!data.social,hobby:!!data.hobby,happiness:Math.max(0,Math.min(5,Number(data.happiness)||0)),note:String(data.note||''),updatedAt:v170Stamp()};v170Save();renderLearningAll();v156Toast('✓ 生活记录已保存；它不会参与学习评级',true)}
function renderV170Life(){const e=$('#learningPanel'),k=learningTodayKey(),x=v170LifeRecord(k),arr=Object.values(LS.v170.life.checkins||{}).filter(Boolean).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,14),avg=arr.filter(x=>x.happiness>0),h=avg.length?avg.reduce((n,x)=>n+Number(x.happiness),0)/avg.length:0;const hist=arr.map(r=>{const tags=[r.move?'运动/活动':'',r.outdoors?'户外':'',r.social?'社交/约会':'',r.hobby?'兴趣':''].filter(Boolean).join(' · ');return `<div class="v170-life-row"><b>${r.date}</b><span>${tags||'只记录了感受'}${r.happiness?` · 幸福感 ${r.happiness}/5`:''}${r.note?` · ${esc(r.note)}`:''}</span></div>`}).join('');e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>生活不是学习之后的奖励</h4><div class="learning-source-note">这里只记录你有没有认真生活，不设连续打卡、不参与 S/A/B/C、不因为没勾选而变红。</div></div><span class="learning-chip green">非 KPI</span></div><div class="v170-life-grid" style="margin-top:10px"><label class="v170-life-check"><input id="v170LifeMove" type="checkbox" ${x.move?'checked':''}> 有活动/运动</label><label class="v170-life-check"><input id="v170LifeOut" type="checkbox" ${x.outdoors?'checked':''}> 有户外/散步</label><label class="v170-life-check"><input id="v170LifeSocial" type="checkbox" ${x.social?'checked':''}> 有社交/约会</label><label class="v170-life-check"><input id="v170LifeHobby" type="checkbox" ${x.hobby?'checked':''}> 有兴趣娱乐</label></div><div class="v170-project-form" style="margin-top:9px"><label>今天幸福感（可选 1—5）<input id="v170LifeHappy" type="number" min="1" max="5" value="${x.happiness||''}"></label><input class="wide" id="v170LifeNote" value="${esc(x.note)}" placeholder="今天有什么值得记住的小事"><button class="btn primary" id="v170LifeSave">保存今天</button></div></div><div class="learning-section-card"><div class="v170-grid"><div class="v170-card"><small>近14天有记录</small><b>${arr.length} 天</b><p>记录不是目标，只用来提醒自己人生不只有学习。</p></div><div class="v170-card"><small>有填写的幸福感均值</small><b>${avg.length?h.toFixed(1)+'/5':'—'}</b><p>只看趋势，不做奖惩。</p></div><div class="v170-card"><small>今天</small><b>${[x.move,x.outdoors,x.social,x.hobby].filter(Boolean).length} 项生活</b><p>哪怕今天只休息，也完全有效。</p></div></div><div class="v170-life-history">${hist||'<div class="learning-empty">还没有生活记录。</div>'}</div></div>`;$('#v170LifeSave').onclick=()=>v170SaveLife(k,{move:$('#v170LifeMove').checked,outdoors:$('#v170LifeOut').checked,social:$('#v170LifeSocial').checked,hobby:$('#v170LifeHobby').checked,happiness:$('#v170LifeHappy').value,note:$('#v170LifeNote').value})}
function v170RecentKeys(days=7){const out=[],d=learningTodayDate();for(let i=days-1;i>=0;i--){const x=new Date(d);x.setDate(x.getDate()-i);out.push(fmt(x))}return out}
function v170Adaptive(){const today=learningTodayKey(),keys=v170RecentKeys(7),sleep=keys.map(k=>LS.sleep?.records?.[k]).filter(Boolean),avgSleep=sleep.length?sleep.reduce((n,x)=>n+sleepDurationMin(x),0)/sleep.length:0,short=sleep.filter(x=>sleepDurationMin(x)<360).length,heavy=keys.filter(k=>v158EffectiveSecondsBetween(k,k)>=270*60).length,week=v158EffectiveWeekSeconds()/3600,target=v158ScheduledWeekMinutes()/60,q=v160QualityMonthStats(today.slice(0,7)),manual=energyFor(today),rest=v158IsProtectedRestDay(today);let mode='normal',title='标准推进',tab='today',reasons=[];if(rest){mode='rest';title=v158IsWeeklyRestDay(today)?'完整休息':'合法调休';tab='policy';reasons.push('今天本来就是 0 小时目标，不需要额外证明自律。')}else if(manual==='low'||(sleep.length>=3&&avgSleep<390)||short>=2||heavy>=5){mode='low';title='恢复优先 · 低负荷';tab='review';if(manual==='low')reasons.push('你今天已经手动选择低负荷模式。');if(sleep.length>=3&&avgSleep<390)reasons.push(`近7天已记录睡眠平均 ${sleepHuman(avgSleep)}，先保护恢复。`);if(short>=2)reasons.push(`近7天有 ${short} 晚不足6小时。`);if(heavy>=5)reasons.push(`近7天有 ${heavy} 天核心有效学习达到4.5小时以上，连续负荷偏高。`)}else if(q.retrievalCount>=2&&q.retrieval<75){mode='quality';title='质量优先 · 少加新内容';tab='quality';reasons.push(`本月有效延迟提取均分 ${q.retrieval.toFixed(0)}%，当前更值得处理“记不住”而不是继续堆新内容。`)}else{reasons.push(`本周核心有效学习 ${week.toFixed(1)}h / 排程 ${target.toFixed(1)}h。`);if(sleep.length)reasons.push(`近7天已记录睡眠平均 ${sleepHuman(avgSleep)}。`);reasons.push('没有触发明显的恢复风险信号，按正常节奏推进即可。')}return {mode,title,tab,reasons,avgSleep,sleepN:sleep.length,short,heavy,week,target,q}}
function renderV170Rhythm(){const e=$('#learningPanel'),a=v170Adaptive(),label={rest:'休息',low:'低负荷',quality:'质量优先',normal:'标准'}[a.mode];e.innerHTML=`<div class="v170-rhythm-hero"><span class="learning-chip ${a.mode==='normal'?'green':a.mode==='rest'?'green':'orange'}">今日建议 · ${label}</span><h3>${esc(a.title)}</h3><p>这是基于你自己的学习、睡眠和质量记录做的管理建议，不是医学判断，也不会自动改掉计划。你始终可以手动选择。</p><div class="v170-reason-list">${a.reasons.map(x=>`<div class="v170-reason">${esc(x)}</div>`).join('')}</div><div class="v170-report-actions"><button class="btn primary" id="v170ApplyRhythm">应用建议</button><button class="btn" id="v170OpenRhythmTarget">打开对应页面</button></div></div><div class="learning-section-card"><div class="v170-grid"><div class="v170-card"><small>近7天高负荷天</small><b>${a.heavy} 天</b><p>定义：当天核心有效学习 ≥4.5h，仅用于判断连续负荷。</p></div><div class="v170-card"><small>近7天睡眠</small><b>${a.sleepN?a.sleepN+'晚 / '+sleepHuman(a.avgSleep):'未记录'}</b><p>不会因为没记录睡眠而扣分。</p></div><div class="v170-card"><small>本周核心有效学习</small><b>${a.week.toFixed(1)}h</b><p>当前排程约 ${a.target.toFixed(1)}h；合法调休已经从目标中扣除。</p></div></div></div>`;$('#v170OpenRhythmTarget').onclick=()=>{activeLearningTab=a.tab;renderLearningAll()};$('#v170ApplyRhythm').onclick=()=>{if(a.mode==='rest'){activeLearningTab='today';renderLearningAll();return}if(a.mode==='low'){setEnergy('low',learningTodayKey());v156Toast('✓ 今日已切换低负荷；不增加欠账',true)}else if(a.mode==='normal'){setEnergy('normal',learningTodayKey());v156Toast('✓ 今日保持标准模式',true)}else{activeLearningTab='quality';renderLearningAll();return}renderLearningAll()}}
function v170ProjectPeriodMinutes(a,b){return LS.v170.projects.reduce((n,p)=>n+v170ProjectMinutes(p,a,b),0)}
function v170LifePeriod(a,b){return Object.values(LS.v170.life.checkins||{}).filter(x=>x?.date>=a&&x?.date<=b)}
function v170QualityPeriod(a,b){const q=v160Quality(),r=q.retrievalTests.filter(x=>x.testDate>=a&&x.testDate<=b&&v160RetrievalValid(x)),er=q.errorChecks.filter(x=>x.date>=a&&x.date<=b&&v160ErrorValid(x));return {r,er,retrieval:r.length?r.reduce((n,x)=>n+Number(x.score),0)/r.length:0,error:er.length?er.reduce((n,x)=>n+v160ErrorImprove(x),0)/er.length:0}}
function v170SleepPeriod(a,b){const x=Object.values(LS.sleep?.records||{}).filter(r=>r?.date>=a&&r?.date<=b);return {n:x.length,avg:x.length?x.reduce((n,r)=>n+sleepDurationMin(r),0)/x.length:0,good:x.filter(r=>sleepDurationMin(r)>=420).length}}
function v170ReportData(type){let a,b,label;if(type==='week'){[a,b]=studyWeekRange();label=`${a} — ${b} 周报告`}else{const m=learningTodayKey().slice(0,7),[y,mo]=m.split('-').map(Number);a=`${m}-01`;b=fmt(new Date(y,mo,0,12));label=`${m} 月报告`}const sec=v158EffectiveSecondsBetween(a,b),scheduled=(()=>{let d=parse(a),e=parse(b),m=0;for(;d<=e;d.setDate(d.getDate()+1))m+=v158DailyTargetMin(fmt(d));return m})();const by={};for(const sub of ['英语','财经','高数'])by[sub]=(LS.studyTimer.sessions||[]).filter(x=>sessionDate(x)>=a&&sessionDate(x)<=b&&x.subject===sub&&v158SessionCounts(x)).reduce((n,x)=>n+Number(x.focusSeconds||0),0);const sleep=v170SleepPeriod(a,b),quality=v170QualityPeriod(a,b),life=v170LifePeriod(a,b),projects=v170ProjectPeriodMinutes(a,b),ratio=scheduled?sec/(scheduled*60):0;let next='保持当前节奏，不需要为了追求 S 额外加码。';if(sleep.n>=3&&sleep.avg<420)next='优先把睡眠和恢复拉回稳定，再考虑增加新内容。';else if(quality.r.length>=2&&quality.retrieval<75)next='减少单纯输入，把更多时间放到延迟提取、错题重做和闭卷回忆。';else if(ratio<.8)next='先检查拖延、学校事务或计划是否过重，不要用下周爆肝偿还“学习债”。';const text=`# ${label}\n\n学习投入\n- 核心有效学习：${(sec/3600).toFixed(1)}h / 排程 ${(scheduled/60).toFixed(1)}h（${Math.round(ratio*100)}%）\n- 英语 ${(by['英语']/3600).toFixed(1)}h · 财经 ${(by['财经']/3600).toFixed(1)}h · 高数 ${(by['高数']/3600).toFixed(1)}h\n\n学习质量\n- 有效延迟提取：${quality.r.length} 次${quality.r.length?`，均分 ${quality.retrieval.toFixed(0)}%`:''}\n- 同难度错误率对照：${quality.er.length} 次${quality.er.length?`，平均改善 ${quality.error.toFixed(1)}%`:''}\n\n恢复与生活\n- 睡眠记录：${sleep.n} 晚${sleep.n?`，平均 ${sleepHuman(sleep.avg)}，≥7h ${sleep.good} 晚`:''}\n- 生活记录：${life.length} 天（不参与学习评级）\n- 其他成长项目投入：${(projects/60).toFixed(1)}h（不计入专转本核心时长）\n\n下一步\n${next}`;return {a,b,label,text,sec,scheduled,sleep,quality,life,projects}}
function v170Copy(text){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>v156Toast('✓ 已复制',true)).catch(()=>{});else{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();v156Toast('✓ 已复制',true)}}
function renderV170Reports(){const e=$('#learningPanel'),w=v170ReportData('week'),m=v170ReportData('month');e.innerHTML=`<div class="learning-section-card"><div class="learning-row spread"><div><h4>自动报告</h4><div class="learning-source-note">报告只总结真实数据，不生成鸡汤，也不会用一周表现给你贴标签。</div></div><span class="learning-chip green">事实 → 判断 → 下一步</span></div><div class="review-tabs" style="margin-top:10px"><button class="btn active" id="v170ReportWeek">本周</button><button class="btn" id="v170ReportMonth">本月</button></div><div id="v170ReportText" class="v170-report" style="margin-top:9px">${esc(w.text)}</div><div class="v170-report-actions"><button class="btn primary" id="v170ReportCopy">复制报告</button><button class="btn" id="v170ReportDownload">下载 Markdown</button></div></div>`;let cur=w;const show=x=>{cur=x;$('#v170ReportText').textContent=x.text;$('#v170ReportWeek').classList.toggle('active',x===w);$('#v170ReportMonth').classList.toggle('active',x===m)};$('#v170ReportWeek').onclick=()=>show(w);$('#v170ReportMonth').onclick=()=>show(m);$('#v170ReportCopy').onclick=()=>v170Copy(cur.text);$('#v170ReportDownload').onclick=()=>downloadText(`${cur.label.replace(/\s+/g,'_')}.md`,cur.text)}
function v170SearchAll(q,type='all'){q=String(q||'').trim().toLowerCase();if(!q)return [];const out=[],add=(t,date,title,detail,tab='today')=>{const hay=`${title} ${detail} ${date} ${t}`.toLowerCase();if((type==='all'||type===t)&&hay.includes(q))out.push({t,date,title,detail,tab})};for(const [date,arr] of Object.entries(T||{}))for(const x of (Array.isArray(arr)?arr:[]))add('任务',date,x.text||'任务',x.priority||'', 'today');for(const x of LS.studyTimer.sessions||[])add('学习',sessionDate(x),`${x.subject} · ${secHuman(x.focusSeconds)}`,x.note||'', 'stats');for(const x of LS.quality?.retrievalTests||[])add('质量',x.testDate,`${x.subject} · 延迟提取 ${x.score}%`,x.note||'', 'quality');for(const x of LS.quality?.errorChecks||[])add('质量',x.date,`${x.subject} · 错误率 ${x.before}%→${x.after}%`,x.note||'', 'quality');for(const x of LS.freeLogs||[])add('学习',x.date,`${x.track||'学习'} · 自主记录`,x.text||'', 'today');for(const p of LS.v170.projects){add('项目',p.deadline||'',p.name,p.note||'', 'projects');for(const m of p.milestones)add('项目',m.dueDate||'',`${p.name} · ${m.title}`,m.done?'已完成':'未完成','projects');for(const l of p.logs)add('项目',l.date,`${p.name} · ${l.minutes||0}分钟`,l.note||'','projects')}for(const [date,r] of Object.entries(R||{})){if(!r)continue;for(const k of ['wrong','right','better'])if(r[k])add('复盘',date,k==='wrong'?'做错了什么':k==='right'?'做对了什么':'怎么做得更好',r[k],'today')}return out.sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,100)}
function renderV170Search(){const e=$('#learningPanel');e.innerHTML=`<div class="learning-section-card"><h4>全局搜索与历史</h4><div class="v170-searchbar"><input id="v170SearchQ" placeholder="搜任务、章节、项目、错题、备注……"><select id="v170SearchType"><option value="all">全部类型</option><option>任务</option><option>学习</option><option>质量</option><option>项目</option><option>复盘</option></select><button class="btn primary" id="v170SearchGo">搜索</button></div><div id="v170SearchResults" class="v170-search-results"><div class="learning-empty">输入关键词开始搜索。数据只在本地日历中查找。</div></div></div>`;const run=()=>{const r=v170SearchAll($('#v170SearchQ').value,$('#v170SearchType').value),box=$('#v170SearchResults');box.innerHTML=r.length?r.map((x,i)=>`<div class="v170-search-row"><b>${x.date||'—'}</b><span class="type">${esc(x.t)}</span><span><b>${esc(x.title)}</b><br><small>${esc(x.detail)}</small></span><button class="btn" data-v170-search-open="${i}">打开</button></div>`).join(''):'<div class="learning-empty">没有匹配记录。</div>';document.querySelectorAll('[data-v170-search-open]').forEach(b=>b.onclick=()=>{const x=r[Number(b.dataset.v170SearchOpen)];activeLearningTab=x.tab;renderLearningAll()})};$('#v170SearchGo').onclick=run;$('#v170SearchQ').onkeydown=e=>{if(e.key==='Enter')run()}}
function v170RenderQuick(){const b=$('#v170QuickBody');if(!b)return;const projects=LS.v170.projects.filter(p=>p.status==='active');b.innerHTML=`<div class="v170-quick-grid"><div class="v170-quick-card"><h4>马上开始学习</h4><p>直接进入计时器，不需要先翻计划。</p><button class="btn primary" id="v170QuickTimer">打开计时器</button> <button class="btn" id="v170QuickLow">今天切低负荷</button></div><div class="v170-quick-card"><h4>快速加今日任务</h4><div class="v170-quick-form"><input id="v170QuickTask" placeholder="今天还要做什么"><button class="btn" id="v170QuickTaskAdd">添加</button></div></div><div class="v170-quick-card"><h4>记录项目投入</h4><div class="v170-quick-form"><select id="v170QuickProject">${projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')||'<option value="">暂无进行中项目</option>'}</select><input id="v170QuickProjectMin" type="number" min="0" max="720" placeholder="分钟"><input id="v170QuickProjectNote" style="grid-column:1/-1" placeholder="推进了什么"><button class="btn" id="v170QuickProjectAdd">记录</button></div></div><div class="v170-quick-card"><h4>生活也要记得过</h4><p>快速标记今天发生过的生活，不计分。</p><div class="v170-life-grid"><label class="v170-life-check"><input id="v170QLMove" type="checkbox"> 活动</label><label class="v170-life-check"><input id="v170QLSocial" type="checkbox"> 社交</label><label class="v170-life-check"><input id="v170QLHobby" type="checkbox"> 兴趣</label><label class="v170-life-check"><input id="v170QLOut" type="checkbox"> 户外</label></div><button class="btn" id="v170QuickLifeSave" style="margin-top:8px">保存生活标记</button></div></div>`;$('#v170QuickTimer').onclick=()=>{$('#v170QuickModal').classList.remove('show');openLearning('timer')};$('#v170QuickLow').onclick=()=>{setEnergy('low',learningTodayKey());v156Toast('✓ 今天切到低负荷',true);$('#v170QuickModal').classList.remove('show')};$('#v170QuickTaskAdd').onclick=()=>{const text=$('#v170QuickTask').value.trim();if(!text)return;const k=learningTodayKey();T[k]=T[k]||[];T[k].push({id:uuid(),text,priority:'medium',done:false,time:'',createdAt:v170Stamp()});S.s('tasks',T);renderCal();renderSide();v156Toast('✓ 今日任务已添加',true);$('#v170QuickTask').value=''};$('#v170QuickProjectAdd').onclick=()=>{const id=$('#v170QuickProject').value;if(id)v170AddProjectLog(id,learningTodayKey(),$('#v170QuickProjectMin').value,$('#v170QuickProjectNote').value)};$('#v170QuickLifeSave').onclick=()=>{const old=v170LifeRecord();v170SaveLife(learningTodayKey(),{...old,move:old.move||$('#v170QLMove').checked,social:old.social||$('#v170QLSocial').checked,hobby:old.hobby||$('#v170QLHobby').checked,outdoors:old.outdoors||$('#v170QLOut').checked});$('#v170QuickModal').classList.remove('show')}}
function v170Counts(data=snapshotData()){const ls=data?.learningState||{},v=ls.v170||{};return {...v160SnapshotCounts(data),projects:Array.isArray(v.projects)?v.projects.length:0,life:Object.keys(v.life?.checkins||{}).length}}
function v170MergeItems(local,remote,tombs=[]){const dead=new Set(tombs||[]),m=new Map();for(const x of [...(remote||[]),...(local||[])]){if(!x?.id||dead.has(x.id))continue;const prev=m.get(x.id),t=Date.parse(x.updatedAt||x.createdAt||'')||0,pt=Date.parse(prev?.updatedAt||prev?.createdAt||'')||0;if(!prev||t>=pt)m.set(x.id,x)}return [...m.values()]}
function v170MergeProjects(local,remote,tombs=[],milestoneTombs=[],logTombs=[]){const dead=new Set(tombs||[]),lm=new Map((local||[]).map(x=>[x.id,v170NormalizeProject(x)])),rm=new Map((remote||[]).map(x=>[x.id,v170NormalizeProject(x)])),ids=new Set([...lm.keys(),...rm.keys()]),out=[];for(const id of ids){if(dead.has(id))continue;const a=lm.get(id),b=rm.get(id);if(!a){const x=v170NormalizeProject(b);x.milestones=v170MergeItems([],x.milestones,milestoneTombs);x.logs=v170MergeItems([],x.logs,logTombs);out.push(x);continue}if(!b){const x=v170NormalizeProject(a);x.milestones=v170MergeItems(x.milestones,[],milestoneTombs);x.logs=v170MergeItems(x.logs,[],logTombs);out.push(x);continue}const at=Date.parse(a.updatedAt)||0,bt=Date.parse(b.updatedAt)||0,base=at>=bt?{...a}:{...b};base.milestones=v170MergeItems(a.milestones,b.milestones,milestoneTombs);base.logs=v170MergeItems(a.logs,b.logs,logTombs);out.push(v170NormalizeProject(base))}return out}
function v170MergeCheckins(local,remote){const out={};for(const k of new Set([...Object.keys(remote||{}),...Object.keys(local||{})])){const a=local?.[k],b=remote?.[k];if(a&&b){const at=Date.parse(a.updatedAt||'')||0,bt=Date.parse(b.updatedAt||'')||0;out[k]=bt>at?b:a}else out[k]=a||b}return out}
function v170MergedState(local,remote){const a=v170NormalizeState(local),b=v170NormalizeState(remote),t={projects:[...new Set([...a.tombstones.projects,...b.tombstones.projects])],milestones:[...new Set([...a.tombstones.milestones,...b.tombstones.milestones])],logs:[...new Set([...a.tombstones.logs,...b.tombstones.logs])],retrieval:[...new Set([...a.tombstones.retrieval,...b.tombstones.retrieval])],errors:[...new Set([...a.tombstones.errors,...b.tombstones.errors])]};return {version:1,projects:v170MergeProjects(a.projects,b.projects,t.projects,t.milestones,t.logs),life:{checkins:v170MergeCheckins(a.life.checkins,b.life.checkins)},settings:a.settings,migrations:{...b.migrations,...a.migrations},tombstones:t}}
const v170MergeRemoteBase=mergeRemoteStudyLedgerIntoLocal;
mergeRemoteStudyLedgerIntoLocal=function(remotePayload,{persist=true}={}){const before=JSON.stringify([LS.studyTimer.sessions,LS.sleep?.records,LS.quality,LS.v170]);v170MergeRemoteBase(remotePayload,{persist:false});const rls=remotePayload?.learningState||{},rv=v170NormalizeState(rls.v170),mergedV=v170MergedState(LS.v170,rv);const tr=new Set(mergedV.tombstones.retrieval),te=new Set(mergedV.tombstones.errors),rq=rls.quality||{};LS.quality.retrievalTests=v170MergeItems(LS.quality.retrievalTests,rq.retrievalTests||[],tr);LS.quality.errorChecks=v170MergeItems(LS.quality.errorChecks,rq.errorChecks||[],te);LS.v170=mergedV;const changed=before!==JSON.stringify([LS.studyTimer.sessions,LS.sleep?.records,LS.quality,LS.v170]);if(changed&&persist){originalSet('learningState',LS);renderLearningOverview();renderLearningMini();if($('#learningModal')?.classList.contains('show'))renderLearningPanel()}return changed};
const v170StableCloneBase=stableCloneWithoutStudyLedger;
stableCloneWithoutStudyLedger=function(payload){const x=v170StableCloneBase(payload);if(x.learningState){x.learningState.quality={retrievalTests:[],errorChecks:[]};x.learningState.v170=v170DefaultState()}return x};
const v170RemoveQualityBase=v160RemoveQuality;
v160RemoveQuality=function(kind,id){if(kind==='r')LS.v170.tombstones.retrieval=[id,...LS.v170.tombstones.retrieval.filter(x=>x!==id)].slice(0,1000);else LS.v170.tombstones.errors=[id,...LS.v170.tombstones.errors.filter(x=>x!==id)].slice(0,1000);return v170RemoveQualityBase(kind,id)};
function v170PrepareRemotePayload(remotePayload){const x=JSON.parse(JSON.stringify(remotePayload||{}));x.learningState=x.learningState||{};const mergedLedger=mergeStudyLedger(LS.studyTimer.sessions,LS.studyTimer.deletedSessionIds,studyLedger(x).sessions,studyLedger(x).deleted),mergedSleep=mergeSleepRecords(LS.sleep?.records||{},sleepRecordsFromPayload(x));x.learningState.studyTimer=x.learningState.studyTimer||{active:null,sessions:[]};x.learningState.studyTimer.sessions=mergedLedger.sessions;x.learningState.studyTimer.deletedSessionIds=mergedLedger.deletedSessionIds;x.learningState.studyTimer.active=LS.studyTimer.active;x.learningState.sleep=x.learningState.sleep||{records:{}};x.learningState.sleep.records=mergedSleep;const mv=v170MergedState(LS.v170,x.learningState.v170),tr=new Set(mv.tombstones.retrieval),te=new Set(mv.tombstones.errors),rq=x.learningState.quality||{};x.learningState.quality={retrievalTests:v170MergeItems(LS.quality.retrievalTests,rq.retrievalTests||[],tr),errorChecks:v170MergeItems(LS.quality.errorChecks,rq.errorChecks||[],te)};x.learningState.v170=mv;return x}
downloadCloud=async function(force=false){v160CreateSafetyBackup('下载云端前',true);if(!sb||!sbUser){alert('请先登录云端账号。');return}setCloudStatus('busy','检查云端');const {data,error}=await fetchCloudState();if(error){setCloudStatus('off','下载失败');alert(error.message);return}if(!data?.payload){setCloudStatus('on','云端为空');alert('云端还没有日历数据。');return}const m=syncMeta(),remoteAt=data.updated_at||'',dirty=localIsDirty(m);if(dirty&&!force){const ok=confirm(`本机存在尚未确认同步的修改。\n\n本地：${fmtSyncTime(m.localUpdatedAt)}\n云端：${fmtSyncTime(remoteAt)}\n\n学习计时、睡眠、质量、项目和生活记录会先安全合并；其他数据以云端为准。继续吗？`);if(!ok){setCloudStatus('on','云端已登录');return}}else if(!confirm(`云端更新时间：${fmtSyncTime(remoteAt)}。\n可合并账本会先合并，其他数据使用云端版本。继续吗？`)){setCloudStatus('on','云端已登录');return}const merged=v170PrepareRemotePayload(data.payload);applySnapshot(merged);const syncedAt=v170Stamp();saveSyncMeta({lastSyncedCloudAt:remoteAt,cloudUpdatedAt:remoteAt,lastSyncedAt:syncedAt,localUpdatedAt:syncedAt,conflict:false});clearCloudDirty();setCloudStatus('on','已同步');alert('云端数据已恢复；可合并账本已安全合并。')};
v160SetBackupHistory=function(arr){try{localStorage.setItem(V160_BACKUP_KEY,JSON.stringify(arr.slice(0,7)));return true}catch{return false}};
v160CreateSafetyBackup=function(reason='手动快照',quiet=false){const data=snapshotData(),item={id:uuid(),reason,dateKey:learningTodayKey(),createdAt:v170Stamp(),counts:v170Counts(data),data};let arr=v160BackupHistory();arr.unshift(item);arr=arr.slice(0,7);if(!v160SetBackupHistory(arr)){try{v160SetBackupHistory(arr.slice(0,2))}catch{}if(!quiet)alert('浏览器存储空间不足，无法保存内部快照；请先导出 JSON。');return null}v160RenderBackupHistory();if(!quiet)v156Toast('✓ 已创建安全快照',true);return item};
v160RenderBackupHistory=function(){const e=$('#v160BackupHistory');if(!e)return;const arr=v160BackupHistory();e.innerHTML=arr.length?arr.map(x=>`<div class="v160-backup-row"><div><b>${esc(x.reason)} · ${fmtSyncTime(x.createdAt)}</b><small>学习 ${x.counts?.study||0} · 睡眠 ${x.counts?.sleep||0} · 项目 ${x.counts?.projects||0} · 生活 ${x.counts?.life||0}</small></div><div class="v160-backup-actions"><button class="btn" data-v160-backup-export="${x.id}">导出</button><button class="btn" data-v160-backup-restore="${x.id}">恢复</button><button class="x" data-v160-backup-delete="${x.id}">×</button></div></div>`).join('')+'<div class="v170-history-note">最多保留 7 份。重大导入/下载前会自动留档；日常修改每 30 分钟最多自动留一份滚动历史。</div>':'<div class="learning-empty">还没有内部快照。</div>';document.querySelectorAll('[data-v160-backup-export]').forEach(b=>b.onclick=()=>{const x=v160BackupHistory().find(i=>i.id===b.dataset.v160BackupExport);if(x)v160ExportSnapshot(x)});document.querySelectorAll('[data-v160-backup-restore]').forEach(b=>b.onclick=()=>v160RestoreSnapshot(b.dataset.v160BackupRestore));document.querySelectorAll('[data-v160-backup-delete]').forEach(b=>b.onclick=()=>v160DeleteSnapshot(b.dataset.v160BackupDelete))};
let v170HistoryGuard=false;const v170SaveBase=S.s;S.s=(k,v)=>{if(!v170HistoryGuard&&!syncSuppressed&&!['sentReminders','cloudConfig','syncMeta'].includes(k)){const last=Number(localStorage.getItem('zx_v170HistoryAt')||0);if(Date.now()-last>30*60*1000){v170HistoryGuard=true;try{v160CreateSafetyBackup('滚动历史',true);localStorage.setItem('zx_v170HistoryAt',String(Date.now()))}finally{v170HistoryGuard=false}}}return v170SaveBase(k,v)};
async function v170CompareCloud(){const box=$('#v170CloudCompare');if(!box)return;const local=v170Counts(snapshotData());if(!sb||!sbUser){box.innerHTML='<div class="learning-empty">未登录云端，当前只需保护本地备份。</div>';return}box.innerHTML='<div class="learning-empty">正在比较……</div>';const {data,error}=await fetchCloudState();if(error||!data?.payload){box.innerHTML=`<div class="learning-empty">${error?esc(error.message):'云端暂无数据。'}</div>`;return}const cloud=v170Counts(data.payload),rows=[['任务',local.tasks,cloud.tasks],['学习计时',local.study,cloud.study],['睡眠',local.sleep,cloud.sleep],['延迟提取',local.retrieval,cloud.retrieval],['错误率对照',local.errors,cloud.errors],['项目',local.projects,cloud.projects],['生活记录',local.life,cloud.life]];box.innerHTML=`<table class="v170-sync-table"><tr><th>数据</th><th>本地</th><th>云端</th><th>判断</th></tr>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[1]===r[2]?'数量一致':'有差异'}</td></tr>`).join('')}</table><div class="v170-sync-note"><b>本地修改：</b>${fmtSyncTime(syncMeta().localUpdatedAt)}　<b>云端修改：</b>${fmtSyncTime(data.updated_at)}<br>数量不同不等于丢数据。V1.7.2 会自动合并：学习计时、睡眠、学习质量、项目和生活记录；普通任务/日历结构仍需要你决定以哪端为准。</div>`}
function v170UndoLatest(){const arr=v160BackupHistory();if(!arr.length){alert('还没有可恢复的内部快照。');return}v160RestoreSnapshot(arr[0].id)}
const v170PanelBase=renderLearningPanel;renderLearningPanel=function(){document.querySelectorAll('[data-learning-tab]').forEach(b=>b.classList.toggle('active',b.dataset.learningTab===activeLearningTab));if(activeLearningTab==='rhythm'){renderV170Rhythm();ensureQuickTimerBar();return}if(activeLearningTab==='projects'){renderV170Projects();ensureQuickTimerBar();return}if(activeLearningTab==='reports'){renderV170Reports();ensureQuickTimerBar();return}if(activeLearningTab==='search'){renderV170Search();ensureQuickTimerBar();return}if(activeLearningTab==='life'){renderV170Life();ensureQuickTimerBar();return}v170PanelBase()};
const v170TodayCommandBase=renderV160TodayCommand;renderV160TodayCommand=function(){v170TodayCommandBase();const body=$('#v160TodayCommandBody');if(!body||fmt(sel)!==learningTodayKey())return;const a=v170Adaptive(),card=body.querySelector('.v160-command-card');if(card&&!card.querySelector('#v170RhythmShortcut')){const d=document.createElement('div');d.style.marginTop='8px';d.innerHTML=`<button class="btn" id="v170RhythmShortcut">今日节奏：${esc(a.title)}</button>`;card.appendChild(d);$('#v170RhythmShortcut').onclick=()=>openLearning('rhythm')}};
const v170CloudBtnBase=$('#cloudBtn').onclick;$('#cloudBtn').onclick=()=>{v170CloudBtnBase();v160RenderBackupHistory();setTimeout(()=>{v170CompareCloud();v160RunDiagnostics()},80)};$('#v170CompareCloud').onclick=v170CompareCloud;$('#v170UndoBtn').onclick=v170UndoLatest;
$('#v170QuickBtn').onclick=()=>{$('#v170QuickModal').classList.add('show');v170RenderQuick()};$('#v170CloseQuick').onclick=()=>$('#v170QuickModal').classList.remove('show');$('#v170QuickModal').addEventListener('click',e=>{if(e.target.id==='v170QuickModal')$('#v170QuickModal').classList.remove('show')});


v160Quality();
setTimeout(()=>v160EnsureDailyBackup(),250);

v155Save();

// V1.5.6：页面底部“管理纪念日”复用顶部纪念日管理入口。
if($('#annivManageBtn'))$('#annivManageBtn').onclick=()=>$('#annivBtn').click();

renderCal();renderSide();renderAnniv();renderStreak();nextTerm();updateNotifyUI();checkReminders();renderAIStored();renderLearningMini();renderLearningOverview();initSupabase();setTimeout(recoverSessionAndRetrySync,1800);window.addEventListener('load',()=>setTimeout(recoverSessionAndRetrySync,500));
setInterval(checkReminders,30000);setTimeout(()=>{renderCal();renderSide();nextTerm()},900);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();