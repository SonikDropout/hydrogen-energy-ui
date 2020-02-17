<script>
  export let range = [0, 100];
  export let disabled;
  export let onChange;

  let step = 1;

  $: value = range[0];
  $: min = Math.min.apply(null, range);
  $: max = Math.max.apply(null, range);
  $: diff = max - min;

  $: {
    if (diff < 1) step = 0.01;
    if (diff < 10) step = 0.1;
  }

  let input = { value: range[0] },
    timeout,
    interval,
    showControls = false;

  function increment() {
    if (value + step <= max) {
      value = +(value + step).toPrecision(3);
      onChange(value);
    }
  }

  function decrement() {
    if (value - step >= min) {
      value = +(value - step).toPrecision(3);
      onChange(value);
    }
  }

  function stickyCall(fn) {
    fn();
    timeout = setTimeout(() => {
      fn();
      interval = setInterval(fn, 50);
    }, 500);
  }

  function pressIncrement() {
    stickyCall(increment);
  }

  function pressDecrement() {
    stickyCall(decrement);
  }

  function release() {
    if (timeout) clearTimeout(timeout);
    if (interval) clearInterval(interval);
  }
</script>

<style>
  .input-wrapper {
    min-width: 16rem;
    border-radius: 4px;
    border: 1px solid var(--text-color);
    height: 4rem;
    line-height: 4rem;
    display: flex;
  }
  .input-wrapper.disabled {
    opacity: 0.6;
  }
  .input {
    flex-grow: 1;
    padding: 0 1rem;
    border: none;
    font-size: 2rem;
    text-align: center;
    border-left: 1px solid;
    border-right: 1px solid;
    display: inline-block;
    border-color: var(--text-color);
  }
  button {
    border: none;
    background-color: transparent;
    width: 4rem;
    font-size: 3.2rem;
    line-height: 4rem;
    font-weight: 300;
    outline: none;
  }
  button:focus {
    outline: none;
  }
  button:disabled {
    color: var(--corporate-grey);
    opacity: 0.8;
  }
</style>

<span class="input-wrapper" class:disabled>
  <button
    disabled={value <= range[0] || disabled}
    class="decrementer"
    on:pointerdown={pressDecrement}
    on:pointerup={release}>
    -
  </button>
  <span class="input">{value}</span>
  <button
    disabled={value >= range[1] || disabled}
    class="incrementer"
    on:pointerdown={pressIncrement}
    on:pointerup={release}>
    +
  </button>
</span>
