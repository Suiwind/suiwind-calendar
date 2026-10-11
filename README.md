# 苏伊温德日历 · GitHub Pages 发布包

这是 V1.3.0 的 GitHub Pages 精简发布目录。

## 文件
- `index.html`：主页面
- `sw.js`：PWA / 离线缓存
- `manifest.json`：PWA 配置
- `.nojekyll`：避免 GitHub Pages 使用 Jekyll 处理静态文件

## 推荐部署方式
1. 新建一个用于发布的 GitHub 仓库（GitHub Free 下 Pages 仓库需为 Public）。
2. 上传本目录中的四个文件到仓库根目录。
3. Repository → Settings → Pages。
4. Build and deployment → Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，Folder 选择 `/(root)`，点击 Save。
6. 等待 GitHub Pages 给出站点地址。

## 注意
- 当前开发仓库可以继续保持 Private；建议单独建立 Public 发布仓库，只放本发布包。
- 不要上传 Supabase `service_role` / Secret key。浏览器端只使用 publishable / anon key。
- GitHub Pages 是公开站点。代码也会公开（Free 方案下）。
