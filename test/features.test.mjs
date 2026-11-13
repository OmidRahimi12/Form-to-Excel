import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

const dbPrefix = `feature_${Date.now()}_${Math.random().toString(16).slice(2)}`;
let vite;
let AppDatabase;
let createForm;
let updateForm;
let saveNote;
let saveFormTemplate;
let defaultTemplateFields;
let validateForm;
let parseWorkbookBytes;
let createBlankWorkbookData;
let addWorksheetToWorkbook;
let writeSpreadsheetBytes;
let validateXlsxZipMetadata;
let XLSX;
const data = { documentNumber: 'A', documentDate: '', incomingNumber: '', incomingDate: '', outgoingNumber: '', issueDate: '', sender: '', recipient: '', fileNumber: '', pageNumberInFile: '', deliveredTo: '', subject: '', notes: '' };

before(async () => {
  vite = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
  ({ AppDatabase } = await vite.ssrLoadModule('/src/database/appDatabase.ts'));
  ({ createForm, updateForm } = await vite.ssrLoadModule('/src/features/forms/services/formService.ts'));
  ({ saveNote } = await vite.ssrLoadModule('/src/features/notes/services/noteService.ts'));
  ({ saveFormTemplate, defaultTemplateFields } = await vite.ssrLoadModule('/src/features/forms/services/formTemplateService.ts'));
  ({ validateForm } = await vite.ssrLoadModule('/src/features/forms/validation/validateForm.ts'));
  ({ validateXlsxZipMetadata } = await vite.ssrLoadModule('/src/features/spreadsheet/services/spreadsheetService.ts'));
  ({ parseWorkbookBytes } = await vite.ssrLoadModule('/src/features/spreadsheet/services/spreadsheetWorkerService.ts'));
  ({ createBlankWorkbookData, addWorksheetToWorkbook, writeSpreadsheetBytes } = await vite.ssrLoadModule('/src/features/spreadsheet/services/spreadsheetWorkerService.ts'));
  XLSX = await import('xlsx');
});
after(async () => { await vite?.close(); });

test('Form concurrent edits serialize and reject the stale revision without overwriting', async () => {
  const name = `${dbPrefix}_forms`; const db = new AppDatabase(name); await db.open(); const otherTab = new AppDatabase(name); await otherTab.open();
  try {
    const id = await createForm(data, undefined, db); const original = await db.forms.get(id);
    const edits = await Promise.allSettled([
      updateForm(id, { ...data, subject: 'first tab' }, original.updatedAt, db),
      updateForm(id, { ...data, subject: 'second tab' }, original.updatedAt, otherTab),
    ]);
    assert.equal(edits.filter((result) => result.status === 'fulfilled').length, 1);
    const rejected = edits.find((result) => result.status === 'rejected');
    assert.equal(rejected.reason.message, 'FORM_CONFLICT');
    assert.ok(['first tab', 'second tab'].includes((await db.forms.get(id)).subject));
  } finally { otherTab.close(); db.close(); await db.delete(); }
});

test('Notes and configurable form layouts persist only in the disposable IndexedDB', async () => {
  const db = new AppDatabase(`${dbPrefix}_notes`); await db.open();
  try {
    await assert.rejects(saveNote({ title: '', body: '' }, undefined, db), /NOTE_EMPTY/);
    const noteId = await saveNote({ title: 'Local note', body: 'Stored in IndexedDB' }, undefined, db);
    const note = await db.notes.get(noteId); assert.equal(note.title, 'Local note');
    const fields = defaultTemplateFields().map((field, index) => ({ ...field, visible: index < 2, required: index === 0 }));
    const templateId = await saveFormTemplate('Compact', fields, undefined, db);
    assert.equal((await db.formTemplates.get(templateId)).fields.filter((field) => field.visible).length, 2);
    assert.equal(validateForm({ ...data, documentNumber: '' }, ['documentNumber', 'documentDate'], ['documentNumber']).documentNumber, 'formRequiredFieldError');
  } finally { db.close(); await db.delete(); }
});

test('XLSX zip metadata is bounded before workbook parsing and valid XLSX/CSV parse', async () => {
  const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['a'], ['b']]), 'Data');
  const bytes = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const arrayBuffer = bytes instanceof ArrayBuffer ? bytes : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  assert.doesNotThrow(() => validateXlsxZipMetadata(arrayBuffer));
  const parsed = await parseWorkbookBytes(arrayBuffer.slice(0), 'xlsx'); assert.deepEqual(parsed.SheetNames, ['Data']);
  const csv = new TextEncoder().encode('a,b\n1,2').buffer;
  assert.equal((await parseWorkbookBytes(csv, 'csv')).SheetNames.length, 1);
  const blank = await createBlankWorkbookData(); await addWorksheetToWorkbook(blank, 'Extra');
  const saved = await writeSpreadsheetBytes(blank); assert.doesNotThrow(() => validateXlsxZipMetadata(saved));
  assert.deepEqual((await parseWorkbookBytes(saved, 'xlsx')).SheetNames, ['Sheet1', 'Extra']);
  const corrupted = arrayBuffer.slice(0); const view = new DataView(corrupted);
  const end = corrupted.byteLength - 22; const centralOffset = view.getUint32(end + 16, true);
  view.setUint32(centralOffset + 20, 1, true);
  assert.throws(() => validateXlsxZipMetadata(corrupted), (error) => error.code === 'suspiciousWorkbook');
  assert.throws(() => validateXlsxZipMetadata(new Uint8Array([1, 2, 3, 4]).buffer), (error) => error.code === 'invalidWorkbook');
});

test('locale JSON has matching key sets and all new module strings are present', async () => {
  const locales = await Promise.all(['fa', 'ps', 'en'].map(async (locale) => JSON.parse(await readFile(new URL(`../src/locales/${locale}/translation.json`, import.meta.url), 'utf8'))));
  assert.deepEqual(Object.keys(locales[1]).sort(), Object.keys(locales[0]).sort());
  assert.deepEqual(Object.keys(locales[2]).sort(), Object.keys(locales[0]).sort());
  for (const key of ['formBuilder', 'notesDescription', 'communicationDescription', 'documentInformationDescription', 'formConflictError', 'spreadsheetSuspiciousWorkbook', 'pwaReloadReady']) for (const locale of locales) assert.ok(locale[key]);
});

test('Netlify SPA fallback is included in the production public source', async () => {
  assert.equal((await readFile(new URL('../public/_redirects', import.meta.url), 'utf8')).trim(), '/* /index.html 200');
});
