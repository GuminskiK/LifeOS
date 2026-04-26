import React from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { MoreVertical, Folder as FolderIcon, FileText, X, Trash2, Save, Loader2 } from 'lucide-react';
import { LifeOSEditor } from '../../../components/editor/LifeOSEditor';
import { Note } from '../../../api/notesApi';
import { NoteSplit, NoteEditorState } from './NotesTypes';

interface NotesWorkspaceProps {
  splits: NoteSplit[];
  editorStates: Map<number, NoteEditorState>;
  focusedSplitId: string;
  setFocusedSplitId: (id: string) => void;
  setSplits: React.Dispatch<React.SetStateAction<NoteSplit[]>>;
  openSplitRight: (splitId: string, note: Note, e?: React.MouseEvent) => void;
  closeSplit: (splitId: string) => void;
  removeFromActiveNotes: (splitId: string, noteId: number, e?: React.MouseEvent) => void;
  handleUpdateNoteName: (noteId: number, newName: string) => void;
  handleDeleteNote: (noteId: number) => void;
  handleSaveNote: (noteId: number) => void;
  handleUpdateEditorContent: (noteId: number, content: string) => void;
}

export const NotesWorkspace: React.FC<NotesWorkspaceProps> = ({
  splits,
  editorStates,
  focusedSplitId,
  setFocusedSplitId,
  setSplits,
  openSplitRight,
  closeSplit,
  removeFromActiveNotes,
  handleUpdateNoteName,
  handleDeleteNote,
  handleSaveNote,
  handleUpdateEditorContent
}) => {
  return (
    <>
      <Separator className="w-1 bg-gray-200 hover:bg-blue-400 active:bg-blue-500 cursor-col-resize transition-colors flex flex-col justify-center items-center">
        <MoreVertical size={12} className="text-gray-400" />
      </Separator>

      <Panel defaultSize={80} minSize={15} className="flex min-w-0 bg-white">
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
    </>
  );
};
