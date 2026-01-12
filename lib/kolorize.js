const axios = require('axios');
const FormData = require('form-data');
const { uploadToTmp } = require('./uploader');

// --- KONFIGURASI UTAMA ---
const BASE_URL = 'https://kolorize.cc';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.171 Mobile Safari/537.36';

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'User-Agent': USER_AGENT,
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/`,
        'sec-ch-ua': '"Chromium";v="142", "Android WebView";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'Accept': '*/*',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    withCredentials: true 
});

function extractOutputKey(bufferString) {
    if (bufferString.includes('"outputKey"')) {
        const keyIndex = bufferString.lastIndexOf('"outputKey"');
        const valueStartIndex = bufferString.indexOf('"', keyIndex + 11) + 1;
        const valueEndIndex = bufferString.indexOf('"', valueStartIndex);

        if (valueStartIndex > 0 && valueEndIndex > valueStartIndex) {
            return bufferString.substring(valueStartIndex, valueEndIndex);
        }
    }
    return null;
}

const kolorize = {
    process: async (url) => {
        try {
            // 1. Download image from URL
            const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
            const imgBuffer = Buffer.from(imgRes.data);

            // 2. Upload to Kolorize
            const form = new FormData();
            form.append('files', imgBuffer, 'image.jpg');

            const uploadRes = await client.post('/api/upload', form, {
                headers: { ...form.getHeaders() }
            });

            if (!uploadRes.data?.results?.[0]) {
                throw new Error('Gagal upload ke Kolorize.');
            }

            const { sourceKey, w, h } = uploadRes.data.results[0];

            // 3. Create Ticket
            const ticketPayload = {
                "type": "colorize_v3",
                "fnKey": sourceKey,
                "w": w,
                "h": h,
                "prompt": "",
                "tries": 0,
                "seq": 0,
                "dpi": 72,
                "vst": "c782861c666f2623b97ef93b54c8d1c6" 
            };

            const ticketRes = await client.post('/ticket', ticketPayload);
            const ticketId = ticketRes.data?.ticket;
            if (!ticketId) throw new Error('Gagal membuat tiket processing.');

            // 4. Wait for Processing (SSE)
            const outputKey = await new Promise(async (resolve, reject) => {
                try {
                    const response = await client.get(`/ticket`, {
                        params: { ticket: ticketId },
                        responseType: 'stream',
                        headers: {
                            'Accept': 'text/event-stream',
                            'Cache-Control': 'no-cache'
                        },
                        timeout: 60000 
                    });

                    const stream = response.data;
                    let buffer = '';
                    let isResolved = false;

                    stream.on('data', (chunk) => {
                        buffer += chunk.toString();
                        const key = extractOutputKey(buffer);
                        if (key) {
                            isResolved = true;
                            stream.destroy();
                            resolve(key);
                        }
                    });

                    stream.on('end', () => {
                        if (!isResolved) {
                            const key = extractOutputKey(buffer);
                            if (key) resolve(key);
                            else reject(new Error('Processing timeout or failed (No Output Key).'));
                        }
                    });

                    stream.on('error', (err) => {
                        if (!isResolved) reject(err);
                    });
                } catch (e) {
                    reject(e);
                }
            });

            // 5. Lookup & Retrieve Result
            const lookupPayload = {
                "keyOrUrl": outputKey,
                "mode": 1, 
                "r": 1,
                "forceH": 0
            };

            const lookupRes = await client.post('/api/lookup', lookupPayload);
            if (!lookupRes.data?.imgUrl) throw new Error('Gagal mengambil hasil gambar.');

            const base64Data = lookupRes.data.imgUrl.replace(/^data:image\/\w+;base64,/, "");
            const resultBuffer = Buffer.from(base64Data, 'base64');

            // 6. Upload to public host (via uploader service)
            const publicUrl = await uploadToTmp(resultBuffer, `kolorize-${Date.now()}.jpg`);

            return {
                success: true,
                image: publicUrl
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
};

module.exports = { kolorize };