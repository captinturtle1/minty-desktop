import { ethers } from 'ethers';

const getRpc = async () => {
	let settings:any = await window.electron.ipcRenderer.getSettings();
	settings = JSON.parse(settings);
	return settings.rpc;
};

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



export async function startTasks(tasks) {
	console.log(tasks, tasks.length);
	return new Promise(async (resolve, reject) => {
		console.log("Sending transactions");
		let provider = ethers.providers.getDefaultProvider(await getRpc());
		for (let i = 0; i < tasks.length; i++) {
			try {
				let wallet = new ethers.Wallet(tasks[i].pk, provider);
				let txCost = ethers.utils.parseUnits(tasks[i].cost, "ether");
				let gasInWei = ethers.utils.parseUnits(tasks[i].userSetGas, "gwei");
				let prioInWei = ethers.utils.parseUnits(tasks[i].userSetPrio, "gwei");
				
				if (tasks[i].gasMode == "Auto") {
					if (tasks[i].limitMode == "Auto") {
						let receipt = await wallet.sendTransaction({
							to: tasks[i].contract,
							value: txCost,
							data: tasks[i].hex
						});
						console.log(receipt);
						receipt.wait(1).then(response => {
							console.log(response)
						}).catch(console.log);
					} else {
						let receipt = await wallet.sendTransaction({
							to: tasks[i].contract,
							value: txCost,
							data: tasks[i].hex,
							gasLimit: tasks[i].userSetLimit
						});
						console.log(receipt);
						receipt.wait(1).then(response => {
							console.log(response)
						}).catch(console.log);
					}
				} else {
					if (tasks[i].limitMode == "Auto") {
						let receipt = await wallet.sendTransaction({
							to: tasks[i].contract,
							value: txCost,
							data: tasks[i].hex,
							maxFeePerGas: gasInWei,
							maxPriorityFeePerGas: prioInWei
						});
						console.log(receipt);
						receipt.wait(1).then(response => {
							console.log(response)
						}).catch(console.log);
					} else {
						let receipt = await wallet.sendTransaction({
							to: tasks[i].contract,
							value: txCost,
							data: tasks[i].hex,
							maxFeePerGas: gasInWei,
							maxPriorityFeePerGas: prioInWei,
							gasLimit: tasks[i].userSetLimit
						});
						console.log(receipt);
						receipt.wait(1).then(response => {
							console.log(response)
						}).catch(console.log);
					}
				}
			} catch(err) {
				console.log(err);
			}
		}
		resolve("Sent");
	});
}

export function speedUpTasks(tasks) {
	
}

export function cancelTasks(tasks) {
	
}