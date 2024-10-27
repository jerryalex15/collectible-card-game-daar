import express from 'express';
import * as collectionController from '../controllers/collectionController.js';

const router = express.Router();

// Route pour créer une collection
router.post('/create-collection', collectionController.createCollection);

// Route pour récupérer toutes les collections
router.get('/collections', collectionController.getAllCollections);

// Route pour récupérer les informations d'une collection
router.get('/collection/:id', collectionController.getCollectionInfo);

export default router;