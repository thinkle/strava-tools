import {token, authenticated} from './stores';
import { get } from 'svelte/store';


export async function checkAuthentication () {
    let $token = get(token);
    if ($token) {
        if ($token.expires_at < new Date().getTime() / 1000) {
            authenticated.update(()=>false);
            console.log(
                "Oops, expired",
                new Date().getTime() / 1000 - $token.expires_at,
                "seconds ago"
            );
            await refreshToken($token);
            return true;
        } else {
            console.log('Token is good to go!')
            authenticated.update(()=>true);
            return true;
        }
    } else {
        return false
    }
}

export async function refreshToken() {    
    console.log("Refreshing token");
    let response = await fetch(uri, {
        method: "POST",
        body: JSON.stringify({
            method: "refresh",
            token: get(token),
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
    token.update(()=>jsonResponse.token);    
    authenticated.update(()=>true);
}


export async function getActivities (page=1, per_page=60) {
    await checkAuthentication()
    let response = await fetch(
        `https://www.strava.com/api/v3/activities?page=${page}&per_page=${per_page}`,
        {
            headers: {
                Authorization: "Bearer " + get(token).access_token,
            },
        }
    );
    let activities = await response.json();  
    console.log('getActivities=>',activities)  
    return activities
}

export async function getAthlete () {
    await checkAuthentication()
    let response = await fetch(
        //$ http GET "https://www.strava.com/api/v3/athlete" "Authorization: Bearer [[token]]"
            "https://www.strava.com/api/v3/athlete",
            {
                headers: {
                    Authorization: "Bearer " + get(token).access_token,
                },
            }
        );
    return await response.json();   
}

export async function getLatLngStream (activity) {
    await checkAuthentication()
    // $ http GET "https://www.strava.com/api/v3/activities/{id}/streams?keys=&key_by_type=" "Authorization: Bearer [[token]]"
    let response = await fetch(
        //$ http GET "https://www.strava.com/api/v3/athlete" "Authorization: Bearer [[token]]"
            `https://www.strava.com/api/v3/activities/${activity.id}/streams?keys=latlng,grade_smooth,watts,heartrate,velocity_smooth,distance&keys_by_type=false`,
            {
                headers: {
                    Authorization: "Bearer " + get(token).access_token,
                },
            }
        );
    return await response.json();   
}