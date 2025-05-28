const { db, FieldValue } = require('../config/firebase-admin');
const cache = require('../services/cacheService');
const constants = require('../config/constants');

module.exports = {
  getAllOpenings: async (req, res) => {
    try {
      const cacheKey = constants.CACHE_KEYS.OPENINGS_ALL;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return res.json({ source: 'cache', data: cachedData });
      }

      const openingsSnapshot = await db.collection(constants.FIRESTORE_COLLECTIONS.OPENINGS)
        .orderBy('popularity', 'desc')
        .get();

      const openings = await Promise.all(
        openingsSnapshot.docs.map(async (doc) => {
          const variationsSnapshot = await doc.ref.collection(constants.FIRESTORE_COLLECTIONS.VARIATIONS).get();
          
          return {
            id: doc.id,
            name: doc.data().name,
            eco: doc.data().eco,
            popularity: doc.data().popularity,
            pgn: doc.data().pgn,
            variations: variationsSnapshot.docs.map(v => ({
              id: v.id,
              name: v.data().name,
              pgn: v.data().pgn
            }))
          };
        })
      );

      cache.set(cacheKey, openings, constants.CACHE_TTL.OPENINGS_LIST);
      res.json({ source: 'database', data: openings });
    } catch (error) {
      console.error('Error fetching openings:', error);
      res.status(500).json({ error: constants.ERROR_MESSAGES.SERVER_ERROR });
    }
  },

  getOpeningById: async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = constants.CACHE_KEYS.OPENING_BY_ID(id);
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return res.json({ source: 'cache', data: cachedData });
      }

      const doc = await db.collection(constants.FIRESTORE_COLLECTIONS.OPENINGS).doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: constants.ERROR_MESSAGES.OPENING_NOT_FOUND });
      }

      const variationsSnapshot = await doc.ref.collection(constants.FIRESTORE_COLLECTIONS.VARIATIONS).get();

      const response = {
        id: doc.id,
        name: doc.data().name,
        eco: doc.data().eco,
        popularity: doc.data().popularity,
        pgn: doc.data().pgn,
        variations: variationsSnapshot.docs.map(v => ({
          id: v.id,
          name: v.data().name,
          pgn: v.data().pgn,
          description: v.data().description
        }))
      };

      cache.set(cacheKey, response, constants.CACHE_TTL.OPENING_DETAILS);
      res.json({ source: 'database', data: response });
    } catch (error) {
      console.error(`Error fetching opening ${id}:`, error);
      res.status(500).json({ error: constants.ERROR_MESSAGES.SERVER_ERROR });
    }
  },

  incrementPopularity: async (req, res) => {
    try {
      const { id } = req.params;
      const openingRef = db.collection(constants.FIRESTORE_COLLECTIONS.OPENINGS).doc(id);
      
      await openingRef.update({ 
        popularity: FieldValue.increment(1) 
      });

      cache.del([
        constants.CACHE_KEYS.OPENINGS_ALL,
        constants.CACHE_KEYS.OPENING_BY_ID(id)
      ]);
      
      res.sendStatus(200);
    } catch (error) {
      console.error(`Error updating popularity for ${id}:`, error);
      res.status(500).json({ error: constants.ERROR_MESSAGES.SERVER_ERROR });
    }
  }
};
