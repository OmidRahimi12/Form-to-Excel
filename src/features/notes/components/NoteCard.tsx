import { Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../../../components/ui';
import type { NoteRecord } from '../types/note';

export function NoteCard({ note, onEdit, onDelete }: { note: NoteRecord; onEdit: () => void; onDelete: () => void }) {
  const { t, i18n } = useTranslation();
  return <Card className="note-card"><div className="note-card__body"><h2 dir="auto">{note.title || t('untitledNote')}</h2><p dir="auto">{note.body}</p><time dateTime={new Date(note.updatedAt).toISOString()}>{new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium' }).format(note.updatedAt)}</time></div><div className="note-card__actions"><Button variant="secondary" onClick={onEdit} aria-label={t('editNote')}><Edit3 size={17} aria-hidden="true" />{t('editNote')}</Button><Button variant="danger" onClick={onDelete} aria-label={t('deleteNote')}><Trash2 size={17} aria-hidden="true" />{t('deleteNote')}</Button></div></Card>;
}
