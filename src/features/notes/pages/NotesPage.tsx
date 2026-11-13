import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../../../components/ui';
import { ConfirmationDialog, EmptyState, Loading, PageHeader } from '../../../components/shared';
import { NoteCard } from '../components/NoteCard';
import { NoteEditor } from '../components/NoteEditor';
import { deleteNote, saveNote } from '../services/noteService';
import { useNotes } from '../hooks/useNotes';
import type { NoteRecord } from '../types/note';

export function NotesPage() {
  const { t } = useTranslation(); const { value: notes, loading, error } = useNotes();
  const [editing, setEditing] = useState<NoteRecord | 'new' | null>(null); const [deleting, setDeleting] = useState<NoteRecord | null>(null); const [message, setMessage] = useState('');
  const sorted = useMemo(() => notes, [notes]);
  const commit = async (value: { title: string; body: string }) => { await saveNote(value, editing !== 'new' ? editing?.id : undefined); setEditing(null); setMessage(t('noteSaved')); };
  const remove = async () => { if (!deleting?.id) return; await deleteNote(deleting.id); setDeleting(null); setMessage(t('noteDeleted')); };
  return <section className="notes-page"><PageHeader eyebrow={t('appName')} title={t('notes')} description={t('notesDescription')} actions={<Button onClick={() => setEditing('new')}><Plus size={18} aria-hidden="true" />{t('createNote')}</Button>} />
    {message && <p role="status" className="form-feedback form-feedback--success">{message}</p>}
    {loading ? <Loading label={t('loadingNotes')} /> : error ? <EmptyState title={t('notesLoadError')} /> : sorted.length ? <div className="notes-list">{sorted.map((note) => <NoteCard key={note.id} note={note} onEdit={() => setEditing(note)} onDelete={() => setDeleting(note)} />)}</div> : <EmptyState title={t('noNotes')} description={t('noNotesDescription')} action={<Button onClick={() => setEditing('new')}>{t('createNote')}</Button>} />}
    <Modal open={editing !== null} title={t(editing === 'new' ? 'createNote' : 'editNote')} onClose={() => setEditing(null)}>{editing !== null && <NoteEditor note={editing === 'new' ? undefined : editing} onCancel={() => setEditing(null)} onSave={commit} />}</Modal>
    <ConfirmationDialog open={Boolean(deleting)} title={t('deleteNote')} message={t('deleteNoteMessage')} confirmLabel={t('deleteNote')} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} />
  </section>;
}
