import { LogLevel } from "@slack/logger";

export function loadEnv() {
  // `cp _env .env` then modify it
  // See https://github.com/motdotla/dotenv
  const configRaw = require("dotenv").config();
  const config = configRaw.parsed;
  // console.log(configRaw);
  // console.log(config);
  // Overwrite env variables anyways
  for (const k in config) {
    process.env[k] = config[k];
  }
}

export interface Config {
  port: number

  slackSigningSecret?: string
  slackBotToken?: string
  slackVerificationToken?: string

  deepLAuthKey?: string
  deepLFreeApiPlan: boolean
  deepLRunnerLanguages: string[]

  slackLogLevel: LogLevel
  slackRequestLogEnabled: boolean
}

export function loadConfigFromEnv(): Config {
  return {
    port: Number(process.env.PORT) || 3000,

    slackBotToken: process.env.SLACK_BOT_TOKEN,
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
    slackVerificationToken: process.env.SLACK_VERIFICATION_TOKEN,

    deepLAuthKey: process.env.DEEPL_AUTH_KEY,
    deepLFreeApiPlan: process.env.DEEPL_FREE_API_PLAN === '1',
    deepLRunnerLanguages: (process.env.DEEPL_RUNNER_LANGUAGES || "en,ja,zh,de,fr,it,es,nl,pl,pt,ru,bg,cs,da,el,et,fi,hu,id,lt,ro,sk,sl,sv,tr,uk").split(","),

    slackLogLevel: process.env.SLACK_LOG_LEVEL as LogLevel || LogLevel.INFO,
    slackRequestLogEnabled: process.env.SLACK_REQUEST_LOG_ENABLED === '1',
  }
}

loadEnv();
const config = Object.freeze(loadConfigFromEnv());
export {
  config,
};