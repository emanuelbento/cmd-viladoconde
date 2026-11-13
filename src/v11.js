/* CMD v11 · Ajustes pedidos pela clínica na revisão dos wireframes (13 nov)
   0. Morada abre sempre a ficha do Google Maps; ligações externas com seta e novo separador.
   1. Contactos: mapa vetorial (OpenFreeMap + MapLibre, sem cookies) nas cores do site.
   2. Especialidade: bloco de casos clínicos ligado à lista filtrada; some se a área não tiver casos. */
(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,A=!!window.gsap&&!RM;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const settle=()=>{window.cmdLenis&&cmdLenis.resize();window.ScrollTrigger&&ScrollTrigger.refresh()};

/* ---------- 0. Morada e ligações externas ---------- */
const MAPS="https://maps.app.goo.gl/CfhKzB3EZk4C8iot9",LL=[-8.7462626,41.3587916];
const DIR=`https://www.google.com/maps/dir/?api=1&destination=${LL[1]},${LL[0]}`;
const isMaps=h=>/maps\.google\.|google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(h||"");
/* textos com a morada que ainda não são ligação passam a abrir o mapa */
$$("footer p, [data-cta] div, main p, main div").forEach(el=>{
  if(el.closest("a,[data-visit-map],script,form,[data-book-drawer]")||!/Benguiados/.test(el.textContent))return;
  if([...el.children].some(c=>c.tagName!=="BR"))return;
  const a=document.createElement("a");a.href=MAPS;a.innerHTML=el.innerHTML;el.innerHTML="";el.appendChild(a)});
$$("a[href]").forEach(a=>{const h=a.getAttribute("href");
  if(isMaps(h)){a.href=MAPS;a.classList.add("is-maplink")}
  let u;try{u=new URL(a.href,location.href)}catch(e){return}
  if(!/^https?:$/.test(u.protocol)||u.hostname===location.hostname)return;
  a.target="_blank";a.rel="noopener";
  if(a.matches(".footer_social-link,[data-social]")||a.querySelector("img"))return;
  const svg=a.querySelector("svg");if(svg){a.classList.add("is-external-svg");return}
  a.hasAttribute("data-external")||a.setAttribute("data-external","");
  a.querySelector(".sr-ext")||a.insertAdjacentHTML("beforeend",'<span class="sr-ext"> (abre noutro separador)</span>')});

/* ---------- 1. Mapa dos Contactos ---------- */
$$("[data-visit-map]").forEach(m=>{
  const addr=m.getAttribute("data-visit-map")||"Rua dos Benguiados, 225, 4480-794 Vila do Conde";
  const parts=addr.split(","),l1=parts.slice(0,2).join(",").trim(),l2=parts.slice(2).join(",").trim().replace(/^\d{4}-\d{3}\s*/,"");
  const roads=[["h",44,14],["h",18,7],["h",78,6],["v",30,9],["v",57,7],["v",84,6]];
  m.innerHTML=`<div class="vmap_base" aria-hidden="true">${roads.map(([d,p,w])=>`<span class="vmap_road is-${d}" style="${d==="h"?"top":"left"}:${p}%;--w:${w}px"></span>`).join("")}<span class="vmap_road is-d"></span><span class="vmap_block" style="left:63%;top:6%;width:19%;height:30%"></span><span class="vmap_block" style="left:5%;top:56%;width:22%;height:32%"></span><span class="vmap_block is-park" style="left:34%;top:58%;width:20%;height:28%"></span><span class="vmap_fallpin"><i></i></span></div>
<div class="vmap_canvas" role="region" aria-label="Mapa com a localização do centro, ${esc(l1)}"></div>
<div class="vmap_zoom" hidden><button type="button" data-z="1" aria-label="Aproximar">+</button><button type="button" data-z="-1" aria-label="Afastar">−</button><button type="button" data-z="0" aria-label="Voltar ao centro"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg></button></div>
<div class="vmap_bar"><p class="vmap_addr"><b>${esc(l1)}</b><span>${esc(l2||"Vila do Conde")}</span></p><div class="vmap_actions"><a class="vmap_btn" href="${DIR}" target="_blank" rel="noopener" data-external>Como chegar<span class="sr-ext"> (abre noutro separador)</span></a><a class="vmap_btn is-ghost" href="${MAPS}" target="_blank" rel="noopener" data-external>Google Maps<span class="sr-ext"> (abre noutro separador)</span></a></div></div>`;
  const cv=$(".vmap_canvas",m),zb=$(".vmap_zoom",m);
  const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C={land:cssv("--_base-color---support--marfim")||"#F4EEE6",ink:cssv("--_base-color---brand--tinta")||"#2A1A13",
    accent:cssv("--_base-color---brand--borgonha")||"#7E2A1E",water:"#E2D6C8",park:"#ECE3D6",building:"#EADFD1",buildLine:"#DDCFBF",road:"#FFFFFF",casing:"#E3D5C5",rail:"#D6C6B4",label:"#8B7062"};
  const load=(src,css)=>new Promise((ok,ko)=>{if(window.maplibregl)return ok();if(css){const l=document.createElement("link");l.rel="stylesheet";l.href=css;document.head.appendChild(l)}
    const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)});
  const paint=map=>{map.getStyle().layers.forEach(L=>{const id=L.id,set=(k,v)=>{try{map.setPaintProperty(id,k,v)}catch(e){}},lay=(k,v)=>{try{map.setLayoutProperty(id,k,v)}catch(e){}};
    if(L.type==="background")return set("background-color",C.land);
    if(L.type==="fill"){if(/water|ocean|sea/.test(id))set("fill-color",C.water);else if(/park|grass|wood|forest|green|cemetery|pitch|landcover|landuse/.test(id))set("fill-color",C.park);else if(/building/.test(id)){set("fill-color",C.building);set("fill-outline-color",C.buildLine)}else set("fill-color",C.land);return}
    if(L.type==="fill-extrusion")return lay("visibility","none");
    if(L.type==="line"){if(/water|river|stream|canal/.test(id))set("line-color",C.water);else if(/boundary|admin/.test(id))lay("visibility","none");else if(/rail|transit/.test(id))set("line-color",C.rail);else if(/casing|outline/.test(id))set("line-color",C.casing);else set("line-color",C.road);return}
    if(L.type==="symbol"){if(/poi|housenum|transit|aerialway|airport/.test(id))return lay("visibility","none");set("text-color",C.label);set("text-halo-color",C.land);set("text-halo-width",1.4);set("icon-opacity",0)}})};
  const init=()=>load("https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js","https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css").then(()=>{
    if(!maplibregl.supported||(maplibregl.supported&&!maplibregl.supported()))return;
  }).catch(()=>{}).then(()=>{if(!window.maplibregl)return;
    const end={center:LL,zoom:16.3,pitch:48,bearing:-16};
    const map=new maplibregl.Map({container:cv,style:"https://tiles.openfreemap.org/styles/positron",center:LL,zoom:A?13.4:end.zoom,pitch:A?0:end.pitch,bearing:A?0:end.bearing,
      attributionControl:{compact:true},cooperativeGestures:true,dragRotate:false,touchPitch:false,maxZoom:18.5,minZoom:12,
      locale:{"CooperativeGesturesHandler.WindowsHelpText":"Use Ctrl + scroll para aproximar o mapa","CooperativeGesturesHandler.MacHelpText":"Use ⌘ + scroll para aproximar o mapa","CooperativeGesturesHandler.MobileHelpText":"Use dois dedos para mover o mapa","AttributionControl.ToggleAttribution":"Créditos do mapa"}});
    map.on("styledata",()=>paint(map));
    map.once("load",()=>{paint(map);
      const el=document.createElement("a");el.className="vmap_marker";el.href=MAPS;el.target="_blank";el.rel="noopener";el.setAttribute("aria-label","Abrir a localização no Google Maps (abre noutro separador)");
      el.innerHTML='<span class="vmap_pin"><i></i></span><span class="vmap_tag"><b>CMD</b><span>Centro Médico e Dentário</span></span>';
      new maplibregl.Marker({element:el,anchor:"left",offset:[-15,0]}).setLngLat(LL).addTo(map);
      m.classList.add("is-live");zb.hidden=false;
      if(A){gsap.fromTo(cv,{autoAlpha:0},{autoAlpha:1,duration:1,ease:"power2.out"});
        gsap.from($(".vmap_tag",el),{x:-12,autoAlpha:0,duration:1,delay:2.2,ease:"expo.out"});
        map.flyTo({...end,duration:2600,essential:true,easing:t=>1-Math.pow(2,-10*t)})}
      else cv.style.opacity=1;
      zb.addEventListener("click",e=>{const b=e.target.closest("[data-z]");if(!b)return;const z=+b.dataset.z;z?map.easeTo({zoom:map.getZoom()+z,duration:A?500:0}):map.easeTo({...end,duration:A?1200:0})})});
  });
  const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();init()}},{rootMargin:"200px 0px"});io.observe(m);
});

/* ---------- 2. Especialidade: casos clínicos desta área ---------- */
const box=$("[data-espd-cases]");
if(box){const h=$("h1[data-bind=name]"),name=h?h.textContent.trim():"";const link=$("[data-espd-cases-link]",box);
  if(!name||!link){box.remove()}else{
    box.hidden=true;
    fetch("/casos").then(r=>r.text()).then(t=>{const d=new DOMParser().parseFromString(t,"text/html");
      const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
      const n=$$(".case_card",d).filter(c=>$$(".case_tags .tag, .tag",c).some(x=>norm(x.textContent)===norm(name))).length;
      if(!n){box.remove();settle();return}
      link.href="/casos?area="+encodeURIComponent(name);
      link.textContent=n===1?"Ver o caso clínico":`Ver os ${n} casos clínicos`;
      box.hidden=false;settle();
      A&&gsap.from(box.children,{y:24,autoAlpha:0,duration:.9,stagger:.06,ease:"expo.out",scrollTrigger:{trigger:box,start:"top 85%",once:true}});
    }).catch(()=>{box.remove();settle()})}}
})();
