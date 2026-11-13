import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui';
import { EmptyState, Loading, PageHeader, ConfirmationDialog } from '../../../components/shared';
import { appRoutes } from '../../../app/navigation';
import { parseFileId } from '../../files/utils/parseFileId';
import { useSpreadsheetEditor } from '../hooks/useSpreadsheetEditor';
import { readCellValue } from '../services/spreadsheetService';
import { cellAddress } from '../utils/cellAddress';
import { SpreadsheetCellEditor } from '../components/SpreadsheetCellEditor';
import { SpreadsheetGrid } from '../components/SpreadsheetGrid';
import { SpreadsheetSheetBar } from '../components/SpreadsheetSheetBar';
import { SpreadsheetToolbar } from '../components/SpreadsheetToolbar';
import { SaveSpreadsheetDialog } from '../components/SaveSpreadsheetDialog';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';
import { useTranslation } from 'react-i18next';

export function SpreadsheetEditorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rawFileId = useParams().fileId;
  const fileId = rawFileId === undefined ? undefined : parseFileId(rawFileId);
  const editor = useSpreadsheetEditor(fileId);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [continueAfterSave, setContinueAfterSave] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [cellDraft, setCellDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const activeSheet = editor.workbook?.Sheets[editor.activeSheetName];
  const selectedAddress = cellAddress(selectedCell.row, selectedCell.column);
  const currentCellValue = activeSheet ? readCellValue(activeSheet, selectedCell.row, selectedCell.column) : '';
  const hasUnsavedChanges = editor.dirty || cellDraft !== currentCellValue;
  const blocker = useBlocker(hasUnsavedChanges);

  const commitCell = useCallback((value: string) => {
    if (activeSheet && value !== readCellValue(activeSheet, selectedCell.row, selectedCell.column)) {
      editor.updateCell(selectedCell.row, selectedCell.column, value);
    }
    setCellDraft(value);
  }, [activeSheet, editor.updateCell, selectedCell.column, selectedCell.row]);

  const selectCell = useCallback((cell: { row: number; column: number }) => {
    if (!activeSheet) return;
    commitCell(cellDraft);
    setSelectedCell(cell);
    setCellDraft(readCellValue(activeSheet, cell.row, cell.column));
  }, [activeSheet, cellDraft, commitCell]);

  const selectSheet = (name: string) => {
    if (!editor.workbook) return;
    commitCell(cellDraft);
    setSelectedCell({ row: 0, column: 0 });
    setCellDraft(readCellValue(editor.workbook.Sheets[name], 0, 0));
    editor.setActiveSheetName(name);
  };

  const createSheet = async (name: string) => {
    commitCell(cellDraft);
    return editor.createSheet(name);
  };

  const renameSheet = (name: string) => {
    commitCell(cellDraft);
    return editor.renameSheet(name);
  };

  const deleteSheet = () => {
    commitCell(cellDraft);
    editor.removeSheet();
  };

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!editor.workbook && !editor.loading && !editor.loadError && rawFileId === undefined) navigate(appRoutes.spreadsheet, { replace: true });
  }, [editor.loadError, editor.loading, editor.workbook, navigate, rawFileId]);

  useEffect(() => {
    setSelectedCell({ row: 0, column: 0 });
  }, [editor.activeSheetName]);

  useEffect(() => {
    setCellDraft(activeSheet ? readCellValue(activeSheet, selectedCell.row, selectedCell.column) : '');
  }, [activeSheet, selectedCell.column, selectedCell.row]);

  if (editor.loading) return <div className="spreadsheet-status"><Loading label={t('spreadsheetLoading')} /></div>;
  if (editor.loadError || !editor.workbook) return <section className="spreadsheet-editor-page"><PageHeader eyebrow={t('spreadsheet')} title={t(editor.loadError ?? 'spreadsheetNoSession')} actions={<Button variant="secondary" onClick={() => navigate(appRoutes.spreadsheet)}>{t('backToSpreadsheet')}</Button>} /><EmptyState title={t(editor.loadError ?? 'spreadsheetNoSession')} description={t('spreadsheetImportHelp')} /></section>;
  if (!activeSheet) return <EmptyState title={t('spreadsheetNoSession')} description={t('spreadsheetImportHelp')} />;

  const save = async (name: string) => {
    commitCell(cellDraft);
    const saved = await editor.saveAs(name);
    if (saved) setSaveDialogOpen(false);
    return saved;
  };
  const afterSave = () => {
    if (continueAfterSave && blocker.state === 'blocked') {
      setContinueAfterSave(false);
      blocker.proceed();
    }
  };
  return <section className="spreadsheet-editor-page">
    <SpreadsheetToolbar fileName={editor.fileName} dirty={hasUnsavedChanges} saving={editor.saving} selectedAddress={selectedAddress} onBack={() => navigate(appRoutes.spreadsheet)} onSave={() => { editor.clearFeedback(); setContinueAfterSave(false); setSaveDialogOpen(true); }} />
    {editor.savedNotice && <p className="spreadsheet-feedback spreadsheet-feedback--success" role="status">{t('spreadsheetSaved')}</p>}
    {editor.saveError && <p className="spreadsheet-feedback spreadsheet-feedback--error" role="alert">{t(editor.saveError)}</p>}
    <SpreadsheetSheetBar names={editor.workbook.SheetNames} activeName={editor.activeSheetName} onSelect={selectSheet} onAdd={createSheet} onRename={renameSheet} onDelete={() => { commitCell(cellDraft); setDeleteSheetOpen(true); }} onError={editor.clearFeedback} disabled={editor.saving} />
    <SpreadsheetCellEditor address={selectedAddress} value={cellDraft} disabled={editor.saving} onChange={setCellDraft} onCommit={commitCell} onCancel={() => setCellDraft(currentCellValue)} inputRef={inputRef} />
    <div className="spreadsheet-grid-card"><SpreadsheetGrid sheet={activeSheet} activeCell={selectedCell} disabled={editor.saving} onCellSelect={selectCell} onStartEditing={() => inputRef.current?.focus()} /></div>
    <ConfirmationDialog open={deleteSheetOpen} title={t('deleteWorksheet')} message={t('deleteWorksheetConfirm', { name: editor.activeSheetName })} confirmLabel={t('deleteWorksheet')} onCancel={() => setDeleteSheetOpen(false)} onConfirm={() => { setDeleteSheetOpen(false); deleteSheet(); }} />
    <SaveSpreadsheetDialog open={saveDialogOpen} defaultName={editor.fileName} busy={editor.saving} onClose={() => { setSaveDialogOpen(false); setContinueAfterSave(false); }} onSave={save} onSaved={afterSave} />
    <UnsavedChangesDialog open={blocker.state === 'blocked'} onSave={() => { setContinueAfterSave(true); setSaveDialogOpen(true); }} onDiscard={() => blocker.proceed?.()} onCancel={() => blocker.reset?.()} />
  </section>;
}
