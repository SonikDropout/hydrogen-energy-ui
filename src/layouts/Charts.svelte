<script>
  import { data } from '../stores';
  import { CONNECTION_TYPES, __ } from '../constants';
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import Toggle from '../atoms/Toggle';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';
  import PointsStorage from '../utils/PointsStorage';
  import SaveButton from '../organisms/SaveButton';
  import { fly } from 'svelte/transition';
  export let onPrev;

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart({
        x: selectedX.symbol,
        y: selectedY.symbol,
      })
    );
    chart.options.onClick = chart.resetZoom;
  });

  ipcRenderer.send('usbStorageRequest');
  ipcRenderer.on('usbConnected', () => (usbAttached = true));
  ipcRenderer.on('usbDisconnected', () => (usbAttached = false));

  const subjects = ['1', '2', 'Common'];

  const pointEntries = subjects
    .map(name =>
      ['current', 'voltage', 'power', 'consumption'].map(id => id + name)
    )
    .flat();

  const subjectOptions = [
    { label: __('first'), value: '1' },
    { label: __('second'), value: '2' },
    { label: __('first + second'), value: 'Common' },
  ];

  const xOptions = [
    { name: 'time', label: __('time'), value: 0, symbol: `t, ${__('s')}` },
    {
      name: 'current',
      label: __('current'),
      value: 1,
      symbol: `I, ${__('A')}`,
    },
  ];

  const yOptions = [
    {
      name: 'voltage',
      label: __('voltage'),
      value: 0,
      symbol: `U, ${__('V')}`,
    },
    {
      name: 'current',
      label: __('current'),
      value: 1,
      symbol: `I, ${__('A')}`,
    },
    { name: 'power', label: __('power'), value: 2, symbol: `P, ${__('W')}` },
    {
      name: 'consumption',
      label: __('consumption'),
      value: 3,
      symbol: `Q, ${__('ml/min')}`,
    },
  ];

  let selectedX = xOptions[0],
    selectedY = yOptions[0],
    pStorage = new PointsStorage(),
    usbAttached = false,
    noData = true,
    selectedSubject = subjectOptions[0],
    isDrawing,
    unsubscribeData,
    chart,
    timeStart;

  $: startDisabled = !selectedSubject;

  function selectSubject(v) {
    selectedSubject = subjectOptions.find(s => s.value == v);
    resetCols(true, true);
  }

  function resetCols(x, y) {
    if (y) pStorage.setYCol(selectedY.name);
    if (x) pStorage.setXCol(selectedX.name);
    updateChart();
  }

  function selectY(n) {
    selectedY = yOptions[n];
    resetCols(false, true);
    chart.options.scales.yAxes[0].scaleLabel.labelString = selectedY.symbol;
  }

  function selectX(n) {
    selectedX = xOptions[n];
    resetCols(true);
    chart.options.scales.xAxes[0].scaleLabel.labelString = selectedX.symbol;
  }

  function toggleDrawing() {
    if (isDrawing) {
      unsubscribeData();
    } else {
      subscribeData();
      startLogging();
    }
    isDrawing = !isDrawing;
  }

  function subscribeData() {
    pStorage.clear();
    timeStart = Date.now();
    noData = false;
    unsubscribeData = data.subscribe(d => {
      const row = getEntries(d);
      pStorage.addRow(row);
      const logRow = Object.values(row);
      ipcRenderer.send('logRow', [
        logRow.slice(0, 5),
        [logRow[0], ...logRow.slice(5, 9)],
        [logRow[0], ...logRow.slice(9, 13)],
      ]);
      updateChart();
    });
  }

  function getEntries(data) {
    const row = {};
    for (let key of subjects) {
      row['time' + key] = Math.round((Date.now() - timeStart) / 1000);
    }
    for (let key of pointEntries) {
      row[key] = data[key].value;
    }
    return row;
  }

  function updateChart() {
    for (let i = 0; i < 3; ++i) {
      chart.data.datasets[i].data = [];
    }
    for (let lineId in pStorage.lines) {
      chart.data.datasets[subjects.indexOf(lineId)].data =
        pStorage.lines[lineId];
    }
    chart.update();
  }

  function startLogging() {
    ipcRenderer.send('startLog', {
      name: `Hydrogen_Energy`,
      worksheets: [__('first'), __('second'), __('first + second')],
      headers: Array(3).fill([
        `${__('time')}, ${__('s')}`,
        `${__('voltage')}, ${__('V')}`,
        `${__('current')}, ${__('A')}`,
        `${__('power')}, ${__('W')}`,
        `${__('consumption')}, ${__('ml/min')}`,
      ]),
    });
  }

  function toggleLine(e) {
    if (e.target.checked) {
      pStorage.addLine(e.target.value);
    } else {
      pStorage.removeLine(e.target.value);
    }
    updateChart();
  }
</script>

<div class="layout">
  <header>{__('charts')}</header>
  <main>
    <div class="selects">
      <div class="label">{__('connection type')}</div>
      <div class="ct">{CONNECTION_TYPES[$data.connectionType]}</div>
      <h4>{__('display lines')}</h4>
      <div class="line-options">
        {#each subjectOptions as subject}
          <div class="select-field">
            <span class="select-label">{subject.label}</span>
            <Toggle on:change={toggleLine} value={subject.value} />
          </div>
        {/each}
      </div>
      <div class="select-field">
        <span class="select-label">{__('x axis')}</span>
        <Select
          order={2}
          onChange={selectX}
          options={xOptions}
          selected={selectedX} />
      </div>
      <div class="select-field">
        <span class="select-label">{__('y axis')}</span>
        <Select
          order={3}
          onChange={selectY}
          options={yOptions}
          selected={selectedY} />
      </div>

      <Button on:click={toggleDrawing} disabled={startDisabled}>
        {isDrawing ? __('stop') : __('start')}
      </Button>
    </div>
    <div class="chart">
      <canvas id="chart" height="400" width="520" />
    </div>
  </main>
  <footer>
    <div class="back">
      <Button on:click={onPrev}>{__('back')}</Button>
    </div>
    <div class="save">
      <SaveButton disabled={noData} />
    </div>
  </footer>
</div>

<style>
  main {
    display: flex;
    justify-content: space-evenly;
  }
  h4 {
    text-align: left;
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
    text-align: right;
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
</style>
