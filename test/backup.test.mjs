import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import Dexie from 'dexie';
import { Zip, ZipPassThrough } from 'fflate';
import { createServer } from 'vite';

const prefix = `backup_${Date.now()}_${Math.random().toString(16).slice(2)}`;
let vite;
let AppDatabase;
let createBackup;
let validateBackupFile;
let restoreBackup;
let readBackupSnapshot;
let archive;
let originalWorker;
const fields = {
  documentNumber: 'د-۱', documentDate: '2026-02-03', incomingNumber: 'و-۲', incomingDate: '2026-02-04',
  outgoingNumber: 'ص-۳', issueDate: '2026-02-05', sender: 'اداره', recipient: 'بخش', fileNumber: 'دوسیه ۹',
  pageNumberInFile: '۴', deliveredTo: 'واحد', subject: 'موضوع نمونه', notes: 'یادداشت',
};
const xlsxBytes = (tag) => new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...new TextEncoder().encode(tag)]);
const csvBytes = (text) => new TextEncoder().encode(text);

function sampleRecords() {
  const csv = csvBytes('نام,شماره\nنمونه,۱۲۳');
  const xlsx = xlsxBytes('xlsx-content');
  const merged = xlsxBytes('merged-content');
  const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return {
    forms: [
      { id: 7, ...fields, createdAt: 1700000000000, updatedAt: 1700000001000 },
      { id: 21, ...fields, documentNumber: 'د-۲', createdAt: 1700000002000, updatedAt: 1700000003000 },
    ],
    files: [
      { id: 4, fileName: 'records.csv', mimeType: 'text/csv', size: csv.length, createdAt: 1700000004000, contentHash: 'hash-example' },
      { id: 12, fileName: 'book.xlsx', mimeType: mime, size: xlsx.length, createdAt: 1700000005000 },
    ],
    fileContents: [{ fileId: 4, blob: new Blob([csv], { type: 'text/csv' }) }, { fileId: 12, blob: new Blob([xlsx], { type: mime }) }],
    mergedFiles: [{ id: 3, fileName: 'combined.xlsx', mimeType: mime, size: merged.length, createdAt: 1700000006000, revision: 9 }],
    mergedFileContents: [{ fileId: 3, blob: new Blob([merged], { type: mime }) }],
    notes: [{ id: 31, title: 'نمونه', body: 'متن محلی', createdAt: 1700000007000, updatedAt: 1700000008000 }],
    formTemplates: [{ id: 41, name: 'قالب پایه', fields: ['documentNumber', 'documentDate', 'incomingNumber', 'incomingDate', 'outgoingNumber', 'issueDate', 'sender', 'recipient', 'fileNumber', 'pageNumberInFile', 'deliveredTo', 'subject', 'notes'].map((key, index) => ({ key, visible: index < 3, required: index === 0 })), createdAt: 1700000009000, updatedAt: 1700000010000 }],
  };
}

async function insertRecords(db, records) {
  await db.transaction('rw', db.forms, db.files, db.fileContents, db.mergedFiles, db.mergedFileContents, db.notes, db.formTemplates, async () => {
    await db.forms.bulkAdd(records.forms);
    await db.files.bulkAdd(records.files);
    await db.fileContents.bulkAdd(records.fileContents);
    await db.mergedFiles.bulkAdd(records.mergedFiles);
    await db.mergedFileContents.bulkAdd(records.mergedFileContents);
    if (records.notes?.length) await db.notes.bulkAdd(records.notes);
    if (records.formTemplates?.length) await db.formTemplates.bulkAdd(records.formTemplates);
  });
}

async function readRecords(db) {
  const [forms, files, fileContents, mergedFiles, mergedFileContents, notes, formTemplates] = await Promise.all([
    db.forms.toArray(), db.files.toArray(), db.fileContents.toArray(), db.mergedFiles.toArray(), db.mergedFileContents.toArray(), db.notes.toArray(), db.formTemplates.toArray(),
  ]);
  return { forms, files, fileContents, mergedFiles, mergedFileContents, notes, formTemplates };
}

async function assertRecordsEqual(actual, expected) {
  assert.deepEqual(actual.forms, expected.forms);
  assert.deepEqual(actual.files, expected.files);
  assert.deepEqual(actual.mergedFiles, expected.mergedFiles);
  assert.deepEqual(actual.notes, expected.notes ?? []);
  assert.deepEqual(actual.formTemplates, expected.formTemplates ?? []);
  assert.deepEqual(actual.fileContents.map(({ fileId }) => fileId), expected.fileContents.map(({ fileId }) => fileId));
  assert.deepEqual(actual.mergedFileContents.map(({ fileId }) => fileId), expected.mergedFileContents.map(({ fileId }) => fileId));
  for (let i = 0; i < expected.fileContents.length; i++) {
    assert.equal(actual.fileContents[i].blob.type, expected.fileContents[i].blob.type);
    assert.deepEqual(new Uint8Array(await actual.fileContents[i].blob.arrayBuffer()), new Uint8Array(await expected.fileContents[i].blob.arrayBuffer()));
  }
  for (let i = 0; i < expected.mergedFileContents.length; i++) {
    assert.equal(actual.mergedFileContents[i].blob.type, expected.mergedFileContents[i].blob.type);
    assert.deepEqual(new Uint8Array(await actual.mergedFileContents[i].blob.arrayBuffer()), new Uint8Array(await expected.mergedFileContents[i].blob.arrayBuffer()));
  }
}

before(async () => {
  vite = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
  ({ AppDatabase } = await vite.ssrLoadModule('/src/database/appDatabase.ts'));
  ({ createBackup, validateBackupFile, restoreBackup, readBackupSnapshot } = await vite.ssrLoadModule('/src/features/backup/services/backupService.ts'));
  archive = await vite.ssrLoadModule('/src/features/backup/services/backupArchive.ts');
  originalWorker = globalThis.Worker;
  globalThis.Worker = class InlineBackupWorker {
    onmessage = null; onerror = null; onmessageerror = null;
    postMessage(request) {
      void Promise.resolve().then(async () => {
        try {
          const result = request.type === 'create' ? await archive.createBackupArchive(request.snapshot) : await archive.validateBackupArchive(request.file);
          this.onmessage?.({ data: { id: request.id, ok: true, result } });
        } catch (error) {
          this.onmessage?.({ data: { id: request.id, ok: false, errorKey: error.translationKey ?? 'backupErrorInvalid' } });
        }
      });
    }
    terminate() {}
  };
});

after(async () => {
  if (originalWorker === undefined) delete globalThis.Worker;
  else globalThis.Worker = originalWorker;
  await vite?.close();
});

test('create, validate, restore, and compare replaces all seven stores', async () => {
  const db = new AppDatabase(`${prefix}_roundtrip`);
  await db.open();
  try {
    const original = sampleRecords();
    await insertRecords(db, original);
    const zip = await createBackup(db);
    const validated = await validateBackupFile(new File([zip], 'backup.zip'));
    const snapshot = await readBackupSnapshot(db);
    const invalidSnapshot = { ...snapshot, data: { ...snapshot.data, forms: snapshot.data.forms.map((form, index) => index === 0 ? { ...form, unexpectedField: 'reject-me' } : form) } };
    await assert.rejects(archive.createBackupArchive(invalidSnapshot), (error) => error.translationKey === 'backupErrorInvalid');
    const corrupted = new Uint8Array(await zip.arrayBuffer());
    const csv = new Uint8Array(await original.fileContents[0].blob.arrayBuffer());
    let contentOffset = -1;
    for (let i = 0; i <= corrupted.length - csv.length; i++) {
      if (csv.every((byte, index) => corrupted[i + index] === byte)) { contentOffset = i; break; }
    }
    assert.ok(contentOffset >= 0, 'CSV bytes should appear unchanged in the uncompressed ZIP');
    corrupted[contentOffset] ^= 1;
    await assert.rejects(validateBackupFile(new File([corrupted], 'corrupt.zip')), (error) => error.translationKey === 'backupErrorInvalid');
    const replacement = {
      forms: [{ id: 99, ...fields, documentNumber: 'REPLACEMENT', createdAt: 1, updatedAt: 2 }],
      files: [{ id: 98, fileName: 'other.csv', mimeType: 'text/csv', size: 3, createdAt: 1 }],
      fileContents: [{ fileId: 98, blob: new Blob(['old'], { type: 'text/csv' }) }],
      mergedFiles: [{ id: 97, fileName: 'other.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: xlsxBytes('old').length, createdAt: 1, revision: 1 }],
      mergedFileContents: [{ fileId: 97, blob: new Blob([xlsxBytes('old')], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) }],
    };
    await db.transaction('rw', db.forms, db.files, db.fileContents, db.mergedFiles, db.mergedFileContents, async () => {
      await Promise.all([db.forms.clear(), db.files.clear(), db.fileContents.clear(), db.mergedFiles.clear(), db.mergedFileContents.clear()]);
    });
    await insertRecords(db, replacement);
    await restoreBackup(validated, db);
    const restored = await readRecords(db);
    await assertRecordsEqual(restored, original);
    assert.equal(restored.forms.some((row) => row.id === 99), false);
    assert.equal(restored.files.some((row) => row.id === 98), false);
  } finally { db.close(); await db.delete(); }
});

test('failure in the final table rolls back earlier restore writes and preserves original Blobs', async () => {
  const db = new AppDatabase(`${prefix}_rollback`);
  const source = new AppDatabase(`${prefix}_rollback_source`);
  await db.open(); await source.open();
  try {
    const existing = {
      forms: [{ id: 51, ...fields, documentNumber: 'KEEP', createdAt: 10, updatedAt: 11 }],
      files: [{ id: 52, fileName: 'keep.csv', mimeType: 'text/csv', size: 4, createdAt: 12, contentHash: 'keep-hash' }],
      fileContents: [{ fileId: 52, blob: new Blob(['keep'], { type: 'text/csv' }) }],
      mergedFiles: [{ id: 53, fileName: 'keep.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: xlsxBytes('keep').length, createdAt: 13, revision: 4 }],
      mergedFileContents: [{ fileId: 53, blob: new Blob([xlsxBytes('keep')], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) }],
    };
    await insertRecords(db, existing);
    await insertRecords(source, sampleRecords());
    const validated = await validateBackupFile(new File([await createBackup(source)], 'source.zip'));
    const originalBulkAdd = db.mergedFileContents.bulkAdd.bind(db.mergedFileContents);
    db.mergedFileContents.bulkAdd = () => Promise.reject(new Error('injected late-table failure'));
    try { await assert.rejects(restoreBackup(validated, db), (error) => error.translationKey === 'backupErrorRestore'); }
    finally { db.mergedFileContents.bulkAdd = originalBulkAdd; }
    await assertRecordsEqual(await readRecords(db), existing);
  } finally { db.close(); source.close(); await db.delete(); await source.delete(); }
});

test('previous Phase 10 streaming ZIP backups with XLSX payloads remain readable', async () => {
  const db = new AppDatabase(`${prefix}_legacy`);
  await db.open();
  try {
    await insertRecords(db, sampleRecords());
    const snapshot = await readBackupSnapshot(db);
    const descriptors = [];
    const entries = [
      ['data.json', new TextEncoder().encode(JSON.stringify({ forms: snapshot.data.forms, files: snapshot.data.files, mergedFiles: snapshot.data.mergedFiles }))],
    ];
    for (const [table, contents] of [['fileContents', snapshot.fileContents], ['mergedFileContents', snapshot.mergedFileContents]]) {
      for (const item of contents) {
        const path = `${table}/${item.fileId}.bin`;
        const bytes = new Uint8Array(await item.blob.arrayBuffer());
        descriptors.push({ table, id: item.fileId, path, size: bytes.length });
        entries.push([path, bytes]);
      }
    }
    const manifest = {
      format: 'form-to-excel-backup', formatVersion: 1, appId: 'form-to-excel', createdAt: new Date().toISOString(),
      databaseVersion: 3, tables: ['forms', 'files', 'fileContents', 'mergedFiles', 'mergedFileContents'], contents: descriptors,
    };
    entries.unshift(['manifest.json', new TextEncoder().encode(JSON.stringify(manifest))]);
    const oldStyleZip = await new Promise((resolve, reject) => {
      const chunks = [];
      const zip = new Zip((error, chunk, final) => {
        if (error) reject(error);
        else { chunks.push(chunk); if (final) resolve(new Blob(chunks, { type: 'application/zip' })); }
      });
      for (const [path, bytes] of entries) {
        const entry = new ZipPassThrough(path);
        zip.add(entry);
        entry.push(bytes, true);
      }
      zip.end();
    });
    const restored = await validateBackupFile(new File([oldStyleZip], 'phase10-backup.zip'));
    assert.deepEqual(new Uint8Array(await restored.fileContents.find(({ fileId }) => fileId === 12).blob.arrayBuffer()), xlsxBytes('xlsx-content'));
    assert.deepEqual(new Uint8Array(await restored.mergedFileContents[0].blob.arrayBuffer()), xlsxBytes('merged-content'));
  } finally { db.close(); await db.delete(); }
});

for (const version of [1, 2, 3]) {
  test(`version ${version} database data survives opening the current v4 schema`, async () => {
    const name = `${prefix}_upgrade_v${version}`;
    const legacy = new Dexie(name);
    legacy.version(1).stores({ forms: '++id, createdAt, updatedAt' });
    if (version >= 2) legacy.version(2).stores({ forms: '++id, createdAt, updatedAt', files: '++id, fileName, createdAt', fileContents: 'fileId' });
    if (version >= 3) legacy.version(3).stores({ forms: '++id, createdAt, updatedAt', files: '++id, fileName, createdAt', fileContents: 'fileId', mergedFiles: '++id, fileName, createdAt', mergedFileContents: 'fileId' });
    await legacy.open();
    const form = { id: 70 + version, ...fields, createdAt: 20, updatedAt: 21 };
    await legacy.forms.add(form);
    if (version >= 2) {
      const bytes = csvBytes('old-file');
      await legacy.files.add({ id: 80, fileName: 'old.csv', mimeType: 'text/csv', size: bytes.length, createdAt: 22 });
      await legacy.fileContents.add({ fileId: 80, blob: new Blob([bytes], { type: 'text/csv' }) });
    }
    if (version >= 3) {
      const bytes = xlsxBytes('v3');
      await legacy.mergedFiles.add({ id: 90, fileName: 'old-merged.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: bytes.length, createdAt: 23, revision: 2 });
      await legacy.mergedFileContents.add({ fileId: 90, blob: new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) });
    }
    legacy.close();
    const current = new AppDatabase(name);
    try {
      await current.open();
      assert.deepEqual(await current.forms.get(form.id), form);
      assert.equal(await current.files.count(), version >= 2 ? 1 : 0);
      assert.equal(await current.mergedFiles.count(), version >= 3 ? 1 : 0);
      if (version >= 2) assert.deepEqual(new Uint8Array(await (await current.fileContents.get(80)).blob.arrayBuffer()), csvBytes('old-file'));
      if (version >= 3) assert.deepEqual(new Uint8Array(await (await current.mergedFileContents.get(90)).blob.arrayBuffer()), xlsxBytes('v3'));
    } finally { current.close(); await current.delete(); }
  });
}
