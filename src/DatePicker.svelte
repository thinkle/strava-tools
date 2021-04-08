<script type="typescript">
  import { fade } from "svelte/transition";
  import { getActivities, getAthlete } from "./strava";
  import { startDate, endDate, activityFetcher } from "./activityStore";
  import { onMount } from "svelte";
  export let autoUpdate = true;

  //$endDate = new Date();
  let end = ($endDate && $endDate.toISOString().substr(0, 10)) || "";
  //$startDate = new Date($endDate.getFullYear(), $endDate.getMonth(), 1, 0);
  let start = ($startDate && $startDate.toISOString().substr(0, 10)) || "";

  $: if (autoUpdate && start)
    $startDate = (useStartDate && new Date(start)) || 0; // react to string changes
  $: if (autoUpdate && end) $endDate = (useEndDate && new Date(end)) || 0; // react to string changes

  let useStartDate = !!$startDate;
  let useEndDate = !!$endDate;
</script>

<div class="wrap">
  From<input type="checkbox" bind:checked={useStartDate} />
  <input class:invisible={!useStartDate} type="date" bind:value={start} />
  to<input type="checkbox" bind:checked={useEndDate} />
  <input class:invisible={!useEndDate} type="date" bind:value={end} />
  {#if useStartDate && useEndDate && start > end}
    <div transition:fade class="warning">
      Oops! Your start date is after your end date!
    </div>
  {/if}
</div>

<style>
  .wrap {
    display: inline-flex;
    text-align: center;
    align-items: center;
  }
  input[type="date"] {
  }
  input {
    opacity: 1;
    transition: opacity 300ms;
    visibility: visible;
  }
  input.invisible {
    opacity: 0;
    visibility: hidden;
  }
  div {
    position: relative;
  }
  .warning {
    position: absolute;
    top: 100%;
    background-color: yellow;
    color: #f22;
    width: 100%;
    text-align: center;
    padding: 1rem;
  }
</style>
