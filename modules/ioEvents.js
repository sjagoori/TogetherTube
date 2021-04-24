const messageCache = require("./messageCache");
const relatedCache = require("./relatedCache.js");
const getData = require("./getData.js");

exports.ioEvents = async (client, server) => {
  client.on("join", async (room) => {
    client.join(room);
    client.broadcast.to(room).emit("userJoined");
    client.emit("onlineCount", server.sockets.adapter.rooms.get(room).size);

    await sendRelatedCache(room, server);
    await sendMessagesCache(room, server);

    if (messageCache.getCache(room) == undefined)
      messageCache.setCache(room, []);
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

function cacheMessage(message) {
  let cache = messageCache.getCache(message.room);
  cache.push(message);
  messageCache.setCache(message.room, cache);
}


async function sendMessagesCache(room, server) {
  let cache = messageCache.getCache(room);
  let renderData = Object.values(cache)
    .map((key) =>
      +new Date() - key.timestamp < 3600000 && key.room == room ? key : false
    )
    .filter((elem) => typeof elem == "object");

  server.to(room).emit("setMessages", renderData);
}

async function sendRelatedCache(room, server) {
  let callString = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${room}&type=video&key=${process.env.API_KEY}`;
  let cache = await relatedCache.getCache(room)

  if (cache == null) {
    await relatedCache.setCache(room, JSON.stringify([await getData.fetch(callString)]))
  } else {
    await server.to(room).emit("setRelated", JSON.parse(cache))
  }
}