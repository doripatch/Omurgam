// Offline regression tests: no GA script execution or network requests.
// Run: node --test scripts/test-analytics.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const code = transformSync(readFileSync(new URL('../src/app/lib/analytics.ts', import.meta.url), 'utf8'), {
  loader: 'ts', format: 'cjs',
}).code;
function setup() {
  const calls = [], scripts = [], timers = new Map();
  let id = 0;
  const handlers = {};
  const window = { location: { href: 'https://example.test/a' }, gtag: (...args) => calls.push(args),
    addEventListener: (name, fn) => { handlers[name] = fn; } };
  const context = {
    window, document: { createElement: () => ({}), head: { appendChild: s => scripts.push(s) } },
    module: { exports: {} },
    setTimeout: (fn, delay) => { timers.set(++id, { fn, delay }); return id; },
    clearTimeout: key => timers.delete(key),
  };
  vm.runInNewContext(code, context);
  const api = context.module.exports;
  const flush = (maxDelay = Infinity) => {
    for (const [key, timer] of [...timers]) if (timer.delay <= maxDelay) {
      timers.delete(key); timer.fn();
    }
  };
  const views = () => calls.filter(c => c[0] === 'event' && c[1] === 'page_view');
  const navigate = (path, key, title) => {
    window.location.href = `https://example.test${path}`;
    if (title) api.setAnalyticsPageTitle(key, title);
    api.trackPageview(path, key);
  };
  return { api, flush, views, navigate, scripts, calls, handlers };
}

test('saved consent + repeated mount sends exactly one initial pageview', () => {
  const t = setup();
  t.api.grantAnalyticsConsent();
  t.navigate('/a', 'a', 'A');
  t.api.grantAnalyticsConsent();
  t.api.trackPageview('/a', 'a');
  t.flush();
  assert.equal(t.views().length, 1);
  assert.equal(t.scripts.length, 1);
  assert.equal(t.calls.find(c => c[0] === 'config')[2].send_page_view, false);
});
test('no consent sends nothing; first acceptance counts only current page', () => {
  const t = setup();
  t.navigate('/a', 'a', 'A'); t.flush();
  t.navigate('/b', 'b', 'B'); t.flush();
  assert.equal(t.views().length, 0);
  assert.equal(t.scripts.length, 0);
  t.api.grantAnalyticsConsent(); t.flush();
  assert.equal(t.views().length, 1);
  assert.equal(t.views()[0][2].page_path, '/b');
});
test('SPA navigation, query changes and Back/Forward each count once', () => {
  const t = setup(); t.api.grantAnalyticsConsent();
  for (const [path, key, title] of [['/a','a','A'],['/b','b','B'],['/b?q=1','q','Query'],['/a','a','A'],['/b','b','B']]) {
    t.navigate(path, key, title); t.flush();
  }
  assert.equal(t.views().length, 5);
  assert.equal(t.views()[2][2].page_location, 'https://example.test/b?q=1');
});
test('repeated consent save and regrant do not recount a sent visit', () => {
  const t = setup(); t.api.grantAnalyticsConsent();
  t.navigate('/a', 'a', 'A'); t.flush();
  t.api.grantAnalyticsConsent(); t.flush();
  t.api.revokeAnalyticsConsent(); t.api.grantAnalyticsConsent(); t.flush();
  assert.equal(t.views().length, 1);
});
test('revocation cancels queued send; denied navigation never sends', () => {
  const t = setup(); t.api.grantAnalyticsConsent();
  t.navigate('/a', 'a', 'A'); t.api.revokeAnalyticsConsent(); t.flush();
  t.navigate('/b', 'b', 'B'); t.flush();
  assert.equal(t.views().length, 0);
  t.api.grantAnalyticsConsent(); t.flush();
  assert.equal(t.views().length, 1);
  assert.equal(t.views()[0][2].page_path, '/b');
});
test('async MR title replaces loading title before single send', () => {
  const t = setup(); t.api.grantAnalyticsConsent();
  t.api.setAnalyticsPageTitle('mr', 'Generic title', false);
  t.navigate('/mr-analiz/retrolistezis/', 'mr'); t.flush(0);
  assert.equal(t.views().length, 0);
  t.api.setAnalyticsPageTitle('mr', 'Retrolistezis | Omurgam'); t.flush();
  assert.equal(t.views().length, 1);
  assert.equal(t.views()[0][2].page_title, 'Retrolistezis | Omurgam');
  t.api.setAnalyticsPageTitle('mr', 'Later update'); t.flush();
  assert.equal(t.views().length, 1);
});
test('missing/slow metadata uses path, never previous title', () => {
  const t = setup(); t.api.grantAnalyticsConsent();
  t.navigate('/a','a','A'); t.flush();
  t.navigate('/no-seo','b'); t.flush();
  assert.equal(t.views()[1][2].page_title, '/no-seo');
});
test('rapid navigation preserves pending previous visit URL', () => {
  const t = setup(); t.api.grantAnalyticsConsent();
  t.navigate('/a','a'); t.navigate('/b','b','B'); t.flush();
  assert.equal(t.views().length, 2);
  assert.equal(t.views()[0][2].page_location, 'https://example.test/a');
  assert.equal(t.views()[1][2].page_title, 'B');
});
test('pagehide flushes a pending view once and respects revocation', () => {
  const t = setup(); t.api.grantAnalyticsConsent();
  t.navigate('/a', 'a'); t.handlers.pagehide(); t.flush();
  assert.equal(t.views().length, 1);
  t.navigate('/b', 'b'); t.api.revokeAnalyticsConsent();
  t.handlers.pagehide(); t.flush();
  assert.equal(t.views().length, 1);
});
