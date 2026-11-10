(()=>{"use strict";
/* CMD · Hero "Fio". Uma fita de fios finos torce-se no espaço; o cursor afasta-a como um tecido; com o scroll os fios juntam-se numa só linha.
   WebGL puro (sem bibliotecas), uma draw call. Se não houver WebGL fica o SVG estático que está no Designer. */
const run=()=>{
const host=document.querySelector("[data-hero-gl]");if(!host||host._gl)return;host._gl=1;
const sec=host.closest("[data-hero]")||host.parentElement;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const cv=document.createElement("canvas");cv.className="hero_gl-canvas";cv.setAttribute("aria-hidden","true");
const gl=cv.getContext("webgl",{antialias:true,alpha:true,premultipliedAlpha:true});if(!gl)return;
const VS=`attribute vec2 a;uniform float uT,uAsp,uProg,uMob,uMA,uScr,uVel,uDir;uniform vec2 uM,uB;varying float vT,vZ,vS;
const float PI=3.14159265;
vec3 C(float t){vec3 c;
 if(uMob>.5){c.x=mix(-uAsp*1.5,uAsp*1.5,t);c.y=uB.x+uB.y*(.55*sin(t*PI*1.4+uT*.22)+.2*sin(t*PI*3.2-uT*.15));}
 else{c.x=mix(-uAsp*1.08,uAsp*1.08,t);c.y=mix(-.5,.86,t)+.2*sin(t*PI*1.5+uT*.18)-.1*sin(t*PI*3.+uT*.11);}
 c.y+=uVel*.22*sin(t*PI*3.+uT*.6+uScr*.5);c.z=.32*sin(t*PI*2.+uT*.16+uScr*.35);c.y=mix(c.y,uMob>.5?uB.x:-.2,uProg*.6);return c;}
void main(){float t=a.x,s=a.y;vec3 c=C(t),d=normalize(C(t+.002)-c);vec2 n=normalize(vec2(-d.y,d.x));
 float w=(uMob>.5?uB.y*.75:.42)*(.28+.72*sin(PI*t))*(1.-uProg*uProg*(3.-2.*uProg))*(1.+abs(uVel)*.9);
 float tw=t*PI*(uMob>.5?2.:2.6)+uT*.14+uScr;
 float r=s*w*(1.+.05*sin(t*11.+uT*.9+s*4.));
 vec3 p=c+vec3(n*cos(tw)*r,sin(tw)*r);
 vec2 dm=p.xy-uM;float f=exp(-dot(dm,dm)/(uMob>.5?.05:.2))*uMA;
 /* o cursor torce os fios em espiral à sua volta: curvas suaves em vez do empurrão radial que criava troços retos */
 float ang=f*(uMob>.5?.55:.95)*uDir;float ca=cos(ang),sa=sin(ang);dm=vec2(ca*dm.x-sa*dm.y,sa*dm.x+ca*dm.y);
 p.xy=uM+dm*(1.+f*.12);p.z+=f*.3;
 float k=1./(1.+p.z*.42);vT=t;vZ=p.z;vS=s;
 gl_Position=vec4(p.x*k/uAsp,p.y*k,0.,1.);}`;
const FS=`precision mediump float;uniform float uRev,uA;varying float vT,vZ,vS;
void main(){float e=smoothstep(0.,.12,vT)*smoothstep(1.,.86,vT);
 float rv=1.-smoothstep(uRev-.14,uRev,vT+(vS*.5+.5)*.12);
 float dz=clamp(vZ*1.4+.5,0.,1.);
 vec3 col=mix(vec3(.49,.17,.12),vec3(.918,.435,.306),dz);
 float al=uA*e*rv*(.95-.55*dz);gl_FragColor=vec4(col*al,al);}`;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;gl.useProgram(pr);host.appendChild(cv);
const mob=()=>innerWidth<768;let count=0,wasMob=null;const buf=gl.createBuffer();
const build=()=>{const S=mob()?30:60,P=mob()?140:200,D=new Float32Array(S*(P-1)*4);let i=0;
  for(let s=0;s<S;s++){const sn=s/(S-1)*2-1;for(let j=0;j<P-1;j++){D[i++]=j/(P-1);D[i++]=sn;D[i++]=(j+1)/(P-1);D[i++]=sn}}
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,D,gl.STATIC_DRAW);count=D.length/2};
const la=gl.getAttribLocation(pr,"a");
const U={};["uT","uAsp","uRev","uProg","uMob","uMA","uM","uA","uB","uScr","uVel","uDir"].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
let W=1,H=1,asp=1,band=[0,.1];
/* no mobile a fita passa no intervalo entre o título e o texto */
const measureBand=()=>{const r=sec.getBoundingClientRect(),t=sec.querySelector(".hero_title"),b=sec.querySelector(".hero_bottom");
  if(!t||!b)return;const y0=t.getBoundingClientRect().bottom-r.top,y1=b.getBoundingClientRect().top-r.top,mid=(y0+y1)/2,half=Math.max(30,(y1-y0)/2);
  band=[1-2*mid/r.height,2*half/r.height]};
const size=()=>{const r=host.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,mob()?2:1.75);W=Math.max(1,r.width);H=Math.max(1,r.height);asp=W/H;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);gl.viewport(0,0,cv.width,cv.height);
  if(mob()!==wasMob){wasMob=mob();build();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(la);gl.vertexAttribPointer(la,2,gl.FLOAT,false,0,0)}measureBand()};
size();let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{size();RM&&draw(4)},120)});
document.fonts&&document.fonts.ready.then(measureBand);
const m={x:9,y:9,tx:9,ty:9,a:0,ta:0,d:1,td:1,px:null};
const toGL=(cx,cy)=>{const r=host.getBoundingClientRect();return[((cx-r.left)/r.width*2-1)*asp,-((cy-r.top)/r.height*2-1)]};
addEventListener("pointermove",e=>{const[x,y]=toGL(e.clientX,e.clientY);if(m.px!==null){const dx=x-m.px;Math.abs(dx)>.002&&(m.td=dx>0?1:-1)}m.px=x;m.tx=x;m.ty=y;m.ta=1},{passive:true});
sec.addEventListener("pointerleave",()=>{m.ta=0});addEventListener("pointerup",e=>{e.pointerType!=="mouse"&&(m.ta=0)});
let vis=true;const t0=performance.now(),st={r:RM?1.2:0};
const sc={y:scrollY,v:0,ph:0};
const draw=t=>{const r=sec.getBoundingClientRect(),prog=Math.min(1,Math.max(0,-r.top/(r.height*.7)));
  /* o scroll torce a fita e abre os fios; a velocidade decai suavemente */
  const dy=scrollY-sc.y;sc.y=scrollY;sc.v+=(Math.max(-1.4,Math.min(1.4,dy/38))-sc.v)*.12;sc.ph+=dy*.0045;
  m.x+=(m.tx-m.x)*.06;m.y+=(m.ty-m.y)*.06;m.a+=(m.ta-m.a)*.04;m.d+=(m.td-m.d)*.03;
  gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(U.uT,t);gl.uniform1f(U.uAsp,asp);gl.uniform1f(U.uRev,st.r);gl.uniform1f(U.uProg,prog);
  gl.uniform1f(U.uMob,mob()?1:0);gl.uniform1f(U.uMA,m.a);gl.uniform2f(U.uM,m.x,m.y);gl.uniform2f(U.uB,band[0],band[1]);gl.uniform1f(U.uA,mob()?.58:.62);gl.uniform1f(U.uScr,sc.ph);gl.uniform1f(U.uVel,sc.v);gl.uniform1f(U.uDir,m.d);
  gl.drawArrays(gl.LINES,0,count)};
const loop=now=>{if(!vis)return;draw((now-t0)/1000);requestAnimationFrame(loop)};
host.classList.add("is-live");
if(RM){draw(4);return}
new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!vis){vis=true;requestAnimationFrame(loop)}vis=v}).observe(sec);
requestAnimationFrame(loop);
const start=()=>{window.gsap?gsap.to(st,{r:1.2,duration:2.8,ease:"power2.inOut",delay:.2}):(st.r=1.2)};
window.cmdReady?start():document.addEventListener("cmd:ready",start,{once:true});
setTimeout(()=>{st.r<.01&&start()},4500)};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",run):run();
})();
