/**
 * @title SoundCloud DL
 * @summary Download lagu dari SoundCloud.
 * @description Mengunduh file audio (MP3) dari SoundCloud menggunakan layanan pihak ketiga. Endpoint ini mengembalikan judul lagu dan URL unduhan langsung.
 * @method POST
 * @path /api/downloader/soundcloud
 * @response json
 * @param {string} body.url - URL lagu SoundCloud yang ingin diunduh.
 * @example
 * async function downloadSC() {
 *   try {
 *     const response = await fetch('/api/downloader/soundcloud', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ 
 *         "url": "https://soundcloud.com/marissa-puteri/dj-the-drum-x-ya-odna-tik-tok" 
 *       })
 *     });
 * 
 *     const data = await response.json();
 *     console.log(data);
 *   } catch (error) {
 *     console.error('Error:', error.message);
 *   }
 * }
 * 
 * downloadSC();
 */
const { downloadSoundCloud } = require('../../soundcloud');

const soundcloudController = async (req) => {
    const { url } = req.body;

    if (!url) {
        throw new Error("Parameter 'url' must be filled.");
    }

    const result = await downloadSoundCloud(url);

    return {
        success: true,
        author: 'Hostify_Tech',
        result: result
    };
};

module.exports = soundcloudController;
