<script>
    import { onMount } from "svelte";
    import Polyline from "@mapbox/polyline";
    import MapboxGL from "mapbox-gl";
    import Activity from './Activity.svelte';
    import {getActivities} from './strava.js';
    import {distance} from './geometry.js';

    let mainMap;
    let tlon
    let tlat
    let map
    let lastActivities 
    onMount(async ()=>{
        lastActivities = await getActivities(1,1);
    });

    $: {if (mainMap && lastActivities && lastActivities.length) {
        let last  = lastActivities[0]
        let coord = Polyline.decode(last.map.summary_polyline)[0];
        tlat = coord[0];
        tlon = coord[1];
        MapboxGL.accessToken = 'MAPBOX_TOKEN';
        map = new MapboxGL.Map({
            container: mainMap,
            style : 'mapbox://styles/tmhinkle/ckkcnw1l25c8u17nthwt1amxc',
            center: [coord[1],
                     coord[0]],
            zoom: 9
        });
        var marker = new MapboxGL.Marker({
            color: "#FFFFFF",
            draggable: true
            })
            .setLngLat([coord[1],coord[0]])
            .addTo(map);

        marker.on(
            'dragend',
            (e)=>{
                console.log('Marker at ',marker.getLngLat())
                let location = marker.getLngLat();
                tlon = location.lng
                tlat = location.lat
            }
        );
        loadMoreActivities();
        }
    }

    async function loadMoreActivities () {
        page += 1;
        const newActivities = await getActivities(page,50);
        activities = [...activities,...newActivities];
    }

    let metersWithin = 500;
    let page = 0;
    let activities = [];
    let hits = [];
    let sources = [];
    let activeSources = [];
    $: {if (map && activities.length && metersWithin) {
        hits = activities.filter(
            (activity)=>{
                if (activity.map && activity.map.summary_polyline) {
                    let coords = Polyline.decode(activity.map.summary_polyline);
                    activity.coordinates = coords;
                    for (let c of coords) {
                        if (distance(c[0],c[1],tlat,tlon,'K') < (metersWithin / 1000)) {
                            console.log(
                                activity,'is close!',
                                distance(c[0],c[1],tlat,tlon,'K'),'km away'
                            );
                            return true;
                        }
                    }
                }
            }
        );
        for (let source of sources) {
            try {map.removeLayer(source);}
            catch (err) {}
        }
        hits.forEach(
            (hit) => {     
                if (sources.indexOf(hit.id)==-1) {       
                    map.addSource(`${hit.id}`,{
                        type : 'geojson',
                        'data':{
                            type : 'Feature',
                            properties : {},
                            'geometry' : {
                                type : 'LineString',
                                coordinates : hit.coordinates.map(
                                    (point) => [point[1],point[0]]
                                )
                            }
                        }
                    })
                    sources.push(hit.id)
                }
                map.addLayer({
                    id:''+hit.id,
                    type:'line',
                    source:''+hit.id,
                    layout:{
                        'line-join':'round',
                        'line-cap':'round'
                    },
                    paint: {
                        'line-color':'#f88',
                        'line-width':3
                    }
                })
        });


    }}

</script>
<svelte:head>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css' rel='stylesheet' />
</svelte:head>
<div>
    <h3>Find Routes by Location</h3>
    <div>
        <p>Search for activities within: <input type='number' bind:value={metersWithin}> meters</p>
        <div class='main' bind:this={mainMap}/>
    </div>
</div>
<div>
    Searching last {activities.length} activities...
    <button on:click={loadMoreActivities}>Load more</button>
</div>
<table>
    {#each hits as activity}
        <Activity activity={activity}/>
    {/each}
</table>

<style>
    .main {
        width: 800px;
        height: 800px;
        margin: auto;
    }
</style>