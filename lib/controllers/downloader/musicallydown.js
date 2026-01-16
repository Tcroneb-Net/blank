/**
 * @title TikTok DL V2
 * @summary TikTok Downloader (MusicallyDown).
 * @description Mengunduh video TikTok tanpa watermark menggunakan layanan MusicallyDown. Menyediakan beberapa pilihan link download video dan audio.
 * @method POST
 * @path /api/downloader/musicallydown
 * @response json
 * @param {string} body.url - URL video TikTok.
 * @example
 * async function dl() {
 *   const res = await fetch('/api/downloader/musicallydown', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ "url": "https://www.tiktok.com/@khaby.lame/video/7580406160730148118" })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const musicallydown = require('../../musicallydown');

const musicallydownController = async (req) => {
    const { url } = req.body;

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const result = await musicallydown.download(url);

    return {
        success: true,
        author: 'PuruBoy',
        result: result
    };
};

module.exports = musicallydownController;