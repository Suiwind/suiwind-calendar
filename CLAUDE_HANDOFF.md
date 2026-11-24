# Claude 交接 · 苏伊温德个人工作台 V4.1

**本轮目标：仅做前端审美优化，不重写功能。** 允许调整布局、字体、色彩、组件外观及非业务文案；不要引入框架、迁移数据、删除旧功能、改变排盘算法或同步协议。V4.1 已按最新需求取消贴图工坊，四个入口为日历 / 学习复盘 / 健身训练 / 术数馆。

## 1. 文件结构与修改边界

| 文件 | 职责 |
|---|---|
| `index.html` | 全部页面与弹窗的 DOM；允许调整布局，保留 `id`/`data-*`、表单类型、语义、状态属性 |
| `styles.css` | 原 V3.5 样式，视觉改造主入口 |
| `workbench.css` | 四入口导航、响应式、旧模块布局、显隐规则 |
| `fitness.css` | 健身训练页面独立样式；新增布局仅作用于 `#fitnessWorkspace` 或日历健身标记 |
| `app.js` | 日历/学习/复盘/课表/备份/Supabase/共享 AI；不做业务重写 |
| `app-data.js` | 原课程与历法静态数据（未改） |
| `workbench.js` | 一级/二级路由、小六壬交互 |
| `liuren-core.js` | 无 DOM、无网络的本地排盘，保留现行算法 |
| `fitness-core.js` | 训练计划、日期、组数、状态、计时、校验、统计；纯 JS，勿改数据协议 |
| `fitness.js` | 健身 DOM、保存、日历标记、计时显示；不直接调用外部服务 |
| `bazi-hepan.js` | 八字 V6.1 外壳、消息、纪录；不得改测算逻辑 |
| `bazi-hepan-v5.html` | **原八字 V6.1 独立引擎，字节未改**；历史文件名 v5 不改名 |
| `supabase-local.js` | 原轻量客户端 + 条件写入；不替换 |
| `sw.js` / `manifest.json` / `icons/` | PWA 与版本缓存；如重新发布，统一更新资源 query、八字 fetch 和 cache ID |
| `tests/` | 单元、数据契约、静态检查、内存 DOM 和真实 HTTP 回归 |

## 2. 关键 DOM、事件与状态（完整清单在 HOOKS.md）

- 一级路由：`#workbenchNav`、`[data-wb-route="calendar|learning|fitness|arts"]`、`body[data-wb-page]`、`aria-current="page"`。四入口保留，手机 ≤720px 底栏和 safe-area，不覆盖表单按钮。
- 页面容器：`#calendarWorkspace`、`#learningNav`、`#artsNav`、`#learningModal`、`#reviewModal`、`#fitnessWorkspace`、`#liurenWorkspace`、`#baziPage`；保留 `hidden`、`.show`、`.bazi-open`、`aria-hidden`；绝不能给隐藏页强制 display。设置弹窗保留 `.show`。
- 二级：`#learningBtn`、`#reviewBtn`、`#baziBtn`、`#liurenBtn`、`#closeLearning`、`#closeReview`、`#baziClose`；保留 `aria-pressed`、`[data-learning-tab]`、`[data-side-tab]`。
- 日历：`#calendar`、`[data-date]`、`#monthTitle`、`#yearSelect`、`#prevBtn`、`#nextBtn`、`#todayBtn`、`#tasks`、`#taskInput`、`#addTask`、`#q1`/`#q2`/`#q3`、`#completeReflection`、`#dailySchedule`、`#scheduleEditBtn`、`[data-action-check]`、`[data-action-delete]`。
- 学习复盘：`#learningPanel`、`#reviewBody`、`#weeklyTab`、`#monthlyTab`、`[data-qact]`、`[data-sub]`、`[data-m]`、`[data-id]`、`[data-del-sess]`、`[data-cedit]`、`[data-cdel]`、`#revManualInput`、`#aiAnalyzeReviewBtn`、`#fitnessReviewSummary`。
- 设置：`#cloudBtn`、`#cloudModal`、`#uploadCloud`、`#downloadCloud`、`#importFile`、`#exportBtn`、`#backupHistoryList`、`[data-brestore]`、`[data-bdel]`、`#moreMenuWrap`、`#moreMenuBtn`、`#moreMenuDropdown`、`#workbenchScheduleBtn`、`#annivBtn`、`#aiConfigBtn`、`#aiModal`、`#aiProvider`、`#aiKey`、`#aiModel`、`#aiEndpoint`、`#aiQuoteText`、`#aiQuoteRefresh`。
- 健身：`#fitnessWorkspace`、`#fitnessDate`、`#fitnessToday`、`#fitnessWeek`、`#fitnessWeekStats`、`#fitnessDayHint`、`#fitnessSetup`、`#fitnessPlan`（空/A/B/C）、`#fitnessLevel`（2/3）、`#fitnessCreate`、`#fitnessPreview`、`#fitnessSession`、`#fitnessSessionTitle`、`#fitnessProgress`、`#fitnessProgressBar`、`#fitnessClock`、`#fitnessTimer`、`#fitnessRestClock`、`#fitnessRestStop`、`#fitnessManualDetails`、`#fitnessManualMinutes`、`#fitnessManualSave`、`#fitnessWarmup`、`#fitnessMoves`、`#fitnessCooldown`、`#fitnessCooldownText`、`#fitnessNote`、`#fitnessFinish`、`#fitnessReopen`、`#fitnessDelete`、`#fitnessStatus`、`#fitnessGuide`、`#fitnessHistoryPanel`、`#fitnessHistoryStats`、`#fitnessHistory`、`#fitnessMoreHistory`。动态 `[data-fit-date]`、`[data-fit-state]`、`[data-fit-move]`、`[data-fit-set]`（动作 ID:0-based组下标）、`[data-fit-reps]`（同格式）、`[data-fit-band]`（动作 ID）、`[data-fit-rest]`（45/60/90）、`[data-fit-history]`（日期）。动态 `#fitnessBand-{动作ID}` / `#fitnessReps-{动作ID}-{组下标}`。日历 `#fitnessCalendarCard`、`#fitnessCalendarSummary`、`#fitnessCalendarOpen`、`[data-fitness-day]`（planned/open/complete/partial/skipped）。
- 小六壬：`#liurenForm`、`#liurenMode`（time/numbers/strokes）、`#liurenChars`、`#liurenN1`/`N2`/`N3`、`#liurenNumberFields`、`#liurenStrokeFields`、`#liurenCast`、`#liurenQuestion`、`#liurenResult`、`#liurenAnalyze`、`#liurenAnalysis`、`#liurenSave`、`#liurenAiConfig`、`#liurenHistory`、`#liurenStatus`、`[data-liuren-open]`、`[data-liuren-delete]`。
- 八字：`#baziFrame`、`#baziFile`、`#baziImport`、`#baziEmptyImport`、`#baziStatus`、`#baziPersonalRecords`、`#baziMyCeilingRecords`、`#baziWorldRecords`、`[data-bazi-fill]`、`#baziCompareCategory`、`#baziInputScore`、`#baziComputeDifference`、`#baziDiff`。保留 `BAZI_V53_LOAD_PAIR` 等既有消息。

主页面事件按 ID / data 钩子绑定。视觉类仅用于布局、显示状态，不作为新业务选择器。保留 `disabled`、`hidden`、`aria-current`、`aria-pressed`、`aria-label`、`role=status`、表单 `type` 和输入控件。不要将来自备注/AI/导入的数据变为未转义的 innerHTML。保持手机点击区域可用；训练时逐组打卡应方便单手操作；不隐藏计时、休息和实际次数输入。

## 3. 隔离与公共接口

- `#baziPage … #baziFrame`：保留 iframe sandbox、srcdoc、原文件加载与自定义 HTML/IndexedDB 路径，不能将八字引擎的样式/脚本合并到主文档。旧引擎内部内联事件是遗留实现，不改。
- `#fitnessWorkspace`：独立渲染与 CSS 范围；训练表单和日历使用同一个健身状态，不复制成另一套状态。UI 仅调用 `SuiwindWorkbench.getFitnessState()`/`setFitnessState(state)`、`getSelectedDate()`；`SuiwindFitnessCore` 为业务纯函数。不再有贴图 iframe、URL 配置或 AI 消息桥。
- 共享 AI：`SuiwindWorkbench.callAI(systemPrompt,userPrompt)` 与 `openAiModal()`，沿用 `zx_aiConfig`；Key 不写到公开代码或备份。小六壬只发送确定的三宫与问题；健身本身不调用 AI，周月 AI 复盘主动触发时包含训练汇总。
- 自定义事件：`suiwind:learning-open`、`suiwind:review-open`、`suiwind:bazi-open`、`suiwind:bazi-close`、`suiwind:history-change`、`suiwind:route-change`（detail.route）、`suiwind:calendar-render`、`suiwind:fitness-change`。保留脚本加载顺序（尤其 fitness-core 在 app 前、fitness 在 workbench 后）。

## 4. 数据与算法禁止修改

旧 `zx_*`、`suiwind_bazi_v61_*`、八字 IndexedDB、Supabase 会话原样。JSON `version:30`、`calendar_state(user_id,payload,updated_at)` 不改表结构。新字段 `fitnessState` 对应 `zx_fitnessState`，版本 1：`{version:1,sessions:{'YYYY-MM-DD':{date,plan,level,moves,warmup,cooldown,note,outcome,elapsedMs,runningSince,restUntil,updatedAt}}}`。动作 ID a1–a5/b1–b5/c1–c5；每项 `moves[id]={band,sets:[null,null,null]}`，null=未完成，空字符串=完成但未填次数，其他字符串=实际次数/秒数。第三组只在允许时有效。`outcome` open/complete/partial/skipped。计时以时间戳计算而不是 setInterval 计数，保存不每秒写盘。旧 JSON 缺字段保留本机数据，格式不合法拒绝应用。`liurenHistory` 对应 `zx_liurenHistory`。云端条件写入、冲突确认、内部快照和回滚不改。已停用的 `zx_workshopTools` 不读取也不删除。

小六壬三宫：`(m-1)%6`，再加 `(d-1)%6`，再加 `(h-1)%6`；北京时间、闰月取同名月、23:00–00:59 子时、农历午夜换日。时间转换使用浏览器本地 Intl Chinese calendar。笔画目前由用户确认，不伪造全字库。AI 不参与排盘。

## 5. 审美改完的验收

执行 `node tests/liuren.test.cjs`、`node tests/fitness.test.cjs`、`node tests/contracts.test.cjs`、`python tests/static_checks.py`、`python tests/dom_smoke.py`。真实 HTTP 环境运行 `python tests/browser_smoke.py`，再测 iOS/Android 真机、主题、原课表与任务、JSON 文件导入导出、PWA 更新以及测试账号的 Supabase。当前执行环境仅通过内存 Chromium + 模拟本机存储/网络的页面交互测试；真实站点导航被管理策略阻止，不得标为真实联调已通过。


## V4.1.2 每日一句回归修复

`#aiQuoteBar` 是全局独立区域，必须位于所有路由容器之外；不得嵌入 `#calendarWorkspace` 或任何可隐藏的页面。保留 `#aiQuoteText`、`#aiQuoteRefresh`、`#aiQuoteSetupBtn`，手机端允许完整换行，禁止使用 line-clamp、固定高度或隐藏溢出截断寄语。原 AI 生成、配置和本地缓存键保持不变。
固定一级导航保持原样；书眉 `.top` 改为普通文档流，避免桌面端 sticky 偏移遮住每日一句。缓存资源版本更新为 412；不清除站点存储。
