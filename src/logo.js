(()=>{"use strict";
/* CMD · monograma na mudança de página: ao sair a linha desenha o símbolo; ao entrar o C roda para fora e o MD desliza. */
const NS="http://www.w3.org/2000/svg";
const split=svg=>{const p=svg&&svg.querySelector("path");if(!p)return null;if(svg._cmd)return svg._cmd;
  const st=p.getAttribute("style")||"",parts=p.getAttribute("d").split(/(?=M)/).filter(Boolean);svg.innerHTML="";
  const mk=(d,ln)=>{const e=document.createElementNS(NS,"path");e.setAttribute("d",d);
    if(ln){e.setAttribute("fill","none");e.setAttribute("stroke","currentColor");e.setAttribute("stroke-width","1.4");e.setAttribute("vector-effect","non-scaling-stroke");e.setAttribute("stroke-linecap","round");e.setAttribute("stroke-linejoin","round")}else e.setAttribute("style",st);
    svg.appendChild(e);return e};
  const fill=parts.map(d=>mk(d)),line=parts.map(d=>mk(d,1));line.forEach(l=>{l._L=l.getTotalLength()});svg.style.overflow="visible";return svg._cmd={fill,line}};
window.cmdLogoDraw=svg=>{const tl=gsap.timeline(),P=split(svg);
  if(!P)return tl.fromTo(svg,{autoAlpha:0,scale:.85},{autoAlpha:1,scale:1,duration:.45,ease:"expo.out"});
  const md=P.fill[0],c=P.fill[1]||md,lmd=P.line[0],lc=P.line[1]||lmd;
  gsap.set(svg,{autoAlpha:1,scale:1});gsap.set(P.fill,{opacity:0,rotation:0,xPercent:0});gsap.set(c,{transformOrigin:"50% 50%"});
  P.line.forEach(l=>gsap.set(l,{opacity:1,strokeDasharray:l._L,strokeDashoffset:l._L}));
  return tl.to(lc,{strokeDashoffset:0,duration:.45,ease:"power2.inOut"},0).to(lmd,{strokeDashoffset:0,duration:.5,ease:"power2.inOut"},.05)
    .fromTo(c,{rotation:-30,opacity:0},{rotation:0,opacity:1,duration:.45,ease:"expo.out"},.32)
    .fromTo(md,{xPercent:4,opacity:0},{xPercent:0,opacity:1,duration:.45,ease:"expo.out"},.36).to(P.line,{opacity:0,duration:.25},.45)};
window.cmdLogoOut=svg=>{const tl=gsap.timeline(),P=split(svg);
  if(!P)return tl.to(svg,{autoAlpha:0,scale:.9,duration:.35,ease:"power2.in"});
  const md=P.fill[0],c=P.fill[1]||md;gsap.set(P.line,{opacity:0});gsap.set(c,{transformOrigin:"50% 50%"});
  return tl.to(c,{rotation:40,opacity:0,duration:.5,ease:"power3.in"},0).to(md,{xPercent:-5,opacity:0,duration:.45,ease:"power3.in"},.06)};
})();
