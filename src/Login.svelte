<script>
    import Config from './Config.svelte';
    let clientID = 34363;
    let netlify_uri = 'NETLIFY_URL';
    let uri = 'http://www.strava.com/oauth/authorize?client_id={clientID}&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=read'
    let authenticated = false;

//$ http GET "https://www.strava.com/api/v3/athlete" "Authorization: Bearer [[token]]"

</script>

<div>
    This will be a login component. {netlify_uri}
    
    {#if authenticated}
    <p>You are logged in</p>
    <button on:click={()=>authenticated=false}>Log out</button>
    <Config/>
    {:else}
    <p>You are NOT logged in</p>
    <button on:click={()=>authenticated=true}>Log in</button>
    {/if}
</div>