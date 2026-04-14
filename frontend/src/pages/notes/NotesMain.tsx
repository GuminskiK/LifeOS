import React, { useState, useEffect } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { LifeOSEditor } from '../../components/editor/LifeOSEditor';
import { Save, Plus, FileText, Search, Folder as FolderIcon, FolderOpen, MoreVertical, Loader2, Trash2, X } from 'lucide-react';
import * as api from '../../api/notesApi';
import { Note, Folder } from '../../api/notesApi';

const FolderTree: React.FC<{ 
  folderId: number | null; 
  folders: Folder[]; 
  notes: Note[]; 
  activeNoteIds: number[];
  onSelectNote: (note: Note) => void;
}> = ({ folderId, folders, notes, activeNoteIds, onSelectNote }) => {
  const [isOpen, setIsOpen] = useState(folderId === null);
  const childFolders = folders.filter(f => f.parent_id === folderId);
  const childNotes = notes.filter(n => n.folder_id === folderId);

  if (folderId === null) {
    return (
      <div className="space-y-0.5">
        {childFolders.map(f => (
          <FolderTree key={f.id} folderId={f.id} folders={folders} notes={notes} activeNoteIds={activeNoteIds} onSelectNote={onSelectNote} />
        ))}
        {childNotes.map(n => (
          <div 
            key={n.id} 
            onClick={() => onSelectNote(n)}
            className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer text-sm font-medium ${activeNoteIds.includes(n.id) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <FileText size={16} className={activeNoteIds.includes(n.id) ? "text-blue-600" : "text-gray-400"} />
            <span className="truncate">{n.name}</span>
          </div>
        ))}
      </div>
    );
  }

  const currentFolder = folders.find(f => f.id === folderId);

  return (
    <div className="space-y-0.5">
      <div 
        className="flex items-center gap-1.5 p-1.5 hover:bg-gray-200 rounded cursor-pointer text-gray-800 font-medium text-sm select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FolderOpen size={16} className="text-blue-500" /> : <FolderIcon size={16} className="text-gray-500" />}
        <span className="truncate">{currentFolder?.name || 'Folder'}</span>
      </div>
      {isOpen && (
        <div className="pl-4 space-y-0.5 border-l border-gray-200 ml-2 mt-1">
          {childFolders.map(f => (
            <FolderTree key={f.id} folderId={f.id} folders={folders} notes={notes} activeNoteIds={activeNoteIds} onSelectNote={onSelectNote} />
          ))}
          {childNotes.map(n => (
            <div 
              key={n.id} 
              onClick={() => onSelectNote(n)}
              className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer text-sm ${activeNoteIds.includes(n.id) ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <FileText size={16} className={activeNoteIds.includes(n.id) ? "text-blue-600" : "text-gray-400"} />
              <span className="truncate">{n.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface NoteEditorState {
  note: Note;
  content: string;
  isSaving: boolean;
}

export const NotesMain: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);
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
      
      if (fetchedNotes.length > 0 && activeNotes.length === 0) {
        handleSelectNote(fetchedNotes[0]);
      }
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNote = (n: Note) => {
    if (!activeNotes.find(note => note.id === n.id)) {
      setActiveNotes([...activeNotes, n]);
    }
    setCurrentNoteId(n.id);

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
      setActiveNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      
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
      removeFromActiveNotes(noteId);
    } catch (error) {
      console.error("Błąd podczas usuwania notatki:", error);
    }
  };

  const removeFromActiveNotes = (noteId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setActiveNotes(prev => {
      const newActive = prev.filter(n => n.id !== noteId);
      
      if (currentNoteId === noteId) {
        if (newActive.length > 0) {
          const index = prev.findIndex(n => n.id === noteId);
          const nextNote = newActive[Math.min(index, newActive.length - 1)];
          setCurrentNoteId(nextNote.id);
        } else {
          setCurrentNoteId(null);
        }
      }
      
      return newActive;
    });

    setEditorStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(noteId);
      return newMap;
    });
  };

  return (
    <Group orientation="horizontal" className="bg-white w-full h-full rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      <Panel defaultSize={20} minSize={15} maxSize={500} className="border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button onClick={handleCreateNote} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus size={20} />
            Nowa Notatka
          </button>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Szukaj plików..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="animate-spin mb-2" size={24} />
              <span className="text-sm">Ładowanie backendu...</span>
            </div>
          ) : (
            <FolderTree 
              folderId={null} 
              folders={folders} 
              notes={notes} 
              activeNoteIds={activeNotes.map(n => n.id)} 
              onSelectNote={handleSelectNote} 
            />
          )}
        </div>
      </Panel>

      <Separator className="w-1 bg-gray-200 hover:bg-blue-400 active:bg-blue-500 cursor-col-resize transition-colors flex flex-col justify-center items-center">
        <MoreVertical size={12} className="text-gray-400" />
      </Separator>

      <Panel defaultSize={80} minSize={15} className="flex flex-col min-w-0 bg-white">
        {activeNotes.length > 0 ? (
          <>
            <div className="flex bg-gray-100 border-b border-gray-200 overflow-x-auto select-none">
              {activeNotes.map((note) => (
                <div key={note.id} className="flex flex-shrink-0 items-center border-r border-gray-200 relative group">
                  <div 
                    onClick={() => setCurrentNoteId(note.id)}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors w-48 ${
                      currentNoteId === note.id
                        ? 'bg-white border-t-2 border-t-blue-500 text-blue-700' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FileText size={14} className={currentNoteId === note.id ? "text-blue-600" : "text-gray-400"} />
                    <span className="truncate flex-1">{note.name || 'Bez tytułu'}</span>
                    
                    <button
                      onClick={(e) => removeFromActiveNotes(note.id, e)}
                      className={`p-0.5 rounded-md hover:bg-gray-200 transition-colors ${currentNoteId === note.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      title="Zamknij (Ctrl+W)"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Group orientation="horizontal" className="flex-1">
              {activeNotes.filter(n => n.id === currentNoteId).map((note) => {
                const state = editorStates.get(note.id);
                return (
                  <React.Fragment key={note.id}>
                    <Panel defaultSize={100} minSize={20} className="flex flex-col min-w-0">
                      {state ? (
                        <>
                          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                            <input 
                              type="text" 
                              value={state.note.name} 
                              onChange={(e) => handleUpdateNoteName(note.id, e.target.value)}
                              className="text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none flex-1 truncate" 
                              placeholder="Tytuł notatki..."
                            />
                            <div className="flex items-center gap-2 px-1">
                              <button 
                                onClick={() => { navigator.clipboard.writeText(note.id.toString()) }} 
                                className="flex items-center justify-center px-2 py-1 text-xs text-slate-600 font-bold bg-slate-100 border border-slate-300 shadow-sm rounded-lg hover:bg-slate-200 active:scale-95 transition-all" 
                                title="Skopiuj ID Notatki"
                              >
                                #{note.id}
                              </button>
                              <button 
                                onClick={() => handleDeleteNote(note.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-transparent hover:border-red-200"
                                title="Usuń notatkę trwale"
                              >
                                <Trash2 size={16} /> Usuń
                              </button>
                              <button 
                                onClick={() => handleSaveNote(note.id)}
                                disabled={state.isSaving}
                                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm border border-blue-700 disabled:opacity-70 disabled:bg-blue-400"
                                title="Zapisz zmiany (Ctrl+S)"
                              >
                                {state.isSaving ? <Loader2 size={16} className="animate-spin text-white" /> : <Save size={16} className="text-white" />}
                                {state.isSaving ? 'Zapisywanie...' : 'Zapisz'}
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 overflow-hidden p-0 relative">
                            <LifeOSEditor 
                              key={`editor-${note.id}`} 
                              content={state.content} 
                              onChange={(content) => handleUpdateEditorContent(note.id, content)} 
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Loader2 className="animate-spin" size={24} />
                        </div>
                      )}
                    </Panel>
                  </React.Fragment>
                );
              })}
            </Group>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText size={48} className="mb-4 text-gray-300 opacity-50" />
            <h2 className="text-xl font-medium text-gray-500">Brak otwartej notatki</h2>
            <p className="text-sm mt-2">Wybierz notatkę z lewego panelu lub utwórz nową.</p>
          </div>
        )}
      </Panel>
      
    </Group>
  );
};

