import { useDexieQuery } from '../../../hooks/useDexieQuery';
import { listNotes } from '../services/noteService';
import type { NoteRecord } from '../types/note';

export function useNotes() { return useDexieQuery<NoteRecord[]>(listNotes, [], []); }
