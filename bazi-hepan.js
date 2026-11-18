/* 苏伊温德日历 · V5 合盘模块适配层
 * IMPORTANT: 本文件不实现、替换或修改任何 V5 原版八字算法、节气数据、评分参数。
 * 真正的计算由用户提供的 V5 原始 HTML 在 iframe 中原样执行。
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const records=[
  {label:'爱情最高',score:80.334,mode:'love',group:'personal'},
  {label:'友情最高（年龄相近）',score:83.329,mode:'friend',group:'personal'},
  {label:'友情最高（含长辈）',score:83.599,mode:'friend',group:'personal'},
  {label:'双人爱情最高',score:89.075,mode:'love',group:'world'},
  {label:'双人友情最高',score:90.029,mode:'friend',group:'world'},
];
const dbName='suiwind-bazi-v5-source', dbStore='source';
let loaded=false, currentHtml='', recordDetails=new Map(), debounce=null;
const styleState=()=>document.body.style.overflow=$('baziPage').classList.contains('bazi-open')?'hidden':'';
function notice(msg,error=false){const el=$('baziStatus');el.textContent=msg;el.classList.toggle('bazi-error',error);}
function openDB(){return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(new Error('此浏览器不支持 IndexedDB'));return;}
  const req=indexedDB.open(dbName,1);
  req.onupgradeneeded=()=>req.result.createObjectStore(dbStore);
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
});}
async function dbGet(){const db=await openDB();return new Promise((resolve,reject)=>{
  const req=db.transaction(dbStore,'readonly').objectStore(dbStore).get('v5html');
  req.onsuccess=()=>{db.close();resolve(req.result||null);};req.onerror=()=>{db.close();reject(req.error)};
});}
async function dbPut(value){const db=await openDB();return new Promise((resolve,reject)=>{
  const tx=db.transaction(dbStore,'readwrite');tx.objectStore(dbStore).put(value,'v5html');
  tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error)};
});}
function validateHTML(s){
 if(typeof s!=='string'||s.length<3000||!/<html\b/i.test(s)||!/<script\b/i.test(s))throw new Error('这个文件看起来不是完整的 V5 原版 HTML。请重新选择原文件。');
}
function showFrame(html,source){
 validateHTML(html);currentHtml=html;
 const frame=$('baziFrame');frame.onload=()=>{
  loaded=true;notice('已载入 '+source+'：计算、节气与记录操作均由 V5 原版 HTML 执行。');
  setTimeout(()=>{discoverRecordDetails();attachScoreObserver()},250);
 };
 $('baziEmpty').classList.add('bazi-hidden');frame.classList.remove('bazi-hidden');
 // 将原文件作为完整 HTML 文档注入 iframe，脚本及算法字节内容不做任何改写。
 frame.srcdoc=html;
}
async function importFile(file){
 try{
  if(!file)return;
  if(file.size>12*1024*1024)throw new Error('HTML 文件超过12MB，请核实是否选对。');
  const html=await file.text();validateHTML(html);
  await dbPut(html);showFrame(html,'浏览器本地存储的原版 HTML');
 }catch(e){notice('导入失败：'+e.message,true)}
}
async function load(){
 try{
  // 发行时若将原文件放到同网站根目录，会优先装载成网站正式功能，无需单独导入。
  const r=await fetch('./bazi-hepan-v5.html',{cache:'no-store'});
  if(r.ok){const s=await r.text();validateHTML(s);showFrame(s,'站点内置 V5.0 原版');return;}
 }catch(_){/* 允许无网络部署和首次导入 */}
 try{
  const local=await dbGet();if(local){showFrame(local,'已保存的 V5.0 原版');return;}
 }catch(e){notice('本地存储不可用，请尝试通过 HTTPS 网站打开并导入原文件。',true);return;}
 notice('尚未导入 V5.0 原版 HTML；请选择源文件，导入后即可在站内计算。');
}
function makeRecord(r,i){
 const wrap=document.createElement('div');wrap.className='bazi-record';
 const name=document.createElement('div');name.className='bazi-recordname';name.textContent=r.label;
 const score=document.createElement('div');score.className='bazi-score';score.textContent=r.score.toFixed(3)+' 分';
 const dates=document.createElement('div');dates.className='bazi-births';dates.id='baziRecordDate'+i;
 dates.textContent='出生日期：请在原版记录页核对';
 const btn=document.createElement('button');btn.className='btn';btn.textContent='填入对比';btn.type='button';btn.onclick=()=>fillRecord(i);
 wrap.append(name,score,dates,btn);return wrap;
}
function renderRecords(){records.forEach((r,i)=>$(r.group==='personal'?'baziPersonalRecords':'baziWorldRecords').appendChild(makeRecord(r,i)));}
function doc(){try{return $('baziFrame').contentDocument}catch(_){return null}}
function getLeafCandidates(root,score){
 if(!root)return[];
 const matches=[];
 const walker=root.createTreeWalker(root.body||root,NodeFilter.SHOW_TEXT);
 let node;let iter=0;
 while((node=walker.nextNode())&&iter<120000){iter++;
  if((node.textContent||'').includes(score)){const p=node.parentElement;if(p)matches.push(p);}
 }
 return matches;
}
function getNearbyText(el,n=6){let cur=el;for(let j=0;cur&&j<n;j++,cur=cur.parentElement){const s=cur.innerText||cur.textContent||'';if(s.includes('出生')||s.includes('纪录')||s.includes('记录'))return s.slice(0,1400);}return ''}
function discoverRecordDetails(){
 const d=doc();if(!d)return;
 records.forEach((r,i)=>{
  const els=getLeafCandidates(d,r.score.toFixed(3));let found=[];
  for(const el of els){
   const area=getNearbyText(el,5);
   // 按原版本信息动态识别两个出生日期，绝不以推测值填写。
   const all=[...area.matchAll(/(?:19|20)\d{2}[\-/.年]\s*\d{1,2}[\-/.月]\s*\d{1,2}(?:日)?(?:\s+\d{1,2}(?:[:：时]\d{1,2})?)?/g)].map(m=>m[0]);
   if(all.length>=2){found=all.slice(0,2);break;}
  }
  if(found.length===2){recordDetails.set(i,found);$('baziRecordDate'+i).textContent=found.join(' ／ ');}
 });
}
function findRecordButton(d,r){
 const els=getLeafCandidates(d,r.score.toFixed(3));
 for(const el of els){
  let parent=el;
  for(let i=0;i<8&&parent;i++,parent=parent.parentElement){
   const candidates=[...parent.querySelectorAll('button,[role="button"],input[type="button"],a')];
   const target=candidates.find(b=>/填入对比|填入|套用|载入对比|对比该纪录/.test(b.innerText||b.textContent||b.value||''));
   if(target&&parent.textContent.length<7000)return target;
  }
 }
 return null;
}
function fillRecord(i){
 const r=records[i],d=doc();if(!loaded||!d){notice('请先导入 V5.0 原版 HTML，再使用纪录对比。',true);$('baziImport').click();return;}
 const btn=findRecordButton(d,r);
 if(btn){try{btn.click();notice('已触发原版 '+r.label+' 的「填入对比」。请在左侧核对出生信息和计算结果。');}catch(e){notice('原版控件执行失败：'+e.message,true);}}
 else{
  notice('未能定位原版「'+r.label+'」的填入控件。请在左侧原版页面的纪录榜点击「填入对比」；该功能的日期数据不能擅自猜测。',true);
  const el=getLeafCandidates(d,r.score.toFixed(3))[0];if(el){el.scrollIntoView({block:'center',behavior:'smooth'});}
 }
 $('baziCompareCategory').value=String(i);
}
function diff(){
 const val=Number($('baziInputScore').value),i=Number($('baziCompareCategory').value);
 if($('baziInputScore').value===''||!Number.isFinite(val)||val<0||val>100){$('baziDiff').textContent='请输入原版计算结果中的0—100分。';return;}
 const r=records[i],delta=+(val-r.score).toFixed(3);
 $('baziDiff').textContent=`${val.toFixed(3)} 分，与「${r.label}」${r.score.toFixed(3)} 分相比：${delta>0?'高出 '+delta.toFixed(3):delta<0?'低于 '+Math.abs(delta).toFixed(3):'持平'} 分。`;
}
function attachScoreObserver(){
 const d=doc();if(!d||!d.body)return;
 if(d.__baziObserver){d.__baziObserver.disconnect()}
 const o=new MutationObserver(()=>{clearTimeout(debounce);debounce=setTimeout(()=>{discoverRecordDetails();detectScore(d)},350)});
 o.observe(d.body,{childList:true,subtree:true,characterData:true});d.__baziObserver=o;
}
function detectScore(d){
 // 只识别带明显“结果/综合分数”语境的数字，避免将五条固定纪录误当本次得分。
 const xs=[...d.querySelectorAll('[id*="result" i],[id*="score" i],[class*="result" i],[class*="score" i]')]
  .filter(el=>el.children.length<=7).slice(-200);
 for(const el of xs){
  let s=el.innerText||'';
  if(!/综合|总分|合盘得分|匹配得分/.test(s))continue;
  const m=s.match(/(?:综合(?:分数|得分)?|总分|合盘得分|匹配得分)[^\d\n]{0,12}(\d{1,3}(?:\.\d{1,4})?)/);
  if(!m)continue;
  const value=Number(m[1]);if(value>=0&&value<=100){$('baziInputScore').value=value.toFixed(3);$('baziDetected').textContent='尝试从原版结果读取到 '+value.toFixed(3)+' 分；请核对是否是本次综合得分。';diff();return;}
 }
}
function open(){
 $('baziPage').classList.add('bazi-open');$('baziPage').setAttribute('aria-hidden','false');styleState();
 if(!loaded&&!currentHtml)load();$('baziClose').focus();
}
function close(){$('baziPage').classList.remove('bazi-open');$('baziPage').setAttribute('aria-hidden','true');styleState();$('baziBtn').focus()}
function init(){
 if(!$('baziBtn')||!$('baziPage'))return;
 renderRecords();$('baziBtn').addEventListener('click',open);$('baziClose').addEventListener('click',close);
 $('baziImport').addEventListener('click',()=>$('baziFile').click());$('baziEmptyImport').addEventListener('click',()=>$('baziFile').click());
 $('baziFile').addEventListener('change',e=>{importFile(e.target.files?.[0]);e.target.value='';});
 $('baziComputeDifference').addEventListener('click',diff);
 $('baziCompareCategory').addEventListener('change',diff);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('baziPage').classList.contains('bazi-open')&&e.target?.tagName!=='INPUT')close()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
