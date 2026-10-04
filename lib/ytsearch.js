const axios = require('axios');

/**
 * Search YouTube videos
 * @param {string} query - Search query
 */
async function search(query) {
    if (!query) {
        throw new Error('Query is required.');
    }

    const baseURL = 'https://api.nexray.eu.cc/category/search';

    try {
        const response = await axios.get(baseURL, {
            params: {
                q: query
            },
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 15000
        });

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));

        const data = response.data;

        // Support several common API response formats
        const items =
            data?.items ||
            data?.results ||
            data?.data ||
            [];

        if (!Array.isArray(items)) {
            console.log('Unexpected response format:', data);
            return [];
        }

        return items.map(item => ({
            title: item.title,
            description: item.description || '',
            channel: item.channel || item.channelTitle || '',
            channel_url: item.channel_url || item.channelUrl || '',
            type: item.type || 'video',
            id: item.id || item.videoId,
            duration: item.duration || '',
            seconds: item.seconds || 0,
            views: item.views || '',
            upload_at: item.upload_at || item.uploadAt || '',
            image_url:
                item.image_url ||
                item.thumbnail ||
                `https://i.ytimg.com/vi/${item.id || item.videoId}/hq720.jpg`,
            url:
                item.url ||
                `https://youtube.com/watch?v=${item.id || item.videoId}`
        }));

    } catch (error) {
        console.error(
            'Search error:',
            error.response?.data || error.message
        );

        throw error;
    }
}

module.exports = { search };
