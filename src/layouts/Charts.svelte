<script>
  import { data, commonData } from '../stores';
  import { CONNECTION_TYPES } from '../constants';
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';
  export let onPrev;

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, { x: selectedX.symbol, y: selectedY.symbol })
    );
    chart.options.onClick = chart.resetZoom;
  });

  ipcRenderer.send('usbStorageRequest');
  ipcRenderer.on('usbConnected', () => (saveDisabled = false));
  ipcRenderer.on('usbDisconnected', () => (saveDisabled = true));

  const subjectOptions = [
    { label: 'БТЭ 1', value: 1 },
    { label: 'БТЭ 2', value: 2 },
    { label: 'БТЭ 1 + БТЭ 2', value: 'Common' },
  ];

  const xOptions = [
    { name: 'current', label: 'Ток', value: 0, symbol: 'I, A' },
    { name: 'time', label: 'Время', value: 1, symbol: 't, c' },
    { name: 'consumption', label: 'Расход', value: 2, symbol: 'Q, мл/мин' },
  ];

  const yOptions = [
    { name: 'voltage', label: 'Напряжение', value: 0, symbol: 'U, B' },
    { name: 'current', label: 'Ток', value: 1, symbol: 'I, A' },
    { name: 'power', label: 'Мощность', value: 2, symbol: 'P, Вт' },
  ];

  let selectedX = xOptions[0],
    selectedY = yOptions[0],
    points = [],
    saveDisabled = true,
    selectedSubject,
    isDrawing,
    unsubscribeData,
    chart,
    timeStart;

  $: startDisabled = !selectedSubject;

  function selectSubject(v) {
    selectedSubject = subjectOptions.find(s => s.value == v);
  }

  function selectY(n) {
    selectedY = yOptions[n];
    chart.options.scales.yAxes[0].scaleLabel.labelString = selectedY.symbol;
    chart.update();
  }

  function selectX(n) {
    selectedX = xOptions[n];
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
    points = [];
  }

  function subscribeData() {
    timeStart = Date.now();
    if (selectedSubject.value == 'common') {
      unsubscribeData = commonData.subscirbe(d => {
        const row = getEntries(d);
        sendToLogger(Object.values(row));
        updateChart(row);
      });
    } else {
      unsubscribeData = data.subscribe(d => {
        const row = getEntries(d, true);
        sendToLogger(Object.values(row));
        updateChart(row);
      });
    }
  }

  function getEntries(data, withPostfix) {
    const x =
      selectedX.name == 'time'
        ? (Date.now() - timeStart) / 1000
        : data[selectedX.name + (withPostfix ? selectedSubject.value : '')]
            .value;
    const y =
      data[selectedY.name + (withPostfix ? selectedSubject.value : '')].value;
    return { x, y };
  }

  function updateChart(p) {
    points.push(p);
    chart.data.datasets[0].data = points;
    chart.update();
  }

  function sendToLogger(row) {
    ipcRenderer.send('excelRow', row);
  }

  function saveFile() {
    ipcRenderer.send('saveFile');
  }
</script>

<div class="layout">
  <header>Построение графиков</header>
  <main>
    <div class="selects">
      <div class="label">Тип соединения</div>
      <div class="ct">{CONNECTION_TYPES[$data.connectionType]}</div>
      <div class="select-field">
        <span class="select-label">Объект исследования</span>
        <Select order={1} onChange={selectSubject} options={subjectOptions} />
      </div>
      <div class="select-field">
        <span class="select-label">Ось X</span>
        <Select
          order={2}
          onChange={selectX}
          options={xOptions}
          defaultValue={selectedX.value} />
      </div>
      <div class="select-field">
        <span class="select-label">Ось Y</span>
        <Select
          order={3}
          onChange={selectY}
          options={yOptions}
          defaultValue={selectedY.value} />
      </div>

      <Button on:click={toggleDrawing} disabled={startDisabled}>
        {isDrawing ? 'Стоп' : 'Старт'}
      </Button>
    </div>
    <div class="chart">
      <canvas id="chart" height="400" width="520" />
    </div>
  </main>
  <footer>
    <div class="back">
      <Button on:click={onPrev}>Назад</Button>
    </div>
    <div class="save">
      <Button on:click={saveFile} disabled={saveDisabled}>
        Сохранить данные на USB-устройство
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
</style>
