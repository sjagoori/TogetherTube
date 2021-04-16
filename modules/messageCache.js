const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("messageCache.json");
const db = low(adapter);

/**
 * Function set key:value pair
 * @param {String} room - key
 * @param {Object} value - value
 */
exports.setCache = async (room, value) => {
    db.set(room, value).write();
}

/**
 * Function gets value for given key
 * @param {String} room - key
 * @returns {Object} key's value
 */
exports.getCache = (room) => {
    return db.has(room).value() ? db.get(room).value() : undefined;
}
