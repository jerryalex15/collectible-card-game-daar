import express from 'express';
import { ethers, BigNumber } from 'ethers';
import dotenv from 'dotenv';
import pokemon from 'pokemontcgsdk';
import getRandomIntInclusive from './random.js';
import axios from 'axios';
import cors from 'cors';
import contractsJson from './../frontend/src/contracts.json' with { type: 'json' };
import { sign } from 'crypto';
import * as main from "./contrat.js";

dotenv.config();
pokemon.configure({apiKey: '123abc'})
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173' // Remplace cela par l'URL de ton frontend
}));

const contracts = contractsJson.contracts; 
const { address, abi } = contracts.Main

const rpcUrl = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

if (!rpcUrl || !privateKey) {
    throw new Error("Please set all the environment variables: RPC_URL, PRIVATE_KEY, MAIN_CONTRACT_ADDRESS");
}

// Route pour créer une collection
app.post('/create-collection', async (req, res) => {
  const { collectionPokemonID } = req.body;
  console.log(collectionPokemonID);
  const { mainContract, collectionABI,provider } = await main.init();
  
  try {
    // Appeler l'API Pokémon TCG pour obtenir les détails de la carte
    const response = await axios.get(`https://api.pokemontcg.io/v2/sets/${collectionPokemonID}`);
    const collection = response.data.data;

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found in Pokémon TCG API' });
    }

    const resp = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${collectionPokemonID}`);
    const cards = resp.data.data;
    const cardCount = cards.length;

    
    console.log(`Creating collection with name: ${collection.name} and cardCount: ${cardCount}`);
    
    // Appeler la fonction de création de collection avec le userSigner
    const tx = await mainContract.createCollection(collection.name, cardCount);
    await tx.wait();

    res.status(200).json({ message: 'Collection created', transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ message: 'Error while creating collection', error: error.message });
  }
});

// Route pour mint une carte NFT à un utilisateur (on va dire au hasard)
app.post('/mint-card', async (req, res) => {
  const { collectionId } = req.body; // Récupérer les informations de la requête
  console.log('Received collectionId for minting:', collectionId); // Log
  const { mainContract, collectionABI,provider } = await main.init();
  try {
    const collection = await mainContract.getCollectionInfo(collectionId);
    if (!collection || collection.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    const collectionName = collection[0];
    const collectionCount = collection[2];
    console.log('Collection name:', collectionName); // Log

    const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.name:${collectionName}`);
    const cards = response.data.data;

    cards.length
    for (let i = 0; i < collectionCount; i++) {
        const tx = await mainContract.mintCard(
        collectionId, 
        cards[i].id, 
        cards[i].name, 
        cards[i].images.small, 
        cards[i].rarity, 
        false, 
        Math.floor(cards[i].cardmarket.prices.averageSellPrice));
      await tx.wait(); // Attendre que la transaction soit confirmée
    }

    res.status(200).json({ message: 'Card minted successfully' });
  } catch (error) {
    console.error('Error minting card:', error); // Log d'erreur
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer toutes les collections
app.get('/collections', async (req, res) => {
  const { mainContract, collectionABI,provider } = await main.init();

  try {
    const collections = await mainContract.getAllCollections();
    const result = collections.map((collection, index) => ({
      collectionId: index, // Utiliser l'index comme ID de collection
      name: collection.name,
      collectionAddress: collection.collectionAddress,
      cardCount: collection.cardCount.toString(),
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les informations d'une collection
app.get('/collection/:id', async (req, res) => {
  const { id } = req.params;
  const { mainContract, collectionABI,provider } = await main.init();

  try {
    const collectionInfo = await mainContract.getCollectionInfo(id);
    res.status(200).json({
      name: collectionInfo[0],
      collectionAddress: collectionInfo[1],
      cardCount: collectionInfo[2]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint to assign a card from one user to another
app.post('/collection/:collectionId/card/:cardId/assign', async (req, res) => {
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
});



// Endpoint pour mettre une carte en vente
app.post('/setOnSale-card', async (req, res) => {
  const { cardId, collectionId, price , userAddress} = req.body;
  const { mainContract, collectionABI, provider } = await main.init();

  try {
    const tx = await mainContract.putCardOnSale(collectionId, cardId, price, userAddress);
    await tx.wait(); // Attendre la confirmation de la transaction
    res.json({ message: 'Card put on sale successfully!', txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour retirer une carte de la vente
app.post('/remove-card-from-sale', async (req, res) => {
  const { cardId, collectionId, userAddress } = req.body;
  const { mainContract, collectionABI, provider } = await main.init();

  try {
    const tx = await mainContract.removeCardFromSale(collectionId, cardId, userAddress);
    await tx.wait(); // Attendre la confirmation de la transaction
    res.json({ message: 'Card removed from sale successfully!', txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour récupérer toutes les cartes en vente
app.get('/get-all-cards-on-sale', async (req, res) => {
  const { mainContract, collectionABI, provider } = await main.init();

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
});




// API Endpoint to get all cards owned by a user in a specific collection with metadata
app.get('/api/collection/:collectionId/user/:userAddress/cards', async (req, res) => {
  const { collectionId, userAddress } = req.params;
  const { mainContract, collectionABI, provider } = await main.init();

  try {
    // Retrieve all collection and card IDs owned by the user across all collections
    const [allCollectionIds, allCardIds] = await mainContract.getAllCardsOwnedByUser(userAddress);

    // Filter to only include cards from the specified collectionId
    const filteredCardIds = allCardIds.filter((_, index) => allCollectionIds[index] == collectionId);

    // Retrieve the collection address from the Main contract
    const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
    const collectionContract = new ethers.Contract(collectionAddress, collectionABI, provider);

    // Retrieve metadata for each filtered card owned by the user
    const ownedCards = await Promise.all(filteredCardIds.map(async (cardId) => {
      const card = await collectionContract.getCard(cardId);

      // Construct and return card metadata
      return {
        cardId: card[0].toNumber(),
        realID: card[1],
        name: card[2],
        image: card[3], // Assuming img is a URL or base64 data
        rarity: card[4],
        onSale: cardMetadata[5],
        price:  BigNumber.from(cardMetadata[6]).toString()
      };
    }));

    res.status(200).json({ collectionId, userAddress, ownedCards });
  } catch (error) {
    console.error('Error fetching user cards with metadata:', error);
    res.status(500).json({ error: 'Error fetching user cards', details: error.message });
  }
});

// Endpoint to get all cards owned by a user with metadata
app.get('/user/:userAddress/cards', async (req, res) => {
  const { userAddress }= req.params
  const { mainContract, collectionABI, provider } = await main.init();

  try {
      // Appel à la fonction qui retourne tous les collectionIds et cardIds pour l'utilisateur
      const [collectionIds, cardIds] = await mainContract.getAllCardsOwnedByUser(userAddress);

      // Récupère toutes les métadonnées en une seule fois
      const ownedCards = await Promise.all(collectionIds.map(async (collectionId, index) => {
          const cardId = cardIds[index].toNumber();

          // Appel direct à `getCardMetadata` dans `mainContract`
          const cardMetadata = await mainContract.getCardMetadata(collectionId.toNumber(), cardId);
          // BigNumber.from(card.price.hex).toString()
          // Formatage des métadonnées de la carte
          return {
              cardId: cardMetadata[0].toNumber(),
              realID: cardMetadata[1],
              name: cardMetadata[2],
              img: cardMetadata[3],
              rarity: cardMetadata[4],
              onSale: cardMetadata[5],
              price: BigNumber.from(cardMetadata[6]).toString()
          };
      }));

      res.status(200).json({ ownedCards });
  } catch (error) {
      console.error('Error fetching cards:', error);
      res.status(500).json({ error: error.message });
  }
});


// Route to retrieve metadata for a specific NFT within a collection
app.get('/collection/:collectionId/nft/:tokenId', async (req, res) => {
  const { collectionId, tokenId } = req.params;
  const { mainContract, collectionABI,provider } = await main.init();

  try {
    const card = await mainContract.getCardMetadata(collectionId, tokenId);

    // Construct metadata based on all the card attributes
    const metadata = {
      cardId: card[0].toNumber(),
      realID: card[1],
      name: card[2],
      image: card[3], // Assuming img is a URL or base64 data
      rarity: card[4],
      onSale: card[5],
      price: BigNumber.from(card[6]).toString()
    };

    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error retrieving metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint to buy a card
app.post('/api/collection/:collectionId/card/:cardId/buy', async (req, res) => {
  const { collectionId, cardId } = req.params;
  const { buyerAddress } = req.body; // The buyer's address should be passed in the request body
  const { mainContract, collectionABI,provider } = await main.init();
  
  try {
    // Retrieve the collection address from the Main contract
    const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
    
    // Create a new instance of the Collection contract
    const collectionContract = new ethers.Contract(collectionAddress, collectionABI, provider);

    // Fetch card metadata to check if it's on sale and the price
    const card = await collectionContract.getCard(cardId);
    const cardOnSale = card[5]; // Assuming the card's 'onSale' status is at index 5
    const cardPrice = BigNumber.from(card[6]).toString()  

    if (!cardOnSale) {
      return res.status(400).json({ error: 'This card is not for sale.' });
    }

    // Prepare the transaction to buy the card
    const tx = await collectionContract.buyCard(cardId);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    res.status(200).json({
      message: 'Card purchased successfully',
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error('Error buying card:', error);
    res.status(500).json({ error: 'Failed to purchase the card', details: error.message });
  }
});

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// // API Endpoint to update the exchange status of a card
// app.put('/collection/:collectionId/card/:cardId/exchange', async (req, res) => {
//   const { collectionId, cardId } = req.params;
//   const { userAddress, newStatus } = req.body;
  
//   const signer = provider.getSigner();
//   console.log(signer);
  
//   const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
//   const collectionContract = new ethers.Contract(collectionAddress, collectionABI, signer);
//   try {
//     const tx = await collectionContract.setExchangeStatus(cardId, newStatus, userAddress);
//     await tx.wait();

//     res.status(200).json({ message: 'exchange status updated successfully', tx: tx });
//   } catch (error) {
//     console.error('Error updating exchange status:', error);
//     res.status(500).json({ error: error.message });
//   }
// });


// // Creation de booter
// app.post('/api/create-booster', async (req, res) => {
//   const { userAddress, numberOfCards } = req.body;

//   try {
//     // Liste pour stocker les cartes du booster
//     let cardsInBooster = [];

//     // Étape 1 : Obtenir le nombre de collections
//     const collectionCounter = await mainContract.getCollectionCount(); // Assurez-vous que cette fonction existe

//     for (let i = 0; i < numberOfCards; i++) {
//       const randomCollectionId = getRandomIntInclusive(0, collectionCounter - 1); // Choisir une collection aléatoire
//       const collectionInfo = await mainContract.getCollectionInfo(randomCollectionId); // Assurez-vous que cette fonction fonctionne
//       const collectionId = collectionInfo[0]; // Récupérer l'ID de la collection

//       // Récupérer les cartes via l'API Pokémon pour la collection
//       const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${collectionId}`); // Utiliser l'ID de la collection
//       const cards = response.data.data;

//       // Sélectionner une carte aléatoire
//       const randomCardIndex = getRandomIntInclusive(0, cards.length - 1);
//       const card = cards[randomCardIndex];

//       // Ajouter la carte sélectionnée au booster
//       cardsInBooster.push({
//         id: i,           // ID temporaire pour la carte, à remplacer lors de la création
//         collectionId: collectionId,// Ajout de l'ID de la collection à laquelle la carte appartient
//         realID: card.id, // ID réel de la carte
//         name: card.name,
//         img: card.images.small,
//         rarity: card.rarity,
//         exchange: false, // État initial de l'échange
//       });
//     }

//     // Étape 2 : Appeler la fonction de création de booster dans le contrat
//     const boosterId = await mainContract.createBooster(cardsInBooster); // Appelez cette fonction sur le contrat

//     res.status(200).json({ "message":"Created" });
    
//   } catch (error) {
//     console.error('Error creating booster:', error);
//     res.status(500).json({ error: 'Error creating booster', details: error.message });
//   }
// });