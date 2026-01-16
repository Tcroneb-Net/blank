const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('querystring');

/**
 * TikTok Downloader via MusicallyDown
 * Scraper logic reconstructed.
 */
async function download(tiktokUrl) {
    const BASE_URL = 'https://musicaldown.com';
    const client = axios.create({
        baseURL: BASE_URL,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Referer': BASE_URL + '/en',
            'Origin': BASE_URL,
        }
    });

    try {
        // STEP 1: Ambil halaman utama untuk mendapatkan Token dan Nama Field Dinamis
        const homePage = await client.get('/en');
        const $ = cheerio.load(homePage.data);
        const setCookie = homePage.headers['set-cookie'];

        // Ekstrak nama field dan value dari form
        const inputUrlName = $('input[name^="_"]').first().attr('name'); // Biasanya diawali underscore
        const inputTokenName = $('input[type="hidden"]').eq(0).attr('name');
        const inputTokenValue = $('input[type="hidden"]').eq(0).val();
        const verifyValue = $('input[name="verify"]').val();

        if (!inputUrlName || !inputTokenValue) {
            throw new Error('Gagal mengekstrak token keamanan. Situs mungkin telah memperbarui strukturnya.');
        }

        // STEP 2: Kirim Request POST untuk mendapatkan halaman hasil download
        const payload = {
            [inputUrlName]: tiktokUrl,
            [inputTokenName]: inputTokenValue,
            'verify': verifyValue
        };

        const response = await client.post('/download', qs.stringify(payload), {
            headers: {
                'Cookie': setCookie ? setCookie.join('; ') : '',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // STEP 3: Parsing hasil (Link Video)
        const $result = cheerio.load(response.data);
        const results = [];

        $result('a.btn.waves-effect.waves-light.orange').each((i, el) => {
            const link = $result(el).attr('href');
            const text = $result(el).text().trim();
            if (link && link !== '#') {
                results.push({ type: text, url: link });
            }
        });

        if (results.length === 0) {
            throw new Error('Video tidak ditemukan atau URL salah.');
        }

        return results;

    } catch (error) {
        throw new Error(error.response ? `Status ${error.response.status}` : error.message);
    }
}

module.exports = { download };