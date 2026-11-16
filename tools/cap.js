/* Captura uma secção renderizada (dentro do iframe #fr) para reconstruir no Figma. */
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
function textNode(el,ox,oy,consumed,relOp){
  const parts=[];gather(el,parts,consumed);
  const chars=[];const rg=el.ownerDocument.createRange();
  for(const p of parts){if(p.br){chars.push({br:1});continue}
    const st=styleOf(p.el),t=p.tn.textContent;
    for(let i=0;i<t.length;i++){rg.setStart(p.tn,i);rg.setEnd(p.tn,i+1);const rs=rg.getClientRects();if(!rs.length)continue;const r=rs[0];if(r.width<0.01&&/\s/.test(t[i]))continue;
      const cr=clipRectOf(p.el),mx=r.left+r.width/2,my=r.top+r.height/2;if(mx<cr.l||mx>cr.r||my<cr.t||my>cr.b)continue;
      let c=t[i];if(/\s/.test(c))c=' ';chars.push({c,x:r.left,y:r.top,w:r.width,h:r.height,st})}}
  const real=chars.filter(c=>!c.br);if(!real.length)return null;
  // linhas
  const lines=[];let cur=null;
  for(const ch of chars){if(ch.br){cur=null;continue}
    if(!cur||ch.y>cur.y+cur.h*0.5){cur={y:ch.y,h:ch.h,cs:[]};lines.push(cur)}else{const pv=cur.cs[cur.cs.length-1];if(pv&&pv.c!==' '&&ch.c!==' '&&ch.x-(pv.x+pv.w)>ch.st.sz*0.22)cur.cs.push({c:' ',x:pv.x+pv.w,y:ch.y,w:ch.x-(pv.x+pv.w),h:ch.h,st:pv.st})}cur.cs.push(ch);cur.h=Math.max(cur.h,ch.h)}
  lines.forEach(l=>{while(l.cs.length&&l.cs[l.cs.length-1].c===' ')l.cs.pop();while(l.cs.length&&l.cs[0].c===' ')l.cs.shift()});
  const L=lines.filter(l=>l.cs.length);if(!L.length)return null;
  const all=L.flatMap(l=>l.cs);const minX=Math.min(...all.map(c=>c.x)),maxX=Math.max(...all.map(c=>c.x+c.w)),minY=Math.min(...all.map(c=>c.y)),maxY=Math.max(...all.map(c=>c.y+c.h));
  const st0=all[0].st;const ecs=getComputedStyle(el);
  const isBM=/BlackMango/i.test(st0.fam);
  const txt=L.map(l=>l.cs.map(c=>c.c).join('')).join('\n');
  if(isBM){
    const f=font;const paths={};
    for(const ch of all){if(ch.c===' ')continue;const s=ch.st.sz/1000;const v=f.getVariation?f.getVariation({wght:ch.st.wt}):f;
      let c=ch.c;if(ch.st.tt==='uppercase')c=c.toUpperCase();const g=v.layout(c).glyphs[0];if(!g)continue;
      const base=ch.y+(ch.h-1520*s)/2+1100*s;const gx=ch.x-minX,gy=base-minY;
      const k=ch.st.c.join(',');let d=paths[k]||'';
      for(const cm of g.path.commands){const a=cm.args;const P=(i)=>R2(gx+a[i]*s)+' '+R2(gy-a[i+1]*s);
        if(cm.command==='moveTo')d+='M'+P(0);else if(cm.command==='lineTo')d+='L'+P(0);else if(cm.command==='quadraticCurveTo')d+='Q'+P(0)+' '+P(2);else if(cm.command==='bezierCurveTo')d+='C'+P(0)+' '+P(2)+' '+P(4);else if(cm.command==='closePath')d+='Z'}
      paths[k]=d}
    const w=R(maxX-minX)+1,h=R(maxY-minY)+1;const sid=id('t');
    svgs[sid]=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`+Object.entries(paths).map(([k,d])=>{const c=k.split(',');return`<path fill="rgb(${c[0]},${c[1]},${c[2]})"${+c[3]<1?` fill-opacity="${c[3]}"`:''} d="${d}"/>`}).join('')+'</svg>';
    return{k:'V',id:sid,x:R(minX-ox),y:R(minY-oy),w,h,op:relOp,meta:{t:txt,sz:st0.sz,wt:st0.wt,lh:st0.lh,ls:st0.ls,c:st0.c,al:ecs.textAlign}}}
  // texto normal
  const styles=[],segs=[];let s='';const key=st=>JSON.stringify([st.fam,st.wt,st.sz,st.c,st.ls,st.tt,st.td,st.it]);
  L.forEach((l,li)=>{if(li)s+='\u2028';for(const ch of l.cs){let st=ch.st;let sk=key(st);if(ch.c==='↗'||ch.c==='→'||ch.c==='←'){sk=sk+'I'}let si=styles.findIndex(x=>x.k===sk);if(si<0){styles.push({k:sk,st,inter:/I$/.test(sk)});si=styles.length-1}
    const last=segs[segs.length-1];if(last&&last[2]===si&&last[1]===s.length)last[1]++;else segs.push([s.length,s.length+1,si]);s+=ch.c}
    const last=segs[segs.length-1];if(li<L.length-1&&last)last[1]++});
  const lhs=L.length>1?(L[L.length-1].y-L[0].y)/(L.length-1):null;
  let lh=st0.lh==='normal'?(lhs||L[0].h):px(st0.lh);if(lhs&&Math.abs(lhs-lh)>1)lh=lhs;
  const al=ecs.textAlign;const pr=el.getBoundingClientRect();
  const n={k:'T',x:R(minX-ox),y:R(L[0].y-(lh-L[0].h)/2-oy),s,lh:R(lh*100)/100,segs,st:styles.map(x=>({f:x.inter?'Inter':x.st.fam,wt:x.st.wt,sz:x.st.sz,c:x.st.c,ls:x.st.ls,tt:x.st.tt,td:x.st.td,it:x.st.it})),op:relOp};
  if((al==='center'||al==='right'||al==='end')&&L.length>1){n.al=al==='end'?'right':al}
  return n}
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
function walk(el,ctx,out,consumed){
  if(el.nodeType!==1||el.id==='__x')return;
  const cs=getComputedStyle(el);if(cs.display==='none')return;
  if(!ctx.allowFixed&&cs.position==='fixed')return;
  if(ctx.skip&&ctx.skip(el))return;
  const op=ctx.op*(+cs.opacity);if(op<0.02)return;
  const r=el.getBoundingClientRect();
  if((r.width<=2&&r.height<=2&&/hidden|clip/.test(cs.overflow))||/rect\(0px/.test(cs.clip||'')||/inset\(50%/.test(cs.clipPath||''))return;
  if(r.right<ctx.clip.l-2||r.left>ctx.clip.r+2||r.bottom<ctx.clip.t-2||r.top>ctx.clip.b+2){if(cs.overflow==='visible'&&el.children.length){/* filhos podem sair */}else return}
  const vis=cs.visibility!=='hidden';const relOp=+(op).toFixed(3);
  const tag=el.tagName.toLowerCase();
  let m=cs.transform;let rot=0;if(m&&m!=='none'){const v=m.match(/matrix\(([^)]+)\)/);if(v){const a=v[1].split(',').map(Number);rot=Math.atan2(a[1],a[0])*180/Math.PI}}
  const clipper=/hidden|clip/.test(cs.overflow+cs.overflowX+cs.overflowY)&&el.children.length>0&&tag!=='svg';
  if(Math.abs(rot)>0.2||clipper){
    let ur=r,saved=null;const cx=r.left+r.width/2,cy=r.top+r.height/2;
    if(Math.abs(rot)>0.2){saved=el.style.cssText;el.style.setProperty('transition','none','important');el.style.setProperty('transform','none','important');ur=el.getBoundingClientRect()}
    const w=ur.width,h=ur.height;const nx=Math.abs(rot)>0.2?cx-w/2:r.left,ny=Math.abs(rot)>0.2?cy-h/2:r.top;
    const F={k:'F',nm:(el.className.toString().split(' ')[0]||tag),x:R(nx-ctx.ox),y:R(ny-ctx.oy),w:R(w),h:R(h),rot:+rot.toFixed(2),clip:clipper,op:+(+cs.opacity).toFixed(3),ch:[]};
    if(vis){const bp=boxProps(el,cs);Object.assign(F,bp);delete F.grad;if(F.bgimg){const iid=id('i');imgs[iid]=F.bgimg;F.img=iid;delete F.bgimg}gradOut(el,cs,{left:0,top:0,width:w,height:h},0,0,1,bp,F.ch)}
    const sub={...ctx,ox:ur.left,oy:ur.top,op:1,clip:clipper?{l:ur.left,r:ur.right,t:ur.top,b:ur.bottom}:{l:-1e5,r:1e5,t:-1e5,b:1e5}};
    inner(el,cs,sub,F.ch,consumed,1,ur);
    if(saved!==null)el.style.cssText=saved;
    out.push(F);return}
  if(vis){const bp=boxProps(el,cs);if(tag!=='img'&&(bp.bg||bp.bd||bp.sh||bp.ish||bp.bgimg)&&r.width>0.5&&r.height>0.5){const n={k:'R',nm:(el.className.toString().split(' ')[0]||tag),x:R(r.left-ctx.ox),y:R(r.top-ctx.oy),w:R(r.width),h:R(r.height),op:relOp,...bp};if(bp.bgimg){const iid=id('i');imgs[iid]=bp.bgimg;n.img=iid;delete n.bgimg}out.push(n)}
    gradOut(el,cs,r,ctx.ox,ctx.oy,relOp,bp,out)}
  inner(el,cs,ctx,out,consumed,relOp,r,vis)}
function inner(el,cs,ctx,out,consumed,relOp,r,vis=true){
  const tag=el.tagName.toLowerCase();const ox=ctx.ox,oy=ctx.oy;
  if(tag==='img'){if(vis&&r.width>1&&r.height>1){const iid=id('i');imgs[iid]=el.currentSrc||el.src;const bp=boxProps(el,cs);out.push({k:'I',id:iid,x:R(r.left-ox),y:R(r.top-oy),w:R(r.width),h:R(r.height),op:relOp,rad:bp.rad,fit:cs.objectFit})}return}
  if(tag==='svg'){if(vis){const n=svgNode(el,ox,oy,relOp);n&&out.push(n)}return}
  if(tag==='canvas'){if(vis&&r.width>1){try{const iid=id('i');imgs[iid]=el.toDataURL('image/png');out.push({k:'I',id:iid,x:R(r.left-ox),y:R(r.top-oy),w:R(r.width),h:R(r.height),op:relOp,fit:'fill'})}catch(e){}}return}
  if(vis&&hasDirectText(el)&&!consumed.has(el)){const t=textNode(el,ox,oy,consumed,relOp);t&&out.push(t)}
  for(const c of el.children){if(consumed.has(c))continue;walk(c,{...ctx,op:relOp/(+cs.opacity||1)*(+cs.opacity)},out,consumed)}
}
// materializa pseudo-elementos visíveis
function materialize(doc){
  const w=doc.defaultView;if(!doc.getElementById('__matcss')){const s=doc.createElement('style');s.id='__matcss';s.textContent='.__mb::before{content:none!important}.__ma::after{content:none!important}';doc.head.appendChild(s)}
  doc.querySelectorAll('body *').forEach(e=>{if(e.closest('svg'))return;for(const p of ['::before','::after']){const cs=w.getComputedStyle(e,p);const c=cs.content;if(!c||c==='none'||c==='normal')continue;
    const sp=doc.createElement('span');sp.className='__mat';for(let i=0;i<cs.length;i++){const k=cs[i];try{sp.style.setProperty(k,cs.getPropertyValue(k))}catch(x){}}
    let txt='';const m=c.match(/^"(.*)"$/);if(m)txt=m[1];else if(/counter/.test(c)){const cls=e.className.toString().split(' ')[0];const sib=cls?[...doc.querySelectorAll('.'+cls)]:[e];const n=sib.indexOf(e)+1;txt=/leading-zero/.test(c)?String(n).padStart(2,'0'):String(n)}
    sp.textContent=txt;if(p==='::before'){e.insertBefore(sp,e.firstChild);e.classList.add('__mb')}else{e.appendChild(sp);e.classList.add('__ma')}}})}
return{
  svgs:()=>svgs,imgs:()=>imgs,reset(){svgs={};imgs={};CR.clear()},setFont(f){font=f},
  async loadFont(){if(font)return;let rule;const d=W().document;for(const ss of d.styleSheets){try{for(const r of ss.cssRules){if(r.type===5&&/VF/.test(r.style.fontFamily))rule=r}}catch(e){}}
    const m=rule.style.getPropertyValue('src').match(/base64,([^")]+)/);const bin=Uint8Array.from(atob(m[1]),c=>c.charCodeAt(0));const fk=await import('https://esm.sh/fontkit@2.0.4?bundle');font=fk.create(bin)},
  materialize:()=>materialize(W().document),
  cap(root,{allowFixed=false,skip=null,originEl=null}={}){CR.clear();const r=(originEl||root).getBoundingClientRect();const out=[];const consumed=new Set();
    walk(root,{ox:r.left,oy:r.top,op:1,clip:{l:r.left,r:r.right,t:r.top,b:r.bottom},allowFixed,skip},out,consumed);return out},
  sleep,W
}})();
'ok'