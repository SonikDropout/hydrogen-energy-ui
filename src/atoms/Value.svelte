<script>
  export let fullWidth;
  export let value;
</script>

<style>
  div {
    display: flex;
    justify-content: flex-start;
  }

  div.fullWidth {
    justify-content: space-between;
  }
</style>

<div class:fullWidth>
  <span><slot></slot>:</span>
  <strong>{value}</strong>
</div>