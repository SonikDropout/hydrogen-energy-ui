<script>
  import { STATES } from './constants';
  import SetParams from './layouts/SetParams';
  import FCResearch from './layouts/FCResearch';
  import Charts from './layouts/Charts';
  import Warnings from './molecules/Warnings';
  let state = STATES.initial;
</script>

<Warnings />
<div class={state}>
  <SetParams onNext={() => (state = STATES.research)} />
  <FCResearch
    onNext={() => (state = STATES.charts)}
    onPrev={() => (state = STATES.initial)} />
  <Charts onPrev={() => (state = STATES.research)} />
</div>

<style>
  div {
    width: 300vw;
    display: flex;
    transition: 0.3s ease-in-out;
  }
  div.research {
    transform: translateX(-100vw);
  }
  div.charts {
    transform: translateX(-200vw);
  }
</style>
