<script>
  import { data } from '../stores';
  import { LOW_PRESSURE } from '../constants';
  import { __ } from '../utils/translations';

  $: isLowPressure = $data.pressure.value < LOW_PRESSURE;

</script>

{#if isLowPressure}
  <div class="warnings">
    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 19 46">
      <path
        d="M11,13.28l-1.5,19L8,13.28a1.5,1.5,0,0,1,3-.23A.89.89,0,0,1,11,13.28ZM11.5,38a2,2,0,1,0-2,2A2,2,0,0,0,11.5,38Zm-2,0ZM19,45V4a1,1,0,0,0-1-1H13V1a1,1,0,0,0-1-1H7A1,1,0,0,0,6,1V3H1A1,1,0,0,0,0,4V45a1,1,0,0,0,1,1H18A1,1,0,0,0,19,45ZM2,5H7A1,1,0,0,0,8,4V2h3V4a1,1,0,0,0,1,1h5V44H2Z"
        fill="var(--danger-color)" />
    </svg>
    <div class="message">
      {@html $__('replace cartridge')}
    </div>
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
  .message {
    animation: blink 1s linear infinite alternate;
    color: var(--danger-color);
    font-size: 0.8rem;
    max-width: 6rem;
  }
</style>
