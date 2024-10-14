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

// Route pour créer une collection
app.post('/create-collection', async (req, res) => {
  const { name, cardCount } = req.body;
  try {
    const owner = await mainContract.getOwner();
    console.log(owner);
    const tx = await mainContract.createCollection(name, cardCount);
    await tx.wait();
    res.status(200).json({ message: 'Collection created', transactionHash: tx.hash});
  } catch (error) {
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

const collectionABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

// Route pour récupérer tous les NFTs d'un utilisateur dans une collection
app.get('/user/:userAddress/collection/:collectionId/nfts', async (req, res) => {
  const { userAddress, collectionId } = req.params;
  try {
    const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
    const collectionContract = new ethers.Contract(collectionAddress, collectionABI, provider);

    const balance = await collectionContract.balanceOf(userAddress);
    const nfts = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await collectionContract.tokenOfOwnerByIndex(userAddress, i);
      const tokenURI = await collectionContract.tokenURI(tokenId);
      nfts.push({ tokenId: tokenId.toString(), tokenURI });
    }

    res.status(200).json(nfts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les métadonnées d'un NFT
app.get('/collection/:collectionId/nft/:tokenId', async (req, res) => {
  const { collectionId, tokenId } = req.params;
  try {
    const collectionAddress = (await mainContract.getCollectionInfo(collectionId))[1];
    const collectionContract = new ethers.Contract(collectionAddress, collectionABI, provider);
    
    const tokenURI = await collectionContract.tokenURI(tokenId);
    
    // Pour cet exemple, on suppose que le tokenURI contient une URL vers un JSON de métadonnées
    // Tu pourrais aussi implémenter la récupération des données du JSON ici si c'est un URL.
    
    res.status(200).json({ tokenId, tokenURI });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour mint une carte NFT à un utilisateur
app.post('/mint-card', async (req, res) => {
  const { collectionId, userAddress, img } = req.body; // Récupérer les informations de la requête
  try {
    const tx = await mainContract.mintCardToUser(collectionId, userAddress, img); // Appel de la fonction mint
    await tx.wait(); // Attendre que la transaction soit confirmée
    res.status(200).json({ message: 'Card minted successfully', transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});