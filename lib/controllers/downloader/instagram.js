/**
 * @title Instagram Downloader
 * @summary Download Instagram Media (Reels/Slide/Photo).
 * @description Mengunduh konten Instagram (Video, Reels, atau Carousel Slide) menggunakan VDFRDownloader.
 * @method POST
 * @path /api/downloader/instagram
 * @response json
 * @param {string} body.url - URL media Instagram.
 * @example
 * async function downloadIg() {
 *   const res = await fetch('/api/downloader/instagram', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ "url": "https://www.instagram.com/reel/DV5hrHUEg4U/" })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const VDFRDownloader = require('../../vdfr-downloader');

const instagramController = async (req) => {
    const { url } = req.body;

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const downloader = new VDFRDownloader();
    const downloadLink = await downloader.getDownloadLink(url);

    return {
        success: true,
        author: 'PuruBoy',
        result: {
            url: downloadLink
        }
    };
};

module.exports = instagramController;