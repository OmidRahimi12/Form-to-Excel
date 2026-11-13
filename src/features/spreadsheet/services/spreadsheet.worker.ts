import { addWorksheetToWorkbook, createBlankWorkbookData, parseWorkbookBytes, writeSpreadsheetBytes } from './spreadsheetWorkerService';
import type { SpreadsheetWorkerRequest } from './spreadsheetService';

const worker = globalThis as unknown as { onmessage: ((event: MessageEvent<SpreadsheetWorkerRequest>) => void) | null; postMessage: (message: unknown) => void };
worker.onmessage = async ({ data }) => {
  try {
    let result: unknown;
    switch (data.type) {
      case 'create': result = await createBlankWorkbookData(); break;
      case 'parse': result = await parseWorkbookBytes(data.bytes, data.kind); break;
      case 'write': result = await writeSpreadsheetBytes(data.workbook); break;
      case 'addSheet': result = await addWorksheetToWorkbook(data.workbook, data.name); break;
    }
    worker.postMessage({ result });
  } catch (error) {
    const code = error instanceof Error && 'code' in error ? String((error as Error & { code: string }).code) : 'invalidWorkbook';
    worker.postMessage({ error: code });
  }
};
