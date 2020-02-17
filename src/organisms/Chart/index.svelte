<script>
  import EmptyChart from "./EmptyChart";
  import Chart from "./Chart.svelte";
  export let yPoints = [];
  export let xPoints = []; // this array must be sorted!!
  export let xCaption;
  export let yCaption;
  export let type = "line";
  const padding = { top: 20, right: 25, bottom: 40, left: 40 };
</script>

<div class="chart">
  {#if yPoints.length < 2 || xPoints.length < 2}
    <EmptyChart {xCaption} {yCaption} {padding} />
  {:else}
    <Chart {yPoints} {xPoints} {xCaption} {yCaption} {type} {padding} />
  {/if}
</div>
