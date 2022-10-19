import { ethers } from 'ethers';

export function createAndStoreWallet(){
    let newwallet = ethers.Wallet.createRandom();
	const data = JSON.stringify(newwallet); 
	window.electron.ipcRenderer.writeAddress(data);
}