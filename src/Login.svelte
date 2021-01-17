<script>
    import Config from './Config.svelte';
    import {token} from './stores.js';
    let clientID = 34363;
    let netlify_uri = 'NETLIFY_URL';
    let loginUri = `http://www.strava.com/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${netlify_uri}/&approval_prompt=force&scope=read`
    let loginCode = new URLSearchParams(location.search).get('code')
    let authenticated = $token;
    if (loginCode) {
        authenticated = 'Partial';
        console.log('Part way authenticated...');
        getToken(loginCode);
    }
    const uri = '/.netlify/functions/api'



    async function getToken () {
        console.log('Get token...');
        let response = await fetch(uri,
            {method : 'POST',
            body : JSON.stringify(
                {code:loginCode}
            )}
        );
        let jsonResponse = await response.json();
        $token = jsonResponse.token;
    }
//$ http GET "https://www.strava.com/api/v3/athlete" "Authorization: Bearer [[token]]"

</script>

<div>
    This will be a login component. {netlify_uri}
    
    {#if authenticated}
    <p>You are logged in</p>
    <p>Wowza you got a token! {JSON.stringify($token)}</p>
    <button on:click={()=>authenticated=false}>Log out</button>
    <Config/>
    {:else}
    <p>You are NOT logged in</p>
    <a href={loginUri}>Log in for realz</a>
    <button on:click={()=>authenticated=true}>Log in</button>
    {/if}
</div>