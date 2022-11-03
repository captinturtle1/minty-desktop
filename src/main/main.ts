/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs from 'fs';


class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('write-address', (event, data) => {
  fs.readFile('wallets.json', 'utf8', (err: any, readData: any) => {
  	if (err) {
  		throw err;
  	}

    let walletsObject: any = {"wallets": <any>[]};

    if (readData !== '') {
      let readDataParsed = JSON.parse(readData);
      walletsObject.wallets = readDataParsed.wallets
      let newArray = walletsObject.wallets.concat(data);
      walletsObject.wallets = newArray;
      fs.writeFile('wallets.json', JSON.stringify(walletsObject), (err) => {
        if (err) {
          throw err;
        }
      });
    } else {
      let newArray = walletsObject.wallets.concat(data);
      walletsObject.wallets = newArray;
      fs.writeFile('wallets.json', JSON.stringify(walletsObject), (err) => {
      	if (err) {
      		throw err;
      	}
      });
    }
  });
  event.reply('write-address', 'done');
})

ipcMain.on('delete-address', (event, index) => {
  fs.readFile('wallets.json', 'utf8', (err: any, readData: any) => {
  	if (err) {
  		throw err;
  	}

    const compareNumbers = (a, b) => {
      return b - a;
    }

    if (readData !== '') {
      let walletsObject: any = {"wallets": <any>[]};
      let readDataParsed = JSON.parse(readData);
      walletsObject.wallets = readDataParsed.wallets
      index.sort(compareNumbers);
      for (let i = 0; i < index.length; i++) {
        walletsObject.wallets.splice(index[i], 1);
      }
      fs.writeFile('wallets.json', JSON.stringify(walletsObject), (err) => {
      	if (err) {
      		throw err;
      	}
      });
    } else {
      console.log('no data');
    }
  });
  event.reply('delete-address', 'done');
})

ipcMain.on('remove-all-wallets', (event) => {
  let walletsObject: any = {"wallets": <any>[]};
  fs.writeFile('wallets.json', JSON.stringify(walletsObject), (err) => {
  	if (err) {
  		throw err;
  	}
  });
  event.reply('remove-all-wallets', 'done');
})

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 1024,
    minHeight: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#3b82f6',
      symbolColor: '#',
      height: 40
    },
  });

  // hides menu
  mainWindow.setMenuBarVisibility(false)

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
