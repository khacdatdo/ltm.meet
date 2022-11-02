import {} from 'path';
import app from '../express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer(app);

const io = new Server(server);
const rooms = {};

io.on('connection', function (socket) {
  // on user joined room
  socket.on('joined', function (roomId, viewerData) {
    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }
    rooms[roomId][viewerData.id] = viewerData;

    // join room
    socket.join(roomId);

    // update users list
    io.in(roomId).emit('users', rooms[roomId]);

    // send to anyone in the room that a new user has joined
    socket.to(roomId).emit('connected', viewerData);

    // on message
    socket.on('message', function (roomId, data) {
      socket.to(roomId).emit('message', data);
    });

    // on someone toggle mic
    socket.on('toggle-mic', function (roomId, userId) {
      rooms[roomId][userId].mic = !rooms[roomId][userId].mic;
      socket.to(roomId).emit('toggle-mic', userId);
    });

    // on someone toggle camera
    socket.on('toggle-video', function (roomId, userId) {
      rooms[roomId][userId].video = !rooms[roomId][userId].video;
      socket.to(roomId).emit('toggle-video', userId);
    });

    // on disconnect
    socket.on('disconnect', function () {
      // remove user from room
      delete rooms[roomId][viewerData.id];
      // send to anyone in the room that a user has left
      socket.to(roomId).emit('left', viewerData);
    });
  });
});

export default server;
