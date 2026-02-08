/**
 * @title Blackbox AI
 * @summary AI Chat dengan Konteks (History).
 * @description Berinteraksi dengan Blackbox AI yang mendukung percakapan berkelanjutan. Riwayat percakapan disimpan per user di Firebase dan otomatis dibersihkan jika tidak ada aktivitas selama 3 hari.
 * @method POST
 * @path /api/ai/blackbox
 * @response json
 * @param {string} body.message - Pesan dari pengguna.
 * @param {string} [body.userId] - ID unik pengguna (DeviceId/Username) untuk menyimpan riwayat chat.
 * @param {string} [body.system] - Instruksi sistem kustom untuk AI.
 * @example
 * async function chat() {
 *   const res = await fetch('/api/ai/blackbox', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ 
 *       "message": "Halo, siapa namamu?",
 *       "userId": "user-123",
 *       "system": "Kamu adalah asisten yang ramah."
 *     })
 *   });
 *   const data = await res.json();
 *   console.log(data.result.answer);
 * }
 */
const blackbox = require('../../blackbox');

const blackboxController = async (req) => {
    const { message, userId, system } = req.body;

    if (!message) {
        throw new Error("Parameter 'message' wajib diisi.");
    }

    const uid = userId || 'anonymous';
    const answer = await blackbox.chat(uid, message, system);

    return {
        success: true,
        author: 'PuruBoy',
        result: {
            userId: uid,
            answer: answer
        }
    };
};

module.exports = blackboxController;