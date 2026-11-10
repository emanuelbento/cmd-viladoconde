/* CMD · v7
   Transição de página em fios, avaliações com arrastar e avanço automático, seta no "seguinte",
   acordos com logos, correções de recorte em títulos e no menu. */
(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,G=!!window.gsap,A=G&&!RM;
const snd=(n,o)=>window.cmdSound&&cmdSound.play(n,o);
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const css=`
.nav_link-text::after{top:calc(100% + 1.1rem)}
.nav_link:hover .nav_link-text{transform:translateY(calc(-100% - 1.1rem))}
.split-mask-line-mask{overflow:visible!important;clip-path:inset(-.14em -100vw -.2em -100vw)}
[data-sig-tip]{fill:var(--_base-color---brand--coral,#ea6f4e);transform-box:fill-box;transform-origin:center;transform:scale(0);transition:transform .7s cubic-bezier(.34,1.56,.64,1)}
[data-sig].is-complete [data-sig-tip]{transform:scale(1)}
.curtain_mono{display:none!important}
h1,h2,.heading-style-h1,.heading-style-h2,.heading-style-h3{text-wrap:balance}
.curtain_cv{position:absolute;inset:0;width:100%;height:100%;display:block}
.next_arrow{flex:none;width:3.25rem;height:3.25rem;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1px rgba(106,68,49,.18);color:var(--_base-color---brand--tinta,#2a1a13);transition:background-color .45s,color .45s,box-shadow .45s,transform .7s cubic-bezier(.16,1,.3,1)}
.next_arrow svg{width:18px;height:18px}
.next_link:hover .next_arrow{background:var(--_base-color---brand--borgonha,#7d2b1f);color:#fff;box-shadow:none;transform:translateX(.35rem)}
.next_link:hover .next_link-title{transform:translateX(-.6rem)}
.lw_item img{filter:none;opacity:.92;max-width:72%;max-height:34%}
.acc_logos{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.25rem}
.acc_logos span{display:grid;place-items:center;height:3rem;padding:0 1rem;border-radius:12px;background:rgba(255,253,251,.08)}
.acc_logos img{height:1.15rem;width:auto;filter:brightness(0) invert(1);opacity:.85}
.acc_more{margin-top:.5rem;color:inherit;font-size:.875rem;font-weight:600;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px}
[data-reviews] [data-rv-list]{overflow:visible}
[data-reviews] .w-dyn-list{overflow:hidden;margin-right:calc(50% - 50vw);padding-right:calc(50vw - 50%)}
[data-reviews] .w-dyn-items{display:flex;gap:1.25rem;width:max-content;cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none}
[data-reviews] .w-dyn-items.is-drag{cursor:grabbing}
[data-rv-item]{width:min(25rem,80vw);flex:none;display:flex;flex-direction:column;gap:1rem;min-height:22rem;padding:2rem;border-radius:18px;background:var(--_base-color---support--marfim,#f3eae4);transition:background-color .5s,color .5s}
[data-rv-item].is-current{background:var(--_base-color---brand--tinta,#2a1a13);color:var(--_base-color---support--marfim,#f3eae4)}
[data-rv-text]{font-family:var(--_typography---font--primary);font-weight:300;font-size:clamp(1.3rem,1.7vw,1.6rem);line-height:1.22;text-wrap:pretty}
[data-rv-text]::before{content:"\\201C";display:block;font-family:Georgia,"Times New Roman",serif;font-size:3em;line-height:.8;height:.5em;color:var(--_base-color---brand--coral,#ea6f4e)}
.rv_foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:1rem}
[data-rv-name]{font-size:.875rem;font-weight:600}
.rv_stars{display:flex;gap:4px}.rv_stars i{width:6px;height:6px;border-radius:50%;background:var(--_base-color---brand--coral,#ea6f4e)}
[data-rv-esp],[data-rv-src]{display:none}
.rv_meta{font-size:.75rem;opacity:.6;margin-top:.15rem}
.rv_nav{display:flex;align-items:center;gap:1.5rem;margin-top:2rem}
.rv_rating{display:flex;align-items:baseline;gap:.6rem}
.rv_rating b{font-family:var(--_typography---font--primary);font-weight:300;font-size:2.4rem;line-height:1}
`;
const st=document.createElement("style");st.id="cmd-v7";st.textContent=css;document.head.appendChild(st);

/* ---------- Transição de página: os fios da hero atravessam o ecrã e engrossam até o cobrir ---------- */
(()=>{let cv,cx,bg,W,H,dpr;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const setup=u=>{if(cv&&cv.isConnected)return;cv=document.createElement("canvas");cv.className="curtain_cv";cv.setAttribute("aria-hidden","true");u.prepend(cv);cx=cv.getContext("2d");
    bg=getComputedStyle(u).backgroundColor;if(!bg||bg==="rgba(0, 0, 0, 0)")bg="#f3eae4"};
  const size=()=>{dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)};
  const coral=[234,111,78];
  const parse=c=>{const m=c.match(/[\d.]+/g)||[243,234,228];return m.slice(0,3).map(Number)};
  window.cmdCurtain=(u,dir,p)=>{if(!u)return;setup(u);if(cv.width!==Math.round(innerWidth*Math.min(devicePixelRatio||1,2)))size();
    u.style.background="transparent";u.style.clipPath="none";
    const q=dir==="in"?p:1-p,N=W<768?24:38,h=H/N,base=parse(bg),D=.4;
    cx.clearRect(0,0,W,H);if(q<=0){if(dir!=="in"){u.style.background=""}return}
    const A=h*1.6*(1-ease(Math.min(1,q*1.15))),mid=(N-1)/2;
    for(let i=0;i<N;i++){const d=Math.abs(i-mid)/mid*D,k=ease(Math.min(1,Math.max(0,(q-d)/(1-D))));if(k<=0)continue;
      const y0=(i+.5)*h,th=1+(h*1.25+2*A)*k,ph=i*.55+q*3.2,c=k<.35?coral.map((v,j)=>Math.round(v+(base[j]-v)*(k/.35))):base;
      cx.strokeStyle=`rgb(${c[0]},${c[1]},${c[2]})`;cx.lineWidth=th;cx.lineCap="round";cx.beginPath();
      for(let x=-20;x<=W+20;x+=18){const y=y0+A*Math.sin(x*.006+ph)*Math.sin(q*Math.PI*.5+i*.2);x===-20?cx.moveTo(x,y):cx.lineTo(x,y)}
      cx.stroke()}};
})();

/* imagens dentro da galeria em cascata carregam já: estão recortadas, o lazy load não as vê */
$$("[data-cslider] img").forEach(i=>{i.loading="eager";i.decoding="async"});

/* ---------- "Seguinte": seta explícita ---------- */
$$(".next_link").forEach(a=>{if($(".next_arrow",a))return;const s=document.createElement("span");s.className="next_arrow";s.innerHTML=arrow;a.appendChild(s)});

/* ---------- Contactos: o cartão de acordos mostra os logos e aponta para a lista ---------- */
const accT=$$("h3,.book_card-title").find(h=>/acordos/i.test(h.textContent));
if(accT){const card=accT.closest(".book_card")||accT.parentElement,logos=$$("[data-lw-item] img").map(i=>i.getAttribute("src")).filter(s=>s&&!/placeholder/i.test(s)).slice(0,6);
  $$("p",card).forEach(p=>{/fornecer/i.test(p.textContent)&&(p.textContent="Seguros, subsistemas e parceiros de financiamento com acordo com o centro.")});
  $$(".tag,[class*=badge]",card).forEach(t=>/confirmar/i.test(t.textContent)&&t.remove());
  if(logos.length){const r=document.createElement("div");r.className="acc_logos";r.innerHTML=logos.map(s=>`<span><img src="${s}" alt="" loading="lazy"></span>`).join("");card.appendChild(r)}
  const tgt=$("#parceiros-title");if(tgt){const l=document.createElement("a");l.className="acc_more";l.href="#parceiros-title";l.textContent="Ver a lista completa";card.appendChild(l);
    l.addEventListener("click",e=>{e.preventDefault();window.cmdLenis?cmdLenis.scrollTo(tgt,{offset:-120}):tgt.scrollIntoView({behavior:"smooth"})})}}

/* ---------- Avaliações: arrastar, setas e avanço automático ---------- */
$$("[data-reviews]").forEach(sec=>{const row=$("[data-rv-list] .w-dyn-items",sec),items=$$("[data-rv-item]",sec);if(!row||!items.length)return;
  const p=$(".section-head_component p",sec);p&&(p.textContent="5,0 em 53 avaliações no Google. Excertos escritos pelos próprios pacientes.");
  items.forEach(it=>{const nm=$("[data-rv-name]",it),esp=($("[data-rv-esp]",it)||{}).textContent||"",src=($("[data-rv-src]",it)||{}).textContent||"Google";
    const f=document.createElement("div");f.className="rv_foot";f.innerHTML=`<div><div class="rv_who"></div><div class="rv_meta">${[src,esp].filter(Boolean).join(" · ")}</div></div><span class="rv_stars" aria-label="5 estrelas"><i></i><i></i><i></i><i></i><i></i></span>`;
    nm&&$(".rv_who",f).appendChild(nm);it.appendChild(f)});
  const nav=document.createElement("div");nav.className="rv_nav cs_nav";
  nav.innerHTML=`<span class="cs_count" aria-live="polite"></span><span class="cs_line"><i></i></span><span class="cs_btns"><button type="button" class="cs_btn is-prev" aria-label="Avaliação anterior">${arrow}</button><button type="button" class="cs_btn" aria-label="Avaliação seguinte">${arrow}</button></span>`;
  ($("[data-rv-list]",sec)||row).after(nav);
  const n=items.length,cnt=$(".cs_count",nav),ln=$(".cs_line",nav);let i=0,x=0,timer=null,inView=false,hover=false;
  const maxX=()=>Math.max(0,row.scrollWidth-row.parentElement.clientWidth);
  const posOf=k=>Math.min(items[k].offsetLeft-items[0].offsetLeft,maxX());
  const set=(k,anim=true)=>{i=(k+n)%n;x=-posOf(i);items.forEach((it,j)=>it.classList.toggle("is-current",j===i));
    cnt.textContent=String(i+1).padStart(2,"0")+" / "+String(n).padStart(2,"0");ln.style.setProperty("--p",(i+1)/n);
    G?gsap.to(row,{x,duration:anim&&A?.9:0,ease:"expo.out",overwrite:true}):row.style.transform=`translateX(${x}px)`};
  const auto=()=>{clearTimeout(timer);if(!inView||hover||RM)return;timer=setTimeout(()=>{set(i+1);auto()},5200)};
  $(".is-prev",nav).addEventListener("click",()=>{snd("tick");set(i-1);auto()});$(".cs_btn:not(.is-prev)",nav).addEventListener("click",()=>{snd("tick");set(i+1);auto()});
  sec.addEventListener("pointerenter",e=>{e.pointerType==="mouse"&&(hover=true,clearTimeout(timer))});sec.addEventListener("pointerleave",()=>{hover=false;auto()});
  /* arrastar com rato ou dedo */
  let d=null;row.addEventListener("pointerdown",e=>{d={sx:e.clientX,sy:e.clientY,x0:x,lx:e.clientX,v:0,t:performance.now(),lock:null};clearTimeout(timer)});
  addEventListener("pointermove",e=>{if(!d)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(d.lock===null&&Math.abs(dx)+Math.abs(dy)>6)d.lock=Math.abs(dx)>Math.abs(dy);if(!d.lock)return;
    row.classList.add("is-drag");const now=performance.now();d.v=(e.clientX-d.lx)/Math.max(1,now-d.t);d.lx=e.clientX;d.t=now;
    const nx=Math.max(-maxX()-80,Math.min(80,d.x0+dx));G?gsap.set(row,{x:nx}):row.style.transform=`translateX(${nx}px)`},{passive:true});
  addEventListener("pointerup",e=>{if(!d)return;const dx=e.clientX-d.sx,v=d.v,lock=d.lock;d=null;row.classList.remove("is-drag");if(!lock){auto();return}
    const target=-(x+dx)+(-v*260);let best=0,bd=1e9;items.forEach((_,k)=>{const dd=Math.abs(posOf(k)-target);dd<bd&&(bd=dd,best=k)});snd("tick");set(best);auto()});
  row.addEventListener("click",e=>{Math.abs((G?gsap.getProperty(row,"x"):0)-x)>4&&e.preventDefault()},true);
  new IntersectionObserver(es=>{inView=es[0].isIntersecting;inView?auto():clearTimeout(timer)},{threshold:.35}).observe(sec);
  addEventListener("resize",()=>set(i,false));set(0,false);
  A&&window.ScrollTrigger&&gsap.from(items,{y:40,autoAlpha:0,duration:1.1,stagger:.08,ease:"expo.out",clearProps:"opacity,visibility,transform",scrollTrigger:{trigger:sec,start:"top 75%",once:true}})});
})();
