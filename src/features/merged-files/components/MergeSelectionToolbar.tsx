import { Files, ListChecks, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';

interface MergeSelectionToolbarProps {
  active: boolean;
  selectedCount: number;
  canCreate: boolean;
  canAppend: boolean;
  onStart: () => void;
  onCancel: () => void;
  onCreate: () => void;
  onAppend: () => void;
}

export function MergeSelectionToolbar({ active, selectedCount, canCreate, canAppend, onStart, onCancel, onCreate, onAppend }: MergeSelectionToolbarProps) {
  const { t } = useTranslation();
  if (!active) return <div className="merge-selection-toolbar"><Button variant="secondary" onClick={onStart}><ListChecks size={17} aria-hidden="true" />{t('selectFilesToMerge')}</Button></div>;
  return <div className="merge-selection-toolbar" aria-live="polite">
    <p className="merge-selection-toolbar__count">{t('selectedFileCount', { count: selectedCount })}</p>
    <div className="merge-selection-toolbar__actions">
      <Button onClick={onCreate} disabled={!canCreate}><Files size={17} aria-hidden="true" />{t('createMergedWorkbook')}</Button>
      {canAppend && <Button variant="secondary" onClick={onAppend}>{t('appendToMergedWorkbook')}</Button>}
      <Button variant="ghost" onClick={onCancel}><X size={17} aria-hidden="true" />{t('cancelSelection')}</Button>
    </div>
    {!canCreate && <p className="merge-selection-toolbar__hint">{t('mergeNeedsTwoFiles')}</p>}
  </div>;
}
