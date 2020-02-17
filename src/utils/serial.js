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

function sendCommand(byte1, byte2 = 0) {
  serial.write(Buffer.from([10, byte1, byte2, byte1 + byte2 + 10]));
}

module.exports = {
  subscribe,
  sendCommand,
};
