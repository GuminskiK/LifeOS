import React, { useState } from 'react';
import { Settings, MessageCircle, Plus } from 'lucide-react';
import * as api from '../../../api/socialApi';

interface CreatorModalProps {
  editingCreator: any;
  setShowCreatorModal: (s: boolean) => void;
  onSaveCreator?: () => void;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ editingCreator, setShowCreatorModal, onSaveCreator }) => {
  const [name, setName] = useState(editingCreator?.name || '');
  const [bio, setBio] = useState(editingCreator?.bio || '');
  const [platforms, setPlatforms] = useState<string[]>(
    editingCreator?.platforms?.map((p: any) => p.name) || []
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingCreator) {
        await api.updateCreator(editingCreator.id, { name, bio });
      } else {
        await api.addCreator({ name, bio, platforms: platforms.map(p => ({ name: p, platform_type: p as any })) as any });
      }
      setShowCreatorModal(false);
      if (onSaveCreator) onSaveCreator();
    } catch (e) {
      console.error('Błąd podczas zapisywania twórcy', e);
      alert('Nie udało się zapisać twórcy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{editingCreator ? 'Edytuj Twórcę' : 'Dodaj Nowego Twórcę'}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nazwa Kreatora / Profilu</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="np. MKBHD" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Krótkie Bio (Opcjonalnie)</label>
            <input type="text" value={bio} onChange={e => setBio(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="np. Kanał technologiczny" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Obsługiwane Platformy</label>
            <div className="flex gap-2">
              {['youtube', 'x', 'instagram', 'tiktok'].map(platform => (
                <label key={platform} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) setPlatforms([...platforms, platform]);
                      else setPlatforms(platforms.filter(p => p !== platform));
                    }}
                    className="rounded text-blue-500 focus:ring-blue-500" 
                  />
                  <span className="capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setShowCreatorModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Anuluj</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-300">Zapisz Twórcę</button>
        </div>
      </div>
    </div>
  );
};

interface ScraperModalProps {
  setShowScraperModal: (s: boolean) => void;
  creators: any[];
  contentTypes: string[];
  setContentTypes: (c: string[]) => void;
  syncMode: string;
  setSyncMode: (s: string) => void;
  syncInterval: number;
  setSyncInterval: (s: number) => void;
  syncDays: number[];
  setSyncDays: (d: number[]) => void;
  syncHours: any;
  setSyncHours: (h: any) => void;
  syncJitter: number;
  setSyncJitter: (j: number) => void;
}

export const ScraperModal: React.FC<ScraperModalProps> = ({
  setShowScraperModal,
  creators,
  contentTypes,
  setContentTypes,
  syncMode,
  setSyncMode,
  syncInterval,
  setSyncInterval,
  syncDays,
  setSyncDays,
  syncHours,
  setSyncHours,
  syncJitter,
  setSyncJitter
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Settings className="text-blue-500" /> Konfiguracja Reguł Pobierania
        </h2>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Twórca</label>
              <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Kanał / Platforma</label>
              <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                <option value="youtube">YouTube</option>
                <option value="x">X (Twitter)</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Rodzaj Treści</label>
              <div className="grid grid-cols-2 gap-2">
                {['video', 'short', 'text', 'image'].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100">
                    <input 
                      type="checkbox" 
                      checked={contentTypes.includes(type)}
                      onChange={(e) => {
                        if(e.target.checked) setContentTypes([...contentTypes, type]);
                        else setContentTypes(contentTypes.filter(t => t !== type));
                      }}
                      className="rounded text-blue-500 focus:ring-blue-500" 
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tryb Synchronizacji</label>
              <select 
                value={syncMode}
                onChange={e => setSyncMode(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">Tylko Ręcznie</option>
                <option value="schedule">Cykliczny (Polling)</option>
                <option value="discord">Powiadomienie Discord (Bot)</option>
                <option value="event">Zależny od innego procesu</option>
              </select>
            </div>

            {syncMode === 'schedule' && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Dni tygodnia</label>
                  <div className="flex gap-1">
                    {['Pn','Wt','Śr','Cz','Pt','Sb','Nd'].map((day, idx) => (
                      <button 
                        key={day}
                        onClick={() => setSyncDays(syncDays.includes(idx+1) ? syncDays.filter(d=>d!==idx+1) : [...syncDays, idx+1])}
                        className={`w-7 h-7 rounded-sm text-xs font-bold ${syncDays.includes(idx+1) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Od godz</label>
                    <input type="time" value={syncHours.start} onChange={e=>setSyncHours({...syncHours, start: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Do godz</label>
                    <input type="time" value={syncHours.end} onChange={e=>setSyncHours({...syncHours, end: e.target.value})} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Interwał (min)</label>
                    <input type="number" min="1" value={syncInterval} onChange={e=>setSyncInterval(Number(e.target.value))} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Jitter (+/- min)</label>
                    <input type="number" min="0" value={syncJitter} onChange={e=>setSyncJitter(Number(e.target.value))} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            )}

            {syncMode === 'discord' && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-indigo-700 uppercase block">Webhook URL z Discorda</label>
                <input type="text" placeholder="https://discord.com/api/webhooks/..." className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-sm" />
                <p className="text-[10px] text-indigo-500">Skonfiguruj bota, aby pingował ten URL gdy twórca wrzuci coś na określony kanał. (Możesz go użyć zamiast ciągłego requestowania API).</p>
              </div>
            )}

            {syncMode === 'event' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-orange-700 uppercase block">Śledzony Proces</label>
                <select className="w-full p-2.5 bg-white border border-orange-200 rounded-lg text-sm">
                  <option value="1">YouTube Scraper</option>
                  <option value="2">X (Twitter) Scraper</option>
                </select>
                <p className="text-[10px] text-orange-500">Uruchom ten parser, tylko gdy nowa treść pojawi się we wskazanym parserze (np. wrzucenie wideo po zebraniu shorta).</p>
              </div>
            )}
            
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button onClick={() => setShowScraperModal(false)} className="py-3 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-sm">
            Anuluj
          </button>
          <button onClick={() => { alert('Zapisano nową regułę agregacji!'); setShowScraperModal(false); }} className="py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
            <Plus size={18} /> Zapisz Konfigurację
          </button>
        </div>
      </div>
    </div>
  );
};
