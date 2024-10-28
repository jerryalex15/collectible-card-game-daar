import * as main from "../utils/init.js";
import { ethers, BigNumber } from 'ethers';

export const getUserCards = async (req, res) => {
    const { userAddress } = req.params;
    const { mainContract } = await main.init();

    try {
    const [collectionIds, cardIds] = await mainContract.getAllCardsOwnedByUser(userAddress);
    const ownedCards = await Promise.all(collectionIds.map(async (collectionId, index) => {
        const cardId = cardIds[index].toNumber();
        const cardMetadata = await mainContract.getCardMetadata(collectionId.toNumber(), cardId);

        return {
        cardId: cardMetadata[0].toNumber(),
        realID: cardMetadata[1],
        name: cardMetadata[2],
        img: cardMetadata[3],
        rarity: cardMetadata[4],
        onSale: cardMetadata[5],
        price: BigNumber.from(cardMetadata[6]).toString(),
        collectionId : BigNumber.from(collectionId).toString()
        };
    }));

    res.status(200).json({ ownedCards });
    } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: error.message });
    }
};

export const getUserCardsInCollection = async (req, res) => {
    const { collectionId, userAddress } = req.params;
    const { mainContract, collectionABI, provider } = await main.init();

    try {
        // Récupère tous les IDs de collections et de cartes possédés par l'utilisateur dans toutes les collections
        const [allCollectionIds, allCardIds] = await mainContract.getAllCardsOwnedByUser(userAddress);

        // Filtre pour inclure uniquement les cartes de la collection spécifiée par collectionId
        const filteredCardIds = allCardIds.filter((_, index) => allCollectionIds[index] == collectionId);

        // Récupère l'adresse de la collection depuis le contrat Main   
        const collectionContract = new ethers.Contract(collectionAddress, collectionABI, provider);

        // Récupère les métadonnées de chaque carte filtrée possédée par l'utilisateur
        const ownedCards = await Promise.all(filteredCardIds.map(async (cardId) => {
        const card = await collectionContract.getCard(cardId);

        // Construit et renvoie les métadonnées des cartes
        return {
            cardId: card[0].toNumber(),
            realID: card[1],
            name: card[2],
            image: card[3],
            rarity: card[4],
            onSale: card[5],
            price:  BigNumber.from(card[6]).toString()
        };
        }));

        res.status(200).json({ collectionId, userAddress, ownedCards });
    } catch (error) {
        console.error('Error fetching user cards with metadata:', error);
        res.status(500).json({ error: 'Error fetching user cards', details: error.message });
    }
};

export const buyCard = async (req, res) => {
    const { collectionId, cardId, buyerAddress } = req.body;
    const { mainContract } = await main.init();

    try {
        // Récupérer le prix de la carte depuis le contrat
        const cardPrice = await mainContract.getCardPrice(collectionId, cardId);
        const tx = await mainContract.buyCardOnSale(collectionId, cardId, buyerAddress, { value: cardPrice });
        await tx.wait(); // Attendre que la transaction soit confirmée
        res.json({ message: 'Carte achetée avec succès !', txHash: tx.hash });
    } catch (error) {
        console.error('Erreur lors de l\'achat de la carte :', error);
        res.status(500).json({ error: error.message });
    }
};



