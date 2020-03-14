const { ipcRenderer } = require('electron');
const { writable, derived } = require('svelte/store');
const { COMMON_DATA, SETTINGS_PATH } = require('./constants');
const fs = require('fs');
let { criticalHydrogenConcentration } = JSON.parse(
  fs.readFileSync(SETTINGS_PATH, 'utf-8')
);

const appInitialized = writable(false)

const data = writable();
// const isCriticatConcentration = writable(false);

// data.subscribe(d => isCriticatConcentration.set(d.hydrogenConcentration > criticalHydrogenConcentration));
const isCriticalConcentration = derived(
  data,
  $data => $data.hydrogenConcentration > criticalHydrogenConcentration
);

const summed = ['current', 'voltage', 'power', 'consumption'];

const addCalculatedSums = d => {
  for (let i = 0; i < summed.length; ++i) {
    const key = summed[i];
    d[key + 'Common'] = { ...d[key + 1] };
    d[key + 'Common'].value = +(
      d[key + 1].value + d[key + 2].value
    ).toPrecision(4);
    d[key + 'Common'].symbol = d[key + 'Common'].symbol + '<sub>&#x2211;</sub>';
  }
  // if (d.connectionType === 0) d.current.value = d.current1.value;
  // if (d.connectionType === 1) d.voltage.value = d.voltage1.value;
  return d;
};

ipcRenderer.on('serialData', (e, d) => data.set(addCalculatedSums(d)));
ipcRenderer.on(
  'calibrationFinish',
  (e, v) => (criticalHydrogenConcentration = v)
).once('appInitialized', () => appInitialized.set(true))

function getValue(store) {
  let $val;
  store.subscribe($ => ($val = $))();
  return $val;
}

module.exports = {
  data,
  isCriticalConcentration,
  getValue,
  appInitialized,
};
