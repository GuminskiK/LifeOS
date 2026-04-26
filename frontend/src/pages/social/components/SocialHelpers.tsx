import React from 'react';
import { MonitorPlay, Camera, MessageCircle, PlaySquare, Rss, MessageSquare as MessageSquareIcon, Clock, Zap, Image as ImageIcon } from 'lucide-react';

export const getPlatformIcon = (platform: string, size = 20) => {
  const norm = platform?.toLowerCase() || '';
  switch(norm) {
    case 'youtube': return <MonitorPlay size={size} className="text-red-500" />;
    case 'instagram': return <Camera size={size} className="text-pink-500" />;
    case 'x': return <MessageCircle size={size} className="text-blue-400" />;
    case 'tiktok': return <PlaySquare size={size} className="text-black" />;
    default: return <Rss size={size} />;
  }
};

export const getPostTypeIcon = (type: string) => {
  const norm = type?.toLowerCase() || '';
  switch(norm) {
    case 'video': return <MonitorPlay size={16} className="text-red-500" />;
    case 'text': return <MessageSquareIcon size={16} className="text-gray-400" />;
    case 'story': return <Clock size={16} className="text-orange-400" />;
    case 'short': return <Zap size={16} className="text-purple-500" />;
    case 'post': return <ImageIcon size={16} className="text-blue-500" />;
    case 'image': return <ImageIcon size={16} className="text-blue-500" />;
    default: return <MessageSquareIcon size={16} />;
  }
};
