import { ethers } from 'ethers';
import abi from './abi.json';

const getRpc = async () => {
	let settings:any = await window.electron.ipcRenderer.getSettings();
	settings = JSON.parse(settings);
	return settings.rpc;
};

const disperseAddress = "0x1EbD7f4ea90DBD3d6Be68869502B2022Aa000d0c";

export async function getWallets() {
	return await window.electron.ipcRenderer.getWallets();
}

export function createAndStoreWallet(name: string, amount: number) {
	return new Promise(async (resolve, reject) => {
		try {
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
			let response = await window.electron.ipcRenderer.writeAddress(walletArray);
			resolve(response);
		} catch (err) {
			reject(err);
		}
	});
}

export function importAndStoreWallet(name: string, pkString) {
	return new Promise(async (resolve, reject) => {
		try {
			console.log("importing from string");
			let noSpace = pkString.replace(/\s+/g, '');
			let pkArray = noSpace.split(",");
			let walletArray: any = [];
			for (let i = 0; i < pkArray.length; i++) {
				if (!/^0x[a-fA-F0-9]{64}$/.test(pkArray[i])) {
					console.log(pkArray[i], "not a pk");
					reject(`${pkArray[i]} not a valid address`);
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
			let response = await window.electron.ipcRenderer.writeAddress(walletArray);
			resolve(response);
		} catch (err) {
			reject(err)
		}
	});
}

export function importAndStoreWalletFromFile(data) {
	return new Promise(async (resolve, reject) => {
		try {
			if (data.wallets != undefined) {
				if (data.wallets.length > 0) {
					let walletArray: any = [];
					for (let i = 0; i < data.wallets.length; i++) {
						walletArray.push(data.wallets[i]);
					}
					let response = await window.electron.ipcRenderer.writeAddress(walletArray);
					resolve(response);
				} else {
					reject("no wallets");
				}
			} else {
				reject("data undefined");
			}
		} catch (err) {
			reject(err);
		}
	});
}

export function removeWallet(index:number[]) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await window.electron.ipcRenderer.deleteAddress(index);
			resolve(response);
		} catch (err) {
			reject(err);
		}
	});
}

export async function getBalances(wallets) {
	return new Promise(async (resolve, reject) => {
		try {
			let provider = ethers.providers.getDefaultProvider(await getRpc());
			console.log("getting balances");
			let walletsBalanceArray: any = []
			for (let i = 0; i < wallets.length; i++) {
				let balanceWei = await provider.getBalance(wallets[i].address);
				let balanceEther = ethers.utils.formatEther(balanceWei);
				walletsBalanceArray[i] = balanceEther.substring(0,7);
			}
			console.log(walletsBalanceArray);
			resolve(walletsBalanceArray);
		} catch (err) {
			reject(err);
		}
	});
}

export async function disperse(walletsSelected, wallets, amountToDisperse, selectedPk) {
	return new Promise(async (resolve, reject) => {
		console.log("dispersing");
		try {
			let provider = ethers.providers.getDefaultProvider(await getRpc());
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
				resolve(receipt);
			})
		} catch (err) {
			console.log(err);
			reject(err);
		}
	});
}

export async function consolidate(walletSelected, walletsSelected, wallets) {
	return new Promise(async (resolve, reject) => {
		console.log("consolidating");
		try {
			let provider = ethers.providers.getDefaultProvider(await getRpc());
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
						resolve(tx);
					}
				})
			}
		} catch (err) {
			console.log(err);
			reject(err);
		}
	});
}