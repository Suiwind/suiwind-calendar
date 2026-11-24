/* Pure local calculation; traditional inclusive counting. No network or DOM. */
(function (root) {
  'use strict';
  const names = Object.freeze(['大安','留连','速喜','赤口','小吉','空亡']);
  const meanings = Object.freeze(['安稳、守成，宜稳步处理。','迟滞、反复，宜耐心查清阻碍。','迅速、喜讯，宜把握时机。','口舌、争执，宜谨慎沟通。','小成、协作，宜务实推进。','落空、不确定，宜核实并准备备选方案。']);
  const branches = '子丑寅卯辰巳午未申酉戌亥';
  const zone = 'Asia/Shanghai';
  function cast(values) {
    if (!Array.isArray(values) || values.length !== 3 || values.some(n => !Number.isSafeInteger(n) || n < 1)) throw new Error('请输入三个正整数（安全整数范围内）。');
    let index = 0;
    return values.map((n, i) => { index = (index + (n - 1) % 6) % 6; return { label: ['月宫','日宫','时宫'][i], index, name: names[index], meaning: meanings[index] }; });
  }
  function timeInput(date = new Date()) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw new Error('无效日期。');
    const parts = (locale, options) => { const fmt = new Intl.DateTimeFormat(locale, { timeZone: zone, numberingSystem:'latn', ...options }); if(locale.includes('ca-chinese') && fmt.resolvedOptions().calendar !== 'chinese') throw new Error('当前浏览器不支持本地农历转换，请改用报三数。'); return Object.fromEntries(fmt.formatToParts(date).map(p => [p.type,p.value])); }; 
    const l = parts('en-u-ca-chinese', {year:'numeric',month:'numeric',day:'numeric'});
    const h = parts('en-GB', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    const m = /^(\d{1,2})(bis)?$/.exec(l.month || '');
    const day = Number(l.day), hour = Number(h.hour);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12 || !Number.isInteger(day) || day < 1 || day > 30 || !Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('当前浏览器无法准确转换农历，请改用报三数。');
    const branch = Math.floor((hour+1)/2)%12;
    return { values:[Number(m[1]),day,branch+1], lunarYear:l.relatedYear || '', leap:!!m[2], branch:branches[branch], beijing:`${h.year}-${h.month}-${h.day} ${h.hour}:${h.minute}`, timezone:zone, timestamp:date.toISOString() };
  }
  const api = Object.freeze({cast,timeInput,names,meanings});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SuiwindLiuren = api;
})(globalThis);
