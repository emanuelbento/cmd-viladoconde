/* CMD · v8
   Mega menu das especialidades, avaliações linha a linha, percursos simplificados,
   cursor absorvido pela seta do "seguinte", pré-visualização dos casos com fotografia, gaveta com scroll. */
(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,G=!!window.gsap,A=G&&!RM;
const FINE=matchMedia("(hover: hover) and (pointer: fine)").matches;
G&&window.SplitText&&gsap.registerPlugin(SplitText);
window.ScrollTrigger&&ScrollTrigger.config({ignoreMobileResize:true});

/* ---------- Gaveta de marcação: o scroll interno não é capturado pelo Lenis ---------- */
$$("[data-book-drawer], .book_body").forEach(el=>el.setAttribute("data-lenis-prevent",""));
(()=>{const dr=$("[data-book-drawer]");if(!dr||!window.cmdLenis)return;
  const sync=()=>{const open=getComputedStyle(dr).visibility!=="hidden"&&dr.getBoundingClientRect().width>0&&getComputedStyle(dr).opacity!=="0";open?cmdLenis.stop():cmdLenis.start()};
  new MutationObserver(sync).observe(dr,{attributes:true,attributeFilter:["class","style","aria-hidden","hidden"]})})();

/* ---------- Mega menu das especialidades ---------- */
(()=>{const nav=$("[data-nav]"),mega=$("[data-mega]"),trg=$("[data-mega-trigger]");if(!nav||!mega||!trg||!FINE)return;
  const imgs=$$(".nav_mega-img",mega),links=$$(".nav_mega-link",mega),thumbs=links.map(l=>$(".nav_mega-thumb",l));
  const big=$(".nav_mega-visual img",mega);
  let open=false,t=null,tl=null;
  const items=$$(".nav_mega-intro > *, .nav_mega-link, .nav_mega-visual",mega);
  const show=()=>{clearTimeout(t);if(open)return;open=true;nav.classList.add("is-mega");trg.classList.add("is-mega-open");trg.setAttribute("aria-expanded","true");
    if(!A){mega.style.clipPath="none";return}
    tl&&tl.kill();tl=gsap.timeline();
    tl.fromTo(mega,{clipPath:"inset(0% 0% 100% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.75,ease:"expo.out"})
      .fromTo(items,{y:14,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.025,ease:"expo.out"},.08)};
  const hide=(now)=>{clearTimeout(t);t=setTimeout(()=>{if(!open)return;open=false;trg.classList.remove("is-mega-open");trg.setAttribute("aria-expanded","false");
    if(!A){nav.classList.remove("is-mega");mega.style.clipPath="";return}
    tl&&tl.kill();tl=gsap.timeline({onComplete:()=>nav.classList.remove("is-mega")});
    tl.to(mega,{clipPath:"inset(0% 0% 100% 0%)",duration:.5,ease:"expo.inOut"})},now?0:160)};
  trg.setAttribute("aria-haspopup","true");trg.setAttribute("aria-expanded","false");
  trg.addEventListener("pointerenter",show);trg.addEventListener("focus",show);
  [trg,mega].forEach(el=>el.addEventListener("pointerleave",e=>{const to=e.relatedTarget;if(to&&(mega.contains(to)||trg.contains(to)))return;hide()}));
  mega.addEventListener("pointerenter",()=>clearTimeout(t));
  $$(".nav_link",nav).forEach(l=>l!==trg&&l.addEventListener("pointerenter",()=>hide(true)));
  addEventListener("keydown",e=>e.key==="Escape"&&hide(true));
  addEventListener("scroll",()=>open&&hide(true),{passive:true});
  /* imagem grande acompanha a especialidade em hover */
  if(big)links.forEach((l,i)=>l.addEventListener("pointerenter",()=>{const th=thumbs[i];if(!th||!th.getAttribute("src")||big.getAttribute("src")===th.getAttribute("src"))return;
    const nb=big.cloneNode();nb.src=th.currentSrc||th.src;nb.removeAttribute("srcset");nb.removeAttribute("sizes");big.parentElement.appendChild(nb);
    A?gsap.fromTo(nb,{clipPath:"inset(100% 0% 0% 0%)",scale:1.08},{clipPath:"inset(0% 0% 0% 0%)",scale:1,duration:.8,ease:"expo.out",onComplete:()=>{const all=$$(".nav_mega-img",big.parentElement);all.slice(0,-1).forEach(x=>x.remove())}}):($$(".nav_mega-img",big.parentElement).slice(0,-1).forEach(x=>x.remove()))}));
  void imgs})();

/* ---------- "Seguinte": a etiqueta do cursor encolhe para dentro da seta, que enche a coral ---------- */
(()=>{if(!FINE)return;const cur=$("[data-cursor]");
  $$(".next_arrow").forEach(ar=>{const on=()=>{ar.classList.add("is-absorb");cur&&cur.classList.add("is-absorbed")},off=()=>{ar.classList.remove("is-absorb");cur&&cur.classList.remove("is-absorbed")};
    ar.addEventListener("pointerenter",on);ar.addEventListener("pointerleave",off);const l=ar.closest("a");l&&l.addEventListener("pointerleave",off)});
  addEventListener("pagehide",()=>cur&&cur.classList.remove("is-absorbed"))})();

/* ---------- Percursos: a linha enche com o scroll e cada ponto acende quando a linha lá chega ----------
   A: ao entrar, a linha está vazia e só a primeira etapa acende.
   B: a linha enche em scrub; uma etapa acende quando o seu ponto passa o centro do ecrã (é aí que a linha o alcança).
   C: no fim, as etapas todas acesas. Os botões não dependem do scroll. */
$$("[data-pex2]").forEach(sec=>{const fill=$(".pex2_fill",sec),track=$(".pex2_track",sec),steps=$$(".pex2_step",sec),list=$(".pex2_steps",sec);if(!list||!steps.length)return;
  const dotY=s=>{const b=parseFloat(getComputedStyle(s,"::before").top)||7,h=parseFloat(getComputedStyle(s,"::before").height)||14;return s.offsetTop+b+h/2};
  let ys=[];
  const measure=()=>{ys=steps.map(dotY);if(track){track.style.top=ys[0]+"px";track.style.bottom=Math.max(0,list.offsetHeight-ys[ys.length-1])+"px"}};
  measure();
  if(!A||!window.ScrollTrigger){fill&&(fill.style.transform="none");steps.forEach(s=>s.classList.add("is-on"));return}
  const span=()=>Math.max(1,ys[ys.length-1]-ys[0]);
  const light=p=>{const reach=ys[0]+p*span();steps.forEach((s,i)=>s.classList.toggle("is-on",i===0?entered:ys[i]<=reach+1))};
  let entered=false,prog=0;
  gsap.set(fill,{scaleY:0,transformOrigin:"top"});
  ScrollTrigger.create({trigger:list,start:"top 85%",onEnter:()=>{entered=true;light(prog)},onLeaveBack:()=>{entered=false;light(prog)}});
  gsap.to(fill,{scaleY:1,ease:"none",onUpdate(){prog=this.progress();light(prog)},scrollTrigger:{trigger:list,start:()=>`top+=${ys[0]} center`,end:()=>`top+=${ys[ys.length-1]} center`,scrub:.4,onRefreshInit:measure}});
  gsap.from(steps,{y:24,autoAlpha:0,duration:1,stagger:.12,ease:"expo.out",scrollTrigger:{trigger:list,start:"top 85%",once:true}});
  let rt,w0=list.offsetWidth;new ResizeObserver(()=>{if(list.offsetWidth===w0)return;w0=list.offsetWidth;clearTimeout(rt);rt=setTimeout(()=>{measure();ScrollTrigger.refresh()},150)}).observe(list)});

/* ---------- Avaliações: uma de cada vez, linha a linha (base Osmo, com arrastar) ---------- */
$$("[data-testimonial-wrap]").forEach(wrap=>{const list=$("[data-testimonial-list]",wrap);if(!list)return;
  const items=$$("[data-testimonial-item]",list);if(!items.length)return;
  const bP=$("[data-prev]",wrap),bN=$("[data-next]",wrap),elC=$("[data-current]",wrap),elT=$("[data-total]",wrap),pad=n=>String(n).padStart(2,"0");
  elT&&(elT.textContent=pad(items.length));
  let act=Math.max(0,items.findIndex(e=>e.classList.contains("is--active")));let busy=false,call=null,inView=false,hover=false;
  const auto=wrap.getAttribute("data-autoplay")==="true",dur=(parseInt(wrap.getAttribute("data-autoplay-duration"),10)||6000)/1000;
  const slides=items.map(item=>({item,targets:[$("[data-testimonial-text]",item),...$$("[data-testimonial-split]",item)].filter(Boolean),splits:[],stars:$(".rv2_stars",item),lines(){return this.splits.flatMap(s=>s.lines)}}));
  const state=(i,on)=>{const it=slides[i].item;it.classList.toggle("is--active",on);it.setAttribute("aria-hidden",String(!on));G?gsap.set(it,{autoAlpha:on?1:0,pointerEvents:on?"auto":"none"}):(it.style.opacity=on?1:0,it.style.visibility=on?"visible":"hidden")};
  slides.forEach((_,i)=>state(i,i===act));elC&&(elC.textContent=pad(act+1));
  if(A&&window.SplitText)slides.forEach((s,i)=>{s.splits=s.targets.map(el=>SplitText.create(el,{type:"lines",mask:"lines",linesClass:"text-line",autoSplit:true,onSplit(self){gsap.set(self.lines,{yPercent:i===act?0:110})}}));
    s.stars&&gsap.set(s.stars,{clipPath:i===act?"inset(0% 0% 0% 0%)":"inset(0% 100% 0% 0%)"})});
  const go=n=>{if(busy||n===act)return;busy=true;const o=slides[act],inn=slides[n];
    const done=()=>{state(act,false);state(n,true);act=n;elC&&(elC.textContent=pad(act+1));busy=false};
    if(!A||!window.SplitText){done();return}
    const tl=gsap.timeline({onComplete:done});gsap.set(inn.item,{autoAlpha:1,pointerEvents:"auto"});gsap.set(inn.lines(),{yPercent:110});
    tl.to(o.lines(),{yPercent:-110,duration:.6,ease:"power4.inOut",stagger:{amount:.25}},0);
    o.stars&&tl.to(o.stars,{clipPath:"inset(0% 0% 0% 100%)",duration:.5,ease:"power4.inOut"},0);
    tl.to(inn.lines(),{yPercent:0,duration:.75,ease:"power4.inOut",stagger:{amount:.4}},">-=0.3");
    inn.stars&&tl.fromTo(inn.stars,{clipPath:"inset(0% 100% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.8,ease:"power4.inOut"},"<");
    tl.set(o.item,{autoAlpha:0},">")};
  const next=()=>go((act+1)%slides.length),prev=()=>go((act-1+slides.length)%slides.length);
  const run=()=>{call&&call.kill();if(!auto||!G||RM||!inView||hover)return;call=gsap.delayedCall(dur,()=>{busy?run():(next(),run())})};
  bN&&bN.addEventListener("click",()=>{next();run()});bP&&bP.addEventListener("click",()=>{prev();run()});
  addEventListener("keydown",e=>{if(!inView)return;const t=e.target;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable))return;
    e.key==="ArrowRight"&&(next(),run());e.key==="ArrowLeft"&&(prev(),run())});
  /* arrastar ou deslizar */
  const main=$(".rv2_main",wrap)||list;let d=null;
  main.addEventListener("pointerdown",e=>{if(e.button)return;d={x:e.clientX,y:e.clientY}},{passive:true});
  addEventListener("pointermove",e=>{if(!d)return;Math.abs(e.clientX-d.x)>8&&main.classList.add("is-drag")},{passive:true});
  addEventListener("pointerup",e=>{if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;d=null;main.classList.remove("is-drag");if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){dx<0?next():prev();run()}});
  wrap.addEventListener("pointerenter",e=>{e.pointerType==="mouse"&&(hover=true,call&&call.kill())});wrap.addEventListener("pointerleave",e=>{e.pointerType==="mouse"&&(hover=false,run())});
  new IntersectionObserver(es=>{inView=es[0].isIntersecting;inView?run():call&&call.kill()},{threshold:.3}).observe(wrap)});

/* ---------- Índice de casos: fotografia na pré-visualização ---------- */
(()=>{const pi=$(".cases-index_preview-inner");if(!pi)return;
  const rows=$$(".cases-index_row");const pick=r=>{const a=$(".cases-index_img-a",r),b=$(".cases-index_img-b",r);const s=x=>x&&x.getAttribute("src")&&!/placeholder/i.test(x.getAttribute("src"))?(x.currentSrc||x.src):"";return[s(a),s(b)]};
  /* pré-carrega para a imagem aparecer no primeiro hover */
  rows.forEach(r=>pick(r).forEach(u=>{if(u){const i=new Image;i.src=u}}));
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(!(n instanceof HTMLElement)||!n.classList.contains("cpv"))return;
    const r=$(".cases-index_row.is-active");if(!r)return;const[a,b]=pick(r);if(!a)return;
    n.classList.add("has-img");const ba=n.classList.contains("is-ba")&&b;
    n.insertAdjacentHTML("afterbegin",`<img class="cpv_img" src="${a}" alt="">${ba?`<img class="cpv_img" src="${b}" alt="">`:""}`)}))).observe(pi,{childList:true})})();
  /* CMS links: base + slug */
  document.querySelectorAll("a[data-href-base][data-slug]").forEach(a=>{const sl=a.getAttribute("data-slug");sl&&a.setAttribute("href",a.getAttribute("data-href-base")+sl)});
  /* ScrollTrigger: os pins da homepage nascem depois destes triggers. Reordenar e recalcular quando tudo carregou,
     senão tudo o que está abaixo de um pin dispara cedo demais (ex.: os pontos dos Percursos já acesos). */
  if(window.ScrollTrigger){const fix=()=>{ScrollTrigger.sort();ScrollTrigger.refresh()};
    document.readyState==="complete"?setTimeout(fix,200):addEventListener("load",()=>setTimeout(fix,200),{once:true});
    document.fonts&&document.fonts.ready.then(()=>setTimeout(fix,400))}
})();

/* Navbar sobre fundos escuros: troca para a versão escura quando a secção por baixo é escura */
(()=>{
  const nav=document.querySelector("[data-nav]");if(!nav)return;
  const lum=c=>{const m=c.match(/[\d.]+/g);if(!m)return null;const a=m[3]===undefined?1:+m[3];if(a<.5)return null;
    const [r,g,b]=m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
  const bgAt=(x,y)=>{const els=document.elementsFromPoint(x,y);for(const e of els){if(nav.contains(e))continue;let n=e;
      while(n&&n!==document.documentElement){const l=lum(getComputedStyle(n).backgroundColor);if(l!==null)return l;n=n.parentElement}return 1}return 1};
  let raf=0;
  const check=()=>{raf=0;if(nav.classList.contains("is-open")||nav.classList.contains("is-mega")){nav.classList.remove("is-dark");return}
    const y=nav.getBoundingClientRect().bottom-2;const l=Math.min(bgAt(innerWidth*.25,y),bgAt(innerWidth*.75,y));
    nav.classList.toggle("is-dark",l<.18)};
  const q=()=>{raf||(raf=requestAnimationFrame(check))};
  addEventListener("scroll",q,{passive:true});addEventListener("resize",q);addEventListener("load",q);
  new MutationObserver(q).observe(nav,{attributes:true,attributeFilter:["class"]});q();
})();
/* legal toc: estado ativo por secção */
(()=>{const toc=[...document.querySelectorAll('[data-toc]')],secs=[...document.querySelectorAll('[data-sec]')];if(!toc.length||!secs.length)return;
const set=i=>toc.forEach(b=>{b.dataset.toc===String(i)?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current')});set(0);
toc.forEach(b=>b.addEventListener('click',e=>{const s=secs[+b.dataset.toc];if(!s)return;e.preventDefault();window.cmdLenis?cmdLenis.scrollTo(s,{offset:-110,duration:1.2}):s.scrollIntoView({behavior:'smooth'});history.replaceState(null,'','#'+s.id)}));
const run=()=>{if(window.ScrollTrigger)secs.forEach(s=>ScrollTrigger.create({trigger:s,start:'top 22%',end:'bottom 22%',onToggle:x=>{x.isActive&&set(s.dataset.sec)}}));else{const io=new IntersectionObserver(es=>es.forEach(en=>{en.isIntersecting&&set(en.target.dataset.sec)}),{rootMargin:'-22% 0px -70% 0px'});secs.forEach(s=>io.observe(s))}};
document.readyState==='complete'?run():addEventListener('load',run)})();
/* consentimento: o Analytics só carrega depois de "Aceitar todos". Sem escolha ou com "Só essenciais" não há pedidos à Google. */
(()=>{const K="cmd_consent",T="cmd_consent_ts",MAX=180*864e5,ID=(window.CMD_GA_ID||"").trim();
const get=()=>{try{return localStorage.getItem(K)}catch(e){return null}};
try{const t=+localStorage.getItem(T)||0;if(get()&&(!t||Date.now()-t>MAX)){localStorage.removeItem(K);localStorage.removeItem(T)}}catch(e){}
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=window.gtag||gtag;
gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",functionality_storage:"granted",security_storage:"granted",wait_for_update:500});
let loaded=!1;const load=()=>{if(loaded||!ID)return;loaded=!0;window["ga-disable-"+ID]=!1;
gtag("consent","update",{analytics_storage:"granted"});gtag("js",new Date);gtag("config",ID,{anonymize_ip:!0,allow_google_signals:!1,allow_ad_personalization_signals:!1});
const s=document.createElement("script");s.async=!0;s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(ID);document.head.appendChild(s)};
const wipe=()=>{if(ID)window["ga-disable-"+ID]=!0;gtag("consent","update",{analytics_storage:"denied"});
const host=location.hostname.split(".");document.cookie.split(";").map(c=>c.split("=")[0].trim()).filter(n=>/^_ga|^_gid|^_gat/.test(n)).forEach(n=>{for(let i=0;i<host.length-1;i++){const d=host.slice(i).join(".");document.cookie=n+"=;Max-Age=0;path=/;domain=."+d;document.cookie=n+"=;Max-Age=0;path=/;domain="+d}document.cookie=n+"=;Max-Age=0;path=/"})};
get()==="todos"?load():wipe();
document.addEventListener("click",e=>{const b=e.target.closest("[data-cookie-choice]");if(!b)return;try{localStorage.setItem(T,String(Date.now()))}catch(e){}b.dataset.cookieChoice==="todos"?load():wipe()},!0);
window.cmdConsent={get,load,wipe}})();
/* dados estruturados nas páginas interiores: breadcrumb, perfil do profissional, página da especialidade */
(()=>{const o=location.origin,clinic={"@id":o+"/#clinica"},add=j=>{const s=document.createElement("script");s.type="application/ld+json";s.textContent=JSON.stringify(j);document.head.appendChild(s)};
const run=()=>{const g=[],h1=(document.querySelector("h1")?.textContent||"").trim(),bc=document.querySelector("nav.breadcrumb");
if(bc){const items=[];bc.querySelectorAll("a,span:not([aria-hidden])").forEach(n=>{const name=(n.textContent||"").trim();if(!name)return;items.push({"@type":"ListItem",position:items.length+1,name:n.tagName==="A"?name:(h1||name),item:n.tagName==="A"?new URL(n.getAttribute("href"),o).href:location.href.split("#")[0]})});items.length>1&&g.push({"@type":"BreadcrumbList",itemListElement:items})}
const med=document.querySelector("[data-med-name]");if(med){const img=document.querySelector(".med_img"),esp=(document.querySelector("[data-med-esp]")?.textContent||"").trim();
const facts={};document.querySelectorAll(".med_fact").forEach(f=>{const k=(f.querySelector(".med_fact-key")?.textContent||"").trim().toLowerCase(),v=(f.textContent||"").replace(f.querySelector(".med_fact-key")?.textContent||"","").trim();k&&v&&(facts[k]=v)});
const p={"@type":"Physician","@id":location.href.split("#")[0]+"#profissional",name:med.textContent.trim(),url:location.href.split("#")[0],medicalSpecialty:esp||void 0,jobTitle:facts["função"]||void 0,image:img?.currentSrc||img?.src||void 0,worksFor:clinic,address:{"@type":"PostalAddress",streetAddress:"Rua dos Benguiados, 225",postalCode:"4480-794",addressLocality:"Vila do Conde",addressCountry:"PT"},telephone:"+351252616388"};
const ced=Object.keys(facts).find(k=>/c[eé]dula/.test(k));ced&&(p.identifier={"@type":"PropertyValue",name:"Cédula profissional",value:facts[ced]});g.push(p)}
if(/^\/especialidades\/[^/]+/.test(location.pathname)&&h1){g.push({"@type":"MedicalWebPage","@id":location.href.split("#")[0]+"#pagina",url:location.href.split("#")[0],name:document.title,description:document.querySelector('meta[name="description"]')?.content||void 0,specialty:h1,isPartOf:{"@id":o+"/#website"},publisher:clinic,inLanguage:"pt-PT"})}
g.length&&add({"@context":"https://schema.org","@graph":g})};
document.readyState==="complete"?setTimeout(run,300):addEventListener("load",()=>setTimeout(run,300))})();
