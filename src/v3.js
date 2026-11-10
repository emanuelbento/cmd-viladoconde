(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,G=!!(window.gsap&&window.ScrollTrigger),A=G&&!RM;
const FINE=matchMedia("(hover: hover) and (pointer: fine)").matches;
G&&gsap.registerPlugin(...[ScrollTrigger,window.SplitText].filter(Boolean));
const SC=[0,2,4,7,9,12,14,16],pit=i=>Math.pow(2,SC[i%8]/12);

/* ---------- Som: desligado por defeito. Um só ficheiro com os cliques da roda de uma máquina de lavar,
   tocados com pequenas variações de velocidade para nunca soarem iguais. ---------- */
const S=(()=>{let ctx=null,out=null,buf=null,on=false,loading=null;
  try{on=localStorage.getItem("cmd_sound")==="1"}catch(e){}
  const URL_=(window.CMD_BASE||"")+"audio/clicks.mp3";
  /* início e duração de cada clique no ficheiro */
  const CL=[[0,.13],[.25,.13],[.5,.13],[.75,.13]],RUN=[1,.52];
  const init=()=>{if(ctx)return ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC;
    const hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=140;
    const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=9500;
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;
    out=ctx.createGain();out.gain.value=1;out.connect(hp);hp.connect(lp);lp.connect(comp);comp.connect(ctx.destination);load();return ctx};
  const load=()=>loading||(loading=fetch(URL_).then(r=>r.arrayBuffer()).then(a=>new Promise((res,rej)=>ctx.decodeAudioData(a,res,rej))).then(b=>{buf=b}).catch(()=>{loading=null}));
  const hit=(seg,t,{rate=1,v=.8}={})=>{if(!buf)return;const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=buf;
    src.playbackRate.value=rate*(1+(Math.random()-.5)*.05);g.gain.value=v;src.connect(g);g.connect(out);src.start(t,seg[0],seg[1]/src.playbackRate.value)};
  /* a escala de tons das linhas passa a ser uma variação curta de velocidade */
  const R=p=>Math.pow(p||1,.32);
  const lib={
    arc:(t,o)=>hit(CL[2],t,{rate:R(o.p)*.95,v:.85}),
    line:(t,o)=>hit(CL[1],t,{rate:R(o.p),v:.8*(o.v||1)}),
    end:(t)=>hit(RUN,t,{rate:1,v:.7}),
    tick:(t,o)=>hit(CL[0],t,{rate:(o.p||1)*1.02,v:.6*(o.v||1)}),
    page:(t)=>{hit(CL[3],t,{rate:.82,v:.9});hit(CL[0],t+.11,{rate:.9,v:.45})},
    on:(t)=>{hit(CL[0],t,{v:.8});hit(CL[1],t+.09,{rate:1.08,v:.7});hit(CL[2],t+.18,{rate:1.16,v:.6})}};
  const gap={line:.09,arc:.07,tick:.045,end:1,page:.5,on:.3},next={};
  /* em vez de cortar sons seguidos, espaça-os: nenhum ponto fica sem som */
  const play=(n,o={})=>{if(!on||!lib[n]||!init())return;ctx.state==="suspended"&&ctx.resume();if(!buf){load().then(()=>n==="on"&&play(n,o));return}
    const now=ctx.currentTime+.005,t=Math.max(now,next[n]||0);if(t-now>.5)return;next[n]=t+(gap[n]||.08);lib[n](t,o)};
  const sync=()=>$$("[data-sound-toggle]").forEach(b=>{b.setAttribute("aria-pressed",String(on));b.setAttribute("aria-label",on?"Desativar som":"Ativar som")});
  const set=v=>{on=v;try{localStorage.setItem("cmd_sound",v?"1":"0")}catch(e){}sync();if(v){init();ctx&&ctx.state==="suspended"&&ctx.resume();play("on")}};
  document.addEventListener("click",e=>{const b=e.target.closest("[data-sound-toggle]");b&&(e.preventDefault(),set(!on))});
  /* com o som ligado, o ficheiro carrega à primeira interação */
  on&&addEventListener("pointerdown",()=>init(),{once:true,passive:true});
  sync();return{play,set,get on(){return on}}})();
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

/* ---------- Marcação: calendário mensal (3 meses, domingo e feriados fechados, sábado só manhã) ---------- */
const box=$("[data-opt-date]");
if(box){const HOL=["2026-12-01","2026-12-08","2026-12-25","2027-01-01","2027-03-26","2027-04-25","2027-05-01","2027-05-27","2027-06-10","2027-06-24","2027-08-15","2027-10-05","2027-11-01","2027-12-01","2027-12-08","2027-12-25"],
  WD=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],MO=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],
  K=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
  ico=d=>`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let mo=0,sel=null,busy=false;
  const sat=()=>{const c=box.querySelector('input[name="Dia"]:checked'),s=c&&new Date(c.value+"T12:00:00").getDay()===6,t=$("#per-tarde"),m=$("[data-per-manha]"),pt=$("[data-per-tarde]");if(t){t.disabled=!!s;s&&t.checked&&(t.checked=false)}m&&(m.textContent=s?"9h30 às 13h":"9h30 às 12h");pt&&(pt.textContent=s?"Encerrado ao sábado":"14h30 às 19h")};
  const render=(dir=0)=>{busy=true;const now=new Date;now.setHours(12,0,0,0);const min=new Date(now);min.setDate(min.getDate()+1);mo=Math.max(0,Math.min(2,mo));
    const b0=new Date(now.getFullYear(),now.getMonth()+mo,1,12),y=b0.getFullYear(),m=b0.getMonth(),nd=new Date(y,m+1,0).getDate(),lead=(b0.getDay()+6)%7;let cs="";
    for(let i=0;i<lead;i++)cs+='<span class="cal_pad" aria-hidden="true"></span>';
    for(let d=1;d<=nd;d++){const dt=new Date(y,m,d,12),k=K(dt),w=dt.getDay(),cl=w===0||HOL.includes(k),dis=cl||dt<min,lab=`${WD[w]}, ${d} de ${MO[m]}${cl?", encerrado":w===6?", só de manhã":""}`;
      cs+=`<label class="choice${cl?" is-closed":""}${K(now)===k?" is-today":""}"><input type="radio" name="Dia" data-name="Dia" id="d-${k}" value="${k}" aria-label="${lab}"${sel===k?" checked":""}${dis?" disabled":""}><span><b>${d}</b>${w===6&&!dis?"<i></i>":""}</span></label>`}
    box.innerHTML=`<div class="cal_head"><div class="cal_month" aria-live="polite">${MO[m]} ${y}</div><div class="cal_navs"><button type="button" class="cal_nav" data-cal="-1" aria-label="Mês anterior"${mo<=0?" disabled":""}>${ico("M19 12H5M11 6l-6 6 6 6")}</button><button type="button" class="cal_nav" data-cal="1" aria-label="Mês seguinte"${mo>=2?" disabled":""}>${ico("M5 12h14M13 6l6 6-6 6")}</button></div></div><div class="cal_week" aria-hidden="true"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div><div class="cal_grid" role="radiogroup" aria-label="Dia da consulta">${cs}</div><div class="cal_legend"><span><i></i>Sábado: só de manhã</span><span><i class="is-closed"></i>Domingo e feriados: encerrado</span></div>`;
    sat();dir&&A&&gsap.from($(".cal_grid",box),{x:24*dir,autoAlpha:0,duration:.5,ease:"expo.out",clearProps:"all"});
    Promise.resolve().then(()=>{busy=false})};
  new MutationObserver(()=>{!busy&&!$(".cal_head",box)&&render()}).observe(box,{childList:true});
  box.addEventListener("click",e=>{const b=e.target.closest("[data-cal]");if(!b||b.disabled)return;e.preventDefault();mo+=+b.dataset.cal;render(+b.dataset.cal)});
  box.addEventListener("change",e=>{e.target.name==="Dia"&&(sel=e.target.value,sat())});
  box.children.length&&render()}

/* ---------- Títulos: o peso cresce à volta do cursor, como na hero ---------- */
const armWt=()=>{if(!FINE||!A||!window.SplitText||!window.cmdWt)return;
  $$(".heading-style-display,.heading-style-display-1,.heading-style-h1,.heading-style-h2,.heading-style-h3,.cta_title,.case_title,.esp_title,.espd_title,.team_name,.team-card_name,.cases-index_title,.next_link-title,.cased_title,.signature_name,.percursos_title,.faq_title,.manifesto_title")
  .forEach(el=>{el.hasAttribute("data-wt")||el.closest("[data-hero],[data-book-drawer],form,[data-cookie],[data-loader]")||/BlackMango/i.test(getComputedStyle(el).fontFamily)&&window.cmdWt(el)})};
armWt();addEventListener("load",armWt);

/* ---------- Manifesto: o texto revela-se com o scroll ---------- */
const mf=$("[data-manifesto]");
if(mf){const tx=$("[data-manifesto-text]",mf);
  if(A&&tx&&window.SplitText){SplitText.create(tx,{type:"words",wordsClass:"mw",autoSplit:true,onSplit:s=>gsap.fromTo(s.words,{opacity:.14},{opacity:1,ease:"none",stagger:.1,scrollTrigger:{trigger:tx,start:"top 82%",end:"bottom 45%",scrub:.6}})});
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
        gsap.to(pv,{autoAlpha:1,scale:1,duration:.5,ease:"expo.out"})};
      list.addEventListener("pointermove",e=>{qx(e.clientX);qy(e.clientY);qr(Math.max(-8,Math.min(8,(e.clientX-lx)*.4)));lx=e.clientX;const r=e.target.closest(".cases-index_row");r&&show(r)});
      list.addEventListener("pointerleave",()=>{cur=null;list.classList.remove("is-hovering");rows.forEach(o=>o.classList.remove("is-active"));gsap.to(pv,{autoAlpha:0,scale:.8,duration:.4,ease:"power2.out"})})}
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
