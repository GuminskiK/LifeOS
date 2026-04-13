import { useState, useEffect } from 'react';
import { 
  fetchFlashCards, fetchFlashNotes, getDueItems, submitReview, 
  FlashCard, FlashNote, createFlashCard, createFlashNote, 
  deleteFlashCard, deleteFlashNote, getNote,
  FlashGroup, getFlashGroups, createFlashGroup, deleteFlashGroup, getDifficultCards
} from '../../api/notesApi';
import { Plus, Trash2, BrainCircuit, RefreshCcw, ExternalLink, ChevronDown, Folder as FolderIcon, X } from 'lucide-react';

export function FlashcardsMain() {
  const [activeType, setActiveType] = useState<'card' | 'note'>('card');
  const [mainTab, setMainTab] = useState<'manage' | 'hard' | 'add'>('manage');
  
  const [groups, setGroups] = useState<FlashGroup[]>([]);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [notes, setNotes] = useState<FlashNote[]>([]);
  
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  
  // Review state
  const [reviewMode, setReviewMode] = useState<'due' | 'difficult' | null>(null);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentNoteHtml, setCurrentNoteHtml] = useState<string | null>(null);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  // Forms
  const [newGroupName, setNewGroupName] = useState('');
  const [fcName, setFcName] = useState('');
  const [fcFront, setFcFront] = useState('');
  const [fcReverse, setFcReverse] = useState('');
  const [fnNoteIdStr, setFnNoteIdStr] = useState('');

  const loadData = async () => {
    try {
      const [g, c, n] = await Promise.all([
        getFlashGroups(), fetchFlashCards(), fetchFlashNotes()
      ]);
      setGroups(g);
      setCards(c);
      setNotes(n);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, []);

  const getGroupDescendants = (groupId: number): number[] => {
    const children = groups.filter(g => g.parent_id === groupId).map(g => g.id);
    return [groupId, ...children.flatMap(getGroupDescendants)];
  };

  const handleCreateGroup = async (parentId: number | null) => {
    if (!newGroupName) return;
    await createFlashGroup({ name: newGroupName, group_type: activeType, parent_id: parentId, owner_id: 0 });
    setNewGroupName('');
    loadData();
  };

  const handleCreateItem = async () => {
    if (!fcName && activeType === 'card' && !fcFront) return;
    if (!selectedGroupId) return;
    
    if (activeType === 'card') {
      await createFlashCard({
        name: fcName || "Nowa fiszka", front: {text: fcFront}, reverse: {text: fcReverse}, 
        is_active: true, group_id: selectedGroupId
      });
      setFcFront(''); setFcReverse(''); setFcName('');
      setMainTab('manage');
    } else {
      await createFlashNote({
        name: fcName || `FlashNote #${fnNoteIdStr}`, note_id: parseInt(fnNoteIdStr) || null,
        is_active: true, group_id: selectedGroupId
      });
      setFnNoteIdStr(''); setFcName('');
      setMainTab('manage');
    }
    loadData();
  };

  const startReview = async (mode: 'due' | 'difficult') => {
    if (!selectedGroupId) return;
    const ids = getGroupDescendants(selectedGroupId);
    
    let items = [];
    if (mode === 'due') {
      items = await getDueItems(ids);
      items = items.filter(x => x.item_type === activeType);
    } else {
      items = await getDifficultCards(20, ids);
      items = items.map((x:any) => ({...x, item_type: 'card'}));
    }
    setReviewItems(items);
    setReviewMode(mode);
    setShowAnswer(false);
  };

  const handleReviewScore = async (id: number, type: 'card'|'note', score: number) => {
    await submitReview(id, type, score);
    setReviewItems(prev => prev.slice(1));
    setShowAnswer(false);
    loadData();
  };

  useEffect(() => {
    if (reviewMode && reviewItems.length > 0 && reviewItems[0].item_type === 'note' && reviewItems[0].note_id) {
      setIsLoadingNote(true);
      getNote(reviewItems[0].note_id).then(note => {
        if (note && typeof note.content === 'object' && 'html' in (note.content as any)) {
          setCurrentNoteHtml((note.content as any).html);
        } else {
          setCurrentNoteHtml('<p>Brak podglądu...</p>');
        }
      }).catch(() => setCurrentNoteHtml('<p>Błąd ładowania</p>')).finally(() => setIsLoadingNote(false));
    } else {
      setCurrentNoteHtml(null);
    }
  }, [reviewItems, reviewMode]);

  const renderTree = (parentId: number | null, level: number = 0) => {
    const children = groups.filter(g => g.group_type === activeType && g.parent_id === parentId);
    if (children.length === 0) return null;
    
    return (
      <ul className={`flex flex-col gap-1 w-full ${level > 0 ? 'pl-4 border-l border-slate-700 ml-2 mt-1' : ''}`}>
        {children.map(g => {
          const isSelected = selectedGroupId === g.id;
          const des = getGroupDescendants(g.id);
          const now = new Date().toISOString();
          let groupItems = activeType === 'card' ? cards.filter(c => c.group_id && des.includes(c.group_id)) : notes.filter(n => n.group_id && des.includes(n.group_id));
          const dueCount = groupItems.filter(i => i.is_active && i.next_review && i.next_review <= now).length;
          
          return (
            <li key={g.id} className="w-full">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGroupId(g.id);
                }}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600 shadow-md text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FolderIcon size={16} className={isSelected ? "text-indigo-200" : "text-indigo-400"} />
                  <span className="truncate pr-2 font-medium">{g.name}</span>
                </div>
                {dueCount > 0 && (
                  <div className="text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold bg-green-500/20 text-green-300">
                    {dueCount}
                  </div>
                )}
              </div>
              {renderTree(g.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  // Review Screen hijacks view entirely
  if (reviewMode && reviewItems.length > 0) {
    const item = reviewItems[0];
    return (
      <div className="flex flex-col h-full w-full bg-slate-900 text-slate-200 items-center overflow-y-auto p-8">
        <div className="w-full max-w-4xl flex justify-between mb-8">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-indigo-400">
            <RefreshCcw className="h-6 w-6" /> {reviewMode === 'due' ? 'Powtórki' : 'Najtrudniejsze'}
            <span className="text-sm font-normal text-slate-400 ml-4 border border-slate-700 px-3 py-1 rounded-full">
              Pozostało: {reviewItems.length}
            </span>
          </h3>
          <button onClick={() => setReviewMode(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium flex items-center gap-2 transition-colors">
            <X size={16} /> Przerwij
          </button>
        </div>

        <div className="bg-slate-800 p-10 rounded-xl shadow-2xl flex flex-col items-center justify-center gap-10 mt-4 min-h-[350px] w-full max-w-3xl border border-slate-700 relative">
          <p className="text-3xl font-bold text-center">{item.name}</p>
          
          {item.item_type === 'card' && item.front && (
            <div className="text-2xl bg-slate-700 p-8 rounded-xl shadow-inner min-w-[300px] text-center w-full">
              {item.front?.text || "Brak treści pytań..."}
            </div>
          )}

          {item.item_type === 'note' && showAnswer && (
            <div className="bg-slate-700 p-8 w-full rounded-xl shadow-inner max-h-[500px] overflow-y-auto prose prose-invert h-full">
              {isLoadingNote ? <div className="flex justify-center py-10"><RefreshCcw className="animate-spin text-slate-500" size={32}/></div> : <div dangerouslySetInnerHTML={{ __html: currentNoteHtml || '' }} />}
            </div>
          )}

          {item.item_type === 'card' && showAnswer && item.reverse && (
            <div className="text-2xl bg-slate-900 p-8 rounded-xl shadow-inner min-w-[300px] w-full border border-green-500/30 text-center">
              <p className="text-sm text-green-400 mb-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2"><BrainCircuit size={16} /> Odpowiedź</p>
              {item.reverse?.text || "Brak treści..."}
            </div>
          )}

          {!showAnswer ? (
            <button onClick={() => setShowAnswer(true)} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-transform hover:scale-105 active:scale-95 flex items-center gap-3">
              Pokaż Odpowiedź <ChevronDown size={24} />
            </button>
          ) : (
            <div className="flex flex-col gap-4 w-full mt-6 animate-fade-in border-t border-slate-700 pt-8">
              <p className="text-sm text-slate-400 text-center uppercase tracking-wider font-bold">Oceń swoją pamięć (0: nie pamiętam, 5: doskonale):</p>
              <div className="flex flex-wrap gap-4 justify-center">
                {[0, 1, 2, 3, 4, 5].map(score => {
                  let colorClass = score < 2 ? 'hover:bg-red-500 hover:border-red-400' : score < 4 ? 'hover:bg-yellow-500 hover:border-yellow-400' : 'hover:bg-green-500 hover:border-green-400';
                  return (
                    <button key={score} onClick={() => handleReviewScore(item.id, item.item_type, score)} className={`h-16 w-16 rounded-full font-bold text-2xl bg-slate-700 transition-all shadow-md active:scale-95 border-2 border-slate-600 ${colorClass}`}>
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (reviewMode && reviewItems.length === 0) {
    return (
      <div className="flex flex-col h-full w-full bg-slate-900 text-slate-200 items-center justify-center p-8">
        <div className="bg-slate-800/80 p-16 rounded-2xl text-3xl text-green-400 font-bold border-2 border-green-800/30 flex flex-col items-center gap-6 shadow-2xl">
          <div className="p-6 bg-green-500/10 rounded-full">
            <BrainCircuit className="h-24 w-24 text-green-500" />
          </div>
          Wszystkie powtórki ukończone!
          <button onClick={() => setReviewMode(null)} className="mt-8 text-lg bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-full transition-colors flex items-center gap-2">Wróć do bazy</button>
        </div>
      </div>
    );
  }

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const currentItems = activeType === 'card' 
    ? cards.filter(c => c.group_id === selectedGroupId)
    : notes.filter(n => n.group_id === selectedGroupId);

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-200">
      {/* Sidebar based on UI Sketch */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 p-4 flex flex-col shrink-0">
        
        <h2 className="text-xl font-bold text-indigo-400 mb-4 pl-2 flex items-center gap-2">
           FlashSpace / Rep
        </h2>

        {/* Left Side SELECT Option */}
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

      {/* Main Area content based on UI sketch top tabs */}
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
                        onClick={async () => {
                          if(window.confirm(`Usunąć grupę "${selectedGroup.name}" i jej zawartość?`)){
                            await deleteFlashGroup(selectedGroup.id);
                            setSelectedGroupId(null);
                            loadData();
                          }
                        }} 
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
                            
                            <button onClick={async () => {
                              if(window.confirm('Usunąć ten wpis z foldera?')) {
                                if (activeType === 'card') await deleteFlashCard(item.id);
                                else await deleteFlashNote(item.id);
                                loadData();
                              }
                            }} className="text-slate-500 hover:text-red-400 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
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
                  <h3 className="font-bold text-2xl mb-8 text-indigo-300 border-b border-slate-700 pb-4">Nowy element w folderze "{selectedGroup.name}"</h3>
                  <div className="flex flex-col gap-6">
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
                    
                    <button 
                      onClick={handleCreateItem} 
                      disabled={activeType === 'card' ? (!fcFront || !fcReverse) : !fnNoteIdStr}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 py-5 rounded-2xl font-bold mt-4 text-xl transition-all shadow-lg hover:shadow-indigo-500/20 disabled:shadow-none"
                    >
                      Utwórz i dodaj
                    </button>
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </div>
  );
}

