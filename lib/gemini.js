const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fungsi Parser untuk memproses HTML dari Gemini secara detail
 */
function parseGeminiResponse(html) {
    const $ = cheerio.load(html);
    let result = "";

    // 1. Ambil Kontainer Markdown Utama
    const markdownPanel = $('.markdown.markdown-main-panel');

    if (markdownPanel.length > 0) {
        // Meloop setiap elemen anak supaya urutan (Paragraf -> List -> Header) tidak berantakan
        markdownPanel.children().each((i, el) => {
            const tagName = el.tagName.toLowerCase();

            if (tagName === 'p') {
                // Paragraf biasa
                result += $(el).text().trim() + "\n\n";
            } 
            else if (tagName === 'h2') {
                // Judul kategori (biasanya di berita)
                result += `\n=== ${$(el).text().trim().toUpperCase()} ===\n`;
            } 
            else if (tagName === 'ul') {
                // List/Poin-poin
                $(el).find('li').each((j, li) => {
                    result += "  • " + $(li).text().trim() + "\n";
                });
                result += "\n";
            } 
            else if (tagName === 'hr') {
                // Garis pembatas
                result += "------------------------------------------\n";
            }
        });
    }

    // 2. Deteksi Gambar (Khusus untuk prompt gambar)
    const imageElements = $('.image-button img, .image-container img');
    if (imageElements.length > 0) {
        let imageLinks = "";
        imageElements.each((i, img) => {
            const src = $(img).attr('src');
            // Abaikan gambar profil user (biasanya ada kata 'profile/picture')
            if (src && !src.includes('profile/picture')) {
                imageLinks += `[🖼️ Link Gambar ${i + 1}]: ${src}\n`;
            }
        });

        if (imageLinks) {
            result += "\nHASIL GENERATE GAMBAR:\n" + imageLinks;
        }
    }

    // 3. Fallback jika parser khusus gagal (Ambil teks mentah)
    if (!result.trim()) {
        result = $('.model-response-text').last().text().trim();
    }

    return result.trim();
}

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

                    // 4. Tunggu AI selesai merender jawaban (15 detik)
                    await new Promise(r => setTimeout(r, 15000));

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

            // Ambil container respon terakhir
            const lastResponseHtml = $('.presented-response-container').last().html();

            if (lastResponseHtml) {
                return parseGeminiResponse(lastResponseHtml);
            } else {
                // Fallback jika kontainer tidak ditemukan
                const latestResponse = $('.model-response-text').last();
                return latestResponse.text().trim() || "Gagal memproses respon AI.";
            }
        } else {
            throw new Error("Server tidak mengembalikan HTML yang valid.");
        }
    } catch (error) {
        throw new Error(`Gemini Error: ${error.message}`);
    }
}

module.exports = { askGemini };