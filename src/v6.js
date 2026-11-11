/* CMD · v6
   Cursor com marquee, filtros de escolha múltipla, Equipa em grelha ou lista, parceiros em rotação. */
(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,G=!!window.gsap,A=G&&!RM;
const FINE=matchMedia("(hover: hover) and (pointer: fine)").matches;
const snd=(n,o)=>window.cmdSound&&cmdSound.play(n,o);
const refresh=()=>{window.cmdLenis&&cmdLenis.resize();window.ScrollTrigger&&ScrollTrigger.refresh()};

/* ---------- CSS que só existe com JS (o Designer fica limpo) ---------- */
/* CSS no Global Styles do Designer (css/v6.css) */

/* ---------- Rótulos do cursor onde ainda não existem ---------- */
[[".case_card","Ver caso"],[".cases-index_row","Ver caso"],[".esp_link","Explorar"],[".others_grid .team_card","Perfil"],["[data-cslider] [data-cs-slide]","Ver"]]
  .forEach(([q,t])=>$$(q).forEach(n=>n.hasAttribute("data-cursor-text")||n.setAttribute("data-cursor-text",t)));

/* ---------- Filtros: escolha múltipla, com contagem e "limpar" ---------- */
$$("[data-filter]").forEach(f0=>{if(f0.closest("[data-cases-index]"))return;
  const kind=f0.dataset.filter,sel=kind==="cases"?".case_tags .tag":".team_esp";
  const items=$$(".w-dyn-item").filter(i=>i.querySelector(sel)&&!i.closest("[data-cases-index],[data-others]"));if(!items.length)return;
  const keys=i=>$$(sel,i).map(t=>t.textContent.trim()).filter(Boolean),all=new Map();items.forEach(i=>keys(i).forEach(k=>all.set(k,(all.get(k)||0)+1)));
  /* substitui o grupo por uma cópia limpa: nenhum script antigo fica preso aos botões */
  const f=f0.cloneNode(false);f0.replaceWith(f);if(all.size<2){f.remove();return}
  const btn=(k,l,n,on)=>`<button type="button" class="filter_btn" data-k="${k.replace(/"/g,"&quot;")}" aria-pressed="${on}">${l}<sup>${n}</sup></button>`;
  f.innerHTML=btn("*","Todas",items.length,true)+[...all].sort((a,b)=>b[1]-a[1]).map(([k,n])=>btn(k,k,n,false)).join("")+'<button type="button" class="filter_clear" hidden>Limpar</button>';
  f.setAttribute("aria-label",(f.getAttribute("aria-label")||"Filtrar")+", pode escolher várias");
  const on=new Set(),bs=$$(".filter_btn",f),clr=$(".filter_clear",f);
  const apply=()=>{bs.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.k==="*"?on.size===0:on.has(b.dataset.k))));clr.hidden=on.size<2;
    const show=items.filter(i=>!on.size||keys(i).some(k=>on.has(k)));
    const run=()=>{items.forEach(i=>i.style.display=show.includes(i)?"":"none");A&&gsap.fromTo(show,{y:24,autoAlpha:0},{y:0,autoAlpha:1,duration:.8,stagger:.04,ease:"expo.out",clearProps:"transform,opacity,visibility"});refresh()};
    A?gsap.to(items.filter(i=>i.style.display!=="none"),{autoAlpha:0,y:-8,duration:.22,onComplete:run}):run()};
  f.addEventListener("click",e=>{const c=e.target.closest(".filter_clear");if(c){on.clear();apply();return}
    const b=e.target.closest(".filter_btn");if(!b)return;const k=b.dataset.k;if(k==="*"){if(!on.size)return;on.clear()}else on.has(k)?on.delete(k):on.add(k);apply()})});

/* ---------- Equipa: grelha (por defeito) ou lista com retrato que segue o cursor ---------- */
const holder=$("[data-team-holder]");
if(holder){const grid=$(".team_grid",holder),fl=$("[data-filter=team]")||holder.previousElementSibling;
  const bar=document.createElement("div");bar.className="team_bar";fl&&fl.parentElement===holder.parentElement?(fl.before(bar),bar.appendChild(fl)):holder.before(bar);
  const vt=document.createElement("div");vt.className="vt";vt.setAttribute("role","group");vt.setAttribute("aria-label","Ver como");
  vt.innerHTML='<span class="vt_ind"></span><button type="button" class="vt_btn" data-tv="grid" aria-pressed="true">Grelha</button><button type="button" class="vt_btn" data-tv="list" aria-pressed="false">Lista</button>';bar.appendChild(vt);
  const ind=$(".vt_ind",vt),vb=$$(".vt_btn",vt);holder.dataset.teamView="grid";
  const place=(b,anim)=>{const p={x:b.offsetLeft,w:b.offsetWidth};A&&anim?gsap.to(ind,{x:p.x,width:p.w,duration:.55,ease:"expo.out"}):G?gsap.set(ind,{x:p.x,width:p.w}):Object.assign(ind.style,{transform:`translateX(${p.x}px)`,width:p.w+"px"})};
  place(vb[0]);document.fonts&&document.fonts.ready.then(()=>place(vb.find(b=>b.getAttribute("aria-pressed")==="true")));
  addEventListener("resize",()=>place(vb.find(b=>b.getAttribute("aria-pressed")==="true")));
  let tl=null;const go=b=>{const v=b.dataset.tv;if(holder.dataset.teamView===v)return;snd("tick");place(b,true);vb.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    /* Troca grelha/lista: as fotografias fecham por máscara (ou as linhas saem), troca-se o layout,
       e o novo estado entra por máscara e por linhas. Nada é escalado, por isso nada deforma. */
    if(!A){holder.dataset.teamView=v;refresh();return}
    const vis=()=>[...grid.children].filter(i=>i.style.display!=="none");
    tl&&tl.progress(1).kill();
    const items=vis(),photos=items.map(i=>$(".team_photo",i)).filter(Boolean),metas=items.map(i=>$$(".team_meta,.team_esp",i)).flat();
    tl=gsap.timeline({onComplete:()=>{tl=null;refresh()}});
    if(v==="list"){
      tl.to(photos,{clipPath:"inset(0% 0% 100% 0% round 18px)",duration:.45,stagger:.035,ease:"expo.in"},0)
        .to(metas,{autoAlpha:0,y:-8,duration:.25,stagger:.02,ease:"power2.in"},0)
        .add(()=>{holder.dataset.teamView=v;gsap.set([...photos,...metas],{clearProps:"clipPath,opacity,visibility,transform"})})
        .fromTo(items,{y:18,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.045,ease:"expo.out",clearProps:"transform,opacity,visibility",immediateRender:false})}
    else{
      tl.to(items,{autoAlpha:0,y:-10,duration:.25,stagger:.02,ease:"power2.in"},0)
        .add(()=>{holder.dataset.teamView=v;gsap.set(items,{clearProps:"opacity,visibility,transform"});gsap.set(photos,{clipPath:"inset(100% 0% 0% 0% round 18px)"});gsap.set(metas,{autoAlpha:0,y:12})})
        .to(photos,{clipPath:"inset(0% 0% 0% 0% round 18px)",duration:.9,stagger:.06,ease:"expo.out",clearProps:"clipPath"})
        .to(metas,{autoAlpha:1,y:0,duration:.6,stagger:.03,ease:"expo.out",clearProps:"opacity,visibility,transform"},"<.25")}};
  vb.forEach(b=>b.addEventListener("click",()=>go(b)));
  /* pré-visualização na lista */
  if(FINE&&A&&grid){const pv=document.createElement("div");pv.className="tpv";pv.setAttribute("aria-hidden","true");document.body.appendChild(pv);
    const qx=gsap.quickTo(pv,"x",{duration:.6,ease:"power3"}),qy=gsap.quickTo(pv,"y",{duration:.6,ease:"power3"}),qr=gsap.quickTo(pv,"rotation",{duration:.8,ease:"power3"});let cur=null,lx=0;
    gsap.set(pv,{xPercent:14,yPercent:-50,scale:.85});
    grid.addEventListener("pointermove",e=>{if(holder.dataset.teamView!=="list")return;qx(e.clientX);qy(e.clientY);qr(Math.max(-8,Math.min(8,(e.clientX-lx)*.4)));lx=e.clientX;
      const it=e.target.closest(".team_grid>*");if(!it||it===cur)return;cur=it;$$(".team_grid>*").forEach(x=>x.classList.toggle("is-active",x===it));grid.classList.add("is-hovering");
      const src=($(".team_img",it)||{}).currentSrc||($(".team_img",it)||{}).src;if(src){const im=new Image();im.src=src;im.alt="";pv.appendChild(im);
        gsap.fromTo(im,{clipPath:"inset(100% 0% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.7,ease:"expo.out",onComplete:()=>{while(pv.children.length>1)pv.firstChild.remove()}});gsap.to(pv,{autoAlpha:1,scale:1,duration:.5,ease:"expo.out"})}
      else gsap.to(pv,{autoAlpha:0,duration:.3})});
    grid.addEventListener("pointerleave",()=>{cur=null;grid.classList.remove("is-hovering");$$(".team_grid>*").forEach(x=>x.classList.remove("is-active"));gsap.to(pv,{autoAlpha:0,scale:.85,duration:.4})})}}

/* ---------- Parceiros e acordos: grelha em que os nomes vão rodando ---------- */
$$("[data-logo-wall]").forEach(root=>{const src=$$("[data-lw-item]",root);if(!src.length)return;
  const data=src.map(n=>({name:($("[data-lw-name]",n)||n).textContent.trim(),kind:($("[data-lw-kind]",n)||{}).textContent||"",img:(($("img",n)||{}).getAttribute&&$("img",n).getAttribute("src"))||""})).filter(d=>d.name);
  const list=$("[data-lw-list]",root)||src[0].parentElement;list.hidden=true;
  const w=document.createElement("div");w.className="lw";list.after(w);
  const cols=()=>innerWidth<480?2:innerWidth<992?3:4;
  const item=d=>{const e=document.createElement("div");e.className="lw_item";e.innerHTML=(d.kind?`<span class="lw_kind">${d.kind}</span>`:"")+(d.img&&!/placeholder/i.test(d.img)?`<img src="${d.img}" alt="${d.name}" loading="lazy">`:`<span class="lw_name">${d.name}</span>`);return e};
  let cells=[],pool=[],tl;
  const build=()=>{tl&&tl.kill();w.innerHTML="";const n=Math.min(data.length,cols()*2);const sh=[...data].sort(()=>Math.random()-.5);
    cells=Array.from({length:n},(_,i)=>{const c=document.createElement("div");c.className="lw_cell";c.appendChild(item(sh[i]));w.appendChild(c);return c});pool=sh.slice(n);
    if(!A||!pool.length)return;const order=cells.map((_,i)=>i).sort(()=>Math.random()-.5);let k=0;
    tl=gsap.timeline({repeat:-1,repeatDelay:1.6});tl.call(()=>{const c=cells[order[k++%order.length]],cur=$(".lw_item",c),d=pool.shift(),inc=item(d);
      pool.push(data.find(x=>x.name===($(".lw_name",cur)||$("img",cur)||{}).textContent||x.name===(($("img",cur)||{}).alt))||d);
      c.appendChild(inc);gsap.fromTo(inc,{yPercent:50,autoAlpha:0},{yPercent:0,autoAlpha:1,duration:.9,delay:.1,ease:"expo.inOut"});gsap.to(cur,{yPercent:-50,autoAlpha:0,duration:.9,ease:"expo.inOut",onComplete:()=>cur.remove()})})};
  build();let lc=cols();addEventListener("resize",()=>{cols()!==lc&&(lc=cols(),build())});
  if(window.ScrollTrigger&&A)ScrollTrigger.create({trigger:root,start:"top bottom",end:"bottom top",onToggle:s=>tl&&(s.isActive?tl.play():tl.pause())});
  document.addEventListener("visibilitychange",()=>tl&&(document.hidden?tl.pause():tl.play()))});
/* ---------- Galeria em cascata: o slide ativo abre ao centro, os vizinhos ficam em tiras.
   Avança sozinha (a linha é o temporizador), arrasta-se com o rato ou o dedo, setas e teclado. ---------- */
$$("[data-cslider]").forEach(vp=>{const slides=$$("[data-cs-slide]",vp);const n=slides.length;if(n<2||!G)return;
  const BP=[[479,.76,.08],[767,.7,.09],[991,.62,.1],[1e9,.56,.12]],GAP=8,DUR=5.5;let act=0,W=0,cen={},wid={};
  const meas=()=>{const vw=vp.offsetWidth,b=BP.find(x=>innerWidth<=x[0]),aw=vw*b[1],sw=vw*b[2],fw=Math.max(0,(vw-aw-2*sw-4*GAP)/2);W=aw;
    const sl=[[-2,fw],[-1,sw],[0,aw],[1,sw],[2,fw]];let x=(vw-(aw+2*sw+2*fw+4*GAP))/2;sl.forEach(([k,w],i)=>{cen[k]=x+w/2;wid[k]=w;x+=w+GAP});
    cen[-3]=cen[-2]-fw-GAP;wid[-3]=fw;cen[3]=cen[2]+fw+GAP;wid[3]=fw;slides.forEach(s=>s.style.width=W+"px")};
  const props=o=>{const c=Math.max(-3,Math.min(3,o));return{x:cen[c]-W/2,xPercent:0,"--clip":Math.max(0,(W-wid[c])/2),zIndex:10-Math.abs(c)}};
  const arr='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /* a navegação existe no Designer (.cs_nav a seguir à galeria); só é criada aqui se faltar */
  let nav=vp.parentElement.querySelector(".cs_nav");
  if(!nav){nav=document.createElement("div");nav.className="cs_nav";nav.innerHTML=`<span class="cs_count" aria-live="polite"></span><span class="cs_line"><i></i></span><span class="cs_btns"><button type="button" class="cs_btn is-prev" aria-label="Fotografia anterior">${arr}</button><button type="button" class="cs_btn" aria-label="Fotografia seguinte">${arr}</button></span>`;vp.after(nav)}
  const cnt=$(".cs_count",nav),ln=$(".cs_line",nav);$$("[data-drag-progress]").forEach(p=>p.parentElement.classList.add("cs_hide"));
  vp.setAttribute("aria-roledescription","carousel");slides.forEach((s,i)=>{s.setAttribute("aria-roledescription","slide");s.setAttribute("aria-label",`${i+1} de ${n}`)});
  const off=i=>{let d=i-act;const h=n/2;d>h&&(d-=n);d<-h&&(d+=n);return d},prev=slides.map(()=>null);
  const tm={t:0};let tw=null,inView=false,hover=false;
  const paint=()=>ln&&ln.style.setProperty("--p",(act+tm.t)/n);
  const lay=anim=>{slides.forEach((s,i)=>{const o=off(i),p=props(o);if(A&&anim&&prev[i]!==null&&Math.abs(o-prev[i])>2)gsap.set(s,props(o>0?3:-3));prev[i]=o;s.dataset.status=o===0?"active":"inactive";s.setAttribute("aria-hidden",String(o!==0));
      A&&anim?gsap.to(s,{...p,duration:1.05,ease:"expo.inOut",overwrite:true}):gsap.set(s,p)});
    cnt&&(cnt.textContent=String(act+1).padStart(2,"0")+" / "+String(n).padStart(2,"0"))};
  const timer=()=>{tw&&tw.kill();tm.t=0;paint();if(!A||!inView||hover)return;
    tw=gsap.to(tm,{t:1,duration:DUR,ease:"none",onUpdate:paint,onComplete:()=>go(act+1)})};
  const go=i=>{i=(i%n+n)%n;if(i===act){timer();return}act=i;lay(true);timer()};
  meas();lay(false);paint();
  const pb=$(".cs_btn.is-prev",nav),nb=$(".cs_btn:not(.is-prev)",nav);pb&&pb.addEventListener("click",()=>go(act-1));nb&&nb.addEventListener("click",()=>go(act+1));
  addEventListener("keydown",e=>{const r=vp.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;e.key==="ArrowRight"&&go(act+1);e.key==="ArrowLeft"&&go(act-1)});
  /* arrastar: o conjunto segue o dedo e decide ao largar */
  let d=null,moved=false;
  vp.style.touchAction="pan-y";
  vp.addEventListener("pointerdown",e=>{if(e.button)return;d={x:e.clientX,y:e.clientY,lock:null,id:e.pointerId};moved=false;tw&&tw.pause()},{passive:true});
  addEventListener("pointercancel",()=>{if(!d)return;d=null;vp.classList.remove("is-drag");gsap.to(slides,{xPercent:0,duration:.6,ease:"power3.out"});tw?tw.resume():timer()});
  addEventListener("pointermove",e=>{if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(d.lock===null&&Math.abs(dx)+Math.abs(dy)>6)d.lock=Math.abs(dx)>Math.abs(dy);if(!d.lock)return;moved=true;
    vp.classList.add("is-drag");gsap.to(slides,{xPercent:dx/W*18,duration:.3,ease:"power3.out",overwrite:"auto"})},{passive:true});
  addEventListener("pointerup",e=>{if(!d)return;const dx=e.clientX-d.x,lock=d.lock;d=null;vp.classList.remove("is-drag");gsap.to(slides,{xPercent:0,duration:.6,ease:"power3.out"});
    if(lock&&Math.abs(dx)>40)go(act+(dx<0?1:-1));else tw?tw.resume():timer()});
  slides.forEach((s,i)=>s.addEventListener("click",e=>{if(moved){e.preventDefault();return}go(i)}));
  vp.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse"){hover=true;tw&&tw.pause()}});vp.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"){hover=false;tw?tw.resume():timer()}});
  new IntersectionObserver(es=>{inView=es[0].isIntersecting;inView?(tw?tw.resume():timer()):tw&&tw.pause()},{threshold:.3}).observe(vp);
  let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{meas();lay(false)},120)})});

})();
