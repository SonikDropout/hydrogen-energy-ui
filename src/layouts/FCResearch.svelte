<script>
  import Button from '../atoms/Button';
  import Select from '../molecules/Select';
  import Toggle from '../atoms/Toggle';
  import RangeInput from '../molecules/RangeInput';
  import Warnings from '../molecules/Warnings';
  import { data, commonData } from '../stores';
  import { COMMANDS } from '../constants';
  import { ipcRenderer } from 'electron';
  export let onPrev;
  export let onNext;

  $: isActive = $data.onoff;

  const characteristics = [
    'voltage',
    'current',
    'power',
    'temp1',
    'temp2',
    'consumption',
  ];

  const FCColumns = [
    {
      pos: 1,
      characteristics,
    },
    {
      pos: 2,
      characteristics,
    },
  ];

  const commonCharacteristics = [
    'pressure',
    'tankTemp',
    'consumption',
    'power',
    'voltage',
    'current',
    'currentInternal',
    'currentExternal',
  ];

  const connectionTypeOptions = [
    { label: 'последовательное', value: 0 },
    { label: 'параллельное', value: 1 },
    { label: 'только БТЭ 1', value: 2 },
    { label: 'только БТЭ 2', value: 3 },
  ];
  const loadModeOptions = [
    { label: 'внутр нагрузка отключена', value: 0 },
    { label: 'постоянный ток', value: 1, symbol: 'I' },
    { label: 'постоянное напряжение', value: 2, symbol: 'U' },
    { label: 'постоянная мощность', value: 3, symbol: 'P' },
  ];

  let selectedLoadMode = loadModeOptions[0];

  function setConnectionType(t) {
    connectionType.set(+t);
    ipcRenderer.send('serialCommand', COMMANDS.switchConnectionType(+t));
  }
  function setLoadMode(m) {
    selectedLoadMode = loadModeOptions[m];
    ipcRenderer.send('serialCommand', COMMANDS.switchLoadMode(+m));
  }
  function setLoadValue(v) {
    ipcRenderer.send('serialCommand', COMMANDS.setValue(+v));
  }
  function toggleFC(e) {
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[(e.target.checked ? 'open' : 'close') + 'Valve' + e.target.name]
    );
  }

  function toggleAll() {
    isActive = !isActive;
    ipcRenderer.send('serialCommand', COMMANDS[isActive ? 'start' : 'stop']);
  }
</script>

<div class="layout">
  <header>Исследование работы топливных элементов</header>
  <main>
    <div class="row">
      <div class="select-field col">
        <div class="label">Тип соединения</div>
        <Select
          onChange={setConnectionType}
          options={connectionTypeOptions}
          defaultValue={$data.connectionType} />
      </div>
      <div class="select-field col">
        <div class="label">Режим нагрузки</div>
        <Select
          onChange={setLoadMode}
          options={loadModeOptions}
          defaultSelected={$data.loadMode} />
      </div>
      <div class="load-mode col">
        {#if selectedLoadMode.value}
          <span class="label">Задать {selectedLoadMode.symbol}</span>
          <RangeInput onChange={setLoadValue} />
        {/if}
      </div>
    </div>
    <div class="row">
      {#each FCColumns as { pos }}
        <div class="col o-{pos}">
          <h3>БТЭ {pos}</h3>
          <img src="../static/icons/valve.svg" alt="valve" class="icon-valve" />
          <div class="fc-toggler">
            <div class="label">
              Клапан подачи H
              <sub>2</sub>
            </div>
            <Toggle
              on:change={toggleFC}
              name={pos}
              disabled={!isActive}
              checked={$data['valve' + pos]} />
          </div>
        </div>
      {/each}
      <div class="col onoff">
        <Button on:click={toggleAll} class="start">
          {isActive ? 'Стоп' : 'Старт'}
        </Button>
      </div>
    </div>
    <h2>Характеристики работы</h2>
    <div class="row">
      {#each FCColumns as { pos, characteristics }}
        <div class="col o-{pos}">
          <h4>БТЭ {pos}</h4>
          <ul class="single">
            {#each characteristics as characteristic}
              <li>
                <span class="label">
                  {@html $data[characteristic + pos].symbol}
                  , {$data[characteristic + pos].units}
                </span>
                <strong class="value">
                  {$data[characteristic + pos].value}
                </strong>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
      <div class="col">
        <h4>Общие</h4>
        <ul class="common">
          {#each commonCharacteristics as characteristic}
            <li>
              <span class="label">
                {@html $commonData[characteristic].symbol}
                , {$commonData[characteristic].units}
              </span>
              <strong class="value">{$commonData[characteristic].value}</strong>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </main>
  <footer class="row">
    <div class="col">
      <Button on:click={onPrev}>Назад</Button>
    </div>
    <div class="col">
      <Button on:click={onNext}>Построение графиков</Button>
    </div>
    <div class="col" />
  </footer>
</div>

<style>
  .row {
    display: flex;
    justify-content: space-evenly;
  }
  .col {
    flex: 1 1 27rem;
    max-width: 27rem;
  }
  .col.o-2 {
    order: 2;
  }
  ul {
    margin: 0 auto;
    padding: 0;
    list-style: none;
    width: 17rem;
  }
  span.label {
    display: inline-block;
    width: 11rem;
  }
  .onoff {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-valve {
    height: 6.4rem;
    display: inline-block;
    vertical-align: middle;
  }
  .fc-toggler {
    display: inline-block;
    vertical-align: middle;
  }
  footer {
    padding: 0;
  }
  footer .col:nth-child(2) {
    text-align: center;
  }
</style>
