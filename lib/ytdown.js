const axios = require('axios');
const qs = require('qs');

/**
 * YTDown.to Automation Logic
 * Reverse Engineered for project integration
 */

const BASE_URL = 'https://ytdown.to';

const headers = {
    'authority': 'ytdown.to',
    'accept': '*/*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'origin': BASE_URL,
    'referer': `${BASE_URL}/id2/`,
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
};

async function download(url) {
    if (!url) throw new Error("URL wajib diisi.");

    try {
        // 1. Inisialisasi Session & Get Formats
        const step1 = await axios.post(`${BASE_URL}/proxy.php`, qs.stringify({
            url: url
        }), { headers });

        if (!step1.data.api || step1.data.api.status !== 'ok') {
            throw new Error(`Gagal mendapatkan info video: ${step1.data.api?.message || 'Unknown Error'}`);
        }

        const videoInfo = step1.data.api;
        const sessionCookie = step1.headers['set-cookie'];

        // Pilih Kualitas (HD/SD atau yang pertama tersedia)
        const selectedMedia = videoInfo.mediaItems.find(item => item.mediaQuality === 'HD' || item.mediaQuality === 'SD') || videoInfo.mediaItems[0];

        // 2. Record Cooldown
        await axios.post(`${BASE_URL}/cooldown.php`, qs.stringify({
            action: 'record'
        }), { 
            headers: { ...headers, 'cookie': sessionCookie } 
        });

        // 3. Polling / Trigger Download Link
        let isCompleted = false;
        let attempt = 1;
        let finalResult = null;

        while (!isCompleted) {
            const step3 = await axios.post(`${BASE_URL}/proxy.php`, qs.stringify({
                url: selectedMedia.mediaUrl
            }), { 
                headers: { ...headers, 'cookie': sessionCookie } 
            });

            const result = step3.data.api;

            if (result.status === 'completed') {
                isCompleted = true;
                finalResult = {
                    title: videoInfo.title,
                    duration: videoInfo.duration,
                    thumbnail: videoInfo.thumbnail,
                    quality: selectedMedia.mediaQuality,
                    resolution: selectedMedia.mediaRes,
                    size: result.fileSize,
                    download_url: result.fileUrl
                };
            } else {
                attempt++;
                if (attempt > 20) throw new Error("Timeout: Proses konversi terlalu lama.");
                // Tunggu 3 detik sebelum polling lagi
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        return finalResult;

    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { download };