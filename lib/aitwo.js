const axios = require('axios');
const { uploadToTmp } = require('./uploader');

// Konfigurasi Target
const TARGET_URL = 'https://aitwo.co/api/tts';

// Header untuk meniru permintaan browser asli
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Content-Type': 'application/json',
    'Origin': 'https://aitwo.co',
    'Referer': 'https://aitwo.co/voice/indonesian-tts',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Priority': 'u=1, i'
};

const aitwo = {
    /**
     * Generate speech from text using Aitwo API
     * @param {string} text - Text to convert
     * @param {string} voiceModel - "id-ID-GadisNeural" or "id-ID-ArdiNeural"
     */
    generate: async (text, voiceModel = 'id-ID-GadisNeural') => {
        if (!text) throw new Error("Teks wajib diisi.");

        // Validasi dan set default voice
        // Pilihan: id-ID-GadisNeural (Wanita) atau id-ID-ArdiNeural (Pria)
        const voice = voiceModel === 'id-ID-ArdiNeural' ? 'id-ID-ArdiNeural' : 'id-ID-GadisNeural';

        const payload = {
            text: text,
            voice: voice,
            rate: "0",   // Kecepatan (-50 sampai 50)
            pitch: "0",  // Nada (-20 sampai 20)
            volume: "0"  // Volume (-50 sampai 50)
        };

        try {
            const response = await axios.post(TARGET_URL, payload, {
                headers: HEADERS,
                responseType: 'arraybuffer' // Ambil sebagai buffer untuk diupload ulang
            });

            // Upload buffer audio ke penyimpanan sementara
            const buffer = Buffer.from(response.data);
            const filename = `aitwo-${Date.now()}.mp3`;
            
            // Menggunakan uploader internal untuk mendapatkan URL proxy
            const audioUrl = await uploadToTmp(buffer, filename);

            return {
                voice: voice,
                url: audioUrl
            };

        } catch (error) {
            if (error.response) {
                throw new Error(`Aitwo API Error: ${error.response.status} - ${error.response.statusText}`);
            }
            throw new Error(`Aitwo Error: ${error.message}`);
        }
    }
};

module.exports = { aitwo };