import type { messageTypeEnum } from '@xd/db/schema/messages';

export interface WsData {
  userId: string;
}

// room message event
export interface RoomMessageEvent {
  roomId: string;
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  type: (typeof messageTypeEnum.enumValues)[number];
}

// message types
// client message
export type ClientMessage =
  | { type: 'subscribe'; payload: { roomId: string } }
  | { type: 'unsubscribe'; payload: { roomId: string } }
  | { type: 'ping'; payload: null };

// server message
export type ServerMessage =
  | { type: 'subscribed'; payload: { roomId: string } }
  | { type: 'unsubscribed'; payload: { roomId: string } }
  | { type: 'pong'; payload: null }
  | { type: 'error'; payload: string }
  | { type: 'new_message'; payload: RoomMessageEvent };
