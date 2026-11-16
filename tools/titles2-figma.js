// Títulos (use_figma), depois de build3. Substituir __SEC__ e __FRAMES__ (ids das frames construídas, JSON).
const pg=figma.root.children.find(p=>p.id==="1:5");await figma.setCurrentPageAsync(pg);
const S=await figma.getNodeByIdAsync("__SEC__");const FR=__FRAMES__;const roots=[];for(const id of FR){const n=await figma.getNodeByIdAsync(id);if(n)roots.push(n)}
const isC=t=>t.type==='TEXT'&&t.fontName!==figma.mixed&&t.fontName.family==='Cormorant Garamond';
for(const s of ['Light','Regular','Medium','SemiBold'])await figma.loadFontAsync({family:'Cormorant Garamond',style:s});
const piece=c=>isC(c)||(c.type==='FRAME'&&c.children.length===1&&isC(c.children[0]));
let merged=0;
for(const R of roots){for(const G of R.findAll(n=>n.type==='FRAME'&&n.children.length>=2&&n.children.every(piece))){
  const ps=G.children.map(c=>c.type==='TEXT'?{t:c,x:c.x,y:c.y}:{t:c.children[0],x:c.x+c.children[0].x,y:c.y+c.children[0].y});
  ps.sort((a,b)=>a.y-b.y||a.x-b.x);const lines=[];for(const p of ps){const L=lines.find(l=>Math.abs(l.y-p.y)<4);if(L)L.w.push(p);else lines.push({y:p.y,w:[p]})}
  lines.forEach(l=>l.w.sort((a,b)=>a.x-b.x));const words=lines.some(l=>l.w.length>1);
  const f0=ps[0].t;const nt=figma.createText();G.appendChild(nt);nt.fontName=f0.fontName;
  let s='';const rng=[];lines.forEach((l,li)=>{l.w.forEach((p,wi)=>{const a=s.length;s+=p.t.characters.trim();const fl=p.t.fills===figma.mixed?p.t.getRangeFills(0,1):p.t.fills;rng.push([a,s.length,fl]);const nx=l.w[wi+1];if(nx&&nx.x-(p.x+p.t.width)>p.t.fontSize*0.12)s+=' '});if(li<lines.length-1)s+=words?' ':'\n'});
  nt.characters=s;nt.fontSize=f0.fontSize;nt.lineHeight=lines.length>1?{unit:'PIXELS',value:lines[1].y-lines[0].y}:f0.lineHeight;nt.letterSpacing=f0.letterSpacing;
  for(const [a,b,fl] of rng)if(b>a)nt.setRangeFills(a,b,JSON.parse(JSON.stringify(fl)));
  if(f0.textAlignHorizontal!=='LEFT')nt.textAlignHorizontal=f0.textAlignHorizontal;nt.name='Título';
  if(words){nt.textAutoResize='HEIGHT';nt.resize(G.width,nt.height)}else nt.textAutoResize='WIDTH_AND_HEIGHT';
  const op=f0.opacity;for(const c of [...G.children])if(c!==nt)c.remove();
  G.layoutWrap='NO_WRAP';G.layoutMode='VERTICAL';G.itemSpacing=0;G.paddingTop=G.paddingBottom=G.paddingLeft=G.paddingRight=0;
  if(op<1)nt.opacity=op;G.primaryAxisSizingMode='AUTO';G.counterAxisSizingMode='FIXED';merged++}}
const WL={Light:'Light',Regular:'Regular 400',Medium:'Medium 500',SemiBold:'SemiBold 600'};
const all=(await figma.getLocalTextStylesAsync()).filter(s=>/^Título\//.test(s.name));
const val=s=>({sz:s.fontSize,lh:s.lineHeight.unit==='PERCENT'?s.lineHeight.value:100*s.lineHeight.value/s.fontSize,ls:s.letterSpacing.unit==='PERCENT'?s.letterSpacing.value:100*s.letterSpacing.value/s.fontSize,fs:s.fontName.style});
const top=n=>{let p=n;while(p.parent&&p.parent.id!==S.id)p=p.parent;return p};
let linked=0,created=[];
for(const R of roots)for(const t of R.findAll(isC)){
  const vp=top(t).width<500?'Mobile':'Desktop';const v=val(t);v.lh=Math.round(v.lh*10)/10;v.ls=Math.round(v.ls*10)/10;
  let st=all.find(s=>s.name.startsWith('Título/'+vp+'/')&&(()=>{const o=val(s);return Math.abs(o.sz-v.sz)<0.06&&Math.abs(o.lh-v.lh)<0.8&&Math.abs(o.ls-v.ls)<0.2&&o.fs===v.fs})());
  if(!st){st=figma.createTextStyle();let nm=`Título/${vp}/${Math.round(v.sz*100)/100} · ${WL[v.fs]||v.fs}`;let k=2;while(all.some(s=>s.name===nm))nm=nm.replace(/( · v\d+)?$/,` · v${k++}`);st.name=nm;
    st.fontName={family:'Cormorant Garamond',style:v.fs};st.fontSize=v.sz;st.lineHeight={unit:'PERCENT',value:v.lh};st.letterSpacing={unit:'PERCENT',value:v.ls};st.description='Trocar família para Black Mango com o peso do nome. Valores iguais ao site.';all.push(st);created.push(nm)}
  const multi=/\n/.test(t.characters);const wrap=!multi&&t.textAutoResize==='HEIGHT'&&t.height>v.sz*v.lh/100*1.6;const W=t.width;
  t.name='Título';if(wrap){t.textAutoResize='HEIGHT';t.resize(W,t.height)}else t.textAutoResize='WIDTH_AND_HEIGHT';await t.setTextStyleIdAsync(st.id);linked++}
return {merged,linked,created}
