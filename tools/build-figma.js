// Constrói no Figma as secções capturadas. Parâmetros: DATA, TARGET, FROM, TO, Y0
const dn=await figma.getNodeByIdAsync(DATA);
const raw=dn.findAll(x=>x.type==="TEXT").sort((a,b)=>a.y-b.y).map(t=>t.characters).join('');
const A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';const LK={};for(let i=0;i<64;i++)LK[A[i]]=i;
const by=[];for(let i=0;i<raw.length;i+=4){const a=LK[raw[i]],b=LK[raw[i+1]],c=LK[raw[i+2]],d=LK[raw[i+3]];by.push((a<<2)|(b>>4));if(raw[i+2]!=='=')by.push(((b&15)<<4)|(c>>2));if(raw[i+3]!=='=')by.push(((c&3)<<6)|d)}
let js='';for(let i=0;i<by.length;){const b=by[i++];if(b<128)js+=String.fromCharCode(b);else if(b<224){js+=String.fromCharCode(((b&31)<<6)|(by[i++]&63))}else if(b<240){const b1=by[i++],b2=by[i++];js+=String.fromCharCode(((b&15)<<12)|((b1&63)<<6)|(b2&63))}else{const b1=by[i++],b2=by[i++],b3=by[i++];js+=String.fromCodePoint(((b&7)<<18)|((b1&63)<<12)|((b2&63)<<6)|(b3&63))}}
const D=JSON.parse(js);
const cols=await figma.variables.getLocalVariableCollectionsAsync();const brandC=cols.find(c=>c.name==='Brand');const brand={};
for(const vid of brandC.variableIds){const v=await figma.variables.getVariableByIdAsync(vid);const val=v.valuesByMode[brandC.defaultModeId];if(val&&val.r!==undefined)brand[[val.r,val.g,val.b].map(x=>Math.round(x*255)).join(',')]=v}
const paint=c=>{const p={type:'SOLID',color:{r:c[0]/255,g:c[1]/255,b:c[2]/255},opacity:c[3]??1};const v=brand[c.slice(0,3).join(',')];return v?figma.variables.setBoundVariableForPaint(p,'color',v):p};
const WN={1:'Thin',2:'ExtraLight',3:'Light',4:'Regular',5:'Medium',6:'SemiBold',7:'Bold',8:'ExtraBold',9:'Black'};const done=new Set();
async function fnt(f,wt,it){const fam=f==='Inter'?'Inter':'Raleway';let st=WN[Math.round(wt/100)]||'Regular';if(fam==='Inter')st=st.replace('SemiBold','Semi Bold').replace('ExtraBold','Extra Bold').replace('ExtraLight','Extra Light');if(it)st=st==='Regular'?'Italic':st+' Italic';const fn={family:fam,style:st};const k=fam+st;if(!done.has(k)){try{await figma.loadFontAsync(fn)}catch(e){fn.style='Regular';await figma.loadFontAsync(fn)}done.add(k)}return fn}
const IMG=[];
function place(f,n){if(n.rot&&Math.abs(n.rot)>0.2){const a=n.rot*Math.PI/180,c=Math.cos(a),s=Math.sin(a),cx=n.x+n.w/2,cy=n.y+n.h/2;f.relativeTransform=[[c,-s,cx-(c*n.w/2-s*n.h/2)],[s,c,cy-(s*n.w/2+c*n.h/2)]]}else{f.x=n.x;f.y=n.y}}
function box(f,n){const fl=[];if(n.bg)fl.push(paint(n.bg));f.fills=fl;if(n.rad){f.topLeftRadius=n.rad[0];f.topRightRadius=n.rad[1];f.bottomRightRadius=n.rad[2];f.bottomLeftRadius=n.rad[3]}
  if(n.bd){f.strokes=[paint(n.bd.c)];f.strokeAlign='INSIDE';const w=n.bd.w;if(w.every(x=>x===w[0]))f.strokeWeight=w[0];else{f.strokeTopWeight=w[0];f.strokeRightWeight=w[1];f.strokeBottomWeight=w[2];f.strokeLeftWeight=w[3]}}
  const ef=[];for(const [k,t] of [['sh','DROP_SHADOW'],['ish','INNER_SHADOW']]){const v=n[k];if(v&&v[4]){const c=v[4];ef.push({type:t,color:{r:c[0]/255,g:c[1]/255,b:c[2]/255,a:c[3]},offset:{x:v[0],y:v[1]},radius:v[2],spread:v[3],visible:true,blendMode:'NORMAL'})}}if(ef.length)f.effects=ef;
  if(n.op!==undefined&&n.op<1)f.opacity=n.op}
async function build(par,n){
  if(n.k==='R'||n.k==='F'){const f=n.k==='F'?figma.createFrame():figma.createRectangle();par.appendChild(f);f.name=n.nm||'Caixa';f.resize(Math.max(n.w,0.01),Math.max(n.h,0.01));box(f,n);if(n.img)IMG.push([f.id,n.img]);
    if(n.k==='F'){f.clipsContent=!!n.clip;for(const c of n.ch)await build(f,c)}place(f,n);return}
  if(n.k==='T'){const t=figma.createText();par.appendChild(t);const s0=n.st[n.segs[0][2]];t.fontName=await fnt(s0.f,s0.wt,s0.it);t.characters=n.s;
    for(const [a,b,si] of n.segs){const st=n.st[si];t.setRangeFontName(a,b,await fnt(st.f,st.wt,st.it));t.setRangeFontSize(a,b,st.sz);t.setRangeFills(a,b,[paint(st.c)]);if(st.ls)t.setRangeLetterSpacing(a,b,{unit:'PIXELS',value:st.ls});if(st.td)t.setRangeTextDecoration(a,b,'UNDERLINE');if(st.tt==='uppercase')t.setRangeTextCase(a,b,'UPPER')}
    t.lineHeight={unit:'PIXELS',value:n.lh};t.textAutoResize='WIDTH_AND_HEIGHT';if(n.al)t.textAlignHorizontal=n.al==='center'?'CENTER':'RIGHT';
    t.x=n.x;t.y=n.y;if(n.op<1)t.opacity=n.op;return}
  if(n.k==='I'){const r=figma.createRectangle();par.appendChild(r);r.name='Imagem';r.resize(Math.max(n.w,1),Math.max(n.h,1));r.fills=[paint([235,195,177,1])];if(n.rad){r.topLeftRadius=n.rad[0];r.topRightRadius=n.rad[1];r.bottomRightRadius=n.rad[2];r.bottomLeftRadius=n.rad[3]}r.x=n.x;r.y=n.y;if(n.op<1)r.opacity=n.op;IMG.push([r.id,n.id]);return}
  if(n.k==='S'||n.k==='V'){const src=D.svgs[n.id];if(!src)return;let g;try{g=figma.createNodeFromSvg(src)}catch(e){return}par.appendChild(g);g.fills=[];g.clipsContent=false;
    if(n.k==='V'){const m=n.meta;g.name=`Título · ${m.t.replace(/\n/g,' ').slice(0,60)}`}else g.name='Vetor';
    g.x=n.x;g.y=n.y;if(n.op<1)g.opacity=n.op;return}
}
const T=await figma.getNodeByIdAsync(TARGET);let y=Y0;const made=[];
for(let i=FROM;i<TO&&i<D.secs.length;i++){const s=D.secs[i];const f=figma.createFrame();T.appendChild(f);f.name=s.nm;f.resize(T.width,s.h);f.x=0;f.y=y;f.fills=[];f.clipsContent=true;
  for(const n of s.nodes)await build(f,n);y+=s.h;made.push([s.nm,f.id,f.children.length])}
return {made,nextY:y,IMG,total:D.secs.length}
