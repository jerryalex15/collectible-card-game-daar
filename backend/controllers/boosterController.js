import axios from 'axios';
import * as main from "../utils/init.js"; 
import { ethers, BigNumber } from 'ethers';

// Endpoint to create a booster for a user
export const createBooster= async (req, res) => {
    const { userAddress, name, cardCountInBooster } = req.body;
    const { mainContract } = await main.init();

    try {
        const tx = await mainContract.createBooster(userAddress, name, cardCountInBooster);
        await tx.wait();

        res.status(200).json({ message: 'Booster created successfully' });
    } catch (error) {
        console.error('Error creating booster:', error);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to acquire a booster
export const acquireBooster = async (req, res) => {
    const { boosterId, userAddress } = req.body;
    const { mainContract } = await main.init();

    try {
        const tx = await mainContract.acquireBooster(boosterId, userAddress, { value: 10000000 });
        await tx.wait();

        res.status(200).json({ message: 'Booster acquired successfully' });
    } catch (error) {
        console.error('Error acquiring booster:', error);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to unpack a booster
export const unpackBooster = async (req, res) => {
    const { boosterId, userAddress } = req.body;
    const { mainContract } = await main.init();

    try {
        const tx = await mainContract.unpackBooster(boosterId, userAddress);
        await tx.wait();

        res.status(200).json({ message: 'Booster unpacked successfully' });
    } catch (error) {
        console.error('Error unpacking booster:', error);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to list all boosters
export const listBoosters = async (req, res) => {

    const { mainContract } = await main.init();

    try {
        // Récupérer tous les boosters depuis le contrat
        const boosters = await mainContract.listBoosters();

        // Mapper chaque booster dans le format structuré souhaité
        const mappedBoosters = boosters.map((booster) => {
            // Récupérer et transformer chaque valeur dans le bon format
            const id = BigNumber.from(booster[0]).toString();
            const name = booster[1]
            const cardIds = booster[2]?.map((card) => 
                card.map((cardId) => BigNumber.from(cardId).toString())
            ) || [];
            const owner = booster[3];

            return {
                id: id,       // ID du booster
                name: name,   // Nom du booster
                cardIds: cardIds,  // IDs des cartes sous forme de tableau de nombres
                owner: owner  // Adresse du propriétaire
            };
        });

        // Répondre avec les boosters mappés
        res.status(200).json({ boosters: mappedBoosters });
    } catch (error) {
        console.error('Error listing boosters:', error);
        res.status(500).json({ error: error.message });
    }
};