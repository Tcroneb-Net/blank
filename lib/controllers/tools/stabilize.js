/**
 * @title Video Stabilizer
 * @summary Menstabilkan video goyang.
 * @description Memperbaiki kualitas video yang goyang (shaky) menggunakan filter AI Deshake. Proses ini dilakukan melalui komunikasi WebSocket ke worker eksternal.
 * @method POST
 * @path /api/tools/stabilize
 * @response json
 * @param {string} body.url - URL publik video MP4 yang ingin distabilkan.
 * @example
 * async function stabilizeVideo() {
 *   const res = await fetch('/api/tools/stabilize', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ "url": "https://files.catbox.moe/cqwce1.mp4" })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { stabilize } = require('../../stabilize');

const stabilizeController = async (req) => {
    const { url } = req.body;

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const resultUrl = await stabilize(url);

    return {
        success: true,
        author: 'PuruBoy',
        result: {
            url: resultUrl
        }
    };
};

module.exports = stabilizeController;