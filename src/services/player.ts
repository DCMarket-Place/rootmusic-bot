// src/services/player.ts
// Robust Queue and Playback Engine for RootMusic

import { Track, GuildPlayerState, LoopMode } from '../types';

export class MusicPlayer {
  private static players: Map<string, MusicPlayer> = new Map();
  public state: GuildPlayerState;
  private progressInterval?: NodeJS.Timeout;
  private idleTimeout?: NodeJS.Timeout;

  constructor(guildId: string, channelId: string) {
    this.state = {
      guildId,
      channelId,
      currentTrack: null,
      queue: [],
      history: [],
      volume: 80,
      loopMode: 'off',
      isPlaying: false,
      isPaused: false,
      playbackPosition: 0,
      settings: {
        maxQueueSize: 100,
        allowDuplicates: false,
        autoplay: true,
        idleTimeoutSeconds: 180, // 3 minutes
        defaultVolume: 80,
      },
    };
  }

  public static getPlayer(guildId: string, channelId?: string): MusicPlayer {
    let player = this.players.get(guildId);
    if (!player && channelId) {
      player = new MusicPlayer(guildId, channelId);
      this.players.set(guildId, player);
    }
    return player || new MusicPlayer(guildId, channelId || '');
  }

  public addTrack(track: Track): { added: boolean; reason?: string } {
    if (this.state.queue.length >= this.state.settings.maxQueueSize) {
      return { added: false, reason: 'Queue limit reached (100 tracks max).' };
    }

    if (
      !this.state.settings.allowDuplicates &&
      this.state.queue.some((t) => t.id === track.id)
    ) {
      return { added: false, reason: 'This track is already in the queue.' };
    }

    this.state.queue.push(track);
    this.clearIdleTimer();

    if (!this.state.isPlaying && !this.state.isPaused) {
      this.playNext();
    }

    return { added: true };
  }

  public playNext(): Track | null {
    if (this.state.loopMode === 'track' && this.state.currentTrack) {
      this.state.playbackPosition = 0;
      this.startProgress();
      return this.state.currentTrack;
    }

    if (this.state.currentTrack) {
      this.state.history.unshift(this.state.currentTrack);
      if (this.state.loopMode === 'queue') {
        this.state.queue.push(this.state.currentTrack);
      }
    }

    const nextTrack = this.state.queue.shift() || null;
    this.state.currentTrack = nextTrack;
    this.state.playbackPosition = 0;

    if (nextTrack) {
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.startProgress();
      this.clearIdleTimer();
      return nextTrack;
    } else {
      this.stop();
      this.startIdleTimer();
      return null;
    }
  }

  public pause(): boolean {
    if (!this.state.isPlaying || this.state.isPaused) return false;
    this.state.isPaused = true;
    this.stopProgress();
    return true;
  }

  public resume(): boolean {
    if (!this.state.isPlaying || !this.state.isPaused) return false;
    this.state.isPaused = false;
    this.startProgress();
    return true;
  }

  public skip(): Track | null {
    return this.playNext();
  }

  public stop(): void {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentTrack = null;
    this.state.playbackPosition = 0;
    this.stopProgress();
  }

  public clearQueue(): void {
    this.state.queue = [];
  }

  public shuffle(): void {
    for (let i = this.state.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.state.queue[i], this.state.queue[j]] = [
        this.state.queue[j],
        this.state.queue[i],
      ];
    }
  }

  public setVolume(volume: number): number {
    const clamped = Math.max(0, Math.min(100, volume));
    this.state.volume = clamped;
    return clamped;
  }

  public setLoopMode(mode: LoopMode): LoopMode {
    this.state.loopMode = mode;
    return mode;
  }

  public seek(seconds: number): boolean {
    if (!this.state.currentTrack) return false;
    if (seconds < 0 || seconds > this.state.currentTrack.duration) return false;
    this.state.playbackPosition = seconds;
    return true;
  }

  public removeTrack(index: number): Track | null {
    if (index < 0 || index >= this.state.queue.length) return null;
    const removed = this.state.queue.splice(index, 1);
    return removed[0] || null;
  }

  private startProgress(): void {
    this.stopProgress();
    this.progressInterval = setInterval(() => {
      if (this.state.isPlaying && !this.state.isPaused && this.state.currentTrack) {
        this.state.playbackPosition += 1;
        if (this.state.playbackPosition >= this.state.currentTrack.duration) {
          this.playNext();
        }
      }
    }, 1000);
  }

  private stopProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }

  private startIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimeout = setTimeout(() => {
      console.log(`[MusicPlayer] Idle timeout reached for guild ${this.state.guildId}. Auto-disconnecting.`);
      this.stop();
    }, this.state.settings.idleTimeoutSeconds * 1000);
  }

  private clearIdleTimer(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = undefined;
    }
  }
}
