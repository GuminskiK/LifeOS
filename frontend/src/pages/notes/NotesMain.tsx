import React, { useState, useEffect } from 'react';
import { Group } from 'react-resizable-panels';
import * as api from '../../api/notesApi';
import { Note, Folder } from '../../api/notesApi';
import { NotesSidebar } from './components/NotesSidebar';
import { NotesWorkspace } from './components/NotesWorkspace';
import { NoteSplit, NoteEditorState } from './components/NotesTypes';

export const NotesMain: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const [splits, setSplits] = useState<NoteSplit[]>([{ id: 'main', notes: [], activeId: null }]);
  const [focusedSplitId, setFocusedSplitId] = useState<string>('main');
  
  const [editorStates, setEditorStates] = useState<Map<number, NoteEditorState>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedFolders, fetchedNotes] = await Promise.all([
        api.fetchFolders().catch(() => []),
        api.fetchNotes().catch(() => [])
      ]);
      setFolders(fetchedFolders);
      setNotes(fetchedNotes);
      
      if (fetchedNotes.length > 0) {
        setSplits([{ id: 'main', notes: [fetchedNotes[0]], activeId: fetchedNotes[0].id }]);
        setFocusedSplitId('main');
      }
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNote = (n: Note) => {
    setSplits(prev => {
      const splitIndex = prev.findIndex(s => s.id === focusedSplitId);
      if (splitIndex === -1) return prev;
      const split = prev[splitIndex];
      const newNotes = split.notes.find(note => note.id === n.id) ? split.notes : [...split.notes, n];
      const newSplits = [...prev];
      newSplits[splitIndex] = { ...split, notes: newNotes, activeId: n.id };
      return newSplits;
    });

    if (!editorStates.has(n.id)) {
      const htmlContent = typeof n.content === 'object' && n.content !== null && 'html' in n.content 
        ? (n.content as any).html 
        : n.content?.toString() || '';
      
      setEditorStates(prev => new Map(prev).set(n.id, {
        note: n,
        content: htmlContent,
        isSaving: false
      }));
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await api.createNote("Nowa Notatka", null, { html: "<p>Zacznij pisać...</p>" });
      setNotes([...notes, newNote]);
      handleSelectNote(newNote);
    } catch (error) {
      console.error("Błąd tworzenia notatki:", error);
    }
  };

  const handleUpdateEditorContent = (noteId: number, content: string) => {
    setEditorStates(prev => {
      const state = prev.get(noteId);
      if (state) {
        return new Map(prev).set(noteId, { ...state, content });
      }
      return prev;
    });
  };

  const handleUpdateNoteName = (noteId: number, newName: string) => {
    setEditorStates(prev => {
      const state = prev.get(noteId);
      if (state) {
        return new Map(prev).set(noteId, { 
          ...state, 
          note: { ...state.note, name: newName } 
        });
      }
      return prev;
    });
  };

  const handleSaveNote = async (noteId: number) => {
    const state = editorStates.get(noteId);
    if (!state) return;

    setEditorStates(prev => {
      const current = prev.get(noteId);
      if (current) {
        return new Map(prev).set(noteId, { ...current, isSaving: true });
      }
      return prev;
    });

    try {
      const updated = await api.updateNote(noteId, { 
        name: state.note.name, 
        content: { html: state.content } 
      });
      
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      setSplits(prev => prev.map(s => ({
        ...s,
        notes: s.notes.map(n => n.id === updated.id ? updated : n)
      })));
      
      setEditorStates(prev => {
        const newMap = new Map(prev);
        const currentState = newMap.get(noteId);
        if (currentState) {
          newMap.set(noteId, { ...currentState, note: updated, isSaving: false });
        }
        return newMap;
      });
    } catch (error) {
      console.error("Błąd zapisu:", error);
      setEditorStates(prev => {
        const newMap = new Map(prev);
        const currentState = newMap.get(noteId);
        if (currentState) {
          newMap.set(noteId, { ...currentState, isSaving: false });
        }
        return newMap;
      });
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    const state = editorStates.get(noteId);
    if (!state) return;
    if (!window.confirm(`Czy na pewno chcesz usunąć "${state.note.name}"?`)) return;
    
    try {
      await api.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      setSplits(prev => prev.map(s => {
        if (!s.notes.find(n => n.id === noteId)) return s;
        const newNotes = s.notes.filter(n => n.id !== noteId);
        let newActiveId = s.activeId;
        if (s.activeId === noteId) {
          if (newNotes.length > 0) {
            const index = s.notes.findIndex(n => n.id === noteId);
            newActiveId = newNotes[Math.min(index, newNotes.length - 1)].id;
          } else {
            newActiveId = null;
          }
        }
        return { ...s, notes: newNotes, activeId: newActiveId };
      }));
    } catch (error) {
      console.error("Błąd podczas usuwania notatki:", error);
    }
  };

  const removeFromActiveNotes = (splitId: string, noteId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setSplits(prev => {
      let newSplits = prev.map(split => {
        if (split.id !== splitId) return split;
        
        const newNotes = split.notes.filter(n => n.id !== noteId);
        let newActiveId = split.activeId;
        
        if (split.activeId === noteId) {
          if (newNotes.length > 0) {
            const index = split.notes.findIndex(n => n.id === noteId);
            const nextNote = newNotes[Math.min(index, newNotes.length - 1)];
            newActiveId = nextNote.id;
          } else {
            newActiveId = null;
          }
        }
        return { ...split, notes: newNotes, activeId: newActiveId };
      });
      
      return newSplits;
    });
  };

  const openSplitRight = (splitId: string, note: Note, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSplits(prev => {
      const splitIndex = prev.findIndex(s => s.id === splitId);
      if (splitIndex === -1) return prev;
      
      const newSplitId = `split-${Date.now()}`;
      setFocusedSplitId(newSplitId);
      
      const newSplits = [...prev];
      
      const currentSplit = { ...newSplits[splitIndex] };
      currentSplit.notes = currentSplit.notes.filter(n => n.id !== note.id);
      
      if (currentSplit.activeId === note.id) {
         if (currentSplit.notes.length > 0) {
            const idx = newSplits[splitIndex].notes.findIndex(n => n.id === note.id);
            currentSplit.activeId = currentSplit.notes[Math.min(idx, currentSplit.notes.length - 1)].id;
         } else {
            currentSplit.activeId = null;
         }
      }
      newSplits[splitIndex] = currentSplit;

      newSplits.splice(splitIndex + 1, 0, { id: newSplitId, notes: [note], activeId: note.id });
      return newSplits;
    });
  };

  const closeSplit = (splitId: string) => {
    setSplits(prev => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter(s => s.id !== splitId);
      if (focusedSplitId === splitId) {
        setFocusedSplitId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <Group orientation="horizontal" className="bg-white w-full h-full rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <NotesSidebar 
        isLoading={isLoading} 
        folders={folders} 
        notes={notes} 
        splits={splits} 
        onSelectNote={handleSelectNote} 
        onCreateNote={handleCreateNote} 
      />
      <NotesWorkspace 
        splits={splits}
        editorStates={editorStates}
        focusedSplitId={focusedSplitId}
        setFocusedSplitId={setFocusedSplitId}
        setSplits={setSplits}
        openSplitRight={openSplitRight}
        closeSplit={closeSplit}
        removeFromActiveNotes={removeFromActiveNotes}
        handleUpdateNoteName={handleUpdateNoteName}
        handleDeleteNote={handleDeleteNote}
        handleSaveNote={handleSaveNote}
        handleUpdateEditorContent={handleUpdateEditorContent}
      />
    </Group>
  );
};
