<script>
  import Button from "../atoms/Button";
  import Select from "../molecules/Select";
  import Toggle from "../atoms/Toggle";
  import RangeInput from "../molecules/RangeInput";
  import Warnings from '../molecules/Warnings';
  import { data, connectionType } from "../stores";
  export let onPrev;
  export let onNext;

  const FCColumns = [
    {
      title: "БТЭ 1",
      name: "first",
      characteristics: [
        "voltage",
        "current",
        "power",
        "temp1",
        "temp2",
        "consumption"
      ]
    }
  ];

  const commonCharacteristics = [
    "pressure",
    "temp",
    "consumption",
    "power",
    "voltage",
    "current",
    "internalCurrent",
    "externalCurrent"
  ];

  const connectionTypeOptions = {};
  const loadModeOptions = {};
  let selectedLoadMode, isActive;

  function setConnectionType(type) {
    connectionType.set(type)
  }
  function setLoadMode() {}
  function setLoadValue() {}
  function toggleFC() {}
</script>

<div class="layout">
  <header>Исследование работы топливных элементов</header>
  <main>
    <div class="select-field">
      <div class="label">Тип соединения</div>
      <Select onChange={setConnectionType} options={connectionTypeOptions} />
    </div>
    <div class="select-field">
      <div class="label">Режим нагрузки</div>
      <Select onChange={setLoadMode} options={loadModeOptions} />
    </div>
    {#if selectedLoadMode}
      <div class="load-mode">
        <span class="label">Задать {selectedLoadMode.label}</span>
        <RangeInput onChange={setLoadValue} />
      </div>
    {/if}
    <h3>БТЭ 1</h3>
    <img src="../static/icons/valve" alt="valve" />
    <Button on:click={toggleFC} class="start">
      {isActive ? 'Стоп' : 'Старт'}
    </Button>
    <h2>Характеристики работы</h2>
    <ul class="single">
    	{#each FCColumns as FCColumn}
    	  <h4>{FCColumn.title}</h4>
    	  {#each FCColumn.characteristics as characteristic}
    	    <li>
    	      <span class="label">
    	        {$data[characteristic].label}, {$data[characteristic].units}
    	      </span>
    	      <strong class="value">{$data[characteristic].value}</strong>
    	    </li>
    	  {/each}
    	{/each}
    </ul>
    <ul class="common">
    {#each commonCharacteristics as characteristic}
      <li>
        <span class="label">
          {$data[characteristic].label}, {$data[characteristic].units}
        </span>
        <strong class="value">{$data[characteristic].value}</strong>
      </li>
    {/each}
    </ul>
  </main>
  <footer>
    <Button on:click={onPrev}>Назад</Button>
    <Button on:click={onNext}>Построение графиков</Button>
  </footer>
</div>
