const axios = require('axios');

async function search(query) {
    const response = await axios.get(
        'https://api.nexray.eu.cc/category/search',
        {
            params: {
                q: query
            },
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        }
    );

    console.log('NEXRAY RESPONSE:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
}

module.exports = { search };
