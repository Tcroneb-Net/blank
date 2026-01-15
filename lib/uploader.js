const axios = require('axios');
const FormData = require('form-data');
const { encrypt } = require('./crypto');

/**
 * Upload file ke layanan sementara (puruh2o-backend.hf.space).
 * Mengembalikan URL Proxy terenkripsi (/api/media/...).
 */
async function uploadToTmp(buffer, filename = 'image.png') {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('Input harus berupa Buffer.');
    }

    const form = new FormData();
    form.append("media", buffer, filename);

    try {
        const response = await axios.post("https://puruh2o-backend.hf.space/upload", form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;
        
        // Format response HTML: <a href="/uploads/xxx.jpg">Lihat File</a>
        const match = html.match(/href="(\/uploads\/[^"]+)"/);
        
        if (!match || !match[1]) {
            throw new Error('Gagal memparsing respons dari server upload.');
        }

        const relativePath = match[1];
        const realUrl = `https://puruh2o-backend.hf.space${relativePath}`;
        
        // Encrypt URL dan kembalikan Path Proxy relatif
        const encrypted = encrypt(realUrl);
        const proxyUrl = `/api/media/${encrypted}`;
        
        return proxyUrl;

    } catch (error) {
        if (error.response) {
            throw new Error(`Uploader Error: Upload failed with status ${error.response.status} - ${error.response.statusText || 'Server Error'}`);
        }
        throw new Error(`Uploader Error: ${error.message}`);
    }
}

/**
 * Upload file ke tmpfiles.org
 * Mengembalikan URL download langsung.
 */
async function uploadToTmpFiles(buffer, filename = 'video.mp4') {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('Input harus berupa Buffer.');
    }

    const form = new FormData();
    form.append('file', buffer, filename);

    try {
        const response = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.data.status === 'success' && response.data.data.url) {
            // Tmpfiles returns a view URL, we need to convert it to a download URL
            // View URL: https://tmpfiles.org/123/file.mp4
            // Download URL: https://tmpfiles.org/dl/123/file.mp4
            const url = response.data.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
            
            // Encrypt URL dan kembalikan Path Proxy relatif
            const encrypted = encrypt(url);
            return `/api/media/${encrypted}`;
        }
        throw new Error('Gagal mengupload ke tmpfiles.org');
    } catch (error) {
        throw new Error(`TmpFiles Uploader Error: ${error.message}`);
    }
}

module.exports = { uploadToTmp, uploadToTmpFiles };