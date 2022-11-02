import { WebSocket } from 'ws';

export interface IWebSocket extends WebSocket {
  data: IUser & IJoinedData;
}

export interface IUser {
  id: string;
  name: string;
  peerId: string;
}

export interface IRoom {
  id: string;
  users: IUser[];
}

export type TRooms = IRoom[];

export enum EEvent {
  users = 'users',
  joined = 'joined',
  newPeer = 'new-peer',
  left = 'left',
  chat = 'chat',
}

export interface IMessage {
  type: EEvent;
  data: any;
}

export interface IJoinedData {
  roomId: string;
  name: string;
  peerId: string;
}

export interface IClientChatMessage {
  message: string;
}

export interface IChat {
  senderId: string;
  senderName: string;
  message: string;
}
