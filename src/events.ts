
import { WebClient } from '@slack/web-api';
import { config } from './config';

import { DeepLApi } from './deepl';
import * as reacjilator from './reacjilator';

import { ReactionAddedEvent } from './types/reaction-added';
import { UrlVerificationEvent, UrlVerificationHandler } from './types/system-events'

export async function onReactionAdded(
  event: ReactionAddedEvent, 
  client: WebClient, 
  deepL: DeepLApi,
) {

  if (event.item.type !== 'message') {
    return;
  }
  const channelId = event.item.channel;
  const messageTs = event.item.ts;
  if (!channelId || !messageTs) {
    return;
  }
  const lang = reacjilator.lang(event);
  if (!lang) {
    return;
  }

  const replies = await reacjilator.repliesInThread(client, channelId, messageTs);
  if (replies.messages && replies.messages.length > 0) {
    const message = replies.messages[0];
    if (message.text) {
      const translatedText = await deepL.translate(message.text, lang);
      if (translatedText == null) {
        return;
      }
      if (reacjilator.isAlreadyPosted(replies, translatedText)) {
        return;
      }
      await reacjilator.sayInThread(client, channelId, translatedText, message);
    }
  }
}

export async function onUrlVerification(event: UrlVerificationEvent, handler: UrlVerificationHandler) {
  if (event.token == config.slackVerificationToken) {
    handler(undefined, event.challenge);
  } else {
    handler("Failed to verify authenticity: signature mismatch", undefined);
  }
}