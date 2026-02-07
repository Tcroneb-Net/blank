/**
 * @title Instagram Downloader (FastDL)
 * @summary Download IG Post, Reel, Story.
 * @description Mengunduh konten dari Instagram menggunakan FastDL. Mendukung Post, Reel, Photo, Story, dan Highlights.
 * @method POST
 * @path /api/downloader/fastdl
 * @response json
 * @param {string} body.url - URL konten Instagram.
 * @example
 * async function downloadIG() {
 *   const res = await fetch('/api/downloader/fastdl', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ "url": "https://www.instagram.com/reel/DOxOvd9jz6f/" })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const fastdl = require('../../fastdl');

const fastdlController = async (req) => {
    const { url } = req.body;

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const result = await fastdl.download(url);

    return {
        success: true,
        author: 'PuruBoy',
        result: result
    };
};

module.exports = fastdlController;