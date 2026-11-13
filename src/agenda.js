/* ---------- Agenda: equipa e datas de consulta vindas do CMS ----------
   A página /agenda-consultas lista a coleção Equipa (nome, área, tipo de agenda, retrato)
   e a coleção Datas de consulta (profissional, dia, período).
   O formulário de marcação usa isto para mostrar os profissionais e, para quem vem
   em dias marcados, abrir só esses dias no calendário. */
(()=>{
  const subs=[],api={profs:null,dates:[],loaded:false,onUpdate:f=>{subs.push(f)}};
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
    const dates=[...doc.querySelectorAll("[data-agenda-dates] [data-date]")].map(el=>{
      const k=tk(el.getAttribute("data-date")),per=(el.getAttribute("data-periodo")||"").toLowerCase();
      return k?{date:k,prof:(el.getAttribute("data-prof")||"").trim(),manha:!/tarde/.test(per),tarde:!/manh/.test(per)}:null}).filter(Boolean);
    const d={profs,dates};
    try{sessionStorage.setItem(SK,JSON.stringify({t:Date.now(),d}))}catch(e){}
    apply(d)}).catch(()=>{});
})();
