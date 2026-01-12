/**
 * @title Typli Chat
 * @summary Chat AI Typli (GPT-4.1 Mini).
 * @description Berinteraksi dengan model GPT-4.1 Mini melalui Typli.ai. Mendukung riwayat percakapan yang disimpan otomatis selama 24 jam di database.
 * @method POST
 * @path /api/ai/typli
 * @response json
 * @param {string} body.user - ID Pengguna (User ID / Session ID) untuk mengelola riwayat percakapan.
 * @param {string} body.prompt - Pesan yang ingin dikirim ke AI.
 * @param {string} [body.system] - Prompt sistem untuk mengatur perilaku AI (Opsional).
 * @param {number} [body.historyLength] - Batas jumlah pesan dalam riwayat percakapan (Default: 11).
 * @example
 * async function chatTypli() {
 *   try {
 *     const response = await fetch('/api/ai/typli', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ 
 *         "user": "user-session-123",
 *         "prompt": "Buatkan puisi tentang hujan",
 *         "system": "Kamu adalah penyair handal",
 *         "historyLength": 10
 *       })
 *     });
 * 
 *     const data = await response.json();
 *     console.log(data);
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * }
 * 
 * chatTypli();
 */
const { chatWithHistory } = require('../../typli');

const typliController = async (req) => {
    const { user, prompt, system, historyLength } = req.body;

    if (!user) {
        throw new Error("Parameter 'user' (Session ID) wajib diisi untuk mengelola history.");
    }
    if (!prompt) {
        throw new Error("Parameter 'prompt' wajib diisi.");
    }

    const result = await chatWithHistory({
        sessionId: user,
        prompt,
        system,
        historyLength: historyLength || 11
    });

    return {
        success: true,
        author: 'PuruBoy',
        result: result
    };
};

module.exports = typliController;