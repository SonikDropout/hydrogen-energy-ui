class PointsStorage {
  constructor() {
    this.rows = [];
    this._xCols = 0;
    this._yCols = 1;
    this.lines = [];
  }

  addRow(row) {
    this.rows.push(row);
    this._updateLines(row);
    this._filterData();
    this._sortPoints();
  }

  addXCol(col) {
    this._xCols.push(col);
    this._updateLines();
  }

  removeXCol(col) {
    this._xCols = this._xCols.filter(c => c !== col);
    this._updateLines();
  }

  addYCol(col) {
    this._yCols.push(col);
    this._updateLines();
  }

  removeYCol(col) {
    this._yCols = this._yCols.filter(c => c !== col);
    this._updateLines();
  }

  clear() {
    this.lines = [];
    this.rows = [];
  }

  _filterData() {
    if (this.rows.length > 1000) {
      this.rows = this._filterEven(this.rows);
      for (let i = 0; i < this.lines.length; ++i)
        this.lines[i] = this._filterEven(this.lines[i]);
    }
  }

  _filterEven(arr) {
    return arr.filter((_, i) => i % 2);
  }

  _updateLines(row) {
    for (let i = 0; i < this._xCols.length; i++)
      lines[i].push({ x: row[this._xCols[i]], y: row[this._yCols[i]] });
  }

  _updateLines() {
    if (this.lines.length > this._xCols.length) {
      this.lines.pop();
    } else {
      let last = this._xCols.length - 1
      this.lines[last] = this.rows.map((row) => ({
        x: row[this._xCols[last]],
        y: row[this._yCols[last]],
      }));
    }
    this._sortPoints();
  }

  _sortPoints() {
    if (!this._xCols[0]) return;
    for (let i = 0; i < this.lines.length; ++i)
      this.lines[i] = this.lines[i].sort((p1, p2) => p1.x - p2.x);
  }
}

module.exports = PointsStorage;
