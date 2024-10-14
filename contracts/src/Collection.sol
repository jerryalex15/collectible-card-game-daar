// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Collection is ERC721URIStorage {
    uint256 private _tokenIdCounter;
    string public collectionName;
    uint256 public cardCount;
    address public owner;

    struct Card {
        uint256 cardNumber;
        string img;
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

    function mintTo(address to, string memory img) external onlyOwner returns (uint256) {
        require(_tokenIdCounter < cardCount, "Max card count reached");
        
        uint256 newCardId = _tokenIdCounter;
        _tokenIdCounter += 1;  // Incrémentation manuelle du compteur

        _mint(to, newCardId);

        cards[newCardId] = Card({cardNumber: newCardId, img: img});
        return newCardId;
    }

    function getCard(uint256 cardId) external view returns (uint256, string memory) {
        require(ownerOf(cardId) != address(0), "Card does not exist");
        Card memory card = cards[cardId];
        return (card.cardNumber, card.img);
    }
}