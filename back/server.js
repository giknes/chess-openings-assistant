const express = require("express");
const { db } = require("./back/firebase-admin");
const NodeCache = require("node-cache");
const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // Кэш на 1 час

// Получение дебютов с кэшированием по популярности
app.get("/Openings", async (req, res) => {
  try {
    const cachedData = cache.get("popular_openings");
    if (cachedData) return res.json(cachedData);

    const snapshot = await db.collection("Openings")
      .orderBy("popularity", "desc")
      .get();
      
    const Openings = snapshot.docs.map(doc => doc.data());
    cache.set("popular_openings", openings);
    res.json(openings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Обновление популярности дебюта
app.post("/Openings/:id/popularity", async (req, res) => {
  const openingRef = db.collection("openings").doc(req.params.id);
  await openingRef.update({ popularity: admin.firestore.FieldValue.increment(1) });
  cache.del("popular_openings"); // Сброс кэша
  res.sendStatus(200);
});
