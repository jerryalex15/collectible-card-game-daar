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
        bool exchange;       // État d'échange de la carte
    }

    mapping(uint256 => Card) public cards;

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

    function mintTo(
        address to,
        string memory realID,
        string memory cardName,
        string memory cardImage,
        string memory rarity,
        bool exchange
    ) external returns (uint256) {
        require(_tokenIdCounter <= cardCount, "Max card count reached");

        uint256 newCardId = _tokenIdCounter;
        _tokenIdCounter += 1;

        _mint(to, newCardId);
        cards[newCardId] = Card({
            id: newCardId,
            realID: realID,
            name: cardName,
            img: cardImage,
            rarity: rarity,
            exchange: exchange
        });

        return newCardId;
    }

    function getCard(uint256 cardId) 
        external view 
        returns (uint256, string memory, string memory, string memory, string memory, bool) {
        require(ownerOf(cardId) != address(0), "Card does not exist");
        Card memory card = cards[cardId];
        return (card.id, card.realID, card.name, card.img, card.rarity, card.exchange);
    }

    function setExchangeStatus(uint256 cardId, bool newExchangeStatus, address userAddress) public {
        require(ownerOf(cardId) == userAddress, "Only the owner can change exchange status");
        cards[cardId].exchange = newExchangeStatus;
    }

    function assignCard(uint256 cardId, address userTo) external {
        require(msg.sender == owner, "Only the card owner or contract owner can initiate an assign");
        _transfer(msg.sender, userTo, cardId);
    }
}