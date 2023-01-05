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

const sendWebhook = async (message: string) => {
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
    console.log("webhook sent");
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



export async function startAllTasks(tasks, taskStatuses, setTaskStatuses, txInfo, setTxInfo) {
	console.log(tasks, tasks.length);
	return new Promise(async (resolve) => {
		console.log("Sending transactions");
		let provider = ethers.providers.getDefaultProvider(await getRpc());
		for (let i = 0; i < tasks.length; i++) {
			let newStatusArray = taskStatuses;
			let newTxInfo = txInfo;
			try {
				let wallet = new ethers.Wallet(tasks[i].pk, provider);
				let txCost = ethers.utils.parseUnits(tasks[i].cost, "ether");
				let txObject:any;
				if (tasks[i].gasMode == "Auto") {
					if (tasks[i].limitMode == "Auto") {
						txObject = {
							to: tasks[i].contract,
							value: txCost,
							data: tasks[i].hex
						}
					} else {
						txObject = {
							to: tasks[i].contract,
							value: txCost,
							data: tasks[i].hex,
							gasLimit: tasks[i].userSetLimit
						}
					}
				} else {
					if (tasks[i].limitMode == "Auto") {
						txObject = {
							to: tasks[i].contract,
							value: txCost,
							data: tasks[i].hex,
							maxFeePerGas: ethers.utils.parseUnits(tasks[i].userSetGas, "gwei"),
							maxPriorityFeePerGas: ethers.utils.parseUnits(tasks[i].userSetPrio, "gwei")
						}
					} else {
						txObject = {
							to: tasks[i].contract,
							value: txCost,
							data: tasks[i].hex,
							maxFeePerGas: ethers.utils.parseUnits(tasks[i].userSetGas, "gwei"),
							maxPriorityFeePerGas: ethers.utils.parseUnits(tasks[i].userSetPrio, "gwei"),
							gasLimit: tasks[i].userSetLimit
						}
					}
				}
				

				function sendTask() {
					if (newTxInfo[i] != 3) {
						newStatusArray.splice(i, 1, "Sending tx");
						setTaskStatuses([...newStatusArray]);

						newTxInfo.splice(i, 1, 1);
						setTxInfo([...newTxInfo]);

						wallet.sendTransaction(txObject).then(receipt => {
							newStatusArray.splice(i, 1, "Pending");
							setTaskStatuses([...newStatusArray]);

							newTxInfo.splice(i, 1, receipt);
							setTxInfo([...newTxInfo]);

							console.log(receipt);

							sendWebhook(`sent https://goerli.etherscan.io/tx/${receipt.hash}`);
							receipt.wait(1).then(response => {
								newStatusArray.splice(i, 1, "Confirmed");
								setTaskStatuses([...newStatusArray]);

								newTxInfo.splice(i, 1, response);
								setTxInfo([...newTxInfo]);
						
								console.log(response)
								sendWebhook(`confirmed https://goerli.etherscan.io/tx/${response.transactionHash}`);
								if (i == tasks.length - 1) {
									resolve("tx's confirmed");
								}
							}).catch(console.log);
						}).catch(err => {
							newStatusArray.splice(i, 1, "Tx will fail");
							setTaskStatuses([...newStatusArray]);

							newTxInfo.splice(i, 1, 2);
							setTxInfo([...newTxInfo]);

							console.log(err);
							setTimeout(() => {
								sendTask();
							}, 5000)
						});
					}
				}
				sendTask();
				
			} catch(err) {
				newStatusArray.splice(i, 1, "Error");
				setTaskStatuses([...newStatusArray]);
				console.log(err);
			}
		}
	});
}

export function cancelAllTasks(tasks, taskStatuses, setTaskStatuses, txInfo, setTxInfo) {
	let newStatusArray = taskStatuses;
	let newTxInfo = txInfo;
	for (let i = 0; i < tasks.length; i++) {
		newStatusArray.splice(i, 1, "Canceling");
		setTaskStatuses([...newStatusArray]);

		newTxInfo.splice(i, 1, 3);
		setTxInfo([...newTxInfo]);
	}
}

export function stopAllTasks(tasks, taskStatuses, setTaskStatuses, txInfo, setTxInfo) {
	console.log("attempting stop");
	let newStatusArray = taskStatuses;
	let newTxInfo = txInfo;
	for (let i = 0; i < tasks.length; i++) {
		if (newTxInfo[i] == 1 || newTxInfo[i] == 2) {
			newStatusArray.splice(i, 1, "Stopping");
			setTaskStatuses([...newStatusArray]);

			newTxInfo.splice(i, 1, 3);
			setTxInfo([...newTxInfo]);
		}
	}
}

export function speedUpAllTasks(tasks) {
	
}