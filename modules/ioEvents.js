const messageCache = require("./messageCache");
const relatedCache = require("./relatedCache.js");
const getData = require("./getData.js");

exports.ioEvents = async (client, server) => {
  client.on("join", async (room) => {
    client.join(room);
    client.broadcast.to(room).emit("userJoined");

    sendRelatedCache(room, server);
    sendMessagesCache(room, server);

    if (server.sockets.adapter.rooms.get(room))
      client.emit("onlineCount", server.sockets.adapter.rooms.get(room).size);
    if (messageCache.getCache(room) == undefined)
      messageCache.setCache(room, []);
  });

  client.on("state", (emitted) => {
    server.to(emitted.room).emit("state", emitted);

    emitted.playing
      ? server.to(emitted.room).emit("playback", true)
      : server.to(emitted.room).emit("playback", false);
  });

  client.on("message", (message) => {
    console.dir(message);
    let cache = messageCache.getCache(message.room);
    cache.push(message);
    messageCache.setCache(message.room, cache);
    client.broadcast.to(message.room).emit("message", message);
  });
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