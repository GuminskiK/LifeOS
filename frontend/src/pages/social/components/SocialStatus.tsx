import React from 'react';
import { CheckCircle, PauseCircle, AlertTriangle } from 'lucide-react';
import { getPlatformIcon } from './SocialHelpers';

interface Props {
  statuses: any[];
  setStatuses: React.Dispatch<React.SetStateAction<any[]>>;
  setShowScraperModal: (s: boolean) => void;
}

export const SocialStatus: React.FC<Props> = ({
  statuses,
  setStatuses,
  setShowScraperModal
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 border-b border-gray-100 bg-white">
        <h1 className="text-2xl font-bold text-gray-800">Status Procesów Agregacji (Scrapery)</h1>
        <p className="text-sm text-gray-500 mt-1">Podgląd działających parserów w tle pobierających najnowsze dane ze światowych platform.</p>
      </div>
      <div className="px-6 pt-6 max-w-5xl mx-auto w-full">
        <button onClick={() => setShowScraperModal(true)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-blue-700 transition-colors">
          + Dodaj Nowy Scraper
        </button>
      </div>
      <div className="p-6 overflow-y-auto w-full max-w-5xl mx-auto space-y-4">
        {statuses.map((status) => (
          <div key={status.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gray-50 border border-gray-100">
                {getPlatformIcon((status.platform?.name || status.platform_name || '').toLowerCase(), 24)}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{status.platform?.name || status.platform_name} Scraper</h3>
                <p className="text-sm text-gray-500 font-medium">Ostatnie pobranie: {status.lastPoll}</p>
              </div>
            </div>
            
            <div className="text-right">
              {status.status === 'active' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-bold uppercase tracking-wider">
                  <CheckCircle size={16} /> Działa
                </span>
              )}
              {status.status === 'paused' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-sm font-bold uppercase tracking-wider">
                  <PauseCircle size={16} /> Zastopowano
                </span>
              )}
              {status.status === 'hard_stop' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-bold uppercase tracking-wider">
                  <AlertTriangle size={16} /> Hard Stop
                </span>
              )}
              <p className="text-xs text-gray-400 font-bold mt-2">Nastepny Pool: {status.nextPoll}</p>
              <div className="mt-3">
                <button 
                  onClick={() => setStatuses(statuses.map(s => s.id === status.id ? {...s, status: s.status === 'active' ? 'paused' : 'active'} : s))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${status.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                  {status.status === 'active' ? 'Zatrzymaj (Wyłącz)' : 'Uruchom Wznów'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
