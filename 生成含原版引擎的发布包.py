#!/usr/bin/env python3
"""将完全未经修改的八字合盘 V5.0 原版 HTML 打包进苏伊温德日历 V2.0 部署包。
用法:
  python 生成含原版引擎的发布包.py /path/to/合盘随身工具_V5.0_纪录更新版.html
本脚本不解析或修改 V5 原版文件的任何字节。
"""
import hashlib, sys, zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
web_dir = root / '网站部署文件'
if not web_dir.exists():
    web_dir = Path(__file__).resolve().parent

if len(sys.argv) < 2:
    raise SystemExit('请在命令后提供 V5.0 原版 HTML 文件路径')
original = Path(sys.argv[1])
if not original.exists():
    raise SystemExit(f'找不到原版 HTML：{original}')

b = original.read_bytes()
if len(b) < 3000 or b'<html' not in b.lower() or b'<script' not in b.lower():
    raise SystemExit('文件不包含完整的 HTML 和脚本，已取消打包')

out = Path(__file__).resolve().parent / '苏伊温德日历_V2.0_含八字V5原版部署包.zip'
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=8) as z:
    for p in sorted(web_dir.rglob('*')):
        if p.is_file():
            z.write(p, p.relative_to(web_dir))
    z.writestr('bazi-hepan-v5.html', b)

with zipfile.ZipFile(out) as z:
    assert z.read('bazi-hepan-v5.html') == b

print('生成成功：', out)
print('原版 V5 HTML SHA256（完全一致）：', hashlib.sha256(b).hexdigest())
