const path = require('path');
const fs = require('fs');
const url = require('url');
const electron = require('electron');
const logger = require('./src/utils/logger');
const usbPort = require('./src/utils/usbPort');
const { IS_RPI: isPi, SETTINGS_PATH } = require('./src/constants');
const settings = require(SETTINGS_PATH);
const { app, BrowserWindow, ipcMain } = electron;

let win, usbPath;

const mode = process.env.NODE_ENV;

if (mode == 'development') {
  var childProcess = require('child_process');
  var oldSpawn = childProcess.spawn;
  function mySpawn() {
    console.log('spawn called');
    console.log(arguments);
    var result = oldSpawn.apply(this, arguments);
    return result;
  }
  childProcess.spawn = mySpawn;
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  });
}

function onCalibrationFinish(report) {
  return function(criticalConcentration) {
    settings.criticalHydrogenConcentration = criticalConcentration;
    console.log('WRITING SETTINGS TO FILE:', settings);
    fs.writeFile(SETTINGS_PATH, JSON.stringify(settings), () => {
      report('calibrationFinish', criticalConcentration);
    });
  };
}

function initPeripherals(win) {
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
    .on('data', () => win.webContents.send('appInitialized'));
  ipcMain.on('calibrationStart', e =>
    serial.startCalibration(onCalibrationFinish(e.reply))
  );
  ipcMain.on('saveFile', (_, options) => {
    try {
      logger.writeLog({
        dir: usbPath,
        cb: (e) => win.webContents.send('fileSaved', e),
        ...options,
      });
    } catch (e) {
      console.error(e);
      win.webContents.send('fileSaved', e);
    }
  });
  ipcMain.on('serialCommand', (_, bytes) => serial.sendCommand(bytes));
  ipcMain.on('usbStorageRequest', usbPort.init);
  ipcMain.on('ejectUSB', () =>
    usbPort.eject(() => win.webContents.send('usbEjected'))
  );
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
    width: isPi ? screenArea.width : 1280,
    height: isPi ? screenArea.height : 800,
    fullscreen: isPi,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'src', 'preload.js')
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'static', 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  const peripherals = initPeripherals(win);

  win.on('closed', function() {
    peripherals.removeAllListeners();
    win = null;
  });
}

app.on('ready', launch);
