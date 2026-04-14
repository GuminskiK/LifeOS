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
  { id: 1, name: 'MKBHD', bio: 'Tech Reviews', followers: '18M', platforms: [{name: 'youtube', url: 'https://youtube.com/@mkbhd'}, {name: 'x', url: 'https://x.com/mkbhd'}, {name: 'instagram', url: 'https://instagram.com/mkbhd'}, {name: 'tiktok', url: 'https://tiktok.com/@mkbhd'}] },
  { id: 2, name: 'MrBeast', bio: 'Quality Tech Content', followers: '30M', platforms: [{name: 'youtube', url: 'https://youtube.com/@mrbeast'}, {name: 'x', url: 'https://x.com/mrbeast'}] },
  { id: 3, name: 'Lex Fridman', bio: 'Deep Conversations', followers: '4M', platforms: [{name: 'youtube', url: 'https://youtube.com/@lexfridman'}, {name: 'x', url: 'https://x.com/lexfridman'}, {name: 'instagram', url: 'https://instagram.com/lexfridman'}] }
];

const MOCK_POSTS = [
  { id: 1, creator: 'MKBHD', platform: 'youtube', type: 'video', content: 'iPhone 16 Pro Review!', time: '2 hours ago', is_favorite: true, media_url: 'https://files.vidstack.io/sprite-fight/720p.mp4' },
  { id: 2, creator: 'MrBeast', platform: 'x', type: 'text', content: 'Just gave away 100 cars!', time: '3 hours ago', is_favorite: false },
  { id: 3, creator: 'Lex Fridman', platform: 'youtube', type: 'video', content: 'Elon Musk Interview #4', time: '5 hours ago', is_favorite: false, media_url: 'https://files.vidstack.io/sprite-fight/720p.mp4' },
  { id: 4, creator: 'MKBHD', platform: 'instagram', type: 'story', content: 'Behind the scenes at Apple Park', time: '8 hours ago', is_favorite: true }
];

const INITIAL_STATUSES = [
  { id: 1, platform: 'YouTube', status: 'active', lastPoll: '10 mins ago', nextPoll: '50 mins' },
  { id: 2, platform: 'X', status: 'active', lastPoll: '2 mins ago', nextPoll: '13 mins' },
  { id: 3, platform: 'Instagram', status: 'paused', lastPoll: '3 days ago', nextPoll: '-' },
  { id: 4, platform: 'TikTok', status: 'hard_stop', lastPoll: '1 week ago', nextPoll: '-' },
];

export const SocialMain = () => {
  const [activeMainTab, setActiveMainTab] = useState<TabType>('feed');
  const [activeCreatorId, setActiveCreatorId] = useState<number | null>(MOCK_CREATORS[0].id);
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformTab>('youtube');
  
  // Settings State for the active platform tab
  const [syncMode, setSyncMode] = useState('schedule');
  const [syncInterval, setSyncInterval] = useState(60);
  const [syncDays, setSyncDays] = useState<number[]>([1,2,3,4,5]);
  const [syncHours, setSyncHours] = useState({start: '08:00', end: '22:00'});
  const [syncJitter, setSyncJitter] = useState(5);
  const [discordChannel, setDiscordChannel] = useState('');
  const [triggerProcess, setTriggerProcess] = useState('');
  const [contentTypes, setContentTypes] = useState<string[]>(['video']);
  const [statuses, setStatuses] = useState(INITIAL_STATUSES);

  // Creator Modal State
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [editingCreator, setEditingCreator] = useState<any>(null);
  const [showScraperModal, setShowScraperModal] = useState(false);

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
                       <div key={p.name} className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-50 overflow-hidden">
                         {getPlatformIcon(p.name, 10)}
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
                          {MOCK_CREATORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Typy Treści (Można zaznaczyć kilka)</label>
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
                          <option value="post_dependent">Zależny od innego formatu (np. Shorts dążący za Wideo)</option>
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
                          
                          <div>
                            <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Dni Tygodnia</label>
                            <div className="flex flex-wrap gap-2">
                              {['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'].map((day, dIdx) => (
                                <label key={day} className="flex-1 text-center bg-white border border-blue-200 px-1 py-1.5 rounded-md cursor-pointer hover:bg-blue-50 transition-colors">
                                  <span className="text-xs font-bold text-blue-900 block mb-1">{day}</span>
                                  <input type="checkbox" defaultChecked={dIdx < 5} className="rounded text-blue-600 mx-auto block" />
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Godz. Startu</label>
                               <input type="time" defaultValue="08:00" className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                               <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Godz. Końca</label>
                               <input type="time" defaultValue="22:00" className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
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

                      {syncMode === 'post_dependent' && (
                        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3 font-medium text-purple-900">
                          <p className="text-sm">Scrapes selected formats ONLY when the main format below drops a new issue.</p>
                          <label className="text-xs font-bold text-purple-800 uppercase block mt-3 mb-2">Post Główny</label>
                          <select className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="video">Wideo (Long form)</option>
                            <option value="live">Transmisja Live</option>
                          </select>
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
                        <a 
                          key={p.name} 
                          href={p.url} 
                          target="_blank" 
                          rel="noreferrer"
                          title={`Otwórz profil na ${p.name}`}
                          className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full flex items-center gap-2 text-xs font-bold text-gray-600 uppercase hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                        >
                          {getPlatformIcon(p.name, 14)} {p.name}
                        </a>
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
                <div className="col-span-12 space-y-4 max-w-4xl mx-auto w-full">
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
                   <button onClick={() => { setEditingCreator(null); setShowCreatorModal(true); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-blue-700 transition-colors">
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
                            {c.platforms.map(p => (<a key={p.name} href={p.url} target="_blank" rel="noreferrer" title={`Otwórz profil na ${p.name}`} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors">{getPlatformIcon(p.name, 14)}</a>))}
                          </div>
                        </td>
                        <td className="py-4 px-4 gap-2 flex">
                          <button onClick={() => { setEditingCreator(c); setShowCreatorModal(true); }} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">Edytuj</button>
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
                    <div className="mt-3">
                      <button 
                         onClick={() => setStatuses(statuses.map(s => s.id === status.id ? {...s, status: s.status === 'active' ? 'paused' : 'active'} : s))}
                         className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${status.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {status.status === 'active' ? 'Zatrzymaj (Wyłącz)' : 'Uruchom Wznów'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      {showCreatorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingCreator ? 'Edytuj Twórcę' : 'Dodaj Nowego Twórcę'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nazwa Kreatora / Profilu</label>
                <input type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="np. MKBHD" defaultValue={editingCreator?.name} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Krótkie Bio (Opcjonalnie)</label>
                <input type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="np. Kanał technologiczny" defaultValue={editingCreator?.bio} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Obsługiwane Platformy</label>
                <div className="flex gap-2">
                  {['youtube', 'x', 'instagram', 'tiktok'].map(platform => (
                    <label key={platform} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 cursor-pointer">
                      <input type="checkbox" defaultChecked={editingCreator?.platforms?.some((p: any) => p.name === platform)} className="rounded text-blue-500 focus:ring-blue-500" />
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreatorModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Anuluj</button>
              <button onClick={() => { setShowCreatorModal(false); alert('Zapisano'); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Zapisz Twórcę</button>
            </div>
          </div>
        </div>
      )}


      {showCreatorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingCreator ? 'Edytuj Twórcę' : 'Dodaj Nowego Twórcę'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nazwa Kreatora / Profilu</label>
                <input type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="np. MKBHD" defaultValue={editingCreator?.name} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Krótkie Bio (Opcjonalnie)</label>
                <input type="text" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="np. Kanał technologiczny" defaultValue={editingCreator?.bio} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Obsługiwane Platformy</label>
                <div className="flex gap-2">
                  {['youtube', 'x', 'instagram', 'tiktok'].map(platform => (
                    <label key={platform} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 cursor-pointer">
                      <input type="checkbox" defaultChecked={editingCreator?.platforms?.some((p: any) => p.name === platform)} className="rounded text-blue-500 focus:ring-blue-500" />
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreatorModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Anuluj</button>
              <button onClick={() => { setShowCreatorModal(false); alert('Zapisano'); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Zapisz Twórcę</button>
            </div>
          </div>
        </div>
      )}


            {showScraperModal && (
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
                    {MOCK_CREATORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
      )}
</Panel>
    </Group>
  );
};
