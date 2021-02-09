<script>
    import { onMount } from "svelte";
    import Polyline from "@mapbox/polyline";
    import MapboxGL from "mapbox-gl";
    import Activity from "./Activity.svelte";
    import { getActivities, getAthlete } from "./strava.ts";
    import { distance,closestBetween } from "./geometry.js";
    import {getBike} from './bikePicker';
    let athlete
    async function load () {athlete = await getAthlete();}
    load();
    let mainMap;
    let tlon;
    let tlat;
    let map;
    let marker;
    let lastActivities;
    let start;
    let first;
    let last;
    let gearColors = [        
        '#fe7f2d',
        '#a09abc',
        '#2176ae',
        '#4b3b40',
        '#9db17c',
        '#16697a',
        '#cb9cf2',
        '#d64933',
        '#9cde9f',
        '#08605',
        '#3d52d5',
                        ]
    let gearColorIndex = 0;
    let colorByGear = {}
    function getColorForGear (id) {
        if (colorByGear[id]) {
            return colorByGear[id];
        } else {
            colorByGear[id] = gearColors[gearColorIndex % gearColors.length];
            gearColorIndex += 1;
            return colorByGear[id];
        }
    }
    const defaultColor = '#ff3e00'
    onMount(async () => {
        lastActivities = await getActivities(1, 15);
    });

    $: {
        if (mainMap && lastActivities && lastActivities.length) {
            let n = 0
            let last = lastActivities[n];
            while (!last.start_latlng && n < lastActivities.length) {
                n+=1;
                last = lastActivities[n];
            }
            let coord = last.start_latlng || [0,0];
            tlat = coord[0];
            tlon = coord[1];
            MapboxGL.accessToken = "MAPBOX_TOKEN";
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
            map.on('dblclick', (e)=>{
                marker.setLngLat(e.lngLat);
            })
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
        try {
            last = new Date(activities[0].start_date).toLocaleDateString();
            first = new Date(activities[activities.length - 1].start_date).toLocaleDateString()  
        }  catch (err) {
            first = undefined
            last = undefined
            console.log('trouble w dates?',err)
        } 
    }
    let loading;
    let metersWithin = 500;
    let page = 0;
    let activities = [];
    let layers = {}
    let hits = [];
    let sources = [];
    let activeSources = [];
    $: {
        if (map && activities.length && metersWithin) {
            hits = activities.filter((activity) => {
                if (activity.map && activity.map.summary_polyline) {
                    let coords = Polyline.decode(activity.map.summary_polyline);
                    activity.coordinates = coords;
                    // let's just check the first two...
                    /* if (coords && coords.length > 1) {
                        console.log('Test closest between');
                        console.log('First two, closest between...',
                            closestBetween({lat:coords[0][0],
                                            lng:coords[0][1]},
                                            {lat:coords[1][0],
                                            lng:coords[1][1]},
                                            {lat:tlat,
                                            lng:tlon})
                        );
                                        }  */
                    for (let n=1; n<coords.length; n++) {
                        let c1 = coords[n-1]
                        let c2 = coords[n]
                        let closestDistance = closestBetween(
                                {lat:c1[0],lng:c1[1]},
                                {lat:c2[0],lng:c2[1]},
                                {lat:tlat,lng:tlon},
                                metersWithin/5000
                            )
                        if (closestDistance
                             <
                            metersWithin / 1000
                        ) { 
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
            let hitsForLayers = [...hits]
            hitsForLayers.sort(
                (a,b)=>{
                    if (customSorts[a.id] && customSorts[b.id]) {
                        return (
                            (customSorts[a.id]>customSorts[b.id]) && 1 || -1
                            )
                    } else {
                        if (customSorts[a.id]) {
                            return 1}
                        else if (customSorts[b.id]) {return -1}
                    }       
                    if (a.startDate < b.startDate) {
                        return 1
                    } else {
                        return -1
                    }
                }
            );
            hitsForLayers.forEach((hit) => {                
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
                        if (!layers[hit.id]) {
                            layers[hit.id] = {
                                id: "" + hit.id,
                                type: "line",
                                source: "" + hit.id,
                                layout: {
                                    "line-join": "round",
                                    "line-cap": "round",
                                },
                                paint: {
                                    "line-color": hit.gear_id && getColorForGear(hit.gear_id) || defaultColor,
                                    "line-width": 3,
                                },
                            }
                        }
                        map.addLayer(layers[hit.id]);  
                    } catch (err) {
                        console.log("Error adding layer to map", err);
                    }
                }
            });
        }
    }

    function updateActivityColor (activity, color) {
        layers[activity.id].paint['line-color'] = color;
        map.moveLayer(activity.id)
        customSorts[activity.id] = customSortCount
        customSortCount += 1;
    }
    let customSortCount = 1;
    let customSorts = {}

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
        <div class='searchingInfo'>Searching {activities.length} activities
            {#if first}from {first} to {last}{/if}
        </div>
        <div>         
            <button 
                disabled={loading} 
                on:click={loadMoreActivities}
                class:highlight={activities.length==0}
            >
                Load{#if loading}
                    ing…&nbsp;
                {:else}
                    &nbsp;{#if activities.length}more{:else}activities{/if}
                {/if}
            </button>
        </div>
    </nav>
    <nav>
        <div>
{#each Object.keys(colorByGear) as gearColorId}
<span style={`color:${colorByGear[gearColorId]}`}>
    {athlete && getBike(gearColorId,athlete).name || gearColorId}</span>
<span>  </span>
{/each}

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
        <Activity chooser={false} {athlete} {activity} color={layers[activity.id]?.paint['line-color']}> 
            <div class="colorChooser">
                <span style={`color:${layers[activity.id].paint['line-color']}`}>Color: </span> 
                {#each [defaultColor,...gearColors.slice(gearColorIndex)] as color}
                        <button on:click={()=>updateActivityColor(activity,color)}
                            style={`width:1em;background-color:${color}`}></button>
                    {/each}
                <input type="color" style="width:1em" value={layers[activity.id].paint['line-color']}
                    on:change={(e)=>updateActivityColor(activity,e.target.value)}
                >
                <button on:click={updateActivityColor(activity,undefined)}>&times;</button>
            </div>           
        </Activity>
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
    nav {
        display: flex;
        position: sticky;
        top: 0;
        z-index: 2;
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
    }
    .colorChooser * {
        margin-bottom: 0;
        margin-top: 0;
        margin-left: 3px;
    }
</style>
