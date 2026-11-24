"""In-memory Chromium test of the real HTML/CSS/JS, with mock storage/fetch.
No site navigation, no external requests, no true IndexedDB/PWA/cloud test.
Run: python tests/dom_smoke.py (Playwright + Chromium).
"""
import os, re, json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
HTML=re.sub(r'<script\b[^>]*>.*?</script\s*>','',HTML,flags=re.S|re.I)
HTML=re.sub(r'<link\b[^>]*>','',HTML,flags=re.I)
STYLE=['styles.css','workbench.css','fitness.css']
SCRIPTS=['supabase-local.js','app-data.js','fitness-core.js','app.js','bazi-hepan.js','liuren-core.js','workbench.js','fitness.js']
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1280,'height':800},service_workers='block')
    context.route('**/*',lambda r:r.abort())
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
    page.set_content(HTML,wait_until='domcontentloaded')
    for f in STYLE:page.add_style_tag(content=(ROOT/f).read_text())
    page.evaluate('''html=>{
      const storage=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)}});
      localStorage.setItem('zx_tasks',JSON.stringify({'2026-11-24':[{id:'old-task',text:'旧任务',priority:'high',done:false}]}));
      localStorage.setItem('zx_aiConfig',JSON.stringify({provider:'openai',apiKey:'test-only',endpoint:'https://api.deepseek.com/v1/chat/completions',model:'deepseek-chat'}));
      localStorage.setItem('zx_workshopTools','[{"name":"legacy"}]');
      window.fetch=async(url,options)=>String(url).includes('bazi-hepan-v5')?{ok:true,text:async()=>html}:{ok:true,status:200,json:async()=>({choices:[{message:{content:'模拟 AI 解读'}}]})};
    }''',(ROOT/'bazi-hepan-v5.html').read_text())
    for f in SCRIPTS:page.add_script_tag(content=(ROOT/f).read_text())
    page.wait_for_function("document.querySelectorAll('#calendar [data-date]').length===42")
    assert page.locator('[data-wb-route]').count()==4
    assert page.locator('#fitnessCalendarCard').is_visible()
    assert page.evaluate("JSON.parse(localStorage.getItem('zx_tasks'))['2026-11-24'][0].text")=='旧任务'
    assert page.evaluate("localStorage.getItem('zx_workshopTools')")=='[{"name":"legacy"}]'
    def nav(name):page.locator(f'[data-wb-route="{name}"]').click()
    today=page.evaluate('SuiwindFitnessCore.dateKey()')
    nav('fitness');page.locator('#fitnessDate').fill(today);page.locator('#fitnessDate').dispatch_event('change')
    page.locator('#fitnessPlan').select_option('A');page.locator('#fitnessCreate').click()
    assert page.locator('[data-fit-set]').count()==10
    page.locator('#fitnessTimer').click();page.wait_for_timeout(1100);page.locator('#fitnessTimer').click()
    page.locator('#fitnessWarmup').check();page.locator('[data-fit-set="a1:0"]').click();assert '1/10' in page.locator('#fitnessProgress').inner_text()
    assert page.locator('#fitnessRestClock').inner_text()!='00:00'
    page.locator('[data-fit-reps="a1:0"]').fill('10');page.locator('[data-fit-band="a2"]').select_option('红色')
    page.locator('#fitnessNote').fill('测试训练备注');page.locator('#fitnessCooldown').check()
    nav('calendar');page.locator('#todayBtn').click();assert '1/10' in page.locator('#fitnessCalendarSummary').inner_text()
    page.locator('#fitnessCalendarOpen').click();assert page.locator('#fitnessNote').input_value()=='测试训练备注'
    page.locator('#fitnessFinish').click();assert '部分完成' in page.locator('#fitnessProgress').inner_text()
    page.locator('#fitnessReopen').click();assert page.locator('#fitnessNote').input_value()=='测试训练备注'
    # DOM regenerates on a check, so query by stable hook.
    while page.locator('[data-fit-set][aria-pressed="false"]').count():page.locator('[data-fit-set][aria-pressed="false"]').first.click()
    page.locator('#fitnessFinish').click();assert '已完成' in page.locator('#fitnessProgress').inner_text()
    state=page.evaluate('SuiwindWorkbench.getFitnessState()');s=state['sessions'][today];assert s['outcome']=='complete' and s['moves']['a1']['sets'][0]=='10' and s['moves']['a2']['band']=='红色' and s['elapsedMs']>=1000
    future=page.evaluate('SuiwindFitnessCore.shift(SuiwindFitnessCore.dateKey(),1)');page.locator('#fitnessDate').fill(future);page.locator('#fitnessDate').dispatch_event('change');page.locator('#fitnessPlan').select_option('B');assert page.locator('#fitnessCreate').is_disabled()
    past=page.evaluate('SuiwindFitnessCore.shift(SuiwindFitnessCore.dateKey(),-1)');page.locator('#fitnessDate').fill(past);page.locator('#fitnessDate').dispatch_event('change');page.locator('#fitnessPlan').select_option('C');page.locator('#fitnessLevel').select_option('3');page.locator('#fitnessCreate').click();assert page.locator('[data-fit-set]').count()==13;page.locator('#fitnessManualDetails summary').click();page.locator('#fitnessManualMinutes').fill('20');page.locator('#fitnessManualSave').click();assert page.locator('#fitnessClock').inner_text()=='20:00';page.locator('#fitnessFinish').click();assert '已跳过' in page.locator('#fitnessProgress').inner_text();page.locator('#fitnessDelete').click();assert page.evaluate('SuiwindWorkbench.getFitnessState()')==state
    nav('learning');assert page.locator('#learningPanel').is_visible();page.locator('[data-learning-tab="timer"]').click();page.locator('#reviewBtn').click();assert '完整 1 次' in page.locator('#fitnessReviewSummary').inner_text();page.locator('#monthlyTab').click();assert '完整 1 次' in page.locator('#fitnessReviewSummary').inner_text()
    nav('arts');page.locator('#baziFrame').wait_for(state='visible');assert page.locator('#baziFrame').get_attribute('srcdoc')
    page.locator('#liurenBtn').click();page.locator('#liurenMode').select_option('numbers');
    for i,n in enumerate([3,5,5],1):page.locator(f'#liurenN{i}').fill(str(n))
    page.locator('#liurenCast').click();assert '时宫 · 小吉' in page.locator('#liurenResult').inner_text();page.locator('#liurenQuestion').fill('测试卦例');page.locator('#liurenAnalyze').click();page.wait_for_function("document.querySelector('#liurenAnalysis').textContent.includes('模拟 AI 解读')");page.locator('#liurenSave').click();assert len(page.evaluate('SuiwindWorkbench.getHistory()'))==1
    # Import older backup via real file input. No real storage, but actual UI and restore path.
    nav('calendar');page.locator('#cloudBtn').click();old={'version':30,'tasks':{'2026-11-24':[{'id':'legacy','text':'旧备份任务','done':False}]}};page.locator('#importFile').set_input_files({'name':'old.json','mimeType':'application/json','buffer':json.dumps(old).encode()});page.wait_for_function("JSON.parse(localStorage.getItem('zx_tasks'))['2026-11-24'][0].text==='旧备份任务'")
    assert page.evaluate('SuiwindWorkbench.getFitnessState()')==state;assert len(page.evaluate('SuiwindWorkbench.getHistory()'))==1
    page.locator('#closeCloud').click()
    for width in [360,390,768,1280]:
        page.set_viewport_size({'width':width,'height':800})
        for view in ['calendar','learning','fitness','arts']:
            nav(view)
            if view=='fitness':page.locator('#fitnessToday').click()
            if view=='arts':
                page.locator('#baziBtn').click();page.locator('#baziFrame').wait_for(state='visible');page.wait_for_timeout(60)
                bazi_dims=page.evaluate('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})');assert bazi_dims['scroll']<=bazi_dims['width']+1,(width,'bazi',bazi_dims)
                page.locator('#liurenBtn').click()
            page.wait_for_timeout(60);dims=page.evaluate('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})');assert dims['scroll']<=dims['width']+1,(width,view,dims)
    assert not errors,errors
    print('PASS: actual DOM/CSS/JS with mock storage/fetch; 4 routes, 10 sets, timer, resistance/reps/note, partial/reopen/complete, future read-only, calendar/review, bazi shell, Liuren AI and history, old JSON import, 4 viewport widths; no page errors.')
    browser.close()
