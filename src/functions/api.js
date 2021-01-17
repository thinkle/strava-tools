import strava from 'strava-v3';
import fetch from 'node-fetch';

const STRAVA_CLIENT_SECRET = process.env.strava_client_secret;
const STRAVA_CLIENT_ID = process.env.strava_client_id;

export async function handler (event, context) {
    let params = event.queryStringParameters;
    let jsonBody;
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
    if (params.code) {
        // get token!
        console.log('Get token from code',params.code)
        let token = await getToken(params.code)
        console.log('token=',token)
        return {
            statusCode : 200,
            body : JSON.stringify({
                token
            })
        }
    }
    console.log('fallback')
    return {
        statusCode : 200,
        body : JSON.stringify(
            {message:'Hello world',
             content : 'I echo params',
             params}
            )
    }
}

async function getToken (code) {
   /* curl -X POST https://www.strava.com/api/v3/oauth/token \
  -d client_id=ReplaceWithClientID \
  -d client_secret=ReplaceWithClientSecret \
  -d code=ReplaceWithCode \
  -d grant_type=authorization_code
  */
 console.log('Get me a token!');
 console.log('Secrets...',STRAVA_CLIENT_SECRET,STRAVA_CLIENT_ID)
    let response = await fetch(
        'https://www.strava.com/api/v3/oauth/token',
    {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(
            {
                client_id : STRAVA_CLIENT_ID,
                client_secret : STRAVA_CLIENT_SECRET,
                code : code,
                grant_type : 'authorization_code'

            }
        )
    }
    );
    let token = await response.json();
    return token;
}