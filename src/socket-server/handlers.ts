import { WebSocket } from 'ws';
import { ROOMS, SocketServer } from '.';
import { EEvent, IChat, IClientChatMessage, IJoinedData, IMessage, IWebSocket } from '../@types';

/**
 * Gửi một thông điệp đến các client đang hoạt động
 * @param clients Danh sách các kết nối đang hoạt động
 * @param data Thông điệp cần gửi
 * @param excludedClients (Tuỳ chọn) Không gửi thông điệp đến các client này
 */
export const sendBroadcast = (
  clients: Set<WebSocket>,
  data: IMessage,
  excludedClients: Set<WebSocket> = new Set()
) => {
  clients.forEach((client) => {
    if (!excludedClients.has(client)) {
      client.send(JSON.stringify(data));
    }
  });
};

/**
 * Xử lý sự kiện khi có một client tham gia phòng
 * @param clientSocket Client socket
 * @param data Thông điệp từ client
 */
export const onJoined = (clientSocket: IWebSocket, data: IJoinedData) => {
  clientSocket.data = { ...clientSocket.data, ...data };
  let room = ROOMS.find((r) => r.id === data.roomId);
  console.log('join');
  if (!room) {
    room = {
      id: data.roomId,
      users: [{ id: clientSocket.data.id, name: data.name, peerId: data.peerId }],
    };
    ROOMS.push(room);
  } else {
    room.users.push({
      id: clientSocket.data.id,
      name: data.name,
      peerId: data.peerId,
    });
  }
  // Thông báo cho mọi người trong phòng rằng có người vừa tham gia
  sendBroadcast(
    // @ts-ignore
    Array.from(SocketServer.clients).filter((client: IWebSocket) => {
      if (client.data.id === clientSocket.data.id) return false;
      return room.users.some((u) => u.id === client.data.id);
    }),
    {
      type: EEvent.newPeer,
      data: {
        id: clientSocket.data.id,
        name: data.name,
        peerId: data.peerId,
      },
    }
  );
  // Gửi trả `client` danh sách người đang tham gia phòng
  clientSocket.send(
    JSON.stringify({
      type: EEvent.users,
      data: room.users,
    } as IMessage)
  );
};

export const onChat = (clientSocket: IWebSocket, data: IClientChatMessage) => {
  const room = ROOMS.find((r) => r.id === clientSocket.data.roomId);
  if (room) {
    sendBroadcast(
      // @ts-ignore
      Array.from(SocketServer.clients).filter((client: IWebSocket) => {
        if (client === clientSocket) return false;
        return room.users.some((u) => u.id === client.data.id);
      }),
      {
        type: EEvent.chat,
        data: {
          senderId: clientSocket.data.id,
          senderName: clientSocket.data.name,
          message: data.message,
        } as IChat,
      }
    );
  }
};
