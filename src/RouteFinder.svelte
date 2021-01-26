<script>
    import { onMount } from "svelte";
    import Polyline from "@mapbox/polyline";
    import MapboxGL from "mapbox-gl";
    import Activity from "./Activity.svelte";
    import { getActivities } from "./strava.js";
    import { distance } from "./geometry.js";

    let mainMap;
    let tlon;
    let tlat;
    let map;
    let lastActivities;
    let start;
    onMount(async () => {
        lastActivities = await getActivities(1, 1);
    });

    $: {
        if (mainMap && lastActivities && lastActivities.length) {
            let last = lastActivities[0];
            let coord = last.start_latlng;
            tlat = coord[0];
            tlon = coord[1];
            MapboxGL.accessToken = "MAPBOX_TOKEN";
            map = new MapboxGL.Map({
                container: mainMap,
                style: "mapbox://styles/tmhinkle/ckkcnw1l25c8u17nthwt1amxc",
                center: [coord[1], coord[0]],
                zoom: 10,
            });
            var marker = new MapboxGL.Marker({
                color: "#FFFFFF",
                draggable: true,
            })
                .setLngLat([coord[1], coord[0]])
                .addTo(map);

            marker.on("dragend", (e) => {
                console.log("Marker at ", marker.getLngLat());
                let location = marker.getLngLat();
                tlon = location.lng;
                tlat = location.lat;
            });
            //loadMoreActivities();
        }
    }

    $: {
        if (!start) {
            start = [tlat, tlon];
        }
    }

    async function loadMoreActivities() {
        page += 1;
        loading = true;
        const newActivities = await getActivities(page, 100);
        if (newActivities) {
            activities = [...activities, ...newActivities];
        } else {
            console.log("No new activities?");
        }
        loading = false;
    }
    let loading;
    let metersWithin = 500;
    let page = 0;
    let activities = [];
    let hits = [];
    let sources = [];
    let activeSources = [];
    $: {
        if (map && activities.length && metersWithin) {
            hits = activities.filter((activity) => {
                if (activity.map && activity.map.summary_polyline) {
                    let coords = Polyline.decode(activity.map.summary_polyline);
                    activity.coordinates = coords;
                    for (let c of coords) {
                        if (
                            distance(c[0], c[1], tlat, tlon, "K") <
                            metersWithin / 1000
                        ) {
                            console.log(
                                activity,
                                "is close!",
                                distance(c[0], c[1], tlat, tlon, "K"),
                                "km away"
                            );
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
            hits.forEach((hit) => {
                if (sources.indexOf(hit.id) == -1) {
                    if (!map.getSource(hit.id)) {
                        map.addSource(`${hit.id}`, {
                            type: "geojson",
                            data: {
                                type: "Feature",
                                properties: {},
                                geometry: {
                                    type: "LineString",
                                    coordinates: hit.coordinates.map(
                                        (point) => [point[1], point[0]]
                                    ),
                                },
                            },
                        });
                    }
                    sources.push(hit.id);

                    try {
                        map.addLayer({
                            id: "" + hit.id,
                            type: "line",
                            source: "" + hit.id,
                            layout: {
                                "line-join": "round",
                                "line-cap": "round",
                            },
                            paint: {
                                "line-color": "#f88",
                                "line-width": 3,
                            },
                        });
                    } catch (err) {
                        console.log("Error adding layer to map", err);
                    }
                }
            });
        }
    }
</script>

<svelte:head>
    <link
        href="https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css"
        rel="stylesheet"
    />
</svelte:head>
<div>
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
        <div>
            Searching last {activities.length} activities...
            <button disabled={loading} on:click={loadMoreActivities}>
                Load{#if loading}
                    ing…&nbsp;
                {:else}
                    &nbsp;more
                {/if}
            </button>
        </div>
    </nav>
    <div class="mapwrap">
        <div class="overlay">
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
    {#each hits as activity}
        <Activity {activity} />
    {/each}
</table>

<style>
    h3 {
        margin: 0;
    }
    nav {
        display: flex;
        position: sticky;
        top: 0;
        z-index: 2;
        background-color: #fff7;
        align-items: center;
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
</style>
