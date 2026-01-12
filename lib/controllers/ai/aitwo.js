/**
 * @title Aitwo TTS
 * @summary Text to Speech (Indonesia).
 * @description Mengubah teks menjadi suara bahasa Indonesia yang natural menggunakan layanan Aitwo. Tersedia 2 model suara: Gadis (Wanita) dan Ardi (Pria).
 * @method POST
 * @path /api/ai/aitwo
 * @response json
 * @param {string} body.text - Teks yang akan diubah menjadi suara.
 * @param {string} [body.voice] - Model suara. Pilihan: "id-ID-GadisNeural" (Wanita - Default) atau "id-ID-ArdiNeural" (Pria).
 * @example
 * async function tts() {
 *   const res = await fetch('/api/ai/aitwo', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ 
 *       "text": "Halo, selamat datang di NextA API.",
 *       "voice": "id-ID-ArdiNeural"
 *     })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { aitwo } = require('../../aitwo');

const aitwoController = async (req) => {
    const { text, voice } = req.body;
    const origin = req.origin || '';

    if (!text) {
        throw new Error("Parameter 'text' wajib diisi.");
    }

    const result = await aitwo.generate(text, voice);

    return {
        success: true,
        author: 'PuruBoy',
        result: {
            ...result,
            url: origin + result.url // Menambahkan origin agar URL menjadi absolut
        }
    };
};

module.exports = aitwoController;