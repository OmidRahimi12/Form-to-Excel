import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

test('production service worker retains old cache while tabs exist and serves old lazy assets', async () => {
  const source = await readFile(new URL('../dist/sw.js', import.meta.url), 'utf8');
  const handlers = new Map(); const deleted = []; const posted = [];
  const cacheStore = new Map([
    ['form-to-excel-shell-old', { match: async (request) => request.url.endsWith('/old-route-chunk.js') ? 'old-chunk' : undefined }],
  ]);
  const clients = [{ postMessage: (message) => posted.push(message) }];
  const scope = {
    location: { origin: 'https://example.test' },
    clients: { matchAll: async () => clients, claim: async () => undefined },
    addEventListener: (name, handler) => handlers.set(name, handler),
    skipWaiting: async () => undefined,
  };
  const caches = {
    keys: async () => [...cacheStore.keys()],
    delete: async (key) => { deleted.push(key); return cacheStore.delete(key); },
    open: async (key) => cacheStore.get(key) ?? { match: async () => undefined },
  };
  vm.runInNewContext(source, { self: scope, caches, URL, fetch: async () => 'network' });
  let activation;
  handlers.get('activate')({ waitUntil: (promise) => { activation = promise; } });
  await activation;
  assert.deepEqual(deleted, []);
  assert.equal(posted[0]?.type, 'APP_UPDATE_ACTIVATED');
  let response;
  handlers.get('fetch')({ request: { method: 'GET', url: 'https://example.test/old-route-chunk.js', mode: 'cors' }, respondWith: (promise) => { response = promise; } });
  assert.equal(await response, 'old-chunk');
});
