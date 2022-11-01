import { ethers } from 'ethers';
import abi from './abi.json';

const provider = new ethers.providers.InfuraProvider("goerli", "ccd0f54c729d4e58a9b7b34cb3984555")
const disperseAddress = "0x1EbD7f4ea90DBD3d6Be68869502B2022Aa000d0c";

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
	return new Promise(async (resolve) => {
		console.log("getting balances");
		let walletsBalanceArray: any = []
		for (let i = 0; i < wallets.length; i++) {
			let balanceWei = await provider.getBalance(wallets[i].address);
			let balanceEther = ethers.utils.formatEther(balanceWei);
			walletsBalanceArray[i] = balanceEther.substring(0,7);
		}
		resolve(walletsBalanceArray);
	});
}

export async function disperse(walletsSelected, wallets, amountToDisperse, selectedPk) {
	return new Promise(async (resolve) => {
		console.log("dispersing");
		try {
			let signer = new ethers.Wallet(selectedPk, provider);
			const disperseContract = new ethers.Contract(disperseAddress, abi, signer);
			let walletAddressArray: any = [];
			for (let i = 0; i < walletsSelected.length; i++) {
				walletAddressArray.push(wallets[walletsSelected[i]].address);
			}
			let cost = (amountToDisperse * walletAddressArray.length) * 1000000000000000000;
			let amountPer = amountToDisperse * 1000000000000000000;
			let overrides = {
				value: cost.toString()
			};
			let receipt = await disperseContract.disperseEther(walletAddressArray, amountPer, overrides);
			receipt.wait(1).then(() => {
				console.log("Confirmed");
				resolve(true);
			})
		} catch (err) {
			console.log(err);
			resolve(false);
		}
	});
}