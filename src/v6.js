/* CMD · v6
   Cursor com marquee, filtros de escolha múltipla, Equipa em grelha ou lista, parceiros em rotação. */
(()=>{"use strict";
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches,G=!!window.gsap,A=G&&!RM;
const FINE=matchMedia("(hover: hover) and (pointer: fine)").matches;
const snd=(n,o)=>window.cmdSound&&cmdSound.play(n,o);
const refresh=()=>{window.cmdLenis&&cmdLenis.resize();window.ScrollTrigger&&ScrollTrigger.refresh()};

/* ---------- CSS que só existe com JS (o Designer fica limpo) ---------- */
const css=`
.wt_ln,.split-line:has(.wt_ch),.hero_line:has(.wt_ch),[data-wt-line]:has(.wt_ch){white-space:nowrap}
.cmq{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center}
.cmq_card{position:absolute;display:flex;align-items:center;overflow:hidden;max-width:12rem;border-radius:999px;background:var(--_base-color---brand--tinta,#2a1a13);color:var(--_base-color---support--marfim,#f3eae4);
 clip-path:inset(calc(50% - .25em) calc(50% - .25em) round 50em);opacity:0;transform:translateY(0) rotate(.001deg);transition:clip-path .45s cubic-bezier(.75,0,.25,1),transform .45s cubic-bezier(.75,0,.25,1),opacity .2s}
.cmq[data-on] .cmq_card{clip-path:inset(0 0 round 50em);opacity:1;transform:translateY(-70%) rotate(.001deg)}
.cmq_t{display:block;white-space:nowrap;padding:.7rem .9rem;font-size:.8125rem;font-weight:600;letter-spacing:.02em;line-height:1;animation:cmqX 4s linear infinite paused;opacity:0;transition:opacity .15s .2s}
.cmq_t+.cmq_t{position:absolute;left:100%}
.cmq[data-on] .cmq_t{animation-play-state:running;opacity:1;transition-delay:0s}
@keyframes cmqX{to{transform:translateX(-100%)}}
.filter_btn{position:relative}
.filter_btn[aria-pressed=true]::after{content:"";position:absolute;right:.55rem;top:.55rem;width:5px;height:5px;border-radius:50%;background:var(--_base-color---brand--coral,#ea6f4e)}
.filter_clear{appearance:none;border:0;background:none;padding:0 .5rem;font:inherit;font-size:.8125rem;font-weight:600;color:var(--_base-color---brand--borgonha,#7d2b1f);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.filter_clear[hidden]{display:none}
.vt{display:inline-flex;position:relative;padding:.3rem;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(106,68,49,.14)}
.vt_btn{appearance:none;border:0;background:none;position:relative;z-index:1;height:2.2rem;padding:0 1rem;border-radius:999px;font:inherit;font-size:.8125rem;font-weight:600;color:var(--_base-color---brand--tinta,#2a1a13);cursor:pointer;transition:color .35s}
.vt_btn[aria-pressed=true]{color:var(--_base-color---brand--branco,#fff)}
.vt_ind{position:absolute;top:.3rem;bottom:.3rem;left:0;border-radius:999px;background:var(--_base-color---brand--tinta,#2a1a13);pointer-events:none}
.team_bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem}
[data-team-view=list] .team_grid{display:block!important}
[data-team-view=list] .team_grid>*{border-bottom:1px solid rgba(106,68,49,.14)}
[data-team-view=list] .team_card{display:grid!important;grid-template-columns:minmax(0,1fr) auto 2.5rem;align-items:center;gap:1.5rem;padding:1.4rem 0}
[data-team-view=list] .team_photo{display:contents}
[data-team-view=list] .team_img{display:none}
[data-team-view=list] .team_esp{order:2;position:static!important;margin:0}
[data-team-view=list] .team_meta{order:1;display:flex;align-items:baseline;gap:1rem;flex-wrap:wrap}
[data-team-view=list] .team_name{font-size:clamp(1.6rem,2.6vw,2.4rem);transition:transform .6s cubic-bezier(.16,1,.3,1)}
[data-team-view=list] .team_card::after{content:"";order:3;width:2.5rem;height:2.5rem;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(106,68,49,.14);background:center/16px no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 12h14M13 6l6 6-6 6' fill='none' stroke='%232a1a13' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");transition:transform .6s cubic-bezier(.16,1,.3,1),background-color .4s}
[data-team-view=list] .team_grid.is-hovering>*{opacity:.38;transition:opacity .4s}
[data-team-view=list] .team_grid.is-hovering>.is-active{opacity:1}
[data-team-view=list] .is-active .team_name{transform:translateX(1rem)}
[data-team-view=list] .is-active .team_card::after{transform:rotate(-45deg);background-color:var(--_base-color---support--marfim,#f3eae4)}
.tpv{position:fixed;left:0;top:0;z-index:50;width:15rem;aspect-ratio:3/4;border-radius:18px;overflow:hidden;pointer-events:none;opacity:0;visibility:hidden;background:var(--_base-color---support--marfim,#f3eae4)}
.tpv img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
@media (max-width:767px){[data-team-view=list] .team_card{grid-template-columns:minmax(0,1fr) 2.5rem}[data-team-view=list] .team_esp{grid-column:1/2}}
.lw{display:grid;grid-template-columns:repeat(var(--lw-cols,4),minmax(0,1fr));border-top:1px solid rgba(106,68,49,.14);border-left:1px solid rgba(106,68,49,.14)}
.lw_cell{position:relative;aspect-ratio:3/2;border-right:1px solid rgba(106,68,49,.14);border-bottom:1px solid rgba(106,68,49,.14);display:grid;place-items:center;overflow:hidden}
.lw_item{position:absolute;inset:0;display:grid;place-items:center;padding:1.25rem;text-align:center}
.lw_item img{max-width:62%;max-height:46%;object-fit:contain;filter:grayscale(1);opacity:.8}
.lw_name{font-family:var(--_typography---font--primary);font-size:clamp(1.05rem,1.5vw,1.35rem);font-weight:300;line-height:1.1;color:var(--_base-color---brand--tinta,#2a1a13)}
.lw_kind{position:absolute;left:.9rem;top:.8rem;font-size:.625rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--_base-color---support--muted,#8a766b)}
@media (max-width:991px){.lw{--lw-cols:3}}@media (max-width:479px){.lw{--lw-cols:2}}
`;
const st=document.createElement("style");st.id="cmd-v6";st.textContent=css;document.head.appendChild(st);

/* ---------- Cursor com marquee: o texto corre dentro de uma pílula ---------- */
if(FINE&&G){const el=document.createElement("div");el.className="cmq";el.setAttribute("aria-hidden","true");
  el.innerHTML='<div class="cmq_card"><span class="cmq_t"></span><span class="cmq_t"></span></div>';document.body.appendChild(el);
  const ts=$$(".cmq_t",el),xTo=gsap.quickTo(el,"x",{duration:.4,ease:"power3"}),yTo=gsap.quickTo(el,"y",{duration:.4,ease:"power3"});let first=true,cur="",tm;
  addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;if(first){gsap.set(el,{x:e.clientX,y:e.clientY});first=false}xTo(e.clientX);yTo(e.clientY)},{passive:true});
  window.cmdMarquee={show:t=>{clearTimeout(tm);if(t!==cur){cur=t;const txt=(t+"  ·  ").repeat(2);ts.forEach(s=>{s.textContent=txt;s.style.animationDuration=Math.max(3,txt.length/5)+"s"})}el.setAttribute("data-on","")},
    hide:()=>{el.removeAttribute("data-on");tm=setTimeout(()=>{cur=""},450)}};
  /* rótulos por defeito onde ainda não existem */
  [[".case_card","Ver caso"],[".cases-index_row","Ver caso"],[".esp_link","Explorar"],[".others_grid .team_card","Perfil"],["[data-drag]","Arrastar"],["[data-cslider] [data-cs-slide]","Ver"]]
    .forEach(([s,t])=>$$(s).forEach(n=>n.hasAttribute("data-cursor-text")||n.setAttribute("data-cursor-text",t)))}

/* ---------- Filtros: escolha múltipla, com contagem e "limpar" ---------- */
$$("[data-filter]").forEach(f0=>{if(f0.closest("[data-cases-index]"))return;
  const kind=f0.dataset.filter,sel=kind==="cases"?".case_tags .tag":".team_esp";
  const items=$$(".w-dyn-item").filter(i=>i.querySelector(sel)&&!i.closest("[data-cases-index],[data-others]"));if(!items.length)return;
  const keys=i=>$$(sel,i).map(t=>t.textContent.trim()).filter(Boolean),all=new Map();items.forEach(i=>keys(i).forEach(k=>all.set(k,(all.get(k)||0)+1)));
  /* substitui o grupo por uma cópia limpa: nenhum script antigo fica preso aos botões */
  const f=f0.cloneNode(false);f0.replaceWith(f);if(all.size<2){f.remove();return}
  const btn=(k,l,n,on)=>`<button type="button" class="filter_btn" data-k="${k.replace(/"/g,"&quot;")}" aria-pressed="${on}">${l}<sup>${n}</sup></button>`;
  f.innerHTML=btn("*","Todas",items.length,true)+[...all].sort((a,b)=>b[1]-a[1]).map(([k,n])=>btn(k,k,n,false)).join("")+'<button type="button" class="filter_clear" hidden>Limpar</button>';
  f.setAttribute("aria-label",(f.getAttribute("aria-label")||"Filtrar")+", pode escolher várias");
  const on=new Set(),bs=$$(".filter_btn",f),clr=$(".filter_clear",f);
  const apply=()=>{bs.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.k==="*"?on.size===0:on.has(b.dataset.k))));clr.hidden=on.size<2;
    const show=items.filter(i=>!on.size||keys(i).some(k=>on.has(k)));
    const run=()=>{items.forEach(i=>i.style.display=show.includes(i)?"":"none");A&&gsap.fromTo(show,{y:24,autoAlpha:0},{y:0,autoAlpha:1,duration:.8,stagger:.04,ease:"expo.out",clearProps:"transform,opacity,visibility"});refresh()};
    A?gsap.to(items.filter(i=>i.style.display!=="none"),{autoAlpha:0,y:-8,duration:.22,onComplete:run}):run()};
  f.addEventListener("click",e=>{const c=e.target.closest(".filter_clear");if(c){on.clear();apply();return}
    const b=e.target.closest(".filter_btn");if(!b)return;const k=b.dataset.k;if(k==="*"){if(!on.size)return;on.clear()}else on.has(k)?on.delete(k):on.add(k);apply()})});

/* ---------- Equipa: grelha (por defeito) ou lista com retrato que segue o cursor ---------- */
const holder=$("[data-team-holder]");
if(holder){const grid=$(".team_grid",holder),fl=$("[data-filter=team]")||holder.previousElementSibling;
  const bar=document.createElement("div");bar.className="team_bar";fl&&fl.parentElement===holder.parentElement?(fl.before(bar),bar.appendChild(fl)):holder.before(bar);
  const vt=document.createElement("div");vt.className="vt";vt.setAttribute("role","group");vt.setAttribute("aria-label","Ver como");
  vt.innerHTML='<span class="vt_ind"></span><button type="button" class="vt_btn" data-tv="grid" aria-pressed="true">Grelha</button><button type="button" class="vt_btn" data-tv="list" aria-pressed="false">Lista</button>';bar.appendChild(vt);
  const ind=$(".vt_ind",vt),vb=$$(".vt_btn",vt);holder.dataset.teamView="grid";
  const place=(b,anim)=>{const p={x:b.offsetLeft,w:b.offsetWidth};A&&anim?gsap.to(ind,{x:p.x,width:p.w,duration:.55,ease:"expo.out"}):G?gsap.set(ind,{x:p.x,width:p.w}):Object.assign(ind.style,{transform:`translateX(${p.x}px)`,width:p.w+"px"})};
  place(vb[0]);document.fonts&&document.fonts.ready.then(()=>place(vb.find(b=>b.getAttribute("aria-pressed")==="true")));
  addEventListener("resize",()=>place(vb.find(b=>b.getAttribute("aria-pressed")==="true")));
  const go=b=>{const v=b.dataset.tv;if(holder.dataset.teamView===v)return;snd("tick");place(b,true);vb.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    const cards=$$(".team_card",grid);
    if(A&&window.Flip){const s=Flip.getState(cards);holder.dataset.teamView=v;Flip.from(s,{duration:.8,ease:"expo.inOut",absolute:false,onComplete:refresh})}
    else if(A){gsap.to(grid,{autoAlpha:0,duration:.2,onComplete:()=>{holder.dataset.teamView=v;gsap.fromTo(grid.children,{y:20,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.03,ease:"expo.out",clearProps:"all"});gsap.set(grid,{autoAlpha:1});refresh()}})}
    else{holder.dataset.teamView=v;refresh()}};
  vb.forEach(b=>b.addEventListener("click",()=>go(b)));
  /* pré-visualização na lista */
  if(FINE&&A&&grid){const pv=document.createElement("div");pv.className="tpv";pv.setAttribute("aria-hidden","true");document.body.appendChild(pv);
    const qx=gsap.quickTo(pv,"x",{duration:.6,ease:"power3"}),qy=gsap.quickTo(pv,"y",{duration:.6,ease:"power3"}),qr=gsap.quickTo(pv,"rotation",{duration:.8,ease:"power3"});let cur=null,lx=0;
    gsap.set(pv,{xPercent:14,yPercent:-50,scale:.85});
    grid.addEventListener("pointermove",e=>{if(holder.dataset.teamView!=="list")return;qx(e.clientX);qy(e.clientY);qr(Math.max(-8,Math.min(8,(e.clientX-lx)*.4)));lx=e.clientX;
      const it=e.target.closest(".team_grid>*");if(!it||it===cur)return;cur=it;$$(".team_grid>*").forEach(x=>x.classList.toggle("is-active",x===it));grid.classList.add("is-hovering");
      const src=($(".team_img",it)||{}).currentSrc||($(".team_img",it)||{}).src;if(src){const im=new Image();im.src=src;im.alt="";pv.appendChild(im);
        gsap.fromTo(im,{clipPath:"inset(100% 0% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.7,ease:"expo.out",onComplete:()=>{while(pv.children.length>1)pv.firstChild.remove()}});gsap.to(pv,{autoAlpha:1,scale:1,duration:.5,ease:"expo.out"})}
      else gsap.to(pv,{autoAlpha:0,duration:.3})});
    grid.addEventListener("pointerleave",()=>{cur=null;grid.classList.remove("is-hovering");$$(".team_grid>*").forEach(x=>x.classList.remove("is-active"));gsap.to(pv,{autoAlpha:0,scale:.85,duration:.4})})}}

/* ---------- Parceiros e acordos: grelha em que os nomes vão rodando ---------- */
$$("[data-logo-wall]").forEach(root=>{const src=$$("[data-lw-item]",root);if(!src.length)return;
  const data=src.map(n=>({name:($("[data-lw-name]",n)||n).textContent.trim(),kind:($("[data-lw-kind]",n)||{}).textContent||"",img:(($("img",n)||{}).getAttribute&&$("img",n).getAttribute("src"))||""})).filter(d=>d.name);
  const list=$("[data-lw-list]",root)||src[0].parentElement;list.hidden=true;
  const w=document.createElement("div");w.className="lw";root.appendChild(w);
  const cols=()=>innerWidth<480?2:innerWidth<992?3:4;
  const item=d=>{const e=document.createElement("div");e.className="lw_item";e.innerHTML=(d.kind?`<span class="lw_kind">${d.kind}</span>`:"")+(d.img&&!/placeholder/i.test(d.img)?`<img src="${d.img}" alt="${d.name}" loading="lazy">`:`<span class="lw_name">${d.name}</span>`);return e};
  let cells=[],pool=[],tl;
  const build=()=>{tl&&tl.kill();w.innerHTML="";const n=Math.min(data.length,cols()*2);const sh=[...data].sort(()=>Math.random()-.5);
    cells=Array.from({length:n},(_,i)=>{const c=document.createElement("div");c.className="lw_cell";c.appendChild(item(sh[i]));w.appendChild(c);return c});pool=sh.slice(n);
    if(!A||!pool.length)return;const order=cells.map((_,i)=>i).sort(()=>Math.random()-.5);let k=0;
    tl=gsap.timeline({repeat:-1,repeatDelay:1.6});tl.call(()=>{const c=cells[order[k++%order.length]],cur=$(".lw_item",c),d=pool.shift(),inc=item(d);
      pool.push(data.find(x=>x.name===($(".lw_name",cur)||$("img",cur)||{}).textContent||x.name===(($("img",cur)||{}).alt))||d);
      c.appendChild(inc);gsap.fromTo(inc,{yPercent:50,autoAlpha:0},{yPercent:0,autoAlpha:1,duration:.9,delay:.1,ease:"expo.inOut"});gsap.to(cur,{yPercent:-50,autoAlpha:0,duration:.9,ease:"expo.inOut",onComplete:()=>cur.remove()})})};
  build();let lc=cols();addEventListener("resize",()=>{cols()!==lc&&(lc=cols(),build())});
  if(window.ScrollTrigger&&A)ScrollTrigger.create({trigger:root,start:"top bottom",end:"bottom top",onToggle:s=>tl&&(s.isActive?tl.play():tl.pause())});
  document.addEventListener("visibilitychange",()=>tl&&(document.hidden?tl.pause():tl.play()))});
})();
