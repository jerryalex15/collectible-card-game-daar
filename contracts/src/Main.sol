// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Collection.sol";

contract Main is Ownable {
    address private _owner;

    struct CollectionInfo {
        string name;
        address collectionAddress;
        uint256 cardCount;
    }

    struct CardWithCollection {
        Collection.Card card;
        uint256 collectionId;
    }

    mapping(uint256 => CollectionInfo) public collections;
    uint256 public collectionCounter;

    event CollectionCreated(uint256 collectionId, string name, address collectionAddress);
    event CardMinted(uint256 collectionId, uint256 cardId, address owner);
    event CardPutOnSale(uint256 collectionId, uint256 cardId, uint256 price);
    event CardRemovedFromSale(uint256 collectionId, uint256 cardId);

    constructor() Ownable(msg.sender) {
        collectionCounter = 0;
        _owner = msg.sender; 
    }

    function createCollection(string memory _name, uint256 _cardCount) external onlyOwner {
        Collection newCollection = new Collection(_name, _cardCount, msg.sender);
        collections[collectionCounter] = CollectionInfo({
            name: _name,
            collectionAddress: address(newCollection),
            cardCount: _cardCount
        });

        emit CollectionCreated(collectionCounter, _name, address(newCollection));
        collectionCounter++;
    }

    function mintCard(
        uint256 collectionId, 
        string memory realID, 
        string memory cardName, 
        string memory cardImage, 
        string memory rarity, 
        bool onSale, 
        uint256 price // Ajouter le prix ici
    ) external onlyOwner {
        require(collectionId < collectionCounter, "Collection does not exist");

        Collection collection = Collection(collections[collectionId].collectionAddress);
        
        uint256 cardId = collection.mintTo(msg.sender, realID, cardName, cardImage, rarity, onSale, price);
        
        emit CardMinted(collectionId, cardId, msg.sender);
    }

    function putCardOnSale(uint256 collectionId, uint256 cardId, uint256 price, address userOwner) external {
        require(collectionId < collectionCounter, "Collection does not exist");
        Collection collection = Collection(collections[collectionId].collectionAddress);
        require(collection.ownerOf(cardId) == userOwner, "Only the card owner can put it on sale");
        collection.setSaleStatus(cardId, true, price, userOwner); // Mettre la carte en vente

        emit CardPutOnSale(collectionId, cardId, price);
    }

    function removeCardFromSale(uint256 collectionId, uint256 cardId, address userOwner) external {
        require(collectionId < collectionCounter, "Collection does not exist");
        Collection collection = Collection(collections[collectionId].collectionAddress);
        require(collection.ownerOf(cardId) == msg.sender, "Only the card owner can remove it from sale");
        collection.setSaleStatus(cardId, false, 0, userOwner); // Retirer la carte de la vente

        emit CardRemovedFromSale(collectionId, cardId);
    }


    function getAllCardsOnSale() public view returns (CardWithCollection[] memory) {
        uint256 totalCardsCount = 0;

        // Compter le nombre total de cartes en vente
        for (uint256 i = 0; i < collectionCounter; i++) {
            Collection collection = Collection(collections[i].collectionAddress);
            totalCardsCount += collection.getAllCardsOnSaleLength(); // Compter les cartes en vente de chaque collection
        }

        CardWithCollection[] memory allCardsForSale = new CardWithCollection[](totalCardsCount);
        uint256 index = 0;

        // Récupérer toutes les cartes en vente avec leur collection
        for (uint256 i = 0; i < collectionCounter; i++) {
            Collection collection = Collection(collections[i].collectionAddress);
            Collection.Card[] memory cardsForSale = collection.getCardsOnSale();
            for (uint256 j = 0; j < cardsForSale.length; j++) {
                allCardsForSale[index].card = cardsForSale[j];
                allCardsForSale[index].collectionId = i; // Associer la collection à l'ID de la collection
                index++;
            }
        }

        return allCardsForSale;
    }

    function getCollectionInfo(uint256 collectionId) external view returns (string memory, address, uint256) {
        require(collectionId < collectionCounter, "Collection does not exist");
        CollectionInfo memory collection = collections[collectionId];
        return (collection.name, collection.collectionAddress, collection.cardCount);
    }

    function getAllCollections() external view returns (CollectionInfo[] memory) {
        CollectionInfo[] memory allCollections = new CollectionInfo[](collectionCounter);
        for (uint256 i = 0; i < collectionCounter; i++) {
            allCollections[i] = collections[i];
        }
        return allCollections;
    }

    function getCardMetadata(uint256 collectionId, uint256 cardId) 
        public view 
        returns (uint256, string memory, string memory, string memory, string memory, bool, uint256) {
        require(collectionId < collectionCounter, "Collection not exist");

        CollectionInfo memory collection = collections[collectionId];
        Collection collectionContract = Collection(collection.collectionAddress);

        return collectionContract.getCard(cardId);
    }

    function getAllCardsOwnedByUser(address user) external view returns (uint256[] memory, uint256[] memory) {
        uint256 totalCardsCount = 0;

        for (uint256 i = 0; i < collectionCounter; i++) {
            Collection collection = Collection(collections[i].collectionAddress);
            for (uint256 j = 0; j < collections[i].cardCount; j++) {
                try collection.ownerOf(j) returns (address cardOwner) {
                    if (cardOwner == user) {  // Remplacer msg.sender par user
                        totalCardsCount++;
                    }
                } catch {
                    // Ignorer les erreurs, car elles indiquent des cartes non existantes
                }
            }
        }

        uint256[] memory collectionIds = new uint256[](totalCardsCount);
        uint256[] memory cardIds = new uint256[](totalCardsCount);
        uint256 index = 0;

        for (uint256 i = 0; i < collectionCounter; i++) {
            Collection collection = Collection(collections[i].collectionAddress);
            for (uint256 j = 0; j < collections[i].cardCount; j++) {
                try collection.ownerOf(j) returns (address cardOwner) {
                    if (cardOwner == user) {  // Remplacer msg.sender par user
                        collectionIds[index] = i;
                        cardIds[index] = j;
                        index++;
                    }
                } catch {
                    // Ignorer les erreurs, car elles indiquent des cartes non existantes
                }
            }
        }

        return (collectionIds, cardIds);
    }
}