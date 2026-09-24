// src/main.ts
// RootMusic Main Server Entrypoint

import {
  rootServer,
  RootBotStartState,
  ChannelMessageEvent,
  ChannelMessageCreatedEvent,
  MessageType,
  RootApiException,
} from '@rootsdk/server-bot';

import { MusicCommandHandler } from './commands/handler';

async function onStarting(state: RootBotStartState): Promise<void> {
  console.log('🎵 Starting RootMusic Audio Engine...');

  rootServer.community.channelMessages.on(
    ChannelMessageEvent.ChannelMessageCreated,
    handleMessageCreated
  );

  console.log('✅ RootMusic successfully initialized and listening for music commands!');
}

async function handleMessageCreated(evt: ChannelMessageCreatedEvent): Promise<void> {
  // Ignore system messages or messages without content
  if (evt.messageType === MessageType.System || !evt.messageContent) return;

  try {
    await MusicCommandHandler.handle(evt);
  } catch (err: unknown) {
    if (err instanceof RootApiException) {
      console.error('Root API Exception in RootMusic:', err.errorCode, err.message);
    } else {
      console.error('Unexpected error in RootMusic:', err);
    }
  }
}

// Start RootMusic
(async () => {
  try {
    await rootServer.lifecycle.start(onStarting);
  } catch (err) {
    console.error('Fatal: Failed to start RootMusic server:', err);
  }
})();
