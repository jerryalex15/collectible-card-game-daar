// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Collection is ERC721URIStorage {
    uint256 private _tokenIdCounter;
    string public collectionName;
    uint256 public cardCount;
    address public owner;

    struct Card {
        uint256 id;          // Identifiant de la carte
        string realID;       // Identifiant réel de la carte
        string name;         // Nom de la carte
        string img;          // URL de l'image de la carte
        string rarity;       // Rareté de la carte
        bool onSale;        // État de vente de la carte
        uint256 price;      // Prix de la carte si elle est en vente
    }

    mapping(uint256 => Card) public cards;
    uint256[] public allCardsOnSale; // Liste des identifiants de toutes les cartes en vente

    constructor(
        string memory _name,
        uint256 _cardCount,
        address _owner
    ) ERC721(_name, "NFT") {
        collectionName = _name;
        cardCount = _cardCount;
        owner = _owner;
        _tokenIdCounter = 0;  // Initialisation du compteur à 0
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Dans le contrat Collection
    function getAllCardsOnSaleLength() public view returns (uint256) {
        return allCardsOnSale.length;
    }

    function mintTo(
        address to,
        string memory realID,
        string memory cardName,
        string memory cardImage,
        string memory rarity,
        bool onSale,
        uint256 price 
    ) external returns (uint256) {
        require(_tokenIdCounter < cardCount, "Max card count reached");

        uint256 newCardId = _tokenIdCounter;
        _tokenIdCounter += 1;

        _mint(to, newCardId);
        cards[newCardId] = Card({
            id: newCardId,
            realID: realID,
            name: cardName,
            img: cardImage,
            rarity: rarity,
            onSale: onSale,
            price: price
        });

        if (onSale) {
            allCardsOnSale.push(newCardId); // Ajouter à la liste des cartes en vente
        }

        return newCardId;
    }

    function getPrice(uint256 cardId) external view returns (uint256) {
        require(cardId < cardCount, "Card does not exist");
        return cards[cardId].price;
    }

    function isCardOnSale(uint256 cardId) external view returns (bool) {
        require(cardId < cardCount, "Card does not exist");
        return cards[cardId].onSale;
    }

    function setSaleStatus(uint256 cardId, bool newSaleStatus, uint256 price, address ownerAddress) public {
        require(ownerOf(cardId) == ownerAddress, "Only the owner can change sale status");

        // Vérifiez si la carte est déjà en vente
        if (newSaleStatus) {
            require(cards[cardId].onSale == false, "This card is already on sale"); // Empêche la mise en vente si elle est déjà en vente
            cards[cardId].price = price; // Mettre le prix si on met la carte en vente
            cards[cardId].onSale = newSaleStatus; // Marquer la carte comme en vente
            allCardsOnSale.push(cardId); // Ajouter à la liste des cartes en vente
        } else {
            // Si on retire la carte de la vente
            cards[cardId].onSale = newSaleStatus; // Marquer la carte comme non en vente
            for (uint256 i = 0; i < allCardsOnSale.length; i++) {
                if (allCardsOnSale[i] == cardId) {
                    allCardsOnSale[i] = allCardsOnSale[allCardsOnSale.length - 1]; // Remplacer par le dernier
                    allCardsOnSale.pop(); // Retirer le dernier élément
                    break;
                }
            }
        }
    }

    function getCardsOnSale() external view returns (Card[] memory) {
        Card[] memory cardsForSale = new Card[](allCardsOnSale.length);
        for (uint256 i = 0; i < allCardsOnSale.length; i++) {
            cardsForSale[i] = cards[allCardsOnSale[i]];
        }
        return cardsForSale;
    }

    function buyCard(uint256 cardId, address buyer) external payable {
        require(cards[cardId].onSale, "This card is not for sale");
        uint256 price = cards[cardId].price;
        require(msg.value == price, "Incorrect amount sent");
        address currentOwner = ownerOf(cardId);
        _transfer(currentOwner, buyer, cardId);
        payable(currentOwner).transfer(msg.value);
        cards[cardId].onSale = false;
        for (uint256 i = 0; i < allCardsOnSale.length; i++) {
            if (allCardsOnSale[i] == cardId) {
                allCardsOnSale[i] = allCardsOnSale[allCardsOnSale.length - 1]; // Remplacer par le dernier
                allCardsOnSale.pop(); // Retirer le dernier élément
                break;
            }
        }
    }

    function getCard(uint256 cardId) 
        external view 
        returns (uint256, string memory, string memory, string memory, string memory, bool, uint256) {
        require(ownerOf(cardId) != address(0), "Card does not exist");
        Card memory card = cards[cardId];
        return (card.id, card.realID, card.name, card.img, card.rarity, card.onSale, card.price);
    }

    function assignCard(uint256 cardId, address userTo) external {
        require(msg.sender == owner, "Only the card owner or contract owner can initiate an assign");
        _transfer(msg.sender, userTo, cardId);
    }
}