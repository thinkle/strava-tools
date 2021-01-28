<script>
    export let athlete
    export let activity
    import {token,bikeSettings} from './stores.js'
    import {pickBike} from './bikePicker.js';
    import Map from './Map.svelte';
    let defaultBike = athlete && athlete.bikes && athlete.bikes.find((bike)=>bike.primary)
    let showOthers = false;

    function getBike (gear_id) {
        if (athlete) {
            let theBike = athlete && athlete.bikes.find((b)=>b.id==gear_id);
            if (theBike) {
                return theBike
            }
        }
        else {
            return {
                name : 'none',
                id : -1,
            }
        }
    }

    async function changeBike (activity,bike) {
        console.log('change the bike for',activity,'to',bike)
        let update = {
            description: (activity.description||'') + '\nUpdated with Tom\'s magic updater tool',
            gear_id:bike.id
        }
        console.log(update);
        //"https://www.strava.com/api/v3/activities/{id}
        let response = await fetch(
            //$ http GET "https://www.strava.com/api/v3/athlete" "Authorization: Bearer [[token]]"
            `https://www.strava.com/api/v3/activities/${activity.id}`,
            {
                method : 'PUT',
                headers : {
                    Authorization : 'Bearer '+$token.access_token,   
                    'Content-Type': 'application/json'         
                },
                body : JSON.stringify(update)
            }
        )
        console.log('Got response!',response);
        let json = await response.json();
        Object.assign(activity,json);
        console.log('JSON?',json);
        activity = activity;
        currentBike = getBike(activity.gear_id)
        wrongBike = ruleBasedBike.id != currentBike.id
    }
    let currentBike  = athlete && getBike(activity.gear_id);
    let ruleBasedBike = athlete && getBike(pickBike(activity,$bikeSettings) || defaultBike.id);
    let wrongBike = athlete && ruleBasedBike.id != currentBike.id
    $: {
        if (athlete) {
            currentBike = getBike(activity.gear_id);
            ruleBasedBike = getBike(pickBike(activity,$bikeSettings) || defaultBike.id);
            wrongBike = ruleBasedBike.id != currentBike.id
        }
    }
</script>
<tr class="activity" class:wrongBike>
    <td class='date'>
        {new Date(activity.start_date).toLocaleDateString()}        
    </td>
    <td class='title'>
        <a target="_blank" href={`https://www.strava.com/activities/${activity.id}`}>
            {activity.name}
            <br><span class="stravaBranding">View on Strava</span>
        </a>
    </td>   
    <td>
        {activity.type}
    </td>
    <td class='distance'>
        {#if activity.distance}
        {(activity.distance*0.000621371).toFixed(1)} miles
        {/if}
    </td>
    <td class='speed'>
        {#if activity.average_speed}
        {(activity.average_speed*2.23694).toFixed(1)}mph
        {/if}
    </td>
    <td class='temp'>{#if activity.average_temp}
        {activity.average_temp.toFixed(1)}°C
    {/if}</td>
    {#if athlete}
    <td class='bike'>
        {currentBike.name}            
    </td>
    <td class='change'>
        {#if wrongBike}
        <button on:click={()=>changeBike(activity,ruleBasedBike)}>
            <b>
                Set to {ruleBasedBike.name}
            </b>
        </button>
        <br>
        {/if}
        <span on:click={()=>showOthers=!showOthers}>
            {#if wrongBike}
            Other bikes...
            {:else}
            Bike list...
            {/if}
        </span>
        {#if showOthers}
            <small>
                {#if athlete && athlete.bikes} 
                    {#each athlete.bikes as bike}
                        {#if bike.id != currentBike.id && bike.id != ruleBasedBike.id}
                            <br>
                            <div on:click={()=>changeBike(activity,bike)}>&gt;{bike.name}                 
                            </div>
                        {/if}
                    {/each}
                {/if}
            </small>
        {/if}
    </td>
    {/if}
</tr>
<tr class='end'>
    <td colspan='8' class='mapwrap'>
        <div  class='map'>
            <Map polyline={activity && activity.map && activity.map.summary_polyline}/> 
        </div>
    </td>
</tr>

<style>
    
    a {
        color: black;
        font-weight: bold;
    }
    a .stravaBranding {
        color: #FC4C02;
        font-weight: bold;
        font-size: small;
    }
    .end > td {
        border-bottom: 1px solid grey;
        padding-bottom: 10px;
    }
    .map {
        display: flex;
        text-align: left;
    }
    .map > :global(*:nth-child(1)) {
        flex-shrink: 1;
    }
    .map > :global(*:nth-child(2)) {
        flex-grow: 1
    }
    .wrongBike {
        color: #ff3e00;
    }
    .activity {
        border: 1px solid #333;
        padding: 2em;
        margin-bottom: 1em;
    }

    @media 
    only screen and (max-width: 760px),
    (min-device-width: 768px) and (max-device-width: 1024px)  {

	/* Force table to not be like tables anymore */
	td, tr { 
		display: block; 
	}
			
    tr.activity { 
        border: 1px solid #ccc; 
        border-bottom: none;
        margin-bottom: 0;
    }
    .end {
        margin-top: 0;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-top: none;
    }
	td { 
		/* Behave  like a "row" */
		border: none;
		border-bottom: 1px solid #eee; 
		position: relative;
		padding-left: 50%; 
    }
    .end td {
        padding-left: 1rem;
    }
	
	td:before { 
		/* Now like a table header */
		position: absolute;
		/* Top/left values mimic padding */
		top: 6px;
		left: 6px;
		width: 45%; 
		padding-right: 10px; 
		white-space: nowrap;
	}
	
	/*
	Label the data
	*/
    .date:before {content: "Date"}
    .title:before { content: "Activity"; }
	.distance:before { content: "Distance"; }
	.speed:before { content: "Ave. Speed"; }
	.temp:before { content: "Ave. Temp"; }
	.bike:before { content: "Bike"; }
	.change:before { content: "Change Bike"; }
    .mapwrap { content: "Map"; }
    .map {
        display: block;
        text-align: center;
    }
    
}


</style>