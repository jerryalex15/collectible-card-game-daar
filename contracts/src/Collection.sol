// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Collection is ERC721URIStorage {
    uint256 private _tokenIdCounter;
    string public collectionName;
    uint256 public cardCount;
    address public owner;

    struct Card {
        uint256 id;
        string realID; // Nouveau champ ajouté
        string name;
        string img;
        string rarity;
        bool redeem;
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
        bool redeem
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
            redeem: redeem
        });

        return newCardId;
    }

    function getCard(uint256 cardId) external view returns (uint256, string memory, string memory, string memory, string memory, bool) {
        require(ownerOf(cardId) != address(0), "Card does not exist");
        Card memory card = cards[cardId];
        return (card.id, card.realID, card.name, card.img, card.rarity, card.redeem);
    }

    // fonction pour changer la valeur de bool redeem
    function setRedeemStatus(uint256 cardId, bool newRedeemStatus, address userAddress) external {
        // require(ownerOf(cardId) == msg.sender, "Only the owner can change redeem status");
        require(ownerOf(cardId) == userAddress, "Only the owner can change redeem status");
        cards[cardId].redeem = newRedeemStatus;
    }

    // fonction pour echanger de carte; prend cardId, userTo, userFrom
    function transferCard(uint256 cardId, address userFrom, address userTo) external {
        require(ownerOf(cardId) == userFrom, "UserFrom is not the owner of the card");
        require(msg.sender == userFrom || msg.sender == owner, "Only the card owner or contract owner can initiate a transfer");

        _transfer(userFrom, userTo, cardId);
        setRedeemStatus(cardId, false, userFrom);
    }
}