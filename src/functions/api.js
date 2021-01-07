export async function handler (event, context) {
    let params = event.queryStringParameters;
    if (event.body) {
        try {
            jsonBody = JSON.parse(event.body);
        }
        catch (err) {
            console.log(`ERROR PARSING "${event.body}"`);
            throw err;
        }
    }
    params = {
        ...params,
        ...jsonBody
    }
    return {
        statusCode : 200,
        body : JSON.stringify(
            {message:'Hello world',
             content : 'I echo params',
             params}
            )
    }
}
