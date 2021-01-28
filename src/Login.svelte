<script>
    import Config from "./Config.svelte";
    import RouteFinder from './RouteFinder.svelte';
    import { token } from "./stores.js";
    const clientID = STRAVA_CLIENT_ID;
    const netlify_uri = "NETLIFY_URL";
    const scopes = "activity:write,profile:read_all,activity:read_all";
    const roScopes = 'activity:read_all';
    const loginUri = `http://www.strava.com/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${netlify_uri}/&approval_prompt=force&scope=${scopes}`;
    const roLoginUri = `http://www.strava.com/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${netlify_uri}/&approval_prompt=force&scope=${roScopes}`;
    let loginCode = new URLSearchParams(location.search).get("code");
    let authenticated;
    let mode;
    console.log("TOKEN:", $token);

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
        history.pushState({}, null, "/");
    }

    function clearToken() {
        $token = undefined;
        localStorage.removeItem("token");
        authenticated = false;
    }
    const BIKE = 'bikematcher';
    const FIND = 'routefinder';
</script>

<div>
    {#if authenticated}
        <p>You are logged in!</p>
        <button on:click={()=>mode=BIKE}>Set bikes for rides</button>
        <button on:click={()=>mode=FIND}>Find route by location</button>       
        <button on:click={clearToken}>Log out</button>
        {#if mode==BIKE}
            <Config/>
        {:else if mode==FIND}
            <RouteFinder/>
        {/if}
    {:else if !$token}
        <br>Read/Write (for bike chooser tool + find-myroute):
        <br><a href={loginUri}>
            <img class="stravalogin" src="btn_strava_connectwith_orange.svg"/>
        </a>
        <br>
        <br>Read only (for find-my-route only): 
        <br><a href={roLoginUri}>
            <img class="stravalogin" src="btn_strava_connectwith_orange.svg"/>
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
</style>