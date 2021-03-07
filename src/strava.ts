import {token} from './stores';
import { get } from 'svelte/store';

export async function getActivities (page=1, per_page=60) {
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