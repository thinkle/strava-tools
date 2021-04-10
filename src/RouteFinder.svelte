<script>
  import { onMount } from "svelte";
  import Polyline from "@mapbox/polyline";
  import MapboxGL from "mapbox-gl";
  import Activity from "./Activity.svelte";
  import GearColorPicker from "./GearColorPicker.svelte";
  import ColorPicker from "./ColorPicker.svelte";
  import DatePicker from "./DatePicker.svelte";
  import { getActivities, getAthlete } from "./strava.ts";
  import { closestBetween } from "./geometry.js";
  import { getColorForGear, getColors, setCustomColor } from "./colors";
  import { startDate, endDate, activityFetcher } from "./activityStore";
  $startDate = 0;
  $endDate = 0;
  let dateMode = false;
  let athlete;
  async function load() {
    athlete = await getAthlete();
  }
  load();
  let mainMap;
  let tlon;
  let tlat;
  let map;
  let marker;
  let mapReady;
  let lastActivities;
  let start;
  let first;
  let last;

  function getSourceID(activity) {
    if (activity.detailed) {
      return activity.id + "DET";
    } else {
      return activity.id;
    }
  }

  onMount(async () => {
    lastActivities = await getActivities(1, 15);
    if (activities.length == 0) {
      activities = [...lastActivities];
    }
  });

  function createMap() {
    //console.log('Creating map...',mainMap,lastActivities,tlat,tlon)
    let n = 0;
    let last = lastActivities[n];
    while (!last.start_latlng && n < lastActivities.length) {
      n += 1;
      last = lastActivities[n];
    }
    let coord = last.start_latlng || [0, 0];
    tlat = coord[0];
    tlon = coord[1];
    MapboxGL.accessToken = "MAPBOX_TOKEN";
    mapReady = false;
    map = new MapboxGL.Map({
      container: mainMap,
      style: "mapbox://styles/tmhinkle/ckkcnw1l25c8u17nthwt1amxc",
      center: [coord[1], coord[0]],
      zoom: 10,
    });
    marker = new MapboxGL.Marker({
      color: "#FFFFFF",
      draggable: true,
    })
      .setLngLat([coord[1], coord[0]])
      .addTo(map);

    marker.on("dragend", (e) => {
      let location = marker.getLngLat();
      tlon = location.lng;
      tlat = location.lat;
    });
    map.on("dblclick", (e) => {
      marker.setLngLat(e.lngLat);
    });
    map.on("style.load", () => (mapReady = true));
  }

  $: {
    if (mainMap && lastActivities && lastActivities.length) {
      createMap();
    }
  }

  $: {
    if (!start) {
      start = [tlat, tlon];
    }
  }

  async function loadMoreActivities() {
    loading = true;
    await $activityFetcher.fetchMore();
    loading = false;
    try {
      last = new Date(activities[0].start_date).toLocaleDateString();
      first = new Date(
        activities[activities.length - 1].start_date
      ).toLocaleDateString();
    } catch (err) {
      first = undefined;
      last = undefined;
      console.log("trouble w dates?", err);
    }
  }
  let loading;
  let metersWithin = 500;
  let page = 0;
  let activities = [];
  $: {
    activities = $activityFetcher.activities();
  }
  let fetching;
  let complete;
  $: {
    if (activities.length == 0 && !fetching && !complete) {
      console.log("Reactive not fetching not complete....");
      fetching = true;
      console.log("Fetch more!");
      $activityFetcher
        .fetchMore()
        .then((done) => {
          console.log("Fetched - done? ", done);
          complete = done;
          fetching = false;
          activities = $activityFetcher.activities();
          console.log("Activities=>", activities);
        })
        .catch((err) => {
          console.log("Error fetching: ", err);
          fetching = false;
        });
    }
  }
  let layers = {};
  let hits = [];
  let sources = [];
  let activeSources = [];
  let updateNow = 1;
  $: {
    if (map && mapReady && activities.length && metersWithin && updateNow) {
      updateNow += 1;
      console.log("Re-check hits etc.");
      hits = activities.filter((activity) => {
        for (let key in gearOrTypeToShowList) {
          if (!gearOrTypeToShowList[key]) {
            if (activity.type == key || activity.gear_id == key) {
              return false;
            }
          }
        }
        if (activity.map && activity.map.summary_polyline) {
          let coords;
          if (!activity.coordinates || activity.coordinates.length == 0) {
            coords = Polyline.decode(activity.map.summary_polyline);
            activity.coordinates = coords;
          } else {
            coords = activity.coordinates;
          }
          for (let n = 1; n < coords.length; n++) {
            let c1 = coords[n - 1];
            let c2 = coords[n];
            let closestDistance = closestBetween(
              { lat: c1[0], lng: c1[1] },
              { lat: c2[0], lng: c2[1] },
              { lat: tlat, lng: tlon },
              metersWithin / 5000
            );
            if (closestDistance < metersWithin / 1000) {
              return true;
            }
          }
        }
      });
      for (let source of sources) {
        if (map.getLayer(source)) {
          map.removeLayer(source);
        }
      }
      sources = [];
      let hitsForLayers = [...hits];
      hitsForLayers.sort((a, b) => {
        if (customSorts[a.id] && customSorts[b.id]) {
          return (customSorts[a.id] > customSorts[b.id] && 1) || -1;
        } else {
          if (customSorts[a.id]) {
            return 1;
          } else if (customSorts[b.id]) {
            return -1;
          }
        }
        if (a.startDate < b.startDate) {
          return 1;
        } else {
          return -1;
        }
      });
      hitsForLayers.forEach((hit) => {
        if (hit.type && gearOrTypeToShowList[hit.type] === undefined) {
          gearOrTypeToShowList[hit.type] = true;
        }
        if (hit.gear_id && gearOrTypeToShowList[hit.gear_id] === undefined) {
          gearOrTypeToShowList[hit.gear_id] = true;
        }
        if (sources.indexOf(getSourceID(hit)) == -1) {
          if (!map.getSource(getSourceID(hit))) {
            map.addSource(`${getSourceID(hit)}`, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: hit.coordinates.map((point) => [
                    point[1],
                    point[0],
                  ]),
                },
              },
            });
          }
          sources.push(getSourceID(hit));

          try {
            if (!layers[getSourceID(hit)]) {
              layers[getSourceID(hit)] = {
                id: "" + getSourceID(hit),
                type: "line",
                source: "" + getSourceID(hit),
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color":
                    (hit.gear_id && getColorForGear(hit.gear_id)) ||
                    (hit.type && getColorForGear(hit.type)) ||
                    defaultColor,
                  "line-width": 3,
                },
              };
            }
            map.addLayer(layers[getSourceID(hit)]);
          } catch (err) {
            console.log("Error adding layer to map", err);
          }
        }
      });
    }
  }

  function updateActivityColor(activity, color) {
    layers[getSourceID(activity)].paint["line-color"] = color;
    map.moveLayer(getSourceID(activity));
    customSorts[getSourceID(activity)] = customSortCount;
    customSortCount += 1;
  }
  let customSortCount = 1;
  let customSorts = {};

  let gearOrTypeToShowList = {}; // gear ID or activity type to filter out of list...

  function setColorCallback(colorPickerFor, color, oldColor) {
    //debugger;
    setCustomColor(colorPickerFor, color);
    activities.map((activity) => {
      if (
        layers[activity.id] &&
        layers[activity.id].paint &&
        layers[activity.id].paint["line-color"] == oldColor
      ) {
        if (
          activity.gear_id == colorPickerFor ||
          activity.type == colorPickerFor
        ) {
          console.log("Update color for ", activity.id, activity.name);
          layers[activity.id].paint["line-color"] = color; // update!
        }
      }
    });
  }

  $: console.log("gearOrTypeToShowList: ", gearOrTypeToShowList);
</script>

<svelte:head>
  <link
    href="https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css"
    rel="stylesheet"
  />
</svelte:head>
<div>
  <div class="navcontainer">
    <nav>
      <h3>Find Routes by Location</h3>
      <div>
        Search for activities within: <input
          type="number"
          bind:value={metersWithin}
        /> meters
      </div>
      <div>
        {#if hits.length}
          <a href="#results">{hits.length} hits</a>
        {/if}
      </div>
      <div class="searchingInfo">
        Searching {activities.length} activities
        {#if first}from {first} to {last}{/if}
      </div>
      <input type="checkbox" bind:checked={dateMode} />Advanced
      <div>
        {#if $activityFetcher.getFetcher().complete}
          Got 'em all!
        {:else}
          <button
            disabled={loading}
            on:click={() => loadMoreActivities()}
            class:highlight={activities.length == 0}
          >
            Load{#if loading}
              ing…&nbsp;
            {:else}
              &nbsp;{#if activities.length}more{:else}activities{/if}
            {/if}
          </button>
        {/if}
      </div>
    </nav>
    <nav>
      <div style="margin:auto;">
        <!-- Let's pick ride types... -->
        {#each Object.keys(gearOrTypeToShowList) as gearColorId}
          <span
            style="display:inline-flex; margin-right: 1em; align-items: center"
          >
            <GearColorPicker
              colorId={gearColorId}
              {athlete}
              onSetGearColor={setColorCallback}
            />
            <input
              type="checkbox"
              bind:checked={gearOrTypeToShowList[gearColorId]}
            />
          </span>
          <span />
        {/each}
      </div>
      {#if dateMode}
        <div style="margin-left: auto">
          <DatePicker autoUpdate="false" />
          <button
            on:click={() => {
              $activityFetcher.fetchAll();
            }}>Fetch all</button
          >
        </div>
      {/if}
    </nav>
  </div>

  <div class="mapwrap">
    <div class="overlay">
      <button on:click={() => map.setZoom(map.getZoom() + 1)}>+</button>
      <button on:click={() => map.setZoom(map.getZoom() - 1)}>-</button>
      {#if start && start[0] == tlat && start[1] == tlon}
        Drag marker around the map to search for activities
      {:else}
        Searching within {metersWithin} meters of
        <span>{tlat.toFixed(4)},{tlon.toFixed(4)}</span>
      {/if}
    </div>
    <div class="main" bind:this={mainMap} />
  </div>
</div>
<h3>{hits.length} Results</h3>
<table id="results">
  {#each hits as activity (activity.id)}
    {#if layers[activity.id]?.paint}
      <Activity
        chooser={false}
        {athlete}
        {activity}
        color={layers[activity.id].paint["line-color"]}
        updateCallback={(a) => {
          updateNow += 1;
        }}
      >
        <ColorPicker
          name={activity.name}
          color={layers[activity.id].paint["line-color"]}
          setColorCallback={(color) => {
            console.log("Wow, a color!", color, activity);
            updateActivityColor(activity, color);
          }}>Set color</ColorPicker
        >
      </Activity>
    {:else}
      <tr>
        What is up with {activity.id}??? ({activity.name}) Layer info: {JSON.stringify(
          layers[activity.id]
        )}
      </tr>
    {/if}
  {/each}
</table>

<style>
  .highlight {
    font-weight: bold;
    background-color: #bd3001;
    color: white;
  }
  h3 {
    margin: 0;
  }
  .navcontainer {
    position: sticky;
    top: 0;
    z-index: 2;
  }
  nav {
    display: flex;
    background-color: #fff7;
    align-items: center;
    margin: auto;
    max-width: 1200px;
  }
  nav :nth-child(2) {
    margin-left: auto;
  }
  nav div {
    margin-left: 1em;
  }
  nav div:nth-child(1) {
    margin-left: 0;
  }

  .main {
    width: 90%;
    height: 90vh;
    margin: auto;
  }
  .mapwrap {
    position: relative;
  }
  .overlay {
    z-index: 2;
    background-color: #fff7;
    padding: 2em;
    max-width: 10em;
    position: absolute;
    top: 5px;
    right: 5px;
  }
  table {
    margin: auto;
  }
  .searchingInfo {
    font-size: x-small;
  }
  input {
    padding: 0;
  }
  .colorChooser {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    max-width: 200px;
  }
  .colorChooser * {
    margin-bottom: 0;
    margin-top: 0;
    margin-left: 3px;
  }
  .overlay button {
    border-radius: 50%;
    width: 2em;
    height: 2em;
  }
</style>
