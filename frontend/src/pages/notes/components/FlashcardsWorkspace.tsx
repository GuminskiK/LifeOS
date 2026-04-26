import React from 'react';
import { 
  Folder as FolderIcon, Trash2, ExternalLink, BrainCircuit, RefreshCcw 
} from 'lucide-react';
import { FlashGroup, FlashCard, FlashNote } from '../../../api/notesApi';

interface FlashcardsWorkspaceProps {
  activeType: 'card' | 'note';
  mainTab: 'manage' | 'hard' | 'add';
  setMainTab: (tab: 'manage' | 'hard' | 'add') => void;
  selectedGroup: FlashGroup | undefined;
  currentItems: (FlashCard | FlashNote)[];
  setSelectedGroupId: (id: number | null) => void;
  startReview: (mode: 'due' | 'difficult') => void;
  handleDeleteGroup: (id: number) => void;
  handleDeleteItem: (id: number, type: 'card' | 'note') => void;
  // Forms
  fcName: string; setFcName: (v: string) => void;
  fcFront: string; setFcFront: (v: string) => void;
  fcReverse: string; setFcReverse: (v: string) => void;
  fnNoteIdStr: string; setFnNoteIdStr: (v: string) => void;
  isBulkMode: boolean; setIsBulkMode: (v: boolean) => void;
  importNoteId: string; setImportNoteId: (v: string) => void;
  importLoading: boolean; importFromNote: () => void;
  bulkData: string; setBulkData: (v: string) => void;
  handleCreateItem: () => void;
}

export const FlashcardsWorkspace: React.FC<FlashcardsWorkspaceProps> = ({
  activeType,
  mainTab,
  setMainTab,
  selectedGroup,
  currentItems,
  setSelectedGroupId,
  startReview,
  handleDeleteGroup,
  handleDeleteItem,
  fcName, setFcName,
  fcFront, setFcFront,
  fcReverse, setFcReverse,
  fnNoteIdStr, setFnNoteIdStr,
  isBulkMode, setIsBulkMode,
  importNoteId, setImportNoteId,
  importLoading, importFromNote,
  bulkData, setBulkData,
  handleCreateItem
}) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full relative">
      <div className="flex bg-slate-950 border-b border-slate-800 px-6 pt-4 sticky top-0 z-10 gap-2 overflow-x-auto shadow-md">
         
        {/* Main Area TABS */}
        <button 
          disabled={!selectedGroup}
          onClick={() => setMainTab('manage')}
          className={`px-8 py-3 font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 uppercase tracking-wide text-sm whitespace-nowrap 
            ${mainTab === 'manage' ? 'bg-slate-900 border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}
            ${!selectedGroup ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Zarządzanie
        </button>

        <button 
          disabled={!selectedGroup}
          onClick={() => setMainTab('hard')}
          className={`px-8 py-3 font-bold rounded-t-xl transition-colors border-b-4 flex items-center gap-2 uppercase tracking-wide text-sm whitespace-nowrap 
            ${mainTab === 'hard' ? 'bg-slate-900 border-red-500 text-red-500' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}
            ${!selectedGroup ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          HARD / Powtórki
        </button>
        
        <button 
          disabled={!selectedGroup}
          onClick={() => setMainTab('add')}
          className={`px-8 py-3 font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 uppercase tracking-wide text-sm whitespace-nowrap 
            ${mainTab === 'add' ? 'bg-slate-900 border-green-500 text-green-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}
            ${!selectedGroup ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Dodaj
        </button>

        <div className="flex-1 flex justify-end items-center mb-2 px-2 text-slate-500 italic text-sm">
           {selectedGroup ? `Wybrana: ${selectedGroup.name}` : '← Wybierz grupę'}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        
        {!selectedGroup ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 select-none opacity-50">
            <FolderIcon size={64} className="text-slate-700" />
            <p className="text-xl font-medium">Zaznacz grupę (folder) w panelu po lewej stronie</p>
          </div>
        ) : (
          <>
            {mainTab === 'manage' && (
              <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                <div className="flex justify-between items-center bg-slate-950/50 p-4 border border-slate-800 rounded-xl mb-4">
                   <span className="text-slate-300 font-medium">Katalog: {selectedGroup.name}</span>
                   <button 
                      onClick={() => handleDeleteGroup(selectedGroup.id)} 
                      className="text-red-400 hover:text-red-300 text-sm flex gap-2 items-center px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} /> Usuń Cały Folder
                    </button>
                </div>

                {currentItems.length === 0 ? (
                  <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 border-dashed">
                    <p className="text-lg">Grupa jest pusta.</p>
                    <button onClick={() => setMainTab('add')} className="mt-4 text-indigo-400 font-bold hover:text-indigo-300">Przejdź do zakładki DODAJ</button>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {currentItems.map(item => {
                      const now = new Date().toISOString();
                      const isDue = item.is_active && item.next_review && item.next_review <= now;
                      
                      return (
                        <li key={item.id} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700/50 hover:border-slate-600 transition-colors group">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              {isDue ? <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" title="Oczekuje na powtórkę"></span> : null}
                              <p className="font-bold text-lg">{item.name || (activeType === 'card' ? (item as any).front?.text : `Odniesienie do notatki #${(item as any).note_id}`)}</p>
                              {activeType === 'note' && <span className="text-xs bg-slate-700 px-2 flex items-center gap-1 py-0.5 rounded text-slate-400"><ExternalLink size={10} /> Notatka ID {(item as any).note_id}</span>}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-2 flex gap-4 bg-slate-900/50 w-fit px-3 py-1.5 rounded-lg border border-slate-800">
                              <span>Powtórki: {item.repetitions || 0}</span>
                              <span className="border-l border-slate-700 pl-4">Trafność: {((item as any).easiness_factor || 2.5).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <button onClick={() => handleDeleteItem(item.id, activeType)} className="text-slate-500 hover:text-red-400 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
                            <Trash2 size={18}/>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {mainTab === 'hard' && (
              <div className="max-w-3xl mx-auto bg-slate-800/50 p-10 rounded-[2rem] border border-slate-700/50 flex flex-col gap-8 shadow-2xl">
                <div className="text-center pb-6 border-b border-slate-700/50">
                   <h3 className="text-3xl font-bold text-white tracking-widest uppercase opacity-90">Training Area</h3>
                   <p className="text-slate-400 mt-2 text-lg">Wybierz tryb powtarzania ({activeType === 'card' ? 'Fiszek' : 'FlashNotes'})</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <button onClick={() => startReview('due')} className="flex-1 bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-bold py-10 rounded-[1.5rem] shadow-lg flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95 group">
                    <BrainCircuit size={48} className="text-indigo-200 group-hover:animate-pulse" />
                    <span className="text-xl">Zaległe Repetycje</span>
                  </button>
                  
                  {activeType === 'card' && (
                    <button onClick={() => startReview('difficult')} className="flex-1 bg-gradient-to-b from-rose-600 to-red-800 hover:from-rose-500 hover:to-red-700 text-white font-bold py-10 rounded-[1.5rem] shadow-[0_0_20px_rgba(225,29,72,0.3)] flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95 group border-2 border-red-500/50">
                      <RefreshCcw size={48} className="text-red-200 group-hover:rotate-180 transition-transform duration-500" />
                      <span className="text-xl font-black tracking-wider shadow-black drop-shadow-md">HARD TRYB</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {mainTab === 'add' && (
              <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                  <h3 className="font-bold text-2xl text-indigo-300">Nowy element w "{selectedGroup.name}"</h3>
                  {activeType === 'card' && (
                    <button 
                      onClick={() => setIsBulkMode(!isBulkMode)}
                      className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors"
                    >
                      {isBulkMode ? "Wróć do pojedynczych" : "Wklej z tabeli (Masowo)"}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-6">
                  {isBulkMode && activeType === 'card' ? (
                    <div className="flex-1">
                      <label className="text-sm text-slate-400 font-bold mb-2 block uppercase tracking-wider">Metoda 1: Import z tabeli w Notatce</label>
                      <div className="flex gap-4 items-center bg-slate-900 border border-slate-700 p-6 rounded-xl relative mb-8">
                         <div className="text-3xl text-slate-500 font-mono">#</div>
                         <input type="number" value={importNoteId} onChange={e => setImportNoteId(e.target.value)} placeholder="Podaj ID wpisując cyfry..." className="flex-1 bg-slate-950 py-4 px-5 rounded-lg border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none text-2xl font-mono transition-all" />
                         <button onClick={importFromNote} disabled={importLoading || !importNoteId} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 px-8 py-4 font-bold rounded-lg text-lg flex items-center justify-center transition-all shadow-md">
                           {importLoading ? <RefreshCcw className="animate-spin" size={24} /> : 'Zaciągnij'}
                         </button>
                      </div>
                      <label className="text-sm text-slate-400 font-bold mb-2 block uppercase tracking-wider">Metoda 2: Wklej zawartość tabeli (Przód \t Tył)</label>
                      <textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder="Skopiuj i wklej zawartość tabeli (kolumny z notatki / excel, przedzielone tabem)..." className="w-full bg-slate-900 py-4 px-5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[300px] text-sm font-mono transition-all pr-4" />
                      <p className="text-xs text-slate-500 mt-2">Użyj formatu: <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300">Front (pytanie) [TAB] Odpowiedź (Tył)</code>. Zignorowane zostaną niekompletne linie.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm text-slate-400 font-bold mb-2 block uppercase tracking-wider">Nazwa (opcjonalnie)</label>
                        <input value={fcName} onChange={e => setFcName(e.target.value)} placeholder="np. Słówko 1, Definicja B" className="w-full bg-slate-900 py-4 px-5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-all" />
                      </div>
                      
                      {activeType === 'card' ? (
                        <>
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <label className="text-sm text-slate-400 font-bold mb-2 block uppercase tracking-wider">Przód (pytanie)</label>
                              <textarea value={fcFront} onChange={e => setFcFront(e.target.value)} placeholder="Zadaj zagadkę..." className="w-full bg-slate-900 py-4 px-5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[160px] text-lg transition-all" />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm text-slate-400 font-bold mb-2 block uppercase tracking-wider">Tył (odpowiedź)</label>
                              <textarea value={fcReverse} onChange={e => setFcReverse(e.target.value)} placeholder="Dokładna odpowiedź..." className="w-full bg-slate-900 py-4 px-5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[160px] text-lg transition-all" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                          <label className="text-sm text-slate-300 font-bold mb-3 block tracking-wide">Podepnij ID Notatki (FlashNote)</label>
                          <div className="flex items-center gap-3">
                             <div className="text-2xl text-slate-500 font-mono">#</div>
                             <input type="number" value={fnNoteIdStr} onChange={e => setFnNoteIdStr(e.target.value)} placeholder="2077" className="w-full bg-slate-950 py-4 px-5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none text-2xl font-mono transition-all" />
                          </div>
                          <p className="text-sm mt-4 text-slate-500 flex items-center gap-2"><ExternalLink size={14}/> Wklej tutaj skopiowane wcześniej ID Notatki.</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  <button 
                    onClick={handleCreateItem} 
                    disabled={isBulkMode ? !bulkData.trim() : (activeType === 'card' ? (!fcFront || !fcReverse) : !fnNoteIdStr)}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 py-5 rounded-2xl font-bold mt-4 text-xl transition-all shadow-lg hover:shadow-indigo-500/20 disabled:shadow-none"
                  >
                    {activeType === 'card' && isBulkMode ? 'Utwórz masowo' : 'Utwórz i dodaj'}
                  </button>
                </div>
              </div>
            )}

          </>
        )}

      </div>
    </div>
  );
};
