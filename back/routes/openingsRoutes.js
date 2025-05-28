const express = require('express');
const router = express.Router();
const openingsController = require('../controllers/openingsController');

/**
 * @swagger
 * tags:
 *   name: Openings
 *   description: Управление шахматными дебютами
 */

/**
 * @swagger
 * /openings:
 *   get:
 *     summary: Получить список всех дебютов
 *     description: Возвращает список шахматных дебютов, отсортированных по популярности
 *     tags: [Openings]
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                   example: cache
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Opening'
 */
router.get('/', openingsController.getAllOpenings);

/**
 * @swagger
 * /openings/{id}:
 *   get:
 *     summary: Получить детали дебюта по ID
 *     description: Возвращает полную информацию о конкретном дебюте
 *     tags: [Openings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID дебюта
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opening'
 *       404:
 *         description: Дебют не найден
 */
router.get('/:id', openingsController.getOpeningById);

/**
 * @swagger
 * /openings/{id}/popularity:
 *   post:
 *     summary: Увеличить счетчик популярности дебюта
 *     description: Увеличивает счетчик популярности на 1 для указанного дебюта
 *     tags: [Openings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID дебюта
 *     responses:
 *       200:
 *         description: Счетчик успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Популярность успешно обновлена
 *       404:
 *         description: Дебют не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post('/:id/popularity', openingsController.incrementPopularity);
