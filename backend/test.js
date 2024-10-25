import { ethers } from 'ethers';

const jsonRpcUrl = 'http://127.0.0.1:8545';

const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);
console.log('Provider:', provider);

