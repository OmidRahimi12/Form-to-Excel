import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '../../../components/ui';
import { FormField } from '../../../components/shared/FormField/FormField';
import type { NoteRecord } from '../types/note';

export function NoteEditor({ note, onCancel, onSave }: { note?: NoteRecord; onCancel: () => void; onSave: (value: { title: string; body: string }) => Promise<void> }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    if (!title.trim() && !body.trim()) { setError(true); return; }
    setBusy(true); setError(false);
    try { await onSave({ title, body }); } catch { setError(true); } finally { setBusy(false); }
  };
  return <form className="note-editor" onSubmit={(event) => void submit(event)}>
    {error && <p role="alert" className="form-feedback form-feedback--error">{t(!title.trim() && !body.trim() ? 'noteRequired' : 'noteSaveError')}</p>}
    <FormField id="note-title" label={t('noteTitle')}><Input id="note-title" value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} /></FormField>
    <FormField id="note-body" label={t('noteContent')}><Textarea id="note-body" value={body} rows={6} maxLength={20000} onChange={(event) => setBody(event.target.value)} /></FormField>
    <div className="dialog-actions"><Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>{t('cancel')}</Button><Button type="submit" disabled={busy}>{t(busy ? 'saving' : 'saveNote')}</Button></div>
  </form>;
}
