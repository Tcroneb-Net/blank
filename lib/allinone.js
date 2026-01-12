const axios = require('axios');
const CryptoJS = require('crypto-js');
const qs = require('qs');
const cheerio = require('cheerio');

const BASE_URL = 'https://allinonedownloader.com';
const LANDING_PAGE = 'https://allinonedownloader.com/in/instagram-video-downloader.php';

const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
};

async function download(url) {
    if (!url) throw new Error("URL wajib diisi.");

    try {
        // 1. Request Halaman Utama untuk dapat Cookie & Token
        const pageResponse = await axios.get(LANDING_PAGE, { 
            headers: COMMON_HEADERS 
        });

        const rawCookies = pageResponse.headers['set-cookie'];
        let sessionCookieString = '';

        if (rawCookies) {
            sessionCookieString = rawCookies.map(cookie => cookie.split(';')[0]).join('; ');
        }

        const html = pageResponse.data;
        const $ = cheerio.load(html);

        const token = $('#token').val();
        const apiEndpoint = $('#scc').val();
        let jsPath = $('script[src*="main.js"]').attr('src');

        if (!token || !apiEndpoint || !jsPath) throw new Error('Gagal parsing konfigurasi dari halaman utama.');

        if (!jsPath.startsWith('http')) {
            jsPath = BASE_URL + (jsPath.startsWith('/') ? '' : '/') + jsPath;
        }

        // 2. Request File JS untuk dapat IV (Initialization Vector)
        const jsResponse = await axios.get(jsPath, { headers: COMMON_HEADERS });
        const jsCode = jsResponse.data;
        const ivMatch = jsCode.match(/var\s+iv\s*=\s*CryptoJS\.enc\.Hex\.parse\(['"]([a-f0-9]+)['"]\)/i);

        if (!ivMatch || !ivMatch[1]) throw new Error('Gagal menemukan IV di file JS.');
        const iv = ivMatch[1];

        // 3. Proses Enkripsi
        const keyHex = CryptoJS.enc.Hex.parse(token);
        const ivHex = CryptoJS.enc.Hex.parse(iv);

        const encrypted = CryptoJS.AES.encrypt(url, keyHex, {
            iv: ivHex,
            padding: CryptoJS.pad.ZeroPadding 
        });
        const urlHash = encrypted.toString();

        // 4. Kirim POST Request dengan COOKIE
        const payload = qs.stringify({
            url: url,
            token: token,
            urlhash: urlHash
        });

        const fullApiUrl = apiEndpoint.startsWith('http') ? apiEndpoint : BASE_URL + apiEndpoint;

        const apiResponse = await axios.post(fullApiUrl, payload, { 
            headers: {
                ...COMMON_HEADERS,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': BASE_URL,
                'Referer': LANDING_PAGE,
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': sessionCookieString
            }
        });

        const data = apiResponse.data;

        if (data === "sessionexpired") {
            throw new Error('Session Expired. Silakan coba lagi.');
        } 
        
        if (data.links && data.links.length > 0) {
            return {
                title: data.title,
                thumbnail: data.thumbnail,
                duration: data.duration,
                source: data.source,
                medias: data.links.map(link => ({
                    quality: link.quality,
                    format: link.type,
                    size: link.size,
                    url: link.url,
                    mute: link.mute
                }))
            };
        } else {
            throw new Error('Tidak ada media yang ditemukan atau link privat.');
        }

    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { download };