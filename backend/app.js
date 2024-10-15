import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { log } from 'console';
dotenv.config();

const app = express();
app.use(express.json());

const mainContractABI = [
  "function createCollection(string name, uint256 cardCount) public",
  "function getCollectionInfo(uint256 collectionId) public view returns (string, address, uint256)",
  "function getOwner() public view returns (address)",
  "function mintCardToUser(uint256 collectionId, address to, string img, uint256 quantity) public",
  "function getCardsOwnedByUser(uint256 collectionId, address user) external view returns (uint256[])",
  "function getAllCardsOwnedByUser(address user) view returns (uint256[] memory, uint256[] memory)",
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
];

const collectionABI = [
  // Add ABI entries for the functions in the Collection contract
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "img", "type": "string" }
    ],
    "name": "mintTo",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "cardId", "type": "uint256" }
    ],
    "name": "getCard",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
  // Add other functions as needed
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

// Route pour obtenir les informations d'une carte Pokémon depuis l'API Pokémon TCG
app.get('/pokemon-card/:name', async (req, res) => {
  const cardName = req.params.name;
  try {
    // Appeler l'API Pokémon TCG pour obtenir les détails de la carte
    const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=name:${cardName}`);
    const cardData = response.data.data;

    if (cardData.length === 0) {
      return res.status(404).json({ error: 'Card not found in Pokémon TCG API' });
    }

    // Retourner toutes les informations de la carte trouvée
    console.log(`Nombre de carte dans la colletion : ${cardData.length}`);
    res.status(200).json(cardData);
  } catch (error) {
    console.error('Error fetching card data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour créer une collection
app.post('/create-collection', async (req, res) => {
  const { name } = req.body;
  try {
    const owner = await mainContract.getOwner();
    console.log(owner);

    // Appeler l'API Pokémon TCG pour obtenir les détails de la carte
    const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=name:${name}`);
    const cardData = response.data.data;

    if (cardData.length === 0) {
      return res.status(404).json({ error: 'Card not found in Pokémon TCG API' });
    }

    // Retourner toutes les informations de la carte trouvée
    const cardCount = cardData.length;
    console.log(`Nombre de carte dans la colletion : ${cardCount}`);
    const tx = await mainContract.createCollection(name, cardCount); //on va faire nomCollection = nom carte das la collection
    await tx.wait();
    res.status(200).json({ message: 'Collection created', transactionHash: tx.hash});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour mint une carte NFT à un utilisateur
app.post('/mint-card', async (req, res) => {
  const { collectionId, userAddress, img, quantity} = req.body; // Récupérer les informations de la requête
  try {
      const owner = await mainContract.getOwner();
      const tx = await mainContract.mintCardToUser(collectionId, userAddress, img, quantity);
      await tx.wait(); // Attendre que la transaction soit confirmée
      res.status(200).json({ message: 'Card minted successfully', transactionHash: tx.hash });
  } catch (error) {
      console.error(error); // Log pour mieux voir l'erreur
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

// API Endpoint to get all cards owned by a user in a collection
app.get('/api/collection/:collectionId/user/:userAddress/cards', async (req, res) => {
  const { collectionId, userAddress } = req.params;

  try {
    // Call the smart contract function
    const ownedCards = await mainContract.getCardsOwnedByUser(collectionId, userAddress);

    res.status(200).json({ collectionId, userAddress, ownedCards });
  } catch (error) {
    console.error('Error fetching user cards:', error);
    res.status(500).json({ error: 'Error fetching user cards', details: error.message });
  }
});

// Endpoint to get all cards owned by a user
app.get('/user/:userAddress/cards', async (req, res) => {
  const userAddress = req.params.userAddress;

  try {
      // Call the getAllCardsOwnedByUser function
      const [collectionIds, cardIds] = await mainContract.getAllCardsOwnedByUser(userAddress);

      // Format the result to return as JSON
      const ownedCards = collectionIds.map((collectionId, index) => ({
          collectionId: collectionId.toNumber(),
          cardId: cardIds[index].toNumber()
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
    // Retrieve collection address from Main contract
    const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
    const collectionContract = new ethers.Contract(collectionAddress, collectionABI, provider);

    // Get card details from the Collection contract
    const [cardNumber, img] = await collectionContract.getCard(tokenId);

    // Construct metadata
    const metadata = {
      cardId: cardNumber,
      image: img, // Assuming img is a URL or base64 data
      // Add other metadata attributes as needed, e.g., name, description
    };

    res.status(200).json(metadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});