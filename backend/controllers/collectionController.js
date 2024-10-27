import axios from 'axios';
import * as main from "../utils/init.js";

export const createCollection = async (req, res) => {
  const { collectionPokemonID } = req.body;
  const { mainContract } = await main.init();

  try {
    const response = await axios.get(`https://api.pokemontcg.io/v2/sets/${collectionPokemonID}`);
    const collection = response.data.data;

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found in Pokémon TCG API' });
    }

    const resp = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${collectionPokemonID}`);
    const cards = resp.data.data;
    const cardCount = cards.length;

    const tx = await mainContract.createCollection(collection.name, cardCount);
    await tx.wait();

    res.status(200).json({ message: 'Collection created', transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ message: 'Error while creating collection', error: error.message });
  }
};

export const getAllCollections = async (req, res) => {
    const { mainContract } = await main.init();

    try {
    const collections = await mainContract.getAllCollections();
    const result = collections.map((collection, index) => ({
        collectionId: index,
        name: collection.name,
        collectionAddress: collection.collectionAddress,
        cardCount: collection.cardCount.toString(),
    }));

    res.status(200).json(result);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

export const getCollectionInfo = async (req, res) => {
    const { id } = req.params;
    const { mainContract } = await main.init();

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
};