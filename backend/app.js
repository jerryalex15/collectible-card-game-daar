import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import pokemon from 'pokemontcgsdk';
import getRandomIntInclusive from './random.js';

dotenv.config();
pokemon.configure({apiKey: '123abc'})
const app = express();
app.use(express.json());

const mainContractABI = [
  "function createCollection(string name, uint256 cardCount) public",
  "function getCollectionInfo(uint256 collectionId) public view returns (string, address, uint256)",
  "function getOwner() public view returns (address)",
  "function getCardsOwnedByUser(uint256 collectionId, address user) external view returns (uint256[])",
  "function getAllCardsOwnedByUser(address user) view returns (uint256[] memory, uint256[] memory)",
  {
    "inputs": [
      { "internalType": "uint256", "name": "collectionId", "type": "uint256" },
      { "internalType": "string", "name": "realID", "type": "string" },
      { "internalType": "string", "name": "cardName", "type": "string" },
      { "internalType": "string", "name": "cardImage", "type": "string" },
      { "internalType": "string", "name": "rarity", "type": "string" },
      { "internalType": "bool", "name": "exchange", "type": "bool" },
    ],
    "name": "mintCard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCollections",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "collectionAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "cardCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Main.CollectionInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "collectionId", "type": "uint256" },
      { "name": "cardId", "type": "uint256" }
    ],
    "name": "getCardMetadata",
    "outputs": [
      { "name": "id", "type": "uint256" },
      { "name": "realID", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "img", "type": "string" },
      { "name": "rarity", "type": "string" },
      { "name": "exchange", "type": "bool" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

const collectionABI = [
  // Fonction pour minter une carte dans une collection spécifique
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "collectionId", "type": "uint256" },
      { "internalType": "string", "name": "realID", "type": "string" },
      { "internalType": "string", "name": "cardName", "type": "string" },
      { "internalType": "string", "name": "cardImage", "type": "string" },
      { "internalType": "string", "name": "rarity", "type": "string" },
      { "internalType": "bool", "name": "exchange", "type": "bool" }
    ],
    "name": "mintTo",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Fonction pour récupérer les détails d'une carte spécifique
  {
    "inputs": [
      { "internalType": "uint256", "name": "cardId", "type": "uint256" }
    ],
    "name": "getCard",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },  // collectionId
      { "internalType": "uint256", "name": "", "type": "uint256" },  // cardId
      { "internalType": "string", "name": "", "type": "string" },    // realID
      { "internalType": "string", "name": "", "type": "string" },    // cardName
      { "internalType": "string", "name": "", "type": "string" },    // cardImage
      { "internalType": "string", "name": "", "type": "string" },    // rarity
      { "internalType": "bool", "name": "", "type": "bool" }         // exchange
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Fonction pour mettre à jour le statut exchange d'une carte
  {
    "inputs": [
      { "internalType": "uint256", "name": "cardId", "type": "uint256" },
      { "internalType": "bool", "name": "newExchangeStatus", "type": "bool" },
      { "internalType": "address", "name": "userAddress", "type": "address" }
    ],
    "name": "setExchangeStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Fonction pour transférer une carte d'un utilisateur à un autre
  {
    "inputs": [
      { "internalType": "uint256", "name": "cardId", "type": "uint256" },
      { "internalType": "address", "name": "userTo", "type": "address" }
    ],
    "name": "assignCard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const rpcUrl = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const mainContractAddress = process.env.MAIN_CONTRACT_ADDRESS;

if (!rpcUrl || !privateKey || !mainContractAddress) {
    throw new Error("Please set all the environment variables: RPC_URL, PRIVATE_KEY, MAIN_CONTRACT_ADDRESS");
}

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const mainContract = new ethers.Contract(mainContractAddress, mainContractABI, wallet);

import axios from 'axios';

// // Route pour obtenir les informations d'une carte Pokémon depuis l'API Pokémon TCG
// app.get('/pokemon-card/:name', async (req, res) => {
//   const cardName = req.params.name;
//   try {
//     // Appeler l'API Pokémon TCG pour obtenir les détails de la carte
//     const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=name:${cardName}`);
//     const cardData = response.data.data;

//     if (cardData.length === 0) {
//       return res.status(404).json({ error: 'Card not found in Pokémon TCG API' });
//     }

//     // Retourner toutes les informations de la carte trouvée
//     console.log(`Nombre de carte dans la colletion : ${cardData.length}`);
//     res.status(200).json(cardData);
//   } catch (error) {
//     console.error('Error fetching card data:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// Route pour créer une collection
app.post('/create-collection', async (req, res) => {
  const { collectionID } = req.body;
  console.log(collectionID);
  
  try {
    const owner = await mainContract.getOwner();
    console.log(owner);

    // Appeler l'API Pokémon TCG pour obtenir les détails de la carte
    const response = await axios.get(`https://api.pokemontcg.io/v2/sets/${collectionID}`);
    const collection = response.data.data;
    
    console.log(`Collection name: ${collection.name}`);

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found in Pokémon TCG API' });
    }

    // Retourner toutes les informations de la carte trouvée
    const cardCount = collection.total;
    console.log(`Nombre de cartes dans la colletion : ${cardCount}`);
    const tx = await mainContract.createCollection(collection.name, cardCount); //on va faire nomCollection = nom carte das la collection
    await tx.wait();
    res.status(200).json({ message: 'Collection created', transactionHash: tx.hash});
  } catch (error) {
    res.status(500).json({ message:' Error while creating collection',error: error.message });
  }
});

// Route pour mint une carte NFT à un utilisateur (on va dire au hasard)
app.post('/mint-card', async (req, res) => {
  const { collectionId } = req.body; // Récupérer les informations de la requête
  try {

    const collection= await mainContract.getCollectionInfo(collectionId);
    const collectionName = collection[0];
    console.log(collection[0]);
    const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.name:${collectionName}`);
    const cards = response.data.data;

    for (let i=0; i < cards.length; i++){
      const tx = await mainContract.mintCard(collectionId, cards[i].id, cards[i].name, cards[i].images.small, cards[i].rarity, false);
      await tx.wait(); // Attendre que la transaction soit confirmée
    }

    res.status(200).json({ message: 'Card minted successfully' });
  } catch (error) {
    console.error(error); // Log pour mieux voir l'erreur
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint to assign a card from one user to another
app.post('/collection/:collectionId/card/:cardId/assign', async (req, res) => {
  const { collectionId, cardId } = req.params;
  const { userTo } = req.body;
  const signer = provider.getSigner();
  console.log(signer);

  try {
    const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
    const collectionContract = new ethers.Contract(collectionAddress, collectionABI, signer);

    const tx = await collectionContract.assignCard(cardId, userTo);
    await tx.wait();

    res.status(200).json({ message: 'Card assigned successfully', tx: tx });
  } catch (error) {
    console.error('Error assigning card:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer toutes les collections
app.get('/collections', async (req, res) => {
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

// API Endpoint to get all cards owned by a user in a specific collection with metadata
app.get('/api/collection/:collectionId/user/:userAddress/cards', async (req, res) => {
  const { collectionId, userAddress } = req.params;

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
        exchange: card[5]
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
  const userAddress = req.params.userAddress;

  try {
      // Appel à la fonction qui retourne tous les collectionIds et cardIds pour l'utilisateur
      const [collectionIds, cardIds] = await mainContract.getAllCardsOwnedByUser(userAddress);

      // Récupère toutes les métadonnées en une seule fois
      const ownedCards = await Promise.all(collectionIds.map(async (collectionId, index) => {
          const cardId = cardIds[index].toNumber();

          // Appel direct à `getCardMetadata` dans `mainContract`
          const cardMetadata = await mainContract.getCardMetadata(collectionId.toNumber(), cardId);

          // Formatage des métadonnées de la carte
          return {
              cardId: cardMetadata[0].toNumber(),
              realID: cardMetadata[1],
              name: cardMetadata[2],
              img: cardMetadata[3],
              rarity: cardMetadata[4],
              exchange: cardMetadata[5]
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

  try {
    const card = await mainContract.getCardMetadata(collectionId, tokenId);

    // Construct metadata based on all the card attributes
    const metadata = {
      cardId: card[0].toNumber(),
      realID: card[1],
      name: card[2],
      image: card[3], // Assuming img is a URL or base64 data
      rarity: card[4],
      exchange: card[5]            // exchange
    };

    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error retrieving metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint to update the exchange status of a card
app.put('/collection/:collectionId/card/:cardId/exchange', async (req, res) => {
  const { collectionId, cardId } = req.params;
  const { userAddress, newStatus } = req.body;
  
  const signer = provider.getSigner();
  console.log(signer);
  
  const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
  const collectionContract = new ethers.Contract(collectionAddress, collectionABI, signer);
  try {
    const tx = await collectionContract.setExchangeStatus(cardId, newStatus, userAddress);
    await tx.wait();

    res.status(200).json({ message: 'exchange status updated successfully', tx: tx });
  } catch (error) {
    console.error('Error updating exchange status:', error);
    res.status(500).json({ error: error.message });
  }
});


// Creation de booter
app.post('/api/create-booster', async (req, res) => {
  const { userAddress, numberOfCards } = req.body;

  try {
    // Liste pour stocker les cartes du booster
    let cardsInBooster = [];

    // Étape 1 : Obtenir le nombre de collections
    const collectionCounter = await mainContract.getCollectionCount(); // Assurez-vous que cette fonction existe

    for (let i = 0; i < numberOfCards; i++) {
      const randomCollectionId = getRandomIntInclusive(0, collectionCounter - 1); // Choisir une collection aléatoire
      const collectionInfo = await mainContract.getCollectionInfo(randomCollectionId); // Assurez-vous que cette fonction fonctionne
      const collectionId = collectionInfo[0]; // Récupérer l'ID de la collection

      // Récupérer les cartes via l'API Pokémon pour la collection
      const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${collectionId}`); // Utiliser l'ID de la collection
      const cards = response.data.data;

      // Sélectionner une carte aléatoire
      const randomCardIndex = getRandomIntInclusive(0, cards.length - 1);
      const card = cards[randomCardIndex];

      // Ajouter la carte sélectionnée au booster
      cardsInBooster.push({
        id: i,           // ID temporaire pour la carte, à remplacer lors de la création
        collectionId: collectionId,// Ajout de l'ID de la collection à laquelle la carte appartient
        realID: card.id, // ID réel de la carte
        name: card.name,
        img: card.images.small,
        rarity: card.rarity,
        exchange: false, // État initial de l'échange
      });
    }

    // Étape 2 : Appeler la fonction de création de booster dans le contrat
    const boosterId = await mainContract.createBooster(cardsInBooster); // Appelez cette fonction sur le contrat

    res.status(200).json({ "message":"Created" });
    
  } catch (error) {
    console.error('Error creating booster:', error);
    res.status(500).json({ error: 'Error creating booster', details: error.message });
  }
});

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});