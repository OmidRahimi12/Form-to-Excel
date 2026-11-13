import type { WorkBook } from 'xlsx';
import { SpreadsheetError, type SpreadsheetImportKind } from '../types/spreadsheet';
import { validateSpreadsheetBytes } from './spreadsheetService';

const MAX_SHEETS = 20;
const MAX_ROWS_PER_SHEET = 5_000;
const MAX_COLUMNS_PER_SHEET = 100;
const MAX_TOTAL_CELLS = 50_000;

export async function createBlankWorkbookData(): Promise<WorkBook> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([[]]), 'Sheet1');
  return workbook;
}

export async function parseWorkbookBytes(bytes: ArrayBuffer, kind: SpreadsheetImportKind): Promise<WorkBook> {
  validateSpreadsheetBytes(bytes, kind);
  const XLSX = await import('xlsx');
  try {
    const workbook = XLSX.read(bytes, { type: 'array', cellDates: false, cellFormula: true, cellNF: true, cellStyles: true, bookVBA: false, bookFiles: false });
    if (!workbook.SheetNames.length || workbook.SheetNames.length > MAX_SHEETS) throw new SpreadsheetError('invalidWorkbook');
    validateWorkbookSize(workbook, XLSX);
    return workbook;
  } catch (error) {
    if (error instanceof SpreadsheetError) throw error;
    throw new SpreadsheetError('invalidWorkbook');
  }
}

export async function writeSpreadsheetBytes(workbook: WorkBook): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx');
  const result = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });
  return result instanceof ArrayBuffer ? result : result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength) as ArrayBuffer;
}

export async function addWorksheetToWorkbook(workbook: WorkBook, name: string): Promise<WorkBook> {
  const XLSX = await import('xlsx');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([[]]), name);
  return workbook;
}

function validateWorkbookSize(workbook: WorkBook, xlsx: typeof import('xlsx')): void {
  let totalCells = 0;
  for (const name of workbook.SheetNames) {
    const ref = workbook.Sheets[name]?.['!ref'];
    const range = ref ? xlsx.utils.decode_range(ref) : { e: { r: 0, c: 0 } };
    const rows = range.e.r + 1; const columns = range.e.c + 1;
    if (rows > MAX_ROWS_PER_SHEET || columns > MAX_COLUMNS_PER_SHEET) throw new SpreadsheetError('workbookTooLarge');
    totalCells += Math.max(40, rows) * Math.max(12, columns);
    if (totalCells > MAX_TOTAL_CELLS) throw new SpreadsheetError('workbookTooLarge');
  }
}
