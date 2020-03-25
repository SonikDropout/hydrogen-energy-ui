const { Workbook } = require('excel4node');
const { getFileDate } = require('./others');
const path = require('path');

let wb,
  ws = [],
  fileName,
  headerStyle,
  dataStyle,
  row = 1;

function writeLog({ name, dir, rows, worksheets, headers, cb }) {
  createFile(name);
  addWorksheets(worksheets, headers);
  writeRows(rows);
  saveFile(dir, cb, rows.length);
}

function createFile(fn) {
  fileName = fn + '_' + getFileDate();
  wb = new Workbook();
  if (!headerStyle) createStyles();
}

function addWorksheets(worksheets, headers) {
  for (let i = 0; i < headers.length; ++i) {
    ws[i] = wb.addWorksheet(worksheets[i]);
    for (let j = 0; j < headers[i].length; ++j) {
      ws[i]
        .cell(row, j + 1)
        .string(headers[i][j])
        .style(headerStyle);
    }
  }
  row++;
}

function writeRows(entries) {
  for (let i = 0; i < entries.length; i++) {
    for (let j = 0; j < entries[i].length; ++j) {
      for (let k = 0; k < entries[i][j].length; ++k) {
        ws[j]
          .cell(row, k + 1)
          .number(entries[i][j][k])
          .style(dataStyle);
      }
    }
    row++;
  }
}

function saveFile(dir, cb, rn) {
  const logPath = path.join(dir, fileName + '.xlsx');
  console.log('writing log to:', logPath);
  delayedCb = (...args) => setTimeout(cb, rn * 100, ...args)
  wb.write(logPath, delayedCb);
  wb = fileName = void 0;
  ws = [];
  row = 1;
}

function createStyles() {
  headerStyle = wb.createStyle({
    font: {
      bold: true,
      color: 'ffffff',
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      fgColor: '8bc041',
    },
  });
  headerStyle.border = generateBorders();
  dataStyle = wb.createStyle({
    alignment: {
      horizontal: 'right',
    },
  });
  dataStyle.border = generateBorders();
}

function generateBorders() {
  return ['left', 'right', 'top', 'bottom'].reduce(
    (acc, key) => {
      acc[key] = {
        style: 'thin',
        color: 'black',
      };
      return acc;
    },
    { outline: false }
  );
}

module.exports = {
  writeLog,
};
