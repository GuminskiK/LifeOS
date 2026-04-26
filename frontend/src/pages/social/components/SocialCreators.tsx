import React from 'react';
import { Filter } from 'lucide-react';
import { getPlatformIcon, getPostTypeIcon } from './SocialHelpers';

type PlatformTab = 'youtube' | 'x' | 'instagram' | 'tiktok';

interface Props {
  activeCreatorId: number | null;
  creators: any[];
  activePlatformTab: PlatformTab;
  setActivePlatformTab: (tab: PlatformTab) => void;
  feed: any[];
}

export const SocialCreators: React.FC<Props> = ({
  activeCreatorId,
  creators,
  activePlatformTab,
  setActivePlatformTab,
  feed
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {creators.filter(c => c.id === activeCreatorId).map(creator => (
        <div key={creator.id} className="p-8 border-b border-gray-100 bg-white shadow-sm z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-200 to-pink-200 shadow-inner flex items-center justify-center text-3xl font-bold text-indigo-800">
              {creator.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{creator.name}</h1>
              <p className="text-gray-500 mt-1">{creator.bio} • {(creator.followers || '0')} Obserwujących</p>
              <div className="flex gap-2 mt-4">
                {creator.platforms?.map((p: any) => (
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

      <div className="flex flex-col flex-1">
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

        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-6">
            <Filter size={18} className="text-gray-400" />
            Wybrany Feed: {activePlatformTab.toUpperCase()}
          </h3>
          
          <div className="space-y-4">
            {feed.filter(p => p.platform?.name?.toLowerCase() === activePlatformTab.toLowerCase() && (!activeCreatorId || p.creator_id === activeCreatorId)).length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400 font-medium">Brak nowych wpisów na tym portalu dla tego twórcy.</p>
              </div>
            ) : feed.filter(p => p.platform?.name?.toLowerCase() === activePlatformTab.toLowerCase() && (!activeCreatorId || p.creator_id === activeCreatorId)).map(post => (
              <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1">{getPostTypeIcon(post.post_type || '')}</div>
                <div>
                  <p className="text-gray-800 font-medium mb-1">{post.text}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase">{post.post_type} • {(new Date(post.created_at || '').toLocaleDateString())}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
