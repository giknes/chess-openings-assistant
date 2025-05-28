// Времена жизни кэша (в секундах)
module.exports.CACHE_TTL = {
  OPENINGS_LIST: 3600,    // 1 час для списка дебютов
  OPENING_DETAILS: 1800,  // 30 минут для деталей дебюта
  VARIATIONS: 3600        // 1 час для вариаций
};

// Ключи для кэширования
module.exports.CACHE_KEYS = {
  OPENINGS_ALL: 'Openings_all',
  OPENING_BY_ID: (id) => `opening_${id}`,
  VARIATIONS: (openingId) => `variations_${openingId}`
};

// Названия коллекций Firestore
module.exports.FIRESTORE_COLLECTIONS = {
  OPENINGS: 'Openings',
  VARIATIONS: 'variations'
};

// Сообщения об ошибках
module.exports.ERROR_MESSAGES = {
  OPENING_NOT_FOUND: 'Дебют не найден',
  VARIATION_NOT_FOUND: 'Вариация не найдена',
  DB_ERROR: 'Ошибка базы данных',
  INVALID_REQUEST: 'Неверный запрос'
};

// Коды статусов HTTP
module.exports.HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Прочие конфигурационные параметры
module.exports.CONFIG = {
  MAX_ITEMS_PER_PAGE: 50,
  DEFAULT_PAGE_SIZE: 10,
  POPULARITY_INCREMENT: 1
};
