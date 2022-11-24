import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    getWallets: () => ipcRenderer.invoke('get-wallets'),
    initDataFiles: () => ipcRenderer.send('init-data'),
    writeAddress: (address: any) => ipcRenderer.invoke('write-address', address),
    deleteAddress: (index: number[]) => ipcRenderer.invoke('delete-address', index),
    removeAllWallets: () => ipcRenderer.send('remove-all-wallets'),
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
