const { SEPARATORS, DATA, STATE_DATA } = require('../constants');
const { clone } = require('./others');

function validate(buffer) {
  if (!buffer.indexOf(SEPARATORS) == 0)
    throw new Error('Invalid buffer recieved');
}

const data = {
  ...clone(DATA),
  power1: {
    symbol: 'P',
    units: 'Вт',
  },
  power2: {
    symbol: 'P',
    units: 'Вт',
  }
}

module.exports = function parse(buf) {
  validate(buf);
  let i = SEPARATORS.length;
  for (const key in DATA) {
    data[key].value = buf.readUInt16BE(i++ * 2);
  }
  i *= 2;
  for (const key in STATE_DATA) {
    data[key] = buf[i++];
  }
  for (const pos of [1, 2]) {
    debugger;
    data['power' + pos].value = data['current' + pos].value * data['voltage' + pos].value;
  }
  return data;
};
