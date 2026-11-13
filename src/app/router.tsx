import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../components/layout/AppLayout';
import { ModulePage } from '../components/layout/ModulePage';
import { Loading } from '../components/shared';
import { appRoutes } from './navigation';

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const FormsPage = lazy(() => import('../features/forms/pages/FormsPage').then((module) => ({ default: module.FormsPage })));
const FormCreatePage = lazy(() => import('../features/forms/pages/FormCreatePage').then((module) => ({ default: module.FormCreatePage })));
const FormDetailsPage = lazy(() => import('../features/forms/pages/FormDetailsPage').then((module) => ({ default: module.FormDetailsPage })));
const FormEditPage = lazy(() => import('../features/forms/pages/FormEditPage').then((module) => ({ default: module.FormEditPage })));
const FormBuilderPage = lazy(() => import('../features/forms/pages/FormBuilderPage').then((module) => ({ default: module.FormBuilderPage })));
const FilesPage = lazy(() => import('../features/files/pages/FilesPage').then((module) => ({ default: module.FilesPage })));
const FileDetailsPage = lazy(() => import('../features/files/pages/FileDetailsPage').then((module) => ({ default: module.FileDetailsPage })));
const MergedFilesPage = lazy(() => import('../features/merged-files/pages/MergedFilesPage').then((module) => ({ default: module.MergedFilesPage })));
const SpreadsheetHomePage = lazy(() => import('../features/spreadsheet/pages/SpreadsheetHomePage').then((module) => ({ default: module.SpreadsheetHomePage })));
const SpreadsheetEditorPage = lazy(() => import('../features/spreadsheet/pages/SpreadsheetEditorPage').then((module) => ({ default: module.SpreadsheetEditorPage })));
const SettingsRoute = lazy(() => import('./SettingsRoute').then((module) => ({ default: module.SettingsRoute })));
const NotesPage = lazy(() => import('../features/notes/pages/NotesPage').then((module) => ({ default: module.NotesPage })));
const CommunicationPage = lazy(() => import('../features/communication/pages/CommunicationPage').then((module) => ({ default: module.CommunicationPage })));
const DocumentInformationPage = lazy(() => import('../features/document-information/pages/DocumentInformationPage').then((module) => ({ default: module.DocumentInformationPage })));

function RouteLoading() { const { t } = useTranslation(); return <Loading label={t('loadingModule')} />; }
const withSuspense = (element: ReactNode) => <Suspense fallback={<RouteLoading />}>{element}</Suspense>;

export const router = createBrowserRouter([
  {
    path: appRoutes.dashboard,
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: appRoutes.forms.slice(1), element: withSuspense(<FormsPage />) },
      { path: appRoutes.formBuilder.slice(1), element: withSuspense(<FormBuilderPage />) },
      { path: `${appRoutes.forms.slice(1)}/new`, element: withSuspense(<FormCreatePage />) },
      { path: `${appRoutes.forms.slice(1)}/:id/edit`, element: withSuspense(<FormEditPage />) },
      { path: `${appRoutes.forms.slice(1)}/:id`, element: withSuspense(<FormDetailsPage />) },
      { path: appRoutes.files.slice(1), element: withSuspense(<FilesPage />) },
      { path: `${appRoutes.files.slice(1)}/:id`, element: withSuspense(<FileDetailsPage />) },
      { path: appRoutes.mergedFiles.slice(1), element: withSuspense(<MergedFilesPage />) },
      { path: appRoutes.communication.slice(1), element: withSuspense(<CommunicationPage />) },
      { path: appRoutes.documentInformation.slice(1), element: withSuspense(<DocumentInformationPage />) },
      { path: appRoutes.notes.slice(1), element: withSuspense(<NotesPage />) },
      { path: appRoutes.spreadsheet.slice(1), element: withSuspense(<SpreadsheetHomePage />) },
      { path: `${appRoutes.spreadsheetEditor.slice(1)}`, element: withSuspense(<SpreadsheetEditorPage />) },
      { path: `${appRoutes.spreadsheetFileOpen.slice(1)}/:fileId`, element: withSuspense(<SpreadsheetEditorPage />) },
      { path: appRoutes.settings.slice(1), element: withSuspense(<SettingsRoute />) },
      { path: '*', element: <ModulePage titleKey="notFound" /> },
    ],
  },
]);
