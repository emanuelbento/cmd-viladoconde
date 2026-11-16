/* Captura em árvore com auto layout medido. Captura uma secção renderizada (dentro do iframe #fr) para reconstruir no Figma. */
window.CAP=(()=>{
const R=v=>Math.round(v*2)/2,sleep=t=>new Promise(r=>setTimeout(r,t));
const W=()=>document.getElementById('fr').contentWindow;
const CV=document.createElement('canvas');CV.width=CV.height=1;const CX=CV.getContext('2d',{willReadFrequently:true});const conv=s=>{CX.clearRect(0,0,1,1);CX.fillStyle='#000';CX.fillStyle=s;CX.fillRect(0,0,1,1);const d=CX.getImageData(0,0,1,1).data;return d[3]<3?null:[d[0],d[1],d[2],+(d[3]/255).toFixed(3)]};
const col=s=>{if(!s||s==='transparent')return null;if(!/^rgba?\(/.test(s.trim()))return conv(s);const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);const a=p[3]===undefined?1:p[3];return a<0.01?null:[p[0],p[1],p[2],+a.toFixed(3)]};
const px=v=>parseFloat(v)||0;
let svgs={},imgs={},seq=0,font=null;
const id=p=>p+(++seq);
function bmFont(){if(font)return font;return null}
function cumOp(el,stop){let o=1;for(let e=el;e&&e!==stop&&e.nodeType===1;e=e.parentElement)o*=+getComputedStyle(e).opacity;return o}
function splitTop(s){const out=[];let d=0,cur='';for(const ch of s){if(ch==='(')d++;if(ch===')')d--;if(ch===','&&d===0){out.push(cur.trim());cur=''}else cur+=ch}if(cur.trim())out.push(cur.trim());return out}
function rasterGrad(bi,w,h){const m=bi.match(/^(repeating-)?linear-gradient\((.*)\)$/);if(!m)return null;const rep=!!m[1];const parts=splitTop(m[2]);let ang=180;if(/deg$/.test(parts[0])){ang=parseFloat(parts.shift())}else if(/^to /.test(parts[0])){const t=parts.shift();ang={'to top':0,'to right':90,'to bottom':180,'to left':270}[t]??180}
  const a=ang*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),L=Math.abs(w*dx)+Math.abs(h*dy);
  let stops=parts.map(p=>{const cm=p.match(/^(rgba?\([^)]+\)|#[0-9a-f]+|[a-z]+\([^)]*\)|[a-z]+)\s*(.*)$/i);const c=cm?col(cm[1]):null;const pos=cm&&cm[2]?(/%/.test(cm[2])?L*parseFloat(cm[2])/100:px(cm[2])):null;return{c:c||[0,0,0,0],p:pos}});
  stops.forEach((s,i)=>{if(s.p===null)s.p=i===0?0:(i===stops.length-1?(rep?stops[i-1].p:L):null)});for(let i=1;i<stops.length;i++)if(stops[i].p===null){let j=i;while(stops[j].p===null)j++;for(let k=i;k<j;k++)stops[k].p=stops[i-1].p+(stops[j].p-stops[i-1].p)*(k-i+1)/(j-i+1)}
  const S=2,cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(w*S));cv.height=Math.max(1,Math.round(h*S));const x=cv.getContext('2d');const cx=w/2,cy=h/2;const g=x.createLinearGradient((cx-dx*L/2)*S,(cy-dy*L/2)*S,(cx+dx*L/2)*S,(cy+dy*L/2)*S);
  const rgba=c=>`rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;const add=(pos,c)=>{const t=Math.min(1,Math.max(0,pos/L));g.addColorStop(t,rgba(c))};
  if(rep){const P0=stops[0].p,P=stops[stops.length-1].p-P0;if(P<=0)return null;for(let o=P0;o<L;o+=P)for(const s of stops)add(o+s.p-P0,s.c)}else for(const s of stops)add(s.p,s.c);
  x.fillStyle=g;x.fillRect(0,0,cv.width,cv.height);return cv.toDataURL('image/png')}
function boxProps(el,cs){
  const o={};const bg=col(cs.backgroundColor);if(bg)o.bg=bg;
  const bi=cs.backgroundImage;if(bi&&bi!=='none'){const u=bi.match(/url\("?([^")]+)"?\)/);if(u){o.bgimg=u[1]}else if(/gradient/.test(bi)){o.grad=bi.slice(0,400)}}
  const sides=['Top','Right','Bottom','Left'].map(s=>({w:px(cs['border'+s+'Width']),c:col(cs['border'+s+'Color']),st:cs['border'+s+'Style']}));
  if(sides.some(s=>s.w>0&&s.c&&s.st!=='none')){const c=sides.find(s=>s.w>0&&s.c).c;o.bd={c,w:sides.map(s=>s.c&&s.st!=='none'?s.w:0)}}
  const rr=['TopLeft','TopRight','BottomRight','BottomLeft'].map(k=>{const v=cs['border'+k+'Radius'];return /%/.test(v)?Math.min(el.offsetWidth,el.offsetHeight)*px(v)/100:px(v)});
  if(rr.some(v=>v>0))o.rad=rr.map(v=>Math.min(v,9999));
  if(cs.boxShadow&&cs.boxShadow!=='none'){const parts=cs.boxShadow.split(/,(?![^(]*\))/);for(const sh of parts){const m=sh.trim().match(/(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?(\s+inset)?/);if(!m)continue;const c=col(m[1]);if(!c)continue;const X=px(m[2]),Y=px(m[3]),B=px(m[4]),S=px(m[5]||0);
    if(m[6]&&!X&&!Y&&!B&&S>0&&!o.bd){o.bd={c,w:[S,S,S,S]}}else if(m[6]){o.ish=[X,Y,B,S,c]}else if(!o.sh){o.sh=[X,Y,B,S,c]}}}
  return o}
function styleOf(e){const cs=getComputedStyle(e);let fam=cs.fontFamily.split(',')[0].replace(/["']/g,'').trim();
  return{fam,wt:+cs.fontWeight,sz:px(cs.fontSize),c:col(cs.color)||[0,0,0,1],ls:cs.letterSpacing==='normal'?0:px(cs.letterSpacing),tt:cs.textTransform,td:/underline/.test(cs.textDecorationLine)?1:0,it:cs.fontStyle==='italic'?1:0,lh:cs.lineHeight}}
const INLINE=new Set(['inline']);
function gather(el,out,consumed){
  for(const n of el.childNodes){
    if(n.nodeType===3){out.push({tn:n,el});}
    else if(n.nodeType===1){const cs=getComputedStyle(n);if(n.tagName==='BR'){out.push({br:1,el:n});continue}
      if(INLINE.has(cs.display)&&!['IMG','SVG','svg','CANVAS'].includes(n.tagName)&&cs.position!=='absolute'){consumed.add(n);gather(n,out,consumed)}}
  }}
const CR=new Map();function clipRectOf(el){if(CR.has(el))return CR.get(el);let c={l:-1e9,t:-1e9,r:1e9,b:1e9};for(let e=el;e&&e.nodeType===1&&e.tagName!=='HTML';e=e.parentElement){const cs=getComputedStyle(e);if(/hidden|clip/.test(cs.overflow+cs.overflowX+cs.overflowY)){const r=e.getBoundingClientRect();c={l:Math.max(c.l,r.left-1),t:Math.max(c.t,r.top-1),r:Math.min(c.r,r.right+1),b:Math.min(c.b,r.bottom+1)}}}CR.set(el,c);return c}
function hasDirectText(el){for(const n of el.childNodes)if(n.nodeType===3&&n.textContent.trim())return true;return false}
function R2(v){return Math.round(v*10)/10}
function svgNode(el,ox,oy,relOp){
  const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return null;
  const cl=el.cloneNode(true);const src=[el,...el.querySelectorAll('*')],dst=[cl,...cl.querySelectorAll('*')];
  src.forEach((s,i)=>{const d=dst[i];const cs=getComputedStyle(s);if(cs.display==='none'){d.setAttribute('display','none');return}
    if(i===0)return;['fill','stroke','stroke-width','stroke-dasharray','stroke-dashoffset','stroke-linecap','stroke-linejoin','opacity','fill-opacity','stroke-opacity'].forEach(p=>{const v=cs.getPropertyValue(p);if(v&&v!=='normal')d.setAttribute(p,v.replace(/px/g,''))});d.removeAttribute('class');d.removeAttribute('style')});
  src.forEach((s0,i)=>{if(s0.tagName!=='path'||typeof s0.getTotalLength!=='function')return;const cs=getComputedStyle(s0);const da=cs.strokeDasharray;if(!da||da==='none')return;const arr=da.split(/[ ,]+/).map(px).filter(v=>!isNaN(v));const off=px(cs.strokeDashoffset);
    let T;try{T=s0.getTotalLength()}catch(e){return}if(!T)return;if(arr[0]>=T*0.98&&off<=0.5){dst[i].removeAttribute('stroke-dasharray');dst[i].removeAttribute('stroke-dashoffset');return}if(arr.length<2)arr.push(arr[0]);if(!off)return;const per=arr.reduce((a,b)=>a+b,0);if(arr[0]<T*0.2&&per<T*0.2)return;
    const segs=[];let pos=-((off%per)+per)%per;let k=0;while(pos<T){const len=arr[k%arr.length];if(k%2===0){const a=Math.max(0,pos),b=Math.min(T,pos+len);if(b>a)segs.push([a,b])}pos+=len;k++;if(k>4000)break}
    let d='';for(const [a,b] of segs){const n=Math.max(2,Math.ceil((b-a)/3));for(let j=0;j<=n;j++){const pt=s0.getPointAtLength(a+(b-a)*j/n);d+=(j?'L':'M')+R2(pt.x)+' '+R2(pt.y)}}
    const dd=dst[i];if(!segs.length){dd.setAttribute('display','none');return}dd.setAttribute('d',d);dd.removeAttribute('stroke-dasharray');dd.removeAttribute('stroke-dashoffset')});
  const csr=getComputedStyle(el);cl.setAttribute('xmlns','http://www.w3.org/2000/svg');cl.removeAttribute('class');cl.removeAttribute('style');
  if(!cl.getAttribute('viewBox'))cl.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
  cl.setAttribute('width',R(r.width));cl.setAttribute('height',R(r.height));
  let h=cl.outerHTML.replace(/currentColor/g,csr.color);
  const sid=id('s');svgs[sid]=h;return{k:'S',id:sid,x:R(r.left-ox),y:R(r.top-oy),w:R(r.width),h:R(r.height),op:relOp}}
function gradOut(el,cs,r,ox,oy,relOp,bp,out){if(!(bp.grad&&r.width>0.5))return;const cs2=bp.grad.match(/rgba?\([^)]+\)/g)||[];if(cs2.length&&cs2.every(x=>x===cs2[0])){const c=col(cs2[0]);const sz=cs.backgroundSize.split(' '),ps=cs.backgroundPosition.split(' ');const dim=(v,full)=>/%/.test(v)?full*px(v)/100:(v==='auto'||!v?full:px(v));const gw=dim(sz[0],r.width),gh=dim(sz[1]||'auto',r.height);const pos=(v,full,g)=>/%/.test(v)?(full-g)*px(v)/100:px(v);const gx=pos(ps[0]||'0',r.width,gw),gy=pos(ps[1]||'0',r.height,gh);
      if(c)out.push({k:'R',nm:'Sublinhado',x:R(r.left+gx-ox),y:R(r.top+gy-oy),w:R(gw),h:Math.max(R(gh),0.5),op:relOp,bg:c})}
      else{try{const du=rasterGrad(cs.backgroundImage.split(/,\s*(?=(?:repeating-)?linear-gradient)/)[0],r.width,r.height);if(du){const iid=id('i');imgs[iid]=du;out.push({k:'R',nm:'Textura',x:R(r.left-ox),y:R(r.top-oy),w:R(r.width),h:R(r.height),op:relOp,rad:bp.rad,img:iid})}}catch(e){}}}
function textNode2(el,ox,oy,consumed,relOp,own){
  const parts=[];gather(el,parts,consumed);
  const chars=[];const rg=el.ownerDocument.createRange();let hard=false;
  for(const p of parts){if(p.br){chars.push({br:1});continue}
    const st=styleOf(p.el),t=p.tn.textContent;
    for(let i=0;i<t.length;i++){rg.setStart(p.tn,i);rg.setEnd(p.tn,i+1);const rs=rg.getClientRects();if(!rs.length)continue;const r=rs[0];if(r.width<0.01&&/\s/.test(t[i]))continue;
      const cr=clipRectOf(p.el),mx=r.left+r.width/2,my=r.top+r.height/2;if(mx<cr.l||mx>cr.r||my<cr.t||my>cr.b)continue;
      let c=t[i];if(/\s/.test(c))c=' ';chars.push({c,x:r.left,y:r.top,w:r.width,h:r.height,st})}}
  const lines=[];let cur=null,brk=false;
  for(const ch of chars){if(ch.br){cur=null;brk=true;continue}
    if(!cur||ch.y>cur.y+cur.h*0.5){cur={y:ch.y,h:ch.h,cs:[],hard:brk};brk=false;lines.push(cur)}else{const pv=cur.cs[cur.cs.length-1];if(pv&&pv.c!==' '&&ch.c!==' '&&ch.x-(pv.x+pv.w)>ch.st.sz*0.22)cur.cs.push({c:' ',x:pv.x+pv.w,y:ch.y,w:ch.x-(pv.x+pv.w),h:ch.h,st:pv.st})}
    cur.cs.push(ch);cur.h=Math.max(cur.h,ch.h)}
  lines.forEach(l=>{while(l.cs.length&&l.cs[l.cs.length-1].c===' ')l.cs.pop();while(l.cs.length&&l.cs[0].c===' ')l.cs.shift()});
  const L=lines.filter(l=>l.cs.length);if(!L.length)return null;
  const all=L.flatMap(l=>l.cs);const minX=Math.min(...all.map(c=>c.x)),maxX=Math.max(...all.map(c=>c.x+c.w));
  const st0=all[0].st;const ecs=getComputedStyle(el);
  const styles=[],segs=[];let s='';const key=st=>JSON.stringify([st.fam,st.wt,st.sz,st.c,st.ls,st.tt,st.td,st.it]);
  L.forEach((l,li)=>{if(li){const sep=l.hard?'\n':' ';s+=sep;const last=segs[segs.length-1];if(last)last[1]++}
    for(const ch of l.cs){const st=ch.st;let sk=key(st);if(/[↗→←↑↓]/.test(ch.c))sk+='I';let si=styles.findIndex(x=>x.k===sk);if(si<0){styles.push({k:sk,st,inter:/I$/.test(sk)});si=styles.length-1}
      const last=segs[segs.length-1];if(last&&last[2]===si&&last[1]===s.length)last[1]++;else segs.push([s.length,s.length+1,si]);s+=ch.c}});
  const lhs=L.length>1?(L[L.length-1].y-L[0].y)/(L.length-1):null;
  let lh=st0.lh==='normal'?(lhs||L[0].h):px(st0.lh);if(lhs&&Math.abs(lhs-lh)>1)lh=lhs;
  const al=ecs.textAlign;const n={k:'T',nm:own?cls(el):null,x:R(minX-ox),y:R(L[0].y-(lh-L[0].h)/2-oy),s,lh:R(lh*100)/100,segs,st:styles.map(x=>({f:x.inter?'Inter':(/BlackMango/i.test(x.st.fam)?'BM':x.st.fam),wt:x.st.wt,sz:x.st.sz,c:x.st.c,ls:x.st.ls,tt:x.st.tt,td:x.st.td,it:x.st.it})),op:relOp,bm:/BlackMango/i.test(st0.fam)?1:0};
  n.h=R(L.length*lh);n.w=R(maxX-minX);
  const multi=L.length>1&&L.some(l=>!l.hard)&&L.length>L.filter(l=>l.hard).length+1;
  if(L.length>1){const pr=el.getBoundingClientRect();const pl=px(ecs.paddingLeft)+px(ecs.borderLeftWidth),prr=px(ecs.paddingRight)+px(ecs.borderRightWidth);const cw=pr.width-pl-prr;
    if(multi&&own&&cw>0){n.fw=R(cw+1);n.x=R(pr.left+pl-ox);n.w=n.fw}else{n.fw=R(maxX-minX+2)}
    if(al==='center'||al==='right'||al==='end'){n.al=al==='end'?'right':al;if(own&&cw>0){n.fw=R(cw);n.x=R(pr.left+pl-ox);n.w=n.fw}}}
  return n}
function cls(el){const c=(el.className&&el.className.baseVal!==undefined?el.className.baseVal:el.className||'').toString().split(' ').filter(x=>x&&!/^(w-|__)/.test(x))[0];return c?c.replace(/_/g,' · ').replace(/-/g,' '):el.tagName.toLowerCase()}
const TOL=0.8;
function alDetect(F){
  const kids=F.ch.filter(c=>!c.abs&&!(c.rot&&Math.abs(c.rot)>0.2));if(!kids.length)return;
  const W_=F.w,H_=F.h;if(kids.some(c=>c.x<-0.5||c.y<-0.5))return;
  const eq=(a,b)=>Math.abs(a-b)<=TOL;
  const tryAxis=(dir)=>{const P=dir==='V'?'y':'x',S=dir==='V'?'h':'w',Q=dir==='V'?'x':'y',T=dir==='V'?'w':'h',FS=dir==='V'?H_:W_,FT=dir==='V'?W_:H_;
    const gaps=[];for(let i=1;i<kids.length;i++){const g=kids[i][P]-(kids[i-1][P]+kids[i-1][S]);gaps.push(g)}
    if(gaps.length&&!gaps.every(g=>eq(g,gaps[0])))return null;if(gaps.some(g=>g<-60))return null;
    if(kids.length>1&&dir==='H'&&kids.some((c,i)=>i&&c.x<kids[i-1].x))return null;if(kids.length>1&&dir==='V'&&kids.some((c,i)=>i&&c.y<kids[i-1].y))return null;
    const gap=gaps.length?R(gaps.reduce((a,b)=>a+b,0)/gaps.length):0;
    const padA=kids[0][P],padB=FS-(kids[kids.length-1][P]+kids[kids.length-1][S]);
    let ca=null;const qs=kids.map(c=>c[Q]),qe=kids.map(c=>c[Q]+c[T]),qc=kids.map(c=>c[Q]+c[T]/2);
    if(qs.every(v=>eq(v,qs[0])))ca={ca:'MIN',p1:qs[0],p2:Math.max(0,FT-Math.max(...qe))};
    else if(qc.every(v=>eq(v,qc[0]))){const p=qc[0]-FT/2;ca={ca:'CENTER',p1:Math.max(0,p*2),p2:Math.max(0,-p*2)}}
    else if(qe.every(v=>eq(v,qe[0])))ca={ca:'MAX',p1:Math.max(0,FT-qe[0]-0)&&0,p2:FT-qe[0]};
    if(!ca)return null;if(padA<-0.5)return null;
    return{mode:dir,gap,pa:padA,pb:Math.max(0,padB),ca:ca.ca,c1:R(ca.p1),c2:R(ca.p2)}};
  let r=tryAxis('V');if(!r&&kids.length>1)r=tryAxis('H');if(!r&&kids.length===1)r=tryAxis('H');
  if(!r&&kids.length>2){// wrap em linhas
    const rows=[];for(const c of kids){const row=rows.find(rr=>eq(rr.y,c.y));if(row)row.items.push(c);else rows.push({y:c.y,items:[c]})}
    if(rows.length>1&&rows.every(rr=>rr.items.every((c,i)=>!i||c.x>rr.items[i-1].x))){const hg=[];rows.forEach(rr=>rr.items.forEach((c,i)=>{if(i)hg.push(c.x-(rr.items[i-1].x+rr.items[i-1].w))}));const rh=rows.map(rr=>Math.max(...rr.items.map(c=>c.h)));const vg=[];for(let i=1;i<rows.length;i++)vg.push(rows[i].y-(rows[i-1].y+rh[i-1]));
      const x0=rows.map(rr=>rr.items[0].x);if(hg.length&&hg.every(g=>eq(g,hg[0]))&&vg.every(g=>eq(g,vg[0]))&&x0.every(v=>eq(v,x0[0])))r={mode:'H',wrap:1,gap:R(hg[0]),cgap:R(vg[0]),pa:x0[0],pb:0,ca:'MIN',c1:rows[0].y,c2:0}}}
  if(!r)return;
  // padding: V -> pa=top, pb=bottom, c1=left,c2=right ; H -> pa=left,pb=right,c1=top,c2=bottom
  F.al=r;}
function nodeOf(el,ctx,consumed){
  if(el.nodeType!==1||el.classList.contains('w-webflow-badge')||el.tagName==='SCRIPT'||el.tagName==='STYLE')return null;const cs=getComputedStyle(el);if(cs.display==='none')return null;
  if(!ctx.allowFixed&&cs.position==='fixed')return null;
  const op=ctx.op*(+cs.opacity);if(op<0.02)return null;
  const r=el.getBoundingClientRect();
  if((r.width<=2&&r.height<=2&&/hidden|clip/.test(cs.overflow))||/rect\(0px/.test(cs.clip||'')||/inset\(50%/.test(cs.clipPath||''))return null;
  const hasFixedKid=()=>ctx.allowFixed&&[...el.querySelectorAll('*')].some(x=>getComputedStyle(x).position==='fixed');
  const inClip=q=>!(q.right<ctx.clip.l-2||q.left>ctx.clip.r+2||q.bottom<ctx.clip.t-2||q.top>ctx.clip.b+2);
  if(!inClip(r)&&!hasFixedKid()&&![...el.querySelectorAll('*')].some(x=>{const q=x.getBoundingClientRect();return q.width>0&&q.height>0&&inClip(q)}))return null;
  if((r.width<0.5||r.height<0.5)&&!hasDirectText(el)&&![...el.querySelectorAll('*')].some(x=>{const q=x.getBoundingClientRect();return q.width>=1&&q.height>=1&&q.right>ctx.clip.l&&q.left<ctx.clip.r&&q.bottom>ctx.clip.t&&q.top<ctx.clip.b}))return null;
  const vis=cs.visibility!=='hidden';if(!vis&&![...el.querySelectorAll('*')].some(x=>getComputedStyle(x).visibility==='visible'))return null;const tag=el.tagName.toLowerCase();const ox=ctx.ox,oy=ctx.oy;
  const abs=/absolute|fixed/.test(cs.position);const ownOp=+(+cs.opacity).toFixed(3);const zi=parseInt(cs.zIndex);const zk=!abs?1:(isNaN(zi)||zi===0?2:(zi<0?0:3+zi));
  if(tag==='img'){if(!vis||r.width<1||r.height<1)return null;const iid=id('i');imgs[iid]=el.currentSrc||el.src;const bp=boxProps(el,cs);return{k:'I',nm:cls(el),id:iid,x:R(r.left-ox),y:R(r.top-oy),w:R(r.width),h:R(r.height),op:ownOp,rad:bp.rad,abs}}
  if(tag==='svg'){if(!vis)return null;const n=svgNode(el,ox,oy,ownOp);if(n){n.abs=abs;n.nm=cls(el)}return n}
  if(tag==='canvas'){if(!vis||r.width<1)return null;try{const iid=id('i');imgs[iid]=el.toDataURL('image/png');return{k:'I',nm:'canvas',id:iid,x:R(r.left-ox),y:R(r.top-oy),w:R(r.width),h:R(r.height),op:ownOp,abs}}catch(e){return null}}
  let m=cs.transform;let rot=0;if(m&&m!=='none'){const v=m.match(/matrix\(([^)]+)\)/);if(v){const a=v[1].split(',').map(Number);rot=Math.atan2(a[1],a[0])*180/Math.PI}}
  const isRot=Math.abs(rot)>0.2;let ur=r,saved=null;const cx=r.left+r.width/2,cy=r.top+r.height/2;
  if(isRot){saved=el.style.cssText;el.style.setProperty('transition','none','important');el.style.setProperty('transform','none','important');ur=el.getBoundingClientRect()}
  const w=ur.width,h=ur.height;const nx=isRot?cx-w/2:r.left,ny=isRot?cy-h/2:r.top;
  const bp=vis?boxProps(el,cs):{};const paint=bp.bg||bp.bd||bp.sh||bp.ish||bp.bgimg||bp.grad;
  const kidsEl=[...el.children];const txt=vis&&hasDirectText(el)&&!consumed.has(el);
  // só texto, sem caixa: devolve o texto
  if(txt&&!paint&&!isRot&&kidsEl.every(k=>{const d=getComputedStyle(k).display;return d==='none'||(d==='inline'&&k.tagName!=='IMG'&&k.tagName.toLowerCase()!=='svg'&&getComputedStyle(k).position!=='absolute')||k.tagName==='BR'})){const t=textNode2(el,ox,oy,consumed,op,true);if(t){t.abs=abs;t.op=ownOp;return t}}
  const clip=/hidden|clip/.test(cs.overflow+cs.overflowX+cs.overflowY);
  let iL=0,iT=0,iR=0,iB=0,cp=false;const icp=(cs.clipPath||'').match(/^inset\(([^)]+)\)/);if(icp&&!isRot){const v=icp[1].split(/\s+/).filter(x=>!/round/.test(x)).slice(0,4);const pv=(x,full)=>/%/.test(x)?full*px(x)/100:px(x);const a=v.length===1?[v[0],v[0],v[0],v[0]]:v.length===2?[v[0],v[1],v[0],v[1]]:v.length===3?[v[0],v[1],v[2],v[1]]:v;iT=pv(a[0],h);iR=pv(a[1],w);iB=pv(a[2],h);iL=pv(a[3],w);cp=iT+iR+iB+iL>0.5;if(w-iL-iR<0.5||h-iT-iB<0.5)return null}
  const F={k:'F',nm:cls(el),x:R(nx-ox+iL),y:R(ny-oy+iT),w:R(w-iL-iR),h:R(h-iT-iB),rot:isRot?+rot.toFixed(2):0,clip:clip||cp,op:ownOp,abs,ch:[]};
  if(vis){Object.assign(F,bp);delete F.grad;if(F.bgimg){const iid=id('i');imgs[iid]=F.bgimg;F.img=iid;delete F.bgimg}}
  const sub={...ctx,ox:ur.left+iL,oy:ur.top+iT,op:1,clip:(clip||cp)?{l:Math.max(ctx.clip.l,ur.left+iL),r:Math.min(ctx.clip.r,ur.right-iR),t:Math.max(ctx.clip.t,ur.top+iT),b:Math.min(ctx.clip.b,ur.bottom-iB)}:ctx.clip};
  if(vis&&bp.grad){const tmp=[];gradOut(el,cs,{left:ur.left,top:ur.top,width:w,height:h},ur.left+iL,ur.top+iT,1,bp,tmp);tmp.forEach(t=>{t.abs=true;F.ch.push(t)})}
  // ordem: texto direto na posição do primeiro nó de texto
  let textPlaced=false;const tnode=txt?textNode2(el,ur.left+iL,ur.top+iT,consumed,1,false):null;
  const flat=e=>{const o=[];for(const n of e.childNodes){if(n.nodeType===1&&getComputedStyle(n).display==='contents')o.push(...flat(n));else o.push(n)}return o};
  for(const n of flat(el)){if(n.nodeType===3&&n.textContent.trim()&&tnode&&!textPlaced){F.ch.push(tnode);textPlaced=true}
    if(n.nodeType===1&&!consumed.has(n)){const c=nodeOf(n,sub,consumed);if(c){const ccs=getComputedStyle(n);const zi=parseInt(ccs.zIndex);const pos=ccs.position!=='static';c.z=!pos?1:(isNaN(zi)||zi===0?2:(zi<0?0:3+zi));F.ch.push(c)}}}
  if(tnode&&!textPlaced)F.ch.push(tnode);
  if(saved!==null)el.style.cssText=saved;
  // ordenar por posição de fluxo não muda a ordem DOM; detetar auto layout
  if(!['grid','inline-grid'].includes(cs.display)||true)alDetect(F);
  F.ch.forEach((c,i)=>{c._i=i});const zq=c=>c.z??1;
  if(F.al){const flow=F.ch.filter(c=>!c.abs&&!(c.rot&&Math.abs(c.rot)>0.2));const absC=F.ch.filter(c=>!flow.includes(c));absC.sort((a,b)=>(zq(a)-zq(b))||(a._i-b._i));const res=[...flow];for(const a of absC){let at=res.length;for(let j=0;j<res.length;j++){const r=res[j];if(zq(r)>zq(a)||(zq(r)===zq(a)&&r._i>a._i)){at=j;break}}res.splice(at,0,a)}F.ch=res;const top=flow.reduce((m,c)=>zq(c)>zq(m)?c:m,flow[0]);if(top&&flow.indexOf(top)===0&&zq(top)>2&&flow.length>1)F.zrev=1}
  else F.ch.sort((a,b)=>(zq(a)-zq(b))||(a._i-b._i));
  F.ch.forEach(c=>{delete c._i});
  return F}
function materialize(doc){
  const w=doc.defaultView;if(!doc.getElementById('__matcss')){const s=doc.createElement('style');s.id='__matcss';s.textContent='.__mb::before{content:none!important}.__ma::after{content:none!important}';doc.head.appendChild(s)}
  doc.querySelectorAll('body *').forEach(e=>{if(e.closest('svg'))return;for(const p of ['::before','::after']){const cs=w.getComputedStyle(e,p);const c=cs.content;if(!c||c==='none'||c==='normal')continue;
    const sp=doc.createElement('span');sp.className='__mat';for(let i=0;i<cs.length;i++){const k=cs[i];try{sp.style.setProperty(k,cs.getPropertyValue(k))}catch(x){}}
    let txt='';const m=c.match(/^"(.*)"$/);if(m)txt=m[1];else if(/counter/.test(c)){const cl=e.className.toString().split(' ')[0];const sib=cl?[...doc.querySelectorAll('.'+cl)]:[e];const n=sib.indexOf(e)+1;txt=/leading-zero/.test(c)?String(n).padStart(2,'0'):String(n)}
    sp.textContent=txt;if(p==='::before'){e.insertBefore(sp,e.firstChild);e.classList.add('__mb')}else{e.appendChild(sp);e.classList.add('__ma')}}})}
return{
  svgs:()=>svgs,imgs:()=>imgs,reset(){svgs={};imgs={};CR.clear()},
  materialize:()=>materialize(W().document),
  cap(root,{allowFixed=false,name=null,originEl=null,region=null}={}){CR.clear();const r0=(originEl||root).getBoundingClientRect();const r=region?{left:region.x,top:region.y,right:region.x+region.w,bottom:region.y+region.h}:r0;const consumed=new Set();
    const n=nodeOf(root,{ox:r.left,oy:r.top,op:1,clip:{l:r.left,r:r.right,t:r.top,b:r.bottom},allowFixed},consumed);if(n&&name)n.nm=name;
    if(n&&region){const F={k:'F',nm:name||'Região',x:0,y:0,w:region.w,h:region.h,clip:true,op:1,ch:[n],bg:n.bg};n.bg=null;n.abs=true;return F}
    if(n){n.x=0;n.y=0;n.abs=false}return n},
  sleep,W
}})();
'ok'
