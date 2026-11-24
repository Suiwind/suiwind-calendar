"""Run with Python Playwright + Chromium installed. All remote APIs mocked."""
import os, threading, http.server, functools, json, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    ctx=browser.new_context(viewport={'width':1280,'height':800},accept_downloads=True,service_workers='block')
    ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
    ctx.route('https://api.deepseek.com/**',lambda r:r.fulfill(headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'authorization,content-type'},json={'choices':[{'message':{'content':'测试 AI 解读'}}]}))
    page=ctx.new_page();errors=[]; page.on('pageerror',lambda err:errors.append(str(err)));page.on('dialog',lambda d:d.accept())
    page.add_init_script("""if(!localStorage.getItem('testSeed')){localStorage.setItem('testSeed','1');localStorage.setItem('zx_tasks',JSON.stringify({'2026-11-24':[{'id':'old-task','text':'旧任务','priority':'high','done':false}]}));localStorage.setItem('zx_aiConfig',JSON.stringify({provider:'deepseek',apiKey:'test-only',endpoint:'https://api.deepseek.com/v1/chat/completions',model:'deepseek-chat'}));localStorage.setItem('suiwind_bazi_v61_personal_records','{}');}""")
    page.goto(url,wait_until='domcontentloaded');page.locator('#workbenchNav').wait_for();page.wait_for_function("document.querySelectorAll('#calendar [data-date]').length===42")
    assert page.evaluate("JSON.parse(localStorage.getItem('zx_tasks'))['2026-11-24'][0].text")=='旧任务'
    assert page.locator('#fitnessCalendarCard').is_visible()
    def nav(name):page.locator(f'[data-wb-route="{name}"]').click()
    nav('learning');page.locator('#learningPanel').wait_for(state='visible');page.locator('[data-learning-tab="timer"]').click();page.locator('#reviewBtn').click();page.locator('#weeklyTab').wait_for(state='visible');page.locator('#monthlyTab').click();assert page.locator('#reviewBody').inner_text()
    nav('fitness');today=page.evaluate('SuiwindFitnessCore.dateKey()');page.locator('#fitnessPlan').select_option('A');page.locator('#fitnessCreate').click();assert page.locator('[data-fit-set]').count()==10
    page.locator('#fitnessTimer').click();page.wait_for_timeout(1100);page.locator('#fitnessTimer').click()
    page.locator('[data-fit-set="a1:0"]').click();page.locator('[data-fit-reps="a1:0"]').fill('10');page.locator('#fitnessNote').fill('真实浏览器测试');page.locator('#fitnessFinish').click();assert '部分完成' in page.locator('#fitnessProgress').inner_text()
    fitness=page.evaluate('SuiwindWorkbench.getFitnessState()');assert fitness['sessions'][today]['moves']['a1']['sets'][0]=='10'
    nav('calendar');page.locator('#todayBtn').click();assert '部分完成' in page.locator('#fitnessCalendarSummary').inner_text()
    nav('arts');page.locator('#baziFrame').wait_for(state='visible',timeout=10000);assert page.locator('#baziFrame').get_attribute('srcdoc')
    page.locator('#liurenBtn').click();page.locator('#liurenMode').select_option('numbers');
    for i,n in enumerate([3,5,5],1):page.locator(f'#liurenN{i}').fill(str(n))
    page.locator('#liurenCast').click();assert '时宫 · 小吉' in page.locator('#liurenResult').inner_text()
    page.locator('#liurenQuestion').fill('测试事项');page.locator('#liurenAnalyze').click();page.wait_for_function("document.querySelector('#liurenAnalysis').textContent.includes('测试 AI 解读')")
    page.locator('#liurenSave').click();assert len(page.evaluate("JSON.parse(localStorage.getItem('zx_liurenHistory'))"))==1
    page.locator('#cloudBtn').click();page.locator('#exportBtn').wait_for(state='visible')
    with page.expect_download() as dl: page.locator('#exportBtn').click()
    data=json.loads(Path(dl.value.path()).read_text());assert len(data['liurenHistory'])==1 and data['tasks']['2026-11-24'][0]['text']=='旧任务' and data['fitnessState']==fitness
    old=dict(data);old.pop('liurenHistory');old.pop('fitnessState');old['aiSummaries']={'week-test':{'text':'旧 AI 总结'}}
    page.locator('#importFile').set_input_files({'name':'legacy.json','mimeType':'application/json','buffer':json.dumps(old).encode()});page.wait_for_function("JSON.parse(localStorage.getItem('zx_aiSummaries')||'{}')['week-test']?.text==='旧 AI 总结'")
    assert len(page.evaluate("JSON.parse(localStorage.getItem('zx_liurenHistory'))"))==1;assert page.evaluate('SuiwindWorkbench.getFitnessState()')==fitness
    page.locator('#closeCloud').click();page.reload(wait_until='domcontentloaded');nav('arts');page.locator('#liurenBtn').click();assert '测试事项' in page.locator('#liurenHistory').inner_text();nav('fitness');assert page.locator('#fitnessNote').input_value()=='真实浏览器测试'
    for width in [360,390,768,1280]:
        page.set_viewport_size({'width':width,'height':800})
        for view in ['calendar','learning','fitness','arts']:
            nav(view);page.wait_for_timeout(100)
            dims=page.evaluate('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})')
            assert dims['scroll']<=dims['width']+1,(width,view,dims)
    assert not errors,errors
    print('PASS: desktop/mobile navigation, original storage, learning/review, bazi iframe, fitness progress/timer/notes/reload, Liuren AI mock/save/export/legacy import/reload, 4 widths; no page errors')
    browser.close()
server.shutdown()
