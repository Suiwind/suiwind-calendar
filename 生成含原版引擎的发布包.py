#!/usr/bin/env python3
"""将完全未经修改的 V5.0 HTML 放入已接好入口的苏伊温德日历 ZIP。
运行: python 生成含原版引擎的发布包.py /path/to/合盘随身工具_V5.0_纪录更新版.html
本脚本不解析或编辑原文件的 JS、节气或记录数据。
"""
import hashlib, sys, zipfile
from pathlib import Path
base=Path(__file__).resolve().parent
if len(sys.argv)<2:
 raise SystemExit('请在命令后提供 V5.0 原版 HTML 文件路径')
original=Path(sys.argv[1])
if not original.exists():
 raise SystemExit(f'找不到原版 HTML：{original}')
b=original.read_bytes()
if len(b)<3000 or b'<html' not in b.lower() or b'<script' not in b.lower():
 raise SystemExit('文件不包含完整的 HTML 和脚本，已取消打包')
out=Path(__file__).resolve().parent/'苏伊温德日历_V1.7.3_八字合盘V5原版完整集成包.zip'
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=8) as z:
 for p in sorted(base.iterdir()):
  if p.is_file() and p.name in {'.nojekyll','README.md','app.js','bazi-hepan.js','index.html','manifest.json','supabase-local.js','sw.js','集成说明_先读.txt','生成含原版引擎的发布包.py'}: z.write(p,p.name)
 z.writestr('bazi-hepan-v5.html',b)
with zipfile.ZipFile(out) as z:
 assert z.read('bazi-hepan-v5.html') == b
print('生成：',out)
print('原版 V5 HTML SHA256（打包前后相同）：',hashlib.sha256(b).hexdigest())
print('注意：运行期五条分数回归仍须在实际网页上复核。')
