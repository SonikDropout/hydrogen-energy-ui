<script>
  import { ipcRenderer } from 'electron';
  import {__} from '../constants';
</script>

<button
  on:click={() => {
    ipcRenderer.send('serialCommand', [80, 120]);
  }} >{__('reset')}</button>

<style>
  button {
    position: fixed;
    background: transparent;
    border-radius: .4rem;
    border: 1px solid var(--text-color);
    width: 6rem;
    font-size: 1rem;
    bottom: 1rem;
    right: 1rem;
    z-index: 9002;
    outline: none;
  }
</style>
