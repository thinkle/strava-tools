<script type="typescript">
  export let activityType: string;
  export let activities;
  export let indoorTypes: Set<string>;
  export let showCheck = true;
  export let checkContent = "";
  export let onChange;
  export let highlightActivity = (a, event) => {
    console.log("highlight ", a, event);
  };
  import { getColorForGear } from "./colors";

  let totalTime = 0;
  let totalDistance = 0;
  let formattedDistance = "";
  $: formattedDistance =
    (totalDistance > 10000 && `${(totalDistance / 1000).toFixed(1)}km`) ||
    `${Math.round(totalDistance)} meters`;
  let first = "";
  let last = "";
  $: {
    totalTime = 0;
    totalDistance = 0;
    first = "";
    last = "";
    for (let a of activities) {
      if (a.elapsed_time) {
        totalTime += a.elapsed_time;
      }
      if (!first || a.start_date_local < first) {
        first = a.start_date_local;
      }
      if (!last || a.start_date_local > last) {
        last = a.start_date_local;
      }
      if (a.distance) {
        totalDistance += a.distance;
      }
    }
  }

  $: firstDate = new Date(first);
  $: lastDate = new Date(last);

  function displayTime(seconds) {
    let hours = Math.floor(seconds / (60 * 60));
    if (hours) {
      seconds = seconds - hours * 60 * 60;
    }
    let minutes = Math.floor(seconds / 60);
    if (minutes) {
      seconds = seconds - minutes * 60;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  let sorted = [];
  let x;
  let y;
  $: {
    sorted = activities.sort(
      (a, b) => (a.start_date_local > b.start_date_local && 1) || -1
    );
    x = 0;
    y = 400;
  }
  let width;
  $: width = (0.7 * 1000) / activities.length;
  function getX(activity) {
    let hours = (lastDate.getTime() - firstDate.getTime()) / (60 * 60 * 1000);
    let fromStart =
      (new Date(activity.start_date_local).getTime() - firstDate.getTime()) /
      (60 * 60 * 1000);
    let percentage = fromStart / hours;
    return percentage * 1000 - width / 2;
  }

  function getY(activity) {
    return 0;
  }
  let hoverMode = true;
</script>

<tr>
  <td colspan="5">
    <svg viewBox="0 0 1000 600" preserveAspectRatio="none">
      {#each sorted as activity}
        <rect
          x={getX(activity)}
          y={600 - activity.elapsed_time / 60}
          fill={getColorForGear(activity.gear_id || activity.type)}
          date={activity.start_date_local}
          title={activity.title}
          height={activity.elapsed_time / 60}
          {width}
          on:mouseenter={(e) => highlightActivity(activity, e)}
          on:mouseleave={(e) => hoverMode && highlightActivity(null, e)}
          on:click={(e) => highlightActivity(activity, e)}
        />
      {/each}
    </svg>
  </td>
</tr>
<tr>
  <th>
    {#if showCheck}<input
        type="checkbox"
        checked={!indoorTypes.has(activityType)}
        on:click={(e) => {
          if (e.target.checked) {
            indoorTypes.delete(activityType);
          } else {
            indoorTypes.add(activityType);
          }
          if (onChange) {
            onChange();
          }
        }}
      />
    {:else}
      {checkContent}
    {/if}
  </th>
  <th class="left" style={`color:${getColorForGear(activityType)}`}
    ><slot>{activityType}</slot></th
  >
  <td class="left">
    <b>{displayTime(totalTime)}</b>
  </td>
  <td>
    {activities.length} activities
    {#if totalDistance}for {formattedDistance} distance{/if}
  </td>
  <td>
    From {firstDate.toLocaleDateString()}&ndash;{lastDate.toLocaleDateString()}
  </td>
</tr>

<style>
  b {
    font-weight: bold;
  }
  b,
  th {
    font-size: 160%;
  }
  .left {
    text-align: left;
  }
  svg {
    width: 100%;
    height: 100px;
  }
  rect:hover {
    fill: red;
  }
  @media (max-width: 500px) {
    tr {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
</style>
