<script type="typescript">
  import DatePicker from "./DatePicker.svelte";
  import TimeRow from "./TimeRow.svelte";
  import ColorPicker from "./GearColorPicker.svelte";
  import Activity from "./Activity.svelte";
  import { getActivities, getAthlete } from "./strava";
  import { activityFetcher } from "./activityStore";
  import { onMount } from "svelte";
  let colorUpdate = 0;

  function getGearName(gear_id, athlete) {
    if (athlete && athlete.bikes) {
      let bike = athlete.bikes.find((b) => b.id == gear_id);
      if (bike) {
        return bike.name;
      }
    }
    return gear_id;
  }

  let athlete;
  onMount(async () => {
    athlete = await getAthlete();
  });

  let totalTime;
  let activities = [];
  //let allActivities = [];
  $: activities = $activityFetcher.activities();
  let indoorTypes = new Set([
    "VirtualRide",
    "VirtualRun",
    "Yoga",
    "Workout",
    "WeightTraining",
  ]);
  let activityTypes = [];
  let activityGears = [];
  let byTypeMap = {};
  let byGearMap = {};
  let page = 1;
  let fetching = false;
  function formatDuration(s) {
    let hours = 0;
    let minutes = 0;
    return s + " seconds";
  }

  $: {
    if (!fetching && !$activityFetcher.getFetcher().complete) {
      async function update() {
        fetching = true;
        await $activityFetcher.fetchMore();
        fetching = false;
      }
      update();
    }
  }

  $: {
    byTypeMap = {};
    byGearMap = {};
    for (let a of activities) {
      if (byTypeMap[a.type]) {
        byTypeMap[a.type].push(a);
      } else {
        byTypeMap[a.type] = [a];
      }
      if (a.gear_id) {
        if (byGearMap[a.gear_id]) {
          byGearMap[a.gear_id].push(a);
        } else {
          byGearMap[a.gear_id] = [a];
        }
      }
    }
  }
  function forceRerender() {
    byTypeMap = byTypeMap;
  }

  $: activityTypes = Object.keys(byTypeMap);
  $: activityGears = Object.keys(byGearMap);
  let highlightedActivity;
  let hx = 0;
  let hy = 0;
  function highlightActivity(a, event) {
    if (!stickyHighlight || (stickyHighlight && event.type == "click")) {
      highlightedActivity = a;
      if (event.type == "click" && a) {
        stickyHighlight = true;
        console.log("sticky mode!");
      }
    } else {
      console.log("ignoring event", event);
      return;
    }
    if (event) {
      hx = Math.max(
        0,
        Math.min(
          event.clientX - (0.5 * window.innerWidth) / 2,
          window.innerWidth / 2
        )
      );
      hy = Math.min(event.clientY + 5, window.innerHeight - 200);
    }
  }
  let showByType;
  let showByGear;
  let stickyHighlight;
</script>

<div>
  <div class="top">
    <h3>Total Outdoor Time</h3>
    <div style="margin:auto"><DatePicker /></div>
  </div>
  <div class="fetchingNotification" class:active={fetching}>
    Fetching more activities from Strava...
  </div>
  {#if highlightedActivity}
    <div
      class:stickyHighlight
      class="screen"
      on:click={() => {
        highlightedActivity = null;
        stickyHighlight = false;
      }}
    >
      <table
        class="highlight"
        style={`left:${hx}px;top:${hy}px`}
        on:click={(e) => {
          if (stickyHighlight) {
            e.stopPropagation();
            console.log("caught click");
          } else {
            console.log("Clicked thingy");
            stickyHighlight = true;
            e.stopPropagation();
          }
        }}
      >
        <Activity
          showCoordinateButton={false}
          chooser={false}
          activity={highlightedActivity}
        />
      </table>
    </div>
  {/if}
  <table>
    <TimeRow
      activityType="Outdoor"
      activities={activities.filter((a) => !indoorTypes.has(a.type))}
      showCheck={false}
      {colorUpdate}
      {highlightActivity}
    />
    <TimeRow
      activityType="All Activities"
      {activities}
      {colorUpdate}
      showCheck={false}
      {highlightActivity}
    />
    <tr>
      <th colspan="6" on:click={() => (showByType = !showByType)}>
        By type ({#if showByType}hide{:else}show{/if})
      </th>
    </tr>
    {#if showByType}
      {#each activityTypes as activityType}
        <TimeRow
          {colorUpdate}
          {activityType}
          activities={activities.filter((a) => a.type == activityType)}
          {indoorTypes}
          onChange={forceRerender}
          {highlightActivity}
        >
          <ColorPicker
            {athlete}
            colorId={activityType}
            setColorCallback={() => (colorUpdate += 1)}
          />
        </TimeRow>
      {/each}
    {/if}
    <tr>
      <th colspan="6" on:click={() => (showByGear = !showByGear)}>
        By gear ({#if showByGear}hide{:else}show{/if})
      </th>
    </tr>
    {#if showByGear}
      {#each activityGears as activityGear}
        <TimeRow
          activityType={getGearName(activityGear, athlete)}
          activities={activities.filter((a) => a.gear_id == activityGear)}
          {indoorTypes}
          {colorUpdate}
          onChange={forceRerender}
          {highlightActivity}
        >
          <ColorPicker
            {athlete}
            colorId={activityGear}
            setColorCallback={() => (colorUpdate += 1)}
          />
        </TimeRow>
      {/each}
    {/if}
  </table>

  <div class="spacer">This space intentionally left blank.</div>
</div>

<style>
  .spacer {
    height: 100vh;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    font-family: "Courier New", Courier, monospace;
  }
  .top {
    background-color: white;
    position: sticky;
    top: 0;
  }
  th {
    background-color: #d7d7d7;
    color: #333;
    margin-top: 1em;
  }
  th:hover {
    background-color: #e7e7e7;
  }
  table {
    width: calc(100vw-20px);
    margin: auto;
  }
  /* Activity popup */
  .highlight {
    width: 50vw;
    position: fixed;
    top: 30px;
    left: 25vw;
    background-color: white;
    border: 1px solid #ff73cd;
  }
  .screen {
    transition: background-color 300ms;
  }
  .stickyHighlight {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #fff9;
  }

  /* Fetching notification */
  .fetchingNotification {
    position: fixed;
    bottom: 10px;
    left: calc(50vw - 75px);
    width: 150px;
    box-sizing: border-box;
    padding: 1em;
    background-color: #222222aa;
    color: #fcc;
    text-align: center;
    transition: opacity 300ms;
    opacity: 0;
    pointer-events: none;
  }
  .fetchingNotification.active {
    opacity: 1;
  }
</style>
