# 🎵 RootMusic — Next-Generation Music Player for RootApp

RootMusic is an advanced audio queue system and live music panel designed for Root communities (`rootapp.com`). Built on the official `@rootsdk/server-bot` with TypeScript, optimized for 24/7 autonomous cloud execution on RootApp Cloud.

## Features

- **Instant Search & Play**: Fast YouTube lookup and direct audio stream integration (`/play <song/url>`).
- **Full Queue Management**: `/queue`, `/skip`, `/pause`, `/resume`, `/stop`, `/shuffle`, `/clear`, `/remove`.
- **Loop Modes**: Cycle between `Track`, `Queue`, or `Off` (`/loop`).
- **Live Interactive Panel**: Dynamic audio progress bar, volume indicator, and now-playing status (`/nowplaying`).
- **Anti-Blocking Engine**: Resilient YouTube oEmbed metadata extraction preventing 429 rate limits.
- **Auto Disconnect**: Idle timer disconnects when queue is empty to preserve server resources.

## Commands

| Command | Arguments | Description |
|---|---|---|
| `/play` | `<song/url>` | Search YouTube or play direct audio link |
| `/pause` | | Pause current playback |
| `/resume` | | Resume paused playback |
| `/skip` | | Skip to the next track in queue |
| `/stop` | | Stop player and clear queue |
| `/queue` | | Display the current server playlist |
| `/nowplaying` | | Display live progress bar and track details |
| `/loop` | `[off/track/queue]` | Toggle track or queue loop mode |
| `/shuffle` | | Randomize upcoming songs in queue |
| `/volume` | `<0-100>` | Adjust player volume level |
| `/seek` | `<seconds>` | Jump to specific timestamp |
| `/clear` | | Clear all queued songs |
| `/help` | | View music command manual |
