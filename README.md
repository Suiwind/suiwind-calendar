# 苏伊温德日历 · GitHub Pages 发布包

这是 **V1.3.1「移动端云同步修复」** 的 GitHub Pages 发布目录。

## V1.3.1

- 移除 `jsDelivr` 上的 Supabase JS 外部依赖。
- 新增 `supabase-local.js`，云同步客户端随日历本身一起由 GitHub Pages 提供。
- 修复手机端在已填写 URL/key 后仍提示“请先设置 Supabase”的问题。
- 云同步报错现在会区分“未填配置 / 组件未加载 / 配置初始化失败”。
- PWA 缓存升级为 `v131`，并把本地云同步组件加入离线核心缓存。
- 不修改现有 `calendar_state` 表，不需要重新执行 Supabase SQL；原账号和云端数据继续使用。

> 注意：本地化的是 Supabase 客户端代码。真正登录和同步时，设备仍需能访问你的 `*.supabase.co` 项目地址。

## GitHub Pages 更新

把根目录这些文件覆盖到 `suiwind-calendar` 仓库：

- `index.html`
- `sw.js`
- `supabase-local.js`
- `README.md`

`manifest.json` 与 `.nojekyll` 可保持原样。
