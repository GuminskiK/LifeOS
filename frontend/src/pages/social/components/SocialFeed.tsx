import React from 'react';
import { MonitorPlay, MessageSquare, Clock, Download, Heart, Settings, MessageCircle, Plus } from 'lucide-react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { getPlatformIcon, getPostTypeIcon } from './SocialHelpers';
import * as api from '../../../api/socialApi';

interface Props {
  activeMainTab: 'feed' | 'favorites' | string;
  feed: any[];
  setFeed: React.Dispatch<React.SetStateAction<any[]>>;
  creators: any[];
  syncMode: string;
  setSyncMode: (s: string) => void;
  syncInterval: number;
  setSyncInterval: (s: number) => void;
  syncOptionalStates: any; // wrap complex setup
}

export const SocialFeed: React.FC<Props> = ({
  activeMainTab,
  feed,
  setFeed,
  creators,
  syncMode,
  setSyncMode,
  syncInterval,
  setSyncInterval
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {activeMainTab === 'favorites' ? 'Ulubione' : 'Globalny Feed'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeMainTab === 'favorites' ? 'Twoje zapisane posty z różnych platform.' : 'Najnowsze wpisy od wszystkich obserwowanych twórców.'}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <MonitorPlay size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-600">Video: {feed.filter(p => ['video', 'shorts'].includes(p.post_type)).length}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <MessageSquare size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-600">Posty: {feed.filter(p => ['text', 'image'].includes(p.post_type)).length}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-600">Stories: {feed.filter(p => p.post_type === 'story').length}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-6">
          {feed.filter(p => activeMainTab === 'favorites' ? p.is_favorite : true).map(post => (
            <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center font-bold text-gray-700">
                    {((post.platform?.name || post.name || 'User')).substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{(post.platform?.name || post.name || 'User')}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      {getPlatformIcon(post.platform?.platform_type || post.platform?.name || '', 12)} {(new Date(post.created_at || '').toLocaleDateString())}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase">
                    {getPostTypeIcon(post.post_type || '')} {post.post_type}
                  </div>
                  <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
                    <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group" title="Pobierz plik">
                      <Download size={18} className="text-gray-400 group-hover:text-blue-500" />
                    </button>
                    <button 
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group" 
                      title={post.is_favorite ? "Usuń z Ulubionych" : "Dodaj do Ulubionych"}
                      onClick={async () => {
                        try {
                          if (post.is_favorite) {
                            await api.removeFavorite(post.id, 1);
                          } else {
                            await api.addFavorite(post.id, 1);
                          }
                          setFeed(feed.map(p => p.id === post.id ? { ...p, is_favorite: !p.is_favorite } : p));
                        } catch (e) {
                          console.error('Failed to toggle favorite', e);
                        }
                      }}
                    >
                      <Heart size={18} className={post.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Render content based on post type */}
              {post.media_path ? (
                  <div className="mt-4 mb-3 rounded-xl overflow-hidden border border-gray-100 aspect-video bg-black flex items-center justify-center relative">
                    <MediaPlayer title={post.text} src={post.media_path} style={{ width: '100%', height: '100%' }}>
                      <MediaProvider />
                    </MediaPlayer>
                  </div>
              ) : (
                <p className="text-gray-700 text-[15px]">{post.text}</p>
              )}
              {post.media_path && <p className="text-gray-800 font-medium text-[15px] mt-2">{post.text}</p>}
            </div>
          ))}
        </div>
        
        {/* Aggregation rule form */}
        <div className="p-6 w-full max-w-5xl mx-auto mt-4">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
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
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Typy Treści</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Wideo', 'Shorts', 'Post/Text', 'Stories', 'Live'].map(t => (
                      <label key={t} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-2.5 rounded-lg cursor-pointer border border-transparent hover:border-gray-200">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-l border-gray-100 pl-8">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Sposób Agregacji</label>
                  <select 
                    value={syncMode}
                    onChange={(e) => setSyncMode(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Tylko Ręcznie</option>
                    <option value="schedule">Harmonogram (Pool na czas)</option>
                    <option value="discord">Zewnętrzny Trigger (Discord)</option>
                    <option value="post_dependent">Zależny od innego formatu</option>
                  </select>
                </div>

                {syncMode === 'schedule' && (
                  <div className="space-y-4 mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div>
                      <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Interwał pobierania (w minutach)</label>
                      <input 
                        type="number" 
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {syncMode === 'discord' && (
                  <div className="mt-4 p-4 bg-[#e0e5ff] border border-[#b2bdff] rounded-xl text-sm font-medium text-[#4b59b5] flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                        <MessageCircle size={18} className="shrink-0 mt-0.5" />
                        <p>Podłącz ten Webhook w bocie serwera Discord, aby powiadomienia wywoływały scrapera natychmiastowo.</p>
                    </div>
                    <div className="mt-2">
                      <label className="font-bold block mb-2 text-xs uppercase tracking-wider">Adres Webhook URL:</label>
                      <input type="text" readOnly value="https://api.scraper.local/webhook/discord/..." className="w-full p-2.5 rounded-lg border border-[#b2bdff] bg-white outline-none text-indigo-900 font-mono text-xs" />
                    </div>
                  </div>
                )}

                <button onClick={() => alert('Zapisano nową regułę agregacji!')} className="w-full mt-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Plus size={18} /> Zapisz Nową Regułę Agregacji
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};