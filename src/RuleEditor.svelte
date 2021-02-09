<script>
    import {bikeSettings} from './stores'
    export let bikes
    import { flip } from 'svelte/animate';
    import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
    const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 300,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});
    let defaultBike = bikes.find((bike)=>bike.primary)

    function saveSettings () {
        localStorage.setItem('bikeSettings',JSON.stringify($bikeSettings));
    }

    </script>
    <div>
        <h3>Rules for Bikes!</h3>
        <button on:click={saveSettings}>Save</button>
        Athlete has {bikes.length} bikes.
        {#if bikes.length <=1}
            This tool is useless for you. You only have one bike (at least according to Strava).
            Have you considered the n+1 rule?
        {/if}
        {#each $bikeSettings as rule,n (rule)}
        <section  key={rule}
        in:receive="{{key: rule}}"
        out:send="{{key: rule}}"
        animate:flip>
            {#if n < $bikeSettings.length}
            <button
                on:click={
                    ()=>{
                        $bikeSettings = [
                            ...$bikeSettings.slice(0,n),
                            {bike:defaultBike},
                            ...$bikeSettings.slice(n)]
                    }
                }
            >+</button>
            {/if}
        <div>
            <div class='bar'>
                <button on:click={
                ()=>{
                    $bikeSettings = [...$bikeSettings.slice(0,n),
                                     ...$bikeSettings.slice(n+1)]
                }
                }>Delete</button>
                Rule #{n+1}:                 
                <span class='right'>
                    {#if n > 0}
                    <button 
                        
                        on:click={
                        ()=>{
                            $bikeSettings = [
                                ...$bikeSettings.slice(0,n-1),
                                $bikeSettings[n],
                                $bikeSettings[n-1],
                                ...$bikeSettings.slice(n+1)
                            ]
                        }
                    }>
                        Move up
                    </button>  
                    {/if}
                    {#if n + 1 < $bikeSettings.length}
                    <button on:click={
                        ()=>{
                            $bikeSettings = [
                                ...$bikeSettings.slice(0,n),
                                $bikeSettings[n+1],
                                $bikeSettings[n],
                                ...$bikeSettings.slice(n+2)
                            ]
                        }
                    }>
                    Move down
                    </button> 
                    {/if}
                </span>                
            </div>
            <h3>
                <select bind:value={rule.bike}>
                        {#each bikes as bike}
                        <option value={bike.id}>{bike.name}</option>
                        {/each}
                    </select>
                    is the default for...
                </h3>   
                <div>                    
                    <select bind:value={rule.defaultType}>
                        <option value='All'>All rides</option>
                        <option value='VirtualRide'>Virtual Rides</option>
                        <option value='Ride'>Real Rides</option>
                    </select>
                    <span><input type='checkbox' bind:checked={rule.speedLimit}>by speed</span>
                    <span><input type='checkbox' bind:checked={rule.tempLimit}>my temp</span>
                    {#if rule.speedLimit}
                        <br>Average Speed: <input bind:value={rule.minSpeed} type='number'>
                        &ndash;<input bind:value={rule.maxSpeed} type='number'>mph
                    {/if}
                    {#if rule.tempLimit}
                    <br>Average Temperature: <input bind:value={rule.minTemp} type='number'>
                    &ndash;<input bind:value={rule.maxTemp} type='number'>°F
                {/if}
                </div>
            </div>
        </section>
        {:else}
        <section>
            <div>
                You don't have any custom rules yet. You can add rules to set different defaults
                for different speeds or temperatures.
                <a href="#" on:click={()=>{
                     $bikeSettings = [
                            {},
                     ]
                }}>Add your first custom rule!</a>
            </div>
        </section>
        {/each}
        <section>
        <button on:click={()=>{$bikeSettings = [...$bikeSettings,{}]}}>+</button>
            <div>
                <h3>{defaultBike.name} <b>Default</b></h3>
                <p>Strava default for all rides</p>
            </div>
        </section>
    </div>

    <style>
        .bar {
            display: flex;
            border-bottom-color: var(--outline,#aaa);
            border-bottom-style: solid;
            border-bottom-width: 3px;
            padding-bottom: 3px;
        }
        .right {
            margin-left: auto;
        }
        section > div {
            margin: auto;
            text-align: left;
            width: 400px;
            border : 1px solid var(--outline,#aaa);
            padding : 7px;
        }
        h3 b {
            background-color: var(--highlight,#ff0);
            padding: 6px;
            transform: translate(-3px,-12px);
            display: inline-block;
            font-weight: bold;
            font-size: x-small;
            border-radius: 3px;
        }
        input[type="number"] {
            width: 3em;
        }

    </style>