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
        // exchange code for token        
        let token = await getToken(params.code)        
        return {
            statusCode : 200,
            body : JSON.stringify({
                token
            })
        }
    } 
    if (params.method='refresh') {
        let token = await refreshToken(params.token);        
        return {
            statusCode: 200,
            body : JSON.stringify({
                token
            })
        }
    }
}

let netlify_uri = process.env.NETLIFY_URL;
      
async function refreshToken (oldToken) {
/* 
Here's the code from Strava's documentation
curl -X POST https://www.strava.com/api/v3/oauth/token \
  -d client_id=ReplaceWithClientID \
  -d client_secret=ReplaceWithClientSecret \
  -d grant_type=refresh_token \
  -d refresh_token=ReplaceWithRefreshToken
*/
    let response = await fetch(
        'https://www.strava.com/api/v3/oauth/token',
        {
           method : 'POST',
           headers : { 
               'Content-Type' : 'application/json',
           },
           body : JSON.stringify(
               {
                client_id : STRAVA_CLIENT_ID,
                client_secret : STRAVA_CLIENT_SECRET,
                grant_type:'refresh_token',
                refresh_token:oldToken.refresh_token, 
               }
           )
        }
    );
    let token = await response.json();
    return token;
}

async function getToken (code) {
   /* 
   Here's the code from Strava's documentation:
   curl -X POST https://www.strava.com/api/v3/oauth/token \
  -d client_id=ReplaceWithClientID \
  -d client_secret=ReplaceWithClientSecret \
  -d code=ReplaceWithCode \
  -d grant_type=authorization_code
  */
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
                code,
                grant_type : 'authorization_code'
            }
        )
    }
    );
    let token = await response.json();
    return token;
}