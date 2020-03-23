<script>
  import { data } from '../stores';
  import { CONNECTION_TYPES, __ } from '../constants';
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';
  import PointsStorage from '../utils/PointsStorage';
  import { fly } from 'svelte/transition';
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
  ipcRenderer.on('usbConnected', () => (usbAttached = true));
  ipcRenderer.on('usbDisconnected', () => (usbAttached = false));

  const pointEntries = [1, 2, 'Common']
    .map(name =>
      ['current', 'voltage', 'power', 'consumption'].map(id => id + name)
    )
    .flat();

  const subjectOptions = [
    { label: __('first'), value: 1 },
    { label: __('second'), value: 2 },
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
    {
      name: 'consumption',
      label: __('consumption'),
      value: 2,
      symbol: `Q, ${__('ml/min')}`,
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
  ];

  let selectedX = xOptions[0],
    selectedY = yOptions[0],
    pStorage = new PointsStorage(),
    usbAttached = false,
    noData = true,
    selectedSubject = subjectOptions[0],
    isDrawing,
    unsubscribeData,
    saveMessage,
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
    } else {
      subscribeData();
    }
    isDrawing = !isDrawing;
  }

  function subscribeData() {
    pStorage.clear();
    timeStart = Date.now();
    noData = false;
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
      name: `${__('HE')}_${selectedX.label}-${selectedY.label}`,
      worksheets: [__('first'), __('second'), __('first + second')],
      headers: Array(3).fill([
        `${__('time')}, ${__('s')}`,
        `${__('voltage')}, ${__('V')}`,
        `${__('current')}, ${__('A')}`,
        `${__('power')}, ${__('W')}`,
        `${__('consumption')}, ${__('ml/min')}`,
      ]),
      rows: pStorage.rows.map(row => [
        row.slice(0, 5),
        [row[0], ...row.slice(5, 9)],
        [row[0], ...row.slice(9, 13)],
      ]),
    });
    fileSaving = true;
    ipcRenderer.once('fileSaved', (e, err) => {
      fileSaving = false;
      if (err) {
        saveMessage = __('save error');
        console.error(err);
      } else saveMessage = __('save success');
    });
  }

  function ejectUsb() {
    ipcRenderer.send('ejectUSB');
    ipcRenderer.once('usbEjected', () => {
      saveMessage = '';
      usbAttached = false;
    });
  }

  function closePopup() {
    saveMessage = '';
  }
</script>

<div class="layout">
  <header>{__('charts')}</header>
  <main>
    <div class="selects">
      <div class="label">{__('connection type')}</div>
      <div class="ct">{CONNECTION_TYPES[$data.connectionType]}</div>
      <div class="select-block">
        <div class="label">{__('research subject')}</div>
        <Select
          order={1}
          onChange={selectSubject}
          options={subjectOptions}
          selected={selectedSubject} />
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
      <Button on:click={saveFile} disabled={!usbAttached || noData}>
        {#if fileSaving}
          <img src="../static/icons/spinner.svg" alt="spinner" class="spin" />
        {/if}
        {__('save usb')}
      </Button>
    </div>
    {#if saveMessage}
      <div class="popup" transition:fly={{ y: -100 }}>
        <button class="popup-close" on:click={closePopup}>&#x2573;</button>
        <p>{saveMessage}</p>
        <Button size="sm" on:click={ejectUsb}>{__('eject')}</Button>
      </div>
    {/if}
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
  .select-block {
    margin-bottom: 0.8rem;
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
    height: 1.6rem;
    animation: spin 1s linear infinite;
  }
  .popup {
    position: absolute;
    background-color: var(--bg-color);
    top: 3px;
    left: calc(50% - 15rem);
    width: 30rem;
    padding: 0 2rem 1rem;
    border-radius: 4px;
    box-shadow: 0 0 6px -1px var(--text-color);
  }
  .popup-close {
    background-color: transparent;
    position: absolute;
    top: 1rem;
    right: 1rem;
    border: none;
    outline: none;
    font-size: 1rem;
  }
</style>
