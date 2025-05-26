const express = require("express");
const { db } = require("./back/firebase-admin.js");
const NodeCache = require("node-cache");
const admin = require("firebase-admin"); // Добавьте импорт
const app = express();
const cache = new NodeCache({ stdTTL: 3600 });

// Получить все дебюты с вариациями (обновленный GET /Openings)
app.get("/Openings", async (req, res) => {
  try {
    const cachedData = cache.get("openings_with_variations");
    if (cachedData) return res.json(cachedData);

    const openingsSnapshot = await db.collection("Openings")
      .orderBy("popularity", "desc")
      .get();

    // Добавляем вариации для каждого дебюта
    const openings = await Promise.all(
      openingsSnapshot.docs.map(async (doc) => {
        const variationsSnapshot = await doc.ref.collection("variations").get();
        const variations = variationsSnapshot.docs.map(v => v.data());
        return {
          ...doc.data(),
          id: doc.id,
          variations
        };
      })
    );

    cache.set("openings_with_variations", openings);
    res.json(openings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Получить конкретный дебют с вариациями (новый эндпоинт)
app.get("/Openings/:id", async (req, res) => {
  try {
    const cacheKey = `opening_${req.params.id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const doc = await db.collection("Openings").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send("Дебют не найден");

    const variationsSnapshot = await doc.ref.collection("variations").get();
    const variations = variationsSnapshot.docs.map(v => v.data());

    const openingData = {
      ...doc.data(),
      id: doc.id,
      variations
    };

    cache.set(cacheKey, openingData);
    res.json(openingData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Обновление популярности (сброс кэша)
app.post("/Openings/:id/popularity", async (req, res) => {
  try {
    const openingRef = db.collection("Openings").doc(req.params.id);
    await openingRef.update({ 
      popularity: admin.firestore.FieldValue.increment(1) 
    });

    // Сбрасываем кэш для всех связанных данных
    cache.del("openings_with_variations");
    cache.del(`opening_${req.params.id}`);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => console.log("Сервер запущен"));
