<script>
  export let selected = { label: "-- не выбран --" };
  export let onChange;
  export let options;
  export let disabled;

  let optionsVisible = false;
  const h = 100 * options.length;

  $: active = selected.value !== void 0;

  function toggleOptions() {
    if (disabled) return;
    optionsVisible = !optionsVisible;
  }

  function drop(node, { duration }) {
    return {
      duration,
      css: t => `max-height: ${t * h}%`
    };
  }

  function selectOption(e) {
    optionsVisible = false;
    onChange(e.target.dataset.value);
  }
</script>

<style>
  .select-box {
    height: 3.2rem;
    line-height: 3.2rem;
    width: 100%;
    display: flex;
  }

  .select-wrapper {
    flex-grow: 1;
    position: relative;
  }

  .select {
    width: 100%;
    position: absolute;
    top: 0;
    right: 0;
    border: 1px solid var(--corporate-blue-darken);
    border-radius: 4px;
    background-color: var(--bg-color);
    z-index: 9999;
  }

  .select.disabled {
    opacity: 0.8;
  }
  .select.active {
    background-color: var(--corporate-blue);
    color: var(--bg-color);
  }

  .curr-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .curr-value::after {
    content: "";
    display: block;
    border: 5px solid transparent;
    position: relative;
    top: 3px;
    border-top-color: var(--corporate-blue);
    transition: 0.3s ease;
  }
  .select.active .curr-value::after {
    border-top-color: var(--corporate-blue-darken);
  }
  .select.expand .curr-value::after {
    transform: rotate(180deg) translateY(5px);
  }

  .curr-value,
  li {
    padding: 0 2rem;
    line-height: 3.2rem;
    cursor: pointer;
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    padding: 0 2rem;
  }
</style>

<div class="select-box">
  <span>
    <slot />
  </span>
  <div class="select-wrapper">
    <div
      class="select"
      class:disabled
      class:active
      class:expand={optionsVisible}>
      <div class="curr-value" on:click={toggleOptions}>{selected.label}</div>
      {#if optionsVisible}
        <ul transition:drop>
          {#each options as { icon, label, value }}
            <li data-value={value} on:click={selectOption}>
              {#if icon}
                <i class="icon icon-{icon}" />
              {/if}
              {label}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>
