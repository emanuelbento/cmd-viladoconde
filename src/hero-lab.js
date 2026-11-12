/* ---------- Laboratório do hero: Möbius ----------
   Só se ativa com ?hero=a ou ?hero=b na homepage. Sem parâmetro, o hero atual fica igual.
   A · tempo real: fios finos formam uma fita de Möbius; o fio de cobre percorre a borda única
       (duas voltas, um só percurso) com um brilho que corre ao longo dele. Reage ao cursor e ao scroll.
   B · render 3D: sequência renderizada em Blender, em vídeo, multiplicada sobre o creme da página. */
(()=>{const mode=new URLSearchParams(location.search).get("hero");if(mode!=="a"&&mode!=="b")return;
const host=document.querySelector("[data-hero-gl]");if(!host)return;const sec=host.closest("[data-hero]")||host.parentElement;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const hideOld=()=>{const o=host.querySelector(".hero_gl-canvas");o&&(o.style.visibility="hidden");const f=host.querySelector(".hero_gl-fallback");f&&(f.style.visibility="hidden")};
hideOld();new MutationObserver(hideOld).observe(host,{childList:!0});
/* mantém o parâmetro ao navegar para a homepage */
document.addEventListener("click",e=>{const a=e.target.closest('a[href="/"],a[href="./"]');a&&(a.href="/?hero="+mode)},{capture:!0});

if(mode==="b"){const v=document.createElement("video");v.className="hero_lab-video";
  Object.assign(v,{muted:!0,loop:!0,playsInline:!0,autoplay:!RM,preload:"auto"});v.setAttribute("aria-hidden","true");v.setAttribute("muted","");
  v.src=(window.CMD_BASE||"")+"assets/hero-mobius.mp4";host.appendChild(v);
  /* o scroll acelera a rotação e o vídeo abranda de volta ao ritmo de repouso */
  let y=scrollY,rate=1;const tick=()=>{const dy=Math.abs(scrollY-y);y=scrollY;rate+=(Math.min(3,1+dy/40)-rate)*.08;try{v.playbackRate=rate}catch(e){}requestAnimationFrame(tick)};
  RM||requestAnimationFrame(tick);return}

const cv=document.createElement("canvas");cv.className="hero_lab-canvas";cv.setAttribute("aria-hidden","true");
const gl=cv.getContext("webgl",{antialias:!0,alpha:!0,premultipliedAlpha:!0});if(!gl)return;
const VS=`precision highp float;attribute vec2 a;uniform float uT,uAsp,uMode,uPx,uScr;uniform vec2 uM;varying float vZ,vU,vS;
const float PI=3.14159265;
mat3 rx(float q){float c=cos(q),s=sin(q);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 ry(float q){float c=cos(q),s=sin(q);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rz(float q){float c=cos(q),s=sin(q);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
vec3 P(float u,float v){float w=.46*(1.+.06*sin(3.*u));float r=1.+v*w*cos(u*.5);return vec3(r*cos(u),r*sin(u),v*w*sin(u*.5));}
vec3 W(vec3 p){float sp=uT*.07+uScr;p=rz(sp)*p;p=rx(1.08+uM.y*.12)*ry(-.24+uM.x*.14)*p;return p*.74+vec3(.78,-.02,0.);}
vec2 S(vec3 p){float k=1./(1.+p.z*.42);return vec2(p.x*k/uAsp,p.y*k);}
void main(){
 if(uMode<.5){float u=a.x*4.*PI,v=a.y;vec3 p=W(P(u,v));vZ=p.z;vU=u;vS=0.;gl_Position=vec4(S(p),0.,1.);return;}
 /* fio grosso: faixa em espaço de ecrã com largura constante em píxeis */
 float u=a.x*4.*PI,side=a.y;float v=uMode>1.5?0.:1.;
 vec3 p=W(P(u,v)),q=W(P(u+.004,v));vec2 s0=S(p),s1=S(q);vec2 d=normalize((s1-s0)*vec2(uAsp,1.));vec2 n=vec2(-d.y,d.x)/vec2(uAsp,1.);
 float wpx=(uMode>1.5?1.6:2.6)*(1.-p.z*.35);
 vZ=p.z;vU=u;vS=side;gl_Position=vec4(s0+n*side*wpx*uPx,0.,1.);}`;
const FS=`precision highp float;uniform float uT,uMode,uA;varying float vZ,vU,vS;
void main(){float dz=clamp(vZ*1.5+.5,0.,1.);
 if(uMode<.5){vec3 c=mix(vec3(.93,.52,.40),vec3(.58,.22,.15),dz);float al=uA*(.62-.36*dz);gl_FragColor=vec4(c*al,al);return;}
 /* cobre: brilho que percorre o fio e realce ao centro da faixa, como num cilindro */
 float g=pow(.5+.5*sin(vU*.5-uT*.55),28.);float cyl=1.-abs(vS);
 vec3 c=mix(vec3(.45,.17,.10),vec3(.86,.55,.42),cyl*.8);c=mix(c,vec3(1.,.9,.83),g*cyl);
 float al=smoothstep(0.,.35,cyl)*(1.-dz*.35);gl_FragColor=vec4(c*al,al);}`;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;gl.useProgram(pr);host.appendChild(cv);
const buf=(D)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(D),gl.STATIC_DRAW);return{b,n:D.length/2}};
/* cada fio da superfície dá duas voltas e fecha: v e -v são o mesmo fio */
const N=26,P=720,lines=[];for(let k=0;k<N;k++){const v=(k+.5)/N;for(let j=0;j<P;j++)lines.push(j/P,v,(j+1)/P,v)}
const strip=n=>{const D=[];for(let j=0;j<=n;j++)D.push(j/n,-1,j/n,1);return D};
const L=buf(lines),E=buf(strip(1600)),C=buf(strip(800));
const la=gl.getAttribLocation(pr,"a"),U={};["uT","uAsp","uMode","uPx","uScr","uM","uA"].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
let asp=1,px=.001;const size=()=>{const r=host.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.75);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);gl.viewport(0,0,cv.width,cv.height);asp=r.width/r.height;px=2/r.height};
size();addEventListener("resize",size);
const m={x:0,y:0,tx:0,ty:0},sc={y:scrollY,ph:0,v:0};
addEventListener("pointermove",e=>{const r=host.getBoundingClientRect();m.tx=(e.clientX-r.left)/r.width*2-1;m.ty=(e.clientY-r.top)/r.height*2-1},{passive:!0});
const draw=t=>{const dy=scrollY-sc.y;sc.y=scrollY;sc.v+=(dy*.004-sc.v)*.1;sc.ph+=sc.v;m.x+=(m.tx-m.x)*.04;m.y+=(m.ty-m.y)*.04;
  const prog=Math.min(1,Math.max(0,-sec.getBoundingClientRect().top/(sec.offsetHeight*.8)));
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(U.uT,t);gl.uniform1f(U.uAsp,asp);gl.uniform1f(U.uPx,px);gl.uniform1f(U.uScr,sc.ph);gl.uniform2f(U.uM,m.x,m.y);gl.uniform1f(U.uA,1-prog*.7);
  for(const[o,md,prim]of[[L,0,gl.LINES],[C,2,gl.TRIANGLE_STRIP],[E,1,gl.TRIANGLE_STRIP]]){gl.bindBuffer(gl.ARRAY_BUFFER,o.b);gl.enableVertexAttribArray(la);gl.vertexAttribPointer(la,2,gl.FLOAT,!1,0,0);gl.uniform1f(U.uMode,md);gl.drawArrays(prim,0,o.n)}};
const t0=performance.now();let vis=!0;
const loop=now=>{if(!vis)return;draw((now-t0)/1e3);requestAnimationFrame(loop)};
if(RM){draw(6);return}
new IntersectionObserver(es=>{const v=es[0].isIntersecting;v&&!vis&&(vis=!0,requestAnimationFrame(loop));vis=v}).observe(sec);
requestAnimationFrame(loop)})();
