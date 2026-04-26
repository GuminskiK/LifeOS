import { Note, Folder } from '../../../api/notesApi';

export interface NoteSplit { 
  id: string; 
  notes: Note[]; 
  activeId: number | null; 
}

export interface NoteEditorState {
  note: Note;
  content: string;
  isSaving: boolean;
}
