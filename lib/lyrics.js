const axios = require('axios');

const TARGET_URL = 'https://api.nexray.eu.cc/search/lyrics';

async function search(keyword) {
    if (!keyword) {
        throw new Error("Keyword pencarian wajib diisi.");
    }

    try {
        const response = await axios.get(TARGET_URL, {
            params: {
                q: keyword
            },
            headers: {
                Accept: 'application/json'
            }
        });

        const data = response.data;

        if (!data || data.status !== true || !data.result) {
            return [];
        }

        const result = data.result;
        const lyrics = result.lyrics;

        if (!lyrics) {
            return [];
        }

        return [{
            id: lyrics.id,
            track: lyrics.track_name || result.title,
            artist: lyrics.artist_name || result.artist,
            album: lyrics.album_name || null,
            duration: lyrics.duration || 0,
            instrumental: lyrics.instrumental,
            plainLyrics: lyrics.plain_lyrics || null,
            syncedLyrics: lyrics.synced_lyrics || null
        }];

    } catch (error) {
        if (error.response) {
            throw new Error(
                `Lyrics API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            );
        }

        throw new Error(`Lyrics Error: ${error.message}`);
    }
}

module.exports = {
    search
};
