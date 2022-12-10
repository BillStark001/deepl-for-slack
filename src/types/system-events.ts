import { SlackEvent } from "./event-common";

export interface UrlVerificationEvent extends SlackEvent {
  token: string,
  challenge: string,
}

export interface EventCallbackEvent extends SlackEvent {
  team_id: string, 
  api_app_id: string, 
  event: SlackEvent, 
  event_id: string, 
  event_time: number, 
  authorizations: Array<EventAuthorization>, 
  is_ext_shared_channel: boolean, 
  event_context: string, 
}

export interface EventAuthorization {
  enterprise_id?: string,
  team_id?: string,
  user_id: string,
  is_bot: boolean,
  is_enterprise_install: boolean
}


export interface UrlVerificationHandler {
  (err?: string, challenge?: string): void;
}