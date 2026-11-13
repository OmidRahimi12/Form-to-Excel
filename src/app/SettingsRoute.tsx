import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, Loading, PageHeader } from '../components/shared';

const BackupSettingsPage = lazy(() => import('../features/backup/pages/BackupSettingsPage').then(({ BackupSettingsPage }) => ({ default: BackupSettingsPage })));

function SettingsLoading() {
  const { t } = useTranslation();
  return <Loading label={t('loadingSettings')} />;
}

function SettingsImportError() {
  const { t } = useTranslation();
  return <section className="module-page"><PageHeader eyebrow={t('appName')} title={t('settings')} /><div className="module-page__content"><EmptyState title={t('backupRouteLoadError')} description={t('backupRouteLoadErrorDescription')} /></div></section>;
}

interface BoundaryState { failed: boolean; }

class SettingsRouteBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState { return { failed: true }; }

  componentDidCatch(_error: Error, _info: ErrorInfo): void { /* Error is represented by the localized route fallback. */ }

  render() { return this.state.failed ? <SettingsImportError /> : this.props.children; }
}

export function SettingsRoute() {
  return <SettingsRouteBoundary><Suspense fallback={<SettingsLoading />}><BackupSettingsPage /></Suspense></SettingsRouteBoundary>;
}
