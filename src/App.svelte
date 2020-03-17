<script>
  import SetParams from './layouts/SetParams';
  import FCResearch from './layouts/FCResearch';
  import Charts from './layouts/Charts';
  import Warnings from './molecules/Warnings';
  import CalibartionButton from './molecules/CalibrationButton';
  import CalibartionModal from './molecules/CalibartionModal';
  import { onMount } from 'svelte';
  import { ipcRenderer } from 'electron';
  import { appInitialized } from './stores';
  import RangeInput from './molecules/RangeInput';
  let slide = 0;
  let showModal = false,
    startX;
  ipcRenderer.on('calibrationFinish', () =>
    setTimeout(() => (showModal = false), 2000)
  );
  onMount(() =>
    appInitialized.subscribe(
      flag => flag && document.getElementById('initial-screen').remove()
    )
  );

  function startDrag(e) {
    startX = e.touches[0].clientX;
  }

  function drag(e) {
    dragDiff = e.changedTouches[0].clientX - startX;
  }

  function endDrag(e) {
    if (dragDiff > 100) slide += slide < 2 ? 1 : 0;
    else if (dragDiff < -100) slide -= slide > 0 ? 1 : 0;
  }
</script>

{#if $appInitialized}
  <Warnings />
  <CalibartionButton onClick={() => (showModal = true)} />
  {#if showModal}
    <CalibartionModal />
  {/if}
  <div
    class="content slide-{slide}"
    on:touchstart={startDrag}
    on:touchmove={drag}
    on:touchend={endDrag}>
    <SetParams onNext={() => ++slide} />
    <FCResearch onNext={() => ++slide} onPrev={() => --slide} />
    <Charts onPrev={() => --slide} />
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
  .content.slide-1 {
    transform: translateX(-100vw);
  }
  .content.slide-2 {
    transform: translateX(-200vw);
  }
</style>
