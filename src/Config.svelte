<script>
    import { bind, init } from "svelte/internal";
    import { token, bikeSettings } from "./stores.js";
    import { onMount } from "svelte";
    import { getActivities, getAthlete } from './strava.js';
    import RuleEditor from "./RuleEditor.svelte";
    import Activity from "./Activity.svelte";
    import RouteFinder from "./RouteFinder.svelte";
    let fetching;
    let data;
    const uri = "/.netlify/functions/api";

    async function getAthleteData() {        
        athleteData = await getAthlete();
    }
    let athleteData;
    let page = 1;
    async function getActivityData() {
        fetching = true;
        let allActivities = await getActivities(page,30);
        activities = allActivities.filter(
                (activity) => activity.type.indexOf("Ride") > -1
        );
        console.log('Got em',activities)
        fetching = false;
    }
    let activities = [];

    onMount(async () => {
        if ($token) {
            await getAthleteData();
            await getActivityData();
        }
    });
    let showEditor;
    $: if (athleteData && athleteData.bikes) {
        if (!$bikeSettings.length) {
            console.log('no rules, show editor')
            showEditor = true;
        }
    }
    let onlyShowMismatches
</script>

<div>
    {#if $token}
        Hi there, {athleteData && athleteData.firstname}!
        <button on:click={getAthleteData}>Refresh athlete data!</button>
    {:else}
        Not logged in yet :(
    {/if}
    <h2>Bike Choose / Editor</h2>
    <p>
        See your past Strava rides w/ bikes. Highlight bikes that don't match
        rules you set. Fix bikes to match your rules with a quick click.
    </p>

    <button on:click={getActivityData}>Refresh activity data!</button>

    {#if athleteData && athleteData.bikes}
        <button on:click={() => (showEditor = !showEditor)}
            >{#if showEditor}Hide{:else}Show{/if} Bike Rule Editor</button
        >
        {#if showEditor}<RuleEditor bikes={athleteData.bikes} />{/if}
    {/if}

    <table>
        <tbody>
            <tr class="opaque">
                <th colspan="8"> Strava Activities </th>
            </tr>
            <tr class="opaque">
                <th colspan="8" class="toolbar">
                    <input type='checkbox' bind:checked={onlyShowMismatches}> Only show mismatches
                    {#if page > 1}
                        <button
                            on:click={() => {
                                page -= 1;
                                getActivityData();
                            }}>Prev page</button
                        >
                        {#if fetching}
                            ...
                        {:else}
                            Page #{page}
                        {/if}
                    {/if}
                    <button
                        on:click={() => {
                            page += 1;
                            getActivityData();
                        }}> Next page </button>
                </th>
            </tr>
            <tr class="opaque headers">
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th>Distance</th>
                <th>Average Speed</th>
                <th>Average Temp</th>
                <th>Bike</th>
                <th />
            </tr>
            {#each activities as activity, n}            
                <Activity {onlyShowMismatches} athlete={athleteData} {activity} />
            {/each}
        </tbody>
    </table>
</div>

<style>
    table {
        margin: auto;
        max-width: 1100px;
    }
    .toolbar {
        text-align: right;
    }
    th {
        position: sticky;
    }
    .opaque,
    .opaque > * {
        background-color: white;
        z-index: 1;
    }
    tr:nth-child(1) th {
        top: 0;
    }
    tr:nth-child(2) th {
        top: 1rem;
    }
    tr:nth-child(3) th {
        top: 3rem;
        border-bottom: 3px solid #f88;
    }
    @media 
    only screen and (max-width: 760px),
    (min-device-width: 768px) and (max-device-width: 1024px)  {
        .headers {
            display: none;
        }
    }
</style>
