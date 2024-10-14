// test/Main.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Main Contract", function () {
    let Main;
    let mainContract;
    let Collection;
    let collectionContract;
    let owner;
    let addr1;

    beforeEach(async function () {
        // Déployer le contrat Main avant chaque test
        Main = await ethers.getContractFactory("Main");
        [owner, addr1] = await ethers.getSigners();
        mainContract = await Main.deploy();
        await mainContract.deployed();
    });

    describe("Collection Creation", function () {
        it("Should create a new collection", async function () {
            await mainContract.createCollection("My Collection", 5);
            const collectionInfo = await mainContract.collections(0);

            expect(collectionInfo.name).to.equal("My Collection");
            expect(collectionInfo.cardCount).to.equal(5);
        });

        it("Should not allow non-owner to create a collection", async function () {
            await expect(
                mainContract.connect(addr1).createCollection("Unauthorized", 5)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Minting Cards", function () {
        beforeEach(async function () {
            // Créer une collection pour les tests
            await mainContract.createCollection("My Collection", 5);
            const collectionInfo = await mainContract.collections(0);
            Collection = await ethers.getContractFactory("Collection");
            collectionContract = await Collection.attach(collectionInfo.collectionAddress);
        });

        it("Should mint a card to a user", async function () {
            await mainContract.mintCardToUser(0, addr1.address, "https://example.com/image.png");
            const cardInfo = await collectionContract.getCard(0);
            expect(cardInfo.cardNumber).to.equal(0);
            expect(cardInfo.img).to.equal("https://example.com/image.png");
        });

        it("Should not mint more cards than the allowed limit", async function () {
            await mainContract.mintCardToUser(0, addr1.address, "https://example.com/image1.png");
            await mainContract.mintCardToUser(0, addr1.address, "https://example.com/image2.png");
            await mainContract.mintCardToUser(0, addr1.address, "https://example.com/image3.png");
            await mainContract.mintCardToUser(0, addr1.address, "https://example.com/image4.png");
            await expect(
                mainContract.mintCardToUser(0, addr1.address, "https://example.com/image5.png")
            ).to.be.revertedWith("Max card count reached");
        });
    });
});