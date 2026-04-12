import React, { useState, useEffect } from 'react';
import { fetchFlashCards, fetchFlashNotes, getDueItems, submitReview, FlashCard, FlashNote, createFlashCard, createFlashNote, deleteFlashCard, deleteFlashNote, getNote } from '../../api/notesApi';
import { Plus, Trash2, BrainCircuit, RefreshCcw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FlashcardsMain() {
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [flashNotes, setFlashNotes] = useState<FlashNote[]>([]);
  const [dueItems, setDueItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'review' | 'cards' | 'notes'>('review');

  // Form State for FC
  const [fcName, setFcName] = useState('');
  const [fcFront, setFcFront] = useState('');
  const [fcReverse, setFcReverse] = useState('');

  // Review State
  const [showAnswer, setShowAnswer] = useState(false);

  // Bulk input
  const [bulkInput, setBulkInput] = useState('');
  const [isDeployingBulk, setIsDeployingBulk] = useState(false);

  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [currentNoteHtml, setCurrentNoteHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkedNote = async () => {
      if (activeTab === 'review' && dueItems.length > 0 && dueItems[0].item_type === 'note' && dueItems[0].note_id) {
        setIsLoadingNote(true);
        setCurrentNoteHtml(null);
        try {
          const note = await getNote(dueItems[0].note_id);
          // Oczekujemy, że content zawiera HTML (zakładając jak działa Tiptap w LifeOS)
          if (note && note.content && typeof note.content === 'object' && 'html' in note.content) {
            setCurrentNoteHtml((note.content as any).html);
          } else {
             setCurrentNoteHtml('<p>Brak podglądu...</p>');
          }
        } catch (e) {
           setCurrentNoteHtml('<p>Błąd ładowania notatki</p>');
        }
        setIsLoadingNote(false);
      } else {
        setCurrentNoteHtml(null);
      }
    };
    fetchLinkedNote();
  }, [dueItems, activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'cards') {
        const cards = await fetchFlashCards();
        setFlashCards(cards);
      } else if (activeTab === 'notes') {
        const notes = await fetchFlashNotes();
        setFlashNotes(notes);
      } else {
        const due = await getDueItems();
        setDueItems(due);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCreateFC = async () => {
    if (!fcName || !fcFront || !fcReverse) return;
    await createFlashCard({
      name: fcName,
      front: { text: fcFront },
      reverse: { text: fcReverse },
      is_active: true
    });
    setFcName(''); setFcFront(''); setFcReverse('');
    loadData();
  };

  const handleCreateBulkFC = async () => {
    if (!bulkInput) return;
    setIsDeployingBulk(true);
    
    // Uproszczona dedukcja dla 2 kolumn. Jeśli są TABY to dzielimy linię.
    // Jeśli nie to bierzemy na przemian Pytanie(1 linia), Odpowiedź (2 linia).
    const hasTabs = bulkInput.includes('\t');
    const lines = bulkInput.split('\n').filter(l => l.trim().length > 0);
    
    try {
      if (hasTabs) {
        for (const line of lines) {
          const parts = line.split('\t');
          if (parts.length >= 2) {
            await createFlashCard({
              name: parts[0].substring(0, 30),
              front: { text: parts[0] },
              reverse: { text: parts[1] },
              is_active: true
            });
          }
        }
      } else {
        // Tiptap format
        for (let i = 0; i < lines.length - 1; i += 2) {
          const front = lines[i];
          const back = lines[i+1];
          await createFlashCard({
            name: front.substring(0, 30),
            front: { text: front },
            reverse: { text: back },
            is_active: true
          });
        }
      }
    } catch(e) {
      console.error(e);
    }
    
    setBulkInput('');
    setIsDeployingBulk(false);
    loadData();
  };

  const handleCreateFN = async () => {
    if (!fcName) return;
    await createFlashNote({
      name: fcName,
      is_active: true,
      note_id: null // you could reference a specific note ID here
    });
    setFcName('');
    loadData();
  };

  const handleDeleteFC = async (id: number) => {
    await deleteFlashCard(id);
    loadData();
  };

  const handleDeleteFN = async (id: number) => {
    await deleteFlashNote(id);
    loadData();
  };

  const handleReview = async (id: number, type: 'card' | 'note', quality: number) => {
    await submitReview(id, type, quality);
    setShowAnswer(false);
    loadData();
  };

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-200">
      <div className="w-64 border-r border-slate-700 bg-slate-800 p-4 flex flex-col gap-4 shrink-0">
        <h2 className="text-xl font-bold font-mono text-indigo-400">SRS Fiszki</h2>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('review')} className={`p-2 text-left rounded-lg transition-colors flex items-center gap-2 `}>
            <BrainCircuit className="h-5 w-5" /> Powtórki
          </button>
          <button onClick={() => setActiveTab('cards')} className={`p-2 text-left rounded-lg transition-colors `}>Zarządzaj Fiszkami</button>
          <button onClick={() => setActiveTab('notes')} className={`p-2 text-left rounded-lg transition-colors `}>Zarządzaj FlashNotes</button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'cards' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <h3 className="text-2xl font-bold">Nowa Fiszka</h3>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col gap-4 border border-slate-700">
              <input value={fcName} onChange={(e) => setFcName(e.target.value)} placeholder="Tytuł fiszki..." className="bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <textarea value={fcFront} onChange={(e) => setFcFront(e.target.value)} placeholder="Przód (pytanie)..." className="bg-slate-700 text-white p-3 rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <textarea value={fcReverse} onChange={(e) => setFcReverse(e.target.value)} placeholder="Tył (odpowiedź)..." className="bg-slate-700 text-white p-3 rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={handleCreateFC} className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-500 font-bold flex items-center justify-center gap-2 mt-2 transition-colors disabled:opacity-50">
                <Plus className="h-5 w-5" /> Dodaj
              </button>
            </div>

            <h3 className="text-2xl font-bold mt-4">Wklej masowo 2-kolumnową tabelę</h3>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Jeśli skopiujesz tabelę z edytora notatnika, wklei się tu parami wierszy (Pytanie \n Odpowiedź). System to złapie i przerobi na pule fiszek!</p>
              <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder="Skopiowany tekst z tabelki..." className="bg-slate-700 text-white p-3 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3" />
              <button disabled={isDeployingBulk} onClick={handleCreateBulkFC} className="bg-indigo-800 text-white p-3 rounded-lg hover:bg-indigo-700 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                <Plus className="h-5 w-5" /> {isDeployingBulk ? "Generowanie fiszek..." : "Generuj z tekstu"}
              </button>
            </div>

            <h3 className="text-2xl font-bold mt-4">Lista Fiszek</h3>
            {flashCards.length === 0 ? (
              <p className="text-slate-400 italic">Nie masz jeszcze żadnych fiszek.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {flashCards.map(fc => (
                  <li key={fc.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-700">
                    <div>
                      <p className="font-bold text-lg">{fc.name}</p>
                      <p className="text-sm text-slate-400">Powtórki: {fc.repetitions} | Interwał: {fc.interval}</p>
                    </div>
                    <button onClick={() => handleDeleteFC(fc.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2"><Trash2 className="h-5 w-5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <h3 className="text-2xl font-bold">Nowy FlashNote</h3>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col gap-4 border border-slate-700">
              <input value={fcName} onChange={(e) => setFcName(e.target.value)} placeholder="Tytuł FlashNote..." className="bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={handleCreateFN} className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-500 font-bold flex items-center justify-center gap-2 mt-2 transition-colors">
                <Plus className="h-5 w-5" /> Utwórz FlashNote
              </button>
            </div>

            <h3 className="text-2xl font-bold mt-4">Twoje FlashNotes</h3>
            {flashNotes.length === 0 ? (
              <p className="text-slate-400 italic">Brak FlashNotes.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {flashNotes.map(fn => (
                  <li key={fn.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-700">
                    <div>
                      <p className="font-bold text-lg">{fn.name}</p>
                      <p className="text-sm text-slate-400">Powtórki: {fn.repetitions} | Interwał: {fn.interval}</p>
                    </div>
                    <button onClick={() => handleDeleteFN(fn.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2"><Trash2 className="h-5 w-5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 text-center mt-10">
            <h3 className="text-3xl font-bold flex items-center justify-center gap-3 text-indigo-400"><RefreshCcw className="h-8 w-8" /> Tryb Powtórek</h3>
            <p className="text-slate-400 text-lg">Zaległych elementów: <span className="font-bold text-white">{dueItems.length}</span></p>

            {dueItems.length > 0 ? (
              <div className="bg-slate-800 p-10 rounded-xl shadow-2xl flex flex-col items-center justify-center gap-10 mt-4 min-h-[350px] border border-slate-700 relative">
                <span className="absolute top-4 right-4 bg-indigo-900 text-indigo-200 text-xs px-2 py-1 rounded shadow">
                  {dueItems[0].item_type === 'note' ? 'FlashNote' : 'FlashCard'}
                </span>
                
                <p className="text-2xl font-bold">{dueItems[0].name}</p>
                
                {dueItems[0].item_type === 'card' && dueItems[0].front && (
                  <div className="text-xl bg-slate-700 p-6 rounded-lg shadow-inner min-w-[300px]">
                    {dueItems[0].front?.text || "Brak treści pytań..."}
                  </div>
                )}

                {dueItems[0].item_type === 'note' && showAnswer && (
                  <div className="bg-slate-700 p-6 rounded-lg shadow-inner min-w-[300px] w-full max-h-[300px] overflow-y-auto prose prose-invert">
                    {isLoadingNote ? (
                      <p>Ładowanie powiązanej notatki...</p>
                    ) : (
                      currentNoteHtml ? (
                         <div dangerouslySetInnerHTML={{ __html: currentNoteHtml }} />
                      ) : (
                         <p>Nie odnaleziono treści.</p>
                      )
                    )}
                  </div>
                )}

                {dueItems[0].item_type === 'card' && showAnswer && dueItems[0].reverse && (
                  <div className="text-xl bg-slate-600 p-6 rounded-lg shadow-inner min-w-[300px] border border-green-500/30">
                    <p className="text-sm text-green-400 mb-2 font-bold">Odpowiedź:</p>
                    {dueItems[0].reverse?.text || "Brak treści..."}
                  </div>
                )}

                {!showAnswer ? (
                  <button 
                    onClick={() => setShowAnswer(true)} 
                    className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transition-transform hover:scale-105"
                  >
                    Pokaż Odpowiedź
                  </button>
                ) : (
                  <div className="flex flex-col gap-4 w-full mt-6 animate-fade-in">
                    <p className="text-sm text-slate-400">Oceń stopień przypomnienia (0: pustka, 5: natychmiastowo):</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {[0, 1, 2, 3, 4, 5].map(score => (
                        <button key={score} onClick={() => handleReview(dueItems[0].id, dueItems[0].item_type, score)} className="h-16 w-16 rounded-full font-bold text-2xl bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-1 transform transition-all shadow-md active:scale-95 border-2 border-indigo-400/30">
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 p-12 rounded-xl mt-8 text-2xl text-green-400 font-bold border-2 border-green-800/30 flex flex-col items-center gap-4">
                <BrainCircuit className="h-16 w-16 text-green-500" />
                Wszystko powtórzone na dziś! Świetna robota! 🎉
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
