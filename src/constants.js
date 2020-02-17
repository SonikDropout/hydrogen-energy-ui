const { concat } = require('./utils/others');

const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = IS_RPI ? '/dev/ttyAMA0' : 'COM5';
const SEPARATORS = [];

const STATES = {
  initial: 'params',
  charts: 'charts',
  research: 'research',
};

const HIGH_CONCENCTRATION = 0;
const CRITICAL_CONCENCTRATION = 0;
const CRITICAL_PRESSURE = 0;

const SINGLE_DATA = {
  voltage: {
    symbol: 'U',
    units: 'В',
  },
  current: {
    symbol: 'I',
    units: 'А',
  },
  power: {
    symbol: 'P',
    units: 'Вт',
  },
  temp1: {
    symbol: 'T<sub>1</sub>',
    units: '\u02daC',
  },
  temp2: {
    symbol: 'T<sub>2</sub>',
    units: '\u02daC',
  },
  consumption: {
    symbol: 'Q',
    units: 'мл/мин',
  },
};

const COMMON_DATA = {
  pressure: {
    symbol: 'p',
    units: 'атм',
  },
  temp: {
    symbol: 'T<sub>H<sub>2</sub></sub>',
    units: '\u02daC',
  },
  consumption: {
    symbol: 'Q<sub>&#2211</sub>',
    units: 'мл/мин',
  },
  power: {
    symbol: 'P<sub>&#2211</sub>',
    units: 'Вт',
  },
  temp: {
    symbol: 'T<sub>H<sub>2</sub></sub>',
    units: '\u02daC',
  },
  voltage: {
    symbol: 'U<sub>&#2211</sub>',
    units: 'В',
  },
  current: {
    symbol: 'I<sub>&#2211</sub>',
    units: 'А',
  },
  currentInternal: {
    symbol: 'I<sub>внутр нагр</sub>',
    units: 'А',
  },
  currentExternal: {
    symbol: 'I<sub>внеш нагр</sub>',
    units: 'А',
  },
};

const DATA = concat(
  [SINGLE_DATA, COMMON_DATA, SINGLE_DATA],
  ['1', 'Common', '2']
);

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  STATES,
  HIGH_CONCENCTRATION,
  CRITICAL_CONCENCTRATION,
  CRITICAL_PRESSURE,
  DATA
};
