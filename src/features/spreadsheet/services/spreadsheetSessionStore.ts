import type { SpreadsheetSessionSeed } from '../types/spreadsheet';

let pendingSession: SpreadsheetSessionSeed | null = null;

export function setPendingSpreadsheetSession(session: SpreadsheetSessionSeed): void {
  pendingSession = session;
}

export function takePendingSpreadsheetSession(): SpreadsheetSessionSeed | null {
  const session = pendingSession;
  pendingSession = null;
  return session;
}
