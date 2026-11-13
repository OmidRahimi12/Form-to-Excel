import { useState } from 'react';
import { Share2, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../../../components/ui';
import { PageHeader } from '../../../components/shared';

export function CommunicationPage() {
  const { t } = useTranslation(); const [status, setStatus] = useState('');
  const share = async () => {
    setStatus('');
    try {
      if (navigator.share) await navigator.share({ title: t('appName'), url: window.location.origin });
      else { await navigator.clipboard.writeText(window.location.origin); setStatus('communicationLinkCopied'); }
    } catch (error) { if (error instanceof Error && error.name !== 'AbortError') setStatus('communicationShareError'); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(window.location.origin); setStatus('communicationLinkCopied'); } catch { setStatus('communicationCopyError'); } };
  return <section className="information-page"><PageHeader eyebrow={t('appName')} title={t('communication')} description={t('communicationDescription')} /><Card className="communication-card"><h2>{t('shareApplication')}</h2><p>{t('shareApplicationDescription')}</p><div className="note-card__actions"><Button onClick={() => void share()}><Share2 size={17} aria-hidden="true" />{t('shareApplication')}</Button><Button variant="secondary" onClick={() => void copy()}><Copy size={17} aria-hidden="true" />{t('copyApplicationLink')}</Button></div>{status && <p role="status" className="form-feedback">{t(status)}</p>}</Card></section>;
}
