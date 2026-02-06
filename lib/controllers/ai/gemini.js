/**
 * @title Gemini AI Chat
 * @summary Chat via Google Gemini (Proxy).
 * @description Berinteraksi dengan Google Gemini menggunakan browser automation. Endpoint ini menggunakan Server-Sent Events (SSE) untuk mengirimkan status proses dan fakta unik selagi menunggu browser memproses permintaan (sekitar 15-20 detik).
 * @method POST
 * @path /api/ai/gemini
 * @response json
 * @param {string} body.prompt - Pertanyaan yang ingin diajukan ke Gemini.
 * @example
 * async function chatGemini() {
 *   const response = await fetch('/api/ai/gemini', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ "prompt": "Halo Gemini!" })
 *   });
 * 
 *   const reader = response.body.getReader();
 *   const decoder = new TextDecoder();
 *   
 *   while (true) {
 *     const { done, value } = await reader.read();
 *     if (done) break;
 *     const text = decoder.decode(value);
 *     console.log("Stream:", text);
 *   }
 * }
 */
const geminiController = async (req) => {
    return { status: 'SSE Stream Endpoint' };
};

module.exports = geminiController;