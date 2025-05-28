// firebase-admin.js
const admin = require("firebase-admin");
const serviceAccount = require("./back/data/chess-bd.json"); // Путь к ключу

// Инициализация Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Получаем доступ к Firestore
module.exports = { db }; // Экспортируем для использования в других файлах
