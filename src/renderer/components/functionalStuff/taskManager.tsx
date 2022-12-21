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