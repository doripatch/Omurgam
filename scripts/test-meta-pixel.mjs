// Offline regression tests: no Pixel script execution or network requests.
// Run: node --test scripts/test-meta-pixel.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const source = readFileSync(new URL('../src/app/lib/metaPixel.ts', import.meta.url), 'utf8');
function compile(id) {
  const re = /export const META_PIXEL_ID = '[^']*';/;
  assert.match(source, re, 'META_PIXEL_ID satırı bulunamadı');
  const withId = source.replace(re, `export const META_PIXEL_ID = '${id}';`);
  return transformSync(withId, { loader: 'ts', format: 'cjs' }).code;
}
function setup(id = '123456789') {
  const scripts = [], cookieWrites = [];
  const window = { location: { hostname: 'www.omurgam.com' } };
  const document = {
    createElement: () => ({}),
    head: { appendChild: (s) => scripts.push(s) },
    set cookie(v) { cookieWrites.push(v); },
  };
  const context = { window, document, module: { exports: {} } };
  vm.runInNewContext(compile(id), context);
  const api = context.module.exports;
  const calls = () => (window.fbq ? window.fbq.queue : []);
  const pageviews = () => calls().filter((c) => c[0] === 'track' && c[1] === 'PageView');
  return { api, window, scripts, cookieWrites, calls, pageviews };
}

test('no consent: no script, no fbq, no pageview', () => {
  const t = setup();
  t.api.trackMetaPageview('a');
  t.api.trackMetaPageview('b');
  assert.equal(t.scripts.length, 0);
  assert.equal(t.window.fbq, undefined);
});

test('consent counts only the current page once, then each new route once', () => {
  const t = setup();
  t.api.trackMetaPageview('a');
  t.api.trackMetaPageview('b');
  t.api.grantMarketingConsent();
  assert.equal(t.scripts.length, 1);
  assert.equal(t.scripts[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
  assert.equal(t.pageviews().length, 1);
  t.api.grantMarketingConsent();          // repeated consent apply
  t.api.trackMetaPageview('b');           // repeated effect for same route
  assert.equal(t.pageviews().length, 1);
  assert.equal(t.scripts.length, 1);
  t.api.trackMetaPageview('c');
  assert.equal(t.pageviews().length, 2);
});

test('autoConfig disabled and set before init', () => {
  const t = setup();
  t.api.grantMarketingConsent();
  const q = t.calls();
  const auto = q.findIndex((c) => c[0] === 'set' && c[1] === 'autoConfig' && c[2] === false && c[3] === '123456789');
  const init = q.findIndex((c) => c[0] === 'init' && c[1] === '123456789');
  assert.ok(auto >= 0 && init > auto);
});

test('revoke stops pageviews and clears Meta cookies', () => {
  const t = setup();
  t.api.trackMetaPageview('a');
  t.api.grantMarketingConsent();
  t.api.revokeMarketingConsent();
  t.api.trackMetaPageview('b');
  assert.equal(t.pageviews().length, 1);
  assert.ok(t.calls().some((c) => c[0] === 'consent' && c[1] === 'revoke'));
  assert.ok(t.cookieWrites.some((c) => c.startsWith('_fbp=;') && c.includes('domain=.omurgam.com')));
  assert.ok(t.cookieWrites.some((c) => c.startsWith('_fbc=;')));
});

test('empty Pixel ID: module is a no-op even with consent', () => {
  const t = setup('');
  t.api.trackMetaPageview('a');
  t.api.grantMarketingConsent();
  assert.equal(t.scripts.length, 0);
  assert.equal(t.window.fbq, undefined);
});
