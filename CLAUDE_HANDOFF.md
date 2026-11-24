# V3.5 小六壬增量版 · 交接说明

## 范围
以原始 V3.5 为底稿，仅增加八字页面内的小六壬入口与独立全屏模块。首页书眉、每日一句、主导航、月历及原 CSS 均未更改。没有健身、贴图或工作台导航。首页标题仍显示 V3.5。

## 文件与保护边界
- `index.html`：只新增 `liurenBtn`（八字页按钮）、`liurenWorkspace`（独立容器）、新 CSS/JS 引用及两个缓存版本参数。不要移动或修改原书眉、`aiQuoteBar`、`aiQuoteText`、`aiQuoteRefresh`、`aiQuoteSetupBtn`、`.app`、原导航。
- `styles.css`：原版逐字节保留。`liuren.css`：新增样式仅作用于 `#liurenWorkspace` 及打开小六壬时原 AI 设置的层级；不得扩散至原首页。
- `bazi-hepan.js` / `bazi-hepan-v5.html`：原版逐字节保留。保留 `baziPage`、`baziFrame`、`baziBtn`、`baziClose` 及全部其他原有 ID。打开小六壬时只暂停八字容器交互，不销毁 iframe。
- `liuren-core.js`：纯本地算法，月上起日、日上起时、起点计一；北京时间，23:00 起子时，午夜换日，闰月按同名月。使用 Intl 农历；不支持时明确提示，不让 AI 计算。笔画为手工确认。
- `liuren.js`：所有新静态事件以 ID 绑定；历史条目按钮使用创建时事件及 `data-liuren-open`、`data-liuren-delete` 标识；输出通过 textContent。保留 `body[data-liuren-open="true"]`，退出时复原八字容器 `inert`。
- `app.js`：只修改数据备份/恢复、云同步安全逻辑及窄接口 `window.SuiwindLiurenHost`；每日一句/学习/任务等逻辑不变。`supabase-local.js` 增加条件写入方法，原表不变。
- `sw.js`：更新应用缓存标记并加入三份新文件。原字体缓存保留。

## 新模块 DOM 钩子
`liurenBtn`, `liurenWorkspace`, `liurenTitle`, `liurenClose`, `liurenCalendar`, `liurenForm`, `liurenMode`, `liurenStrokeFields`, `liurenChars`, `liurenNumberFields`, `liurenN1`, `liurenN2`, `liurenN3`, `liurenCast`, `liurenStatus`, `liurenResult`, `liurenQuestion`, `liurenAnalyze`, `liurenSave`, `liurenAiConfig`, `liurenAnalysis`, `liurenHistory`。

## 数据
沿用 `zx_liurenHistory` 和 `calendar_state.payload.liurenHistory`（兼容前一版卦例），JSON 版本保持 30。旧备份缺少字段时保留现有卦例。新增上传版本冲突检查及条件写入；云端已存在不同版本时不会自动覆盖，需选择下载或手工确认上传。保持原数据键名、AI 配置和八字数据库。以前版本的健身本地键不会删除，本版不显示或导出健身字段；旧健身备份应单独保留。旧客户端若仍在线，可能覆盖新字段；所有常用设备请更新后再同步。

## 测试
`node tests/liuren.test.cjs`；`node tests/contracts.test.cjs`；安装 Playwright 与 Chromium 后，`python tests/dom_smoke.py /path/to/original.zip`。对照原版四种屏幕宽度首页几何和样式、测试本地起卦、AI 模拟、保存、返回八字、旧 JSON 恢复。未实测生产 Supabase、真实 AI API、真机及 PWA 更新。
