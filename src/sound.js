/* ---------- Som ----------
   Sons de interface discretos e com espaço: cliques de vidro e ar, sem graves nem notas.
   Tudo passa por uma reverberação curta gerada no momento, que dá o acabamento "de sala".
   · toque   : clicar em links, botões e opções (tique de vidro muito curto)
   · detente : cada especialidade alcançada no scroll horizontal e cada profissional no arco (mais leve)
   · sopro   : abrir e fechar o formulário de marcação e o menu (ar a passar)
   · fecho   : pedido de marcação enviado (brilho suave)
   A altura varia uns poucos por cento a cada som, para nunca soar a nota nem a repetição mecânica.
   Os browsers só deixam tocar depois de um gesto (clique, toque ou tecla). O scroll não conta,
   por isso há um botão de som na navegação: é o convite e o interruptor. Preferência em localStorage. */
(()=>{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const KEY="cmd-sound";let on=!0;try{on=localStorage.getItem(KEY)!=="off"}catch(e){}
  let ctx=null,out=null,noise=null;const lastAt={};
  const init=()=>{if(ctx)return;ctx=new AC();const sr=ctx.sampleRate;
    out=ctx.createGain();out.gain.value=.55;
    const hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=380;
    const dry=ctx.createGain();dry.gain.value=.8;const wet=ctx.createGain();wet.gain.value=.32;
    /* reverberação: ruído estéreo a decair, 1,1 s */
    const rv=ctx.createConvolver(),il=sr*1.1|0,ir=ctx.createBuffer(2,il,sr);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<il;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/il,3.2)}rv.buffer=ir;
    const tone=ctx.createBiquadFilter();tone.type="lowpass";tone.frequency.value=6500;
    out.connect(hp);hp.connect(dry);hp.connect(rv);rv.connect(wet);dry.connect(tone);wet.connect(tone);tone.connect(ctx.destination);
    const len=sr*.5|0,b=ctx.createBuffer(1,len,sr),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;noise=b};
  const ready=()=>on&&ctx&&ctx.state==="running";
  const unlock=e=>{if(!on||e.target.closest&&e.target.closest(".sound_btn,.sound_toggle"))return;init();ctx.state==="suspended"&&ctx.resume().then(paint)};
  ["pointerdown","keydown","touchend"].forEach(t=>addEventListener(t,unlock,{passive:!0,capture:!0}));
  document.addEventListener("visibilitychange",()=>{ctx&&(document.hidden?ctx.suspend():on&&ctx.resume())});
  const gate=(k,ms)=>{const t=performance.now();if(t-(lastAt[k]||0)<ms)return!1;lastAt[k]=t;return!0};
  const jit=(v,p=.04)=>v*(1+(Math.random()*2-1)*p);

  /* ruído filtrado com envelope */
  const air=(t,{type="bandpass",f=4000,q=1,a=.001,dur=.02,gain=.1,f2=null})=>{const s=ctx.createBufferSource();s.buffer=noise;
    const bf=ctx.createBiquadFilter();bf.type=type;bf.frequency.setValueAtTime(f,t);f2&&bf.frequency.exponentialRampToValueAtTime(f2,t+dur);bf.Q.value=q;
    const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(bf);bf.connect(g);g.connect(out);s.start(t,Math.random()*.4);s.stop(t+dur+.02)};
  /* brilho: seno agudo e curto, como vidro tocado de leve */
  const glint=(t,{f=2800,a=.002,dur=.09,gain=.035})=>{const o=ctx.createOscillator();o.type="sine";o.frequency.setValueAtTime(f,t);
    const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.02)};

  const S={
    tap(){if(!ready()||!gate("tap",70))return;const t=ctx.currentTime;air(t,{type:"highpass",f:jit(5200),q:.7,dur:.012,gain:.09});glint(t,{f:jit(3100),dur:.07,gain:.028})},
    detent(v=1){if(!ready()||!gate("detent",70))return;const t=ctx.currentTime;air(t,{f:jit(4600,.06),q:2.2,dur:.009,gain:.07*v});glint(t,{f:jit(4200,.05),dur:.04,gain:.012*v})},
    breath(open=!0){if(!ready()||!gate("breath",300))return;const t=ctx.currentTime;air(t,{f:open?900:2600,f2:open?2600:900,q:1.6,a:.14,dur:.5,gain:.05})},
    done(){if(!ready())return;const t=ctx.currentTime;glint(t,{f:jit(2400,.02),a:.03,dur:.9,gain:.03});air(t+.02,{f:3000,f2:5200,q:1.2,a:.08,dur:.6,gain:.03})}};
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
