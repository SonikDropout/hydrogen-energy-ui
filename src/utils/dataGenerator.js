const { DATA, STATE_DATA } = require('../constants');
const { clone } = require('./others');

function randInt(min, max) {
  if (isNaN(max)) {
    max = min;
    min = 0;
  }
  return (Math.random() * (max - min) + min) & 1;
}

const cbPoll = [];

function subscribe(fn) {
  cbPoll.push(fn);
}

let interval = setInterval(sendData, 1000);

function sendData() {
  cbPoll.forEach((cb) => cb(randomData()));
}

function randomData() {
  const d = {
    ...clone(DATA),
    ...clone(STATE_DATA),
  };
  for (const key in DATA) {
    d[key].value = randInt(10);
  }
  for (const key in STATE_DATA) {
    d[key].value = 0;
  }
  return d;
}

function sendCommand(cmd) {
  console.info('Sending command to serial:', cmd);
}

module.exports = {
  subscribe,
  sendCommand,
  unsubscribeAll() {
    clearInterval(interval);
  },
};
