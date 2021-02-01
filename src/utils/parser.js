const { SEPARATORS, FC_DATA, STATE_DATA, __ } = require('../constants');
const { clone } = require('./others');

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0)
    throw new Error('Invalid buffer recieved');
}

const data = {
  ...clone(FC_DATA),
  power1: {
    symbol: 'P',
    units: 'W',
  },
  power2: {
    symbol: 'P',
    units: 'W',
  },
};

module.exports = function parse(buf) {
  validate(buf);
  let i = SEPARATORS.length;
  for (const key in FC_DATA) {
    let value = buf.readUInt16BE(i) / (data[key].divider || 1);
    if (key.startsWith('voltage')) data[key].value = +value.toFixed(2);
    else data[key].value = +value.toPrecision(4);
    i += 2;
  }
  for (const key in STATE_DATA) {
    data[key] = buf[i++];
  }
  for (const pos of [1, 2]) {
    let value = data['current' + pos].value * data['voltage' + pos].value;
    if (value < 0.001) value = 0;
    data['power' + pos].value = +value.toPrecision(3);
  }
  return data;
};
