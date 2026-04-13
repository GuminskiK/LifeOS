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


// FlashCards
export interface FlashCard {
  id: number;
  name: string;
  front: any | null;
  reverse: any | null;
  is_active: boolean;
  next_review?: string;
  interval?: number;
  repetitions?: number;
  easiness_factor?: number;
  group_id?: number | null;
}

export const fetchFlashCards = async (): Promise<FlashCard[]> => {
  const { data } = await notesApi.get('/flashcards/');
  return data;
};

export const createFlashCard = async (flashCardConfig: Partial<FlashCard>): Promise<FlashCard> => {
  const { data } = await notesApi.post('/flashcards/', flashCardConfig);
  return data;
};

export const updateFlashCard = async (id: number, updates: Partial<FlashCard>): Promise<FlashCard> => {
  const { data } = await notesApi.patch(`/flashcards/${id}`, updates);
  return data;
};

export const deleteFlashCard = async (id: number): Promise<void> => {
  await notesApi.delete(`/flashcards/${id}`);
};

// FlashNotes
export interface FlashNote {
  id: number;
  name: string;
  note_id: number | null;
  is_active: boolean;
  next_review?: string;
  interval?: number;
  repetitions?: number;
  easiness_factor?: number;
  group_id?: number | null;
}

export const fetchFlashNotes = async (): Promise<FlashNote[]> => {
  const { data } = await notesApi.get('/flashnotes/');
  return data;
};

export const createFlashNote = async (flashNoteConfig: Partial<FlashNote>): Promise<FlashNote> => {
  const { data } = await notesApi.post('/flashnotes/', flashNoteConfig);
  return data;
};

export const updateFlashNote = async (id: number, updates: Partial<FlashNote>): Promise<FlashNote> => {
  const { data } = await notesApi.patch(`/flashnotes/${id}`, updates);
  return data;
};

export const deleteFlashNote = async (id: number): Promise<void> => {
  await notesApi.delete(`/flashnotes/${id}`);
};

// SRS API
export interface FlashGroup {
  id: number;
  name: string;
  group_type: 'card' | 'note';
  parent_id: number | null;
  owner_id: number;
}
export const getFlashGroups = async () => {
  const { data } = await notesApi.get('/flashgroups/');
  return data;
};
export const createFlashGroup = async (group: Partial<FlashGroup>) => {
  const { data } = await notesApi.post('/flashgroups/', group);
  return data;
};
export const updateFlashGroup = async (id: number, group: Partial<FlashGroup>) => {
  const { data } = await notesApi.patch('/flashgroups/' + id, group);
  return data;
};
export const deleteFlashGroup = async (id: number) => {
  const { data } = await notesApi.delete('/flashgroups/' + id);
  return data;
};
export const getDifficultCards = async (limit: number = 20, group_ids?: number[]) => {
  let url = '/srs/difficult?limit=' + limit;
  if (group_ids && group_ids.length > 0) {
    group_ids.forEach(id => url += '&group_ids=' + id);
  }
  const { data } = await notesApi.get(url);
  return data;
};
export const getDueItems = async (group_ids?: number[]): Promise<any[]> => {
  let url = '/srs/due';
  if (group_ids && group_ids.length > 0) {
    url += '?';
    group_ids.forEach((id, i) => url += (i > 0 ? '&' : '') + 'group_ids=' + id);
  }
  const { data } = await notesApi.get(url);
  const cards = (data.flash_cards || []).map((c: any) => ({...c, item_type: 'card'}));
  const notes = (data.flash_notes || []).map((n: any) => ({...n, item_type: 'note'}));
  return [...cards, ...notes];
};export const submitReview = async (item_id: number, item_type: 'card' | 'note', quality: number): Promise<any> => {
  const { data } = await notesApi.post(`/srs/review?item_id=` + item_id + `&item_type=` + item_type + `&quality=` + quality);
  return data;
};

