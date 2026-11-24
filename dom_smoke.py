"""In-memory Chromium integration test; mock storage and API, not live cloud."""
import os,re,json,zipfile,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def clean(h):
    h=re.sub(r'<script\b[^>]*>.*?</script\s*>','',h,flags=re.S|re.I)
    return re.sub(r'<link\b[^>]*>','',h,flags=re.I)
HTML=clean((ROOT/'index.html').read_text())
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1280,'height':800},service_workers='block')
    context.route('**/*',lambda r:r.abort())
    def setup(old=None):
        page=context.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
        read=lambda f:old.read(f).decode() if old else (ROOT/f).read_text()
        page.set_content(clean(read('index.html')),wait_until='domcontentloaded')
        for f in (['styles.css'] if old else ['styles.css','liuren.css']):page.add_style_tag(content=read(f))
        page.evaluate('''html=>{
          const storage=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)}});
          localStorage.setItem('zx_tasks',JSON.stringify({'2026-11-24':[{id:'old-task',text:'旧任务',priority:'high',done:false}]}));
          localStorage.setItem('zx_aiConfig',JSON.stringify({provider:'openai',apiKey:'test-only',endpoint:'https://api.deepseek.com/v1/chat/completions',model:'deepseek-chat'}));
          localStorage.setItem('zx_fitnessState','{"legacy":true}');
          window.fetch=async(url,options)=>String(url).includes('bazi-hepan-v5')?{ok:true,text:async()=>html}:{ok:true,status:200,json:async()=>({choices:[{message:{content:'模拟 AI 解读'}}]})};
        }''',read('bazi-hepan-v5.html'))
        for f in ['supabase-local.js','app-data.js','app.js','bazi-hepan.js']+([] if old else ['liuren-core.js','liuren.js']):page.add_script_tag(content=read(f))
        page.wait_for_function("document.querySelector('#aiQuoteText').textContent==='模拟 AI 解读'")
        return page,errors
    page,errors=setup()
    quote=page.locator('#aiQuoteBar');assert quote.is_visible()
    # Compare original homepage geometry and computed style with identical seed data, if original ZIP supplied.
    if len(sys.argv)>1:
        with zipfile.ZipFile(sys.argv[1]) as old:
            orig,orig_errors=setup(old)
            geom="""()=>['.top','.top-inner','.app','#aiQuoteBar','#aiQuoteText','.actions','#calendar'].map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),c=getComputedStyle(e);return [s,r.x,r.y,r.width,r.height,c.fontSize,c.borderTop,c.borderBottom,c.padding,c.margin]})"""
            for width in [360,390,768,1280]:
                for x in [orig,page]: x.set_viewport_size({'width':width,'height':800}); x.wait_for_timeout(400)
                assert page.evaluate(geom)==orig.evaluate(geom),(width,page.evaluate(geom),orig.evaluate(geom))
            assert not orig_errors,orig_errors
            orig.close()
            print('PASS: homepage geometry and computed styles equal original at 360/390/768/1280 px')
    page.locator('#aiQuoteSetupBtn').click();assert page.locator('#aiModal').is_visible();page.locator('#closeAiModal').click()
    page.locator('#aiQuoteRefresh').click();page.wait_for_function("document.querySelector('#aiQuoteText').textContent==='模拟 AI 解读'")
    page.locator('#baziBtn').click();page.locator('#baziFrame').wait_for(state='visible');source=page.locator('#baziFrame').get_attribute('srcdoc');assert source
    page.locator('#liurenBtn').click();assert page.locator('#liurenWorkspace').is_visible()
    page.locator('#liurenAiConfig').click();assert page.locator('#aiModal').is_visible();page.locator('#closeAiModal').click()
    page.locator('#liurenMode').select_option('numbers')
    for i,n in enumerate([3,5,5],1):page.locator(f'#liurenN{i}').fill(str(n))
    page.locator('#liurenCast').click();assert '时宫 · 小吉' in page.locator('#liurenResult').inner_text();page.locator('#liurenQuestion').fill('测试卦例');page.locator('#liurenAnalyze').click();page.wait_for_function("document.querySelector('#liurenAnalysis').textContent.includes('模拟 AI 解读')");page.locator('#liurenSave').click();assert len(page.evaluate('SuiwindLiurenHost.getHistory()'))==1
    page.locator('#liurenClose').click();assert page.locator('#baziFrame').get_attribute('srcdoc')==source
    page.locator('#liurenBtn').click();page.locator('#liurenMode').select_option('strokes');page.locator('#liurenChars').fill('山水月');
    for i,n in enumerate([3,4,4],1):page.locator(f'#liurenN{i}').fill(str(n))
    page.locator('#liurenCast').click();assert '汉字 山水月' in page.locator('#liurenResult').inner_text()
    page.locator('#liurenMode').select_option('time');page.locator('#liurenCast').click();assert '北京时间' in page.locator('#liurenResult').inner_text()
    for width in [360,390,768,1280]:
        page.set_viewport_size({'width':width,'height':800});page.wait_for_timeout(100)
        dims=page.locator('#liurenWorkspace').evaluate('e=>[e.clientWidth,e.scrollWidth]');assert dims[1]<=dims[0]+1,(width,dims)
    page.keyboard.press('Escape');assert page.locator('#liurenWorkspace').is_hidden();assert page.locator('#baziFrame').is_visible()
    for width in [360,390,768,1280]:
        page.set_viewport_size({'width':width,'height':800});page.wait_for_timeout(150)
        page.locator('#liurenBtn').click();assert page.locator('#liurenWorkspace').is_visible();page.locator('#liurenClose').click()
    page.locator('#baziClose').click();assert quote.is_visible()
    page.locator('#cloudBtn').click();old={'version':30,'tasks':{'2026-11-24':[{'id':'legacy','text':'旧备份任务','done':False}]}};page.locator('#importFile').set_input_files({'name':'old.json','mimeType':'application/json','buffer':json.dumps(old).encode()});page.wait_for_function("JSON.parse(localStorage.getItem('zx_tasks'))['2026-11-24'][0].text==='旧备份任务'")
    assert len(page.evaluate('SuiwindLiurenHost.getHistory()'))==1;assert page.evaluate("localStorage.getItem('zx_fitnessState')")=='{"legacy":true}'
    page.locator('#closeCloud').click();assert not errors,errors
    print('PASS: original quote controls; Bazi frame state; Liuren three modes, AI settings, mocked analysis, history, responsive panel, Escape and old JSON import')
    browser.close()
