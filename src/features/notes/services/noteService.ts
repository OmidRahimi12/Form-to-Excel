import { appDatabase } from '../../../database/appDatabase';
import type { NoteRecord } from '../types/note';
import type { AppDatabase } from '../../../database/appDatabase';

export const listNotes = (database: AppDatabase = appDatabase) => database.notes.orderBy('updatedAt').reverse().toArray();
export const saveNote = async (note: Pick<NoteRecord, 'title' | 'body'>, id?: number, database: AppDatabase = appDatabase) => {
  const title = note.title.trim();
  const body = note.body.trim();
  if (title.length > 160 || body.length > 20_000) throw new Error('NOTE_INVALID');
  if (!title && !body) throw new Error('NOTE_EMPTY');
  const now = Date.now();
  if (id === undefined) return database.notes.add({ title, body, createdAt: now, updatedAt: now });
  return database.transaction('rw', database.notes, async () => {
    const current = await database.notes.get(id);
    if (!current) throw new Error('NOTE_NOT_FOUND');
    await database.notes.put({ ...current, title, body, updatedAt: Math.max(now, current.updatedAt + 1) });
  });
};
export const deleteNote = (id: number, database: AppDatabase = appDatabase) => database.notes.delete(id);
