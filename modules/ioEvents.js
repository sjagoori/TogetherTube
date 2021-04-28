const worker = require("./prepWork.js");
const namespace = "stream/"; 

/**
 * Function handles socket.io events
 * @param {Object} client - socket instance
 * @param {Object} server - io server instance
 */
exports.ioEvents = async (client, server) => {
  server.emit("setCurrentStreams", worker.getCurrentStreams());

  client.on("join", async (room) => {
    client.join(namespace + room);

    client.broadcast.to(namespace + room).emit("userJoined");
    client.emit(
      "onlineCount",
      server.sockets.adapter.rooms.get(namespace + room).size
    );

    await worker.sendRelatedCache(namespace + room, room, server);
    await worker.sendMessagesCache(room, server);
  });

  client.on("state", (emitted) => {
    server.to(namespace + emitted.room).emit("state", emitted);
  });

  client.on("playback", (state) => {
    server.to(namespace + state.room).emit("playback", state.state);
  });

  client.on("message", (message) => {
    worker.cacheMessage(message);
    client.broadcast.to(namespace + message.room).emit("message", message);
  });

  client.on("setMetaData", (metaData) => {
    worker.setMetaData(metaData, server, namespace + metaData.room);
  });
};
