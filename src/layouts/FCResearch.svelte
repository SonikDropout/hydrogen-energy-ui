<script>
  import Button from '../atoms/Button';
  import Select from '../molecules/Select';
  import Toggle from '../atoms/Toggle';
  import RangeInput from '../molecules/RangeInput';
  import { data, getValue } from '../stores';
  import { COMMANDS, CONSTRAINTS } from '../constants';
  import { ipcRenderer } from 'electron';
  export let onPrev;
  export let onNext;

  let isActive = $data.onoff;

  const valves = [$data.valve1, $data.valve2];

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
    'consumptionCommon',
    'powerCommon',
    'voltageCommon',
    'currentCommon',
    'currentInternal',
    'currentExternal',
  ];

  const connectionTypeOptions = [
    { label: 'In Reihe', value: 0 },
    { label: 'Parallel', value: 1 },
    { label: 'Betrieb Brennstoffzelle 1', value: 2 },
    { label: 'Betrieb Brennstoffzelle 2', value: 3 },
  ];
  const loadModeOptions = [
    { label: 'Innere Last ausgeschaltet', value: 0 },
    {
      label: 'Gleichspannung',
      name: 'voltage',
      value: 1,
      symbol: 'U, B',
    },
    { label: 'Gleichstrom', name: 'current', value: 2, symbol: 'I, A' },
    { label: 'Konstante Leistung', name: 'power', value: 3, symbol: 'P, W' },
  ];

  let selectedLoadMode = loadModeOptions[$data.loadMode];

  function setConnectionType(t) {
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
    const { name, checked } = e.target;
    valves[name - 1] = checked;
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[(checked ? 'open' : 'close') + 'Valve' + name]
    );
  }

  function toggleAll() {
    isActive = !isActive;
    valves[0] = false;
    valves[1] = false;
    ipcRenderer.send('serialCommand', COMMANDS[isActive ? 'start' : 'stop']);
  }
</script>

<div class="layout">
  <header>Untersuchung der Funktionalität der Brennstoffzellen</header>
  <main>
    <div class="row first">
      <div class="select-field col">
        <div class="label">Anschlussarten</div>
        <Select
          onChange={setConnectionType}
          options={connectionTypeOptions}
          defaultValue={$data.connectionType} />
      </div>
      <div class="select-field col">
        <div class="label">Lastmodus</div>
        <Select
          onChange={setLoadMode}
          options={loadModeOptions}
          defaultValue={$data.loadMode} />
      </div>
      <div class="load-mode col">
        {#if selectedLoadMode.value}
          <span class="label">{selectedLoadMode.symbol} einstellen</span>
          <RangeInput
            step={selectedLoadMode.value === 2 ? 0.1 : 1}
            onChange={setLoadValue}
            defaultValue={getValue(data).loadValue.value}
            range={CONSTRAINTS[selectedLoadMode.name]} />
        {/if}
      </div>
    </div>
    <div class="row">
      {#each FCColumns as { pos }}
        <div class="col o-{pos}">
          <h3>Brennstoffzelle {pos}</h3>
          <img src="../static/icons/valve.svg" alt="valve" class="icon-valve" />
          <div class="fc-toggler">
            <div class="label">
              H<sub>2</sub>-Zufuhr-Ventil
            </div>
            <Toggle
              on:change={toggleFC}
              name={pos}
              disabled={!isActive}
              checked={valves[pos - 1]} />
          </div>
        </div>
      {/each}
      <div class="col onoff">
        <Button on:click={toggleAll} class="start">
          {isActive ? 'Stopp' : 'Start'}
        </Button>
      </div>
    </div>
    <h2>Betriebsparameter</h2>
    <div class="row">
      {#each FCColumns as { pos, characteristics }}
        <div class="col o-{pos}">
          <h4>Brennstoffzelle {pos}</h4>
          <ul class="single">
            {#each characteristics as characteristic}
              <li>
                <span class="label">
                  {@html $data[characteristic + pos].symbol}
                  , {$data[characteristic + pos].units}
                </span>
                <strong class="value">
                  {#if characteristic == 'current' && $data[characteristic + pos].value < 0.04}
                    &lt; 0.04
                  {:else}{$data[characteristic + pos].value}{/if}
                </strong>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
      <div class="col">
        <h4>Allgemeine</h4>
        <ul class="common">
          {#each commonCharacteristics as characteristic}
            <li>
              <span class="label">
                {@html $data[characteristic].symbol}
                , {$data[characteristic].units}
              </span>
              <strong class="value">
                {#if characteristic.startsWith('current') && $data[characteristic].value < 0.04}
                  &lt; 0.04
                {:else}{$data[characteristic].value}{/if}
              </strong>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </main>
  <footer class="row">
    <div class="col">
      <Button on:click={onPrev}>Zurück</Button>
    </div>
    <div class="col">
      <Button on:click={onNext}>Grafische Darstellung</Button>
    </div>
    <div class="col" />
  </footer>
</div>

<style>
  .row {
    display: flex;
    justify-content: space-evenly;
  }
  .row.first {
    height: 7rem;
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
    width: 18rem;
  }
  li {
    white-space: nowrap;
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
