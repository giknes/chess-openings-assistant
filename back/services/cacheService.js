const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_OPENINGS_LIST || 3600),
  checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD || 600)
});
