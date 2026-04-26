import React, { useState, useEffect } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import * as api from '../../api/socialApi';

import { SocialSidebar } from './components/SocialSidebar';
import { SocialFeed } from './components/SocialFeed';
import { SocialCreators } from './components/SocialCreators';
import { SocialManage } from './components/SocialManage';
import { SocialStatus } from './components/SocialStatus';
import { CreatorModal, ScraperModal } from './components/SocialModals';

type TabType = 'feed' | 'creators' | 'manage' | 'status' | 'favorites';
type PlatformTab = 'youtube' | 'x' | 'instagram' | 'tiktok';

export const SocialMain = () => {
  const [activeMainTab, setActiveMainTab] = useState<TabType>('feed');
  const [activeCreatorId, setActiveCreatorId] = useState<number | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformTab>('youtube');
  
  // Settings State for the active platform tab
  const [syncMode, setSyncMode] = useState('schedule');
  const [syncInterval, setSyncInterval] = useState(60);
  const [syncDays, setSyncDays] = useState<number[]>([1,2,3,4,5]);
  const [syncHours, setSyncHours] = useState({start: '08:00', end: '22:00'});
  const [syncJitter, setSyncJitter] = useState(5);
  const [contentTypes, setContentTypes] = useState<string[]>(['video']);

  const [statuses, setStatuses] = useState<api.ScraperConfig[]>([]);
  const [creators, setCreators] = useState<api.Creator[]>([]);
  const [feed, setFeed] = useState<api.Post[]>([]);

  const loadData = async () => {
    try {
      const [feedData, creatorsData, statusesData] = await Promise.all([
        api.fetchGlobalFeed(),
        api.fetchCreators(),
        api.fetchProcessStatuses()
      ]);
      setFeed(feedData);
      setCreators(creatorsData);
      setStatuses(statusesData);
    } catch (e) {
      console.error('Failed to load social data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Modal States
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [editingCreator, setEditingCreator] = useState<any>(null);
  const [showScraperModal, setShowScraperModal] = useState(false);

  return (
    <Group orientation="horizontal" className="h-full w-full">
      <SocialSidebar 
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        activeCreatorId={activeCreatorId}
        setActiveCreatorId={setActiveCreatorId}
        creators={creators}
      />
      <Separator className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors cursor-col-resize" />

      <Panel className="bg-white flex flex-col">
        {(activeMainTab === 'feed' || activeMainTab === 'favorites') && (
          <SocialFeed 
            activeMainTab={activeMainTab}
            feed={feed}
            setFeed={setFeed}
            creators={creators}
            syncMode={syncMode}
            setSyncMode={setSyncMode}
            syncInterval={syncInterval}
            setSyncInterval={setSyncInterval}
            syncOptionalStates={{}}
          />
        )}

        {activeMainTab === 'creators' && (
          <SocialCreators 
            activeCreatorId={activeCreatorId}
            creators={creators}
            activePlatformTab={activePlatformTab}
            setActivePlatformTab={setActivePlatformTab}
            feed={feed}
          />
        )}

        {activeMainTab === 'manage' && (
          <SocialManage 
            creators={creators}
            setEditingCreator={setEditingCreator}
            setShowCreatorModal={setShowCreatorModal}
          />
        )}

        {activeMainTab === 'status' && (
          <SocialStatus 
            statuses={statuses}
            setStatuses={setStatuses}
            setShowScraperModal={setShowScraperModal}
          />
        )}
      </Panel>

      {showCreatorModal && (
        <CreatorModal 
          editingCreator={editingCreator}
          setShowCreatorModal={setShowCreatorModal}
          onSaveCreator={loadData}
        />
      )}

      {showScraperModal && (
        <ScraperModal 
          setShowScraperModal={setShowScraperModal}
          creators={creators}
          contentTypes={contentTypes}
          setContentTypes={setContentTypes}
          syncMode={syncMode}
          setSyncMode={setSyncMode}
          syncInterval={syncInterval}
          setSyncInterval={setSyncInterval}
          syncDays={syncDays}
          setSyncDays={setSyncDays}
          syncHours={syncHours}
          setSyncHours={setSyncHours}
          syncJitter={syncJitter}
          setSyncJitter={setSyncJitter}
        />
      )}
    </Group>
  );
};
