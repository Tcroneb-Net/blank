const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Mengambil respon dari Gemini menggunakan Remote Browser Automation.
 * @param {string} prompt - Pertanyaan pengguna.
 * @returns {Promise<string>} - Jawaban AI.
 */
async function askGemini(prompt) {
    const API_URL = 'https://puruh2o-gabutcok.hf.space/execute';
    const cleanPrompt = prompt.replace(/["\\]/g, '\\$&').replace(/\n/g, '\\n');

    const payload = {
        url: "https://gemini.google.com",
        viewport: "mobile",
        code: `
            const FIREBASE_URL = 'https://puru-tools-default-rtdb.firebaseio.com/cookies.json';
            const INPUT_SELECTOR = '.text-input-field_textarea';
            const SEND_BUTTON = '.send-button';
            const PROMPT_TEXT = "${cleanPrompt}";

            async function executeAction() {
                try {
                    // 1. Load Session Cookies
                    const fbResponse = await fetch(FIREBASE_URL);
                    const currentCookies = await fbResponse.json();
                    if (currentCookies) await page.setCookie(...currentCookies);

                    // 2. Buka Gemini
                    await page.goto(page.url(), { waitUntil: 'domcontentloaded' });

                    // 3. Ketik Pertanyaan
                    await page.waitForSelector(INPUT_SELECTOR, { visible: true });
                    await page.type(INPUT_SELECTOR, PROMPT_TEXT);
                    await page.click(SEND_BUTTON);

                    // 4. Tunggu AI selesai merender jawaban (7-10 detik)
                    await new Promise(r => setTimeout(r, 10000));

                    // 5. Update Cookies agar session tetap aktif
                    const newCookies = await page.cookies();
                    await fetch(FIREBASE_URL, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newCookies)
                    });
                } catch (err) { console.error(err); }
            }
            await executeAction();
        `
    };

    try {
        const response = await axios.post(API_URL, payload, { timeout: 60000 });

        if (response.data.success && response.data.html) {
            const $ = cheerio.load(response.data.html);
            const latestResponse = $('.model-response-text').last();

            if (latestResponse.length > 0) {
                let aiMessage = '';
                latestResponse.find('p, li').each((i, el) => {
                    aiMessage += $(el).text().trim() + '\n';
                });
                return aiMessage.trim() || latestResponse.text().trim();
            } else {
                throw new Error("Elemen respon AI tidak ditemukan di halaman.");
            }
        } else {
            throw new Error("Server tidak mengembalikan HTML yang valid.");
        }
    } catch (error) {
        throw new Error(`Gemini Error: ${error.message}`);
    }
}

module.exports = { askGemini };