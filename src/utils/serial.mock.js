const { FC_DATA, STATE_DATA } = require('../constants');
const EventEmitter = require('events');
const { clone } = require('./others');

const emitter = new EventEmitter();

function randInt(min, max) {
  if (isNaN(max)) {
    max = min;
    min = 0;
  }
  return (Math.random() * (max - min) + min) & 1;
}

let interval = setInterval(sendData, 1000);

function sendData() {
  emitter.emit('data', randomData());
}

function randomData() {
  const d = clone(FC_DATA)
  for (const key in FC_DATA) {
    d[key].value = randInt(10);
  }
  for (const key in STATE_DATA) {
    d[key] = 0;
  }
  for (let pos of [1, 2]) {
    d['power' + pos] = {
      symbol: 'P',
      units: 'W',
      value:
        d['current' + pos].value * d['voltage' + pos].value,
    };
  }
  return d;
}

emitter.close = () => clearInterval(interval);
emitter.sendCommand = console.log.bind(console, 'Sending command to serial:');
emitter.startCalibration = (cb) => {
  console.log('Start hydrogen sensor calibration');
  cb(0);
}

module.exports = emitter;
