// src/services/panel.ts
// Interactive Music Panel and Status Card Renderer for RootMusic

import { GuildPlayerState } from '../types';
import { SearchResolver } from './search';

export class MusicPanel {
  public static render(state: GuildPlayerState): string {
    const track = state.currentTrack;

    if (!track) {
      return [
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `🎵 **Root Music Player — Idle**`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `💤 **No song is currently playing.**`,
        `💡 Use \`/play <song name or link>\` to start listening!`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ].join('\n');
    }

    const currentFormatted = SearchResolver.formatDuration(state.playbackPosition);
    const totalFormatted = SearchResolver.formatDuration(track.duration);

    // Dynamic Progress Bar (16 blocks)
    const percentage = Math.min(
      100,
      Math.floor((state.playbackPosition / track.duration) * 100)
    );
    const totalBars = 14;
    const filledBars = Math.floor((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

    const statusIcon = state.isPaused ? '⏸️ [PAUSED]' : '▶️ [PLAYING]';
    const loopStatus =
      state.loopMode === 'track'
        ? '🔂 Track'
        : state.loopMode === 'queue'
        ? '🔁 Queue'
        : 'Off';

    return [
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎵 **Root Music — Live Audio Panel**`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `${statusIcon} **[${track.title}](${track.url})**`,
      `👤 **Requested by:** <@${track.requestedBy}>`,
      `⏱️ \`${currentFormatted} / ${totalFormatted}\` [${progressBar}] **${percentage}%**`,
      `🔊 **Volume:** \`${state.volume}%\` | 🔁 **Loop:** \`${loopStatus}\` | 📜 **Queue:** \`${state.queue.length} track(s)\``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎛️ **Quick Controls:**`,
      `  • \`/pause\` / \`/resume\` — Toggle playback`,
      `  • \`/skip\` — Next track in queue`,
      `  • \`/loop\` — Toggle loop mode`,
      `  • \`/queue\` — View upcoming tracks`,
      `  • \`/stop\` — Stop player and disconnect`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ].join('\n');
  }

  public static renderQueue(state: GuildPlayerState): string {
    if (!state.currentTrack && state.queue.length === 0) {
      return '📜 **The music queue is currently empty.** Use `/play <song>` to queue up tracks!';
    }

    const lines: string[] = [];
    if (state.currentTrack) {
      lines.push(
        `▶️ **Now Playing:** [${state.currentTrack.title}](${state.currentTrack.url}) (\`${SearchResolver.formatDuration(
          state.currentTrack.duration
        )}\`)`
      );
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }

    if (state.queue.length === 0) {
      lines.push('*(No more tracks in queue)*');
    } else {
      state.queue.slice(0, 10).forEach((t, i) => {
        lines.push(
          `**${i + 1}.** [${t.title}](${t.url}) — \`${SearchResolver.formatDuration(
            t.duration
          )}\` | <@${t.requestedBy}>`
        );
      });

      if (state.queue.length > 10) {
        lines.push(`*...and ${state.queue.length - 10} more tracks in queue.*`);
      }
    }

    return [
      `📜 **RootMusic — Current Server Queue**`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...lines,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🔁 Loop: \`${state.loopMode.toUpperCase()}\` | 🔊 Volume: \`${state.volume}%\``,
    ].join('\n');
  }
}
