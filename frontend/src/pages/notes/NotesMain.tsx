import React, { useState } from 'react';
import { LifeOSEditor } from '../../components/editor/LifeOSEditor';
import { Save, Plus, FileText, Search } from 'lucide-react';

export const NotesMain: React.FC = () => {
  const [content, setContent] = useState(`
    <h1>Przykładowa Notatka</h1>
    <p>To jest Twój zmodyfikowany edytor <strong>tiptap</strong>.</p>
    <p>Możesz tu dodawać tabele bez nagłówków, osadzać wideo, zdjęcia (i układać je w dwa obok siebie), oraz tworzyć <span data-type="note-link" noteId="123" title="Strona Główna"></span> wewnętrzne odnośniki.</p>
    <br/>
    <p>Spróbuj kliknąć na przyciski w pasku edytora nad tym tekstem!</p>
  `);

  return (
    <div className="flex bg-white h-[calc(100vh-6rem)] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Lewa kolumna: Lista Notatek */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
            <Plus size={20} />
            Nowa Notatka
          </button>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Szukaj notatek..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer">
              <FileText size={18} />
              <span className="font-medium text-sm truncate">Przykładowa Notatka</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
              <FileText size={18} />
              <span className="font-medium text-sm truncate">Spotkanie - projekt 2026</span>
            </div>
            <div className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
              <FileText size={18} />
              <span className="font-medium text-sm truncate">Szkic kampanii YT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prawa kolumna: Edytor */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <input 
            type="text" 
            defaultValue="Przykładowa Notatka" 
            className="text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none flex-1 truncate" 
          />
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ml-4 shrink-0">
            <Save size={18} />
            Zapisz
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-6 relative">
          <LifeOSEditor content={content} onChange={setContent} />
        </div>
      </div>
      
    </div>
  );
};
