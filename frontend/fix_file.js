const fs = require('fs');
const content = \import React, { useState } from 'react';
import { FileText, Folder as FolderIcon, FolderOpen, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Note, Folder } from '../../../api/notesApi';

export const FolderTree: React.FC<{ 
  folderId: number | null; 
  folders: Folder[]; 
  notes: Note[]; 
  activeNoteIds: number[];
  onSelectNote: (note: Note) => void;
  onMoveNote: (noteId: number, newFolderId: number | null) => void;
}> = ({ folderId, folders, notes, activeNoteIds, onSelectNote, onMoveNote }) => {
  const [isOpen, setIsOpen] = useState(folderId === null);
  const childFolders = folders.filter(f => f.parent_id === folderId);
  const childNotes = notes.filter(n => n.folder_id === folderId);

  const handleDragStart = (e: React.DragEvent, noteId: number) => {
    e.dataTransfer.setData('noteId', noteId.toString());
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const noteIdStr = e.dataTransfer.getData('noteId');
    if (noteIdStr) {
      onMoveNote(parseInt(noteIdStr, 10), folderId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // necessary to allow dropping
  };

  if (folderId === null) {
    return (
      <div className="space-y-0.5" onDrop={handleDrop} onDragOver={handleDragOver}>
        {childFolders.map(f => (
          <FolderTree key={f.id} folderId={f.id} folders={folders} notes={notes} activeNoteIds={activeNoteIds} onSelectNote={onSelectNote} onMoveNote={onMoveNote} />
        ))}
        {childNotes.map(n => (
          <div 
            key={n.id} 
            draggable
            onDragStart={(e) => handleDragStart(e, n.id)}
            onClick={() => onSelectNote(n)}
            className={\\\lex items-center gap-1.5 p-1.5 rounded cursor-pointer text-sm font-medium transition-colors \\\\\\}
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
    <div className="space-y-0.5" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1.5 hover:bg-gray-200 rounded cursor-pointer text-gray-800 font-medium text-sm select-none group"
      >
        {isOpen ? <FolderOpen size={16} className="text-blue-500" /> : <FolderIcon size={16} className="text-gray-500" />}
        <span className="truncate flex-1">{currentFolder?.name || 'Folder'}</span>
      </div>
      
      {isOpen && (
        <div className="pl-4 space-y-0.5 border-l border-gray-200 ml-2 mt-1">
          {childFolders.map(f => (
            <FolderTree key={f.id} folderId={f.id} folders={folders} notes={notes} activeNoteIds={activeNoteIds} onSelectNote={onSelectNote} onMoveNote={onMoveNote} />
          ))}
          {childNotes.map(n => (
            <div 
              key={n.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, n.id)}
              onClick={() => onSelectNote(n)}
              className={\\\lex items-center gap-1.5 p-1.5 rounded cursor-pointer text-sm transition-colors \\\\\\}
            >
              <FileText size={16} className={activeNoteIds.includes(n.id) ? "text-blue-600" : "text-gray-400"} />
              <span className="truncate">{n.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};\;
fs.writeFileSync('src/pages/notes/components/FolderTree.tsx', content);
