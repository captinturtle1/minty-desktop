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

export function importAndStoreWallet(name: string, pkString) {
	try {
		console.log("importingFromString");
		let noSpace = pkString.replace(/\s+/g, '');
		let pkArray = noSpace.split(",");
		let walletArray: any = [];
		for (let i = 0; i < pkArray.length; i++) {
			if (!/^0x[a-fA-F0-9]{64}$/.test(pkArray[i])) {
				console.log(pkArray[i], "not a pk");
				return false;
    	    }
			let newWalletData: any;
			let newwallet = new ethers.Wallet(pkArray[i]);
			if (pkArray.length > 0) {
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
		return true;
	} catch (err) {
		console.log(err);
		return false
	}
}

export function importAndStoreWalletFromFile(data) {
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

export function removeWallet(index) {
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
			let cost = ethers.utils.parseEther((amountToDisperse * walletAddressArray.length).toString());
			let amountPer = ethers.utils.parseEther(amountToDisperse);
			let overrides = {
				value: cost
			};
			console.log('sending', parseInt(amountPer.toString()), 'each to', walletAddressArray);
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

export async function consolidate(walletSelected, walletsSelected, wallets) {
	return new Promise(async (resolve) => {
		console.log("consolidating");
		try {
			for (let i = 0; i < walletsSelected.length; i++) {
				let wallet = new ethers.Wallet(wallets[walletsSelected[i]].privateKey, provider);
				let balanceWei:any = await provider.getBalance(wallets[walletsSelected[i]].address);
				let bigNumberGas:any = await provider.getFeeData();

				let calculatedCost = (bigNumberGas.maxFeePerGas.add(bigNumberGas.maxPriorityFeePerGas)).mul(21000);
				let balanceMinusFee = balanceWei.sub(calculatedCost);
				let minusFeeString = balanceMinusFee.toString();

				console.log('sending', parseInt(minusFeeString), 'from', wallets[walletsSelected[i]].address, 'to', walletSelected);
				const tx = await wallet.sendTransaction({
					to: walletSelected,
					value: minusFeeString
				});
				tx.wait(1).then(()=> {
					if (i == walletsSelected.length - 1) {
						console.log('resolving');
						resolve(true);
					}
				})
			}
		} catch (err) {
			console.log(err);
			resolve(false);
		}
	});
}