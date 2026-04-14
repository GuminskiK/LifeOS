import { api } from './client';

export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'x';
export type PostType = 'text' | 'post' | 'story' | 'short' | 'video';
export type ScraperStatus = 'active' | 'paused' | 'hard_stop';

export interface Creator {
  id: number;
  name: string;
  user_id: number;
  platforms?: Platform[];
}

export interface Platform {
  id: number;
  name: string;
  platform_type: PlatformType;
  creator_id: number;
  posts?: Post[];
  scraper_config?: ScraperConfig;
}

export interface Post {
  id: number;
  name: string;
  text?: string;
  source_url?: string;
  media_path?: string;
  created_at?: string;
  post_type: PostType;
  platform_id: number;
  platform?: Platform;
}

export interface ScraperConfig {
  id: number;
  platform_id: number;
  post_type?: string;
  active_from?: string;
  active_to?: string;
  status: ScraperStatus;
  poll_interval_minutes?: number;
  trigger_type?: 'manual' | 'schedule' | 'discord' | 'post_dependent';
  dependency_post_type?: string;
  discord_webhooks?: string[];
}

export const fetchGlobalFeed = async (): Promise<Post[]> => {
  // Mock for now, replace with actual call:
  // const response = await api.get<Post[]>('/social/feed');
  // return response.data;
  return [];
};

export const fetchCreators = async (): Promise<Creator[]> => {
  // Mock
  return [];
};

export const fetchProcessStatuses = async (): Promise<ScraperConfig[]> => {
  // Mock
  return [];
};

export const updateScraperConfig = async (configId: number, data: Partial<ScraperConfig>) => {
  return {};
};
