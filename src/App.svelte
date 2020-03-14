<script>
  import { STATES } from './constants';
  import SetParams from './layouts/SetParams';
  import FCResearch from './layouts/FCResearch';
  import Charts from './layouts/Charts';
  import Warnings from './molecules/Warnings';
  import CalibartionButton from './molecules/CalibrationButton';
  import CalibartionModal from './molecules/CalibartionModal';
  import { onMount } from 'svelte';
  import { ipcRenderer } from 'electron';
  import { appInitialized } from './stores';
  let state = STATES.initial;
  let showModal = false;
  ipcRenderer.on('calibrationFinish', () =>
    setTimeout(() => (showModal = false), 2000)
  );
  onMount(() =>
    appInitialized.subscribe(
      flag => flag && document.getElementById('initial-screen').remove()
    )
  );
</script>

{#if $appInitialized}
  <Warnings />
  <CalibartionButton onClick={() => (showModal = true)} />
  {#if showModal}
    <CalibartionModal />
  {/if}
  <div class="content {state}">
    <SetParams onNext={() => (state = STATES.research)} />
    <FCResearch
      onNext={() => (state = STATES.charts)}
      onPrev={() => (state = STATES.initial)} />
    <Charts onPrev={() => (state = STATES.research)} />
  </div>
{/if}

<style>
  .intial {
    width: 100vw;
    height: 100vh;
    background-color: black;
    color: white;
    text-align: center;
    font-size: 3.2rem;
  }
  .content {
    width: 300vw;
    display: flex;
    transition: 0.3s ease-in-out;
  }
  .content.research {
    transform: translateX(-100vw);
  }
  .content.charts {
    transform: translateX(-200vw);
  }
</style>
