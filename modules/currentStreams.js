const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("currentStreams.json");
const db = low(adapter);

/**
 * Function set key:value pair
 * @param {String} room - key
 * @param {Object} value - value
 */
exports.setCache = async (room, value) => {
  db.set(room, value).write();
};

/**
 * Function gets value for given key
 * @param {String} room - key
 * @returns {Object} key's value
 */
exports.getCache = (room) => {
  return db.has(room).value() ? db.get(room).value() : undefined;
};

/**
 * Function fetches the entire cache.
 * @return {Object} - the entire cache
 */
exports.getAllCaches = () => {
  return db.getState();
};

/**
 * Function deletes a given room entry
 * @param {String} room - key
 */
exports.deleteCache = (room) => {
  db.unset(room).write();
};
