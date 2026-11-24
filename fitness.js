/* Fitness workspace UI. No network; only the narrow workbench persistence API. */
(() => {
'use strict';
const core=window.SuiwindFitnessCore, api=window.SuiwindWorkbench;
const $=id=>document.getElementById(id), el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const status=text=>{$('fitnessStatus').textContent=text;};
const names={rest:'休息日',planned:'计划训练',open:'未结束',complete:'已完成',partial:'部分完成',skipped:'已跳过'};
let date=core.dateKey(), viewPlan=core.scheduled(date), viewLevel=2, historyLimit=14, writing=false, active=false, tickId=null, current=null;
function read(){return api.getFitnessState();}
function fmt(ms){const s=Math.max(0,Math.floor(ms/1000)), h=Math.floor(s/3600), m=String(Math.floor(s%3600/60)).padStart(2,'0'), sec=String(s%60).padStart(2,'0');return h?`${h}:${m}:${sec}`:`${m}:${sec}`;}
function button(text,hook,value){const b=el('button',text);b.type='button';b.className='btn sm';b.dataset[hook]=String(value);return b;}
function save(mutator,{render=true,message='已保存至本机；已登录时按原规则参与云同步。'}={}){
 try{const state=read();mutator(state);core.validate(state);writing=true;try{api.setFitnessState(state);}finally{writing=false;}status(message);if(render)refresh();else current=state.sessions[date]||null;renderCalendar(state);return true;}
 catch(err){status('未能完成保存，请检查记录或本机存储：'+err.message);if(render)refresh();return false;}
}
function selectDate(k){if(!core.validDate(k)){status('日期无效。');$('fitnessDate').value=date;return;}date=k;viewPlan=core.scheduled(k);viewLevel=2;status('');refresh();}
function sessionEdit(fn,opts){return save(state=>{const s=state.sessions[date];if(!s||s.outcome!=='open')throw Error('请先建立或继续该日训练记录。');if(date>core.dateKey())throw Error('未来日期仅供预览。');fn(s,state);s.updatedAt=Date.now();},opts);}
function renderCalendar(state){
 const k=api.getSelectedDate();if(!core.validDate(k))return;
 try{state=state||read();const session=state.sessions[k], plan=session?.plan||core.scheduled(k), mark=core.dayState(k,state);
  $('fitnessCalendarCard').hidden=false;
  $('fitnessCalendarSummary').textContent=plan?`健身 ${plan} · ${names[mark]}${session?` ${core.progress(session).done}/${core.progress(session).total} 组`:` · ${core.PLANS[plan].time}`}`:'健身 · 休息日';
  $('fitnessCalendarOpen').textContent=mark==='rest'?'查看计划':'查看训练';
  document.querySelectorAll('#calendar [data-date]').forEach(b=>{const k=b.dataset.date;if(!core.validDate(k))return;const m=core.dayState(k,state);if(m==='rest'){delete b.dataset.fitnessDay;b.removeAttribute('aria-description');}else {b.dataset.fitnessDay=m;b.setAttribute('aria-description',`健身：${names[m]}`);}});
 }catch(err){$('fitnessCalendarCard').hidden=false;$('fitnessCalendarSummary').textContent='健身数据不可读，请先检查本机存储。';}
}
function renderWeek(state){
 const days=core.week(date), stats=core.summarize(state,days[0],days[6]);
 $('fitnessWeekStats').textContent=`${days[0]} 至 ${days[6]} · 完整 ${stats.complete}/3 次（每周计划 3 次） · 部分 ${stats.partial} 次 · ${stats.sets} 组`;
 $('fitnessWeek').replaceChildren(...days.map((k,i)=>{const s=state.sessions[k], plan=s?.plan||core.scheduled(k), mark=core.dayState(k,state);const b=button('', 'fitDate',k);b.className='fit-day';b.dataset.fitState=mark;b.setAttribute('aria-pressed',String(k===date));b.setAttribute('aria-label',`${k} ${plan||''} ${names[mark]}`);b.append(el('strong','周'+'一二三四五六日'[i]),el('span',k.slice(5)),el('span',`${plan?plan+' · ':''}${names[mark]}`));return b;}));
}
function renderPreview(){
 const p=core.PLANS[viewPlan];$('fitnessCreate').disabled=!p||date>core.dateKey();$('fitnessPreview').replaceChildren();
 if(!p){$('fitnessPreview').append(el('p','休息、散步或自然活动即可；也可以选择 A/B/C 补练，无需强行补齐。'));return;}
 const h=el('p',`${p.name} · ${p.time}（原计划） · 筋膜枪 ${p.recovery}`);const list=el('ul');p.moves.forEach(m=>list.append(el('li',`${m.name}｜${m.band}｜${Math.min(viewLevel,m.maxSets)} 组 × ${m.reps}｜休息 ${m.restLabel} 秒`)));$('fitnessPreview').append(h,list);
}
function renderMoves(s){
 const locked=s.outcome!=='open'||date>core.dateKey();
 $('fitnessMoves').replaceChildren(...core.PLANS[s.plan].moves.map((m,i)=>{
  const v=s.moves[m.id], count=core.target(s,m), card=el('article');card.className='fit-panel fit-move';card.dataset.fitMove=m.id;
  const heading=el('h4',`${i+1}. ${m.name}`), cue=el('p',m.cue), meta=el('p',`建议 ${m.band}｜${count} 组 × ${m.reps}｜休息 ${m.restLabel} 秒`);meta.className='small';
  const band=el('select');band.id=`fitnessBand-${m.id}`;band.dataset.fitBand=m.id;band.disabled=locked;for(const c of core.BANDS){const op=el('option',c);op.value=c;band.append(op);}band.value=v.band;
  const label=el('label','实际阻力');label.htmlFor=band.id;label.append(band);
  const sets=el('div');sets.className='fit-sets';for(let j=0;j<count;j++){
   const item=el('div');item.className='fit-set';const done=v.sets[j]!==null;const b=button(`第 ${j+1} 组${done?' · 已完成':' · 待做'}`,'fitSet',`${m.id}:${j}`);b.setAttribute('aria-pressed',String(done));b.disabled=locked;
   const reps=el('input');reps.type='text';reps.id=`fitnessReps-${m.id}-${j}`;reps.dataset.fitReps=`${m.id}:${j}`;reps.maxLength=40;reps.placeholder='实际次数/秒（选填）';reps.setAttribute('aria-label',`${m.name} 第 ${j+1} 组实际次数或秒数`);reps.disabled=locked||!done;reps.value=v.sets[j]??'';item.append(b,reps);sets.append(item);
  }card.append(heading,meta,cue,label,sets);return card;
 }));
}
function renderSession(s){
 const p=core.progress(s), isFuture=date>core.dateKey(), locked=s.outcome!=='open'||isFuture;
 $('fitnessSessionTitle').textContent=`${date} · 训练 ${s.plan} · ${core.PLANS[s.plan].name}`;
 $('fitnessProgress').textContent=`${names[s.outcome]} · ${p.done}/${p.total} 组${p.done===p.total&&!locked?'（已做完，点击结束训练保存）':''}`;
 $('fitnessProgressBar').max=p.total;$('fitnessProgressBar').value=p.done;
 $('fitnessWarmup').checked=s.warmup;$('fitnessCooldown').checked=s.cooldown;$('fitnessNote').value=s.note;
 $('fitnessCooldownText').textContent=`放松完成：筋膜枪 ${core.PLANS[s.plan].recovery}（可选）`;
 for(const id of ['fitnessWarmup','fitnessCooldown','fitnessNote'])$(id).disabled=locked;
 $('fitnessFinish').hidden=locked;$('fitnessReopen').hidden=s.outcome==='open';$('fitnessReopen').disabled=isFuture;
 $('fitnessTimer').disabled=locked||(date!==core.dateKey()&&s.runningSince===null);
 $('fitnessManualMinutes').disabled=locked||s.runningSince!==null;$('fitnessManualSave').disabled=locked||s.runningSince!==null;
 $('fitnessManualMinutes').value=String(Math.floor(s.elapsedMs/60000));
 document.querySelectorAll('[data-fit-rest]').forEach(b=>b.disabled=locked||date!==core.dateKey());$('fitnessRestStop').disabled=locked||s.restUntil===null;
 renderMoves(s);tick();
}
function renderHistory(state){
 const all=Object.values(state.sessions).sort((a,b)=>b.date.localeCompare(a.date));const complete=all.filter(s=>s.outcome==='complete').length, partial=all.filter(s=>s.outcome==='partial').length;
 $('fitnessHistoryStats').textContent=`累计完整 ${complete} 次 · 部分 ${partial} 次 · ${all.length} 天有记录`;
 const history=$('fitnessHistory');history.replaceChildren();if(!all.length)history.append(el('p','还没有训练记录。'));
 for(const s of all.slice(0,historyLimit)){const p=core.progress(s);const card=el('article');card.className='fit-history-row';card.append(el('div',`${s.date} · ${s.plan} · ${names[s.outcome]} · ${p.done}/${p.total} 组 · ${Math.floor(s.elapsedMs/60000)} 分钟`),button('查看','fitHistory',s.date));history.append(card);}
 $('fitnessMoreHistory').hidden=all.length<=historyLimit;
}
function refresh(){
 try{const state=read(), s=state.sessions[date]||null;current=s;
  $('fitnessDate').value=date;$('fitnessPlan').value=viewPlan;$('fitnessLevel').value=String(viewLevel);$('fitnessSetup').hidden=!!s;$('fitnessSession').hidden=!s;
  const plan=s?.plan||core.scheduled(date);$('fitnessDayHint').textContent=`${date} · ${plan?`训练 ${plan} · ${core.PLANS[plan].time}（原计划）`:'休息日'}${date>core.dateKey()?' · 未来日期只预览，不打卡':''}`;
  renderWeek(state);if(s)renderSession(s);else renderPreview();renderHistory(state);renderCalendar(state);
 }catch(err){current=null;$('fitnessSetup').hidden=true;$('fitnessSession').hidden=true;status('健身数据不可读取，已暂停写入：'+err.message);renderCalendar();}
}
function tick(){if(!current)return;const now=Date.now(), remaining=current.restUntil===null?0:Math.max(0,current.restUntil-now);$('fitnessClock').textContent=fmt(core.elapsed(current,now));$('fitnessRestClock').textContent=remaining?fmt(Math.ceil(remaining/1000)*1000):current.restUntil!==null?'休息结束':'00:00';$('fitnessTimer').textContent=current.runningSince===null?'开始计时':'暂停计时';}
function startTicker(){if(tickId!==null)clearInterval(tickId);tick();if(active&&!document.hidden)tickId=setInterval(tick,500);else tickId=null;}
$('fitnessDate').addEventListener('change',e=>selectDate(e.target.value));$('fitnessToday').addEventListener('click',()=>selectDate(core.dateKey()));
$('fitnessPlan').addEventListener('change',e=>{viewPlan=e.target.value;renderPreview();});$('fitnessLevel').addEventListener('change',e=>{viewLevel=Number(e.target.value);renderPreview();});
$('fitnessCreate').addEventListener('click',()=>save(state=>{if(date>core.dateKey())throw Error('未来日期仅供预览。');if(state.sessions[date])throw Error('已有记录，请勿重复创建。');state.sessions[date]=core.create(date,viewPlan,viewLevel);},{message:'训练记录已建立。'}));
$('fitnessWeek').addEventListener('click',e=>{const b=e.target.closest('[data-fit-date]');if(b)selectDate(b.dataset.fitDate);});
$('fitnessHistory').addEventListener('click',e=>{const b=e.target.closest('[data-fit-history]');if(b){selectDate(b.dataset.fitHistory);$('fitnessDate').scrollIntoView({block:'center'});}});
$('fitnessMoreHistory').addEventListener('click',()=>{historyLimit+=14;refresh();});
$('fitnessTimer').addEventListener('click',()=>sessionEdit((s,state)=>{const now=Date.now();if(s.runningSince!==null){core.pause(s,now);return;}if(date!==core.dateKey())throw Error('历史训练请手动记录用时。');const others=Object.values(state.sessions).filter(x=>x.date!==date&&x.runningSince!==null);if(others.length&&!confirm('还有其他日期的计时在运行。先暂停旧计时，再开始本日训练？'))throw Error('已取消。');for(const old of others){core.pause(old,now);old.updatedAt=now;}s.runningSince=now;}));
$('fitnessManualSave').addEventListener('click',()=>{const raw=$('fitnessManualMinutes').value;sessionEdit(s=>{if(s.runningSince!==null||!/^\d+$/.test(raw)||Number(raw)>1440)throw Error('先暂停计时，再填写 0–1440 的整数分钟。');s.elapsedMs=Number(raw)*60000;});});
$('fitnessSession').addEventListener('click',e=>{const b=e.target.closest('[data-fit-rest]');if(b)sessionEdit(s=>{if(date!==core.dateKey())throw Error('仅今天可使用休息计时。');s.restUntil=Date.now()+Number(b.dataset.fitRest)*1000;});});
$('fitnessRestStop').addEventListener('click',()=>sessionEdit(s=>{s.restUntil=null;}));
for(const [id,key] of [['fitnessWarmup','warmup'],['fitnessCooldown','cooldown']])$(id).addEventListener('change',e=>sessionEdit(s=>{s[key]=e.target.checked;}));
$('fitnessNote').addEventListener('input',e=>sessionEdit(s=>{s.note=e.target.value;},{render:false}));
$('fitnessMoves').addEventListener('click',e=>{const b=e.target.closest('[data-fit-set]');if(!b)return;const [id,index]=b.dataset.fitSet.split(':'), i=Number(index);sessionEdit(s=>{const m=core.PLANS[s.plan].moves.find(m=>m.id===id);if(!m||i>=core.target(s,m)||i<0)throw Error('无效训练组');const v=s.moves[id].sets;if(v[i]===null){v[i]='';if(date===core.dateKey()&&core.progress(s).done<core.progress(s).total)s.restUntil=Date.now()+m.rest*1000;else s.restUntil=null;}else {if(v[i]&&!confirm('取消该组完成状态会清空该组实际次数，继续？'))throw Error('已取消。');v[i]=null;s.restUntil=null;}});});
$('fitnessMoves').addEventListener('change',e=>{const input=e.target.closest('[data-fit-band]');if(input)sessionEdit(s=>{if(!Object.hasOwn(s.moves,input.dataset.fitBand))throw Error('无效动作');s.moves[input.dataset.fitBand].band=input.value;});});
$('fitnessMoves').addEventListener('input',e=>{const input=e.target.closest('[data-fit-reps]');if(input){const [id,i]=input.dataset.fitReps.split(':');sessionEdit(s=>{if(s.moves[id]?.sets[Number(i)]==null)throw Error('先标记该组完成。');s.moves[id].sets[Number(i)]=input.value;},{render:false});}});
$('fitnessFinish').addEventListener('click',()=>sessionEdit(s=>{const p=core.progress(s);if(p.done!==p.total&&!confirm(p.done?'还有未完成组，将保存为部分完成，继续？':'尚未完成任何组，将记录为跳过，继续？'))throw Error('已取消。');core.finish(s);},{message:'本次训练已结束并保存。'}));
$('fitnessReopen').addEventListener('click',()=>save(state=>{const s=state.sessions[date];if(!s||date>core.dateKey())throw Error('无法继续此记录。');s.outcome='open';s.updatedAt=Date.now();},{message:'已重新打开记录。'}));
$('fitnessDelete').addEventListener('click',()=>{if(confirm(`删除 ${date} 的训练记录？此操作无法直接撤销。`))save(state=>{delete state.sessions[date];},{message:'已删除本日记录。'});});
$('fitnessCalendarOpen').addEventListener('click',()=>{selectDate(api.getSelectedDate());document.querySelector('[data-wb-route="fitness"]').click();});
window.addEventListener('suiwind:calendar-render',()=>renderCalendar());
window.addEventListener('suiwind:fitness-change',()=>{if(!writing){if(active)refresh();else renderCalendar();}});
window.addEventListener('suiwind:route-change',e=>{active=e.detail.route==='fitness';if(active)refresh();startTicker();});
window.addEventListener('storage',e=>{if(e.key==='zx_fitnessState'||e.key===null){if(active)refresh();else renderCalendar();}});
document.addEventListener('visibilitychange',()=>{if(active&&!document.hidden)refresh();startTicker();});
renderCalendar();
})();
