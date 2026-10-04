const axios = require('axios');

/**
 * Search YouTube using Nexray API
 * @param {string} query - Search keyword
 */
async function search(query) {
    if (!query || typeof query !== 'string') {
        throw new Error('Query is required.');
    }

    const baseURL = 'https://api.nexray.eu.cc/search/youtube';

    try {
        const response = await axios.get(baseURL, {
            params: {
                q: query
            },
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        const data = response.data;

        console.log('Nexray status:', response.status);
        console.log('Nexray response:', JSON.stringify(data, null, 2));

        // API response should contain result
        const results = Array.isArray(data?.result)
            ? data.result
            : Array.isArray(data?.results)
                ? data.results
                : Array.isArray(data?.items)
                    ? data.items
                    : [];

        return results.map(item => ({
            title: item.title || '',
            description: item.description || '',

            channel:
                item.channel ||
                item.channelTitle ||
                item.author?.name ||
                '',

            channel_url:
                item.channel_url ||
                item.channelUrl ||
                item.author?.url ||
                '',

            type: item.type || 'video',

            id:
                item.id ||
                item.videoId ||
                '',

            duration:
                item.duration ||
                item.timestamp ||
                '',

            seconds:
                Number(item.seconds) ||
                Number(item.duration_seconds) ||
                0,

            views:
                item.views ||
                '',

            upload_at:
                item.upload_at ||
                item.uploadAt ||
                item.ago ||
                '',

            image_url:
                item.image_url ||
                item.thumbnail ||
                item.thumbnail_url ||
                (item.id
                    ? `https://i.ytimg.com/vi/${item.id}/hq720.jpg`
                    : ''),

            url:
                item.url ||
                (item.id
                    ? `https://youtube.com/watch?v=${item.id}`
                    : '')
        }));

    } catch (error) {
        console.error(
            'Nexray YouTube error:',
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'YouTube search failed'
        );
    }
}

module.exports = {
    search
};
