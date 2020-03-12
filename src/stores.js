const { writable, derived } = require('svelte/store');
const { COMMON_DATA, } = require('./constants');
const { ipcRenderer } = require('electron');

const initialData = ipcRenderer.sendSync('initial-data-request')

const data = writable(initialData);
const connectionType = writable();

const summed = ['current', 'voltage', 'power', 'consumption'];

const commonData = derived(data, $data => {
  const d = {};
  for (const key in COMMON_DATA) d[key] = { ...$data[key] };
  for (let i = 0; i < summed.length; ++i) {
    const key = summed[i];
    d[key + 'Common'] = { ...$data[key + 1] };
    d[key + 'Common'].value = +($data[key + 1].value + $data[key + 2].value).toPrecision(
      4
    );
    d[key + 'Common'].symbol = d[key + 'Common'].symbol + '<sub>&#x2211;</sub>';
  }
  if (data.connectionType === 0) d.current.value = $data.current1.value;
  if (data.connectionType === 1) d.voltage.value = $data.voltage1.value;
  return d;
});

ipcRenderer.on('serialData', (e, d) => data.set(d));

module.exports = {
  data,
  connectionType,
  commonData,
};
