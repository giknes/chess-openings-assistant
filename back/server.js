const express = require("express");
const { db } = require("./back/firebase-admin.js");
const NodeCache = require("node-cache");
const admin = require("firebase-admin"); 
const app = express();
const cache = new NodeCache({ stdTTL: 3600 });

// Middleware для обработки CORS и JSON
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Получить все дебюты с PGN и вариациями
app.get("/Openings", async (req, res) => {
  try {
    const cachedData = cache.get("openings_with_details");
    if (cachedData) return res.json(cachedData);

    const openingsSnapshot = await db.collection("Openings")
      .orderBy("popularity", "desc")
      .get();

    const openings = await Promise.all(
      openingsSnapshot.docs.map(async (doc) => {
        const variationsSnapshot = await doc.ref.collection("variations").get();
        
        return {
          id: doc.id,
          name: doc.data().name,
          eco: doc.data().eco,
          popularity: doc.data().popularity,
          pgn: doc.data().pgn, // Добавляем PGN дебюта
          variations: variationsSnapshot.docs.map(v => ({
            id: v.id,
            name: v.data().name,
            pgn: v.data().pgn // PGN вариации
          }))
        };
      })
    );

    cache.set("openings_with_details", openings);
    res.json(openings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить конкретный дебют с деталями
app.get("/Openings/:id", async (req, res) => {
  try {
    const cacheKey = `opening_${req.params.id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const doc = await db.collection("Openings").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Дебют не найден" });

    const variationsSnapshot = await doc.ref.collection("variations").get();

    const response = {
      id: doc.id,
      name: doc.data().name,
      eco: doc.data().eco,
      popularity: doc.data().popularity,
      pgn: doc.data().pgn, // Основной PGN дебюта
      variations: variationsSnapshot.docs.map(v => ({
        id: v.id,
        name: v.data().name,
        pgn: v.data().pgn, // PGN вариации
        description: v.data().description // Доп поле из примера
      }))
    };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление популярности (без изменений)
app.post("/Openings/:id/popularity", async (req, res) => {
  try {
    const openingRef = db.collection("Openings").doc(req.params.id);
    await openingRef.update({ 
      popularity: admin.firestore.FieldValue.increment(1) 
    });

    cache.del("openings_with_details");
    cache.del(`opening_${req.params.id}`);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Сервер запущен на порту 3000"));
