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
    if (params.method='refresh') {
        let token = await refreshToken(params.token);
        console.log('new token=',token);
        return {
            statusCode: 200,
            body : JSON.stringify({
                token
            })
        }
    }
    if (params.method='getAthlete' && params.token) {
        let athlete = await getAthlete(params.token);
        return athlete;
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
let netlify_uri = process.env.NETLIFY_URL;
let loginUri = `http://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${netlify_uri}/&approval_prompt=force&scope=read`
      
async function getAthlete (token) {
    strava.config({
        access_token : token,
        client_id : STRAVA_CLIENT_ID,
        client_secret : STRAVA_CLIENT_SECRET,
        redirect_uri :   loginUri,
    })
    let defaultClient = strava.ApiClient.instance;
    let strava_oauth = defaultClient.authentications['strava_oauth'];
    strava_oauth.accessToken = token;
    let athlete = await api.getLoggedInAthlete();
    return athlete;
}
async function refreshToken (oldToken) {
/* curl -X POST https://www.strava.com/api/v3/oauth/token \
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
   /* curl -X POST https://www.strava.com/api/v3/oauth/token \
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
                code : code,
                grant_type : 'authorization_code'

            }
        )
    }
    );
    let token = await response.json();
    return token;
}