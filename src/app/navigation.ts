import { FileSpreadsheet, Files, Folder, House, MessageSquareText, NotebookPen, Settings, Table2, FileText, type LucideIcon } from 'lucide-react';

export const appRoutes = {
  dashboard: '/',
  forms: '/forms',
  formBuilder: '/form-builder',
  files: '/files',
  mergedFiles: '/merged-files',
  communication: '/communication',
  documentInformation: '/document-information',
  notes: '/notes',
  spreadsheet: '/spreadsheet',
  spreadsheetEditor: '/spreadsheet/editor',
  spreadsheetFileOpen: '/spreadsheet/editor/file',
  settings: '/settings',
} as const;

export type NavigationKey = Exclude<keyof typeof appRoutes, 'spreadsheetEditor' | 'spreadsheetFileOpen'>;

export interface NavigationItem {
  to: (typeof appRoutes)[NavigationKey];
  key: NavigationKey;
  icon: LucideIcon;
}

export const navigationLinks: NavigationItem[] = [
  { to: appRoutes.dashboard, key: 'dashboard', icon: House },
  { to: appRoutes.forms, key: 'forms', icon: FileText },
  { to: appRoutes.formBuilder, key: 'formBuilder', icon: FileSpreadsheet },
  { to: appRoutes.files, key: 'files', icon: Folder },
  { to: appRoutes.mergedFiles, key: 'mergedFiles', icon: Files },
  { to: appRoutes.communication, key: 'communication', icon: MessageSquareText },
  { to: appRoutes.documentInformation, key: 'documentInformation', icon: FileSpreadsheet },
  { to: appRoutes.notes, key: 'notes', icon: NotebookPen },
  { to: appRoutes.spreadsheet, key: 'spreadsheet', icon: Table2 },
  { to: appRoutes.settings, key: 'settings', icon: Settings },
];

const dashboardFeatureKeys: NavigationKey[] = ['forms', 'formBuilder', 'files', 'spreadsheet', 'mergedFiles', 'notes'];
export const dashboardFeatureLinks = navigationLinks.filter(({ key }) => dashboardFeatureKeys.includes(key));
