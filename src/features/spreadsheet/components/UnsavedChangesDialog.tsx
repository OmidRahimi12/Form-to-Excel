import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../../../components/ui';

interface UnsavedChangesDialogProps {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({ open, onSave, onDiscard, onCancel }: UnsavedChangesDialogProps) {
  const { t } = useTranslation();
  return <Modal open={open} title={t('unsavedChangesTitle')} onClose={onCancel}>
    <p className="dialog-copy">{t('unsavedChangesDescription')}</p>
    <footer className="dialog-actions dialog-actions--stacked">
      <Button onClick={onSave}>{t('saveAs')}</Button>
      <Button variant="danger" onClick={onDiscard}>{t('discardChanges')}</Button>
      <Button variant="secondary" onClick={onCancel}>{t('continueEditing')}</Button>
    </footer>
  </Modal>;
}
