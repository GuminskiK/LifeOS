import React from 'react';
import { Panel } from 'react-resizable-panels';
import { Plus, Search, Loader2, FolderOpen } from 'lucide-react';
import { FolderTree } from './FolderTree';
import { Note, Folder } from '../../../api/notesApi';
import { NoteSplit } from './NotesTypes';

interface NotesSidebarProps {
  isLoading: boolean;
  folders: Folder[];
  notes: Note[];
  splits: NoteSplit[];
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onCreateFolder: (noteIdToMove?: number) => void;
  onMoveNote: (noteId: number, newFolderId: number | null) => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({ isLoading, folders, notes, splits, onSelectNote, onCreateNote, onCreateFolder, onMoveNote }) => {
  return (
    <Panel defaultSize={20} minSize={15} maxSize={500} className="border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button onClick={onCreateNote} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus size={20} />
            Notatka
          </button>
          <button
            onClick={() => onCreateFolder()}
            className="flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 w-10 rounded-lg justify-items-center shadow-sm"
            title="Nowy Folder"
            onDragOver={(e) => e.preventDefault()} // Allow drop
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const noteIdStr = e.dataTransfer.getData('noteId');
              if (noteIdStr) {
                onCreateFolder(parseInt(noteIdStr, 10)); // Pass noteId to create folder and move
              }
            }}
          >
            <FolderOpen size={16} />
          </button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" placeholder="Szukaj plików..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2"
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { 
          e.preventDefault(); 
          const noteIdStr = e.dataTransfer.getData('noteId');
          if (noteIdStr) {
             onMoveNote(parseInt(noteIdStr, 10), null);
          }
        }}
      >
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
            activeNoteIds={splits.flatMap(s => s.notes.map(n => n.id))} 
            onSelectNote={onSelectNote}
            onMoveNote={onMoveNote}
          />
        )}
      </div>
    </Panel>
  );
};
