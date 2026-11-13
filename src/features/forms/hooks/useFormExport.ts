import { useRef, useState } from 'react';
import { exportAllForms, FormExportError } from '../services/formExportService';

export type FormExportFeedback =
  | { kind: 'success'; key: 'formsExported'; count: number }
  | { kind: 'error'; key: 'noFormsToExport' | 'formsExportFailed' };

export function useFormExport() {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<FormExportFeedback | null>(null);
  const inFlight = useRef(false);

  const exportForms = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      const { formCount } = await exportAllForms();
      setFeedback({ kind: 'success', key: 'formsExported', count: formCount });
    } catch (error) {
      setFeedback({
        kind: 'error',
        key: error instanceof FormExportError && error.code === 'noForms' ? 'noFormsToExport' : 'formsExportFailed',
      });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return { busy, feedback, exportForms };
}
