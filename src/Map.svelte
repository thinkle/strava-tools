<script>
import Polyline from '@mapbox/polyline';
import MapboxGL from 'mapbox-gl';
import {distance} from './geometry.js';
export let polyline
export let color='#ff3e00'
export let coordinates = [];
let mapDiv;
let showMap = false;
const token = 'MAPBOX_TOKEN'
let coordinateData = {}
$: {
    if (polyline && !coordinates?.length) {
        coordinates = Polyline.decode(polyline);
    }
}
$: {
        coordinateData  = findMetadata(coordinates);   
}
$: {
    if (mapDiv && coordinateData.clat) {
        MapboxGL.accessToken = token;
        let map = new MapboxGL.Map({
            container: mapDiv,
            style : 'mapbox://styles/tmhinkle/ckkcnw1l25c8u17nthwt1amxc',
            //style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
            center: [coordinateData.clon,coordinateData.clat], // starting position [lng, lat]
            zoom: [coordinateData.zoom], // starting zoom
        });
        map.on('load',
        ()=>{
            map.addSource('route',{
                type : 'geojson',
                'data':{
                    type : 'Feature',
                    properties : {},
                    'geometry' : {
                        type : 'LineString',
                        coordinates : coordinates.map(
                            (point) => [point[1],point[0]]
                        )
                    }
                }
            })
            map.addLayer({
                id:'route',
                type:'line',
                source:'route',
                layout:{
                    'line-join':'round',
                    'line-cap':'round'
                },
                paint: {
                    'line-color':color,
                    'line-width':3
                }
            })
        });
    }
}

function findMetadata (coordinates) {
    if (!coordinates.length) {return}
    if (!coordinates[0]) {return}
    let clat = coordinates[0][0];
    let clon = coordinates[0][1];
    let minLat = clat
    let maxLat = clat
    let minLon = clon
    let maxLon = clon
    for (let i=1; i<coordinates.length; i++) {
        clat += coordinates[i][0];
        clon += coordinates[i][1];
        if (coordinates[i][0] < minLat) {minLat = coordinates[i][0]}
        if (coordinates[i][0] > maxLat) {maxLat = coordinates[i][0]}
        if (coordinates[i][1] < minLon) {minLon = coordinates[i][1]}
        if (coordinates[i][1] > maxLon) {maxLon = coordinates[i][1]}

    }
    clat = clat / coordinates.length
    clon = clon / coordinates.length
    return {
        clon,
        clat,
        minLat,
        maxLat,
        minLon,
        maxLon,
        zoom: getZoom(minLat,maxLat,minLon,maxLon)
    } // backwards for mapbox!
}

function getZoom (minLat,maxLat,minLon,maxLon) {
    let latSpanKM = distance(minLat,minLon,maxLat,maxLon,'K');
    // https://docs.mapbox.com/help/glossary/zoom-level/
    // let's plan around 500 pixels...
    // We'll assume Cincinnati/Melbourne are reasonable
    // approximations for everyone... sorry world
    const bs = 500;
    let metersPerBox = {
        0 : 59959 * bs,
        1 : 29979 * bs,
        2 : 14989 * bs,
        3 : 7950 * bs,
        4 : 3747 * bs,
        5 : 1873 * bs,
        6 : 937 * bs,
        7 : 468 * bs,
        8 : 234 * bs,
        9 : 117 * bs,
        10 : 59 * bs,
        11 : 29 * bs,
        12 : 15 * bs,
        13 : 7 * bs,
        14 : 3.6 * bs,
        15 : 1.8 * bs,
        16 : .9 * bs,
        17 : .457 * bs,
        18 : .23 * bs,
        19 : .114 * bs,
        20 : .057 * bs,
        21 : .029 * bs,
        22 : .014 * bs
    }
    for (let level=22; level > -1; level--) {
        if (latSpanKM*1000 < metersPerBox[level]) {
            return level;
        }
    }
    return 0
}


let canvas
let scale
$: {
    if (canvas && coordinates && coordinates.length) {
        // we should fix this to use an actual projection at some point
        // in the future... this will do for now :)
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,500,500);
        let latLonFactor = 1.6
        // scaling factor...
        let height = (coordinateData.maxLat - coordinateData.minLat) * latLonFactor
        let width = coordinateData.maxLon - coordinateData.minLon
        let biggest = Math.max(width,height);
        //
        // scale              1
        // ----------   = -------
        // biggest           500
        //
        //
        scale =  500 / biggest;
        ctx.moveTo(
            scale * (coordinates[0][1]  - coordinateData.minLon),
            500 - scale * (coordinates[0][0] - coordinateData.minLat) * latLonFactor,
            )
        ctx.beginPath()
        ctx.strokeStyle = color;
        ctx.lineWidth = 15
        for (let c of coordinates) {
            ctx.lineTo(
                scale * (c[1] - coordinateData.minLon),
                500 - scale * (c[0] - coordinateData.minLat) * latLonFactor   
            );
        }
        ctx.stroke();
    }
}

</script>
<svelte:head>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css' rel='stylesheet' />
</svelte:head>
<span class='iconbox' on:click={()=>showMap=!showMap}>
    <span>{showMap && "Hide" || "Show"} map!</span>
    <canvas 
        width=500
        height=500
        bind:this={canvas}></canvas>
</span>
<span>
{#if showMap}
    <section bind:this={mapDiv}></section>
{/if}
</span>

<style>
    .iconbox span {
        opacity: 0;
        transition: opacity 300ms;
    }
    .iconbox:hover span {
        opacity: 1;
    }
    .iconbox {
        position: relative;
    }
    .iconbox span {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        display: block;
        text-align: center;
        background-color: #fff8;
        color: #622;
        font-weight: bold;
    }
    canvas {
        width: 50px;
        height: 50px;
    }
    section {
        width: 70vw;
        height: 70vw;
    }
</style>