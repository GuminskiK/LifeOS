import React from 'react';
import { RefreshCcw, BrainCircuit, ChevronDown, X } from 'lucide-react';

interface FlashcardsReviewProps {
  reviewMode: 'due' | 'difficult' | null;
  setReviewMode: (mode: 'due' | 'difficult' | null) => void;
  reviewItems: any[];
  showAnswer: boolean;
  setShowAnswer: (show: boolean) => void;
  currentNoteHtml: string | null;
  isLoadingNote: boolean;
  handleReviewScore: (id: number, type: 'card' | 'note', score: number) => void;
}

export const FlashcardsReview: React.FC<FlashcardsReviewProps> = ({
  reviewMode,
  setReviewMode,
  reviewItems,
  showAnswer,
  setShowAnswer,
  currentNoteHtml,
  isLoadingNote,
  handleReviewScore
}) => {
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
};
