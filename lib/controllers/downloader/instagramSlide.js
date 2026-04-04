/**
 * @title Instagram Slide/Carousel
 * @summary Download Instagram Slide or Single Image.
 * @description Mengunduh postingan carousel/slide gambar atau gambar tunggal dari Instagram lengkap dengan metadatanya.
 * @method POST
 * @path /api/downloader/instagram/slide
 * @response json
 * @param {string} body.url - URL postingan Instagram (Slide/Image).
 * @example
 * async function downloadSlide() {
 *   const res = await fetch('/api/downloader/instagram/slide', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ "url": "https://www.instagram.com/p/C9..." })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { instagram } = require('../../instagram');

const instagramSlideController = async (req) => {
    const { url } = req.body;

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const result = await instagram.slide(url);

    if (!result.status) {
        throw new Error(result.error || "Gagal mengambil data slide Instagram.");
    }

    return {
        success: true,
        author: 'Shannz',
        result: result.result
    };
};

module.exports = instagramSlideController;