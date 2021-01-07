<script>
    import Config from './Config.svelte';
    let authenticated = false;
</script>
<div>
    This will be a login component.
    
    {#if authenticated}
    <p>You are logged in</p>
    <button on:click={()=>authenticated=false}>Log out</button>
    <Config/>
    {:else}
    <p>You are NOT logged in</p>
    <button on:click={()=>authenticated=true}>Log in</button>
    {/if}
</div>