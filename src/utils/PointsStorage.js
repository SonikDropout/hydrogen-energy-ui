class PointsStorage {
  constructor() {
    this.rows = [];
    this._xCol = 'time';
    this._yCol = 'voltage';
    this.lines = {};
  }

  addRow(row) {
    this.rows.push(row);
    this._addPointToLines(row);
    this._filterData();
    this._sortPoints();
  }

  addLine(lineId) {
    this.lines[lineId] = this.rows.map((row) => ({
      x: row[this._xCol + lineId],
      y: row[this._yCol + lineId],
    }));
  }

  removeLine(lineId) {
    delete this.lines[lineId];
  }

  setXCol(colName) {
    this._xCol = colName;
  }

  setYCol(colName) {
    this._yCol = colName;
  }

  clear() {
    for (let lineId in this.lines) this.lines[lineId] = [];
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

  _addPointToLines(row) {
    for (let lineId in this.lines) {
      this.lines[lineId].push({
        x: row[this._xCol + lineId],
        y: row[this._yCol + lineId],
      });
    }
  }

  _sortPoints() {
    if (this._xCol === 'time') return;
    for (let lineId in this.lines)
      this.lines[lineId] = this.lines[lineId].sort((p1, p2) => p1.x - p2.x);
  }
}

module.exports = PointsStorage;
