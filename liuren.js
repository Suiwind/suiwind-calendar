/* Independent Liuren UI: no calendar layout changes. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const api = window.SuiwindLiurenHost, core = window.SuiwindLiuren;
if (!api || !core) return;
const panel = $('liurenWorkspace'), bazi = $('baziPage');
function open() {
  if (!panel.hidden) return;
  bazi.inert = true;
  panel.hidden = false;
  document.body.dataset.liurenOpen = 'true';
  renderHistory();
  $('liurenClose').focus();
}
function close() {
  if (panel.hidden) return;
  $('aiModal').classList.remove('show');
  panel.hidden = true;
  delete document.body.dataset.liurenOpen;
  bazi.inert = false;
  $('liurenBtn').focus();
}
$('liurenBtn').addEventListener('click',open);
$('liurenClose').addEventListener('click',close);
$('liurenCalendar').addEventListener('click',()=>{close();$('baziClose').click();});
$('liurenAiConfig').addEventListener('click',api.openAiModal);
// Capture Escape before original Bazi/calendar handlers, only while this panel is open.
document.addEventListener('keydown',e=>{
  if(panel.hidden || e.key!=='Escape') return;
  e.stopImmediatePropagation(); e.preventDefault();
  if($('aiModal').classList.contains('show')) {$('aiModal').classList.remove('show');$('liurenAiConfig').focus();}
  else close();
},true);
function node(tag,txt) { const n = document.createElement(tag); if (txt != null) n.textContent=txt; return n; }
function btn(txt,handler) { const n=node('button',txt); n.type='button'; n.className='btn'; n.addEventListener('click',handler); return n; }

/* Liuren: input, local calculation, AI and history. All external text rendered as textContent. */
let current = null, analysisBusy = false;
function modeChanged(){const mode=$('liurenMode').value; $('liurenNumberFields').hidden=mode==='time'; $('liurenStrokeFields').hidden=mode!=='strokes'; for(const id of ['liurenN1','liurenN2','liurenN3']) $(id).disabled=mode==='time'; $('liurenChars').disabled=mode!=='strokes';}
$('liurenMode').addEventListener('change',modeChanged);modeChanged();
function showResult(){
  const box=$('liurenResult');box.replaceChildren(); $('liurenAnalyze').disabled=!current||analysisBusy; $('liurenSave').disabled=!current;
  if(!current){$('liurenAnalysis').textContent='';return;}
  const input=current.input; box.append(node('p',`${current.mode==='time'?`北京时间 ${input.beijing} · 农历${input.leap?'闰':''}${input.values[0]}月${input.values[1]}日 ${input.branch}时`:current.mode==='strokes'?`汉字 ${input.chars} · 笔画 ${input.values.join('、')}`:`报数 ${input.values.join('、')}`} · 三数 ${input.values.join(' / ')}`));
  const grid=node('div');grid.className='lr-result-grid';for(const p of current.palaces){const card=node('div');card.append(node('h3',`${p.label} · ${p.name}`),node('p',p.meaning));grid.append(card);}box.append(grid);
  $('liurenAnalysis').textContent=current.analysis||'';
}
$('liurenForm').addEventListener('submit',e=>{e.preventDefault();try{
  const mode=$('liurenMode').value; let input;
  if(mode==='time')input=core.timeInput();else{
    const raw=['liurenN1','liurenN2','liurenN3'].map(id=>$(id).value.trim());if(raw.some(v=>!/^\d+$/.test(v)))throw new Error('请输入三个正整数。');
    input={values:raw.map(Number)};
    if(mode==='strokes'){const chars=Array.from($('liurenChars').value.trim());if(chars.length!==3||chars.some(c=>!/^\p{Script=Han}$/u.test(c)))throw new Error('请输入三个汉字，并逐字填写实际笔画数。');if(input.values.some(n=>n>100))throw new Error('笔画数应在 1–100 之间。');input.chars=chars.join('');}
  }
  current={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,createdAt:new Date().toISOString(),mode,input,palaces:core.cast(input.values),question:'',analysis:'',rule:'inclusive-bj-midnight-leap-same-v1'};
  $('liurenStatus').textContent='起卦完成（纯本地计算）。';showResult();
}catch(err){current=null;showResult();$('liurenStatus').textContent=err.message;}});
$('liurenQuestion').addEventListener('input',()=>{if(current&&current.question!==$('liurenQuestion').value.trim()){current.analysis='';$('liurenAnalysis').textContent='';}});
$('liurenAnalyze').addEventListener('click',async()=>{
  if(!current||analysisBusy)return;const record=current,question=$('liurenQuestion').value.trim();if(!question){$('liurenStatus').textContent='请先填写所问事项。';return;}
  record.question=question;analysisBusy=true;showResult();$('liurenStatus').textContent='正在向已配置的 AI 请求解读…';
  try{const answer=await api.callAI('你是小六壬民俗文化解读助手。三宫已经由程序确定，禁止重新计算历法或改动宫位。解释传统象征、结合问题给出非确定性的现实建议，避免迷信断言和重大决策指令。',JSON.stringify({question,method:record.mode,input:record.input,palaces:record.palaces,rule:record.rule}));if(current===record&&$('liurenQuestion').value.trim()===question){record.analysis=answer;$('liurenStatus').textContent='AI 解读完成，可保存卦例。';}}catch(err){if(current===record)$('liurenStatus').textContent=err.message;}finally{analysisBusy=false;showResult();}
});
function records(){const x=api.getHistory();return Array.isArray(x)?x:[];}
$('liurenSave').addEventListener('click',()=>{if(!current)return;try{const question=$('liurenQuestion').value.trim();const record={...current,question,analysis:question===current.question?current.analysis:'',updatedAt:new Date().toISOString()};api.setHistory([record,...records().filter(x=>x?.id!==record.id)]);$('liurenStatus').textContent='卦例已保存，纳入 JSON 备份与云同步。';}catch(err){$('liurenStatus').textContent='保存失败：'+err.message;}});
function renderHistory(){const list=$('liurenHistory');list.replaceChildren();const all=records();if(!all.length){list.append(node('p','暂无卦例。'));return;}for(const r of all){if(!r||typeof r.id!=='string'||!Array.isArray(r.palaces)||r.palaces.length!==3||!r.input||!Array.isArray(r.input.values)||r.input.values.length!==3||r.palaces.some(p=>!p||typeof p.name!=='string'))continue;const card=node('article');card.className='lr-history-item';card.append(node('h4',`${r.palaces.map(p=>p?.name||'—').join(' · ')}｜${r.question||'未填写事项'}`),node('p',new Date(r.createdAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'})));const open=btn('查看',()=>{current=JSON.parse(JSON.stringify(r));$('liurenQuestion').value=r.question||'';showResult();$('liurenStatus').textContent='已载入历史卦例。';});open.dataset.liurenOpen=r.id;const del=btn('删除',()=>{if(confirm('删除该卦例？')){try{api.setHistory(records().filter(x=>x?.id!==r.id));}catch(err){$('liurenStatus').textContent=err.message;}}});del.dataset.liurenDelete=r.id;card.append(open,del);list.append(card);}}
window.addEventListener('suiwind:history-change',renderHistory);

})();
