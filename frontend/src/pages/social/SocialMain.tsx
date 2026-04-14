import React, { useState, useEffect } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { 
  Rss, Users, Settings, Activity, MessageCircle, 
  RefreshCcw, Clock, Zap, MessageSquare, PlaySquare, Image as ImageIcon,
  CheckCircle, PauseCircle, AlertTriangle, Filter, MonitorPlay, Camera, Video,
  Heart, Download, Plus, Trash2
} from 'lucide-react';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import * as api from '../../api/socialApi';

type TabType = 'feed' | 'creators' | 'manage' | 'status' | 'favorites';
type PlatformTab = 'youtube' | 'x' | 'instagram' | 'tiktok';

// Mock Data
const MOCK_CREATORS = [
  { id: 1, name: 'MKBHD', bio: 'Tech Reviews', followers: '18M', platforms: ['youtube', 'x', 'instagram', 'tiktok'] },
  { id: 2, name: 'MrBeast', bio: 'Quality Tech Content', followers: '30M', platforms: ['youtube', 'x'] },
  { id: 3, name: 'Lex Fridman', bio: 'Deep Conversations', followers: '4M', platforms: ['youtube', 'x', 'instagram'] }
];

const MOCK_POSTS = [
  { id: 1, creator: 'MKBHD', platform: 'youtube', type: 'video', content: 'iPhone 16 Pro Review!', time: '2 hours ago', is_favorite: true, media_url: 'https://files.vidstack.io/sprite-fight/720p.mp4' },
  { id: 2, creator: 'MrBeast', platform: 'x', type: 'text', content: 'Just gave away 100 cars!', time: '3 hours ago', is_favorite: false },
  { id: 3, creator: 'Lex Fridman', platform: 'youtube', type: 'video', content: 'Elon Musk Interview #4', time: '5 hours ago', is_favorite: false, media_url: 'https://files.vidstack.io/sprite-fight/720p.mp4' },
  { id: 4, creator: 'MKBHD', platform: 'instagram', type: 'story', content: 'Behind the scenes at Apple Park', time: '8 hours ago', is_favorite: true }
];

const MOCK_STATUSES = [
  { platform: 'YouTube', status: 'active', lastPoll: '10 mins ago', nextPoll: '50 mins' },
  { platform: 'X', status: 'active', lastPoll: '2 mins ago', nextPoll: '13 mins' },
  { platform: 'Instagram', status: 'paused', lastPoll: '3 days ago', nextPoll: '-' },
  { platform: 'TikTok', status: 'hard_stop', lastPoll: '1 week ago', nextPoll: '-' },
];

export const SocialMain = () => {
  const [activeMainTab, setActiveMainTab] = useState<TabType>('feed');
  const [activeCreatorId, setActiveCreatorId] = useState<number | null>(MOCK_CREATORS[0].id);
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformTab>('youtube');
  
  // Settings State for the active platform tab
  const [syncMode, setSyncMode] = useState('schedule');
  const [syncInterval, setSyncInterval] = useState(60);

  const getPlatformIcon = (platform: string, size = 20) => {
    switch(platform) {
      case 'youtube': return <MonitorPlay size={size} className="text-red-500" />;
      case 'instagram': return <Camera size={size} className="text-pink-500" />;
      case 'x': return <MessageCircle size={size} className="text-blue-400" />;
      case 'tiktok': return <PlaySquare size={size} className="text-black" />; // TikTok placeholder
      default: return <Rss size={size} />;
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return <MonitorPlay size={16} className="text-red-500" />;
      case 'text': return <MessageSquare size={16} className="text-gray-400" />;
      case 'story': return <Clock size={16} className="text-orange-400" />;
      case 'short': return <Zap size={16} className="text-purple-500" />;
      case 'post': return <ImageIcon size={16} className="text-blue-500" />;
      default: return <MessageSquare size={16} />;
    }
  };

  return (
    <Group orientation="horizontal" className="h-full w-full">
      
      {/* Inner Sidebar Menus */}
      <Panel defaultSize={250} minSize={100} maxSize={500} className="bg-gray-50 border-r border-gray-200 p-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Nawigacja</h2>
        <div className="space-y-1">
          <button 
            onClick={() => setActiveMainTab('feed')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeMainTab === 'feed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Rss size={18} /> Globalny Feed
          </button>
          <button 
            onClick={() => setActiveMainTab('favorites')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeMainTab === 'favorites' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
          >
            <Heart size={18} className={activeMainTab === 'favorites' ? 'fill-red-600' : ''} /> Zapisane / Ulubione
          </button>
          <button 
            onClick={() => setActiveMainTab('creators')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeMainTab === 'creators' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users size={18} /> Twórcy
          </button>
          <button 
            onClick={() => setActiveMainTab('manage')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeMainTab === 'manage' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Settings size={18} /> Zarządzanie
          </button>
          <button 
            onClick={() => setActiveMainTab('status')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeMainTab === 'status' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Activity size={18} /> Status Procesów
          </button>
        </div>

        {activeMainTab === 'creators' && (
          <div className="mt-8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Twoi Twórcy</h2>
            <div className="space-y-1">
              {MOCK_CREATORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCreatorId(c.id)}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCreatorId === c.id ? 'bg-white shadow-sm border border-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <span className="truncate">{c.name}</span>
                  <div className="flex -space-x-1">
                    {c.platforms.slice(0, 3).map(p => (
                       <div key={p} className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-50 overflow-hidden">
                         {getPlatformIcon(p, 10)}
                       </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Panel>
      <Separator className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize" />

      {/* Main Content Area */}
      <Panel className="bg-white flex flex-col">
        {/* VIEW: GLOBAL FEED */}
        {(activeMainTab === 'feed' || activeMainTab === 'favorites') && (
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
                  <span className="text-sm font-bold text-gray-600">Video: 2</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                  <MessageSquare size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-600">Posty: 1</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-600">Stories: 1</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-3xl mx-auto space-y-6">
                {MOCK_POSTS.filter(p => activeMainTab === 'favorites' ? p.is_favorite : true).map(post => (
                  <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center font-bold text-gray-700">
                          {post.creator.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{post.creator}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            {getPlatformIcon(post.platform, 12)} {post.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase">
                          {getPostTypeIcon(post.type)} {post.type}
                        </div>
                        <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
                          <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group" title="Pobierz plik">
                            <Download size={18} className="text-gray-400 group-hover:text-blue-500" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group" title="Dodaj do Ulubionych">
                            <Heart size={18} className={post.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Render content based on post type */}
                    {post.media_url ? (
                       <div className="mt-4 mb-3 rounded-xl overflow-hidden border border-gray-100 aspect-video bg-black flex items-center justify-center relative">
                         <MediaPlayer title={post.content} src={post.media_url} style={{ width: '100%', height: '100%' }}>
                           <MediaProvider />
                         </MediaPlayer>
                       </div>
                    ) : (
                      <p className="text-gray-700 text-[15px]">{post.content}</p>
                    )}
                    {post.media_url && <p className="text-gray-800 font-medium text-[15px] mt-2">{post.content}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CREATORS & PLATFORMS */}
        {activeMainTab === 'creators' && (
          <div className="flex flex-col h-full">
            {/* Creator Header */}
            {MOCK_CREATORS.filter(c => c.id === activeCreatorId).map(creator => (
              <div key={creator.id} className="p-8 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-200 to-pink-200 shadow-inner flex items-center justify-center text-3xl font-bold text-indigo-800">
                    {creator.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">{creator.name}</h1>
                    <p className="text-gray-500 mt-1">{creator.bio} • {creator.followers} Obserwujących</p>
                    <div className="flex gap-2 mt-4">
                      {creator.platforms.map(p => (
                        <div key={p} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                          {getPlatformIcon(p, 14)} {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Platform Tabs & Content */}
            <div className="flex flex-col flex-1 bg-gray-50">
              <div className="flex items-center gap-4 px-8 pt-4 border-b border-gray-200 bg-white">
                {(['youtube', 'x', 'instagram', 'tiktok'] as PlatformTab[]).map(platform => (
                  <button 
                    key={platform}
                    onClick={() => setActivePlatformTab(platform)}
                    className={`flex items-center gap-2 pb-4 pt-2 font-bold transition-all border-b-2 ${activePlatformTab === platform ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    {getPlatformIcon(platform, 18)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
                
                {/* Posts List for Active Platform */}
                <div className="col-span-8 space-y-4">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    Wybrany Feed: {activePlatformTab.toUpperCase()}
                  </h3>
                  {MOCK_POSTS.filter(p => p.platform === activePlatformTab).length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-2xl border border-gray-100">
                      <p className="text-gray-400 font-medium">Brak nowych wpisów na tym portalu dla tego twórcy.</p>
                    </div>
                  ) : MOCK_POSTS.filter(p => p.platform === activePlatformTab).map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                      <div className="mt-1">{getPostTypeIcon(post.type)}</div>
                      <div>
                        <p className="text-gray-800 font-medium mb-1">{post.content}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">{post.type} • {post.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Platform Aggregation Settings Context Panel */}
                <div className="col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Settings size={18} className="text-gray-400" /> Opcje Agregacji
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tryb Pobierania</label>
                        <select 
                          value={syncMode}
                          onChange={(e) => setSyncMode(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="manual">Tylko Ręcznie (Manual)</option>
                          <option value="schedule">Harmonogram (Pool na czas)</option>
                          <option value="post_dependent">Po nowym poście (Pool zależny)</option>
                          <option value="discord">Zewnętrzny Trigger (Discord)</option>
                        </select>
                      </div>

                      {syncMode === 'schedule' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Częstotliwość (m)</label>
                            <input 
                              type="number" 
                              value={syncInterval}
                              onChange={(e) => setSyncInterval(Number(e.target.value))}
                              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Typ Treści dla Configu</label>
                            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="video">Wideo</option>
                              <option value="short">Shorts</option>
                              <option value="story">Stories</option>
                              <option value="live">Transmisja Live</option>
                              <option value="post">Post</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {syncMode === 'post_dependent' && (
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-medium text-indigo-700 space-y-2 flex flex-col mt-3">
                          <p>Oczekuje na główny post, po czym wykonuje pool pobierający dla mniejszego formatu.</p>
                          <label className="font-bold text-indigo-800 mt-2 block">Post główny (od którego to zależy):</label>
                          <select className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="video">Wideo (Long form)</option>
                            <option value="short">Shorts / Reels</option>
                            <option value="story">Stories</option>
                            <option value="live">Transmisja na żywo (Live)</option>
                            <option value="post">Post tekstowy</option>
                          </select>
                        </div>
                      )}

                      {syncMode === 'discord' && (
                        <div className="p-3 bg-[#e0e5ff] border border-[#b2bdff] rounded-lg text-xs font-medium text-[#4b59b5] flex flex-col gap-3 mt-3">
                          <div className="flex items-start gap-2">
                             <MessageCircle size={16} className="shrink-0 mt-0.5" />
                             <p>System czeka na ping od bota Discorda przed rozpoczęciem pobierania na żądanie.</p>
                          </div>
                          <div>
                            <label className="font-bold block mb-1">Zewnętrzny Trigger (Webhook URL):</label>
                            <input type="text" placeholder="https://api.scraper.local/webhook/discord/..." className="w-full p-2 rounded-lg border border-[#b2bdff] bg-white outline-none focus:ring-2 focus:ring-[#8e9ffc] text-indigo-900" />
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Dozwolone Typy Treści</label>
                        <div className="space-y-2">
                          {['Video', 'Shorts', 'Posts/Text', 'Stories'].map(t => (
                            <label key={t} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg cursor-pointer">
                              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                              {t}
                            </label>
                          ))}
                        </div>
                      </div>

                      <button className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl text-sm hover:bg-gray-900 transition-colors flex justify-center items-center gap-2 mt-4 shadow-sm">
                        <RefreshCcw size={16} /> Zapisz Ustawienia
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW: MANAGE */}
        {activeMainTab === 'manage' && (
          <div className="flex flex-col h-full bg-gray-50">
            <div className="p-6 border-b border-gray-100 bg-white">
              <h1 className="text-2xl font-bold text-gray-800">Zarządzanie Twórcami</h1>
              <p className="text-sm text-gray-500 mt-1">Dodawaj, edytuj i usuwaj twórców oraz ich powiązane portale z panelu głównego.</p>
            </div>
            <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-gray-800 text-lg">Twoi Obserwowani Twórcy</h3>
                   <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-blue-700 transition-colors">
                     + Dodaj Twórcę
                   </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Nazwa</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Portale</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase w-32">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_CREATORS.map(c => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center font-bold text-xs text-gray-700">
                              {c.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-bold text-gray-800">{c.name}</p>
                               <p className="text-xs text-gray-400">{c.followers} obserwujących</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1.5">
                            {c.platforms.map(p => (
                              <div key={p} className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                                {getPlatformIcon(p, 14)}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 gap-2 flex">
                          <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">Edytuj</button>
                          <button className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">Usuń</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: STATUS PROCESÓW */}
        {activeMainTab === 'status' && (
          <div className="flex flex-col h-full bg-gray-50">
            <div className="p-6 border-b border-gray-100 bg-white">
              <h1 className="text-2xl font-bold text-gray-800">Status Procesów Agregacji (Scrapery)</h1>
              <p className="text-sm text-gray-500 mt-1">Podgląd działających parserów w tle pobierających najnowsze dane ze światowych platform.</p>
            </div>
            <div className="p-6 overflow-y-auto w-full max-w-5xl mx-auto space-y-4">
              {MOCK_STATUSES.map((status, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gray-50 border border-gray-100">
                      {getPlatformIcon(status.platform.toLowerCase(), 24)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{status.platform} Scraper</h3>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </Panel>
    </Group>
  );
};
