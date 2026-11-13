import { memo } from 'react';

interface SpreadsheetCellProps {
  address: string;
  row: number;
  column: number;
  value: string;
  selected: boolean;
  disabled: boolean;
  onSelect: (cell: { row: number; column: number }) => void;
  onMove: (row: number, column: number, rowDelta: number, columnDelta: number) => void;
  onEdit: () => void;
}

export const SpreadsheetCell = memo(function SpreadsheetCell({ address, row, column, value, selected, disabled, onSelect, onMove, onEdit }: SpreadsheetCellProps) {
  return <td className={selected ? 'spreadsheet-grid__cell spreadsheet-grid__cell--selected' : 'spreadsheet-grid__cell'}>
    <button type="button" dir="auto" data-cell-address={address} tabIndex={selected ? 0 : -1} aria-label={`${address}: ${value}`} disabled={disabled} onClick={() => onSelect({ row, column })} onDoubleClick={onEdit} onKeyDown={(event) => {
      if (event.key === 'ArrowUp') { event.preventDefault(); onMove(row, column, -1, 0); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); onMove(row, column, 1, 0); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); onMove(row, column, 0, document.documentElement.dir === 'rtl' ? 1 : -1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); onMove(row, column, 0, document.documentElement.dir === 'rtl' ? -1 : 1); }
      else if (event.key === 'Enter' || event.key === 'F2') { event.preventDefault(); onEdit(); }
    }}>{value}</button>
  </td>;
});
