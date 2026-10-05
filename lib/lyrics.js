const axios = require('axios');

// Konfigurasi Endpoint
const TARGET_URL = 'https://api.nexray.eu.cc/search/lyrics';

async function search(keyword) {
    if (!keyword) throw new Error("Keyword pencarian wajib diisi.");

    try {
        const response = await axios.get(TARGET_URL, {
            params: {
                q: keyword
            },
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = response.data;

        // Jika API mengembalikan array
        if (Array.isArray(data)) {
            return data.map(item => ({
                id: item.id,
                track: item.track || item.title || item.trackName,
                artist: item.artist || item.artistName,
                album: item.album || item.albumName,
                duration: item.duration,
                instrumental: item.instrumental,
                plainLyrics: item.plainLyrics || item.lyrics,
                syncedLyrics: item.syncedLyrics
            }));
        }

        // Jika API mengembalikan satu object
        if (data && typeof data === 'object') {
            return [{
                id: data.id,
                track: data.track || data.title || data.trackName,
                artist: data.artist || data.artistName,
                album: data.album || data.albumName,
                duration: data.duration,
                instrumental: data.instrumental,
                plainLyrics: data.plainLyrics || data.lyrics,
                syncedLyrics: data.syncedLyrics
            }];
        }

        return [];

    } catch (error) {
        if (error.response) {
            throw new Error(
                `Lyrics API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            );
        }

        throw new Error(`Lyrics Error: ${error.message}`);
    }
}

module.exports = { search };
