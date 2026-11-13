export function columnLabel(column: number): string {
  let value = column + 1;
  let label = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
}

export function cellAddress(row: number, column: number): string {
  return `${columnLabel(column)}${row + 1}`;
}

export function decodeCellAddress(address: string): { row: number; column: number } {
  const match = /^([A-Z]+)(\d+)$/i.exec(address);
  if (!match) return { row: 0, column: 0 };
  const column = [...match[1].toUpperCase()].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
  return { row: Math.max(0, Number(match[2]) - 1), column: Math.max(0, column) };
}
