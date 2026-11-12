/* ---------- Som: notas suaves no percurso das especialidades e no arco da equipa ----------
   Sintetizado com Web Audio (sem ficheiros). Só soa depois do primeiro toque, clique ou tecla,
   como pedem os browsers. Cada especialidade que a linha alcança toca uma nota de uma escala
   pentatónica a subir; no arco da equipa, cada profissional que chega ao centro dá um toque leve.
   Preferência guardada em localStorage ("cmd-sound") e alternável no rodapé. */
(()=>{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const KEY="cmd-sound",get=()=>{try{return localStorage.getItem(KEY)!=="off"}catch(e){return!0}};
  let on=get(),ctx=null,master=null,last=0;
  /* ré maior pentatónica, duas oitavas: soa sempre consonante, seja qual for a ordem */
  const SCALE=[587.33,659.25,739.99,880,987.77,1174.66,1318.51,1479.98];
  const init=()=>{if(ctx)return;ctx=new AC();master=ctx.createGain();master.gain.value=.05;
    const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2600;lp.Q.value=.4;master.connect(lp);lp.connect(ctx.destination)};
  const unlock=()=>{if(!on)return;init();ctx.state==="suspended"&&ctx.resume()};
  ["pointerdown","keydown","touchstart"].forEach(t=>addEventListener(t,unlock,{passive:!0}));
  document.addEventListener("visibilitychange",()=>{ctx&&(document.hidden?ctx.suspend():on&&ctx.resume())});

  /* uma nota: seno com um harmónico em triângulo, ataque curto e cauda longa, tipo marimba de vidro */
  const note=(freq,vel=1,dur=.9)=>{if(!on||!ctx||ctx.state!=="running")return;const now=ctx.currentTime;
    if(now-last<.045)return;last=now;
    const g=ctx.createGain();g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(vel,now+.008);g.gain.exponentialRampToValueAtTime(.0008,now+dur);g.connect(master);
    const o1=ctx.createOscillator();o1.type="sine";o1.frequency.value=freq;o1.connect(g);
    const g2=ctx.createGain();g2.gain.setValueAtTime(vel*.22,now);g2.gain.exponentialRampToValueAtTime(.0005,now+dur*.35);g2.connect(master);
    const o2=ctx.createOscillator();o2.type="triangle";o2.frequency.value=freq*2;o2.connect(g2);
    [o1,o2].forEach(o=>{o.start(now);o.stop(now+dur+.05)})};

  /* especialidades: nota ascendente por nó alcançado; ao recuar, nada */
  const sig=document.querySelector(".section_signature");
  if(sig){const nodes=[...sig.querySelectorAll(".signature_node")],state=new WeakMap();nodes.forEach(n=>state.set(n,n.classList.contains("is-on")));
    new MutationObserver(ms=>ms.forEach(m=>{const n=m.target,i=nodes.indexOf(n);if(i<0)return;const now=n.classList.contains("is-on");
      if(now&&!state.get(n))note(SCALE[i%SCALE.length],.9,1.1);state.set(n,now)})).observe(sig,{subtree:!0,attributes:!0,attributeFilter:["class"]})}

  /* arco da equipa: toque curto e mais grave quando um profissional chega ao centro */
  const arc=document.querySelector(".team-arc_list");
  if(arc){let prev=arc.querySelector(".team-arc_item.is-active");
    new MutationObserver(()=>{const a=arc.querySelector(".team-arc_item.is-active");if(a&&a!==prev){const i=+a.dataset.i||0;note(SCALE[i%5]/2,.75,.5)}prev=a})
      .observe(arc,{subtree:!0,attributes:!0,attributeFilter:["class"]})}

  /* interruptor no rodapé, ao lado de "Gerir cookies" */
  const ck=document.querySelector("[data-cookie-open]");
  if(ck&&(sig||arc)){const b=document.createElement("button");b.type="button";b.className="footer_link sound_toggle";
    const paint=()=>{b.textContent=on?"Som ligado":"Som desligado";b.setAttribute("aria-pressed",String(on))};paint();
    b.addEventListener("click",()=>{on=!on;try{localStorage.setItem(KEY,on?"on":"off")}catch(e){}paint();
      if(on){init();ctx.resume().then(()=>note(SCALE[2],.8,.8))}else ctx&&ctx.suspend()});
    ck.after(b)}
})();
