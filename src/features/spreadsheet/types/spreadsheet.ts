import type { WorkBook } from 'xlsx';

export interface SpreadsheetSessionSeed {
  workbook: WorkBook;
  fileName: string;
  initiallyDirty: boolean;
}

export type SpreadsheetImportKind = 'xlsx' | 'csv';

export type SpreadsheetErrorCode = 'unsupportedType' | 'emptyFile' | 'fileTooLarge' | 'invalidWorkbook' | 'suspiciousWorkbook' | 'workbookTooLarge' | 'invalidSheetName' | 'duplicateSheetName' | 'cannotDeleteLastSheet';

export class SpreadsheetError extends Error {
  constructor(readonly code: SpreadsheetErrorCode) {
    super(code);
    this.name = 'SpreadsheetError';
  }
}
