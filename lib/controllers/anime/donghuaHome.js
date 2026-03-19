/**
 * @title Donghua Home
 * @summary Beranda DonghuaFilm.
 * @description Mengambil data dari halaman utama Donghuafilm, termasuk slider, donghua populer hari ini, dan rilis terbaru.
 * @method GET
 * @path /api/anime/donghua/home
 * @response json
 * @param {number} [query.page] - Nomor halaman (default: 1).
 * @example
 * async function getHome() {
 *   const res = await fetch('/api/anime/donghua/home?page=1');
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { getHome } = require('../../donghua');

const donghuaHomeController = async (req) => {
    const { page } = req.query;
    const origin = req.origin || '';
    const pageNum = page ? parseInt(page) : 1;

    const result = await getHome(pageNum, origin);

    return {
        success: true,
        author: 'PuruBoy',
        result: result
    };
};

module.exports = donghuaHomeController;