import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';

interface SpreadsheetToolbarProps {
  fileName: string;
  dirty: boolean;
  saving: boolean;
  selectedAddress: string;
  onBack: () => void;
  onSave: () => void;
}

export function SpreadsheetToolbar({ fileName, dirty, saving, selectedAddress, onBack, onSave }: SpreadsheetToolbarProps) {
  const { t } = useTranslation();
  return <div className="spreadsheet-toolbar">
    <Button variant="ghost" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" />{t('backToSpreadsheet')}</Button>
    <div className="spreadsheet-toolbar__file"><strong dir="auto">{fileName}</strong><span className={dirty ? 'spreadsheet-dirty' : 'spreadsheet-clean'}>{t(dirty ? 'unsavedChanges' : 'allChangesSaved')}</span></div>
    <div className="spreadsheet-toolbar__controls"><span className="spreadsheet-cell-address" dir="ltr">{selectedAddress}</span><Button disabled={saving} onClick={onSave}><Save size={18} aria-hidden="true" />{saving ? t('savingWorkbook') : t('saveAs')}</Button></div>
  </div>;
}
