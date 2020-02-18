<script>
  export let range = [0, 100];
  export let disabled;
  export let onChange;
  export let name;
  export let defaultValue = range[0];

  let step = 1;

  $: value = defaultValue;
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
    console.log(name);
    if (value + step <= max) {
      value = +(value + step).toPrecision(3);
      onChange(value, name);
    }
  }

  function decrement() {
    if (value - step >= min) {
      value = +(value - step).toPrecision(3);
      onChange(value, name);
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
    width: 16rem;
    border-radius: 4px;
    border: 1px solid var(--corporate-blue);
    height: 3.2rem;
    line-height: 3.2rem;
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
    display: inline-block;
  }
  button {
    border: none;
    background-color: transparent;
    width: 3.2rem;
    font-size: 2.4rem;
    line-height: 3.2rem;
    font-weight: 300;
    outline: none;
    background-color: var(--corporate-blue);
    color: var(--bg-color);
  }
  button:focus {
    outline: none;
  }
  button:disabled {
    opacity: 0.5;
  }
</style>

<span class="input-wrapper" class:disabled>
  <button
    disabled={value <= range[0] || disabled}
    class="decrementer"
    on:pointerdown={pressDecrement}
    on:pointerup={release}>
    <span>-</span>
  </button>
  <span class="input">{value}</span>
  <button
    disabled={value >= range[1] || disabled}
    class="incrementer"
    on:pointerdown={pressIncrement}
    on:pointerup={release}>
    <span>+</span>
  </button>
</span>
