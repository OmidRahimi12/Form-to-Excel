export function formatFileSize(size: number, locale: string): string {
  const numberFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  if (size < 1_000) return new Intl.NumberFormat(locale, { style: 'unit', unit: 'byte', unitDisplay: 'short' }).format(size);
  const units = ['kilobyte', 'megabyte', 'gigabyte'] as const;
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1_000)) - 1, units.length - 1);
  const value = size / (1_000 ** (unitIndex + 1));
  return `${numberFormat.format(value)} ${new Intl.NumberFormat(locale, { style: 'unit', unit: units[unitIndex], unitDisplay: 'short' }).formatToParts(1).find((part) => part.type === 'unit')?.value ?? units[unitIndex]}`;
}
