<script>
    let data;
    let message;
    const uri = '/.netlify/functions/api'
    async function getData () {
        let response = await fetch(uri,
            {method : 'POST',
            body : JSON.stringify(
                {message}
            )}
        );
        data = await response.json();
    }
</script>
<div>
    <h2>Preferences</h2>
    Message: <input type='text' bind:value={message}>
    <button on:click={getData}>Send Request</button>
    <div>{JSON.stringify(data)}</div>
</div>