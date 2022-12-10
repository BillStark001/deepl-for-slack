import { http, Request, Response } from '@google-cloud/functions-framework';
import { int } from 'aws-sdk/clients/datapipeline';
import { config } from './config';
import { verifyRequestSignature, VerifyRequestSignatureParams } from '@slack/events-api';
import { SlackEvent } from './types/event-common';
import { EventCallbackEvent, UrlVerificationEvent } from './types/system-events';
import { ReactionAddedEvent } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { DeepLApi } from './deepl';
import { ConsoleLogger } from '@slack/logger';
import { onReactionAdded } from './events';

interface HttpError extends Error {
  code: int
}

const verifyWebhook = (req: Request) => {

  const slackSignatureRaw = req.headers['x-slack-signature'] || '';
  const requestTimestampRaw = req.headers['x-slack-request-timestamp'] || '';

  const slackSignature = slackSignatureRaw instanceof Array ? slackSignatureRaw[0] : slackSignatureRaw;
  const requestTimestamp = requestTimestampRaw instanceof Array ? Number(requestTimestampRaw[0]) : Number(requestTimestampRaw);

  const signature: VerifyRequestSignatureParams = {
    signingSecret: config.slackSigningSecret || '',
    requestSignature: slackSignature,
    requestTimestamp: requestTimestamp,
    body: req.rawBody instanceof Buffer ? req.rawBody.toString('utf8') : req.rawBody || '',
  };

  // This method throws an exception if an incoming request is invalid.
  verifyRequestSignature(signature);
};

const mainFunction = async (req: Request, res: Response) => {
  try {
    if (req.method !== 'POST') {
      const error = new Error('Only POST requests are accepted') as HttpError;
      error.code = 405;
      throw error;
    }

    if (!req.body) {
      const error = new Error('No data found in body.') as HttpError;
      error.code = 400;
      throw error;
    }

    // Verify that this request came from Slack
    verifyWebhook(req);

    const event = req.body as SlackEvent;
    if (event.type === 'url_verification') {
      const event1 = event as UrlVerificationEvent;
      res.json({ challenge: event1.challenge });
    } else if (event.type === 'event_callback') {
      var eventCallback = event as EventCallbackEvent;
      var innerEvent = eventCallback.event;
      if (innerEvent.type === 'reaction_added') {
        const event2 = innerEvent as ReactionAddedEvent;
        const logger = new ConsoleLogger();
        const client = new WebClient(config.slackBotToken, { logger: logger });
        const deepL = new DeepLApi(config.deepLAuthKey || '', logger);
        await onReactionAdded(event2, client, deepL);
        res.send('');
      }
    } else {
      console.log(event.type);
    }
    
    return Promise.resolve();
  } catch (err) {
    const error = err as HttpError;
    console.error(error);
    res.status(error.code || 500).send(error);
    return Promise.reject(error);
  }
};

http('deepLSlackBot', mainFunction);
/*
import express from 'express';
import bodyParser from "body-parser";
import e from 'express';
const app = express()
const port = 3000
const rawBodyBuffer = (req: Request, res: Response, buf: Buffer, encoding: string) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding as BufferEncoding || 'utf8') as any as Buffer;
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));
app.post('/slack/events', mainFunction);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
*/