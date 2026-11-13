(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,G=!!(window.gsap&&window.ScrollTrigger),A=G&&!RM;
const FINE=matchMedia("(hover: hover) and (pointer: fine)").matches;
G&&gsap.registerPlugin(...[ScrollTrigger,window.SplitText].filter(Boolean));
const SC=[0,2,4,7,9,12,14,16],pit=i=>Math.pow(2,SC[i%8]/12);
/* Som removido a pedido. Mantém-se a API vazia para não partir chamadas existentes. */
const S={play(){},set(){},on:false};
try{localStorage.removeItem("cmd_sound")}catch(e){}
window.cmdSound=S;
const watchOn=(els,fn,cls="is-on")=>els.forEach((n,i)=>{let was=n.classList.contains(cls);new MutationObserver(()=>{const is=n.classList.contains(cls);is&&!was&&fn(i,n);was=is}).observe(n,{attributes:true,attributeFilter:["class"]})});

/* Arco da equipa: tom em cada encaixe */
const rc=$("[data-rad-count]");
if(rc){let prev=rc.textContent;new MutationObserver(()=>{const t=rc.textContent;if(t===prev)return;prev=t;S.play("arc",{p:pit((parseInt(t,10)||1)-1)})}).observe(rc,{childList:true,characterData:true,subtree:true})}
/* Linha das especialidades: um tom por ponto, no instante em que a linha lá chega; acorde ao chegar ao monograma */
watchOn($$(".signature_node"),i=>S.play("line",{p:pit(i)}));
const sig=$("[data-sig]");sig&&watchOn([sig],()=>S.play("end"),"is-complete");
/* Percursos (home) e percurso do caso: o mesmo tom em cada etapa */
watchOn($$(".percursos_step"),(i,n)=>S.play("line",{p:pit([...n.parentElement.children].indexOf(n)),v:.8}));
const steps=$$(".path_step");
steps.forEach((s,i)=>G?ScrollTrigger.create({trigger:s,start:"top 72%",once:true,onEnter:()=>{s.classList.add("is-on");S.play("line",{p:pit(i)})}}):s.classList.add("is-on"));
/* Comparador: tique suave ao passar o meio */
const ba=$("[data-ba]");
if(ba){let side=null;new MutationObserver(()=>{const v=parseFloat(ba.style.getPropertyValue("--pos"));if(isNaN(v))return;const s=v>=50;side!==null&&s!==side&&S.play("tick",{p:.9});side=s}).observe(ba,{attributes:true,attributeFilter:["style"]});
  if(A){const st={v:0};ba.style.setProperty("--pos","0%");ScrollTrigger.create({trigger:ba,start:"top 70%",once:true,onEnter:()=>gsap.to(st,{v:50,duration:1.6,ease:"expo.inOut",onUpdate:()=>ba.style.setProperty("--pos",st.v+"%")})})}}
/* Filtros, separadores e perguntas: tique suave. Nada no formulário de marcação. */
document.addEventListener("click",e=>{const b=e.target.closest('summary,[role="tab"],.filter_btn,.cases-index_filter,[data-filter],[data-view],.percursos_tab');
  if(!b||b.closest("[data-book-drawer],form,[data-cookie],[data-rad]"))return;const d=b.closest("details");S.play("tick",{p:d?(d.open?.84:1.12):1})});
/* Mudança de página: nota grave e curta enquanto a cortina fecha */
document.addEventListener("click",e=>{const a=e.target.closest("a[href]");if(!a)return;if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  if(a.target&&a.target!=="_self"||a.hasAttribute("download")||a.closest("[data-book],[data-no-curtain]"))return;const u=new URL(a.href,location.href);
  u.origin===location.origin&&(u.pathname!==location.pathname||u.search!==location.search)&&S.play("page")},true);

/* ---------- Marcação: calendário mensal (2 meses, domingo e feriados fechados, sábado só manhã) ----------
   Profissionais com agenda "Por datas": o calendário abre só os dias publicados em Datas de consulta.
   Sem datas abertas, o passo passa a lista de espera: a pessoa escolhe o período e a clínica liga. */
const box=$("[data-opt-date]");
if(box){const WD=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],MO=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],
  K=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
  esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),
  ico=d=>`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const form=box.closest("form")||document;
  let mo=0,sel=null,busy=false,lastKey="",cur={m:"fixa"};
  const mode=()=>{const ag=window.cmdAgenda;if(!ag||!ag.profs||!ag.profs.length)return{m:"fixa"};
    const ec=form.querySelector('input[name="Especialidade"]:checked'),esp=ec?ec.dataset.slug:"",pc=form.querySelector('input[name="Profissional"]:checked'),ps=pc&&pc.dataset.slug;
    let list;if(ps){const p=ag.profs.find(x=>x.slug===ps);if(!p||!p.datas)return{m:"fixa"};list=[p]}
    else{list=ag.profs.filter(p=>p.esp===esp);if(!list.length||!list.every(p=>p.datas))return{m:"fixa"}}
    const now=new Date;now.setHours(12,0,0,0);const t=new Date(now);t.setDate(t.getDate()+1);const min=K(t),max=K(new Date(now.getFullYear(),now.getMonth()+2,0,12));
    const slots=new Map;ag.dates.forEach(d=>{if(d.date<min||d.date>max||!list.some(p=>p.slug===d.prof))return;const o=slots.get(d.date)||{manha:false,tarde:false};o.manha=o.manha||d.manha;o.tarde=o.tarde||d.tarde;slots.set(d.date,o)});
    return{m:slots.size?"datas":"espera",slots,who:list.length===1?list[0].nome:"A equipa desta área",key:ps||esp}};
  const per=()=>{const c=box.querySelector('input[name="Dia"]:checked'),mn=$("#per-manha"),tr=$("#per-tarde"),lm=$("[data-per-manha]"),lt=$("[data-per-tarde]");if(!tr)return;
    const off=(i,v)=>{if(!i)return;i.disabled=v;v&&i.checked&&(i.checked=false)};
    if(cur.m==="espera"){off(mn,false);off(tr,false);lm&&(lm.textContent="Prefere de manhã");lt&&(lt.textContent="Prefere à tarde");return}
    const v=c&&c.value,s=!!v&&v!=="espera"&&new Date(v+"T12:00:00").getDay()===6;
    if(cur.m==="datas"&&v&&cur.slots.has(v)){const o=cur.slots.get(v);off(mn,!o.manha);off(tr,!o.tarde);
      lm&&(lm.textContent=o.manha?(s?"9h30 às 13h":"9h30 às 12h"):"Sem consulta de manhã");lt&&(lt.textContent=o.tarde?"14h30 às 19h":"Sem consulta à tarde");return}
    off(mn,false);off(tr,s);lm&&(lm.textContent=s?"9h30 às 13h":"9h30 às 12h");lt&&(lt.textContent=s?"Encerrado ao sábado":"14h30 às 19h")};
  window.cmdApplyPer=per;
  const render=(dir=0)=>{busy=true;cur=mode();const now=new Date;now.setHours(12,0,0,0);const min=new Date(now);min.setDate(min.getDate()+1);
    const nk=cur.m+":"+(cur.key||"");if(nk!==lastKey){lastKey=nk;sel=null;if(cur.m==="datas"){const f=[...cur.slots.keys()].sort()[0];mo=(+f.slice(0,4)-now.getFullYear())*12+(+f.slice(5,7)-1-now.getMonth())}else mo=0}
    if(cur.m==="espera"){box.innerHTML=`<div class="cal_head" hidden></div><div class="cal_wait" role="status"><input type="radio" name="Dia" data-name="Dia" id="d-espera" value="espera" checked hidden><p class="cal_wait-title">Ainda sem datas abertas</p><p class="cal_wait-text">${esc(cur.who)} vem ao centro em dias combinados e ainda não há datas publicadas. Escolha o período que prefere e deixe o seu contacto: ligamos assim que houver uma data.</p></div>`;
      per();A&&gsap.from($(".cal_wait",box),{y:12,autoAlpha:0,duration:.6,ease:"expo.out",clearProps:"all"});Promise.resolve().then(()=>{busy=false});return}
    mo=Math.max(0,Math.min(1,mo));
    const b0=new Date(now.getFullYear(),now.getMonth()+mo,1,12),y=b0.getFullYear(),m=b0.getMonth(),nd=new Date(y,m+1,0).getDate(),lead=(b0.getDay()+6)%7;let cs="";
    for(let i=0;i<lead;i++)cs+='<span class="cal_pad" aria-hidden="true"></span>';
    for(let d=1;d<=nd;d++){const dt=new Date(y,m,d,12),k=K(dt),w=dt.getDay();let cl,dis,lab,cls="";
      if(cur.m==="datas"){const o=cur.slots.get(k);dis=!o||dt<min;cl=!o&&(w===0||window.cmdHol.closed(k));o&&!dis&&(cls=" is-slot");
        lab=`${WD[w]}, ${d} de ${MO[m]}${o&&!dis?`, com consulta${o.manha&&!o.tarde?" de manhã":o.tarde&&!o.manha?" à tarde":""}`:", sem consulta"}`}
      else{cl=w===0||window.cmdHol.closed(k);dis=cl||dt<min;lab=`${WD[w]}, ${d} de ${MO[m]}${cl?", encerrado":w===6?", só de manhã":""}`}
      cs+=`<label class="choice${cl?" is-closed":""}${cls}${K(now)===k?" is-today":""}"><input type="radio" name="Dia" data-name="Dia" id="d-${k}" value="${k}" aria-label="${lab}"${sel===k?" checked":""}${dis?" disabled":""}><span><b>${d}</b>${cur.m!=="datas"&&w===6&&!dis?"<i></i>":""}</span></label>`}
    const leg=cur.m==="datas"?`<span><i class="is-slot"></i>Dias com consulta: ${esc(cur.who)}</span>`:'<span><i></i>Sábado: só de manhã</span><span><i class="is-closed"></i>Domingo e feriados: encerrado</span>';
    box.innerHTML=`<div class="cal_head"><div class="cal_month" aria-live="polite">${MO[m]} ${y}</div><div class="cal_navs"><button type="button" class="cal_nav" data-cal="-1" aria-label="Mês anterior"${mo<=0?" disabled":""}>${ico("M19 12H5M11 6l-6 6 6 6")}</button><button type="button" class="cal_nav" data-cal="1" aria-label="Mês seguinte"${mo>=1?" disabled":""}>${ico("M5 12h14M13 6l6 6-6 6")}</button></div></div><div class="cal_week" aria-hidden="true"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div><div class="cal_grid${cur.m==="datas"?" is-dates":""}" role="radiogroup" aria-label="Dia da consulta">${cs}</div><div class="cal_legend">${leg}</div>`;
    per();dir&&A&&gsap.from($(".cal_grid",box),{x:24*dir,autoAlpha:0,duration:.5,ease:"expo.out",clearProps:"all"});
    Promise.resolve().then(()=>{busy=false})};
  new MutationObserver(()=>{!busy&&!$(".cal_head",box)&&render()}).observe(box,{childList:true});
  box.addEventListener("click",e=>{const b=e.target.closest("[data-cal]");if(!b||b.disabled)return;e.preventDefault();mo+=+b.dataset.cal;render(+b.dataset.cal)});
  box.addEventListener("change",e=>{e.target.name==="Dia"&&(sel=e.target.value,per())});
  form.addEventListener("change",e=>{e.target.name==="Profissional"&&$(".cal_head",box)&&render()});
  box.children.length&&render();
  window.cmdHol.onUpdate(()=>{$(".cal_head",box)&&render()});
  window.cmdAgenda&&window.cmdAgenda.onUpdate(()=>{$(".cal_head",box)&&render()})}

/* ---------- Títulos: o peso cresce à volta do cursor, como na hero ---------- */
const armWt=()=>{if(!FINE||!A||!window.SplitText||!window.cmdWt)return;
  $$(".heading-style-display,.heading-style-display-1,.heading-style-h1,.heading-style-h2,.heading-style-h3,.cta_title,.case_title,.esp_title,.espd_title,.team_name,.team-card_name,.cases-index_title,.next_link-title,.cased_title,.signature_name,.percursos_title,.faq_title,.manifesto_title")
  .forEach(el=>{el.hasAttribute("data-wt")||el.closest("[data-hero],[data-book-drawer],form,[data-cookie],[data-loader]")||/BlackMango/i.test(getComputedStyle(el).fontFamily)&&window.cmdWt(el)})};
armWt();addEventListener("load",armWt);

/* ---------- Manifesto: o texto revela-se com o scroll ---------- */
const mf=$("[data-manifesto]");
if(mf){const tx=$("[data-manifesto-text]",mf);
  if(A&&tx&&window.SplitText){SplitText.create(tx,{type:"words",wordsClass:"mw",autoSplit:true,onSplit:s=>gsap.fromTo(s.words,{opacity:.5},{opacity:1,ease:"none",stagger:.1,scrollTrigger:{trigger:tx,start:"top 82%",end:"bottom 45%",scrub:.6}})});
    gsap.from($$(".manifesto_portrait",mf),{scale:.6,autoAlpha:0,duration:1,stagger:.1,ease:"expo.out",scrollTrigger:{trigger:mf,start:"top 55%",once:true}});
    gsap.from($$(".manifesto_foot > *",mf),{y:20,autoAlpha:0,duration:1,stagger:.08,ease:"expo.out",scrollTrigger:{trigger:".manifesto_foot",start:"top 90%",once:true}})}}

/* ---------- Casos: índice com pré-visualização que segue o cursor ---------- */
const ci=$("[data-cases-index]");
if(ci){const list=$("[data-cases-list]",ci),fl=$("[data-cases-filters]",ci),pv=$("[data-cases-preview]",ci),pi=$("[data-cases-preview-inner]",ci);
  const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const native=$$(".cases-index_row",list).length>0;
  const build=items=>{
    if(!native){list.innerHTML=items.map((x,i)=>`<a class="cases-index_row" role="listitem" href="${esc(x.href)}" data-f="${x.ba?"ba":"path"}"><span class="cases-index_num"></span><span class="cases-index_title">${esc(x.t)}</span><span class="cases-index_meta">${x.tags.slice(0,2).map(t=>`<span class="cases-index_tag">${esc(t)}</span>`).join("")}<span class="cases-index_dur">${esc(x.dur)}</span></span><span class="cases-index_arrow">${arrow}</span></a>`).join("")}
    const rows=$$(".cases-index_row",list);rows.forEach((r,i)=>{r.dataset.i=i;r.dataset.f||(r.dataset.f=/antes/i.test(r.dataset.formato||"")?"ba":"path")});
    const meta=rows.map(r=>({ba:r.dataset.f==="ba",f:r.dataset.f==="ba"?"Antes e depois":"Percurso",t:($(".cases-index_title",r)||{}).textContent||""}));
    const nb=meta.filter(x=>x.ba).length,np=meta.length-nb,opts=[["all","Todos",meta.length],["ba","Antes e depois",nb],["path","Percursos",np]].filter(o=>o[2]);
    fl.innerHTML=opts.map((o,i)=>`<button type="button" role="tab" class="cases-index_filter" data-filter="${o[0]}" aria-selected="${i===0}">${o[1]}<span>${o[2]}</span></button>`).join("");
    fl.addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;$$("[data-filter]",fl).forEach(x=>x.setAttribute("aria-selected",String(x===b)));const v=b.dataset.filter;
      const apply=()=>rows.forEach(r=>r.hidden=v!=="all"&&r.dataset.f!==v);
      if(A){gsap.to(rows,{autoAlpha:0,y:10,duration:.2,onComplete:()=>{apply();gsap.fromTo(rows.filter(r=>!r.hidden),{autoAlpha:0,y:16},{autoAlpha:1,y:0,duration:.7,stagger:.05,ease:"expo.out",clearProps:"opacity,visibility,transform"});window.cmdLenis&&cmdLenis.resize();ScrollTrigger.refresh()}})}else apply()});
    A&&gsap.from(rows,{y:30,autoAlpha:0,duration:1,stagger:.07,ease:"expo.out",clearProps:"opacity,visibility,transform",scrollTrigger:{trigger:list,start:"top 85%",once:true}});
    if(FINE&&A&&pv&&pi){const qx=gsap.quickTo(pv,"x",{duration:.6,ease:"power3"}),qy=gsap.quickTo(pv,"y",{duration:.6,ease:"power3"}),qr=gsap.quickTo(pv,"rotation",{duration:.8,ease:"power3"});let lx=0,cur=null;
      gsap.set(pv,{xPercent:12,yPercent:-50,scale:.8});
      const show=r=>{const x=meta[+r.dataset.i];if(cur===r)return;cur=r;rows.forEach(o=>o.classList.toggle("is-active",o===r));list.classList.add("is-hovering");
        const el=document.createElement("div");el.className="cpv "+(x.ba?"is-ba":"is-path");el.innerHTML=`${x.ba?'<span class="cpv_line"></span>':""}<span class="cpv_label">${esc(x.f)}</span><span class="cpv_title">${esc(x.t)}</span>`;pi.appendChild(el);
        gsap.fromTo(el,{clipPath:"inset(100% 0% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.7,ease:"expo.out",onComplete:()=>{while(pi.children.length>1)pi.firstChild.remove()}});
        gsap.to(pv,{autoAlpha:1,scale:1,duration:.5,ease:"expo.out",overwrite:"auto"})};
      list.addEventListener("pointermove",e=>{qx(e.clientX);qy(e.clientY);qr(Math.max(-8,Math.min(8,(e.clientX-lx)*.4)));lx=e.clientX;const r=e.target.closest(".cases-index_row");r&&show(r)});
      const hide=()=>{if(!cur&&!list.classList.contains("is-hovering"))return;cur=null;list.classList.remove("is-hovering");rows.forEach(o=>o.classList.remove("is-active"));gsap.killTweensOf(pv,"autoAlpha,scale");gsap.to(pv,{autoAlpha:0,scale:.8,duration:.35,ease:"power2.out",overwrite:"auto"})};
      list.addEventListener("pointerleave",hide);
      /* À prova de scroll: enquanto a pré-visualização está aberta, verifica a cada frame se o ponteiro ainda está sobre uma linha. */
      let px=-1,py=-1;addEventListener("pointermove",e=>{px=e.clientX;py=e.clientY},{passive:true});
      document.documentElement.addEventListener("pointerleave",hide);addEventListener("blur",hide);
      gsap.ticker.add(()=>{if(!cur)return;document.elementsFromPoint(px,py).some(e=>e!==list&&list.contains(e))||hide()})}
    armWt();window.cmdLenis&&cmdLenis.resize();G&&ScrollTrigger.refresh()};
  if(native)build();
  else fetch("/casos").then(r=>r.text()).then(h=>{const d=new DOMParser().parseFromString(h,"text/html");
    const items=$$(".case_card",d).map(c=>{const a=$("[data-slug]",c),f=($(".case_formato",c)||{}).textContent||"";return{t:($(".case_title",c)||{}).textContent||"",f:f.trim(),ba:/antes/i.test(f),tags:$$(".tag",c).map(x=>x.textContent.trim()),dur:($(".case_dur",c)||{}).textContent||"",href:a?(a.dataset.hrefBase||"/casos/")+a.dataset.slug:"/casos"}}).filter(x=>x.t).slice(0,6);
    items.length?build(items):ci.remove()}).catch(()=>ci.remove())}

/* Lenis e ScrollTrigger sempre com a altura certa */
if(window.cmdLenis){const L=window.cmdLenis;let h=0,tm;const sync=()=>{const nh=document.documentElement.scrollHeight;if(Math.abs(nh-h)>2){h=nh;L.resize()}};new ResizeObserver(()=>{clearTimeout(tm);tm=setTimeout(sync,80)}).observe(document.body);G&&ScrollTrigger.addEventListener("refresh",()=>{h=0;sync()});addEventListener("load",()=>{G?ScrollTrigger.refresh():sync()});document.fonts&&document.fonts.ready.then(()=>G&&ScrollTrigger.refresh())}
G&&ScrollTrigger.config({ignoreMobileResize:true});
/* Footer: o símbolo sobe devagar enquanto o footer entra */
const fm=$(".footer_mark");
A&&fm&&gsap.fromTo(fm.querySelector("svg")||fm,{yPercent:18},{yPercent:0,ease:"none",scrollTrigger:{trigger:fm.closest("footer")||fm.parentElement,start:"top bottom",end:"bottom bottom",scrub:.8}});
})();
