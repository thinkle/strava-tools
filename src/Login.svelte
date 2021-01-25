<script>
    import Config from './Config.svelte';
    import {token} from './stores.js';
    let clientID = 34363;
    let netlify_uri = 'NETLIFY_URL';
    let loginUri = `http://www.strava.com/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${netlify_uri}/&approval_prompt=force&scope=activity:write,profile:read_all,activity:read_all`
    let loginCode = new URLSearchParams(location.search).get('code')
    let authenticated
    console.log('TOKEN:',$token);

    if ($token) {
        if ($token.expires_at < new Date().getTime()/1000) {
            authenticated = false;
            console.log('Oops, expired',new Date().getTime()/1000 - $token.expires_at,'seconds ago')
            refreshToken($token);
        } else {
            authenticated = true;
        }
    }

    if (!authenticated && loginCode) {
        authenticated = 'Partial';
        console.log('Part way authenticated...');
        getToken(loginCode);
    }
    const uri = '/.netlify/functions/api'

    async function refreshToken () {
        console.log('Refreshing token')
        let response = await fetch(uri,
        {
            method : 'POST',
            body : JSON.stringify(
                {   
                    method:'refresh',
                    token:$token
                }
            )
        }
        );
        console.log('Got response!')
        let jsonResponse
        try {
            jsonResponse = await response.json();
        } catch (err) {
            console.log('No json? oops!');
            // we should delete the old $token and make them log in fresh in the future...
        }
        console.log('Response',jsonResponse)
        localStorage.setItem('token',JSON.stringify(jsonResponse.token));
        $token = jsonResponse.token; 
        authenticated = true       
    }

    async function getToken () {
        console.log('Get token...');
        let response = await fetch(uri,
            {method : 'POST',
            body : JSON.stringify(
                {code:loginCode}
            )}
        );
        let jsonResponse = await response.json();
        localStorage.setItem('token',JSON.stringify(jsonResponse.token));
        $token = jsonResponse.token;
        history.pushState({}, null, '/');

    }
//$ http GET "https://www.strava.com/api/v3/athlete" "Authorization: Bearer [[token]]"

</script>

<div>    
    {#if authenticated}
    <p>You are logged in!</p>
    <button on:click={()=>$token=undefined}>Log out</button>
    <Config/>
    {:else if !$token}
    <p>You are NOT logged in</p>
    <a href={loginUri}>Log in for realz</a>
    {:else}
    Refreshing token... one second...
    {/if}
</div>