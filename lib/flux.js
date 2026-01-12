const axios = require('axios');

async function generateFlux(prompt) {
    if (!prompt) {
        throw new Error('Parameter prompt diperlukan.');
    }

    try {
        const response = await axios.post('https://flux-image-gen-proxy.iskladchikov.workers.dev/', {
            prompt: prompt
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const data = response.data;

        // Penanganan respons berdasarkan format: { "success": true, "imageUrl": "...", "type": "..." }
        if (data.imageUrl) {
            return {
                success: true,
                result: {
                    url: data.imageUrl,
                    prompt: prompt,
                    type: data.type || 'text-to-image'
                }
            };
        }

        // Fallback jika API mengembalikan error dalam JSON
        if (data.success === false || data.error) {
            throw new Error(data.error || 'Gagal menghasilkan gambar (API Error).');
        }

        throw new Error('Respons API tidak mengandung imageUrl yang valid.');

    } catch (error) {
        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error(error.message || 'Internal Error');
    }
}

module.exports = { generateFlux };