
require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middlewares/cors'); 
const openingsRoutes = require('./routes/openingsRoutes');
const app = express();

// 1. Проверка переменных окружения ДО запуска сервера
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missingVars.forEach(varName => console.error(` - ${varName}`));
  console.error('Server cannot start without these variables');
  process.exit(1); // Завершаем процесс с ошибкой
}

// 2. Middleware
app.use(express.json());
app.use(corsMiddleware);

// 3. Подключение роутов
app.use('/api/openings', openingsRoutes);

// 4. Централизованная обработка ошибок
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  
  // Для Firebase ошибок
  if (err.code && err.code.startsWith('firebase/')) {
    return res.status(500).json({ 
      error: 'Database error',
      code: err.code,
      message: err.message 
    });
  }
  
  res.status(500).json({ error: 'Internal Server Error' });
});

// 5. Обработка 404 (несуществующих маршрутов)
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// 6. Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
});
