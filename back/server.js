
require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middlewares/cors'); 
const openingsRoutes = require('./routes/openings');
const app = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Подключение роутов
app.use('/api/openings', openingsRoutes);

// Централизованная обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

});
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`ERROR: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
