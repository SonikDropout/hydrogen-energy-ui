const path = require('path');
const url = require('url');
const electron = require('electron');
const logger = require('./src/utils/logger');
const usbPort = require('./src/utils/usbPort');
const { clone } = require('./src/utils/others');
const { IS_RPI: isPi, STATE_DATA, FC_DATA } = require('./src/constants');
const { app, BrowserWindow, ipcMain } = electron;

let win,
  usbPath,
  initialData = clone(FC_DATA);

for (let key in initialData) initialData[key].value = 0;
for (let key in STATE_DATA) initialData[key] = 0;
initialData.connectionType = 1;
for (let pos of [1, 2]) {
  initialData['power' + pos] = {
    symbol: 'P',
    units: 'Вт',
    value:
      initialData['current' + pos].value * initialData['voltage' + pos].value,
  };
}

const mode = process.env.NODE_ENV;

function reloadOnChange(win) {
  if (mode !== 'development') return { close: () => {} };

  const watcher = require('chokidar').watch(
    path.join(__dirname, 'dist', '**'),
    {
      ignoreInitial: true,
    }
  );

  watcher.on('change', () => {
    win.reload();
  });

  return watcher;
}

function initPeripherals(win) {
  ipcMain.on('initial-data-request', e => (e.returnValue = initialData));
  const serial = require(`./src/utils/serial${isPi ? '' : '.mock'}`);
  usbPort
    .on('add', path => {
      usbPath = path;
      win.webContents.send('usbConnected');
    })
    .on('remove', () => {
      usbPath = void 0;
      win.webContents.send('usbDisconnected');
    });
  serial
    .on('data', d => win.webContents.send('serialData', d))
    .once('data', d => (initialData = d));
  ipcMain.on('writeExcel', (_, options) =>
    logger.writeLog({
      dir: usbPath,
      cb: () => win.webContents.send('fileSaved'),
      ...options,
    })
  );
  ipcMain.on('serialCommand', (_, ...args) => serial.sendCommand(...args));
  ipcMain.on('usbStorageRequest', usbPort.init);
  return {
    removeAllListeners() {
      usbPort.removeAllListeners();
      serial.close();
    },
  };
}

function launch() {
  const screenArea = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: isPi ? screenArea.width : 1024,
    height: isPi ? screenArea.height : 600,
    fullscreen: isPi,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, './static/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  const watcher = reloadOnChange(win);
  const peripherals = initPeripherals(win);

  win.on('closed', function() {
    peripherals.removeAllListeners();
    win = null;
    watcher.close();
  });
}

app.on('ready', launch);
