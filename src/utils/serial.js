const Serial = require('serialport');
const { PORT } = require('../constants');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });

function subscribe(fn) {
  serial.on('data', (buf) => {
    try {
      fn(parse(buf));
    } catch (e) {
      // pass invalid buffer
    }
  });
}

function sendCommand(bytes) {
  let [byte1, byte2] = isNaN(bytes) ? bytes : [bytes, 0];
  serial.write(Buffer.from([30, byte1, byte2, byte1 + byte2 + 30]));
  serial.once('data', (buf) => {
    if (buf[0] != 231) sendCommand(bytes);
  });
}

module.exports = {
  subscribe,
  sendCommand,
  unsubscribeAll: serial.removeAllListeners
};
