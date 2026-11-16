// Constrói árvores capturadas com auto layout. Parâmetros: DATA (nó com os dados), TARGET (frame da página), MODE ('replace'|'append')
const dn=await figma.getNodeByIdAsync(DATA);
const raw=dn.findAll(x=>x.type==="TEXT").sort((a,b)=>a.y-b.y).map(t=>t.characters).join('');
const A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';const LK={};for(let i=0;i<64;i++)LK[A[i]]=i;
const by=[];for(let i=0;i<raw.length;i+=4){const a=LK[raw[i]],b=LK[raw[i+1]],c=LK[raw[i+2]],d=LK[raw[i+3]];by.push((a<<2)|(b>>4));if(raw[i+2]!=='=')by.push(((b&15)<<4)|(c>>2));if(raw[i+3]!=='=')by.push(((c&3)<<6)|d)}
let js='';for(let i=0;i<by.length;){const b=by[i++];if(b<128)js+=String.fromCharCode(b);else if(b<224){js+=String.fromCharCode(((b&31)<<6)|(by[i++]&63))}else if(b<240){const b1=by[i++],b2=by[i++];js+=String.fromCharCode(((b&15)<<12)|((b1&63)<<6)|(b2&63))}else{const b1=by[i++],b2=by[i++],b3=by[i++];js+=String.fromCodePoint(((b&7)<<18)|((b1&63)<<12)|((b2&63)<<6)|(b3&63))}}
const D=JSON.parse(js);
const cols=await figma.variables.getLocalVariableCollectionsAsync();const brandC=cols.find(c=>c.name==='Brand');const brand={};
for(const vid of brandC.variableIds){const v=await figma.variables.getVariableByIdAsync(vid);const val=v.valuesByMode[brandC.defaultModeId];if(val&&val.r!==undefined)brand[[val.r,val.g,val.b].map(x=>Math.round(x*255)).join(',')]=v}
const paint=c=>{const p={type:'SOLID',color:{r:c[0]/255,g:c[1]/255,b:c[2]/255},opacity:c[3]??1};const v=brand[c.slice(0,3).join(',')];if(!v||p.opacity<0.999)return p;return figma.variables.setBoundVariableForPaint(p,'color',v)};
const WN={1:'Thin',2:'ExtraLight',3:'Light',4:'Regular',5:'Medium',6:'SemiBold',7:'Bold',8:'ExtraBold',9:'Black'};const done=new Set();
async function fnt(f,wt,it){let fam=f==='Inter'?'Inter':f==='BM'?'Cormorant Garamond':'Raleway';let st=WN[Math.round(wt/100)]||'Regular';if(fam!=='Raleway')st=st.replace('SemiBold','Semi Bold').replace('ExtraBold','Extra Bold').replace('ExtraLight','Extra Light');if(fam==='Cormorant Garamond'&&!['Light','Regular','Medium','Semi Bold','Bold'].includes(st))st='Regular';if(it)st=st==='Regular'?'Italic':st+' Italic';const fn={family:fam,style:st};const k=fam+st;if(!done.has(k)){try{await figma.loadFontAsync(fn)}catch(e){fn.style='Regular';await figma.loadFontAsync(fn)}done.add(k)}return fn}
const IMG=[];
function rotate(f,n){const a=n.rot*Math.PI/180,c=Math.cos(a),s=Math.sin(a),cx=n.x+n.w/2,cy=n.y+n.h/2;f.relativeTransform=[[c,-s,cx-(c*n.w/2-s*n.h/2)],[s,c,cy-(s*n.w/2+c*n.h/2)]]}
function box(f,n){const fl=[];if(n.bg)fl.push(paint(n.bg));f.fills=fl;if(n.rad){f.topLeftRadius=n.rad[0];f.topRightRadius=n.rad[1];f.bottomRightRadius=n.rad[2];f.bottomLeftRadius=n.rad[3]}
  if(n.bd){f.strokes=[paint(n.bd.c)];f.strokeAlign='INSIDE';const w=n.bd.w;if(w.every(x=>x===w[0]))f.strokeWeight=w[0];else{f.strokeTopWeight=w[0];f.strokeRightWeight=w[1];f.strokeBottomWeight=w[2];f.strokeLeftWeight=w[3]}}
  const ef=[];for(const [k,t] of [['sh','DROP_SHADOW'],['ish','INNER_SHADOW']]){const v=n[k];if(v&&v[4]){const c=v[4];ef.push({type:t,color:{r:c[0]/255,g:c[1]/255,b:c[2]/255,a:c[3]},offset:{x:v[0],y:v[1]},radius:v[2],spread:v[3],visible:true,blendMode:'NORMAL'})}}if(ef.length)f.effects=ef;
  if(n.op!==undefined&&n.op<1)f.opacity=n.op}
async function mk(n){
  if(n.k==='F'){const f=figma.createFrame();f.name=n.nm||'Frame';f.resize(Math.max(n.w,0.01),Math.max(n.h,0.01));box(f,n);f.clipsContent=!!n.clip;if(n.img)IMG.push([f.id,n.img]);
    const kids=[];for(const c of n.ch){const k=await mk(c);if(k){f.appendChild(k);kids.push([k,c])}}
    if(n.al){const a=n.al;f.layoutMode=a.mode==='V'?'VERTICAL':'HORIZONTAL';if(a.wrap){f.layoutWrap='WRAP';f.counterAxisSpacing=a.cgap}f.itemSpacing=a.gap;f.primaryAxisAlignItems='MIN';f.counterAxisAlignItems=a.ca;
      const P0=v=>Math.max(0,v||0);if(a.mode==='V'){f.paddingTop=P0(a.pa);f.paddingBottom=P0(a.pb);f.paddingLeft=P0(a.c1);f.paddingRight=P0(a.c2)}else{f.paddingLeft=P0(a.pa);f.paddingRight=P0(a.pb);f.paddingTop=P0(a.c1);f.paddingBottom=P0(a.c2)}
      f.primaryAxisSizingMode='FIXED';f.counterAxisSizingMode='FIXED';f.resize(Math.max(n.w,0.01),Math.max(n.h,0.01));if(n.zrev)f.itemReverseZIndex=true;
      for(const [k,c] of kids){if(c.abs||(c.rot&&Math.abs(c.rot)>0.2)){k.layoutPositioning='ABSOLUTE';if(c.rot&&Math.abs(c.rot)>0.2)rotate(k,c);else{k.x=c.x;k.y=c.y}}}
      if(!a.wrap&&a.mode==='V'){f.primaryAxisSizingMode='AUTO'}else if(!a.wrap&&a.mode==='H'){/* largura fixa */}else{f.counterAxisSizingMode='AUTO'}
    }else{for(const [k,c] of kids){if(c.rot&&Math.abs(c.rot)>0.2)rotate(k,c);else{k.x=c.x;k.y=c.y}}}
    return f}
  if(n.k==='T'){const t=figma.createText();const s0=n.st[n.segs[0][2]];t.fontName=await fnt(s0.f,s0.wt,s0.it);t.characters=n.s;
    for(const [a,b,si] of n.segs){const st=n.st[si];t.setRangeFontName(a,b,await fnt(st.f,st.wt,st.it));t.setRangeFontSize(a,b,st.sz);t.setRangeFills(a,b,[paint(st.c)]);if(st.ls)t.setRangeLetterSpacing(a,b,{unit:'PIXELS',value:st.ls});if(st.td)t.setRangeTextDecoration(a,b,'UNDERLINE');if(st.tt==='uppercase')t.setRangeTextCase(a,b,'UPPER')}
    t.lineHeight={unit:'PIXELS',value:n.lh};if(n.fw){t.textAutoResize='HEIGHT';t.resize(n.fw,t.height)}else t.textAutoResize='WIDTH_AND_HEIGHT';
    if(n.al)t.textAlignHorizontal=n.al==='center'?'CENTER':'RIGHT';if(n.bm)t.name='Título';else if(n.nm&&n.nm!=='span'&&n.nm!=='div')t.name=n.s.slice(0,40);
    if(n.op<1)t.opacity=n.op;return t}
  if(n.k==='I'){const r=figma.createRectangle();r.name=n.nm&&n.nm!=='img'?n.nm:'Imagem';r.resize(Math.max(n.w,1),Math.max(n.h,1));r.fills=[paint([235,195,177,1])];if(n.rad){r.topLeftRadius=n.rad[0];r.topRightRadius=n.rad[1];r.bottomRightRadius=n.rad[2];r.bottomLeftRadius=n.rad[3]}if(n.op<1)r.opacity=n.op;IMG.push([r.id,n.id]);return r}
  if(n.k==='S'){const src=D.svgs[n.id];if(!src)return null;let g;try{g=figma.createNodeFromSvg(src)}catch(e){return null}g.fills=[];g.clipsContent=false;g.name=n.nm&&n.nm!=='svg'?n.nm:'Ícone';if(n.op<1)g.opacity=n.op;return g}
  if(n.k==='R'){const r=figma.createRectangle();r.name=n.nm||'Caixa';r.resize(Math.max(n.w,0.01),Math.max(n.h,0.01));box(r,n);if(n.img)IMG.push([r.id,n.img]);return r}
  return null}
const T=await figma.getNodeByIdAsync(TARGET);if(MODE==='replace')for(const c of [...T.children])c.remove();
T.layoutMode='VERTICAL';T.itemSpacing=0;T.paddingTop=T.paddingBottom=T.paddingLeft=T.paddingRight=0;T.primaryAxisSizingMode='AUTO';T.counterAxisSizingMode='FIXED';T.clipsContent=true;
const made=[];const ov=[];
for(const s of D.secs){const f=await mk(s.node);if(!f)continue;f.name=s.nm;T.appendChild(f);if(s.ov){f.layoutPositioning='ABSOLUTE';ov.push(f)}made.push(s.nm+'='+f.id)}
for(const f of ov){f.x=0;f.y=T.height-f.height}
return {made:made.join(' | '),H:T.height,IMG:IMG.map(a=>a.join('=')).join(' ')}
