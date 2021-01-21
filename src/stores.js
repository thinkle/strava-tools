import { writable } from 'svelte/store';
let stored = localStorage.getItem('token');
let initialValue;
if (stored) {
    initialValue = JSON.parse(stored);
    console.log('using parsed token!');
}
export const token = writable(initialValue);

let initialBikeSettings = localStorage.getItem('bikeSettings');
if (initialBikeSettings) {
    try {
        initialBikeSettings = JSON.parse(initialBikeSettings);
        console.log('Got initial settings!',initialBikeSettings);
    } catch (err) {
        console.log('Error parsing settings',err);
        initialBikeSettings = []
    }
} else {
    initialBikeSettings = []
}

export const bikeSettings = writable(initialBikeSettings)