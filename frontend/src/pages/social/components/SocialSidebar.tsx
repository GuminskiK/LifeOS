import React from 'react';
import { Panel } from 'react-resizable-panels';
import { Rss, Heart, Users, Settings, Activity } from 'lucide-react';
import { getPlatformIcon } from './SocialHelpers';

type TabType = 'feed' | 'creators' | 'manage' | 'status' | 'favorites';

interface Props {
  activeMainTab: TabType;
  setActiveMainTab: (tab: TabType) => void;
  activeCreatorId: number | null;
  setActiveCreatorId: (id: number) => void;
  creators: any[];
}

export const SocialSidebar: React.FC<Props> = ({
  activeMainTab,
  setActiveMainTab,
  activeCreatorId,
  setActiveCreatorId,
  creators
}) => {
  return (
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
            {creators.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCreatorId(c.id)}
                className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCreatorId === c.id ? 'bg-white shadow-sm border border-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <span className="truncate">{c.name}</span>
                <div className="flex -space-x-1">
                  {c.platforms?.slice(0, 3).map((p: any) => (
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
  );
};
