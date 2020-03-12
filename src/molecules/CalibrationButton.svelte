<script>
  import { ipcRenderer } from 'electron';
  export let onClick;
</script>

<button
  on:click={() => {
    onClick();
    ipcRenderer.send('calibrationStart');
  }} />

<style>
  button {
    width: 3rem;
    height: 3rem;
    opacity: 0;
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 9002;
  }
</style>
