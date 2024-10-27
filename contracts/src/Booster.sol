// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
import "./Collection.sol";

contract Booster{ 
    struct BoosterStruct {
        uint256 id;
        string name;
        BoosterCard[] cardIds; // Nom conservé en tant que cardIds
        address owner;
    }

    struct BoosterCard {
        uint256 collectionId;  // ID de la collection d'origine
        uint256 cardId;        // ID de la carte dans cette collection
    }

    uint256 public boosterCounter;
    mapping(uint256 => BoosterStruct) public boosters;

    event BoosterCreated(uint256 boosterId, string name, address owner);
    event BoosterAcquired(uint256 indexed boosterId, address indexed buyer);
    event BoosterUnpacked(uint256 indexed boosterId, address indexed owner);

    constructor() {
        boosterCounter = 0;
    }

    // Modifier la fonction createBooster pour accepter les collectionIds et userCardIds
    function createBooster(
        address user, 
        string memory name, 
        uint256[] memory collectionIds, 
        uint256[] memory userCardIds,
        uint256 cardCount
    ) external {

        // Vérifier qu'il y a suffisamment de cartes pour en sélectionner 5
        uint256 cardSelectionCount = userCardIds.length < cardCount ? userCardIds.length : cardCount;
        uint256[] memory randomIndexes = getRandomCardIds(userCardIds, cardSelectionCount);

        BoosterStruct storage newBooster = boosters[boosterCounter];
        newBooster.id = boosterCounter;
        newBooster.name = name;
        newBooster.owner = address(0);

        // Stocker chaque carte et sa collection sélectionnée aléatoirement dans le booster
        for (uint256 i = 0; i < cardSelectionCount; i++) {
            uint256 randomIndex = randomIndexes[i];
            newBooster.cardIds.push(BoosterCard({
                collectionId: collectionIds[randomIndex],
                cardId: userCardIds[randomIndex]
            }));
        }

        emit BoosterCreated(boosterCounter, name, user);
        boosterCounter++;
    }

    // Mise à jour de la fonction getRandomCardIds pour retourner des index
    function getRandomCardIds(uint256[] memory availableCardIds, uint256 count) private view returns (uint256[] memory) {
        require(count <= availableCardIds.length, "Count exceeds available card IDs");

        uint256[] memory randomIndexes = new uint256[](count);
        uint256 totalCards = availableCardIds.length;

        for (uint256 i = 0; i < count; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % totalCards;
            randomIndexes[i] = randomIndex;
        }

        return randomIndexes;
    }

    // Fonction pour acquérir un booster
    function acquireBooster(uint256 boosterId, address user) external payable {
        BoosterStruct storage booster = boosters[boosterId];
        require(booster.owner == address(0), "Booster already acquired");
        require(msg.value == 10000000, "Incorrect amount sent");

        booster.owner = user;
        emit BoosterAcquired(boosterId, user);
    }
    // Fonction pour déballer un booster
    function unpackBoosterIn(uint256 boosterId, address user) external returns (uint256[] memory, uint256[] memory) {
        require(boosterId < boosterCounter, "Booster does not exist");

        BoosterStruct storage booster = boosters[boosterId];
        require(user == booster.owner, "You are not the owner of this booster");

        // Initialiser les tableaux pour stocker les IDs
        uint256[] memory cardIds = new uint256[](booster.cardIds.length);
        uint256[] memory collectionIds = new uint256[](booster.cardIds.length);

        // Transfère chaque carte du booster à l'utilisateur via la fonction _transfer d'ERC721
        for (uint256 i = 0; i < booster.cardIds.length; i++) {
            cardIds[i] = booster.cardIds[i].cardId; 
            collectionIds[i] = booster.cardIds[i].collectionId;
        }   

        emit BoosterUnpacked(boosterId, user);
        delete boosters[boosterId]; // Supprime le booster après transfert des cartes

        // Retourner les deux listes
        return (cardIds, collectionIds);
    }

    // Fonction pour lister tous les boosters
    function listAllBoosters() external view returns (BoosterStruct[] memory) {
        BoosterStruct[] memory allBoosters = new BoosterStruct[](boosterCounter);
        for (uint256 i = 0; i < boosterCounter; i++) {
            allBoosters[i] = boosters[i];
        }
        return allBoosters;
    }
}