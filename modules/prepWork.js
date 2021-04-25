const messageCache = require("./messageCache");
const relatedCache = require("./relatedCache.js");
const getData = require("./getData.js");

/**
 * Function caches messages for given room
 * @param {Object} message - Object with message and room name
 */
exports.cacheMessage = (message) => {
  if (messageCache.getCache(message.room) == undefined) messageCache.setCache(message.room, []);
  let cache = messageCache.getCache(message.room);
  console.log(cache)
  cache.push(message);
  messageCache.setCache(message.room, cache);
}

/**
 * Function sends message cache to given room
 * @param {String} room - room name
 * @param {Object} server - server instance
 */
exports.sendMessagesCache = async (room, server) => {
  let cache = await messageCache.getCache(room);
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
exports.sendRelatedCache = async (room, server) => {
  let callString = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${room}&type=video&key=${process.env.API_KEY}`;
  let cache = await relatedCache.getCache(room)

  if (cache == null) {
    await relatedCache.setCache(room, JSON.stringify([await getData.fetch(callString)]))
  } else {
    await server.to(room).emit("setRelated", JSON.parse(cache))
  }
}
