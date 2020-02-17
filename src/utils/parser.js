const { SEPARATORS } = require('../constants');
const { clone } = require('./others');

function validate(buf) {
  for (let i = 0; i < SEPARATORS.length; i++) {
    if (buf.readUInt16LE(i * 2) != SEPARATORS[i])
      throw new Error('Invalid buffer');
  }
}

module.exports = function parse(buf) {
  validate(buf);
  return {};
};
