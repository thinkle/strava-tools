<script>
    import Config from "./Config.svelte";
    import RouteFinder from './RouteFinder.svelte';
    import { token,scope } from "./stores";
    export let onSelectCallback = ()=>{}
    const clientID = STRAVA_CLIENT_ID;
    const netlify_uri = "NETLIFY_URL";
    const scopes = "activity:write,profile:read_all,activity:read_all";
    const roScopes = 'activity:read_all,profile:read_all';
    const loginUri = `http://www.strava.com/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${netlify_uri}/&approval_prompt=force&scope=${scopes}`;
    const roLoginUri = `http://www.strava.com/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${netlify_uri}/&approval_prompt=force&scope=${roScopes}`;
    let loginCode = new URLSearchParams(location.search).get("code");
    let authenticated;
    let mode;
    console.log("TOKEN:", $token, 'Scope',$scope);

    if ($token) {
        if ($token.expires_at < new Date().getTime() / 1000) {
            authenticated = false;
            console.log(
                "Oops, expired",
                new Date().getTime() / 1000 - $token.expires_at,
                "seconds ago"
            );
            refreshToken($token);
        } else {
            authenticated = true;
        }
    }

    if (!authenticated && loginCode) {
        authenticated = "Partial";
        console.log("Part way authenticated...");
        getToken(loginCode);
    }
    const uri = "/.netlify/functions/api";

    async function refreshToken() {
        console.log("Refreshing token");
        let response = await fetch(uri, {
            method: "POST",
            body: JSON.stringify({
                method: "refresh",
                token: $token,
            }),
        });
        console.log("Got response!");
        let jsonResponse;
        try {
            jsonResponse = await response.json();
        } catch (err) {
            console.log("No json? oops!");
            // we should delete the old $token and make them log in fresh in the future...
        }
        console.log("Response", jsonResponse);
        localStorage.setItem("token", JSON.stringify(jsonResponse.token));
        $token = jsonResponse.token;
        authenticated = true;
    }

    async function getToken() {
        console.log("Get token...");
        let response = await fetch(uri, {
            method: "POST",
            body: JSON.stringify({ code: loginCode }),
        });
        let jsonResponse = await response.json();
        localStorage.setItem("token", JSON.stringify(jsonResponse.token));
        $token = jsonResponse.token;
        localStorage.setItem('loginUri',location.search)
        $scope = new URLSearchParams(location.search).get("scope")
        localStorage.setItem('scope',$scope);
        history.pushState({}, null, "/");
    }

    function clearToken() {
        $token = undefined;
        localStorage.removeItem("token");
        localStorage.removeItem('scope')
        authenticated = false;
    }
    const BIKE = 'bikematcher';
    const FIND = 'routefinder';

    function setMode (newMode) {
        console.log('setMode',newMode)
        onSelectCallback(newMode);
        mode = newMode;
    }
</script>

<div class:intro={!mode}>
    {#if authenticated && $scope}    
        {#if $scope.indexOf('activity:write')>-1}
            <button class:active={mode==BIKE} on:click={()=>setMode(BIKE)}>Set bikes for rides</button>        
        {/if}
        {#if $scope.indexOf('activity:read')>-1}
            <button class:active={mode==FIND} on:click={()=>setMode(FIND)}>Find route by location</button>       
        {/if}
        <button class="out" on:click={clearToken}>Log out</button>
        {#if mode==BIKE}
            <Config/>
        {:else if mode==FIND}
            <RouteFinder/>
        {/if}
    {:else if !$token}
        <h3>Log In</h3>
        <br>Read/Write (for bike chooser tool + find-myroute):
        <br><a href={loginUri}>
            <img alt="Log in with Strava" class="stravalogin" src="btn_strava_connectwith_orange.svg"/>
        </a>
        <br>
        <br>Read only (for find-my-route only): 
        <br><a href={roLoginUri}>
            <img alt="Log in with Strava" class="stravalogin" src="btn_strava_connectwith_orange.svg"/>
        </a>

    {:else}
        Refreshing token... one second...
        <button on:click={clearToken}>Give up</button>

    {/if}
</div>

<style>
    .stravalogin {
        height: 48px;
    }

    button {
        border: none;
        background-color: transparent;
        text-decoration: underline;
        color: #0033a0;
    }
    button:hover {
        text-decoration: none;
        border: 1px solid #0033a0;
        transition: all 100ms;
    }
    .intro button {
        font-size: x-large;
        border: 1px solid #777;
        display: block;
        text-decoration: none;
        font-weight: bold;
        text-align: center;
        margin: auto;
        margin-top: 1em;
        padding: 1em;
        background-color: #ff3e00;
        color: white;
    }
    .intro .out {
        background-color: white;
        color: #333;
    }
    .active:hover {
        text-decoration: underline;
        border: none;
    }
    .active {
        font-weight: bold;
        border: none;
        transition: all 300ms;
        color: black;
    }
</style>