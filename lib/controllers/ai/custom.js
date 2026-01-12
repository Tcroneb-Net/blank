/**
 * @title Custom AI Chat
 * @summary Custom AI Chat (A2).
 * @description Berinteraksi dengan model AI kustom seperti DeepSeek, Llama, dan MiniMax melalui A2 Agent.
 * @method POST
 * @path /api/ai/custom
 * @response json
 * @param {array} body.messages - Array objek pesan dengan format [{ role: "user", content: "..." }].
 * @param {string} [body.model] - Model AI (opsi: deepseek-coder-v2, llama3.1:8b, qwen2.5:1.5b, MiniMax-M2).
 * @param {number} [body.temperature] - Tingkat kreativitas (0.0 - 1.0).
 * @example
 * async function chat() {
 *   const res = await fetch('/api/ai/custom', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       messages: [{ role: "user", content: "Apa kabar?" }],
 *       model: "MiniMax-M2"
 *     })
 *   });
 *   const data = await res.json();
 *   console.log(data);
 * }
 */
const { a2Agent } = require('../../a2Agent');

const customAiController = async (req) => {
    const { messages, model, stream, temperature } = req.body;

    if (!messages) {
        throw new Error("Parameter 'messages' wajib diisi.");
    }

    const result = await a2Agent.chat({
        messages,
        model: model || "MiniMax-M2",
        stream: stream || false,
        temperature: temperature || 0.7
    });

    if (!result.success) {
        throw new Error(result.result.error || "Gagal menghubungi AI.");
    }

    return {
        success: true,
        author: 'PuruBoy',
        result: result.result
    };
};

module.exports = customAiController;