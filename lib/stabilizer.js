const axios = require('axios');
const FormData = require('form-data');

/**
 * AI Video Stabilizer Service
 * Based on ricky01anjay-stabilizer HF Space
 */
async function stabilizeVideo(videoUrl) {
    try {
        // 1. Download source video
        const videoRes = await axios.get(videoUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000 
        });
        const videoBuffer = Buffer.from(videoRes.data);

        // 2. Prepare FormData
        const form = new FormData();
        form.append('file', videoBuffer, {
            filename: 'input.mp4',
            contentType: 'video/mp4'
        });

        // 3. Post to Stabilizer API
        const response = await axios.post('https://ricky01anjay-stabilizer.hf.space/stabilize', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.7632.120 Mobile Safari/537.36',
                'origin': 'https://ricky01anjay-stabilizer.hf.space',
                'referer': 'https://ricky01anjay-stabilizer.hf.space/',
                'x-requested-with': 'mark.via.gp'
            },
            responseType: 'arraybuffer',
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 300000 // 5 Minutes timeout for rendering
        });

        return Buffer.from(response.data);
    } catch (error) {
        if (error.response) {
            throw new Error(`Stabilizer API Error: ${error.response.status}`);
        }
        throw new Error(`Stabilizer Error: ${error.message}`);
    }
}

module.exports = { stabilizeVideo };