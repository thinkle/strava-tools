import {token} from './stores.js';
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