<script>
  import { data, isCriticalConcentration } from '../stores';
  import { LOW_PRESSURE } from '../constants';
  import { slide } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';

  onMount(() => document.addEventListener(onClickOutsideTooltip));
  onMount(() => document.removeEventListener(onClickOutsideTooltip));

  function onClickOutsideTooltip(e) {
    if (tooltipVisible && tooltip !== e.target) tooltipVisible = false;
  }

  $: isLowPressure = $data.pressure.value < LOW_PRESSURE;
  $: visible = isLowPressure || $isCriticalConcentration;

  let tooltipVisible = false, tooltip;

  function toggleTooltip() {
    tooltipVisible = !tooltipVisible;
  }
</script>

{#if visible}
  <div class="warnings">
    {#if $isCriticalConcentration}
      <svg
        on:click={toggleTooltip}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 42.07"
        class="icon">
        <path
          d="M47.75,41.14a1.86,1.86,0,0,1-1.6.93H1.85a1.86,1.86,0,0,1-1.6-2.79L22.39.93a1.86,1.86,0,0,1,3.22,0L47.75,39.28A1.87,1.87,0,0,1,47.75,41.14Z"
          fill="var(--warning-color)" />
        <path
          d="M44.8,41.23H3.2a1.74,1.74,0,0,1-1.52-2.61l20.81-36h0a1.75,1.75,0,0,1,3,0l20.81,36a1.74,1.74,0,0,1-1.52,2.61ZM4.71,38.62H43.29L24,5.2ZM24.76,3.89ZM24,36.65a2.84,2.84,0,1,0-2.84-2.83A2.84,2.84,0,0,0,24,36.65Zm-.13-7.18A1,1,0,0,0,25,28.58l1.67-13.53a2.43,2.43,0,0,0,0-.66,2.71,2.71,0,0,0-5.38.66L23,28.58A1,1,0,0,0,23.87,29.47Z"
          fill="var(--text-color)" />
      </svg>
      {#if tooltipVisible}
        <div class="tooltip" transition:slide bind:this={tooltip}>
          Критически высокая концентрация водорода!
        </div>
      {/if}
    {/if}
    {#if isLowPressure}
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 19 46">
        <path
          d="M11,13.28l-1.5,19L8,13.28a1.5,1.5,0,0,1,3-.23A.89.89,0,0,1,11,13.28ZM11.5,38a2,2,0,1,0-2,2A2,2,0,0,0,11.5,38Zm-2,0ZM19,45V4a1,1,0,0,0-1-1H13V1a1,1,0,0,0-1-1H7A1,1,0,0,0,6,1V3H1A1,1,0,0,0,0,4V45a1,1,0,0,0,1,1H18A1,1,0,0,0,19,45ZM2,5H7A1,1,0,0,0,8,4V2h3V4a1,1,0,0,0,1,1h5V44H2Z"
          fill="var(--danger-color)" />
      </svg>
      <div class="message">Замените картридж H2!</div>
    {/if}
  </div>
{/if}

<style>
  .warnings {
    position: fixed;
    display: flex;
    align-items: center;
    top: 24px;
    right: 24px;
    max-width: 12rem;
    z-index: 9001;
  }
  .warnings > * {
    margin-left: 8px;
  }
  svg {
    animation: blink 1s linear infinite alternate;
    height: 5rem;
  }
  .tooltip {
    position: absolute;
    left: 0;
    font-size: 0.8rem;
    transform: translate(-40%, 120%);
    /* border: 1px solid var(--danger-color); */
    color: var(--danger-color);
    box-shadow: 0 0 2px;
    border-radius: 4px;
    text-align: center;
    width: 120%;
    padding: 0.4rem 0.8rem;
    pointer-events: none;
    background-color: var(--bg-color);
  }
  .message {
    animation: blink 1s linear infinite alternate;
    color: var(--danger-color);
    font-size: 0.8rem;
    max-width: 6rem;
  }
</style>
