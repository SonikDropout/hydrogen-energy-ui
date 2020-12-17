<script>
  import SetParams from './layouts/SetParams';
  import FCResearch from './layouts/FCResearch';
  import Charts from './layouts/Charts';
  import Warnings from './molecules/Warnings';
  import { onMount } from 'svelte';
  import { ipcRenderer } from 'electron';
  import { appInitialized } from './stores';
  import RangeInput from './molecules/RangeInput';
  import {version} from '../package.json'
  let slide = 0;
  let     startX, dragDiff;
  ipcRenderer.on('calibrationFinish', () =>
    setTimeout(() => (showModal = false), 2000)
  );
  onMount(() =>
    appInitialized.subscribe(
      flag => flag && document.getElementById('initial-screen').remove()
    )
  );
  function incrementSlide() {
    slide += slide < 2 ? 1 : 0;
  }
  function decrementSlide() {
    slide -= slide > 0 ? 1 : 0;
  }
</script>

<div class="version">v {version}</div>
{#if $appInitialized}
  <Warnings />
  <div class="content slide-{slide}">
    <SetParams onNext={incrementSlide} />
    <FCResearch onNext={incrementSlide} onPrev={decrementSlide} />
    <Charts onPrev={decrementSlide} />
  </div>
{/if}

<style>
  .version {
    font-size: 1rem;
    color: #999;
    position: fixed;
    padding: 0.4rem 0.8rem;
    bottom: 0;
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
