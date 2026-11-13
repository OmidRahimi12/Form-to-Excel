import type { WorkBook } from 'xlsx';
import { XLSX_MIME_TYPE } from '../types/mergedFile';

export interface WorkbookSource {
  fileName: string;
  blob: Blob;
}

export type ExcelMergeErrorCode = 'tooFewFiles' | 'invalidWorkbook' | 'emptyWorkbook' | 'incompatibleSheets' | 'incompatibleColumns';

export class ExcelMergeError extends Error {
  readonly code: ExcelMergeErrorCode;
  readonly fileName?: string;

  constructor(code: ExcelMergeErrorCode, fileName?: string) {
    super(code);
    this.name = 'ExcelMergeError';
    this.code = code;
    this.fileName = fileName;
  }
}

type CellValue = string | number | boolean | Date | null;
type WorksheetRows = { name: string; header: CellValue[]; data: CellValue[][] };
type XlsxModule = typeof import('xlsx');

/**
 * Merges app-exported workbooks using a deliberately simple row-append policy.
 * Sheet names/order and first-row headers must match. Blank rows are omitted;
 * formatting, formulas, charts, macros, and other workbook features are not retained.
 */
export async function mergeWorkbooks(sources: WorkbookSource[]): Promise<Blob> {
  if (sources.length < 2) throw new ExcelMergeError('tooFewFiles');

  const XLSX = await import('xlsx');
  let mergedSheets: WorksheetRows[] | undefined;
  for (const source of sources) {
    const sheets = await readWorkbook(source, XLSX);
    if (!mergedSheets) {
      mergedSheets = sheets;
      continue;
    }
    if (sheets.length !== mergedSheets.length || sheets.some((sheet, index) => sheet.name !== mergedSheets?.[index]?.name)) {
      throw new ExcelMergeError('incompatibleSheets', source.fileName);
    }
    sheets.forEach((sheet, index) => {
      const target = mergedSheets![index];
      if (!sameHeader(target.header, sheet.header)) throw new ExcelMergeError('incompatibleColumns', source.fileName);
      for (const row of sheet.data) target.data.push(row);
    });
  }

  if (!mergedSheets?.length) throw new ExcelMergeError('emptyWorkbook');
  const output = XLSX.utils.book_new();
  for (const sheet of mergedSheets) {
    const rows: CellValue[][] = [sheet.header];
    for (const row of sheet.data) rows.push(row);
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(output, worksheet, sheet.name);
  }
  const bytes = XLSX.write(output, { bookType: 'xlsx', type: 'array' });
  return new Blob([bytes], { type: XLSX_MIME_TYPE });
}

async function readWorkbook(source: WorkbookSource, XLSX: XlsxModule): Promise<WorksheetRows[]> {
  if (!(source.blob instanceof Blob) || source.blob.size < 4 || !(await hasZipHeader(source.blob))) {
    throw new ExcelMergeError('invalidWorkbook', source.fileName);
  }
  let workbook: WorkBook;
  try {
    const bytes = await source.blob.arrayBuffer();
    workbook = XLSX.read(bytes, { type: 'array', cellDates: true });
  } catch {
    throw new ExcelMergeError('invalidWorkbook', source.fileName);
  }
  if (!workbook.SheetNames.length) throw new ExcelMergeError('emptyWorkbook', source.fileName);

  const result: WorksheetRows[] = [];
  for (const name of workbook.SheetNames) {
    const worksheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<CellValue[]>(worksheet, { header: 1, raw: true, defval: '', blankrows: false });
    if (!rows.length) throw new ExcelMergeError('emptyWorkbook', source.fileName);
    const header = rows[0];
    if (!header.length || header.some(isBlank)) throw new ExcelMergeError('incompatibleColumns', source.fileName);
    if (rows.length < 2) throw new ExcelMergeError('emptyWorkbook', source.fileName);
    if (rows.some((row) => row.length > header.length)) throw new ExcelMergeError('incompatibleColumns', source.fileName);
    result.push({ name, header, data: rows.slice(1) });
  }
  return result;
}

function sameHeader(left: CellValue[], right: CellValue[]): boolean {
  return left.length === right.length && left.every((cell, index) => normalizeHeader(cell) === normalizeHeader(right[index]));
}

function normalizeHeader(value: CellValue): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? '').normalize('NFKC').trim();
}

function isBlank(value: CellValue): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

async function hasZipHeader(blob: Blob): Promise<boolean> {
  const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  return bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);
}
