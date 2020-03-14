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

  let timeout,
    interval,
    changeTimeout,
    showControls = false;

  function increment() {
    if (value + step <= max) {
      value = +(value + step).toPrecision(3);
    } else {
      clearTimers();
      changeTimeout = setTimeout(onChange, 200, value, name);
    }
  }

  function decrement() {
    if (value - step >= min) {
      value = +(value - step).toPrecision(3);
    } else {
      clearTimers();
      changeTimeout = setTimeout(onChange, 200, value, name);
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
    clearTimers();
    e.target.releasePointerCapture(e.pointerId);
    changeTimeout = setTimeout(onChange, 200, value, name);
  }

  function clearTimers() {
    clearTimeout(timeout);
    clearTimeout(changeTimeout);
    clearInterval(interval);
  }
</script>

<span class="input-wrapper" class:disabled>
  <button
    disabled={value <= min || disabled}
    class="decrementer"
    on:pointerdown={pressDecrement}
    on:pointercancel={release}
    on:pointerup={release}>
    <span>-</span>
  </button>
  <span class="input">{value}</span>
  <button
    disabled={value >= max || disabled}
    class="incrementer"
    on:pointerdown={pressIncrement}
    on:pointercancel={release}
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
