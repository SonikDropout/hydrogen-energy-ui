const { SEPARATORS, FC_DATA, STATE_DATA } = require('../constants');
const { clone } = require('./others');

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0)
    throw new Error('Invalid buffer recieved');
}

const data = {
  ...clone(FC_DATA),
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
  for (const key in FC_DATA) {
    data[key].value = +(buf.readUInt16BE(i) / (data[key].divider || 1)).toPrecision(4);
    i += 2;
  }
  for (const key in STATE_DATA) {
    data[key] = buf[i++];
  }
  for (const pos of [1, 2]) {
    data['power' + pos].value = +(data['current' + pos].value * data['voltage' + pos].value).toPrecision(4);
  }
  return data;
};
