// Netlify olay fonksiyonu: her başarılı yayından sonra otomatik çalışır.
// Yalnız production (main) yayınında, build'in yazdığı /indexnow-changed.json'daki değişen adresleri IndexNow'a bildirir
// (Bing → Copilot/ChatGPT arama; Yandex vb.). Anahtar dosyası: /27600bd943324abba61b3df8ff35c089.txt
// Hata olursa yalnız loglar; site yayınını hiçbir şekilde etkilemez.
const KEY = '27600bd943324abba61b3df8ff35c089';
const HOST = 'omurgam.com';

export const handler = async (event) => {
  let payload = {};
  try { payload = JSON.parse(event.body || '{}').payload || {}; } catch { /* yok say */ }
  if (payload.context !== 'production') {
    console.log(`[indexnow] atlandı (context=${payload.context || '?'})`);
    return { statusCode: 200, body: 'skip' };
  }
  try {
    const r = await fetch(`https://${HOST}/indexnow-changed.json`, { headers: { 'cache-control': 'no-cache' } });
    const { urls = [] } = r.ok ? await r.json() : {};
    const list = urls.filter((u) => typeof u === 'string' && u.startsWith(`https://${HOST}/`)).slice(0, 10000);
    if (!list.length) { console.log('[indexnow] değişen adres yok'); return { statusCode: 200, body: 'none' }; }
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: list }),
    });
    console.log(`[indexnow] ${list.length} adres gönderildi → HTTP ${res.status}`);
    return { statusCode: 200, body: `sent ${list.length} (${res.status})` };
  } catch (e) {
    console.log(`[indexnow] hata: ${e && e.message}`);
    return { statusCode: 200, body: 'error' };
  }
};
