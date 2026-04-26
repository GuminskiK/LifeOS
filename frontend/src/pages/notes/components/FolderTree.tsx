import React, { useState } from 'react';
import { FileText, Folder as FolderIcon, FolderOpen } from 'lucide-react';
import { Note, Folder } from '../../../api/notesApi';

export const FolderTree: React.FC<{ 
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
