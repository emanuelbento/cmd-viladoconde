// Pós processamento dos títulos no Figma (correr com use_figma depois de build2-figma.js).
// 1. Junta títulos partidos em palavras ou linhas (SplitText do site) numa só camada de texto, com quebras de linha do site.
// 2. Aplica os estilos locais "Black Mango/NN". Se o tamanho do site não existir nos estilos, aplica o estilo
//    com a proporção de entrelinha mais próxima e faz rescale para o tamanho exato (fica Black Mango, sem estilo ligado).
// Definir SECTION com o id da secção da página antes de correr.
const SECTION = "333:2";
const S = await figma.getNodeByIdAsync(SECTION);
const isC = t => t.type === 'TEXT' && t.fontName !== figma.mixed && t.fontName.family === 'Cormorant Garamond';
for (const t of S.findAll(isC)) await figma.loadFontAsync(t.fontName);
const piece = c => isC(c) || (c.type === 'FRAME' && c.children.length === 1 && isC(c.children[0]));
const groups = S.findAll(n => n.type === 'FRAME' && n.children.length >= 2 && n.children.every(piece));
for (const G of groups) {
  const ps = G.children.map(c => c.type === 'TEXT' ? { t: c, x: c.x, y: c.y } : { t: c.children[0], x: c.x + c.children[0].x, y: c.y + c.children[0].y });
  ps.sort((a, b) => a.y - b.y || a.x - b.x);
  const lines = [];
  for (const p of ps) { const L = lines.find(l => Math.abs(l.y - p.y) < 4); if (L) L.w.push(p); else lines.push({ y: p.y, w: [p] }); }
  lines.forEach(l => l.w.sort((a, b) => a.x - b.x));
  const f0 = ps[0].t; const nt = figma.createText(); G.appendChild(nt); nt.fontName = f0.fontName;
  let s = ''; const rng = [];
  lines.forEach((l, li) => {
    l.w.forEach((p, wi) => {
      const a = s.length; s += p.t.characters.trim();
      const fl = p.t.fills === figma.mixed ? p.t.getRangeFills(0, 1) : p.t.fills;
      rng.push([a, s.length, fl]); if (wi < l.w.length - 1) s += ' ';
    });
    // Parágrafos (manifesto) quebram naturalmente; títulos mantêm as quebras do site.
    if (li < lines.length - 1) s += /manifesto/.test(G.name) ? ' ' : '\n';
  });
  nt.characters = s; nt.fontSize = f0.fontSize;
  nt.lineHeight = lines.length > 1 ? { unit: 'PIXELS', value: lines[1].y - lines[0].y } : f0.lineHeight;
  nt.letterSpacing = f0.letterSpacing;
  for (const [a, b, fl] of rng) if (b > a) nt.setRangeFills(a, b, JSON.parse(JSON.stringify(fl)));
  if (f0.textAlignHorizontal !== 'LEFT') nt.textAlignHorizontal = f0.textAlignHorizontal;
  // Como nos wireframes: largura fixa do contentor, altura automática (nunca transborda).
  nt.name = 'Título'; nt.textAutoResize = 'HEIGHT'; nt.resize(G.width, nt.height);
  const op = f0.opacity; for (const c of [...G.children]) if (c !== nt) c.remove();
  G.layoutWrap = 'NO_WRAP'; G.layoutMode = 'VERTICAL'; G.itemSpacing = 0;
  G.paddingTop = G.paddingBottom = G.paddingLeft = G.paddingRight = 0;
  if (op < 1) nt.opacity = op; G.primaryAxisSizingMode = 'AUTO'; G.counterAxisSizingMode = 'FIXED';
}
const bm = (await figma.getLocalTextStylesAsync()).filter(s => /^Black Mango\//.test(s.name))
  .map(s => ({ s, sz: s.fontSize, r: s.lineHeight.unit === 'PIXELS' ? s.lineHeight.value / s.fontSize : 1.2 }));
for (const t of S.findAll(isC)) {
  const sz = t.fontSize;
  const lh = t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value / sz : (t.lineHeight.unit === 'PERCENT' ? t.lineHeight.value / 100 : 1.2);
  const exact = bm.find(b => Math.abs(b.sz - sz) < 0.3 && Math.abs(b.r - lh) < 0.08);
  const pick = exact || bm.slice().sort((a, b) => (Math.abs(a.r - lh) * 200 + Math.abs(a.sz - sz)) - (Math.abs(b.r - lh) * 200 + Math.abs(b.sz - sz)))[0];
  const k = sz / pick.sz;
  if (t.textAutoResize === 'HEIGHT' || t.textAutoResize === 'NONE') t.resize(t.width / k, t.height);
  t.name = 'Título'; const px = t.x, py = t.y;
  await t.setTextStyleIdAsync(pick.s.id);
  if (!exact) t.rescale(k);
  if (t.parent.layoutMode === 'NONE' || t.layoutPositioning === 'ABSOLUTE') { t.x = px; t.y = py; }
}
