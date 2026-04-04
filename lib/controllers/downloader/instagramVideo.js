/**
 * @title Instagram Video/Reels
 * @summary Download Instagram Video or Reels.
 * @description Mengunduh video atau reels dari Instagram dengan metadata lengkap dan berbagai resolusi.
 * @method POST
 * @path /api/downloader/instagram/video
 * @response json
 * @param {string} body.url - URL video atau reels Instagram.
 * @example
 * async function downloadVideo() {
 *   const res = await fetch('/api/downloader/instagram/video', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ "url": "https://www.instagram.com/reel/C8..." })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { instagram } = require('../../instagram');

const instagramVideoController = async (req) => {
    const { url } = req.body;

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const result = await instagram.video(url);

    if (!result.status) {
        throw new Error(result.error || "Gagal mengambil data video Instagram.");
    }

    return {
        success: true,
        author: 'Shannz',
        result: result.result
    };
};

module.exports = instagramVideoController;