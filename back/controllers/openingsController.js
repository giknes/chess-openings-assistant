const { db, FieldValue } = require('../utils/firebase');
const cacheService = require('../services/cacheService');
const constants = require('../config/constants');

module.exports = {
  /**
   * Получение всех дебютов с вариациями (только чтение)
   */
  getAllOpenings: async (req, res) => {
    try {
      const cacheKey = constants.CACHE_KEYS.OPENINGS_ALL;
      const cachedData = cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          source: 'cache',
          data: cachedData
        });
      }

      // Получение неизменяемых данных из Firestore
      const openingsSnapshot = await db.collection(constants.FIRESTORE_COLLECTIONS.OPENINGS)
        .select('name', 'eco', 'pgn') // Только неизменяемые поля
        .orderBy('popularity', 'desc')
        .get();

      // Обработка данных (без запросов к вариациям, если они статичны)
      const openings = openingsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        eco: doc.data().eco,
        pgn: doc.data().pgn,
        // Если вариации статичны и не меняются, их можно хранить в основном документе
        variations: doc.data().variations || [] 
      }));

      cacheService.set(cacheKey, openings, constants.CACHE_TTL.OPENINGS_LIST);
      
      res.json({
        source: 'database',
        data: openings
      });
      
    } catch (error) {
      console.error('Error fetching openings:', error);
      res.status(500).json({ 
        error: constants.ERROR_MESSAGES.SERVER_ERROR 
      });
    }
  },

  /**
   * Получение конкретного дебюта по ID (только чтение)
   */
  getOpeningById: async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = constants.CACHE_KEYS.OPENING_BY_ID(id);
      const cachedData = cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          source: 'cache',
          data: cachedData
        });
      }

      const doc = await db.collection(constants.FIRESTORE_COLLECTIONS.OPENINGS)
        .doc(id)
        .get();
      
      if (!doc.exists) {
        return res.status(404).json({ 
          error: constants.ERROR_MESSAGES.OPENING_NOT_FOUND 
        });
      }

      const openingData = {
        id: doc.id,
        name: doc.data().name,
        eco: doc.data().eco,
        popularity: doc.data().popularity, // Только для чтения
        pgn: doc.data().pgn,
        variations: doc.data().variations || [] // Если вариации статичны
      };

      cacheService.set(cacheKey, openingData, constants.CACHE_TTL.OPENING_DETAILS);
      
      res.json({
        source: 'database',
        data: openingData
      });
      
    } catch (error) {
      console.error(`Error fetching opening ${id}:`, error);
      res.status(500).json({ 
        error: constants.ERROR_MESSAGES.SERVER_ERROR 
      });
    }
  },

  /**
   * Увеличение счетчика популярности (единственная операция записи)
   */
  incrementPopularity: async (req, res) => {
    try {
      const { id } = req.params;
      const openingRef = db.collection(constants.FIRESTORE_COLLECTIONS.OPENINGS).doc(id);
      
      // Атомарное обновление только поля popularity
      await openingRef.update({
        popularity: FieldValue.increment(1)
      });

      // Инвалидация только связанных кэшей
      cacheService.del([
        constants.CACHE_KEYS.OPENINGS_ALL,
        constants.CACHE_KEYS.OPENING_BY_ID(id)
      ]);
      
      res.json({ 
        success: true,
        message: constants.SUCCESS_MESSAGES.POPULARITY_UPDATED
      });
      
    } catch (error) {
      console.error(`Error updating popularity for ${req.params.id}:`, error);
      
      if (error.code === 'not-found') {
        return res.status(404).json({ 
          error: constants.ERROR_MESSAGES.OPENING_NOT_FOUND 
        });
      }
      
      res.status(500).json({ 
        error: constants.ERROR_MESSAGES.SERVER_ERROR 
      });
    }
  }
};
