const { writable } = require('svelte/store');
const { clone } = require('./utils/others');
const { DATA } = require('./constants');

const initialData = clone(DATA);

for (let key in initialData) initialData[key].value = 0;

const data = writable(initialData);
const connectionType = writable();

module.exports = {
  data,
  connectionType,
};
