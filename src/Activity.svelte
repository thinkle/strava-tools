<script>
    export let athlete
    export let activity
    import {token,bikeSettings} from './stores.js'
    import {pickBike} from './bikePicker.js';
    let defaultBike = athlete.bikes && athlete.bikes.find((bike)=>bike.primary)
    let showOthers = false;

    function getBike (gear_id) {
        if (athlete) {
            let theBike = athlete.bikes.find((b)=>b.id==gear_id);
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
    let currentBike  = getBike(activity.gear_id);
    let ruleBasedBike = getBike(pickBike(activity,$bikeSettings) || defaultBike.id);
    let wrongBike = ruleBasedBike.id != currentBike.id
    $: {
        currentBike = getBike(activity.gear_id);
        ruleBasedBike = getBike(pickBike(activity,$bikeSettings) || defaultBike.id);
        wrongBike = ruleBasedBike.id != currentBike.id
    }
</script>
<tr class="activity" class:wrongBike>
    <td>
        {new Date(activity.start_date).toLocaleDateString()}        
    </td>
    <td>
        <a href={`https://www.strava.com/activities/${activity.id}`}>
            {activity.name}
        </a>
    </td>   
    <td>
        {activity.type}
    </td>
    <td>
        {#if activity.distance}
        {(activity.distance*0.000621371).toFixed(1)} miles
        {/if}
    </td>
    <td>
        {#if activity.average_speed}
        {(activity.average_speed*2.23694).toFixed(1)}mph
        {/if}
    </td>
    <td>{#if activity.average_temp}
        {activity.average_temp.toFixed(1)}°C
    {/if}</td>
    <td>
        {currentBike.name} {getBike(activity.gear_id).name}             
    </td>
    <td>
        {#if wrongBike}
        <button on:click={()=>changeBike(activity,ruleBasedBike)}>
            <b>
                Set to {ruleBasedBike.name}
            </b>
        </button>
        {/if}
        <span on:click={()=>showOthers=!showOthers}>Bike list...</span>
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
</tr>

<style>
    .wrongBike {
        color: red;
    }
    .activity {
        border: 1px solid #333;
        padding: 2em;
        margin-bottom: 1em;
    }
</style>