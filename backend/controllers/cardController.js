import axios from 'axios';
import * as main from "../utils/init.js"; 
import { ethers, BigNumber } from 'ethers';

export const mintCard = async (req, res) => {
    const { collectionId, userAddress } = req.body;
    const { mainContract } = await main.init();

    try {
    const collection = await mainContract.getCollectionInfo(collectionId);
    if (!collection || collection.length === 0) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    const collectionName = collection[0];
    const collectionCount = collection[2];

    const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.name:${collectionName}`);
    const cards = response.data.data;

    for (let i = 0; i < collectionCount; i++) {
        const tx = await mainContract.mintCard(
        userAddress,
        collectionId, 
        cards[i].id, 
        cards[i].name, 
        cards[i].images.small, 
        cards[i].rarity, 
        false, 
        Math.floor(cards[i].cardmarket.prices.averageSellPrice));
        await tx.wait();
    }

    res.status(200).json({ message: 'Card minted successfully' });
    } catch (error) {
    console.error('Error minting card:', error);
    res.status(500).json({ error: error.message });
    }
};

// Route pour mettre une carte en vente
export const setCardOnSale = async (req, res) => {
    const { cardId, collectionId, price , userAddress} = req.body;
    const { mainContract } = await main.init();

    try {
        const tx = await mainContract.putCardOnSale(collectionId, cardId, price, userAddress);
        await tx.wait(); // Attendre la confirmation de la transaction
        res.json({ message: 'Card put on sale successfully!', txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Route pour retirer une carte de la vente
export const removeCardFromSale = async (req, res) => {
    const { cardId, collectionId, userAddress } = req.body;
    const { mainContract } = await main.init();

    try {
        const tx = await mainContract.removeCardFromSale(collectionId, cardId, userAddress);
        await tx.wait(); // Attendre la confirmation de la transaction
        res.json({ message: 'Card removed from sale successfully!', txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Route pour récupérer toutes les cartes en vente
export const getAllCardsOnSale = async (req, res) => {
    const { mainContract } = await main.init();

    try {
        const cards = await mainContract.getAllCardsOnSale();

        // Mapping des cartes pour un formatage approprié
        const formattedCards = cards.map(card => {
        const cardMetadata = card[0]; // Les informations de la carte
        const collectionId = card[1]; // L'ID de la collection à laquelle appartient la carte

        return {
            cardId: BigNumber.from(cardMetadata[0]).toString(),
            realID: cardMetadata[1],
            name: cardMetadata[2],
            img: cardMetadata[3],
            rarity: cardMetadata[4],
            onSale: cardMetadata[5],
            price: BigNumber.from(cardMetadata[6]).toString(),
            collectionId: BigNumber.from(collectionId).toString()
        };
        });

        // Renvoie des cartes formatées
        res.json(formattedCards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Route pour récupérer les métadonnées d'un NFT spécifique dans une collection
export const getCardMetadata = async (req, res) => {
    const { collectionId, cardId } = req.params;
    const { mainContract } = await main.init();

    try {
        const card = await mainContract.getCardMetadata(collectionId, cardId);

        // Construire les métadonnées en fonction de tous les attributs de la carte
        const metadata = {
        cardId: card[0].toNumber(),
        realID: card[1],
        name: card[2],
        image: card[3],
        rarity: card[4],
        onSale: card[5],
        price: BigNumber.from(card[6]).toString()
        };

        res.status(200).json(metadata);
    } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées :', error);
        res.status(500).json({ error: error.message });
    }
};

export const assignCard = async (req, res) => {
    const { collectionId, cardId } = req.params;
    const { userTo } = req.body;
    const { mainContract, collectionABI, provider } = await main.init();

    try {
        const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
        const collectionContract = new ethers.Contract(collectionAddress, collectionABI, provider.getSigner());

        const tx = await collectionContract.assignCard(cardId, userTo);
        await tx.wait();

        res.status(200).json({ message: 'Card assigned successfully', tx: tx });
    } catch (error) {
        console.error('Error assigning card:', error);
        res.status(500).json({ error: error.message });
    }
};
