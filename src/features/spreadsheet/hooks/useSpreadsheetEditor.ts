import { useCallback, useEffect, useRef, useState } from 'react';
import { getFileContent, saveExportedFile } from '../../files/services/fileService';
import { XLSX_MIME_TYPE } from '../../files/types/file';
import { parseSpreadsheetFile, writeSpreadsheet, addWorksheet, deleteWorksheet, renameWorksheet, setCellValue } from '../services/spreadsheetService';
import { takePendingSpreadsheetSession } from '../services/spreadsheetSessionStore';
import type { SpreadsheetSessionSeed } from '../types/spreadsheet';

export function useSpreadsheetEditor(fileId?: number) {
  const [initialSeed] = useState<SpreadsheetSessionSeed | null>(() => takePendingSpreadsheetSession());
  const [workbook, setWorkbook] = useState(initialSeed?.workbook ?? null);
  const [fileName, setFileName] = useState(initialSeed?.fileName ?? 'Workbook.xlsx');
  const [dirty, setDirty] = useState(initialSeed?.initiallyDirty ?? false);
  const [activeSheetName, setActiveSheetName] = useState(initialSeed?.workbook.SheetNames[0] ?? '');
  const [loading, setLoading] = useState(!initialSeed);
  const [loadError, setLoadError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [savedNotice, setSavedNotice] = useState(false);
  const loadId = useRef(0);
  const saveLock = useRef(false);
  const revision = useRef(0);

  useEffect(() => {
    if (initialSeed || fileId === undefined) {
      setLoading(false);
      return;
    }
    const currentLoad = ++loadId.current;
    setLoading(true);
    setLoadError(undefined);
    void (async () => {
      try {
        const { metadata, blob } = await getFileContent(fileId);
        if (metadata.mimeType !== XLSX_MIME_TYPE || !metadata.fileName.toLowerCase().endsWith('.xlsx')) throw new Error('unsupported');
        const file = new File([blob], metadata.fileName, { type: metadata.mimeType, lastModified: metadata.createdAt });
        const parsed = await parseSpreadsheetFile(file, 'xlsx');
        if (currentLoad !== loadId.current) return;
        setWorkbook(parsed);
        setFileName(`${metadata.fileName.replace(/\.xlsx$/i, '')}_copy.xlsx`);
        setActiveSheetName(parsed.SheetNames[0] ?? '');
        setDirty(false);
      } catch (error) {
        if (currentLoad === loadId.current) setLoadError(error instanceof Error && 'code' in error ? mapErrorKey(error) : 'spreadsheetOpenFileError');
      } finally {
        if (currentLoad === loadId.current) setLoading(false);
      }
    })();
    return () => { loadId.current += 1; };
  }, [fileId, initialSeed]);

  const markChanged = useCallback(() => {
    revision.current += 1;
    setDirty(true);
    setSavedNotice(false);
  }, []);

  const updateCell = useCallback((row: number, column: number, value: string) => {
    if (!workbook || !activeSheetName) return;
    try {
      setCellValue(workbook, activeSheetName, row, column, value);
      setWorkbook({ ...workbook });
      markChanged();
    } catch (error) {
      setSaveError(error instanceof Error && 'code' in error ? mapErrorKey(error) : 'spreadsheetEditError');
    }
  }, [activeSheetName, markChanged, workbook]);

  const createSheet = useCallback(async (name: string) => {
    if (!workbook) return false;
    try {
      await addWorksheet(workbook, name);
      setWorkbook({ ...workbook });
      setActiveSheetName(name.trim());
      markChanged();
      return true;
    } catch (error) {
      setSaveError(mapErrorKey(error));
      return false;
    }
  }, [markChanged, workbook]);

  const renameSheet = useCallback((name: string) => {
    if (!workbook || !activeSheetName) return false;
    try {
      renameWorksheet(workbook, activeSheetName, name);
      setWorkbook({ ...workbook });
      setActiveSheetName(name.trim());
      markChanged();
      return true;
    } catch (error) {
      setSaveError(mapErrorKey(error));
      return false;
    }
  }, [activeSheetName, markChanged, workbook]);

  const removeSheet = useCallback(() => {
    if (!workbook || !activeSheetName || workbook.SheetNames.length <= 1) return false;
    const index = workbook.SheetNames.indexOf(activeSheetName);
    deleteWorksheet(workbook, activeSheetName);
    setWorkbook({ ...workbook });
    setActiveSheetName(workbook.SheetNames[Math.max(0, index - 1)] ?? workbook.SheetNames[0]);
    markChanged();
    return true;
  }, [activeSheetName, markChanged, workbook]);

  const saveAs = useCallback(async (rawName: string) => {
    if (!workbook || saveLock.current) return false;
    const trimmed = rawName.trim();
    const baseName = trimmed.replace(/\.xlsx$/i, '');
    if (!baseName || baseName.length > 235 || /[\\/\u0000-\u001f]/.test(baseName)) {
      setSaveError('spreadsheetInvalidFileName');
      return false;
    }
    const outputName = `${baseName}.xlsx`;
    saveLock.current = true;
    setSaving(true);
    setSaveError(undefined);
    setSavedNotice(false);
    try {
      const saveRevision = revision.current;
      const snapshot = structuredClone(workbook);
      const blob = await writeSpreadsheet(snapshot);
      await saveExportedFile(blob, outputName);
      setFileName(outputName);
      setDirty(revision.current === saveRevision ? false : true);
      setSavedNotice(true);
      return true;
    } catch {
      setSaveError('spreadsheetSaveError');
      return false;
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }, [saving, workbook]);

  return { workbook, fileName, setFileName, dirty, loading, loadError, saving, saveError, savedNotice, activeSheetName, setActiveSheetName, updateCell, createSheet, renameSheet, removeSheet, saveAs, clearFeedback: () => { setSaveError(undefined); setSavedNotice(false); } };
}

function mapErrorKey(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    switch (error.code) {
      case 'unsupportedType': return 'spreadsheetUnsupportedType';
      case 'emptyFile': return 'spreadsheetEmptyFile';
      case 'fileTooLarge': return 'spreadsheetFileTooLarge';
      case 'workbookTooLarge': return 'spreadsheetWorkbookTooLarge';
      case 'suspiciousWorkbook': return 'spreadsheetSuspiciousWorkbook';
      case 'invalidSheetName': return 'spreadsheetInvalidSheetName';
      case 'duplicateSheetName': return 'spreadsheetDuplicateSheetName';
      case 'cannotDeleteLastSheet': return 'spreadsheetCannotDeleteLastSheet';
      case 'invalidName': return 'spreadsheetInvalidFileName';
    }
  }
  return 'spreadsheetImportError';
}
