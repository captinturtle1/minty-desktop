import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        getPath(): unknown;
		    getTasks(): unknown;
        getWallets(): unknown;
		    writeAddress(data: any): unknown;
        deleteAddress(data: number[]): unknown;
        writeTask(data: any): unknown;
        deleteTask(data: number[]): unknown;
        getSettings(): unknown;
        setSettings(data: any): unknown;
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
