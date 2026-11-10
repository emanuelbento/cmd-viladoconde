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

/* ---------- Contactos: "Ver a lista completa" desliza até aos parceiros ---------- */
$$("[data-acc-more]").forEach(l=>l.addEventListener("click",e=>{const t=$("#parceiros-title");if(!t)return;e.preventDefault();window.cmdLenis?cmdLenis.scrollTo(t,{offset:-120}):t.scrollIntoView({behavior:"smooth"})}));

})();
