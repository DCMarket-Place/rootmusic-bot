// src/commands/handler.ts
// Command Dispatcher for RootMusic Bot

import {
  rootServer,
  ChannelMessageCreatedEvent,
} from '@rootsdk/server-bot';
import { MusicPlayer } from '../services/player';
import { SearchResolver } from '../services/search';
import { MusicPanel } from '../services/panel';
import { LoopMode } from '../types';

export class MusicCommandHandler {
  public static async handle(evt: ChannelMessageCreatedEvent): Promise<boolean> {
    const content = evt.messageContent?.trim();
    if (!content || !content.startsWith('/')) return false;

    const parts = content.slice(1).trim().split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    if (!command) return false;

    const guildId = evt.communityId || 'default-community';
    const channelId = evt.channelId;
    const player = MusicPlayer.getPlayer(guildId, channelId);

    const reply = async (msg: string) => {
      await rootServer.community.channelMessages.create({
        channelId: evt.channelId,
        content: msg,
      });
    };

    switch (command) {
      case 'play':
      case 'p': {
        const query = args.join(' ');
        if (!query) {
          await reply('❌ **Usage:** `/play <song title or YouTube URL>`');
          return true;
        }

        await reply(`🔍 **Searching for:** \`${query}\`...`);
        const tracks = await SearchResolver.resolve(query, evt.userId);

        if (tracks.length === 0) {
          await reply(`❌ **No results found for:** \`${query}\`. Please check your spelling or link.`);
          return true;
        }

        const track = tracks[0];
        const result = player.addTrack(track);

        if (!result.added) {
          await reply(`⚠️ **Could not add track:** ${result.reason}`);
          return true;
        }

        if (player.state.currentTrack?.id === track.id) {
          // Track started playing immediately
          const panel = MusicPanel.render(player.state);
          await reply(panel);
        } else {
          // Added to queue
          await reply(
            `✅ **Added to Queue:** [${track.title}](${track.url}) (\`${SearchResolver.formatDuration(
              track.duration
            )}\`)\n📌 **Queue Position:** #${player.state.queue.length}`
          );
        }
        return true;
      }

      case 'pause': {
        const paused = player.pause();
        if (paused) {
          await reply('⏸️ **Playback paused.** Use `/resume` to continue.');
        } else {
          await reply('⚠️ **Player is not active or already paused.**');
        }
        return true;
      }

      case 'resume': {
        const resumed = player.resume();
        if (resumed) {
          await reply('▶️ **Playback resumed!**');
        } else {
          await reply('⚠️ **Player is already playing or not active.**');
        }
        return true;
      }

      case 'skip':
      case 's': {
        const skipped = player.skip();
        if (skipped) {
          await reply(`⏭️ **Skipped! Now playing:** [${skipped.title}](${skipped.url})`);
        } else {
          await reply('⏹️ **Queue ended.** No more tracks to play.');
        }
        return true;
      }

      case 'stop': {
        player.stop();
        player.clearQueue();
        await reply('⏹️ **Music stopped and queue cleared.** Disconnecting player.');
        return true;
      }

      case 'queue':
      case 'q': {
        const queueEmbed = MusicPanel.renderQueue(player.state);
        await reply(queueEmbed);
        return true;
      }

      case 'nowplaying':
      case 'np': {
        const panel = MusicPanel.render(player.state);
        await reply(panel);
        return true;
      }

      case 'loop': {
        const currentMode = player.state.loopMode;
        let newMode: LoopMode = 'off';

        if (args[0]) {
          const arg = args[0].toLowerCase();
          if (arg === 'track' || arg === 'song') newMode = 'track';
          else if (arg === 'queue' || arg === 'all') newMode = 'queue';
          else newMode = 'off';
        } else {
          // Cycle off -> track -> queue -> off
          newMode = currentMode === 'off' ? 'track' : currentMode === 'track' ? 'queue' : 'off';
        }

        player.setLoopMode(newMode);
        await reply(`🔁 **Loop Mode set to:** \`${newMode.toUpperCase()}\``);
        return true;
      }

      case 'shuffle': {
        if (player.state.queue.length < 2) {
          await reply('⚠️ **Not enough tracks in queue to shuffle** (need at least 2).');
          return true;
        }
        player.shuffle();
        await reply(`🔀 **Shuffled ${player.state.queue.length} tracks in queue!**`);
        return true;
      }

      case 'volume':
      case 'vol': {
        const val = parseInt(args[0], 10);
        if (isNaN(val) || val < 0 || val > 100) {
          await reply(`🔊 **Current Volume:** \`${player.state.volume}%\` (Usage: \`/volume <0-100>\`)`);
          return true;
        }
        const updated = player.setVolume(val);
        await reply(`🔊 **Volume adjusted to:** \`${updated}%\``);
        return true;
      }

      case 'clear': {
        player.clearQueue();
        await reply('🧹 **Music queue cleared!**');
        return true;
      }

      case 'seek': {
        const secs = parseInt(args[0], 10);
        if (isNaN(secs)) {
          await reply('❌ **Usage:** `/seek <seconds>`');
          return true;
        }
        const success = player.seek(secs);
        if (success) {
          await reply(`⏩ **Seeked to:** \`${SearchResolver.formatDuration(secs)}\``);
        } else {
          await reply('❌ **Invalid seek position.** Beyond track duration.');
        }
        return true;
      }

      case 'join': {
        await reply('🔊 **RootMusic player initialized in this channel!** Ready for `/play`.');
        return true;
      }

      case 'leave': {
        player.stop();
        await reply('👋 **RootMusic disconnected.**');
        return true;
      }

      case 'help': {
        const help = [
          `🎵 **RootMusic — Command Guide**`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `  \`/play <song/url>\` — Search and play from YouTube`,
          `  \`/pause\` / \`/resume\` — Toggle song playback`,
          `  \`/skip\` — Skip to the next track`,
          `  \`/stop\` — Stop player and clear queue`,
          `  \`/queue\` — View server music queue`,
          `  \`/nowplaying\` — Display live music panel`,
          `  \`/loop [off|track|queue]\` — Set loop mode`,
          `  \`/shuffle\` — Randomize upcoming queue`,
          `  \`/volume <0-100>\` — Adjust playback volume`,
          `  \`/seek <seconds>\` — Jump to specific timestamp`,
          `  \`/clear\` — Remove all tracks from queue`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n');
        await reply(help);
        return true;
      }

      default:
        return false;
    }
  }
}
