import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let vite;
let AppDatabase;
let appDatabase;
let getMergedFileContent;
let MergedFileRepositoryError;
let deleteMergedFile;
let createMergedFileShareFile;
let supportsMergedFileSharing;
let shareMergedFile;
let createMergedWorkbook;
let appendFileToMergedWorkbook;
let saveExportedFile;
let xlsx;
const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x11, 0x22, 0x33]);

before(async () => {
  vite = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
  ({ AppDatabase } = await vite.ssrLoadModule('/src/database/appDatabase.ts'));
  ({ appDatabase } = await vite.ssrLoadModule('/src/database/appDatabase.ts'));
  ({ getMergedFileContent, deleteMergedFile, MergedFileRepositoryError } = await vite.ssrLoadModule('/src/features/merged-files/services/mergedFileRepository.ts'));
  ({ createMergedFileShareFile, supportsMergedFileSharing, shareMergedFile } = await vite.ssrLoadModule('/src/features/merged-files/services/mergedFileSharing.ts'));
  ({ createMergedWorkbook, appendFileToMergedWorkbook } = await vite.ssrLoadModule('/src/features/merged-files/services/mergeWorkflowService.ts'));
  ({ saveExportedFile } = await vite.ssrLoadModule('/src/features/files/services/fileService.ts'));
  xlsx = await import('xlsx');
});
after(async () => { await vite?.close(); });

test('retrieves the merged Blob by fileId and builds a correctly named XLSX File', async () => {
  const db = new AppDatabase(`merged_share_${Date.now()}_${Math.random()}`); await db.open();
  try {
    const blob = new Blob([bytes], { type: mime });
    const id = await db.mergedFiles.add({ fileName: 'combined.xlsx', mimeType: mime, size: blob.size, createdAt: 1_700_000_000_000, revision: 0 });
    await db.mergedFileContents.add({ fileId: id, blob });
    const retrieved = await getMergedFileContent(id, db);
    assert.equal(retrieved.blob.size, bytes.length);
    assert.equal(retrieved.blob.type, mime);
    assert.deepEqual(new Uint8Array(await retrieved.blob.arrayBuffer()), bytes);
    const file = createMergedFileShareFile(retrieved.blob, retrieved.metadata);
    assert.equal(file.name, 'combined.xlsx');
    assert.equal(file.type, mime);
    assert.equal(file.lastModified, retrieved.metadata.createdAt);
    assert.deepEqual(new Uint8Array(await file.arrayBuffer()), bytes);
  } finally { db.close(); await db.delete(); }
});

test('missing or invalid stored Blob is reported by the repository, not mislabeled as a share error', async () => {
  const db = new AppDatabase(`merged_share_missing_${Date.now()}_${Math.random()}`); await db.open();
  try {
    await db.mergedFiles.add({ fileName: 'missing.xlsx', mimeType: mime, size: bytes.length, createdAt: Date.now(), revision: 0 });
    await assert.rejects(getMergedFileContent(1, db), (error) => error instanceof MergedFileRepositoryError && error.code === 'contentMissing');
  } finally { db.close(); await db.delete(); }
});

test('file sharing requires canShare(files); unsupported sharing and user cancellation are distinct', async () => {
  const file = createMergedFileShareFile(new Blob([bytes], { type: mime }), { id: 1, fileName: 'combined.xlsx', mimeType: mime, size: bytes.length, createdAt: 1_700_000_000_000 });
  assert.equal(supportsMergedFileSharing({ share: async () => undefined }, file), false);
  assert.equal(supportsMergedFileSharing({ share: async () => undefined, canShare: () => false }, file), false);
  let called = false;
  const unsupported = await shareMergedFile({ share: async () => { called = true; }, canShare: () => false }, file, file.name);
  assert.equal(unsupported, 'unsupported'); assert.equal(called, false);
  const cancelled = await shareMergedFile({ share: async () => { const error = new Error('cancelled'); error.name = 'AbortError'; throw error; }, canShare: () => true }, file, file.name);
  assert.equal(cancelled, 'cancelled');
  const shared = await shareMergedFile({ share: async ({ files, title }) => { assert.equal(files[0].name, file.name); assert.equal(title, file.name); }, canShare: ({ files }) => files[0].type === mime }, file, file.name);
  assert.equal(shared, 'shared');
});

test('invalid share file metadata is rejected before calling Web Share', () => {
  assert.throws(() => createMergedFileShareFile(new Blob([bytes]), { fileName: 'bad.csv', mimeType: mime, size: bytes.length, createdAt: 1 }), /INVALID_MERGED_SHARE_FILE/);
});

test('existing merged workbook create, append, retrieve, and delete service paths still work', async () => {
  await appDatabase.open();
  const makeWorkbook = (value) => {
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.aoa_to_sheet([['Column'], [value]]), 'Sheet1');
    const output = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([output], { type: mime });
  };
  try {
    const sourceOne = await saveExportedFile(makeWorkbook('one'), 'one.xlsx');
    const sourceTwo = await saveExportedFile(makeWorkbook('two'), 'two.xlsx');
    const sourceThree = await saveExportedFile(makeWorkbook('three'), 'three.xlsx');
    const mergedId = await createMergedWorkbook([sourceOne, sourceTwo], 'combined.xlsx');
    const firstRead = await getMergedFileContent(mergedId);
    await appendFileToMergedWorkbook(sourceThree, mergedId);
    const afterAppend = await getMergedFileContent(mergedId);
    const resultBook = xlsx.read(await afterAppend.blob.arrayBuffer(), { type: 'array' });
    const rows = xlsx.utils.sheet_to_json(resultBook.Sheets.Sheet1, { header: 1 });
    assert.deepEqual(rows, [['Column'], ['one'], ['two'], ['three']]);
    assert.equal(afterAppend.metadata.revision, 1);
    assert.equal(await appDatabase.files.count(), 3);
    assert.ok(firstRead.blob.size > 0);
    await deleteMergedFile(mergedId);
    await assert.rejects(getMergedFileContent(mergedId), (error) => error instanceof MergedFileRepositoryError && error.code === 'fileNotFound');
  } finally {
    appDatabase.close();
    await appDatabase.delete();
  }
});
