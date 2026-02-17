const axios = require('axios');
const qs = require('qs');
const EventSource = require('eventsource');
const { uploadToTmp } = require('./uploader');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://vidssave.com/',
    'Origin': 'https://vidssave.com'
};

const CONFIG = {
    AUTH: "20250901majwlqo",
    DOMAIN: "api-ak.vidssave.com",
    BASE_API: "https://api.vidssave.com/api/contentsite_api",
    BASE_SSE: "https://api.vidssave.com/sse/contentsite_api"
};

async function parseVideo(videoUrl) {
    const payload = qs.stringify({ auth: CONFIG.AUTH, domain: CONFIG.DOMAIN, origin: "source", link: videoUrl });
    const response = await axios.post(`${CONFIG.BASE_API}/media/parse`, payload, { headers: HEADERS });
    if (!response.data.data) throw new Error("Gagal menganalisis video.");
    return response.data.data;
}

async function createDownloadTask(resourceContent) {
    const payload = qs.stringify({ auth: CONFIG.AUTH, domain: CONFIG.DOMAIN, request: resourceContent, no_encrypt: 1 });
    const response = await axios.post(`${CONFIG.BASE_API}/media/download`, payload, { headers: HEADERS });
    if (!response.data.data) throw new Error("Server sibuk atau resource tidak valid.");
    return response.data.data.task_id;
}

function monitorTask(taskId) {
    return new Promise((resolve, reject) => {
        const sseUrl = `${CONFIG.BASE_SSE}/media/download_query?auth=${CONFIG.AUTH}&domain=${CONFIG.DOMAIN}&task_id=${encodeURIComponent(taskId)}&download_domain=vidssave.com&origin=content_site`;
        const es = new EventSource(sseUrl, { headers: HEADERS });
        
        const timeout = setTimeout(() => {
            es.close();
            reject(new Error("Timeout saat memantau konversi."));
        }, 60000);

        es.addEventListener('success', (e) => {
            clearTimeout(timeout);
            const data = JSON.parse(e.data);
            es.close();
            resolve(data.download_link);
        });

        es.onerror = () => { 
            clearTimeout(timeout);
            es.close(); 
            reject(new Error("Gagal memantau konversi (SSE)")); 
        };
    });
}

async function downloadToBuffer(url) {
    const response = await axios({ url, method: 'GET', responseType: 'arraybuffer', headers: HEADERS });
    return Buffer.from(response.data);
}

/**
 * @param {string} url - URL YouTube
 * @param {string} mode - 'mp4' atau 'mp3'
 */
async function processDownload(url, mode = "mp4") {
    try {
        const videoData = await parseVideo(url);

        let resource;
        if (mode === "mp3") {
            resource = videoData.resources.find(r => r.type === "audio" && r.quality === "128KBPS") 
                       || videoData.resources.find(r => r.type === "audio");
        } else {
            resource = videoData.resources.find(r => r.type === "video" && r.quality === "360P") 
                       || videoData.resources.find(r => r.type === "video" && r.quality === "480P")
                       || videoData.resources.find(r => r.type === "video");
        }

        if (!resource) throw new Error("Kualitas media tidak ditemukan.");

        const taskId = await createDownloadTask(resource.resource_content);
        const redirectLink = await monitorTask(taskId);

        const buffer = await downloadToBuffer(redirectLink);
        const ext = mode === "mp3" ? "mp3" : "mp4";
        const fileName = `vidssave_${Date.now()}.${ext}`;
        
        const shareLink = await uploadToTmp(buffer, fileName);

        return {
            title: videoData.title,
            quality: resource.quality,
            mode: mode.toUpperCase(),
            downloadUrl: shareLink
        };

    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { processDownload };