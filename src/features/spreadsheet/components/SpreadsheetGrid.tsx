import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WorkSheet } from 'xlsx';
import { readCellValue, getSheetDimensions } from '../services/spreadsheetService';
import { cellAddress, columnLabel } from '../utils/cellAddress';
import { SpreadsheetCell } from './SpreadsheetCell';

interface SpreadsheetGridProps {
  sheet: WorkSheet;
  activeCell: { row: number; column: number };
  onCellSelect: (cell: { row: number; column: number }) => void;
  onStartEditing: () => void;
  disabled: boolean;
}

export function SpreadsheetGrid({ sheet, activeCell, onCellSelect, onStartEditing, disabled }: SpreadsheetGridProps) {
  const { t } = useTranslation();
  const { rows, columns } = getSheetDimensions(sheet);
  const columnNames = useMemo(() => Array.from({ length: columns }, (_, column) => columnLabel(column)), [columns]);
  const moveToCell = useCallback((fromRow: number, fromColumn: number, rowDelta: number, columnDelta: number) => {
    const row = Math.min(rows - 1, Math.max(0, fromRow + rowDelta));
    const column = Math.min(columns - 1, Math.max(0, fromColumn + columnDelta));
    const address = cellAddress(row, column);
    onCellSelect({ row, column });
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-cell-address="${address}"]`)?.focus());
  }, [columns, onCellSelect, rows]);

  return <div className="spreadsheet-grid-scroll" role="region" aria-label={t('spreadsheetGrid')} tabIndex={0}>
    <table className="spreadsheet-grid" dir="ltr">
      <thead><tr><th className="spreadsheet-grid__corner" aria-hidden="true">#</th>{columnNames.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{Array.from({ length: rows }, (_, row) => <tr key={row}>
        <th scope="row">{row + 1}</th>
        {columnNames.map((_, column) => {
          const address = cellAddress(row, column);
          return <SpreadsheetCell key={address} address={address} row={row} column={column} value={readCellValue(sheet, row, column)} selected={activeCell.row === row && activeCell.column === column} disabled={disabled} onSelect={onCellSelect} onMove={moveToCell} onEdit={onStartEditing} />;
        })}
      </tr>)}</tbody>
    </table>
  </div>;
}
