const asyncRedis = require("async-redis");

/**
 * Function sets key:value pair
 * @param {String} key key
 * @param {String} value value
 * @returns status code
 */
exports.setCache = (key, value) => {
  const client = asyncRedis.createClient({
    host: process.env.REDIS_URL,
    password: process.env.REDIS_PASS,
    port: process.env.REDIS_PORT,
  });
  let data = client.set(key, value);
  client.quit();
  return data;
};

/**
 * Function gets key:value pair
 * @param {String} key key
 * @returns value of key
 */
exports.getCache = async (key) => {
  const client = asyncRedis.createClient({
    host: process.env.REDIS_URL,
    password: process.env.REDIS_PASS,
    port: process.env.REDIS_PORT,
  });
  let data = await client.get(key);
  client.quit();
  return data;
};

/**
 * Function gets values for multiple keys
 * @param {Object} keys object of keys
 * @returns object of values
 */
exports.getMultiple = async (keys) => {
  const client = asyncRedis.createClient({
    host: process.env.REDIS_URL,
    password: process.env.REDIS_PASS,
    port: process.env.REDIS_PORT,
  });
  let data = await client.mget(keys);
  client.quit();
  return data;
};

/**
 * Function deletes key:value pair
 * @param {String} key key
 * @returns status code
 */
exports.deleteCache = (key) => {
  const client = asyncRedis.createClient({
    host: process.env.REDIS_URL,
    password: process.env.REDIS_PASS,
    port: process.env.REDIS_PORT,
  });

  let data = client.del(key);
  client.quit();
  return data;
};
