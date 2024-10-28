import express from 'express';
import * as cardController from '../controllers/cardController.js';

const router = express.Router();

// Route pour mint tous les cartes
router.post('/mint-card', cardController.mintCard);

// Route pour mettre une carte en vente
router.post('/setOnSale-card', cardController.setCardOnSale);

// Route pour retirer une carte de la vente
router.post('/remove-card-from-sale', cardController.removeCardFromSale);

// Route pour récupérer toutes les cartes en vente
router.get('/get-all-cards-on-sale', cardController.getAllCardsOnSale);

// Route pour récupérer les métadonnées d'un NFT spécifique dans une collection
router.get('/collection/:collectionId/nft/:cardId', cardController.getCardMetadata);

// Route pour assigner une carte à un autre utilisateur
router.get('/collection/:collectionId/card/:cardId/assign', cardController.assignCard);

export default router;