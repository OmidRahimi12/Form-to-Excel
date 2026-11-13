import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function applicationServiceWorker(): Plugin {
  let base = '/';
  let root = process.cwd();

  return {
    name: 'form-to-excel-application-service-worker',
    apply: 'build',
    configResolved(config) {
      base = config.base;
      root = config.root;
    },
    generateBundle(_options, bundle) {
      const shellFiles = Object.keys(bundle).filter((fileName) =>
        /\.(?:js|css|woff2?|svg|png|webmanifest)$/i.test(fileName),
      );
      shellFiles.push('manifest.webmanifest', 'icons/app-icon-192.png', 'icons/app-icon-512.png', 'icons/app-icon-maskable-512.png');
      if (!shellFiles.includes('index.html')) shellFiles.push('index.html');
      shellFiles.sort();

      const revision = createHash('sha256')
        .update(shellFiles.filter((fileName) => Boolean(bundle[fileName])).map((fileName) => {
          const output = bundle[fileName];
          const bytes = output.type === 'chunk' ? output.code : output.source;
          return `${fileName}:${createHash('sha256').update(bytes).digest('hex')}`;
        }).concat(shellFiles.filter((fileName) => !bundle[fileName]).map((fileName) => {
          const publicAsset = resolve(root, 'public', fileName);
          const sourceAsset = fileName === 'index.html' ? resolve(root, fileName) : publicAsset;
          return `${fileName}:${createHash('sha256').update(readFileSync(sourceAsset)).digest('hex')}`;
        })).join('|'))
        .digest('hex')
        .slice(0, 12);
      const basePath = base.endsWith('/') ? base : `${base}/`;
      const urls = [basePath, ...shellFiles.map((fileName) => `${basePath}${fileName}`)];
      const indexUrl = `${basePath}index.html`;

      const source = `/* Generated from the production application shell. */
const CACHE_PREFIX = 'form-to-excel-shell-';
const CACHE_NAME = CACHE_PREFIX + '${revision}';
const PRECACHE_URLS = ${JSON.stringify(urls)};
const INDEX_URL = ${JSON.stringify(indexUrl)};
const APP_BASE = ${JSON.stringify(basePath)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const oldCaches = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME);
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (clients.length === 0) {
      await Promise.all(oldCaches.map((key) => caches.delete(key)));
    }
    await self.clients.claim();
    const controlledClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (oldCaches.length > 0) controlledClients.forEach((client) => client.postMessage({ type: 'APP_UPDATE_ACTIVATED' }));
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' && url.pathname.startsWith(APP_BASE)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(INDEX_URL)) ?? fetch(request);
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const olderCaches = (await caches.keys()).filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME);
    for (const cacheName of olderCaches) {
      const oldResponse = await (await caches.open(cacheName)).match(request);
      if (oldResponse) return oldResponse;
    }
    return fetch(request);
  })());
});
`;

      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), applicationServiceWorker()],
  worker: { format: 'es' },
});
