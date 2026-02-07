const axios = require('axios');
const crypto = require('crypto');

/**
 * FASTDL UNIVERSAL DOWNLOADER
 * Mendukung: Post, Reel, Photo, Story, & Highlights
 */

const CONFIG = {
    secretKeyHex: '34ac9a1aa6aaa7d69a7075611898f16a85d496b1d8f1c7aaa5640a2d93d7af80',
    appVersionTS: '1770240123231', 
    userAgent: 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.7559.109 Mobile Safari/537.36'
};

async function download(igUrl) {
    if (!igUrl) throw new Error("URL wajib diisi.");

    // 1. Deteksi Mode
    const isStory = igUrl.includes('/stories/');

    // 2. Normalisasi URL untuk Signature
    let cleanUrl = igUrl.split('?')[0];
    if (!cleanUrl.endsWith('/')) cleanUrl += '/';

    try {
        // A. AMBIL SESI (COOKIE)
        const homeRes = await axios.get('https://fastdl.app/id', { headers: { 'User-Agent': CONFIG.userAgent } });
        const cookieStr = homeRes.headers['set-cookie'] ? homeRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') : '';

        // B. SINKRONISASI WAKTU
        const msecRes = await axios.get('https://fastdl.app/msec', { headers: { 'User-Agent': CONFIG.userAgent, 'Cookie': cookieStr } });
        const serverTime = Math.floor(msecRes.data.msec * 1000);
        const ts = serverTime - 450; 

        // C. GENERATE SIGNATURE
        let signatureSource;
        if (isStory) {
            signatureSource = JSON.stringify({ url: cleanUrl }) + ts;
        } else {
            signatureSource = cleanUrl + ts;
        }

        const signature = crypto.createHmac('sha256', Buffer.from(CONFIG.secretKeyHex, 'hex'))
            .update(signatureSource)
            .digest('hex');

        // D. EKSEKUSI REQUEST BERDASARKAN MODE
        let response;
        if (isStory) {
            response = await axios.post('https://api-wh.fastdl.app/api/v1/instagram/story', {
                url: cleanUrl,
                ts: ts,
                _ts: CONFIG.appVersionTS,
                _tsc: 0,
                _sv: 2,
                _s: signature
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': CONFIG.userAgent,
                    'Origin': 'https://fastdl.app',
                    'Referer': 'https://fastdl.app/id/story-saver',
                    'Cookie': cookieStr
                }
            });
        } else {
            const params = new URLSearchParams();
            params.append('sf_url', cleanUrl);
            params.append('ts', ts);
            params.append('_ts', CONFIG.appVersionTS);
            params.append('_tsc', '0');
            params.append('_sv', '2');
            params.append('_s', signature);

            response = await axios.post('https://api-wh.fastdl.app/api/convert', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'User-Agent': CONFIG.userAgent,
                    'Origin': 'https://fastdl.app',
                    'Referer': 'https://fastdl.app/id',
                    'Cookie': cookieStr
                }
            });
        }

        const data = response.data;

        if (isStory) {
            if (data.result && data.result.length > 0) {
                return data.result.map(item => ({
                    thumbnail: item.image_versions2?.candidates?.[0]?.url_downloadable,
                    url: item.video_versions?.[0]?.url_downloadable || item.image_versions2?.candidates?.[0]?.url_downloadable,
                    type: item.video_versions ? 'video' : 'image'
                }));
            } else {
                throw new Error("Story tidak ditemukan atau akun private.");
            }
        } else {
            if (data.url && data.url.length > 0) {
                return data.url.map(item => ({
                    url: item.url,
                    thumbnail: item.thumb,
                    type: item.type === 'video' ? 'video' : 'image',
                    title: item.title
                }));
            } else {
                throw new Error("Post tidak ditemukan.");
            }
        }

    } catch (e) {
        throw new Error(e.response?.data?.message || e.message);
    }
}

module.exports = { download };