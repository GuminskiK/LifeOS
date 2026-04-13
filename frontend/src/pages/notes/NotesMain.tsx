import React, { useState, useEffect } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { LifeOSEditor } from '../../components/editor/LifeOSEditor';
import { Save, Plus, FileText, Search, Folder as FolderIcon, FolderOpen, MoreVertical, Loader2, Trash2 } from 'lucide-react';
import * as api from '../../api/notesApi';
import { Note, Folder } from '../../api/notesApi';

const FolderTree: React.FC<{ 
  folderId: number | null; 
  folders: Folder[]; 
  notes: Note[]; 
  activeNoteId: number | null;
  onSelectNote: (note: Note) => void;
}> = ({ folderId, folders, notes, activeNoteId, onSelectNote }) => {
  const [isOpen, setIsOpen] = useState(folderId === null);
  const childFolders = folders.filter(f => f.parent_id === folderId);
  const childNotes = notes.filter(n => n.folder_id === folderId);

  if (folderId === null) {
    return (
      <div className="space-y-0.5">
        {childFolders.map(f => (
          <FolderTree key={f.id} folderId={f.id} folders={folders} notes={notes} activeNoteId={activeNoteId} onSelectNote={onSelectNote} />
        ))}
        {childNotes.map(n => (
          <div 
            key={n.id} 
            onClick={() => onSelectNote(n)}
            className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer text-sm font-medium ${activeNoteId === n.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <FileText size={16} className={activeNoteId === n.id ? "text-blue-600" : "text-gray-400"} />
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
            <FolderTree key={f.id} folderId={f.id} folders={folders} notes={notes} activeNoteId={activeNoteId} onSelectNote={onSelectNote} />
          ))}
          {childNotes.map(n => (
            <div 
              key={n.id} 
              onClick={() => onSelectNote(n)}
              className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer text-sm ${activeNoteId === n.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <FileText size={16} className={activeNoteId === n.id ? "text-blue-600" : "text-gray-400"} />
              <span className="truncate">{n.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NotesMain: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [noteName, setNoteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      
      if (fetchedNotes.length > 0 && !activeNote) {
        handleSelectNote(fetchedNotes[0]);
      }
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNote = (n: Note) => {
    setActiveNote(n);
    setNoteName(n.name);
    const htmlContent = typeof n.content === 'object' && n.content !== null && 'html' in n.content 
      ? (n.content as any).html 
      : n.content?.toString() || '';
    setEditorContent(htmlContent);
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

  const handleSaveNote = async () => {
    if (!activeNote) return;
    setIsSaving(true);
    try {
      const updated = await api.updateNote(activeNote.id, { 
        name: noteName, 
        content: { html: editorContent } 
      });
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      setActiveNote(updated);
    } catch (error) {
      console.error("Błąd zapisu:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!activeNote) return;
    if (!window.confirm(`Czy na pewno chcesz usunąć "${activeNote.name}"?`)) return;
    
    try {
      await api.deleteNote(activeNote.id);
      setNotes(prev => prev.filter(n => n.id !== activeNote.id));
      setActiveNote(null);
      setEditorContent('');
      setNoteName('');
    } catch (error) {
      console.error("Błąd podczas usuwania notatki:", error);
    }
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
              activeNoteId={activeNote?.id || null} 
              onSelectNote={handleSelectNote} 
            />
          )}
        </div>
      </Panel>

      <Separator className="w-1 bg-gray-200 hover:bg-blue-400 active:bg-blue-500 cursor-col-resize transition-colors flex flex-col justify-center items-center">
        <MoreVertical size={12} className="text-gray-400" />
      </Separator>

      <Panel defaultSize={80} minSize={15} className="flex flex-col min-w-0 bg-white">
        {activeNote ? (
          <>
            <div className="flex bg-gray-100 border-b border-gray-200 overflow-x-auto select-none">
              <div className="px-4 py-2 border-r border-gray-200 bg-white border-t-2 border-t-blue-500 text-sm font-medium text-blue-700 flex items-center gap-2 cursor-pointer relative top-[1px]">
                <FileText size={14} />
                {noteName}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <input 
                type="text" 
                value={noteName} 
                onChange={(e) => setNoteName(e.target.value)}
                className="text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none flex-1 truncate" 
                placeholder="Tytuł notatki..."
              />
              <div className="flex items-center gap-2 px-1">
                <button 
                  onClick={() => { if (activeNote?.id) navigator.clipboard.writeText(activeNote.id.toString()) }} 
                  className="flex items-center justify-center px-3 py-1.5 text-xs text-slate-600 font-bold bg-slate-100 border border-slate-300 shadow-sm rounded-lg hover:bg-slate-200 active:scale-95 transition-all" 
                  title="Skopiuj ID Notatki"
                >
                  Skopiuj ID: #{activeNote?.id}
                </button>
                <button 
                  onClick={handleDeleteNote}
                  className="flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                  title="Usuń notatkę"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm border border-gray-300 disabled:opacity-50"
                  title="Zapisz zmiany (Ctrl+S)"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Save size={16} className="text-blue-600" />}
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-0 relative">
              <LifeOSEditor key={`editor-${activeNote.id}`} content={editorContent} onChange={setEditorContent} />
            </div>
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

