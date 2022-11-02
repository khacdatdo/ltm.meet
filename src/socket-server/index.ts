import { createServer } from 'http';
import { v4 } from 'uuid';
import { WebSocketServer } from 'ws';
import { EEvent, IJoinedData, IMessage, IUser, IWebSocket, TRooms } from '../@types';
import app from '../express';
import { onChat, onJoined, sendBroadcast } from './handlers';

const HttpServer = createServer(app);

/**
 * Socket Server
 */
export const SocketServer = new WebSocketServer({
  server: HttpServer,
});

/**
 * Chứa danh sách các phòng kèm thông tin từng phòng
 */
export let ROOMS: TRooms = [];

// Khi client kết nối thành công
SocketServer.on('connection', (ws: IWebSocket) => {
  ws.data = {} as IUser & IJoinedData;

  // Khởi tạo biến lưu id phòng
  let roomId: string;

  // Tạo ID cho client vừa kết nối
  ws.data.id = v4();

  // Khi có thông điệp từ client gửi lên
  ws.on('message', (message) => {
    // Parse data về đúng dịnh dạng
    let jsonMessage: IMessage;
    try {
      jsonMessage = JSON.parse(message.toString());
    } catch (error) {
      return;
    }

    // Lấy loại thông điệp từ `message`
    const type = jsonMessage.type;

    // Xử lí phù hợp với từng loại thông điệp
    switch (type) {
      case EEvent.joined:
        // Lưu id phòng vào biến `roomId`
        roomId = jsonMessage.data.roomId;
        // Xử lý data
        onJoined(ws, jsonMessage.data);
        break;

      case EEvent.chat:
        onChat(ws, jsonMessage.data);
        break;

      default:
        break;
    }
  });

  // Khi client ngắt kết nối
  ws.on('close', () => {
    // Tìm phòng theo ID
    const room = ROOMS.find((r) => r.id === roomId);
    // Nếu phòng tồn tại
    if (room) {
      // Loại bỏ người dùng có id = clientId
      room.users = room.users.filter((u) => u.id !== ws.data.id);
      // Nếu phòng không còn ai thì xoá phòng khỏi mảng ROOMS
      if (!room.users.length) ROOMS = ROOMS.filter((r) => r.id !== roomId);
      // Thông báo cho những người còn lại
      sendBroadcast(
        // @ts-ignore
        Array.from(SocketServer.clients).filter((client: IWebSocket) =>
          room.users.some((u) => u.id === client.data.id)
        ),
        {
          type: EEvent.left,
          data: ws.data,
        }
      );
    }
  });
});

export default HttpServer;
