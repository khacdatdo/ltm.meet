import {} from 'path';
import app from '../express';
import { createServer } from 'http';
const server = createServer(app);
import { Server } from 'ws';

const sockserver = new Server({ server: server });
sockserver.on('connection', (ws) => {
  ws.on('message', function incoming(data) {
    sockserver.clients.forEach(function each(client) {
      if (client !== ws) {
        const base64 = data.toString('utf8');
        client.send(base64);
      }
    });
  });
});

export default server;
