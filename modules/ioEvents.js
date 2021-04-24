const messageCache = require("./messageCache");
const relatedCache = require("./relatedCache.js");
const getData = require("./getData.js");

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

    if (messageCache.getCache(room) == undefined) messageCache.setCache(room, []);

    await sendRelatedCache(room, server);
    await sendMessagesCache(room, server);
  });

  client.on("state", (emitted) => {
    server.to(emitted.room).emit("state", emitted);
  });

  client.on('playback', (state) => {
    server.to(state.room).emit('playback', state.state)
  })

  client.on("message", (message) => {
    cacheMessage(message);
    client.broadcast.to(message.room).emit("message", message);
  });
}

/**
 * Function caches messages for given room
 * @param {Object} message - Object with message and room name
 */
function cacheMessage(message) {
  let cache = messageCache.getCache(message.room);
  cache.push(message);
  messageCache.setCache(message.room, cache);
}

/**
 * Function sends message cache to given room
 * @param {String} room - room name
 * @param {Object} server - server instance
 */
async function sendMessagesCache(room, server) {
  console.log(typeof server)
  let cache = messageCache.getCache(room);
  let renderData = Object.values(cache)
    .map((key) =>
      +new Date() - key.timestamp < 3600000 && key.room == room ? key : false
    )
    .filter((elem) => typeof elem == "object");

  server.to(room).emit("setMessages", renderData);
}

/**
 * Function caches related-videos or sends cached related-videos.
 * @param {String} room - room name
 * @param {Object} server - server instance
 */
async function sendRelatedCache(room, server) {
  let callString = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${room}&type=video&key=${process.env.API_KEY}`;
  let cache = await relatedCache.getCache(room)

  if (cache == null) {
    await relatedCache.setCache(room, JSON.stringify([await getData.fetch(callString)]))
  } else {
    await server.to(room).emit("setRelated", JSON.parse(cache))
  }
}