/* Generated from the production application shell. */
const CACHE_PREFIX = 'form-to-excel-shell-';
const CACHE_NAME = CACHE_PREFIX + '2f25ec03a659';
const PRECACHE_URLS = ["/","/assets/BackupSettingsPage-CXi1fr9-.js","/assets/Card-DLjLM1PC.js","/assets/Checkbox-DwpCTocd.js","/assets/CommunicationPage-Ck_QYS0M.js","/assets/ConfirmationDialog-DBUD285V.js","/assets/DashboardPage-CnLcAJec.js","/assets/DocumentInformationPage-BLfRVyFm.js","/assets/FileDetailsPage-Cj6BDMpg.js","/assets/FilesPage-x40bddp4.js","/assets/FormBuilderPage-Cu7q4KUn.js","/assets/FormCreatePage-GeV_NONA.js","/assets/FormDetailsPage-DXcLb3v5.js","/assets/FormEditPage-DXESBMLA.js","/assets/FormEditor-hdK5rIh0.js","/assets/FormField-B8CMmiUI.js","/assets/FormsPage-BcWYslZv.js","/assets/Input-DgWBIP-5.js","/assets/MergedFilesPage-D7RyXXP0.js","/assets/NotesPage-DkgVeFLf.js","/assets/SearchBar-B2Y8AUnY.js","/assets/SettingsRoute-BxrYZ624.js","/assets/SpreadsheetEditorPage-CmB3I8rj.js","/assets/SpreadsheetHomePage-qAar7xV1.js","/assets/Textarea-BBdb9bj-.js","/assets/appDatabase-BpU0yhgm.js","/assets/arrow-left-DzjGcCk2.js","/assets/backup.worker-B09Ng0i0.js","/assets/download-C2ZVvops.js","/assets/external-link-tKvvrZfz.js","/assets/file-j4OpPEAN.js","/assets/fileService-CA6lau15.js","/assets/form-CtLZ-0Jv.js","/assets/formService-lJgyIa9q.js","/assets/formatFileSize-39k_LKxE.js","/assets/getFileFormatLabel-BPp82TTB.js","/assets/index-DPfqwxW5.css","/assets/index-DfUqS2og.js","/assets/mergedFileRepository-XRV-dvNk.js","/assets/parseFileId-CIZVmwQT.js","/assets/parseRecordId-CSh8ViFj.js","/assets/pen-line-CatWceAJ.js","/assets/plus-CXS7-5EQ.js","/assets/share-2-Bo3gTm7r.js","/assets/spreadsheet.worker-BvX6FvEN.js","/assets/spreadsheetSessionStore-BbqVxDir.js","/assets/trash-2-C5seoCSF.js","/assets/useDexieQuery-BfCuMavB.js","/assets/useFormQueries-C-TCI4uk.js","/assets/useFormTemplates-Cd7g-s4_.js","/assets/vazirmatn-arabic-400-normal-C4W5XURk.woff","/assets/vazirmatn-arabic-400-normal-DMZFCm7K.woff2","/assets/vazirmatn-arabic-500-normal-C_lbnnKa.woff2","/assets/vazirmatn-arabic-500-normal-Dqq3-xo3.woff","/assets/vazirmatn-arabic-600-normal-CPKvAnd1.woff2","/assets/vazirmatn-arabic-600-normal-CWYTfCgi.woff","/assets/vazirmatn-arabic-700-normal-B5nPuCFv.woff","/assets/vazirmatn-arabic-700-normal-Dge_DOjm.woff2","/assets/xlsx-C4_jYEpv.js","/assets/xlsx-YQ4lDkt_.js","/icons/app-icon-192.png","/icons/app-icon-512.png","/icons/app-icon-maskable-512.png","/index.html","/manifest.webmanifest"];
const INDEX_URL = "/index.html";
const APP_BASE = "/";

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
