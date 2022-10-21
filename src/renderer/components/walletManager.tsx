import { ethers } from 'ethers';

const provider = new ethers.providers.InfuraProvider("homestead", "ccd0f54c729d4e58a9b7b34cb3984555")

export function createAndStoreWallet(name: string, amount: number) {
	let walletArray: any = [];
	for (let i = 0; i < amount; i++) {
		let newWalletData: any;
		let newwallet = ethers.Wallet.createRandom();
		if (amount > 1) {
			newWalletData = {
				"name": `${name}${i + 1}`,
				"address": newwallet.address,
				"privateKey": newwallet.privateKey
			}
		} else {
			newWalletData = {
				"name": name,
				"address": newwallet.address,
				"privateKey": newwallet.privateKey
			}
		}
		walletArray.push(newWalletData);
	}
	window.electron.ipcRenderer.writeAddress(walletArray);
}

export function removeWallet(index: number) {
	window.electron.ipcRenderer.deleteAddress(index);
}

export function removeAllWallets() {
	window.electron.ipcRenderer.removeAllWallets();
}

export async function getBalance(wallets) {
	let walletsBalanceArray: any = []
	for (let i = 0; i < wallets.length; i++) {
		let balanceWei = await provider.getBalance(wallets[i].address);
		let balanceEther = ethers.utils.formatEther(balanceWei);
		walletsBalanceArray[i] = balanceEther;
	}
	
	return walletsBalanceArray;
}