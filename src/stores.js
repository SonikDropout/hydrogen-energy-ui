const { writable, derived } = require('svelte/store');
const { COMMON_DATA } = require('./constants');
const { ipcRenderer } = require('electron');
let { criticalHydrogenConcentration } = require('../settings.json');

const initialData = ipcRenderer.sendSync('initial-data-request');

const data = writable(initialData);
// const isCriticatConcentration = writable(false);

// data.subscribe(d => isCriticatConcentration.set(d.hydrogenConcentration > criticalHydrogenConcentration));
const isCriticalConcentration = derived(data, $data =>
  $data.hydrogenConcentration > criticalHydrogenConcentration
);

const summed = ['current', 'voltage', 'power', 'consumption'];

const commonData = derived(data, $data => {
  const d = {};
  for (const key in COMMON_DATA) d[key] = { ...$data[key] };
  for (let i = 0; i < summed.length; ++i) {
    const key = summed[i];
    d[key + 'Common'] = { ...$data[key + 1] };
    d[key + 'Common'].value = +(
      $data[key + 1].value + $data[key + 2].value
    ).toPrecision(4);
    d[key + 'Common'].symbol = d[key + 'Common'].symbol + '<sub>&#x2211;</sub>';
  }
  if (data.connectionType === 0) d.current.value = $data.current1.value;
  if (data.connectionType === 1) d.voltage.value = $data.voltage1.value;
  return d;
});

ipcRenderer.on('serialData', (e, d) => data.set(d));
ipcRenderer.on(
  'calibrationFinish',
  (e, v) => (criticalHydrogenConcentration = v)
);

module.exports = {
  data,
  commonData,
  isCriticalConcentration,
};
