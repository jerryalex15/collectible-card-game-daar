// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Collection.sol";

contract Main is Ownable { // Inheriting from Ownable
    address private _owner;
    struct CollectionInfo {
        string name;
        address collectionAddress;
        uint256 cardCount;
    }

    mapping(uint256 => CollectionInfo) public collections;
    uint256 public collectionCounter;

    event CollectionCreated(uint256 collectionId, string name, address collectionAddress);
    event CardMinted(uint256 collectionId, uint256 cardId, address owner);

    // Constructor for the Main contract
    constructor() Ownable(msg.sender) { // Pass msg.sender as owner
        collectionCounter = 0;
        _owner = msg.sender; //il faut être vigilent avec ceci
    }

    function owner() public view override returns (address) {
        return _owner;
    }

    function getOwner() public view returns (address) {
        return owner();
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

    function mintCardToUser(uint256 collectionId,address to,string memory img) external onlyOwner {
        require(collectionId < collectionCounter, "Collection does not exist");
        Collection collection = Collection(collections[collectionId].collectionAddress);
        uint256 cardId = collection.mintTo(to, img);
        emit CardMinted(collectionId, cardId, to);
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
}