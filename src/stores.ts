import { writable } from 'svelte/store';
let stored = localStorage.getItem('token');
let initialValue;
if (stored) {
    initialValue = JSON.parse(stored);
    console.log('using parsed token!');
}
export const token = writable(initialValue);
export const authenticated = writable(false);
let storedScope = localStorage.getItem('scope');
export const scope = writable(storedScope);

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

export const currentPath = writable(window.location.pathname);

export const bikeSettings = writable(initialBikeSettings)