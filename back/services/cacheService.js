const NodeCache = require('node-cache');

// Простой сервис кэширования
const cache = new NodeCache({ 
  stdTTL: 3600, // 1 час
  checkperiod: 600
});

module.exports = {
  get: (key) => cache.get(key),
  set: (key, value) => cache.set(key, value),
  del: (keys) => cache.del(keys),
};
