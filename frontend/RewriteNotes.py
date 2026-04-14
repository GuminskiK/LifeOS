import re

file_path = r'C:\Users\krzys\Documents\VSCrepos\LifeOS\frontend\src\pages\notes\NotesMain.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State Replacement
old_states = """  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);
  const [editorStates, setEditorStates] = useState<Map<number, NoteEditorState>>(new Map());
  const [isLoading, setIsLoading] = useState(true);"""

new_states = """  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Splits representation
  interface NoteSplit { id: string; notes: Note[]; activeId: number | null; }
  const [splits, setSplits] = useState<NoteSplit[]>([{ id: 'main', notes: [], activeId: null }]);
  const [focusedSplitId, setFocusedSplitId] = useState<string>('main');
  
  const [editorStates, setEditorStates] = useState<Map<number, NoteEditorState>>(new Map());
  const [isLoading, setIsLoading] = useState(true);"""
content = content.replace(old_states, new_states)

# 2. Add lucide-react icon `SplitSquareHorizontal` or generic split icon. Just using Plus icon or replacing import.
# I will use `PanelRightOpen` or just a label if not present. Let's just use `MoreVertical` or standard text.

# 3. fetchData
content = content.replace(
    "if (fetchedNotes.length > 0 && activeNotes.length === 0)",
    "if (fetchedNotes.length > 0)"
)
content = content.replace(
    "handleSelectNote(fetchedNotes[0]);",
    "setSplits([{ id: 'main', notes: [fetchedNotes[0]], activeId: fetchedNotes[0].id }]);\n        setFocusedSplitId('main');"
)

# 4. handleSelectNote
old_select = """  const handleSelectNote = (n: Note) => {
    if (!activeNotes.find(note => note.id === n.id)) {
      setActiveNotes([...activeNotes, n]);
    }
    setCurrentNoteId(n.id);"""
new_select = """  const handleSelectNote = (n: Note) => {
    setSplits(prev => {
      const splitIndex = prev.findIndex(s => s.id === focusedSplitId);
      if (splitIndex === -1) return prev;
      const split = prev[splitIndex];
      const newNotes = split.notes.find(note => note.id === n.id) ? split.notes : [...split.notes, n];
      const newSplits = [...prev];
      newSplits[splitIndex] = { ...split, notes: newNotes, activeId: n.id };
      return newSplits;
    });"""
content = content.replace(old_select, new_select)

# 5. handleSaveNote
content = content.replace(
    "setActiveNotes(prev => prev.map(n => n.id === updated.id ? updated : n));",
    """setSplits(prev => prev.map(s => ({
        ...s,
        notes: s.notes.map(n => n.id === updated.id ? updated : n)
      })));"""
)

# 6. handleDeleteNote
content = content.replace(
    "removeFromActiveNotes(noteId);",
    """setSplits(prev => prev.map(s => {
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
      }));"""
)

# 7. removeFromActiveNotes
old_remove = """  const removeFromActiveNotes = (noteId: number, e?: React.MouseEvent) => {
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
  };"""

new_remove = """  const removeFromActiveNotes = (splitId: string, noteId: number, e?: React.MouseEvent) => {
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
      newSplits.splice(splitIndex + 1, 0, { id: newSplitId, notes: [note], activeId: note.id });
      return newSplits;
    });
  };

  const closeSplit = (splitId: string) => {
    setSplits(prev => {
      if (prev.length <= 1) return prev; // Don't close the last split
      const filtered = prev.filter(s => s.id !== splitId);
      if (focusedSplitId === splitId) {
        setFocusedSplitId(filtered[0].id);
      }
      return filtered;
    });
  };"""

content = content.replace(old_remove, new_remove)

# 8. activeNoteIds mappings
content = content.replace(
    "activeNoteIds={activeNotes.map(n => n.id)}",
    "activeNoteIds={splits.flatMap(s => s.notes.map(n => n.id))}"
)

# 9. Replacing the Panel defaultSize={80} up to bottom
import re
match = re.search(r'<Panel defaultSize=\{80\}.*$', content, re.DOTALL)
if match:
    replacement_panel = """<Panel defaultSize={80} minSize={15} className="flex min-w-0 bg-white">
        {splits.some(s => s.notes.length > 0) ? (
          <Group orientation="horizontal" className="flex-1 w-full h-full">
            {splits.map((split, splitIndex) => {
               if (split.notes.length === 0 && splits.length > 1) return null; // Wait for state cleanup
               
               return (
                <React.Fragment key={split.id}>
                  {splitIndex > 0 && splits[splitIndex - 1].notes.length > 0 && (
                    <Separator className="w-1 bg-gray-200 hover:bg-blue-400 active:bg-blue-500 cursor-col-resize transition-colors" />
                  )}
                  
                  {split.notes.length > 0 ? (
                    <Panel className={`flex flex-col min-w-0 transition-opacity ${focusedSplitId === split.id ? '' : 'opacity-80'}`} onClick={() => setFocusedSplitId(split.id)}>
                      
                      <div className={`flex bg-gray-100 border-b border-gray-200 overflow-x-auto select-none ${focusedSplitId === split.id ? 'bg-blue-50/30' : ''}`}>
                        {split.notes.map((note) => (
                          <div key={note.id} className="flex flex-shrink-0 items-center border-r border-gray-200 relative group">
                            <div 
                              onClick={() => {
                                setFocusedSplitId(split.id);
                                setSplits(prev => prev.map(s => s.id === split.id ? { ...s, activeId: note.id } : s));
                              }}
                              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors w-48 ${
                                split.activeId === note.id
                                  ? (focusedSplitId === split.id ? 'bg-white border-t-2 border-t-blue-500 text-blue-700' : 'bg-gray-50 border-t-2 border-t-blue-300 text-blue-600') 
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <FileText size={14} className={split.activeId === note.id ? "text-blue-600" : "text-gray-400"} />
                              <span className="truncate flex-1">{note.name || 'Bez tytułu'}</span>
                              
                              {split.activeId === note.id && (
                                <button
                                  onClick={(e) => openSplitRight(split.id, note, e)}
                                  className="p-0.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-blue-500 mr-1"
                                  title="Otwórz obok"
                                >
                                  <MoreVertical size={14} />
                                </button>
                              )}

                              <button
                                onClick={(e) => removeFromActiveNotes(split.id, note.id, e)}
                                className={`p-0.5 rounded-md hover:bg-gray-200 transition-colors ${split.activeId === note.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                title="Zamknij (Ctrl+W)"
                              >
                                <X size={14} className="text-gray-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex-1 flex flex-col min-w-0 bg-white">
                        {split.notes.filter(n => n.id === split.activeId).map((note) => {
                          const state = editorStates.get(note.id);
                          return (
                            <React.Fragment key={note.id}>
                                {state ? (
                                  <>
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shadow-sm z-10 relative">
                                      <input 
                                        type="text" 
                                        value={state.note.name} 
                                        onChange={(e) => handleUpdateNoteName(note.id, e.target.value)}
                                        className="text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none flex-1 truncate" 
                                        placeholder="Tytuł notatki..."
                                      />
                                      <div className="flex items-center gap-2 px-1 relative">
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
                                        {splits.length > 1 && (
                                           <button 
                                             onClick={() => closeSplit(split.id)}
                                             className="ml-2 flex items-center justify-center p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded"
                                             title="Zamknij cały pion podziału"
                                           >
                                             <X size={20} />
                                           </button>
                                        )}
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
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </Panel>
                  ) : (
                    <Panel className="flex flex-col items-center justify-center bg-gray-50/50 min-w-0" onClick={() => setFocusedSplitId(split.id)}>
                       <div className="text-gray-400 mb-4"><FolderIcon size={48} opacity={0.5} /></div>
                       <p className="text-gray-500 font-medium">Brak otwartych notatek w tym oknie</p>
                       {splits.length > 1 && <button onClick={() => closeSplit(split.id)} className="mt-4 px-4 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 font-medium text-sm">Zamknij to okno</button>}
                    </Panel>
                  )}
                </React.Fragment>
               );
            })}
          </Group>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
            <FolderIcon size={64} className="mb-4 text-gray-300" />
            <p className="text-xl font-medium text-gray-500">Brak otwartych notatek</p>
            <p className="text-sm mt-2 text-gray-400">Wybierz notatkę z folderu po lewej stronie, aby rozpocząć pracę.</p>
          </div>
        )}
      </Panel>
    </Group>
  );
};
"""
    content = content[:match.start()] + replacement_panel

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("NotesMain rewritten!")
