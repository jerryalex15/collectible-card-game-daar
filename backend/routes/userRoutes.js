import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Route pour obtenir toutes les cartes possédées par un utilisateur
router.get('/user/:userAddress/cards', userController.getUserCards);

// Route pour obtenir toutes les cartes possédées par un utilisateur dans une collection spécifique avec leurs métadonnées
router.get('/collection/:collectionId/user/:userAddress/cards', userController.getUserCardsInCollection);

// Route pour obtenir toutes les cartes possédées par un utilisateur dans une collection spécifique avec leurs métadonnées
router.post('/buy-card', userController.buyCard);

export default router;