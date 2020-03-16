<script>
  export let range = [0, 100];
  export let disabled;
  export let onChange;
  export let name;
  export let defaultValue = range[0];
  export let step = 1;

  $: min = Math.min.apply(null, range);
  $: max = Math.max.apply(null, range);
  $: value = Math.min(Math.max(defaultValue, min), max);

  let input, dispatchTimeout;

  function handleChange(e) {
    clearTimeout(dispatchTimeout);
    value = e.target.value;
    dispatchTimeout = setTimeout(onChange, 300, value, e.target.name);
  }

  function increment() {
    input.stepUp();
    input.dispatchEvent(new Event('change'));
  }

  function decrement() {
    input.stepDown();
    input.dispatchEvent(new Event('change'));
  }
</script>

<div class="input" class:disabled>
  <input
    on:change={handleChange}
    bind:this={input}
    type="range"
    {name}
    {min}
    {max}
    {disabled}
    bind:value
    {step} />
  <div class="controls">
    <button disabled={value >= max} class="incrementer" on:click={increment}>
      <span class="arrow">&#x276C;</span>
    </button>
    <span class="value">{value}</span>
    <button disabled={value <= min} class="decrementer" on:click={decrement}>
      <span class="arrow">&#x276D;</span>
    </button>
  </div>
</div>

<style>
  .input {
    display: flex;
    align-items: center;
  }
  .input.disabled {
    opacity: 0.6;
  }
  input {
    flex-grow: 1;
    -webkit-appearance: none;
  }
  input::-webkit-slider-runnable-track {
    background-color: rgb(194, 194, 194);
    height: 8px;
    border: none;
    border-radius: 4px;
  }
  input::-webkit-slider-thumb {
    width: 16px;
    height: 16px;
    background-color: var(--corporate-blue);
    -webkit-appearance: none;
    margin-top: -4px;
    border-radius: 50%;
  }
  input:focus {
    -webkit-appearance: none;
    outline: none;
  }
  input:active::-webkit-slider-thumb {
    background-color: var(--corporate-blue);
    box-shadow: 0 0 0 16px rgb(26, 162, 221, 0.2);
    transform: scale(0.9);
  }
  input:active::-webkit-slider-runnable-track {
    background-color: #b3b3b3;
  }
  .value {
    width: 3rem;
    display: inline-block;
    text-align: center;
  }
  .controls {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  button {
    display: block;
    transform: translateX(2px);
    border: none;
    background-color: transparent;
    font-size: 1.2rem;
    font-weight: 300;
    padding: 0 2rem;
    outline: none;
    color: var(--corporate-grey-darken)
  }
  button:focus {
    outline: none;
  }
  button:disabled {
    opacity: 0.5;
  }
  .arrow {
    display: block;
    transform: scale(3) rotate(90deg);
  }
</style>
