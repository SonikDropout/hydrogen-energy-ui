<script>
  import Chart from "../organisms/Chart";
  import { data, connectionType } from "../stores";
  import Select from "../molecules/Select";
  import Button from "../atoms/Button";
  import { ipcRenderer } from "electron";
  export let onBack;

  ipcRenderer.send("usbStorageRequest");
  ipcRenderer.on("usbConnected", () => (saveDisabled = false));

  const subjectOptions = [
    { label: "БТЭ 1", value: 1 },
    { label: "БТЭ 2", value: 2 },
    { label: "БТЭ 1 + БТЭ 2", value: 'Common' }
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
    unsubscribeData;

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
    unsubscribeData = data.subscribe(d => {
      const row = [d[selectedX.name + selectedSubject.value].value, d[selectedY.name + selectedSubject.value].value];
      sendToLogger(row);
      updateChart(row);
    });
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

<div class="layout">
  <header>Построение графиков</header>
  <main>
    <div class="selects">
      <div class="label">Тип соединения</div>
      <div>{$connectionType}</div>
      <div class="select-field">
        <span class="label">Объект исследования</span>
      </div>
      <div class="select-field">
        <span class="label">Ось X</span>
      </div>
      <div class="select-field">
        <span class="label">Ось Y</span>
      </div>

      <Button on:click={toggleDrawing}>{isDrawing ? 'Стоп' : 'Старт'}</Button>
    </div>
    <Chart xCaption={selectedX.symbol} yCaption={selectedY.symbol} {xPoints} {yPoints} />
  </main>
  <footer>
    <Button on:click={onBack}>Назад</Button>
    <Button on:click={saveFile} disabled={saveDisabled}>
      Сохранить данные на USB-устройство
    </Button>
  </footer>
</div>
