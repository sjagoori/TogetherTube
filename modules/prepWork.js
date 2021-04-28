const messageCache = require("./messageCache.js");
const relatedCache = require("./relatedCache.js");
const currentStreams = require("./currentStreams.js");
const getData = require("./getData.js");

/**
 * Function caches messages for given room
 * @param {Object} message - Object with message and room name
 */
exports.cacheMessage = (message) => {
  if (messageCache.getCache(message.room) == undefined)
    messageCache.setCache(message.room, []);
  let cache = messageCache.getCache(message.room);
  cache.push(message);
  messageCache.setCache(message.room, cache);
};

/**
 * Function sends message cache to given room
 * @param {String} room - room name
 * @param {Object} server - server instance
 */
exports.sendMessagesCache = async (room, server) => {
  let cache = await messageCache.getCache(room);

  if (cache != undefined) {
    let renderData = Object.values(cache)
      .map((key) =>
        +new Date() - key.timestamp < 3600000 && key.room == room ? key : false
      )
      .filter((elem) => typeof elem == "object");

    server.to(room).emit("setMessages", renderData);
  }
};

/**
 * Function caches related-videos or sends cached related-videos.
 * @param {String} namespace - namespace + room
 * @param {String} room - room name
 * @param {Object} server - server instance
 */
exports.sendRelatedCache = async (namespace, room, server) => {
  let callString = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${room}&type=video&key=${process.env.API_KEY}`;
  let cache = await relatedCache.getCache(room);

  if (cache == null) {
    await relatedCache.setCache(
      namespace,
      JSON.stringify([await getData.fetch(callString)])
    );
  } else {
    await server.to(namespace).emit("setRelated", JSON.parse(cache));
  }
};

/**
 * Function generates metadata for given video
 * @param {Object} metaData - metadata of video
 * @param {Object} server - io instance
 * @param {String} namespace - namespace + room
 */
exports.setMetaData = (metaData, server, namespace) => {
  server.sockets.adapter.rooms.forEach((key, value) => {
    if (value.startsWith("stream/")) {
      currentStreams.setCache(namespace, {
        title: metaData.title,
        room: metaData.room,
        duration: metaData.duration,
        memberCount: server.sockets.adapter.rooms.get(namespace).size,
        thumbnails: {
          default: `https://img.youtube.com/vi/${metaData.room}/default.jpg`,
          hqdefault: `https://img.youtube.com/vi/${metaData.room}/hqdefault.jpg`,
          medium: `https://img.youtube.com/vi/${metaData.room}/mqdefault.jpg`,
          standard: `https://img.youtube.com/vi/${metaData.room}/sddefault.jpg`,
          maxres: `https://img.youtube.com/vi/${metaData.room}/maxresdefault.jpg`,
        },
      });
    }
  });
};

/**
 * Function retrieves all cached data
 * @returns {Object} - cached data
 */
exports.getCurrentStreams = () => {
  return currentStreams.getAllCaches();
};
