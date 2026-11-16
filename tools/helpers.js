/* Helpers do browser para a captura (correr na página do staging, depois de carregar cap2.js). */
window.PREP=async(path,w,h,opt={})=>{
  const S=t=>new Promise(r=>setTimeout(r,t));
  document.getElementById('fr')?.remove();
  const f=document.createElement('iframe');f.id='fr';
  f.style.cssText=`position:fixed;left:0;top:0;width:${w}px;height:${h}px;border:0;z-index:2147483000;background:#fff`;
  f.src=path;document.body.appendChild(f);
  await new Promise(r=>f.onload=r);
  const W=f.contentWindow,D=f.contentDocument;
  const st=D.createElement('style');st.textContent='html{scrollbar-width:none}::-webkit-scrollbar{display:none}.w-webflow-badge{display:none!important}.cursor_component{display:none!important}';D.head.appendChild(st);
  D.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');
  await S(1500);
  const H=()=>D.documentElement.scrollHeight;
  for(let y=0;y<H();y+=Math.round(h*0.7)){W.scrollTo(0,y);await S(140)}
  W.scrollTo(0,H());await S(900);W.scrollTo(0,0);await S(1500);
  await Promise.all([...D.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,4000)})));
  try{await D.fonts.ready}catch(e){}
  D.querySelectorAll('details:not([open]) > :not(summary)').forEach(e=>e.style.display='none');
  CAP.reset();CAP.materialize();await S(300);
  return [W.innerWidth,H()];
};
/* secs: [[selectorOuElemento, nome, overlay?]] */
window.CAPPAGE2=async(secs)=>{
  const W=CAP.W(),D=W.document;const out=[];
  for(const [sel,nm,ov] of secs){const el=typeof sel==='string'?D.querySelector(sel):sel;if(!el){out.push({nm,miss:1});continue}
    const node=CAP.cap(el,{name:nm,allowFixed:!!ov});if(node)out.push({nm,node,ov:ov?1:0})}
  const P={secs:out.filter(s=>s.node),states:[]};window.__PJ=JSON.stringify(P);
  return {secs:out.map(s=>s.nm+(s.miss?':MISS':':'+Math.round(s.node.h))).join(' | ')};
};
window.FINPJ=(states=[])=>{const P=JSON.parse(window.__PJ);P.states=states;const used=new Set(),imgK=new Set();
  const wk=n=>{if(!n)return;if(n.k==='S')used.add(n.id);if(n.k==='I')imgK.add(n.id);if(n.img)imgK.add(n.img);(n.ch||[]).forEach(wk)};
  P.secs.forEach(s=>wk(s.node));P.states.forEach(s=>wk(s.node));
  P.svgs=Object.fromEntries(Object.entries(CAP.svgs()).filter(([k])=>used.has(k)));window.__PJ=JSON.stringify(P);return [window.__PJ.length,imgK.size]};
window.SENDDATA=async(url,name)=>{
  const b=new TextEncoder().encode(window.__PJ);let bin='';for(let i=0;i<b.length;i+=8192)bin+=String.fromCharCode.apply(null,b.subarray(i,i+8192));
  const s=btoa(bin);const parts=[];for(let i=0;i<s.length;i+=4000)parts.push(s.slice(i,i+4000));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="${parts.length*10+10}">${parts.map((p,i)=>`<text x="0" y="${i*10+8}" font-family="Inter" font-size="8">${p}</text>`).join('')}</svg>`;
  const fd=new FormData();fd.append('file',new Blob([svg],{type:'image/svg+xml'}),name+'.svg');
  const r=await fetch(url,{method:'POST',body:fd});return await r.text();
};
window.UPS=async(uuids,keys,page='1%3A5')=>{
  const U=uuids.trim().split(/\s+/),K=keys.trim().split(/\s+/),I=CAP.imgs();
  const toPng=async b=>{const bm=await createImageBitmap(b);const c=document.createElement('canvas');c.width=bm.width;c.height=bm.height;c.getContext('2d').drawImage(bm,0,0);return await new Promise(r=>c.toBlob(r,'image/png'))};
  const res=await Promise.all(U.map(async(u,i)=>{try{const src=I[K[i]];let b=await (await fetch(src)).blob();
    if(!/image\/(png|jpeg|webp|gif)/.test(b.type))b=await toPng(b);
    const fd=new FormData();fd.append('file',b,K[i]+'.'+(b.type.split('/')[1]||'png'));
    const r=await fetch(`https://mcp.figma.com/mcp/upload/${u}/submit?scaleMode=FILL&currentPageId=${page}`,{method:'POST',body:fd});return K[i]+':'+r.status+':'+b.type}catch(e){return K[i]+':ERR '+String(e).slice(0,40)}}));
  return res.join(' ');
};
/* Página inteira: parts = ['sel',css,nome] | ['ov',css,nome] | ['split',css,[[filhoCss|null,nome],...]] (regiões). */
window.RUNP=async(sp)=>{await PREP(sp.path,sp.w,sp.h);const W=CAP.W(),D=W.document;const parts=[];
  for(const p of sp.parts){if(p[0]==='sel')parts.push([D.querySelector(p[1]),p[2]]);else if(p[0]==='ov')parts.push([D.querySelector(p[1]),p[2],1]);
    else if(p[0]==='split'){const sec=D.querySelector(p[1]);if(!sec)continue;const sr=sec.getBoundingClientRect();const b=p[2].map(([c,n],i)=>({n,y:i===0?sr.top:(sec.querySelector(c)?.getBoundingClientRect().top)}));
      for(let i=0;i<b.length;i++){const y1=i<b.length-1?b[i+1].y:sr.bottom;parts.push([{region:{x:sr.left,y:b[i].y,w:sr.width,h:y1-b[i].y},el:sec},b[i].n])}}}
  const out=[];for(const [el,nm,ov] of parts){if(!el)continue;const node=el.region?CAP.cap(el.el,{name:nm,region:el.region}):CAP.cap(el,{name:nm,allowFixed:!!ov});if(node)out.push({nm,node,ov:ov?1:0})}
  window.__PJ=JSON.stringify({page:sp.page,secs:out,states:[]});const st=sp.states?await sp.states(W,D):[];FINPJ(st);return out.map(s=>s.nm+':'+Math.round(s.node.h)).join(' | ')};
window.IM={};
window.RS=async(sp,url,tag)=>{const r=await RUNP(sp);IM[tag]=Object.assign({},CAP.imgs());const s=await SENDDATA(url,tag);return tag+': '+r+' >> '+(s.match(/placedOnNodeId":"([^"]+)/)||[0,s])[1]};
/* Imagens: [[uuids, keys, tag], ...] com os ids devolvidos pelo upload_assets e as keys devolvidas pelo build3. */
window.UP=async(list)=>{const out=[];for(const [u,k,tag] of list){const I=IM[tag];const U=u.trim().split(/\s+/),K=k.trim().split(/\s+/);
  const res=await Promise.all(U.map(async(uu,i)=>{try{let b=await (await fetch(I[K[i]])).blob();if(!/image\/(png|jpeg|webp|gif)/.test(b.type)){const ur=URL.createObjectURL(b);const im=new Image();im.src=ur;await im.decode();const c=document.createElement('canvas');c.width=im.naturalWidth||800;c.height=im.naturalHeight||800;c.getContext('2d').drawImage(im,0,0,c.width,c.height);b=await new Promise(r=>c.toBlob(r,'image/png'))}
    const fd=new FormData();fd.append('file',b,K[i]+'.png');const r=await fetch(`https://mcp.figma.com/mcp/upload/${uu}/submit?scaleMode=FILL&currentPageId=1%3A5`,{method:'POST',body:fd});return r.status}catch(e){return 'ERR'}}));out.push(tag+':'+res.join(','))}return out.join(' | ')};
/* Drawer de marcação: abrir com cmdBook.open(); o envio é simulado (requestSubmit substituído) para não criar pedidos reais. */
'helpers ok';
