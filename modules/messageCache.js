const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("messageCache.json");
const db = low(adapter);

/**
 * Function set key:value pair
 * @param {String} room - key
 * @param {Object} value - value
 */
async function setCache(room, value) {
    db.set(room, value).write();
}

module.exports.setCache = setCache;

/**
 * Function gets value for given key
 * @param {String} room - key
 * @returns {Object} key's value
 */
function getCache(room) {
    return db.has(room).value() ? db.get(room).value() : undefined;
}

module.exports.getCache = getCache;