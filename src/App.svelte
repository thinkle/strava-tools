<script>
	import Login from './Login.svelte'
	let faq
</script>

<main>
	<h1>Tom's Cycling Tools</h1>
	<img class='stravaBranding' src="api_logo_pwrdBy_strava_horiz_gray.svg" alt="Powered by Strava">
	<p><b>Route Finder:</b> Drag location to a spot on the map, pick a threshhold, find the route
		that goes directly by that spot.
	</p>
	<p><b>Bike Setter</b>: change which bike is associated with which ride. You can set up rules to 
		have different defaults for virtual/real rides, or 
		by speed or temperature. Right now, that just color-codes and makes it a bit quicker to change bikes to
		the default. Makes it easy to scan the list for mismatches as well.
	</p>
	<p><a href='#' on:click={()=>faq=true}>FAQ</a></p>
	<Login/>
	{#if faq}
		<div class='modalBackground' on:click={()=>faq=false}>
			<div class='modal' on:click={(e)=>e.stopPropagation()}>
				<dl>
					<dt>
						What data are you collecting about me?
					</dt>
					<dd>
						<p>None.</p>
						<p>When you log into strava, strava provides me a code. That code (your secret) plus
						my API key (my secret) go back to strava and get exchanged for a token which allows
						the code running in this webpage (in <b>your</b> browser) to access your data from strava.</p>
						<p>Your routes and profile info go straight from strava to your browser. I don't actually ever
							see them.
						</p>
						<p>I don't even store the magic token that allows access on my server: you store it in your browser.</p>							So, your browser is doing all the work and requesting data directly from strava. The
						<p>The only request you make that goes to my server is the request to get the token from strava,
							which has to go through me so that I don't expose my API key, which is what strava uses
							to limit how much I can use their service.
						</p>
					</dd>
					<dt>What plans do you have for the future?</dt>
					<dd>
						<p>
						I may try to automate the bike chooser. If I do, that would mean I would have to start 
						storing your token, which gives me more access to your data. I would then use that to
						check for rides that need to be updated and update them without you doing anything.
						</p>
						<p>
							For the map finder, I'd like to improve the geometry a little bit to improve
							the ability to find locations. The way the code works and the way the routes are
							stored makes me believe the route finder will do badly with straight lines. Luckily,
							I live in an area with winding roads and trails, but if you live somewhere with long
							straight roads, my guess is this tool will work less well for you right now.
						</p>
					</dd>
					
					<dt>Can I support you?</dt>
					<dd>
						Sure! Buy me a coffee, or a nice pastry for my next ride,
						by pitching in at my paypal link.
						<form action="https://www.paypal.com/donate" method="post" target="_top">
							<input type="hidden" name="hosted_button_id" value="JGAY7MS9ASP5A" />
							<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
							<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
							</form>
					</dd>
				</dl>
			</div>
		</div>
	{/if}
</main>

<style>

	.stravaBranding {
		height: 24px;
	}
	main {
		text-align: center;
		padding: 15px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.modalBackground {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background-color: #2227;
		z-index: 3;
	}
	.modal {
		margin: auto;
		max-width: 600px;
		background-color: #333;
		color: #ddd;
		padding: 1.5rem;
		z-index: 4;
	}

	dl {
		text-align: left;
		font-size: large;
	}
	dt {
		font-weight: bold;
		margin-bottom: 1rem;
	}
	dd {
		margin-bottom: 2rem;
	}
	dl p {
		margin-bottom: 1rem;
	}

</style>