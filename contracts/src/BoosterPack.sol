// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Booster is ERC721URIStorage {
    uint256 private currentBoosterId;
    address public owner;

    struct Card {
        uint256 id;
        string name;
        string img;
        string rarity;
    }

    struct BoosterPack {
        uint256 boosterId;
        Card[] cards;
        bool redeemed;
    }

    mapping(uint256 => BoosterPack) public boosterPacks;

    event BoosterCreated(uint256 boosterId);
    event BoosterRedeemed(uint256 boosterId, address user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() ERC721("Booster", "BST") {
        owner = msg.sender;
        currentBoosterId = 0;  // Initialisation à 0
    }

    function createBooster(Card[] memory _cards) external onlyOwner returns (uint256) {
        uint256 boosterId = currentBoosterId;  // Utilisation de currentBoosterId comme ID de booster
        currentBoosterId++;  // Incrémentation manuelle de l'ID

        boosterPacks[boosterId] = BoosterPack({
            boosterId: boosterId,
            cards: _cards,
            redeemed: false
        });

        emit BoosterCreated(boosterId);
        return boosterId;
    }

    function redeemBooster(uint256 boosterId) external {
        // Vérifie si le booster existe en s'assurant qu'il n'a pas été échangé
        require(boosterPacks[boosterId].boosterId == boosterId, "Booster does not exist");
        require(!boosterPacks[boosterId].redeemed, "Booster already redeemed");

        // Marquer le booster comme échangé
        boosterPacks[boosterId].redeemed = true;

        // Logique supplémentaire pour transférer les cartes au propriétaire, etc.
        emit BoosterRedeemed(boosterId, msg.sender);
    }

    function getBooster(uint256 boosterId) external view returns (Card[] memory) {
        // Vérifie si le booster existe en s'assurant qu'il n'a pas été échangé
        require(boosterPacks[boosterId].boosterId == boosterId, "Booster does not exist");
        return boosterPacks[boosterId].cards;
    }
}