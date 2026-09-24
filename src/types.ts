// src/types.ts
// Comprehensive Type Definitions for RootMusic Bot

export interface Track {
  id: string;
  title: string;
  url: string;
  duration: number; // in seconds
  thumbnail?: string;
  requestedBy: string;
  source: 'youtube' | 'spotify' | 'soundcloud' | 'stream';
}

export type LoopMode = 'off' | 'track' | 'queue';

export interface PlayerSettings {
  maxQueueSize: number;
  allowDuplicates: boolean;
  autoplay: boolean;
  idleTimeoutSeconds: number;
  defaultVolume: number;
}

export interface GuildPlayerState {
  guildId: string;
  channelId: string;
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  volume: number;
  loopMode: LoopMode;
  isPlaying: boolean;
  isPaused: boolean;
  playbackPosition: number; // seconds
  settings: PlayerSettings;
  panelMessageId?: string;
}
