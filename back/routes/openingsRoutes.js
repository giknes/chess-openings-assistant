
const express = require('express');
const router = express.Router();
const openingsController = require('../controllers/openingsController');

router.get('/', openingsController.getAllOpenings);
router.get('/:id', openingsController.getOpeningById);
router.post('/:id/popularity', openingsController.incrementPopularity);

module.exports = router;
