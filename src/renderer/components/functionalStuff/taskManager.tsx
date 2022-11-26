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
	window.electron.ipcRenderer.writeTask(createdTasksArray);
}

export function importAndStoreTaskFromFile(data) {
	if (data.tasks != undefined) {
		if (data.tasks.length > 0) {
			let taskArray: any = [];
			for (let i = 0; i < data.tasks.length; i++) {
				taskArray.push(data.tasks[i]);
			}
			window.electron.ipcRenderer.writeTask(taskArray);
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

export function removeTask(indexes) {
	window.electron.ipcRenderer.deleteTask(indexes);
}