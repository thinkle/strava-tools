<script>
	import Login from './Login.svelte'
</script>

<main>
	<h1>Tom's Cycling Tools</h1>
	<img class='stravaBranding' src="api_logo_pwrdBy_strava_horiz_gray.svg" alt="Powered by Strava">
	<p>This App will help map the right bike to each ride!</p>
	<p>Also, maps!</p>
	<Login/>
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
</style>