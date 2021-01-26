<script>
	import Login from './Login.svelte'
</script>

<main>
	<h1>Strava Tools</h1>
	<p>This App will magically auto-correct your gear!</p>
	<p>Also, maps!</p>
	<Login/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
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