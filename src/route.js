/* ---------- Percurso: uma linha do hero até à marcação ----------
   Desktop (≥992): um fio em SVG na página que liga o hero, a linha das especialidades,
   a linha dos percursos de cuidado e o botão de marcação. Desenha-se com o scroll.
   Telemóvel e tablet: linha fixa na margem esquerda que avança com a página
   e acende uma estação por secção. */
(()=>{const sig=document.querySelector(".section_signature");if(!sig||!window.gsap||!window.ScrollTrigger)return;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,NS="http://www.w3.org/2000/svg";
const el=(t,a)=>{const n=document.createElementNS(NS,t);for(const k in a)n.setAttribute(k,a[k]);return n};
const pageY=r=>r.top+scrollY,pageX=r=>r.left+scrollX;
/* linha com cantos arredondados: troços retos e curvas de raio r nos vértices */
const curve=(P,r=48)=>{const f=n=>n.toFixed(1);let d=`M${f(P[0][0])},${f(P[0][1])}`;
  for(let i=1;i<P.length-1;i++){const [ax,ay]=P[i-1],[bx,by]=P[i],[cx,cy]=P[i+1];
    const l1=Math.hypot(bx-ax,by-ay),l2=Math.hypot(cx-bx,cy-by),k=Math.min(r,l1/2,l2/2);
    const p1=[bx-(bx-ax)/l1*k,by-(by-ay)/l1*k],p2=[bx+(cx-bx)/l2*k,by+(cy-by)/l2*k];
    d+=` L${f(p1[0])},${f(p1[1])} Q${f(bx)},${f(by)} ${f(p2[0])},${f(p2[1])}`}
  const z=P[P.length-1];return d+` L${f(z[0])},${f(z[1])}`};
const mm=gsap.matchMedia();

mm.add("(min-width:992px)",()=>{
  const svg=el("svg",{class:"route_svg","aria-hidden":"true",focusable:"false"});document.body.appendChild(svg);
  const mk=()=>{const p=el("path",{class:"route_path"});svg.appendChild(p);return p};
  const s1=mk(),s2=mk(),s3=mk(),start=el("circle",{class:"route_dot",r:"4"}),end=el("circle",{class:"route_dot is-end",r:"4"});svg.append(start,end);
  const sigSvg=sig.querySelector(".signature_svg"),sigPath=sig.querySelector(".signature_path");
  const lead=el("path",{class:"route_path route_lead"});sigSvg&&sigSvg.insertBefore(lead,sigSvg.firstChild);
  const pinST=()=>ScrollTrigger.getAll().find(t=>t.pin&&sig.contains(t.pin));
  const G={ok:!1};
  const len=p=>{const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;return L};
  const build=()=>{const st=pinST(),lead0=document.querySelector(".hero_lead"),pt=[...document.querySelectorAll(".pex2_track")].find(t=>t.offsetParent&&t.getBoundingClientRect().height>0),cta=document.querySelector(".section_marcacao [data-book]");
    if(!st||!lead0||!pt||!cta||!sigSvg||!sigPath){G.ok=!1;return}
    const pg=document.querySelector(".padding-global"),gx=Math.max(16,(parseFloat(getComputedStyle(pg).paddingLeft)||64)/2);
    const doc=document.documentElement;svg.setAttribute("width",doc.scrollWidth);svg.setAttribute("height",doc.scrollHeight);svg.setAttribute("viewBox",`0 0 ${doc.scrollWidth} ${doc.scrollHeight}`);
    /* 1 · do hero ao início da secção das especialidades */
    const lr=lead0.getBoundingClientRect(),y0=pageY(lr)+8,sigTop=st.start;
    const P1=[[gx,y0],[gx,sigTop]];s1.setAttribute("d",curve(P1));
    start.setAttribute("cx",gx);start.setAttribute("cy",y0);
    /* entrada na linha das especialidades: vive dentro do SVG da secção para acompanhar o pin */
    const m=/^M\s*([\d.\-]+)[ ,]([\d.\-]+)/.exec(sigPath.getAttribute("d")||"");if(!m){G.ok=!1;return}
    const ex=+m[1],ey=+m[2],sr=sigSvg.getBoundingClientRect(),oy=sr.top-st.pin.getBoundingClientRect().top;
    const tr=sig.querySelector(".signature_track"),tx=gsap.getProperty(tr,"x")||0,lx=gx-(sr.left-tx);
    lead.setAttribute("d",curve([[lx,-oy],[lx,ey],[ex,ey]],28));
    /* 2 · do fim da linha das especialidades (monograma) aos percursos */
    const tip=sig.querySelector("[data-sig-tip]");const tw=tr.scrollWidth,shift=tw-innerWidth;
    const tipX=(+tip.getAttribute("cx"))+(sr.left-tx)-shift,tipY=st.end+(+tip.getAttribute("cy"))+oy;
    const ptr=pt.getBoundingClientRect(),px=pageX(ptr),pTop=pageY(ptr),pBot=pTop+ptr.height;
    const sp0=document.querySelector(".section_percursos"),spTop=sp0?pageY(sp0.getBoundingClientRect()):pTop-300;
    const col=[...document.querySelectorAll(".pex2_label,.pex2_case-title")].find(e=>e.offsetParent),colL=col?pageX(col.getBoundingClientRect()):px;
    const lx2=Math.min(tipX,colL-24);
    s2.setAttribute("d",curve(lx2<tipX-2?[[tipX,tipY],[tipX,spTop-56],[lx2,spTop-56],[lx2,pTop-32],[px,pTop-32],[px,pTop]]:[[tipX,tipY],[tipX,pTop-32],[px,pTop-32],[px,pTop]],12));
    /* 3 · do fim dos percursos ao botão de marcação */
    const sp=document.querySelector(".section_percursos"),spBot=sp?pageY(sp.getBoundingClientRect())+sp.offsetHeight:pBot+200;
    const cr=cta.getBoundingClientRect(),ctaX=pageX(cr),ctaY=pageY(cr)+cr.height/2;
    s3.setAttribute("d",curve([[px,pBot],[px,spBot+48],[gx,spBot+48],[gx,ctaY],[ctaX-10,ctaY]]));
    end.setAttribute("cx",ctaX-10);end.setAttribute("cy",ctaY);
    Object.assign(G,{ok:!0,L1:len(s1),L0:len(lead),L2:len(s2),L3:len(s3),y0,sigTop,pinEnd:st.end,s2End:pTop,pBot,ctaY});draw(scrollY)};
  const vh=()=>innerHeight*.65,cl=v=>v<0?0:v>1?1:v;
  const set=(p,L,k)=>{p.style.strokeDashoffset=(L*(1-k)).toFixed(1)};
  const draw=s=>{if(!G.ok)return;if(RM){[[s1,G.L1],[lead,G.L0],[s2,G.L2],[s3,G.L3]].forEach(([p,L])=>set(p,L,1));return}
    const t=s+vh();
    set(s1,G.L1,cl((t-G.y0)/(G.sigTop-G.y0)));
    set(lead,G.L0,cl((s-(G.sigTop-vh()))/vh()));
    set(s2,G.L2,s<G.pinEnd?0:cl((s-G.pinEnd)/Math.max(1,G.s2End-G.pinEnd-vh())));
    set(s3,G.L3,cl((t-G.pBot)/(G.ctaY-G.pBot)));
    end.classList.toggle("is-on",t>=G.ctaY)};
  const trig=ScrollTrigger.create({start:0,end:"max",onUpdate:self=>draw(self.scroll())});
  const onRefresh=()=>requestAnimationFrame(build);ScrollTrigger.addEventListener("refresh",onRefresh);
  document.fonts&&document.fonts.ready.then(()=>ScrollTrigger.refresh());build();
  return()=>{ScrollTrigger.removeEventListener("refresh",onRefresh);trig.kill();svg.remove();lead.remove()}});

mm.add("(max-width:991px)",()=>{
  const bar=document.createElement("div");bar.className="route_rail";bar.setAttribute("aria-hidden","true");bar.innerHTML='<span class="route_rail-fill"></span>';document.body.appendChild(bar);
  const fill=bar.firstChild,secs=[...document.querySelectorAll(".section_signature,.section_percursos,.section_team,.section_cases-index,.section_marcacao")];
  const rv=document.querySelector(".rv2_quote");rv&&secs.splice(4,0,rv.closest("section")||rv);
  const dots=secs.map(()=>{const d=document.createElement("span");d.className="route_rail-dot";bar.appendChild(d);return d});
  let max=1,pos=[];
  const build=()=>{max=Math.max(1,document.documentElement.scrollHeight-innerHeight);pos=secs.map(s=>Math.min(1,Math.max(0,(pageY(s.getBoundingClientRect())-innerHeight*.5)/max)));dots.forEach((d,i)=>d.style.top=(pos[i]*100).toFixed(2)+"%");draw(scrollY)};
  const draw=s=>{const k=Math.min(1,Math.max(0,s/max));fill.style.transform=`scaleY(${k.toFixed(4)})`;dots.forEach((d,i)=>d.classList.toggle("is-on",k>=pos[i]-.002))};
  const trig=ScrollTrigger.create({start:0,end:"max",onUpdate:self=>draw(self.scroll())});
  const onRefresh=()=>requestAnimationFrame(build);ScrollTrigger.addEventListener("refresh",onRefresh);build();
  return()=>{ScrollTrigger.removeEventListener("refresh",onRefresh);trig.kill();bar.remove()}});
})();
