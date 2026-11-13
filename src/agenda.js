/* ---------- Agenda: equipa e datas de consulta vindas do CMS ----------
   A página /agenda-consultas lista a coleção Equipa (nome, área, tipo de agenda, retrato)
   e a coleção Datas de consulta (profissional, dia, período).
   O formulário de marcação usa isto para mostrar os profissionais e, para quem vem
   em dias marcados, abrir só esses dias no calendário. */
(()=>{
  const subs=[],api={profs:null,dates:[],loaded:false,onUpdate:f=>{subs.push(f)},
    /* Datas em que o centro está aberto: sem domingos, feriados e encerramentos; sábado só de manhã. */
    open:()=>api.dates.map(d=>{const w=new Date(d.date+"T12:00:00").getDay(),H=window.cmdHol;
      if(w===0||H&&H.closed&&H.closed(d.date))return null;const o={...d};w===6&&(o.tarde=false);return o.manha||o.tarde?o:null}).filter(Boolean)};
  window.cmdAgenda=api;
  const SK="cmd-agenda",TTL=3e5;
  const apply=d=>{api.profs=d.profs;api.dates=d.dates;api.loaded=true;subs.forEach(f=>{try{f()}catch(e){}})};
  try{const c=JSON.parse(sessionStorage.getItem(SK)||"null");c&&Date.now()-c.t<TTL&&apply(c.d)}catch(e){}
  fetch("/agenda-consultas",{credentials:"omit"}).then(r=>r.ok?r.text():"").then(html=>{
    if(!html)return;const doc=new DOMParser().parseFromString(html,"text/html");
    const tk=v=>window.cmdHol&&window.cmdHol.toKey?window.cmdHol.toKey(v):(v||"").slice(0,10);
    const profs=[...doc.querySelectorAll("[data-agenda-team] [data-prof-slug]")].map(el=>{
      const g=n=>(el.getAttribute(n)||"").trim(),im=el.querySelector("img"),src=im&&im.getAttribute("src")||"";
      return{slug:g("data-prof-slug"),nome:g("data-prof-nome"),esp:g("data-prof-esp"),area:g("data-prof-area"),
        datas:/datas/i.test(g("data-prof-agenda")),img:src&&!/placeholder|\.svg$/i.test(src)?src:""}})
      .filter(p=>p.slug&&p.nome&&!/a confirmar/i.test(p.nome));
    /* Cada entrada é um dia, ou um intervalo (Dia até Até ao dia) com o mesmo período. */
    const nx=k=>{const d=new Date(k+"T12:00:00");d.setDate(d.getDate()+1);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
    const dates=[];[...doc.querySelectorAll("[data-agenda-dates] [data-date]")].forEach(el=>{
      const k=tk(el.getAttribute("data-date"));if(!k)return;let e=tk(el.getAttribute("data-date-end"))||k;e<k&&(e=k);
      const per=(el.getAttribute("data-periodo")||"").toLowerCase(),prof=(el.getAttribute("data-prof")||"").trim();
      for(let d=k,n=0;d<=e&&n<92;d=nx(d),n++)dates.push({date:d,prof,manha:!/tarde/.test(per),tarde:!/manh/.test(per)})});
    const d={profs,dates};
    try{sessionStorage.setItem(SK,JSON.stringify({t:Date.now(),d}))}catch(e){}
    apply(d)}).catch(()=>{});
})();
