/* CMD · v7
   Transição de página em fios, avaliações com arrastar e avanço automático, seta no "seguinte",
   acordos com logos, correções de recorte em títulos e no menu. */
(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,G=!!window.gsap,A=G&&!RM;
const snd=(n,o)=>window.cmdSound&&cmdSound.play(n,o);
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* CSS no Global Styles do Designer (css/v7.css) */

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
    /* como na entrada da hero: cada fio desenha-se ao longo do ecrã, depois engrossa até cobrir.
       À saída faz o caminho inverso e recolhe para a direita. */
    const q=dir==="in"?p:1-p,N=W<768?22:34,h=H/N,base=parse(bg),mid=(N-1)/2,cl=t=>Math.min(1,Math.max(0,t)),sm=t=>t*t*(3-2*t);
    cx.clearRect(0,0,W,H);if(q<=0){if(dir!=="in"){u.style.background=""}return}
    for(let i=0;i<N;i++){const d=Math.abs(i-mid)/mid*.22,r=cl((q-d)/.78);if(r<=0)continue;
      const L=sm(cl(r/.55)),k=sm(cl((r-.32)/.68)),A=h*1.5*(1-k),y0=(i+.5)*h,th=1.2+(h*1.3+2*A)*k,ph=i*.5+q*2.4;
      const c=k<.5?coral.map((v,j)=>Math.round(v+(base[j]-v)*(k/.5))):base;
      const xa=dir==="in"?-30:-30+(W+60)*(1-L),xb=dir==="in"?-30+(W+60)*L:W+30;
      cx.strokeStyle=`rgb(${c[0]},${c[1]},${c[2]})`;cx.lineWidth=th;cx.lineCap="round";cx.beginPath();
      for(let x=xa;x<=xb+12;x+=12){const xx=Math.min(x,xb),y=y0+A*Math.sin(xx*.0055+ph);x===xa?cx.moveTo(xx,y):cx.lineTo(xx,y)}
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
