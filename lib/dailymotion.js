const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const TARGET_PAGE = 'https://www.dailymotion.com/video/x8apwmw';
const GQL_ENDPOINT = 'https://graphql.api.dailymotion.com';
const AUTH_URL = 'https://graphql.api.dailymotion.com/oauth/token';

const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.dailymotion.com',
    'Referer': 'https://www.dailymotion.com/'
};

async function fetchLatestCredentials() {
    try {
        const { data: html } = await client.get(TARGET_PAGE, { headers: COMMON_HEADERS });

        const jsUrlMatch = html.match(/src="([^"]+?\/app\.[a-z0-9]+\.js)"/);
        if (!jsUrlMatch) throw new Error('File app.js tidak ditemukan');

        let fullJsUrl = jsUrlMatch[1].startsWith('//') ? 'https:' + jsUrlMatch[1] : jsUrlMatch[1];

        const { data: jsCode } = await axios.get(fullJsUrl);
        const idMatch = jsCode.match(/apiClientId\(\)\{return"([a-z0-9]+)"\}/) || jsCode.match(/apiClientId:function\(\)\{return"([a-z0-9]+)"\}/);
        const secretMatch = jsCode.match(/apiClientSecret\(\)\{return"([a-z0-9]+)"\}/) || jsCode.match(/apiClientSecret:function\(\)\{return"([a-z0-9]+)"\}/);

        if (!idMatch || !secretMatch) throw new Error('Gagal mengekstrak ID/Secret API.');

        return { clientId: idMatch[1], clientSecret: secretMatch[1] };
    } catch (error) {
        throw new Error(`Gagal update kredensial: ${error.message}`);
    }
}

async function getAccessToken(creds) {
    try {
        const authPayload = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');

        const response = await client.post(AUTH_URL, params, {
            headers: {
                ...COMMON_HEADERS,
                'Authorization': `Basic ${authPayload}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data.access_token;
    } catch (error) {
        throw new Error(`OAuth Error: ${error.message}`);
    }
}

async function getVideoInfo(url) {
    const idMatch = url.match(/video\/([a-zA-Z0-9]+)/);
    const videoId = idMatch ? idMatch[1] : url.split('/').pop();

    const creds = await fetchLatestCredentials();
    const token = await getAccessToken(creds);

    const gqlBody = {
        query: `
            query GetVideoData($xid: String!) {
                video(xid: $xid) {
                    xid
                    title
                    description
                    duration
                    viewCount
                    thumbnail(height: PORTRAIT_240) {
                        url
                    }
                    channel {
                        displayName
                    }
                    createdAt
                }
            }
        `,
        variables: { xid: videoId }
    };

    const response = await client.post(GQL_ENDPOINT, gqlBody, {
        headers: {
            ...COMMON_HEADERS,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
    }

    const video = response.data.data.video;
    const playerUrl = `https://www.dailymotion.com/player/metadata/video/${videoId}`;
    const { data: metadata } = await client.get(playerUrl, { headers: COMMON_HEADERS });

    const streamUrl = metadata.qualities?.['auto']?.[0]?.url || 
                     metadata.qualities?.['720']?.[0]?.url ||
                     metadata.qualities?.['480']?.[0]?.url;

    const cookies = await jar.getSetCookieStrings(TARGET_PAGE);

    return {
        ...video,
        streamUrl,
        cookies
    };
}

module.exports = { getVideoInfo };