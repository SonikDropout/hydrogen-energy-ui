const Serial = require('serialport');
const { PORT, SEPARATORS } = require('../constants');
const EventEmitter = require('events');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });
const emitter = new EventEmitter();

serial.on('open', () => serial.write(Buffer.from([30, 80, 120, 230])));

serial.on('data', handleData);

const buffer = Buffer.alloc(52);
let offset = 0;

function handleData(buf) {
  if (buf.toString('ascii').startsWith('ok')) buf = buf.slice(2);
  idx = buf.indexOf(SEPARATORS);
  if (idx != -1) {
    buf.copy(buffer, offset, 0, idx);
    try {
      emitter.emit('data', parse(buffer.slice()));
    } catch (e) {
      // pass invalid buffer
    }
    offset = 0;
    buf.copy(buffer, offset, idx);
    offset = buf.length;
  } else {
    buf.copy(buffer, offset);
    offset += buf.length;
  }
}

let commandQueue = [];
let portBusy = false;

function sendCommand(bytes) {
  let [byte1, byte2] = isNaN(bytes) ? bytes : [bytes, 0];
  commandQueue.push(Buffer.from([30, byte1, byte2, byte1 + byte2 + 30]));
  if (!portBusy) {
    portBusy = true;
    writeCommandFromQueue();
  }
}

function writeCommandFromQueue() {
  if (!commandQueue.length) {
    portBusy = false;
    return;
  }
  const cmd = commandQueue.shift();
  console.log('Sending Command to COM', cmd);
  serial.write(cmd);
  serial.once('data', buf => {
    console.log('Recived confirm:', buf.toString('ascii'));
    if (!buf.toString('ascii').startsWith('ok')) {
      commandQueue.unshift(cmd);
    }
    writeCommandFromQueue();
  });
}

function close() {
  emitter.removeAllListeners();
  if (serial.isOpen) serial.close();
}

function startCalibration(cb) {
  serial.removeListener('data', handleData);
  serial.write(Buffer.from([30, 64, 0, 94]));
  serial.once('data', handleCalibrationConfirm.bind(null, cb));
}

function handleCalibrationConfirm(cb, buf) {
  if (buf.toString('ascii') === 'ok')
    serial.once('data', buf => {
      cb(buf[0]);
      serial.on('data', handleData);
    });
  else serial.once('data', handleCalibrationConfirm.bind(null, cb));
}

emitter.close = close;
emitter.sendCommand = sendCommand;
emitter.startCalibration = startCalibration;

module.exports = emitter;
