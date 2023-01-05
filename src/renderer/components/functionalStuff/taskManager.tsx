import { rejects } from 'assert';
import { ethers } from 'ethers';

const getRpc = async () => {
	let settings:any = await window.electron.ipcRenderer.getSettings();
	settings = JSON.parse(settings);
	return settings.rpc;
};

const getWebhook = async () => {
	let settings:any = await window.electron.ipcRenderer.getSettings();
	settings = JSON.parse(settings);
	return settings.webhook;
};

export const sendWebhook = async (message: string) => {
	let webhook = await getWebhook();
    fetch(
      webhook, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {
            username: "Minty",
            avatar_url: "https://i.kym-cdn.com/entries/icons/original/000/037/848/cover2.jpg",
            content: message
          }
        )
      }
    );
  }

export async function getTasks() {
	return await window.electron.ipcRenderer.getTasks();
}

export async function getWallets() {
	return await window.electron.ipcRenderer.getWallets();
}

export function createAndStoreTask(createdTasksArray) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await window.electron.ipcRenderer.writeTask(createdTasksArray);
			resolve(response);
		} catch (err) {
			reject(err);
		}
	});
}

export function importAndStoreTaskFromFile(data) {
	return new Promise(async (resolve, reject) => {
		try {
			if (data.tasks != undefined) {
				if (data.tasks.length > 0) {
					let taskArray: any = [];
					for (let i = 0; i < data.tasks.length; i++) {
						taskArray.push(data.tasks[i]);
					}
					let response = await window.electron.ipcRenderer.writeTask(taskArray);
					resolve(response);
				} else {
					reject("no tasks");
				}
			} else {
				reject("data undefined");
			}
		} catch (err) {
			reject(err);
		}
	});
}

export function removeTask(indexes) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await window.electron.ipcRenderer.deleteTask(indexes);
			resolve(response);
		} catch (err) {
			reject(err);
		}
	});
}



export async function startTask(task) {
	return new Promise(async (resolve, reject) => {
		let provider = ethers.providers.getDefaultProvider(await getRpc());
		let wallet = new ethers.Wallet(task.pk, provider);
		let txCost = ethers.utils.parseUnits(task.cost, "ether");
		let txObject:any;
		if (task.gasMode == "Auto") {
			if (task.limitMode == "Auto") {
				txObject = {
					to: task.contract,
					value: txCost,
					data: task.hex
				}
			} else {
				txObject = {
					to: task.contract,
					value: txCost,
					data: task.hex,
					gasLimit: task.userSetLimit
				}
			}
		} else {
			if (task.limitMode == "Auto") {
				txObject = {
					to: task.contract,
					value: txCost,
					data: task.hex,
					maxFeePerGas: ethers.utils.parseUnits(task.userSetGas, "gwei"),
					maxPriorityFeePerGas: ethers.utils.parseUnits(task.userSetPrio, "gwei")
				}
			} else {
				txObject = {
					to: task.contract,
					value: txCost,
					data: task.hex,
					maxFeePerGas: ethers.utils.parseUnits(task.userSetGas, "gwei"),
					maxPriorityFeePerGas: ethers.utils.parseUnits(task.userSetPrio, "gwei"),
					gasLimit: task.userSetLimit
				}
			}
		}
		wallet.sendTransaction(txObject).then(receipt => {
			resolve(receipt);
		}).catch(err => {
			reject(err);
		});
	});
}

export function cancelTask(task, taskStatus) {
	return new Promise(async (resolve, reject) => {
		let provider = ethers.providers.getDefaultProvider(await getRpc());
		let wallet = new ethers.Wallet(task.pk, provider);
		let txObject = {
			to: wallet.address,
			value: 0,
			nonce: taskStatus.nonce,
			maxFeePerGas: (taskStatus.maxFeePerGas).mul(2),
			maxPriorityFeePerGas: (taskStatus.maxPriorityFeePerGas).mul(2)
		}

		wallet.sendTransaction(txObject).then(receipt => {
			resolve(receipt);
		}).catch(err => {
			reject(err);
		});
	});
}

export function speedUpTask(task) {
	
}