import type { WorkBook, WorkSheet } from 'xlsx';
import { XLSX_MIME_TYPE } from '../../files/types/file';
import { SpreadsheetError, type SpreadsheetImportKind } from '../types/spreadsheet';
import { cellAddress, decodeCellAddress } from '../utils/cellAddress';

export const MAX_SPREADSHEET_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_XLSX_ENTRIES = 2_048;
export const MAX_XLSX_EXPANDED_BYTES = 64 * 1024 * 1024;
export const MAX_XLSX_ENTRY_BYTES = 16 * 1024 * 1024;
export const MAX_XLSX_COMPRESSION_RATIO = 200;
const MAX_ROWS_PER_SHEET = 5_000;
const MAX_COLUMNS_PER_SHEET = 100;
const MAX_TOTAL_CELLS = 50_000;

export async function createBlankWorkbook(): Promise<WorkBook> {
  return runSpreadsheetWorker<WorkBook>({ type: 'create' });
}

export async function parseSpreadsheetFile(file: File, kind: SpreadsheetImportKind): Promise<WorkBook> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if ((kind === 'xlsx' && extension !== 'xlsx') || (kind === 'csv' && extension !== 'csv')) {
    throw new SpreadsheetError('unsupportedType');
  }
  if (!file.size) throw new SpreadsheetError('emptyFile');
  if (file.size > MAX_SPREADSHEET_FILE_BYTES) throw new SpreadsheetError('fileTooLarge');

  try {
    const bytes = await file.arrayBuffer();
    return runSpreadsheetWorker<WorkBook>({ type: 'parse', bytes, kind }, [bytes]);
  } catch (error) {
    if (error instanceof SpreadsheetError) throw error;
    throw new SpreadsheetError('invalidWorkbook');
  }
}

export function validateSpreadsheetBytes(bytes: ArrayBuffer, kind: SpreadsheetImportKind): void {
  const signature = new Uint8Array(bytes.slice(0, 4));
  const isZip = signature[0] === 0x50 && signature[1] === 0x4b && [0x03, 0x05, 0x07].includes(signature[2]);
  if ((kind === 'xlsx' && !isZip) || (kind === 'csv' && isZip)) throw new SpreadsheetError('invalidWorkbook');
  if (kind === 'xlsx') validateXlsxZipMetadata(bytes);
}

/** Validate bounded ZIP metadata before SheetJS inflates any workbook entries. */
export function validateXlsxZipMetadata(buffer: ArrayBuffer): void {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const tailStart = Math.max(0, bytes.length - 65_557);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= tailStart; i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0 || eocd + 22 + view.getUint16(eocd + 20, true) !== bytes.length) throw new SpreadsheetError('invalidWorkbook');
  const disk = view.getUint16(eocd + 4, true);
  const centralDisk = view.getUint16(eocd + 6, true);
  const diskCount = view.getUint16(eocd + 8, true);
  const count = view.getUint16(eocd + 10, true);
  const centralSize = view.getUint32(eocd + 12, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  if (disk || centralDisk || count !== diskCount || count === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff || count === 0 || count > MAX_XLSX_ENTRIES || centralOffset + centralSize !== eocd) throw new SpreadsheetError('suspiciousWorkbook');
  let cursor = centralOffset; let expanded = 0;
  for (let n = 0; n < count; n++) {
    if (cursor + 46 > eocd || view.getUint32(cursor, true) !== 0x02014b50) throw new SpreadsheetError('invalidWorkbook');
    const flags = view.getUint16(cursor + 8, true); const method = view.getUint16(cursor + 10, true);
    const compressed = view.getUint32(cursor + 20, true); const size = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true); const extraLength = view.getUint16(cursor + 30, true); const commentLength = view.getUint16(cursor + 32, true); const localOffset = view.getUint32(cursor + 42, true);
    const next = cursor + 46 + nameLength + extraLength + commentLength;
    if (next > centralOffset + centralSize || localOffset + 30 > centralOffset || (flags & 1) !== 0 || (method !== 0 && method !== 8) || size === 0xffffffff || compressed === 0xffffffff || localOffset === 0xffffffff || size > MAX_XLSX_ENTRY_BYTES || (compressed === 0 ? size > 0 : size / compressed > MAX_XLSX_COMPRESSION_RATIO)) throw new SpreadsheetError('suspiciousWorkbook');
    const localNameLength = view.getUint16(localOffset + 26, true); const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataEnd = localOffset + 30 + localNameLength + localExtraLength + compressed;
    if (view.getUint32(localOffset, true) !== 0x04034b50 || view.getUint16(localOffset + 6, true) !== flags || view.getUint16(localOffset + 8, true) !== method || dataEnd > centralOffset) throw new SpreadsheetError('invalidWorkbook');
    const centralName = bytes.subarray(cursor + 46, cursor + 46 + nameLength);
    const localName = bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength);
    if (centralName.length !== localName.length || centralName.some((byte, index) => byte !== localName[index])) throw new SpreadsheetError('invalidWorkbook');
    expanded += size; if (expanded > MAX_XLSX_EXPANDED_BYTES) throw new SpreadsheetError('workbookTooLarge');
    cursor = next;
  }
  if (cursor !== centralOffset + centralSize) throw new SpreadsheetError('invalidWorkbook');
}

export async function writeSpreadsheet(workbook: WorkBook): Promise<Blob> {
  const bytes = await runSpreadsheetWorker<ArrayBuffer>({ type: 'write', workbook: structuredClone(workbook) });
  return new Blob([bytes], { type: XLSX_MIME_TYPE });
}

async function runSpreadsheetWorker<T>(request: SpreadsheetWorkerRequest, transferables: Transferable[] = []): Promise<T> {
  const worker = new Worker(new URL('./spreadsheet.worker.ts', import.meta.url), { type: 'module' });
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => { if (settled) return; settled = true; worker.terminate(); callback(); };
    worker.onmessage = (event: MessageEvent<{ result?: T; error?: string }>) => {
      if (event.data.error) finish(() => reject(new SpreadsheetError((event.data.error as ConstructorParameters<typeof SpreadsheetError>[0]) ?? 'invalidWorkbook')));
      else finish(() => resolve(event.data.result as T));
    };
    worker.onerror = (event) => { event.preventDefault(); finish(() => reject(new SpreadsheetError('invalidWorkbook'))); };
    worker.onmessageerror = () => finish(() => reject(new SpreadsheetError('invalidWorkbook')));
    try { worker.postMessage(request, transferables); } catch { finish(() => reject(new SpreadsheetError('invalidWorkbook'))); }
  });
}

export type SpreadsheetWorkerRequest =
  | { type: 'create' }
  | { type: 'parse'; bytes: ArrayBuffer; kind: SpreadsheetImportKind }
  | { type: 'write'; workbook: WorkBook }
  | { type: 'addSheet'; workbook: WorkBook; name: string };

export function readCellValue(sheet: WorkSheet, row: number, column: number): string {
  const cell = sheet[cellAddress(row, column)];
  if (!cell || typeof cell !== 'object' || !('v' in cell)) return '';
  const value = cell.w ?? cell.v;
  return value instanceof Date ? value.toISOString() : String(value ?? '');
}

export function setCellValue(workbook: WorkBook, sheetName: string, row: number, column: number, value: string): void {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new SpreadsheetError('invalidWorkbook');
  const address = cellAddress(row, column);
  ensureEditableSize(workbook, sheetName, row, column);
  if (value === '') delete sheet[address];
  else sheet[address] = { t: 's', v: value };
  const previous = sheet['!ref'] ? decodeSheetRange(sheet['!ref']) : { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 };
  previous.endRow = Math.max(previous.endRow, row);
  previous.endColumn = Math.max(previous.endColumn, column);
  previous.startRow = Math.min(previous.startRow, row);
  previous.startColumn = Math.min(previous.startColumn, column);
  sheet['!ref'] = `${cellAddress(previous.startRow, previous.startColumn)}:${cellAddress(previous.endRow, previous.endColumn)}`;
}

export async function addWorksheet(workbook: WorkBook, name: string): Promise<void> {
  validateSheetName(workbook, name);
  const next = await runSpreadsheetWorker<WorkBook>({ type: 'addSheet', workbook: structuredClone(workbook), name: name.trim() });
  replaceWorkbook(workbook, next);
}

function replaceWorkbook(target: WorkBook, source: WorkBook): void {
  for (const key of Object.keys(target)) if (!(key in source)) delete (target as unknown as Record<string, unknown>)[key];
  Object.assign(target, source);
}

export function renameWorksheet(workbook: WorkBook, oldName: string, nextName: string): void {
  const normalized = nextName.trim();
  validateSheetName(workbook, normalized, oldName);
  const sheet = workbook.Sheets[oldName];
  const index = workbook.SheetNames.indexOf(oldName);
  if (!sheet || index < 0) throw new SpreadsheetError('invalidWorkbook');
  delete workbook.Sheets[oldName];
  workbook.Sheets[normalized] = sheet;
  workbook.SheetNames[index] = normalized;
  const workbookSheets = workbook.Workbook?.Sheets;
  if (workbookSheets?.[index]) workbookSheets[index].name = normalized;
}

export function deleteWorksheet(workbook: WorkBook, name: string): void {
  if (workbook.SheetNames.length <= 1) throw new SpreadsheetError('cannotDeleteLastSheet');
  const index = workbook.SheetNames.indexOf(name);
  if (index < 0) throw new SpreadsheetError('invalidWorkbook');
  workbook.SheetNames.splice(index, 1);
  delete workbook.Sheets[name];
  workbook.Workbook?.Sheets?.splice(index, 1);
}

export function getSheetDimensions(sheet: WorkSheet): { rows: number; columns: number } {
  if (!sheet['!ref']) return { rows: 40, columns: 12 };
  const range = decodeSheetRange(sheet['!ref']);
  return { rows: Math.max(40, range.endRow + 1), columns: Math.max(12, range.endColumn + 1) };
}

function validateSheetName(workbook: WorkBook, name: string, currentName?: string): void {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 31 || /[\\/?*:[\]]/.test(trimmed) || trimmed.startsWith("'") || trimmed.endsWith("'") || ['__proto__', 'constructor', 'prototype'].includes(trimmed.toLowerCase())) {
    throw new SpreadsheetError('invalidSheetName');
  }
  if (workbook.SheetNames.some((sheetName) => sheetName.toLocaleLowerCase() === trimmed.toLocaleLowerCase() && sheetName !== currentName)) {
    throw new SpreadsheetError('duplicateSheetName');
  }
}

function ensureEditableSize(workbook: WorkBook, editedSheetName: string, editedRow: number, editedColumn: number): void {
  let totalCells = 0;
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const current = sheet?.['!ref'] ? decodeSheetRange(sheet['!ref']) : { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 };
    const rows = Math.max(40, (name === editedSheetName ? Math.max(current.endRow, editedRow) : current.endRow) + 1);
    const columns = Math.max(12, (name === editedSheetName ? Math.max(current.endColumn, editedColumn) : current.endColumn) + 1);
    if (rows > MAX_ROWS_PER_SHEET || columns > MAX_COLUMNS_PER_SHEET) throw new SpreadsheetError('workbookTooLarge');
    totalCells += rows * columns;
  }
  if (totalCells > MAX_TOTAL_CELLS) throw new SpreadsheetError('workbookTooLarge');
}

function decodeSheetRange(reference: string): { startRow: number; startColumn: number; endRow: number; endColumn: number } {
  const parts = reference.replaceAll('$', '').split(':');
  const start = decodeCellAddress(parts[0]);
  const end = decodeCellAddress(parts[1] ?? parts[0]);
  return { startRow: start.row, startColumn: start.column, endRow: end.row, endColumn: end.column };
}
