/* Original four-band, zero-floor plan + pure date, session and timer logic. */
(function(root){
'use strict';
const ZONE='Asia/Shanghai', MAX_MS=86400000;
const exercise=(id,name,band,reps,rest,maxSets,cue)=>({id,name,band,reps,rest,restLabel:['a1','b2'].includes(id)?'60–90':String(rest),maxSets,cue});
const PLANS={
 A:{name:'上肢推拉 + 站姿核心',day:2,time:'21:05–21:30',recovery:'4 分钟，上背与胸大肌',moves:[
  exercise('a1','上斜俯卧撑','徒手','8–12 次',90,3,'双手撑稳固书桌或床沿，身体绷直，胸口靠近桌沿后推起。'),
  exercise('a2','弹力带俯身划船','黑色','12–15 次',60,3,'双脚踩带，屈髋、背挺直，向腰侧拉带，夹紧后背停 1 秒。'),
  exercise('a3','弹力带站姿推举','黄色','10–12 次',60,3,'黄带起步，适应后可换红带。单脚踩带，肩前握带向上推，避免挺腰借力。'),
  exercise('a4','弹力带水平撕拉','黄色','15 次',45,3,'双手肩高握带，向两侧拉开至轻触胸口。'),
  exercise('a5','站姿提膝卷腹','徒手','每侧 10 次',45,2,'双手放耳侧，抬膝触对侧手肘，左右交替。')]},
 B:{name:'下肢力量',day:5,time:'21:05–21:30',recovery:'5 分钟，大腿前后侧、臀部与小腿',moves:[
  exercise('b1','弹力带深蹲','紫色','12 次',90,3,'双脚与肩同宽踩带，双手握上端置锁骨前（勿挂脖子），屈髋下蹲至舒适深度。'),
  exercise('b2','弹力带罗马尼亚硬拉','黑色','12 次',90,3,'双脚踩带，膝微屈，臀向后推、背平直，腿后侧有牵拉感时站直。'),
  exercise('b3','扶椅后撤箭步蹲','徒手','每侧 8–10 次',60,3,'扶稳椅背或书桌，一腿后撤下蹲，前脚发力站起。'),
  exercise('b4','扶墙站姿后抬腿','黑色','每侧 12–15 次',45,3,'双手扶墙，带套脚踝或踩支撑脚下，向后抬腿并收紧臀部。'),
  exercise('b5','靠墙静蹲','徒手','30–40 秒',60,2,'背靠墙，屈膝至舒适角度，保持自然呼吸。')]},
 C:{name:'全身轻量综合',day:0,time:'21:00–21:25',recovery:'4 分钟，放松当日训练的肌群',moves:[
  exercise('c1','绕背弹力带胸推','红色','12 次',60,3,'环带绕过肩胛骨下方、从腋下穿出（勿卡后颈），握两端向前推。'),
  exercise('c2','坐椅弹力带划船','黑色','12–15 次',60,3,'坐稳椅，双腿伸直微屈，脚底踩带，挺胸向腹部拉带。'),
  exercise('c3','宽距相扑深蹲','紫色','12 次',60,3,'双脚宽于肩、脚尖外展约 30°，踩带，下蹲至舒适深度。'),
  exercise('c4','二头弯举 + 过顶臂屈伸','红色','各 12 次',60,2,'先踩带弯举 12 次，再单脚踩带做过顶臂屈伸 12 次。'),
  exercise('c5','上斜平板支撑','徒手','30–40 秒',45,2,'前臂撑稳固床沿或沙发扶手，收紧腹部和臀部，自然呼吸。')]}
};
const BANDS=['徒手','黄色','红色','黑色','紫色'];
Object.values(PLANS).forEach(p=>{p.moves.forEach(Object.freeze);Object.freeze(p.moves);Object.freeze(p)});Object.freeze(PLANS);Object.freeze(BANDS);
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dateKey=(d=new Date())=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;};
function validDate(k){if(typeof k!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(k))return false;const d=new Date(k+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===k;}
function shift(k,n){if(!validDate(k))throw Error('日期无效');const d=new Date(k+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function weekday(k){if(!validDate(k))throw Error('日期无效');return new Date(k+'T00:00:00Z').getUTCDay();}
function scheduled(k){return Object.keys(PLANS).find(p=>PLANS[p].day===weekday(k))||'';}
function week(k){const start=shift(k,-((weekday(k)+6)%7));return Array.from({length:7},(_,i)=>shift(start,i));}
const empty=()=>({version:1,sessions:{}});
const target=(s,m)=>Math.min(s.level,m.maxSets);
function create(k,plan,level=2,now=Date.now()){
 if(!validDate(k)||!Object.hasOwn(PLANS,plan)||![2,3].includes(level))throw Error('训练配置无效');
 return {date:k,plan,level,moves:Object.fromEntries(PLANS[plan].moves.map(m=>[m.id,{band:m.band,sets:[null,null,null]}])),warmup:false,cooldown:false,note:'',outcome:'open',elapsedMs:0,runningSince:null,restUntil:null,updatedAt:now};
}
function progress(s){let done=0,total=0;for(const m of PLANS[s.plan].moves){const n=target(s,m);total+=n;done+=s.moves[m.id].sets.slice(0,n).filter(v=>v!==null).length;}return {done,total};}
const timestamp=x=>x===null||(Number.isSafeInteger(x)&&x>=0);
function validate(state){
 if(!isObject(state)||state.version!==1||!isObject(state.sessions))throw Error('健身记录格式无效或版本不受支持');
 for(const [k,s] of Object.entries(state.sessions)){
  if(!validDate(k)||!isObject(s)||s.date!==k||!Object.hasOwn(PLANS,s.plan)||![2,3].includes(s.level)||!isObject(s.moves)||typeof s.warmup!=='boolean'||typeof s.cooldown!=='boolean'||typeof s.note!=='string'||s.note.length>2000||!['open','complete','partial','skipped'].includes(s.outcome)||!Number.isSafeInteger(s.elapsedMs)||s.elapsedMs<0||s.elapsedMs>MAX_MS||!timestamp(s.runningSince)||!timestamp(s.restUntil)||!Number.isSafeInteger(s.updatedAt)||s.updatedAt<0)throw Error('健身记录无效：'+k);
  for(const m of PLANS[s.plan].moves){const v=s.moves[m.id];if(!isObject(v)||!BANDS.includes(v.band)||!Array.isArray(v.sets)||v.sets.length!==3||v.sets.some((x,i)=>x!==null&&(i>=target(s,m)||typeof x!=='string'||x.length>40)))throw Error('训练组数或阻力记录无效：'+k);}
  const p=progress(s);if((s.outcome==='complete'&&p.done!==p.total)||(s.outcome==='partial'&&!(p.done>0&&p.done<p.total))||(s.outcome==='skipped'&&p.done!==0)||(s.outcome!=='open'&&(s.runningSince!==null||s.restUntil!==null)))throw Error('训练状态不一致：'+k);
 }
 return state;
}
function elapsed(s,now=Date.now()){return Math.min(MAX_MS,s.elapsedMs+(s.runningSince===null?0:Math.max(0,now-s.runningSince)));}
function pause(s,now=Date.now()){s.elapsedMs=elapsed(s,now);s.runningSince=null;}
function finish(s,now=Date.now()){pause(s,now);s.restUntil=null;const p=progress(s);s.outcome=p.done===p.total?'complete':p.done?'partial':'skipped';s.updatedAt=now;return s.outcome;}
function dayState(k,state){const s=state.sessions[k];if(s){if(s.outcome!=='open')return s.outcome;return 'open';}return scheduled(k)?'planned':'rest';}
function summarize(state,a,b){const result={complete:0,partial:0,open:0,skipped:0,sets:0,elapsedMs:0};for(const [k,s] of Object.entries(state.sessions))if(k>=a&&k<=b){result[s.outcome]++;result.sets+=progress(s).done;result.elapsedMs+=s.elapsedMs;}return result;}
const api=Object.freeze({ZONE,PLANS,BANDS,dateKey,validDate,shift,weekday,scheduled,week,empty,target,create,progress,validate,elapsed,pause,finish,dayState,summarize});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SuiwindFitnessCore=api;
})(globalThis);
