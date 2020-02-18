const { mergeRename } = require('./utils/others');

const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = IS_RPI ? '/dev/ttyAMA0' : 'COM5';
const SEPARATORS = [6891, 25500];

const STATES = {
  initial: 'params',
  charts: 'charts',
  research: 'research',
};

const LOW_PRESSURE = 0.2;

const SINGLE_DATA = {
  voltage: {
    symbol: 'U',
    units: 'В',
    divider: 1000,
  },
  current: {
    symbol: 'I',
    units: 'А',
    divider: 1000,
  },
  temp1: {
    symbol: 'T<sub>1</sub>',
    units: '\u02daC',
    divider: 10,
  },
  temp2: {
    symbol: 'T<sub>2</sub>',
    units: '\u02daC',
    divider: 10,
  },
  blowDuration: {
    label: 'Длительность продувки',
    units: 'мс',
  },
  blowPeriod: {
    label: 'Задержка продувки',
    units: 'с',
  },
  fanPower: {
    label: 'Moщность вентилятора',
    units: '% от макс',
  },
};

const COMMON_DATA = {
  tankTemp: {
    symbol: 'T<sub>H<sub>2</sub></sub>',
    units: '\u02daC',
    divider: 10,
  },
  currentExternal: {
    symbol: 'I<sub>внеш нагр</sub>',
    units: 'А',
    divider: 1000,
  },
  currentInternal: {
    symbol: 'I<sub>внутр нагр</sub>',
    units: 'А',
    divider: 1000,
  },
  consumption1: {
    symbol: 'Q',
    units: 'мл/мин',
  },
  consumption2: {
    symbol: 'Q',
    units: 'мл/мин',
  },
  pressure: {
    symbol: 'p',
    units: 'атм',
    divider: 1000,
  },
};

const STATE_DATA = {
  loadMode: 0,
  hydrogenConcentration: 0,
  valve1: 0,
  valve2: 0,
  onoff: 0,
  connectionType: 0,
};

const BOTH_DATA = mergeRename([SINGLE_DATA, SINGLE_DATA], [1, 2]);

const DATA = {
  ...BOTH_DATA,
  ...COMMON_DATA,
};

const COMMANDS = [
  'openValve1',
  'closeValve1',
  'openValve2',
  'closeValve2',
  'start',
  'stop',
].reduce(
  (a, c, i) => {
    a[c] = (i + 1) * 4;
    return a;
  },
  {
    switchConnectionType: (m) => [28, m],
    switchLoadMode: (m) => [32, m],
    setValue: (v) => [36, 10 * v],
    setBlowDelay1: (v) => [40, (v / 10) | 0],
    setBlowDuration1: (v) => [44, (v / 10) | 0],
    setFanPower1: (v) => [48, v],
    setBlowDelay2: (v) => [52, (v / 10) | 0],
    setBlowDuration2: (v) => [56, (v / 10) | 0],
    setFanPower2: (v) => [60, v],
  }
);

const CONSTRAINTS = {
  current: [0.1, 5],
  voltage: [3, 15],
  power: [1, 20],
  fanPower: [30, 100],
  blowDuration: [20, 500],
  blowPeriod: [1, 300],
};

const CONNECTION_TYPES = [
  'Последовательное',
  'Параллельное',
  'только БТЭ 1',
  'только БТЭ 2',
];

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  STATES,
  LOW_PRESSURE,
  DATA,
  COMMON_DATA,
  STATE_DATA,
  CONSTRAINTS,
  COMMANDS,
  CONNECTION_TYPES,
};
