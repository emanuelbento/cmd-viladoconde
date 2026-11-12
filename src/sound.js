/* ---------- Som ----------
   Uma só família de sons, táteis e sem altura musical: ruído filtrado com um corpo grave muito curto,
   como tocar em papel grosso ou em feltro. Nada de notas nem escalas.
   · toque   : clicar em links, botões e opções
   · detente : cada especialidade que a linha alcança e cada profissional que chega ao centro do arco
   · sopro   : abrir e fechar o formulário de marcação e o menu
   · fecho   : pedido de marcação enviado, um único som mais cheio
   Os browsers só deixam tocar depois de um gesto (clique, toque ou tecla). O scroll não conta,
   por isso há um botão de som na navegação: é o convite e o interruptor. Preferência em localStorage. */
(()=>{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const KEY="cmd-sound";let on=!0;try{on=localStorage.getItem(KEY)!=="off"}catch(e){}
  let ctx=null,out=null,noise=null;const lastAt={};
  const init=()=>{if(ctx)return;ctx=new AC();out=ctx.createGain();out.gain.value=.5;
    const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=7000;out.connect(lp);lp.connect(ctx.destination);
    const len=ctx.sampleRate*.5|0,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;noise=b};
  const ready=()=>on&&ctx&&ctx.state==="running";
  const unlock=()=>{if(!on)return;init();ctx.state==="suspended"&&ctx.resume().then(paint)};
  ["pointerdown","keydown","touchend"].forEach(t=>addEventListener(t,unlock,{passive:!0,capture:!0}));
  document.addEventListener("visibilitychange",()=>{ctx&&(document.hidden?ctx.suspend():on&&ctx.resume())});
  const gate=(k,ms)=>{const t=performance.now();if(t-(lastAt[k]||0)<ms)return!1;lastAt[k]=t;return!0};

  /* ruído filtrado com envelope */
  const burst=(t,{type="bandpass",f=1800,q=1,a=.002,dur=.05,gain=.2,f2=null})=>{const s=ctx.createBufferSource();s.buffer=noise;s.playbackRate.value=.9+Math.random()*.2;
    const bf=ctx.createBiquadFilter();bf.type=type;bf.frequency.setValueAtTime(f,t);f2&&bf.frequency.exponentialRampToValueAtTime(f2,t+dur);bf.Q.value=q;
    const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(bf);bf.connect(g);g.connect(out);s.start(t,Math.random()*.3);s.stop(t+dur+.02)};
  /* corpo grave: seno que cai depressa de frequência, sem nota percetível */
  const body=(t,{f=150,dur=.06,gain=.18})=>{const o=ctx.createOscillator();o.type="sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.55,t+dur);
    const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.02)};

  const S={
    tap(){if(!ready()||!gate("tap",60))return;const t=ctx.currentTime;burst(t,{f:2200,q:.9,dur:.035,gain:.16});body(t,{f:170,dur:.05,gain:.12})},
    detent(v=1){if(!ready()||!gate("detent",55))return;const t=ctx.currentTime;burst(t,{type:"highpass",f:3200,q:.5,dur:.018,gain:.11*v});body(t,{f:120,dur:.035,gain:.07*v})},
    breath(open=!0){if(!ready()||!gate("breath",250))return;const t=ctx.currentTime;burst(t,{f:open?500:1400,f2:open?1400:450,q:.7,a:.09,dur:.42,gain:.07})},
    done(){if(!ready())return;const t=ctx.currentTime;body(t,{f:110,dur:.32,gain:.16});burst(t,{f:900,f2:2600,q:.6,a:.04,dur:.5,gain:.05})}};
  window.cmdSound=S;

  /* toques: só em elementos interativos, uma vez por clique */
  document.addEventListener("click",e=>{const el=e.target.closest("a,button,summary,label,[role=button],[role=tab]");if(!el||el.closest(".sound_btn,.sound_toggle"))return;
    if(el.matches("[data-book],.nav_menu-btn"))return;S.tap()},{capture:!0});

  /* detentes: especialidades no scroll horizontal (só ao avançar) e arco da equipa */
  const sig=document.querySelector(".section_signature");
  if(sig){const nodes=[...sig.querySelectorAll(".signature_node")],st=new WeakMap(nodes.map(n=>[n,n.classList.contains("is-on")]));
    new MutationObserver(ms=>{for(const m of ms){const n=m.target;if(!st.has(n))continue;const v=n.classList.contains("is-on");v&&!st.get(n)&&S.detent(1);st.set(n,v)}})
      .observe(sig,{subtree:!0,attributes:!0,attributeFilter:["class"]})}
  const arc=document.querySelector(".team-arc_list");
  if(arc){let prev=arc.querySelector(".team-arc_item.is-active");
    new MutationObserver(()=>{const a=arc.querySelector(".team-arc_item.is-active");a&&a!==prev&&S.detent(.8);prev=a}).observe(arc,{subtree:!0,attributes:!0,attributeFilter:["class"]})}

  /* sopros: formulário de marcação e menu */
  const dr=document.querySelector("[data-book-drawer]");
  if(dr){let was=dr.getAttribute("aria-hidden")==="false";new MutationObserver(()=>{const v=dr.getAttribute("aria-hidden")==="false";v!==was&&S.breath(v);was=v}).observe(dr,{attributes:!0,attributeFilter:["aria-hidden"]})}
  const nav=document.querySelector("[data-nav]");
  if(nav){let was=nav.classList.contains("is-open");new MutationObserver(()=>{const v=nav.classList.contains("is-open");v!==was&&S.breath(v);was=v}).observe(nav,{attributes:!0,attributeFilter:["class"]})}
  /* fecho: mensagem de sucesso do formulário fica visível */
  document.querySelectorAll(".w-form-done").forEach(d=>new MutationObserver(()=>{getComputedStyle(d).display!=="none"&&S.done()}).observe(d,{attributes:!0,attributeFilter:["style"]}));

  /* botão de som na navegação e interruptor de texto no rodapé */
  const btns=[];
  const paint=()=>{const live=on&&ctx&&ctx.state==="running";btns.forEach(b=>{b.setAttribute("aria-pressed",String(b.classList.contains("sound_btn")?!!live:on));b.classList.toggle("is-live",!!live);
    b.classList.contains("sound_toggle")&&(b.textContent=on?"Som ligado":"Som desligado")})};
  const flip=()=>{on=!on;try{localStorage.setItem(KEY,on?"on":"off")}catch(e){}
    if(on){init();ctx.resume().then(()=>{paint();S.tap()})}else{ctx&&ctx.suspend();paint()}};
  const acts=document.querySelector(".nav_actions");
  if(acts){const b=document.createElement("button");b.type="button";b.className="sound_btn";b.setAttribute("aria-label","Som da página");
    b.innerHTML='<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
    b.addEventListener("click",()=>{on&&(!ctx||ctx.state!=="running")?(init(),ctx.resume().then(()=>{paint();S.tap()})):flip()});
    acts.insertBefore(b,acts.querySelector(".nav_book")||acts.firstChild);btns.push(b)}
  const ck=document.querySelector("[data-cookie-open]");
  if(ck){const b=document.createElement("button");b.type="button";b.className="footer_link sound_toggle";b.addEventListener("click",flip);ck.after(b);btns.push(b)}
  paint();
})();
