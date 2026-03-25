/**
 * @title Search Autocomplete
 * @summary Get search suggestions.
 * @description Mendapatkan daftar saran kata kunci pencarian (autocomplete) berdasarkan input pengguna. Fitur ini menggunakan engine Google Suggest.
 * @method GET
 * @path /api/search/suggest
 * @response json
 * @param {string} query.q - Kata kunci atau awalan kalimat.
 * @example
 * async function getSuggestions() {
 *   const res = await fetch('/api/search/suggest?q=apa+itu');
 *   const data = await res.json();
 *   console.log(data.result);
 * }
 */
const { suggest } = require('../../googleSuggest');

const suggestController = async (req) => {
    const { q } = req.query;

    if (!q) {
        throw new Error("Parameter 'q' must be filled.");
    }

    const result = await suggest(q);

    return {
        success: true,
        author: 'Hostify_Tech',
        result: result
    };
};

module.exports = suggestController;
