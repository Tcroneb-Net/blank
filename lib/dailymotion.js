const axios = require('axios');

const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
};

async function getVideoInfo(url) {
    try {
        const idMatch = url.match(/video\/([a-zA-Z0-9]+)/);
        const videoId = idMatch ? idMatch[1] : url.split('/').pop();

        // Menggunakan API publik Dailymotion untuk mendapatkan metadata dasar
        const apiUrl = `https://api.dailymotion.com/video/${videoId}?fields=title,thumbnail_720_url,owner.screenname,duration`;
        const { data: videoData } = await axios.get(apiUrl, { headers: COMMON_HEADERS });

        if (videoData.error) {
            throw new Error(videoData.error.message);
        }

        // Untuk stream URL, kita menggunakan URL player metadata yang biasanya tidak memerlukan cookie ketat untuk 'auto' quality
        // atau kita bisa arahkan ke m3u8 player link yang lebih publik.
        const playerUrl = `https://www.dailymotion.com/player/metadata/video/${videoId}`;
        const { data: metadata } = await axios.get(playerUrl, { headers: COMMON_HEADERS });

        // Mencari stream URL dari metadata player
        let streamUrl = '';
        if (metadata.qualities) {
            const qualities = ['auto', '1080', '720', '480', '380', '240'];
            for (const q of qualities) {
                if (metadata.qualities[q] && metadata.qualities[q].length > 0) {
                    streamUrl = metadata.qualities[q][0].url;
                    break;
                }
            }
        }

        return {
            xid: videoId,
            title: videoData.title,
            thumbnail: { url: videoData.thumbnail_720_url },
            channel: { displayName: videoData['owner.screenname'] },
            duration: videoData.duration,
            streamUrl: streamUrl
        };
    } catch (error) {
        throw new Error(`Dailymotion API Error: ${error.message}`);
    }
}

module.exports = { getVideoInfo };