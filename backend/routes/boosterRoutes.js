import express from 'express';
import * as boosterController from '../controllers/boosterController.js';

const router = express.Router();

// Route pour mint tous les cartes
router.post('/create-booster', boosterController.createBooster);

// Route pour acquerir tous le booster
router.post('/acquire-booster', boosterController.acquireBooster);

// Route pour ouvrir un booster
router.post('/unpack-booster', boosterController.unpackBooster);

// Route pour ouvrir un booster
router.get('/list-boosters', boosterController.listBoosters);

export default router;