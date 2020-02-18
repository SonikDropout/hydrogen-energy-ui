<script>
  import Chart from "../organisms/Chart";
  import { data, connectionType, commonData } from "../stores";
  import { CONNECTION_TYPES } from "../constants";
  import Select from "../molecules/Select";
  import Button from "../atoms/Button";
  import { ipcRenderer } from "electron";
  export let onBack;

  ipcRenderer.send("usbStorageRequest");
  ipcRenderer.on("usbConnected", () => (saveDisabled = false));

  const subjectOptions = [
    { label: "БТЭ 1", value: 1 },
    { label: "БТЭ 2", value: 2 },
    { label: "БТЭ 1 + БТЭ 2", value: "Common" }
  ];

  const xOptions = [
    { name: "current", label: "Ток", value: 0, symbol: "I, A" },
    { name: "time", label: "Время", value: 1, symbol: "t, c" },
    { name: "consumption", label: "Расход", value: 2, symbol: "Q, мл/мин" }
  ];

  const yOptions = [
    { name: "voltage", label: "Напряжение", value: 0, symbol: "U, B" },
    { name: "current", label: "Ток", value: 1, symbol: "I, A" },
    { name: "power", label: "Мощность", value: 2, symbol: "P, Вт" }
  ];

  let selectedX = xOptions[0],
    selectedY = yOptions[0],
    xPoints = [],
    yPoints = [],
    saveDisabled,
    selectedSubject,
    fileName,
    isDrawing,
    unsubscribeData,
    timeStart;

  function selectSubject(v) {
    selectedSubject = subjectOptions.find(s => s.value == v);
  }

  function selectY(n) {
    selectedY = yOptions[n];
  }

  function selectX(n) {
    selectedX = xOptions[n];
  }

  function toggleDrawing() {
    if (isDrawing) {
      unsubsribeData();
      stopDrawing();
    } else {
      startLogging();
      subscribeData();
    }
    isDrawing = !isDrawing;
  }

  function startLogging() {
    fileName = selectedX.label + "-" + selectedY.label;
    ipcRenderer.send("startFileWrite", fileName);
  }

  function stopDrawing() {
    xPoints = [];
    yPoints = [];
  }

  function subscribeData() {
    timeStart = Date.now();
    if (selectedSubject.value == "common") {
      unsubscribeData = commonData.subscirbe(d => {
        const row = getEntries(d);
        sendToLogger(row);
        updateChart(row);
      });
    } else {
      unsubscribeData = data.subscribe(d => {
        const row = getEntries(d, true);
        sendToLogger(row);
        updateChart(row);
      });
    }
  }

  function getEntries(data, withPostfix) {
    const x =
      selectedX.name == "time"
        ? (Date.now() - timeStart) / 1000
        : data[selectedX.name + withPostfix ? selectSubject.name : ""].value;
    const y =
      data[selectedY.name + withPostfix ? selectedSubject.name : ""].value;
    return [x, y];
  }

  function updateChart([x, y]) {
    xPoints.concat(x);
    yPoints.concat(y);
  }

  function sendToLogger(row) {
    ipcRenderer.send("excelRow", row);
  }

  function saveFile() {
    ipcRenderer.send("saveFile", fileName);
  }
</script>

<style>
  main {
    display: flex;
    justify-content: space-evenly;
  }

  .selects {
    max-width: 40rem;
  }
  main :global(.chart) {
    max-width: 50rem;
  }
  .ct {
    text-transform: uppercase;
    font-weight: 500;
  }
</style>

<div class="layout">
  <header>Построение графиков</header>
  <main>
    <div class="selects">
      <div class="label">Тип соединения</div>
      <div class="ct">{CONNECTION_TYPES[$connectionType || 0]}</div>
      <div class="select-field">
        <span class="label">Объект исследования</span>
        <Select onChange={selectSubject} options={subjectOptions} />
      </div>
      <div class="select-field">
        <span class="label">Ось X</span>
        <Select onChange={selectX} options={xOptions} />
      </div>
      <div class="select-field">
        <span class="label">Ось Y</span>
        <Select onChange={selectY} options={yOptions} />
      </div>

      <Button on:click={toggleDrawing}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
    </div>
    <Chart
      xCaption={selectedX.symbol}
      yCaption={selectedY.symbol}
      {xPoints}
      {yPoints} />
  </main>
  <footer>
    <Button on:click={onBack}>Назад</Button>
    <Button on:click={saveFile} disabled={saveDisabled}>
      Сохранить данные на USB-устройство
    </Button>
  </footer>
</div>
