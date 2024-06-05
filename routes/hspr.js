const express = require('express');
const router = express.Router();
const athleteController = require('../controllers/athleteController');
const calculatorController = require('../controllers/calculatorController');

router.post('/athlete', athleteController.createAthlete);
router.get('/athlete/check', athleteController.checkAthlete);
router.get('/athletes/firstNames', athleteController.getFirstNames);
router.get('/athletes/lastNames', athleteController.getLastNames);

router.post('/calculate', calculatorController.calculatePointsAndSaveResult);
router.get('/results', calculatorController.getResults);
router.put('/results/:id', calculatorController.updateResult);
router.delete('/results/:id', calculatorController.deleteResult);

router.get('/leaderboard', calculatorController.getLeaderboard);

module.exports = router;
