// Ortak SAF içerik parser'ı (JSX YOK) — hem React bileşenleri (RichText, NoteContent)
// hem de Node prerender (prerender-content.mjs) AYNI bu modülü kullanır.
// Amaç: React görünümü ile prerender HTML çıktısının yapısal ayrışmasını önlemek.
// İçerik metni ASLA değiştirilmez; yalnızca bloklara ayrılır. dangerouslySetInnerHTML YOK.

// --- Inline: **kalın** (+ opsiyonel *italik*) → segment dizisi ---
// segment: { t: 'text' | 'strong' | 'em', v: string }
export function parseInline(text, italic = false) {
  const re = italic ? /(\*\*[^*]+\*\*|\*[^*]+\*)/g : /(\*\*[^*]+\*\*)/g;
  const parts = String(text ?? '').split(re);
  const segs = [];
  for (const p of parts) {
    if (p === '') continue;
    if (p.startsWith('**') && p.endsWith('**')) segs.push({ t: 'strong', v: p.slice(2, -2) });
    else if (italic && p.length > 2 && p.startsWith('*') && p.endsWith('*')) segs.push({ t: 'em', v: p.slice(1, -1) });
    else segs.push({ t: 'text', v: p });
  }
  return segs;
}

// --- BLOG (RichText ile birebir sınıflandırma) ---
// block: {type:'h2'|'h3'|'lead'|'p', inline} | {type:'ul', items: inline[]}
export function parseBlog(text) {
  const lines = String(text ?? '').split('\n');
  const blocks = [];
  let bullets = [];
  const flush = () => { if (bullets.length) { blocks.push({ type: 'ul', items: bullets.map((b) => parseInline(b, false)) }); bullets = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const h2 = line.match(/^##\s+(.*)$/);
    const h3 = line.match(/^###\s+(.*)$/);
    const bullet = line.match(/^[-•]\s+(.+)$/);
    const wholeBold = line.match(/^\*\*(.+)\*\*$/);
    if (h3) { flush(); blocks.push({ type: 'h3', inline: parseInline(h3[1], false) }); }
    else if (h2) { flush(); blocks.push({ type: 'h2', inline: parseInline(h2[1], false) }); }
    else if (bullet) { bullets.push(bullet[1]); }
    else if (wholeBold && !wholeBold[1].includes('**')) { flush(); blocks.push({ type: 'lead', inline: parseInline(wholeBold[1], false) }); }
    else { flush(); blocks.push({ type: 'p', inline: parseInline(line, false) }); }
  }
  flush();
  return blocks;
}

// --- KLİNİSYEN (NoteContent ile birebir sınıflandırma) ---
const HEADING_EMOJI = [
  [/irritabil/i, '🔥'], [/doz|yük|load|şiddet/i, '⚖️'], [/ağrı|semptom/i, '⚠️'],
  [/hareket|mobil|rom|esnek/i, '🔄'], [/kuvvet|güç|strength|kas/i, '💪'],
  [/dayanıklıl|endurans|kondisyon/i, '🔋'], [/nefes|solunum/i, '🫁'],
  [/dinlen|uyku|toparlan|istirahat/i, '😴'], [/ilerle|progres|artır|aşama/i, '📈'],
  [/ölç|değerlendir|test|izle|takip/i, '📊'], [/hedef|amaç|plan/i, '🎯'],
  [/süre|zaman|frekans|sıklık/i, '⏱️'], [/uyarı|dikkat|kırmızı|red flag|risk/i, '🚩'],
  [/postür|duruş|hizalan/i, '🧍'], [/egzersiz|hareket reçete|program/i, '🏋️'],
];
export function emojiForNote(title) {
  for (const [re, e] of HEADING_EMOJI) if (re.test(title)) return e;
  return '📌';
}

// block: {type:'noteHeading', emoji, inline} | {type:'numbered', num, emoji, inline}
//      | {type:'subhead', inline} | {type:'p', inline} | {type:'ul', items: inline[]}
export function parseNote(text) {
  const lines = String(text ?? '').split('\n');
  const blocks = [];
  let bullets = [];
  const flush = () => { if (bullets.length) { blocks.push({ type: 'ul', items: bullets.map((b) => parseInline(b, true)) }); bullets = []; } };
  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) { flush(); return; }
    const md = line.match(/^(#{2,3})\s+(.*)$/);
    const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
    const explicitBullet = line.match(/^[-•*]\s+(.+)$/);
    const isBulletComma = line.endsWith(',');
    const isSubhead = line.endsWith(':') && line.length <= 80;
    if (md) { flush(); blocks.push({ type: 'noteHeading', emoji: emojiForNote(md[2]), inline: parseInline(md[2], true) }); }
    else if (numbered && !isBulletComma) { flush(); blocks.push({ type: 'numbered', num: numbered[1], emoji: emojiForNote(numbered[2]), inline: parseInline(numbered[2], true) }); }
    else if (explicitBullet) { bullets.push(explicitBullet[1]); }
    else if (isBulletComma) { bullets.push(line.replace(/,$/, '')); }
    else if (bullets.length > 0 && line.length <= 70 && !/[.:]/.test(line.slice(0, -1))) { bullets.push(line.replace(/[.,]$/, '')); flush(); }
    else if (isSubhead) { flush(); blocks.push({ type: 'subhead', inline: parseInline(line, true) }); }
    else { flush(); blocks.push({ type: 'p', inline: parseInline(line, true) }); }
  });
  flush();
  return blocks;
}

// --- Güvenli HTML üretimi (Node prerender için; React tarafı JSX ile aynı bloklardan render eder) ---
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function inlineToHtml(segs) {
  return segs.map((s) => {
    if (s.t === 'strong') return `<strong>${escapeHtml(s.v)}</strong>`;
    if (s.t === 'em') return `<em>${escapeHtml(s.v)}</em>`;
    return escapeHtml(s.v);
  }).join('');
}
export function blogBlocksToHtml(blocks) {
  return blocks.map((b) => {
    if (b.type === 'h2') return `<h2>${inlineToHtml(b.inline)}</h2>`;
    if (b.type === 'h3') return `<h3>${inlineToHtml(b.inline)}</h3>`;
    if (b.type === 'lead') return `<p class="lead"><strong>${inlineToHtml(b.inline)}</strong></p>`;
    if (b.type === 'ul') return `<ul>${b.items.map((it) => `<li>${inlineToHtml(it)}</li>`).join('')}</ul>`;
    return `<p>${inlineToHtml(b.inline)}</p>`;
  }).join('\n');
}
export function noteBlocksToHtml(blocks) {
  return blocks.map((b) => {
    if (b.type === 'noteHeading') return `<h3>${escapeHtml(b.emoji)} ${inlineToHtml(b.inline)}</h3>`;
    if (b.type === 'numbered') return `<h3>${escapeHtml(b.num)}. ${escapeHtml(b.emoji)} ${inlineToHtml(b.inline)}</h3>`;
    if (b.type === 'subhead') return `<p class="subhead"><strong>${inlineToHtml(b.inline)}</strong></p>`;
    if (b.type === 'ul') return `<ul>${b.items.map((it) => `<li>${inlineToHtml(it)}</li>`).join('')}</ul>`;
    return `<p>${inlineToHtml(b.inline)}</p>`;
  }).join('\n');
}

// ==========================================================================
// EDİTORYAL parser — YALNIZ kaleminden + saglikli-yasam aileleri için.
// ANLAMSAL BAŞLIK (h2/h3) UYDURULMAZ: soru satırı ve ':' satırı yalnız görsel
// vurgu (<p><strong>) alır. Metin/kelime/noktalama/emoji BİREBİR korunur;
// yalnız liste işaretleri (-, •, 1.) blok yapısına (ul/ol) dönüşür.
// React (EditorialText) ve Node prerender AYNI bu parser'ı kullanır.
// ==========================================================================
const _isBullet = (l) => /^[-•]\s+\S/.test(l) || /^[-•]\t/.test(l);
const _bulletText = (l) => l.replace(/^[-•](\s+|\t)/, '');
const _isNum = (l) => /^\d+[.)]\s+\S/.test(l) && !l.endsWith(',');
const _numText = (l) => l.replace(/^\d+[.)]\s+/, '');
const _isColonSub = (l) => /[:：]$/.test(l) && l.length <= 60 && l.split(/\s+/).length <= 8;
const _isQuote = (l) => /^["“«].+["”»]$/.test(l);
const _conceptMatch = (l) => { const m = l.match(/^([^:：]{2,40})([:：]\s+.+)$/); return (m && !/[.,;?!]/.test(m[1])) ? m : null; };
const _isQHead = (l, next) => l.endsWith('?') && l.length <= 70 && next !== '' && next.length > l.length && !_isBullet(next) && !_isNum(next);

export function parseEditorial(text) {
  const lines = String(text ?? '').split('\n').map((x) => x.trim());
  const blocks = [];
  let leadDone = false, i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l) { i++; continue; }
    const next = lines[i + 1] || '';
    if (_isBullet(l)) { const items = []; while (i < lines.length && _isBullet(lines[i])) { items.push(_bulletText(lines[i])); i++; } blocks.push({ type: 'ul', items }); continue; }
    if (_isNum(l)) { const items = []; while (i < lines.length && _isNum(lines[i])) { items.push(_numText(lines[i])); i++; } blocks.push({ type: 'ol', items }); continue; }
    if (_isColonSub(l)) { blocks.push({ type: 'subhead', text: l }); i++; continue; }
    if (_isQuote(l)) { blocks.push({ type: 'quote', text: l }); i++; continue; }
    if (_isQHead(l, next)) { blocks.push({ type: 'qhead', text: l }); i++; continue; }
    if (!leadDone) { blocks.push({ type: 'lead', text: l }); leadDone = true; i++; continue; }
    const cm = _conceptMatch(l);
    if (cm) { blocks.push({ type: 'concept', term: cm[1], rest: cm[2] }); i++; continue; }
    blocks.push({ type: 'p', text: l }); i++;
  }
  return blocks;
}

export function editorialBlocksToHtml(blocks) {
  return blocks.map((b) => {
    if (b.type === 'lead') return `<p class="lead">${escapeHtml(b.text)}</p>`;
    if (b.type === 'qhead') return `<p class="qhead"><strong>${escapeHtml(b.text)}</strong></p>`;
    if (b.type === 'subhead') return `<p class="subhead"><strong>${escapeHtml(b.text)}</strong></p>`;
    if (b.type === 'quote') return `<p class="quote"><em>${escapeHtml(b.text)}</em></p>`;
    if (b.type === 'concept') return `<p><strong>${escapeHtml(b.term)}</strong>${escapeHtml(b.rest)}</p>`;
    if (b.type === 'ul') return `<ul>${b.items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
    if (b.type === 'ol') return `<ol>${b.items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ol>`;
    return `<p>${escapeHtml(b.text)}</p>`;
  }).join('\n');
}
