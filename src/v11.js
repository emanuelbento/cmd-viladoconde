/* CMD v11 · Ajustes pedidos pela clínica na revisão dos wireframes (13 nov)
   1. Contactos: mapa da morada, com Google Maps só depois de consentimento.
   2. Especialidade: bloco de casos clínicos ligado à lista filtrada; some se a área não tiver casos. */
(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,A=!!window.gsap&&!RM;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const settle=()=>{window.cmdLenis&&cmdLenis.resize();window.ScrollTrigger&&ScrollTrigger.refresh()};

/* ---------- 1. Mapa dos Contactos ---------- */
$$("[data-visit-map]").forEach(m=>{
  const addr=m.getAttribute("data-visit-map")||"Rua dos Benguiados, 225, 4480-794 Vila do Conde";
  const q=encodeURIComponent("Centro Médico e Dentário de Vila do Conde, "+addr);
  const parts=addr.split(","),l1=parts.slice(0,2).join(",").trim(),l2=parts.slice(2).join(",").trim().replace(/^\d{4}-\d{3}\s*/,"");
  const roads=[["h",44,14],["h",18,7],["h",78,6],["v",30,9],["v",57,7],["v",84,6]];
  m.innerHTML=`<div class="vmap_base" aria-hidden="true">${roads.map(([d,p,w])=>`<span class="vmap_road is-${d}" style="${d==="h"?"top":"left"}:${p}%;--w:${w}px"></span>`).join("")}<span class="vmap_road is-d"></span><span class="vmap_block" style="left:63%;top:6%;width:19%;height:30%"></span><span class="vmap_block" style="left:5%;top:56%;width:22%;height:32%"></span><span class="vmap_block is-park" style="left:34%;top:58%;width:20%;height:28%"></span></div>
<span class="vmap_pin" aria-hidden="true"><i></i></span>
<div class="vmap_bar"><p class="vmap_addr"><b>${esc(l1)}</b><span>${esc(l2||"Vila do Conde")}</span></p><div class="vmap_actions"><button type="button" class="vmap_btn" data-vmap-load>Ver mapa</button><a class="vmap_btn is-ghost" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Google Maps <span aria-hidden="true">↗</span></a></div></div>`;
  let loaded=false;
  const load=()=>{if(loaded)return;loaded=true;const f=document.createElement("iframe");
    f.className="vmap_frame";f.title="Mapa: "+addr;f.loading="lazy";f.referrerPolicy="no-referrer-when-downgrade";f.src=`https://www.google.com/maps?q=${q}&z=16&output=embed`;
    m.prepend(f);m.classList.add("is-live");const b=$("[data-vmap-load]",m);b&&b.remove();
    f.addEventListener("load",()=>{m.classList.add("is-ready");A&&gsap.fromTo(f,{autoAlpha:0},{autoAlpha:1,duration:.9,ease:"power2.out"})},{once:true})};
  $("[data-vmap-load]",m).addEventListener("click",load);
  let ok=null;try{ok=localStorage.getItem("cmd_consent")}catch(e){}
  ok==="todos"&&load();
  document.addEventListener("click",e=>{const c=e.target.closest('[data-cookie-choice="todos"]');c&&load()});
  A&&gsap.from($(".vmap_pin",m),{y:-24,autoAlpha:0,duration:1.1,ease:"expo.out",scrollTrigger:{trigger:m,start:"top 85%",once:true}});
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
