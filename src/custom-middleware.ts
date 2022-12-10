import { App } from "@slack/bolt";
import { config } from "./config";

export function enableAll(app: App) {
  if (config.slackRequestLogEnabled) {
    app.use(async (args: any) => {
      const copiedArgs = JSON.parse(JSON.stringify(args));
      copiedArgs.context.botToken = 'xoxb-***';
      if (copiedArgs.context.userToken) {
        copiedArgs.context.userToken = 'xoxp-***';
      }
      copiedArgs.client = {};
      copiedArgs.logger = {};
      args.logger.debug(
        "Dumping request data for debugging...\n\n" +
        JSON.stringify(copiedArgs, null, 2) +
        "\n"
      );
      const result = await args.next();
      args.logger.debug("next() call completed");
      return result;
    });
  }
}