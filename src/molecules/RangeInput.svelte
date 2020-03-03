<script>
  export let range = [0, 100];
  export let disabled;
  export let onChange;
  export let name;
  export let defaultValue = range[0];

  let step = 10;

  $: min = Math.min.apply(null, range);
  $: max = Math.max.apply(null, range);
  $: diff = max - min;
  $: value = Math.min(Math.max(defaultValue, range[0]), range[1]);

  $: {
    if (diff < 200) step = 1;
    if (diff < 20) step = 0.1;
    if (diff < 2) step = 0.01;
  }

  let timeout,
    interval,
    showControls = false;

  function increment() {
    if (value + step <= max) {
      value = +(value + step).toPrecision(3);
    }
  }

  function decrement() {
    if (value - step >= min) {
      value = +(value - step).toPrecision(3);
    }
  }

  function stickyCall(fn) {
    fn();
    timeout = setTimeout(() => {
      fn();
      interval = setInterval(fn, 50);
    }, 500);
  }

  function pressIncrement(e) {
    stickyCall(increment);
    e.target.setPointerCapture(e.pointerId);
  }

  function pressDecrement(e) {
    stickyCall(decrement);
    e.target.setPointerCapture(e.pointerId);
  }

  function release(e) {
    if (timeout) clearTimeout(timeout);
    if (interval) clearInterval(interval);
    e.target.releasePointerCapture(e.pointerId);
    onChange(value, name);
  }
</script>

<span class="input-wrapper" class:disabled>
  <button
    disabled={value <= min || disabled}
    class="decrementer"
    on:pointerdown={pressDecrement}
    on:pointerup={release}>
    <span>-</span>
  </button>
  <span class="input">{value}</span>
  <button
    disabled={value >= max || disabled}
    class="incrementer"
    on:pointerdown={pressIncrement}
    on:pointerup={release}>
    <span>+</span>
  </button>
</span>

<style>
  .input-wrapper {
    width: 16rem;
    border-radius: 4px;
    border: 1px solid var(--corporate-blue);
    height: 3.2rem;
    line-height: 3.2rem;
    display: flex;
    overflow: hidden;
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
