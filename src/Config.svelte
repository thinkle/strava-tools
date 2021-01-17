<script>
    import {token} from './stores.js'

    let data;
    let message;
    const uri = '/.netlify/functions/api'
    async function getData () {
        let response = await fetch(uri,
            {method : 'POST',
            body : JSON.stringify(
                {message}
            )}
        );
        data = await response.json();
    }

    function getAthleteData () {
        
    }
    let athleteData

</script>
<div>
    <h2>Preferences</h2>
    {#if $token}
    We are ready to do API magic!
    <button on:click={getAthleteData()}>Get athlete data!</button>
    {athleteData}
    {:else}
    Not logged in yet :(
    {/if}
    Message: <input type='text' bind:value={message}>
    <button on:click={getData}>Send Request</button>
    <div>{JSON.stringify(data)}</div>
</div>