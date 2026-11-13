/* ---------- Horário: feriados e encerramentos excecionais ----------
   Feriados nacionais calculados para qualquer ano (incluindo Sexta-feira Santa e Corpo de Deus)
   e o feriado municipal de Vila do Conde (24 de junho, São João).
   Encerramentos excecionais vêm da coleção Encerramentos no CMS, publicada na página /estado-horario.
   A clínica cria um item (motivo e dia), publica, e o site passa a mostrar "Fechado · motivo". */
(()=>{
  const FIXED=["01-01","04-25","05-01","06-10","06-24","08-15","10-05","11-01","12-01","12-08","12-25"];
  const pad=n=>String(n).padStart(2,"0");
  const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const easter=y=>{const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return new Date(y,mo-1,da,12)};
  const cache={};
  const holidays=y=>{if(cache[y])return cache[y];const s=new Set(FIXED.map(x=>`${y}-${x}`)),e=easter(y);
    [-2,0,60].forEach(o=>{const d=new Date(e);d.setDate(d.getDate()+o);s.add(key(d))});return cache[y]=s};
  const isHoliday=k=>holidays(+k.slice(0,4)).has(k);

  /* Datas do CMS: aceita ISO (convertido para o dia em Lisboa) ou texto ("November 11, 2026", "11/11/2026") */
  const LIS=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Lisbon",year:"numeric",month:"2-digit",day:"2-digit"});
  const toKey=v=>{v=(v||"").trim();if(!v)return null;
    if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v;
    if(/^\d{4}-\d{2}-\d{2}T/.test(v)){const d=new Date(v);return isNaN(d)?null:LIS.format(d)}
    const m=v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);if(m)return`${m[3]}-${pad(m[2])}-${pad(m[1])}`;
    const d=new Date(v);return isNaN(d)?null:key(d)};
  let closures=[];
  const reason=k=>{for(const c of closures)if(k>=c.from&&k<=c.to)return c.reason||"encerramento excecional";return null};
  const subs=[];
  const api={key,toKey,isHoliday,reason,closed:k=>isHoliday(k)||!!reason(k),onUpdate:f=>{subs.push(f)}};
  window.cmdHol=api;

  const SK="cmd-closures",TTL=3e5;
  const apply=list=>{closures=list;subs.forEach(f=>{try{f()}catch(e){}})};
  try{const c=JSON.parse(sessionStorage.getItem(SK)||"null");c&&Date.now()-c.t<TTL&&(closures=c.list)}catch(e){}
  fetch("/estado-horario",{credentials:"omit"}).then(r=>r.ok?r.text():"").then(html=>{
    if(!html)return;const doc=new DOMParser().parseFromString(html,"text/html");
    const list=[...doc.querySelectorAll("[data-closures] [data-from]")].map(el=>{const from=toKey(el.getAttribute("data-from"));if(!from)return null;
      const to=toKey(el.getAttribute("data-to"))||from;return{from,to:to<from?from:to,reason:(el.getAttribute("data-reason")||"").trim()}}).filter(Boolean);
    try{sessionStorage.setItem(SK,JSON.stringify({t:Date.now(),list}))}catch(e){}
    apply(list)}).catch(()=>{});
})();
