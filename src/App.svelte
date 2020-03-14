<script>
  import { STATES } from './constants';
  import SetParams from './layouts/SetParams';
  import FCResearch from './layouts/FCResearch';
  import Charts from './layouts/Charts';
  import Warnings from './molecules/Warnings';
  import CalibartionButton from './molecules/CalibrationButton';
  import CalibartionModal from './molecules/CalibartionModal';
  import { ipcRenderer } from 'electron';
  let state = STATES.initial;
  let showModal = false;
  ipcRenderer.on('calibrationFinish', () => setTimeout(() => (showModal = false), 2000));
</script>

<Warnings />
<CalibartionButton onClick={() => (showModal = true)} />
{#if showModal}
  <CalibartionModal />
{/if}
<div class={state}>
  <SetParams onNext={() => (state = STATES.research)} />
  <FCResearch
    onNext={() => (state = STATES.charts)}
    onPrev={() => (state = STATES.initial)} />
  <Charts onPrev={() => (state = STATES.research)} />
</div>

<style>
  div {
    width: 300vw;
    display: flex;
    transition: 0.3s ease-in-out;
  }
  div.research {
    transform: translateX(-100vw);
  }
  div.charts {
    transform: translateX(-200vw);
  }
</style>
