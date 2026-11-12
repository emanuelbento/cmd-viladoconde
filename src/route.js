/* ---------- Percurso: a linha passa de secção em secção ----------
   Desktop (≥992): a linha só aparece nas passagens, sempre em curva, com o traço das linhas
   que já existem. Sai das especialidades pelo monograma e sai da pista dos percursos, sempre
   a desvanecer na direção da secção seguinte. Entre passagens fica vazio: a continuidade
   lê-se pela direção. A linha das especialidades começa no "Continue a descer" e a onda da
   marcação é a chegada.
   Telemóvel e tablet: linha fixa na margem esquerda que avança com a página. */
(()=>{const sig=document.querySelector(".section_signature");if(!sig||!window.gsap||!window.ScrollTrigger)return;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,NS="http://www.w3.org/2000/svg";
const el=(t,a)=>{const n=document.createElementNS(NS,t);for(const k in a)n.setAttribute(k,a[k]);return n};
const pageY=r=>r.top+scrollY,pageX=r=>r.left+scrollX,f=n=>(+n).toFixed(1);
/* curva cúbica com tangentes dadas nas pontas: a = direção à saída, b = direção à chegada */
const bez=(p,q,a,b,k=.5)=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1])*k;
  return`M${f(p[0])},${f(p[1])} C${f(p[0]+a[0]*d)},${f(p[1]+a[1]*d)} ${f(q[0]-b[0]*d)},${f(q[1]-b[1]*d)} ${f(q[0])},${f(q[1])}`};
/* desvanecer ao longo de um troço: gradiente no espaço do utilizador, de p para q */
let gid=0;const fade=(svg,p,q,from,to)=>{let defs=svg.querySelector("defs");defs||(defs=el("defs",{}),svg.insertBefore(defs,svg.firstChild));
  const id="route-g"+ ++gid,g=el("linearGradient",{id,gradientUnits:"userSpaceOnUse",x1:f(p[0]),y1:f(p[1]),x2:f(q[0]),y2:f(q[1])});
  g.append(el("stop",{offset:"0","stop-color":"#EA6F4E","stop-opacity":from}),el("stop",{offset:"1","stop-color":"#EA6F4E","stop-opacity":to}));defs.appendChild(g);return`url(#${id})`};
const mm=gsap.matchMedia();

mm.add("(min-width:992px)",()=>{
  const svg=el("svg",{class:"route_svg","aria-hidden":"true",focusable:"false"});document.body.appendChild(svg);document.documentElement.classList.add("has-route");
  const s2=el("path",{class:"route_path"}),s3=el("path",{class:"route_path"});svg.append(s2,s3);
  const sigSvg=sig.querySelector(".signature_svg");
  const pinST=()=>ScrollTrigger.getAll().find(t=>t.pin&&sig.contains(t.pin));
  const G={ok:!1};
  const len=p=>{const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;return L};
  const build=()=>{const st=pinST(),pt=[...document.querySelectorAll(".pex2_track")].find(t=>t.offsetParent&&t.getBoundingClientRect().height>0);
    if(!st||!pt||!sigSvg){G.ok=!1;return}
    svg.querySelector("defs")?.remove();
    const doc=document.documentElement;svg.setAttribute("width",doc.scrollWidth);svg.setAttribute("height",doc.scrollHeight);svg.setAttribute("viewBox",`0 0 ${doc.scrollWidth} ${doc.scrollHeight}`);
    const sr=sigSvg.getBoundingClientRect(),oy=sr.top-st.pin.getBoundingClientRect().top;
    const tr=sig.querySelector(".signature_track"),tx=gsap.getProperty(tr,"x")||0;
    const pg=document.querySelector(".padding-global"),gx=Math.max(16,(parseFloat(getComputedStyle(pg).paddingLeft)||64)/2);
    /* 1 · saída das especialidades pelo monograma */
    const tip=sig.querySelector("[data-sig-tip]"),shift=tr.scrollWidth-innerWidth;
    const tipX=(+tip.getAttribute("cx"))+(sr.left-tx)-shift,tipY=st.end+(+tip.getAttribute("cy"))+oy;
    const ptr=pt.getBoundingClientRect(),px=pageX(ptr),pTop=pageY(ptr),pBot=pTop+ptr.height;
    const sp=document.querySelector(".section_percursos"),spTop=sp?pageY(sp.getBoundingClientRect()):pTop-240;
    /* desce do monograma na direção da pista e desvanece antes da secção: a pista tem a sua própria linha */
    const q2=[tipX+(px-tipX)*.6,Math.max(tipY+160,spTop-56)];
    s2.setAttribute("d",bez([tipX,tipY],q2,[0,1],[(px-tipX)/Math.max(1,Math.hypot(px-tipX,q2[1]-tipY))*.6,.8],.45));
    s2.style.stroke=fade(svg,[tipX,tipY+(q2[1]-tipY)*.35],q2,1,0);
    /* 2 · saída da pista: curva larga para a margem, a desvanecer antes da secção seguinte */
    const spBot=sp?pageY(sp.getBoundingClientRect())+sp.offsetHeight:pBot+240;
    const q3=[Math.max(gx,px-Math.min(260,(spBot-pBot)*1.1)),Math.min(spBot-24,pBot+Math.max(120,(spBot-pBot)*.85))];
    s3.setAttribute("d",bez([px,pBot],q3,[0,1],[-1,.35],.5));
    s3.style.stroke=fade(svg,[px,pBot+(q3[1]-pBot)*.25],q3,1,0);
    Object.assign(G,{ok:!0,L2:len(s2),L3:len(s3),sigTop:st.start,pinEnd:st.end,s2End:q2[1],pBot,q3y:q3[1]});draw(scrollY)};
  const vh=()=>innerHeight*.65,cl=v=>v<0?0:v>1?1:v;
  const set=(p,L,k)=>{p.style.strokeDashoffset=(L*(1-k)).toFixed(1)};
  const draw=s=>{if(!G.ok)return;if(RM){[[s2,G.L2],[s3,G.L3]].forEach(([p,L])=>set(p,L,1));return}
    const t=s+vh();
    set(s2,G.L2,s<G.pinEnd?0:cl((s-G.pinEnd)/Math.max(1,G.s2End-G.pinEnd-vh())));
    set(s3,G.L3,cl((t-G.pBot)/Math.max(1,G.q3y-G.pBot)))};
  const trig=ScrollTrigger.create({start:0,end:"max",onUpdate:self=>draw(self.scroll())});
  const onRefresh=()=>requestAnimationFrame(build);ScrollTrigger.addEventListener("refresh",onRefresh);
  document.fonts&&document.fonts.ready.then(()=>ScrollTrigger.refresh());build();
  return()=>{ScrollTrigger.removeEventListener("refresh",onRefresh);trig.kill();svg.remove();document.documentElement.classList.remove("has-route")}});

mm.add("(max-width:991px)",()=>{
  const bar=document.createElement("div");bar.className="route_rail";bar.setAttribute("aria-hidden","true");bar.innerHTML='<span class="route_rail-fill"></span>';document.body.appendChild(bar);
  const fill=bar.firstChild,secs=[...document.querySelectorAll(".section_signature,.section_percursos,.section_team,.section_cases-index,.section_marcacao")];
  const rv=document.querySelector(".rv2_quote");rv&&secs.splice(4,0,rv.closest("section")||rv);
  const dots=secs.map(()=>{const d=document.createElement("span");d.className="route_rail-dot";bar.appendChild(d);return d});
  let max=1,pos=[];
  const build=()=>{max=Math.max(1,document.documentElement.scrollHeight-innerHeight);pos=secs.map(s=>Math.min(1,Math.max(0,(pageY(s.getBoundingClientRect())-innerHeight*.5)/max)));dots.forEach((d,i)=>d.style.top=(pos[i]*100).toFixed(2)+"%");draw(scrollY)};
  const own=[...document.querySelectorAll(".section_signature,.section_percursos")];
  const draw=s=>{const k=Math.min(1,Math.max(0,s/max)),h=innerHeight/2;bar.classList.toggle("is-muted",own.some(o=>{const r=o.getBoundingClientRect();return r.top<h&&r.bottom>h}));fill.style.transform=`scaleY(${k.toFixed(4)})`;dots.forEach((d,i)=>d.classList.toggle("is-on",k>=pos[i]-.002))};
  const trig=ScrollTrigger.create({start:0,end:"max",onUpdate:self=>draw(self.scroll())});
  const onRefresh=()=>requestAnimationFrame(build);ScrollTrigger.addEventListener("refresh",onRefresh);build();
  return()=>{ScrollTrigger.removeEventListener("refresh",onRefresh);trig.kill();bar.remove()}});
})();
