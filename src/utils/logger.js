const { Workbook } = require('excel4node');
const { getFileDate } = require('./others');
const path = require('path');

let wb,
  ws = [],
  fileName,
  headerStyle,
  dataStyle,
  row = 1;

function createFile(options) {
  fileName = options.name + '_' + getFileDate();
  wb = new Workbook();
  ws = [];
  row = 1;
  if (!headerStyle) createStyles();
  addWorksheets(options.worksheets, options.headers);
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

function writeRows(rows) {
  if (!ws[0]) return;
  for (let j = 0; j < rows.length; ++j) {
    for (let k = 0; k < rows[j].length; ++k) {
      ws[j]
        .cell(row, k + 1)
        .number(rows[j][k])
        .style(dataStyle);
    }
  }
  row++;
}

function saveFile(dir, cb) {
  const logPath = path.join(dir, fileName + '.xlsx');
  console.log('writing log to:', logPath);
  delayedCb = (...args) => setTimeout(cb, 60 * 1000, ...args);
  wb.write(logPath, delayedCb);
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
  createFile,
  writeRows,
  saveFile
};
