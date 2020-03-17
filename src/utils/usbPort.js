const usbDetect = require('usb-detection');
const driveList = require('drivelist');
const EventEmitter = require('events');
const { exec } = require('child_process');

const usbPort = new EventEmitter();
let connectedDevice, timeout;

function delay(fn, ms) {
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(fn, ms, ...args);
  };
}

Object.defineProperty(usbPort, 'isDeviceConnected', {
  get: function() {
    return !!connectedDevice;
  },
});

usbDetect.startMonitoring();
usbDetect.on('add', delay(findDrive, 1500));
usbDetect.on('remove', handleRemove);

function findDrive() {
  driveList
    .list()
    .then(handleDrives)
    .catch(console.error);
}

function handleDrives(drives) {
  const drive = drives.find(isSuitableDrive);
  if (!drive) return;
  connectedDevice = drive.device;
  if (!drive.mountpoints[0]) mountDevice(drive.device);
  else usbPort.emit('add', drive.mountpoints[0].path);
}

function mountDevice(device) {
  exec(`sudo mount ${device + 1} /media/usb1`, (error, stdout, stderr) => {
    if (error) {
      console.error(error.message);
      return;
    }
    if (stderr) {
      console.error(stderr);
      return;
    }
    usbPort.emit('add', '/media/usb1');
  });
}

function isSuitableDrive(drive) {
  return !drive.isSystem && drive.isUSB;
}

function handleRemove() {
  driveList.list().then(drives => {
    if (!drives.find(drive => drive.device === connectedDevice)) {
      usbPort.emit('remove');
    }
  });
}

usbPort.eject = cb => {
  exec(`sudo eject ${connectedDevice}`, () => {
    connectedDevice = void 0;
    cb();
  });
};

usbPort.init = findDrive;

module.exports = usbPort;
