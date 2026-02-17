/**
 * @title Vidssave YouTube
 * @summary YouTube Downloader SD (Vidssave).
 * @description Mengunduh video atau audio YouTube dengan kualitas SD (360p/128kbps) melalui provider Vidssave. Menggunakan pemrosesan buffer untuk efisiensi serverless.
 * @method POST
 * @path /api/downloader/vidssave
 * @response json
 * @param {string} body.url - URL video YouTube yang valid.
 * @param {string} [body.mode] - Mode unduhan: 'mp4' atau 'mp3'. Default: 'mp4'.
 * @example
 * async function dl() {
 *   const res = await fetch('/api/downloader/vidssave', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ 
 *        "url": "https://www.youtube.com/watch?v=Fmf-G9fpwto",
 *        "mode": "mp4"
 *     })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { processDownload } = require('../../vidssave');

const vidssaveController = async (req) => {
    const { url, mode } = req.body;
    const origin = req.origin || '';

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const downloadMode = mode === 'mp3' ? 'mp3' : 'mp4';
    const result = await processDownload(url, downloadMode);

    return {
        success: true,
        author: 'PuruBoy',
        result: {
            ...result,
            downloadUrl: origin + result.downloadUrl
        }
    };
};

module.exports = vidssaveController;