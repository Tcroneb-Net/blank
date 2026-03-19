/**
 * @title Donghua Search
 * @summary Pencarian Donghua.
 * @description Mencari judul donghua di Donghuafilm.
 * @method GET
 * @path /api/anime/donghua/search
 * @response json
 * @param {string} query.q - Kata kunci pencarian.
 * @param {number} [query.page] - Nomor halaman (default: 1).
 * @example
 * async function search() {
 *   const res = await fetch('/api/anime/donghua/search?q=Throne+of+Seal');
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { search } = require('../../donghua');

const donghuaSearchController = async (req) => {
    const { q, page } = req.query;
    const origin = req.origin || '';

    if (!q) {
        throw new Error("Parameter 'q' wajib diisi.");
    }

    const pageNum = page ? parseInt(page) : 1;
    const result = await search(q, pageNum, origin);

    return {
        success: true,
        author: 'PuruBoy',
        result: result
    };
};

module.exports = donghuaSearchController;