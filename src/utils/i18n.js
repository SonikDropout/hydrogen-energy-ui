const fs = require('fs');
const { capitalize } = require('./others');

module.exports = {
  dictionary: {},
  _locale: 'ru',
  setLocale(locale) {
    this._locale = locale;
  },
  loadJSON(path, locale) {
    if (!this.dictionary[locale]) this.dictionary[locale] = {};
    Object.assign(this.dictionary[locale], JSON.parse(fs.readFileSync(path)));
  },
  __(key) {
    return this.dictionary[this._locale][key] || capitalize(key);
  },
};
