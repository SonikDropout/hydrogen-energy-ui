<script>
  import { data } from "../stores";
  import RangeInput from "../molecules/RangeInput";
  import Button from "../atoms/Button";
  export let onNext;

  const columns = [{ pos: 1 }, { pos: 2 }];

  function setFanPower() {}

  function setBlowPeriod() {}

  function setBlowDuration() {}
</script>

<style>
  main {
    display: flex;
    justify-content: space-evenly;
  }
  .col {
    max-width: 40rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .fc-icon {
    height: 10rem;
    display: block;
    margin: 0 auto;
    grid-column: span 3;
  }
  h2 {
    text-align: center;
    grid-column: span 3;
  }
  figure {
    grid-column: 1 / 2;
    display: inline-block;
    width: 33%;
    vertical-align: middle;
  }
  .label {
    grid-column: span 2;
  }
  .input-field {
    display: inline-block;
    width: 66%;
    vertical-align: middle;
  }
</style>

<div class="layout">
  <header>Задание параметров работы батарей топливных элементов</header>
  <main>
    {#each columns as col}
      <div class="col">
        <h2>БТЭ {col.pos}</h2>
        <img
          src="../static/icons/fuelCell.svg"
          alt="fuelCell"
          class="fc-icon" />
        <figure>
          <img src="../static/icons/fan.svg" alt="fan" />
          <figcaption>Вентилятор</figcaption>
        </figure>
        <div class="input-field">
          <div class="label">Мощность вентилятора, % от макс</div>
          <RangeInput onChange={setFanPower} />
        </div>
        <figure>
          <img src="../static/icons/valve.svg" alt="valve" />
          <figcaption>Продувочный клапан</figcaption>
        </figure>
        <div class="input-field">
          <div class="label">Периодичность продувки, сек</div>
          <RangeInput onChange={setBlowPeriod} />
          <div class="label">Длительность продувки, мсек</div>
          <RangeInput onChange={setBlowDuration} />
        </div>
      </div>
    {/each}
  </main>
  <footer>
    <Button on:click={onNext}>Перейти к исследованиям</Button>
  </footer>
</div>
