import { config } from './config';

import { App } from '@slack/bolt';
import { ConsoleLogger, LogLevel } from '@slack/logger';
import * as middleware from './custom-middleware';

import { WebClient } from '@slack/web-api';

import { DeepLApi } from './deepl';
import * as runner from './runner';
import * as reacjilator from './reacjilator';

const logLevel = config.slackLogLevel;
const logger = new ConsoleLogger();
logger.setLevel(logLevel);

const deepLAuthKey = config.deepLAuthKey;
if (!deepLAuthKey) {
  throw "DEEPL_AUTH_KEY is missing!";
}
const deepL = new DeepLApi(deepLAuthKey, logger);

const app = new App({
  logLevel,
  logger,
  token: config.slackBotToken!!,
  signingSecret: config.slackSigningSecret!!,
  deferInitialization: true,
});
middleware.enableAll(app);

// -----------------------------
// shortcut
// -----------------------------

app.shortcut("deepl-translation", async ({ ack, body, client }) => {
  await ack();
  await runner.openModal(client, body.trigger_id);
});

app.view("run-translation", async ({ ack, client, body }) => {
  const text = body.view.state.values.text.a.value!;
  const lang = body.view.state.values.lang.a.selected_option!.value;

  await ack({
    response_action: "update",
    view: runner.buildLoadingView(lang, text)
  });

  const translatedText: string | null = await deepL.translate(text, lang);

  await client.views.update({
    view_id: body.view.id,
    view: runner.buildResultView(lang, text, translatedText || ":x: Failed to translate it for some reason")
  });
});

app.view("new-runner", async ({ body, ack }) => {
  await ack({
    response_action: "update",
    view: runner.buildNewModal(body.view.private_metadata)
  })
})

// -----------------------------
// reacjilator
// -----------------------------

import { ReactionAddedEvent } from './types/reaction-added';
import * as events from './events';
app.event("reaction_added", async ({ body, client }) => {
  await events.onReactionAdded(body.event as ReactionAddedEvent, client, deepL);
});

// -----------------------------
// starting the app
// -----------------------------

(async () => {
  try {
    await app.init();
    await app.start(config.port);
    console.log('⚡️ Bolt app is running!');
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

