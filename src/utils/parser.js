const { SEPARATORS, DATA, STATE_DATA } = require('../constants');
const { clone } = require('./others');

module.exports = function parse(buf) {
  const result = {
    ...clone(DATA),
    ...clone(STATE_DATA),
  }
  let i = SEPARATORS.length;
  for (const key in DATA) {
    result[key].value = buf.readUInt16LE(i++ * 2);
  }
  i *= 2;
  for (const key in STATE_DATA) {
    result[key] = buf.readUInt8LE(i++);
  }
  return result;
};
