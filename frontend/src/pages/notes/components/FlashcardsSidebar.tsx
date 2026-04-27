import React from 'react';
import { ChevronDown, Folder as FolderIcon, Plus, X } from 'lucide-react';
import { FlashGroup, FlashCard, FlashNote } from '../../../api/notesApi';

interface FlashcardsSidebarProps {
  activeType: 'card' | 'note';
  setActiveType: (type: 'card' | 'note') => void;
  selectedGroupId: number | null;
  setSelectedGroupId: (id: number | null) => void;
  groups: FlashGroup[];
  cards: FlashCard[];
  notes: FlashNote[];
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  handleCreateGroup: (parentId: number | null) => void;
  getGroupDescendants: (groupId: number) => number[];
}

export const FlashcardsSidebar: React.FC<FlashcardsSidebarProps> = ({
  activeType,
  setActiveType,
  selectedGroupId,
  setSelectedGroupId,
  groups,
  cards,
  notes,
  newGroupName,
  setNewGroupName,
  handleCreateGroup,
  getGroupDescendants
}) => {
  const renderTree = (parentId: number | null, level: number = 0) => {
    const children = groups.filter(g => g.group_type === activeType && g.parent_id === parentId);
    if (children.length === 0) return null;
    
    return (
      <ul className={`flex flex-col gap-1 w-full ${level > 0 ? 'pl-4 border-l border-slate-700 ml-2 mt-1' : ''}`}>
        {children.map(g => {
          const isSelected = selectedGroupId === g.id;
          const des = getGroupDescendants(g.id);
          const now = new Date().toISOString();
          let groupItems = activeType === 'card' 
            ? cards.filter(c => c.group_id && des.includes(c.group_id)) 
            : notes.filter(n => n.group_id && des.includes(n.group_id));
          const totalCount = groupItems.length;
          const dueCount = groupItems.filter(i => i.is_active && i.next_review && i.next_review <= now).length;
          const learnedCount = totalCount - dueCount;
          
          return (
            <li key={g.id} className="w-full">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGroupId(g.id);
                }}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600 shadow-md text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
              >
                <div className="flex items-center gap-2 max-w-[65%] truncate">
                  <FolderIcon size={16} className={isSelected ? "shrink-0 text-indigo-200" : "shrink-0 text-indigo-400"} />
                  <span className="truncate pr-2 font-medium" title={g.name}>{g.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold">
                  {totalCount > 0 && <span className="bg-slate-700 text-slate-300 px-1.5 rounded-sm" title="Wszystkie">{totalCount}</span>}
                  {dueCount > 0 && (
                    <span className="px-1.5 rounded-sm bg-green-500/20 text-green-400" title="Do nauki">
                      {dueCount}
                    </span>
                  )}
                  {learnedCount > 0 && totalCount > dueCount && (
                    <span className="px-1.5 rounded-sm bg-blue-500/20 text-blue-400" title="Nauczone">
                      {learnedCount}
                    </span>
                  )}
                </div>
              </div>
              {renderTree(g.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-950 p-4 flex flex-col shrink-0">
      <div className="relative mb-6">
        <select 
          value={activeType} 
          onChange={(e) => {
            setActiveType(e.target.value as 'card' | 'note');
            setSelectedGroupId(null);
          }}
          className="w-full bg-slate-800 text-slate-200 text-lg font-bold p-4 pr-10 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer shadow-inner"
        >
          <option value="card">FlashCards (Fiszki)</option>
          <option value="note">FlashNotes</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={20} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 pl-2">
        <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Foldery / Grupy</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 select-none custom-scrollbar">
        {groups.filter(g => g.group_type === activeType).length === 0 ? (
          <div className="text-sm text-slate-500 text-center mt-6 p-4 border border-dashed border-slate-700 rounded-xl">
            Brak zdefiniowanych grup. Utwórz pierwszą poniżej.
          </div>
        ) : (
          renderTree(null)
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-slate-800">
        <div className="relative">
          <input 
            value={newGroupName} onChange={e => setNewGroupName(e.target.value)} 
            placeholder={selectedGroupId ? "Dodaj do wybranej..." : "Dodaj główną grupę..."} 
            className="w-full bg-slate-900 text-sm py-3 px-4 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500" 
            onKeyDown={e => e.key === 'Enter' && handleCreateGroup(selectedGroupId)}
          />
          {newGroupName && (
            <button 
              onClick={() => handleCreateGroup(selectedGroupId)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white p-1 hover:bg-indigo-600 rounded-lg transition-colors"
              title="Dodaj"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
        {selectedGroupId && (
           <button onClick={() => setSelectedGroupId(null)} className="text-xs text-slate-500 hover:text-indigo-400 w-full text-center py-2 flex justify-center gap-1">
             <X size={14}/> Odznacz (by dodać w Głównej)
           </button>
        )}
      </div>
    </div>
  );
};
