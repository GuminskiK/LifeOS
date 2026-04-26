import { smaApi as api } from './client';

export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'x';
export type PostType = 'text' | 'post' | 'story' | 'short' | 'video';
export type ScraperStatus = 'active' | 'paused' | 'hard_stop';

export interface Creator {
  id: number;
  name: string;
  user_id: number;
  platforms?: Platform[];
  bio?: string;
  followers?: string;
}

export interface Platform {
  id: number;
  name: string;
  platform_type: PlatformType;
  creator_id: number;
  posts?: Post[];
  scraper_config?: ScraperConfig;
  url?: string;
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
  is_favorite?: boolean;
}

export interface ScraperConfig {
  id: number;
  platform_id: number;
  post_type?: string;
  active_from?: string;
  active_to?: string;
  status: ScraperStatus;
  poll_interval_minutes?: number;
  schedule_config?: any;
  trigger_type?: 'manual' | 'schedule' | 'discord' | 'post_dependent';
  trigger_config?: any;
  dependency_post_type?: string;
  discord_webhooks?: string[];
  
  // Extended fields from backend JOIN
  platform_name?: string;
  platform_type?: string;
  creator_name?: string;
  last_run?: string;
  nextPoll?: string;
  lastPoll?: string;
  platform?: Platform;
}

export const fetchGlobalFeed = async (): Promise<Post[]> => {
  const response = await api.get<Post[]>('/feed/global');
  return response.data;
};

export const fetchCreators = async (): Promise<Creator[]> => {
  const response = await api.get<Creator[]>('/creators');
  return response.data;
};

export const fetchProcessStatuses = async (): Promise<ScraperConfig[]> => {
  const response = await api.get<ScraperConfig[]>('/aggregator/scraper-configs/all');
  return response.data;
};

export const updateScraperConfig = async (configId: number, data: Partial<ScraperConfig>) => {
  const response = await api.patch<ScraperConfig>(`/aggregator/scraper-configs/${configId}`, data);
  return response.data;
};

export const addScraperConfig = async (data: Partial<ScraperConfig>) => {
  const response = await api.post<ScraperConfig>('/aggregator/scraper-configs/', data);
  return response.data;
};

export const addCreator = async (data: Pick<Creator, 'name' | 'bio' | 'platforms'>) => {
  const response = await api.post<Creator>('/creators', data);
  return response.data;
};

export const updateCreator = async (creatorId: number, data: Partial<Creator>) => {
  const response = await api.patch<Creator>(`/creators/${creatorId}`, data);
  return response.data;
};

export const addPlatform = async (data: { name: string; platform_type: string; creator_id: number }) => {
  const response = await api.post<Platform>('/platforms', data);
  return response.data;
};

export const addFavorite = async (postId: number, user_id: number) => {
  const response = await api.post(`/aggregator/favorite/${postId}?user_id=${user_id}`);
  return response.data;
};

export const removeFavorite = async (postId: number, user_id: number) => {
  const response = await api.delete(`/aggregator/favorite/${postId}?user_id=${user_id}`);
  return response.data;
};

