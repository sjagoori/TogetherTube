// import { sendMessagesCache, sendRelatedCache, cacheMessage } from './prepWork.js'
const worker = require('./prepWork.js')
/**
 * Function handles socket.io events
 * @param {Object} client - socket instance
 * @param {Object} server - io server instance
 */
exports.ioEvents = async (client, server) => {
  client.on("join", async (room) => {
    client.join(room);
    client.broadcast.to(room).emit("userJoined");
    client.emit("onlineCount", server.sockets.adapter.rooms.get(room).size);

    await worker.sendRelatedCache(room, server);
    await worker.sendMessagesCache(room, server);
  });

  client.on("state", (emitted) => {
    server.to(emitted.room).emit("state", emitted);
  });

  client.on('playback', (state) => {
    server.to(state.room).emit('playback', state.state)
  })

  client.on("message", (message) => {
    worker.cacheMessage(message);
    client.broadcast.to(message.room).emit("message", message);
  });
}
