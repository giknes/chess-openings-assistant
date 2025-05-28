const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 час по умолчанию

module.exports = {
  get: (key) => cache.get(key),
  set: (key, value, ttl) => cache.set(key, value, ttl),
  del: (keys) => cache.del(keys)
};
