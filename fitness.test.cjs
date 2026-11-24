const assert=require('node:assert/strict');
const c=require('../fitness-core.js');
// Beijing civil date and Mon–Sun week, independent of computer's local zone.
assert.equal(c.dateKey(new Date('2026-11-23T15:59:59Z')),'2026-11-23');
assert.equal(c.dateKey(new Date('2026-11-23T16:00:00Z')),'2026-11-24');
assert.equal(c.scheduled('2026-11-24'),'A');assert.equal(c.scheduled('2026-11-27'),'B');assert.equal(c.scheduled('2026-11-29'),'C');
assert.equal(c.scheduled('2026-11-26'),'');assert.deepEqual(c.week('2026-11-29'),['2026-11-23','2026-11-24','2026-11-25','2026-11-26','2026-11-27','2026-11-28','2026-11-29']);
assert.deepEqual(c.week('2027-01-01'),['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);assert.equal(c.shift('2028-02-28',1),'2028-02-29');assert.equal(c.validDate('2026-02-30'),false);
let counter=0;
for(const [plan,p] of Object.entries(c.PLANS))for(const level of [2,3]){
 assert.equal(p.moves.length,5);const state=c.empty(), date='2026-11-24', s=c.create(date,plan,level,1000);state.sessions[date]=s;
 const total=level===2?10:plan==='C'?13:14;assert.deepEqual(c.progress(s),{done:0,total});c.validate(state);
 for(const m of p.moves)for(let i=0;i<c.target(s,m);i++){s.moves[m.id].sets[i]=i===0?'12':'';counter++;c.validate(state);}
 assert.deepEqual(c.progress(s),{done:total,total});assert.equal(c.finish(s,2000),'complete');assert.equal(c.dayState(date,state),'complete');c.validate(state);
 const copy=JSON.parse(JSON.stringify(state));assert.deepEqual(c.validate(copy),state);const stats=c.summarize(copy,'2026-11-23','2026-11-29');assert.equal(stats.complete,1);assert.equal(stats.sets,total);
}
const state=c.empty(), date='2026-11-24';const s=c.create(date,'A',2,1000);state.sessions[date]=s;s.runningSince=1000;assert.equal(c.elapsed(s,61000),60000);assert.equal(c.elapsed(s,0),0);c.pause(s,61000);assert.equal(s.elapsedMs,60000);s.runningSince=100000;assert.equal(c.elapsed(s,160000),120000);s.restUntil=160001;s.moves.a1.sets[0]='8';assert.equal(c.finish(s,160000),'partial');assert.equal(s.elapsedMs,120000);assert.equal(s.restUntil,null);assert.equal(s.runningSince,null);c.validate(state);
assert.equal(c.summarize(state,'2026-11-23','2026-11-29').partial,1);assert.equal(c.summarize(state,'2026-12-01','2026-12-31').sets,0);
const rest=c.create('2026-11-25','B');assert.equal(c.finish(rest),'skipped');state.sessions[rest.date]=rest;c.validate(state);assert.equal(c.dayState(rest.date,state),'skipped');assert.equal(c.dayState('2026-11-27',state),'planned');assert.equal(c.dayState('2026-11-26',state),'rest');
const bad=()=>JSON.parse(JSON.stringify(state));for(const mutate of [x=>x.sessions[date].moves.a1.sets[2]='12',x=>x.sessions[date].moves.a1.band='invalid',x=>x.sessions[date].outcome='complete',x=>x.sessions[date].runningSince=1,x=>x.sessions[date].note='x'.repeat(2001),x=>x.sessions[date].level=4,x=>x.sessions[date].elapsedMs=-1,x=>x.version=2]){const x=bad();mutate(x);assert.throws(()=>c.validate(x));}
assert.throws(()=>c.create('2026-02-30','A'));assert.throws(()=>c.create(date,'invalid'));assert.throws(()=>c.create(date,'A',4));
console.log(`PASS: 3 plans, 15 moves, ${counter} set transitions, 2/3-set limits, Beijing date/week/year/leap day, pause/resume, completion/partial/skip, serialization and malformed records.`);
