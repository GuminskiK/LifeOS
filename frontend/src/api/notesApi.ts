import { notesApi } from './client';

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface Note {
  id: number;
  name: string;
  content: object | null;
  folder_id: number | null;
  updated_at?: string;
  created_at?: string;
}

// Foldery
export const fetchFolders = async (): Promise<Folder[]> => {
  const { data } = await notesApi.get('/folders/');
  return data;
};

export const createFolder = async (name: string, parent_id: number | null = null): Promise<Folder> => {
  const { data } = await notesApi.post('/folders/', { name, parent_id });
  return data;
};

export const deleteFolder = async (folder_id: number): Promise<void> => {
  await notesApi.delete(`/folders/${folder_id}`);
};

// Notatki
export const fetchNotes = async (): Promise<Note[]> => {
  const { data } = await notesApi.get('/notes/');
  return data;
};

export const getNote = async (note_id: number): Promise<Note> => {
  const { data } = await notesApi.get(`/notes/${note_id}`);
  return data;
};

export const createNote = async (name: string, folder_id: number | null = null, content: object = {}): Promise<Note> => {
  const { data } = await notesApi.post('/notes/', { name, folder_id, content });
  return data;
};

export const updateNote = async (note_id: number, updates: Partial<Note>): Promise<Note> => {
  const { data } = await notesApi.patch(`/notes/${note_id}`, updates);
  return data;
};

export const deleteNote = async (note_id: number): Promise<void> => {
  await notesApi.delete(`/notes/${note_id}`);
};