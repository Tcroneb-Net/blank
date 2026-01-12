/**
 * @title Instagram DL
 * @summary Download Instagram (Video/Reels).
 * @description Mengunduh konten dari Instagram (Video, Reels, Post) menggunakan AllInOneDownloader.
 * @method POST
 * @path /api/downloader/instagram
 * @response json
 * @param {string} body.url - URL konten Instagram.
 * @example
 * async function downloadIG() {
 *   const res = await fetch('/api/downloader/instagram', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ "url": "https://www.instagram.com/reel/DOxOvd9jz6f/" })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { download } = require('../../allinone');

const instagramController = async (req) => {
    const { url } = req.body;

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const result = await download(url);

    return {
        success: true,
        author: 'PuruBoy',
        result: result
    };
};

module.exports = instagramController;