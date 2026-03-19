/**
 * @title Donghua Stream
 * @summary Link Streaming & Download Donghua.
 * @description Mengambil data pemutar video (iframe) dan link download untuk episode donghua.
 * @method GET
 * @path /api/anime/donghua/stream
 * @response json
 * @param {string} query.url - Path atau URL episode donghua.
 * @example
 * async function getStream() {
 *   const res = await fetch('/api/anime/donghua/stream?url=/throne-of-seal-episode-114-subtitle-indonesia/');
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { getStream } = require('../../donghua');

const donghuaStreamController = async (req) => {
    const { url } = req.query;
    const origin = req.origin || '';

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const result = await getStream(url, origin);

    return {
        success: true,
        author: 'PuruBoy',
        result: result
    };
};

module.exports = donghuaStreamController;