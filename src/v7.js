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
    /* Fios finos como os da hero desenham-se pelo ecrã; por trás, a cor de fundo entra em fade suave.
       Sem faixas a engrossar: só linha e opacidade, para ficar fluido. */
    const q=dir==="in"?p:1-p,N=W<768?9:14,base=parse(bg),cl=t=>Math.min(1,Math.max(0,t)),sm=t=>t*t*(3-2*t);
    cx.clearRect(0,0,W,H);if(q<=0){if(dir!=="in"){u.style.background=""}return}
    const fill=sm(cl((q-.3)/.6));
    if(fill>0){cx.fillStyle=`rgba(${base[0]},${base[1]},${base[2]},${fill})`;cx.fillRect(0,0,W,H)}
    const la=1-sm(cl((q-.72)/.28));if(la<=0)return;
    const amp=H*.07,mid=(N-1)/2;cx.lineWidth=1.25;cx.lineCap="round";
    for(let i=0;i<N;i++){const d=Math.abs(i-mid)/mid*.18,L=sm(cl((q-d)/.55));if(L<=0)continue;
      const y0=H*(.12+.76*i/(N-1)),ph=i*.42+q*1.6;
      const xa=dir==="in"?-30:-30+(W+60)*(1-L),xb=dir==="in"?-30+(W+60)*L:W+30;
      cx.strokeStyle=`rgba(${coral[0]},${coral[1]},${coral[2]},${la*(.55+.45*(1-Math.abs(i-mid)/mid))})`;cx.beginPath();
      for(let x=xa;x<=xb+10;x+=10){const xx=Math.min(x,xb),y=y0+amp*Math.sin(xx/W*Math.PI*2+ph)+amp*.35*Math.sin(xx/W*Math.PI*5-ph*.7);x===xa?cx.moveTo(xx,y):cx.lineTo(xx,y)}
      cx.stroke()}};
})();

/* imagens dentro da galeria em cascata carregam já: estão recortadas, o lazy load não as vê */
$$("[data-cslider] img").forEach(i=>{i.loading="eager";i.decoding="async"});

/* ---------- "Seguinte": seta explícita ---------- */
$$(".next_link").forEach(a=>{if($(".next_arrow",a))return;const s=document.createElement("span");s.className="next_arrow";s.innerHTML=arrow;a.appendChild(s)});

/* ---------- Contactos: "Ver a lista completa" desliza até aos parceiros ---------- */
$$("[data-acc-more]").forEach(l=>l.addEventListener("click",e=>{const t=$("#parceiros-title");if(!t)return;e.preventDefault();window.cmdLenis?cmdLenis.scrollTo(t,{offset:-120}):t.scrollIntoView({behavior:"smooth"})}));

})();
