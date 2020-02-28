const { SEPARATORS, DATA, STATE_DATA } = require('../constants');
const { clone } = require('./others');

function validate(buffer) {
  if (!buffer.indexOf(SEPARATORS) == 0)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  const result = {
    ...clone(DATA),
    ...clone(STATE_DATA),
  }
  let i = SEPARATORS.length;
  for (const key in DATA) {
    result[key].value = buf.readUInt16BE(i++ * 2);
  }
  i *= 2;
  for (const key in STATE_DATA) {
    result[key] = buf[i++];
  }
  return result;
};
