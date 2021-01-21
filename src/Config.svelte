<script>
    import { bind, init } from 'svelte/internal';
    import {token} from './stores.js'
    import { onMount } from 'svelte';
    import RuleEditor from './RuleEditor.svelte';
    import Activity from './Activity.svelte';

    let data;
    let apiRequest;
    const uri = '/.netlify/functions/api'
    async function getData () {
        let response = await fetch(uri,
            {method : 'POST',
            body : JSON.stringify(
                apiRequest
            )}
        );
        data = await response.json();
    }

    async function getAthleteData () {
        let response = await fetch(
            //$ http GET "https://www.strava.com/api/v3/athlete" "Authorization: Bearer [[token]]"
            'https://www.strava.com/api/v3/athlete',
            {
                headers : {
                    Authorization : 'Bearer '+$token.access_token
                }
            }
        )
        athleteData = await response.json();
        console.log('Got data!',athleteData);
        return;
        apiRequest = {
            token : $token.access_token,
            method : 'getAthlete'
        }
        await getData();
        athleteData = data;
        console.log('First round:',athleteData);
        
    }
    let athleteData
    let page = 1
    async function getActivityData () {
        let response = await fetch(
            `https://www.strava.com/api/v3/activities?page=${page}&per_page=60`,
            {
                headers : {
                    Authorization : 'Bearer '+$token.access_token
                },            
            }
        )
         activities = await response.json()
         activities = activities.filter(
             (activity)=>activity.type.indexOf('Ride')>-1
         );
        console.log('Got activity data!',activities);
        return;
    }
let activities = []
   
   
    onMount(
    async  () => {
        if ($token) {
            await getAthleteData();
            await getActivityData();
        }
    }
    )
    let showEditor
</script>
<div>
    {#if $token}
    We are ready to do API magic!
    <button on:click={getAthleteData}>Refresh athlete data!</button>
    <button on:click={getActivityData}>Refresh activity data!</button>    
    {:else}
    Not logged in yet :(
    {/if}
    
    {#if athleteData && athleteData.bikes}
    <button on:click={()=>showEditor=!showEditor}>Rule Editor</button>
    {#if showEditor}<RuleEditor bikes={athleteData.bikes}/>{/if}
    {/if}
    <button
        on:click={()=>{
            page += 1;
            getActivityData();
        }}
    >Next page</button>
    <table>
        <tbody>
        <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Type</th>
            <th>Distance</th>
            <th>Average Speed</th>
            <th>Average Temp</th>
            <th>Bike</th>
            <th></th>
        </tr>
    {#each activities as activity}
    <Activity athlete={athleteData} activity={activity}
    />
   
    {/each}
        </tbody>
    </table>    
</div>

<style>

</style>