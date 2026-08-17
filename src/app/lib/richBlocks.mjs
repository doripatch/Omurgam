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
