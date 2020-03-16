<script>
  import { data } from '../stores';
  import { CONNECTION_TYPES } from '../constants';
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';
  import PointsStorage from '../utils/PointsStorage';
  export let onPrev;

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(pStorage.points, {
        x: selectedX.symbol,
        y: selectedY.symbol,
      })
    );
    chart.options.onClick = chart.resetZoom;
  });

  ipcRenderer.send('usbStorageRequest');
  ipcRenderer.on('usbConnected', () => (saveDisabled = false));
  ipcRenderer.on('usbDisconnected', () => (saveDisabled = true));

  const pointEntries = [1, 2, 'Common']
    .map(name =>
      ['current', 'voltage', 'power', 'consumption'].map(id => id + name)
    )
    .flat();

  const subjectOptions = [
    { label: 'Brennstoffzelle 1', value: 1 },
    { label: 'Brennstoffzelle 2', value: 2 },
    { label: 'Brennstoffzelle 1 + Brennstoffzelle 2', value: 'Common' },
  ];

  const xOptions = [
    { name: 'time', label: 'Ziet', value: 0, symbol: 't, s' },
    { name: 'current', label: 'Strom', value: 1, symbol: 'I, A' },
    { name: 'consumption', label: 'Verbrauch', value: 2, symbol: 'Q, ml/min' },
  ];

  const yOptions = [
    { name: 'voltage', label: 'Spannung', value: 0, symbol: 'U, V' },
    { name: 'current', label: 'Strom', value: 1, symbol: 'I, A' },
    { name: 'power', label: '	Leistung', value: 2, symbol: 'P, W' },
  ];

  let selectedX = xOptions[0],
    selectedY = yOptions[0],
    pStorage = new PointsStorage(),
    saveDisabled = true,
    selectedSubject,
    isDrawing,
    unsubscribeData,
    chart,
    fileSaving,
    timeStart;

  $: startDisabled = !selectedSubject;

  function selectSubject(v) {
    selectedSubject = subjectOptions.find(s => s.value == v);
    resetCols(true, true);
  }

  function resetCols(x, y) {
    if (y)
      pStorage.setYCol(
        pointEntries.indexOf(selectedY.name + selectedSubject.value) + 1 // index 0 is time
      );
    if (x)
      pStorage.setXCol(
        pointEntries.indexOf(selectedX.name + selectedSubject.value) + 1 // index 0 is time
      );
  }

  function selectY(n) {
    selectedY = yOptions[n];
    resetCols(false, true);
    chart.options.scales.yAxes[0].scaleLabel.labelString = selectedY.symbol;
    chart.update();
  }

  function selectX(n) {
    selectedX = xOptions[n];
    resetCols(true);
    chart.options.scales.xAxes[0].scaleLabel.labelString = selectedX.symbol;
    chart.update();
  }

  function toggleDrawing() {
    if (isDrawing) {
      unsubscribeData();
      stopDrawing();
    } else {
      startLogging();
      subscribeData();
    }
    isDrawing = !isDrawing;
  }

  function startLogging() {
    const fileName = selectedX.label + '-' + selectedY.label;
    const headers = [selectedX.symbol, selectedY.symbol];
    ipcRenderer.send('startFileWrite', fileName, headers);
  }

  function stopDrawing() {
    pStorage.clear();
  }

  function subscribeData() {
    timeStart = Date.now();
    unsubscribeData = data.subscribe(d => {
      pStorage.addRow(getEntries(d));
      updateChart();
    });
  }

  function getEntries(data) {
    const row = [Math.floor((Date.now() - timeStart) / 1000)];
    return row.concat(pointEntries.map(key => data[key].value));
  }

  function updateChart() {
    chart.data.datasets[0].data = pStorage.points;
    chart.update();
  }

  function saveFile() {
    ipcRenderer.send('writeExcel', {
      name: selectedX.label + '-' + selectedY.label,
      worksheets: ['Brennstoffzelle 1', 'Brennstoffzelle 2', 'Brennstoffzelle 1 + Brennstoffzelle 2'],
      headers: Array(3).fill([
        'Zeit, s',
        'Strom, A',
        'Spannung, V',
        'Leistung, W',
        'Verbrauch, ml/min',
      ]),
      rows: [
        pStorage.rows.map(row => row.slice(0, 5)),
        pStorage.rows.map(row => [row[0], ...row.slice(5, 9)]),
        pStorage.rows.map(row => [row[0], ...row.slice(9, 13)]),
      ],
    });
    fileSaving = true;
    ipcRenderer.once('fileSaved', () => (fileSaving = false));
  }
</script>

<div class="layout">
  <header>Grafische Darstellung</header>
  <main>
    <div class="selects">
      <div class="label">Anschlussarten</div>
      <div class="ct">{CONNECTION_TYPES[$data.connectionType]}</div>
      <div class="select-field">
        <span class="select-label">Brennstoffzellenauswahl</span>
        <Select order={1} onChange={selectSubject} options={subjectOptions} />
      </div>
      <div class="select-field">
        <span class="select-label">x-Achse</span>
        <Select
          order={2}
          onChange={selectX}
          options={xOptions}
          defaultValue={selectedX.value} />
      </div>
      <div class="select-field">
        <span class="select-label">y-Achse</span>
        <Select
          order={3}
          onChange={selectY}
          options={yOptions}
          defaultValue={selectedY.value} />
      </div>

      <Button on:click={toggleDrawing} disabled={startDisabled}>
        {isDrawing ? 'Stopp' : 'Start'}
      </Button>
    </div>
    <div class="chart">
      <canvas id="chart" height="400" width="520" />
    </div>
  </main>
  <footer>
    <div class="back">
      <Button on:click={onPrev}>Zurück</Button>
    </div>
    <div class="save">
      <Button on:click={saveFile} disabled={saveDisabled}>
        {#if fileSaving}
          <img src="../static/icons/spinner.svg" alt="spinner" class="spin" />
        {/if}
        Export der Daten auf ein USB-Gerät 
      </Button>
    </div>
  </footer>
</div>

<style>
  main {
    display: flex;
    justify-content: space-evenly;
  }
  .back,
  .selects {
    max-width: 30rem;
    flex: 1 1 30rem;
  }
  .selects {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem 0;
  }
  .save,
  .chart {
    max-width: 52rem;
    flex: 1 1 52rem;
  }
  .save {
    text-align: center;
  }
  .ct {
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: auto;
  }
  .select-field {
    margin: 1rem 0;
    display: flex;
  }
  .select-label {
    display: block;
    min-width: 12rem;
    flex: 1 1 12rem;
    margin-right: 1rem;
  }
  main :global(button) {
    margin-top: auto;
    align-self: flex-start;
  }
  .spin {
    animation: spin 1s linear infinite;
  }
</style>
