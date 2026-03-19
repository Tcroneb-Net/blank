/**
 * @title Donghua Detail
 * @summary Detail Seri Donghua.
 * @description Mengambil informasi detail donghua beserta daftar episode.
 * @method GET
 * @path /api/anime/donghua/detail
 * @response json
 * @param {string} query.url - Path atau URL detail donghua.
 * @example
 * async function getDetail() {
 *   const res = await fetch('/api/anime/donghua/detail?url=/anime/throne-of-seal/');
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { getDetail } = require('../../donghua');

const donghuaDetailController = async (req) => {
    const { url } = req.query;
    const origin = req.origin || '';

    if (!url) {
        throw new Error("Parameter 'url' wajib diisi.");
    }

    const result = await getDetail(url, origin);

    return {
        success: true,
        author: 'PuruBoy',
        result: result
    };
};

module.exports = donghuaDetailController;