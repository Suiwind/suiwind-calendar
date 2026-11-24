"""Check original IDs, new hooks, resources and JS syntax without a browser.
Use --baseline to check that original V3.5 visual CSS is unchanged for this functional release;
Claude can intentionally change CSS in the future without failing normal regression.
"""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import re,json,hashlib,subprocess,sys
root=Path(__file__).resolve().parents[1]
class Hooks(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.routes=[];self.assets=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k=='id':self.ids.append(v)
   if k=='data-wb-route':self.routes.append(v)
   if k in ('href','src') and v and v.startswith('./'):self.assets.append(v.split('?')[0])
h=Hooks();h.feed((root/'index.html').read_text());ids=set(h.ids)
assert len(h.ids)==len(ids),[i for i,n in Counter(h.ids).items() if n>1]
contract=json.loads((root/'tests/original_contract.json').read_text());assert set(contract['ids'])<=ids,set(contract['ids'])-ids
for name,digest in contract['sha256'].items():
 if name=='styles.css' and '--baseline' not in sys.argv:continue
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name
assert h.routes==['calendar','learning','fitness','arts'],h.routes
for asset in h.assets:assert (root/asset).is_file(),asset
for name in ('fitness.js','workbench.js'):
 src=(root/name).read_text();refs=set(re.findall(r"\$\('([A-Za-z][A-Za-z0-9_-]*)'\)",src));assert refs<=ids,(name,refs-ids)
for f in sorted(root.glob('*.js')):subprocess.run(['node','--check',str(f)],check=True)
for f in re.findall(r"'\./([^']+)'",(root/'sw.js').read_text()):assert (root/f.split('?')[0]).exists(),f
assert 'workshop' not in (root/'workbench.js').read_text().lower()
assert 'workshop' not in (root/'index.html').read_text().lower()
print(f'PASS: {len(contract["ids"])} original IDs retained, {len(ids)} unique current IDs, original bazi/data hashes, all references, 4 routes, JS syntax and cache resources.')
