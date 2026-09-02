/**
 * Notes service — lightweight notes for the Side Panel.
 */

import type { Note } from '@/types/note';
import type { UUID } from '@/types/utils';
import { STORAGE_KEYS, storage } from './storage';
import { uuid } from '@/utils/uuid';

/** In-memory cache */
let cachedNotes: Note[] | null = null;

/** Listeners */
const listeners = new Set<(notes: Note[]) => void>();

export function onNotesChange(cb: (notes: Note[]) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(notes: Note[]): void {
  listeners.forEach(cb => cb(notes));
}

/** Load notes from storage */
export async function loadNotes(): Promise<Note[]> {
  if (cachedNotes) return cachedNotes;

  try {
    const stored = await storage.get<Note[]>(STORAGE_KEYS.notes);
    cachedNotes = stored ?? [];
    return [...cachedNotes];
  } catch {
    cachedNotes = [];
    return [];
  }
}

/** Persist notes */
async function persist(notes: Note[]): Promise<void> {
  cachedNotes = notes;
  notify(notes);
  try {
    await storage.set(STORAGE_KEYS.notes, notes);
  } catch (err) {
    console.warn('NOVA: Failed to persist notes', err);
  }
}

/** Create a new note */
export async function createNote(input: { title: string; content?: string; workspaceId?: string | null }): Promise<Note> {
  const now = Date.now();
  const note: Note = {
    id: uuid(),
    title: input.title,
    content: input.content ?? '',
    workspaceId: (input.workspaceId as UUID | null) ?? null,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };

  const notes = await loadNotes();
  notes.unshift(note);
  await persist(notes);
  return note;
}

/** Update a note */
export async function updateNote(id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'pinned' | 'workspaceId'>>): Promise<Note | null> {
  const notes = await loadNotes();
  const idx = notes.findIndex(n => n.id === id);
  if (idx === -1) return null;

  notes[idx] = {
    ...notes[idx],
    ...patch,
    updatedAt: Date.now(),
  };
  await persist(notes);
  return notes[idx];
}

/** Delete a note */
export async function deleteNote(id: string): Promise<boolean> {
  const notes = await loadNotes();
  const filtered = notes.filter(n => n.id !== id);
  if (filtered.length === notes.length) return false;
  await persist(filtered);
  return true;
}

/** Get a single note */
export async function getNote(id: string): Promise<Note | null> {
  const notes = await loadNotes();
  return notes.find(n => n.id === id) ?? null;
}
