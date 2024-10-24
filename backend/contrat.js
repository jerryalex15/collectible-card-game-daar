import {ethers} from "ethers";
import contractsJson from './../frontend/src/contracts.json' with { type: 'json' };
const contracts = contractsJson.contracts; 


export const init = async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const { address, abi } = contracts.Main
    const contract = new ethers.Contract(address, abi, provider)
    const deployed = await contract.deployed()
    if (!deployed) console.log("contract not deployed")
    const contract_= signer ? contract.connect(signer) : contract;

    const collectionABI = [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_cardCount",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "getAllCardsOnSaleLength",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "realID",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "cardName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "cardImage",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "rarity",
                    "type": "string"
                },
                {
                    "internalType": "bool",
                    "name": "onSale",
                    "type": "bool"
                },
                {
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                }
            ],
            "name": "mintTo",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "cardId",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "newSaleStatus",
                    "type": "bool"
                },
                {
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "userAddress",
                    "type": "address"
                }
            ],
            "name": "setCardOnSale",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCardsOnSale",
            "outputs": [
                {
                    "internalType": "tuple[]",
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "realID",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "name",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "img",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "rarity",
                            "type": "string"
                        },
                        {
                            "internalType": "bool",
                            "name": "onSale",
                            "type": "bool"
                        },
                        {
                            "internalType": "uint256",
                            "name": "price",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct Collection.Card[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "cardId",
                    "type": "uint256"
                }
            ],
            "name": "buyCard",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "cardId",
                    "type": "uint256"
                }
            ],
            "name": "getCard",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "cardId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "userTo",
                    "type": "address"
                }
            ],
            "name": "assignCard",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    return { mainContract: contract_, collectionABI,provider };
};