module.exports = {
  CACHE_TTL: {
    OPENINGS_LIST: 3600,     // 1 час (можно увеличить, так как данные статичны)
    OPENING_DETAILS: 86400   // 24 часа (данные почти не меняются)
  },
  
  CACHE_KEYS: {
    OPENINGS_ALL: 'openings_all',
    OPENING_BY_ID: (id) => `opening_${id}`
  },
  
  FIRESTORE_COLLECTIONS: {
    OPENINGS: 'Openings',
    VARIATIONS: 'variations'
  },
  
  ERROR_MESSAGES: {
    OPENING_NOT_FOUND: 'Дебют не найден',
    SERVER_ERROR: 'Внутренняя ошибка сервера'
  },
  
  SUCCESS_MESSAGES: {
    POPULARITY_UPDATED: 'Популярность успешно обновлена'
  }
};
