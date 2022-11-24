import { ethers } from 'ethers';

const provider = new ethers.providers.InfuraProvider("goerli", "ccd0f54c729d4e58a9b7b34cb3984555")
const disperseAddress = "0x1EbD7f4ea90DBD3d6Be68869502B2022Aa000d0c";



export async function getTasks() {
	return await window.electron.ipcRenderer.getTasks();
}

export function createAndStoreTask(name: any, amount: any) {
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

export function importAndStoreTaskFromFile(data) {
	if (data.wallets != undefined) {
		if (data.wallets.length > 0) {
			let walletArray: any = [];
			for (let i = 0; i < data.wallets.length; i++) {
				walletArray.push(data.wallets[i]);
			}
			window.electron.ipcRenderer.writeAddress(walletArray);
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

export function removeTask(index) {
	window.electron.ipcRenderer.deleteAddress(index);
}

export function removeAllTasks() {
	window.electron.ipcRenderer.removeAllWallets();
}