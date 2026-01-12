const axios = require('axios');
const { encrypt } = require('./crypto');

/**
 * Menghasilkan gambar dari teks menggunakan layanan Vheer via Remote Puppeteer.
 * @param {string} prompt - Deskripsi gambar.
 * @returns {Promise<{image: string}>} - URL gambar hasil (Proxied).
 */
async function generate(prompt) {
    if (!prompt) throw new Error("Prompt wajib diisi.");

    // Escaping prompt untuk aman dimasukkan ke dalam string code
    const cleanPrompt = prompt.replace(/["\\]/g, '\\$&');

    // Skrip Puppeteer yang akan dieksekusi di server remote
    const code = `
// --- KONFIGURASI ---
const PROMPT_TEXT = "${cleanPrompt}";

console.log("[BOT] Memulai proses...");

// 1. INPUT TEXT
const inputSelector = 'textarea';
await page.waitForSelector(inputSelector);
// Kosongkan dulu (triple click untuk select all)
await page.click(inputSelector, { clickCount: 3 });
await page.type(inputSelector, PROMPT_TEXT, { delay: 50 });
console.log("[BOT] Prompt diketik.");

// 2. KLIK TOMBOL GENERATE
const generateButtonPath = "//button[contains(., 'Generate')]";
await page.waitForXPath(generateButtonPath);
const [btnGenerate] = await page.$x(generateButtonPath);

if (btnGenerate) {
    await btnGenerate.click();
    console.log("[BOT] Tombol Generate diklik.");
} else {
    throw new Error("Tombol Generate tidak ditemukan!");
}

// 3. TUNGGU HASIL GAMBAR
console.log("[BOT] Menunggu gambar digenerate...");
await page.waitForFunction(
    () => {
        const img = document.querySelector('#selectedImage');
        return img && img.src && img.src.startsWith('blob:');
    },
    { timeout: 120000 } 
);
console.log("[BOT] Gambar berhasil digenerate!");

// 4. AMBIL DATA GAMBAR (BLOB -> BASE64)
const imageBase64 = await page.evaluate(async () => {
    const img = document.querySelector('#selectedImage');
    const response = await fetch(img.src);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
});

// 5. UPLOAD KE PURUH2O BACKEND
console.log("[BOT] Mengupload ke Puruh2o...");

const base64Data = imageBase64.split(',')[1];
const buffer = Buffer.from(base64Data, 'base64');
const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
const filename = 'generated-' + Date.now() + '.png';

const preBuffer = Buffer.from(
    \`--\${boundary}\\r\\n\` +
    \`Content-Disposition: form-data; name="media"; filename="\${filename}"\\r\\n\` +
    \`Content-Type: image/png\\r\\n\\r\\n\`
);
const postBuffer = Buffer.from(\`\\r\\n--\${boundary}--\\r\\n\`);

const body = Buffer.concat([preBuffer, buffer, postBuffer]);

const uploadResponse = await fetch('https://puruh2o-backend.hf.space/upload', {
    method: 'POST',
    headers: {
        'Content-Type': \`multipart/form-data; boundary=\${boundary}\`,
        'Content-Length': body.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    body: body
});

const responseHtml = await uploadResponse.text();
const match = responseHtml.match(/href="(\\/uploads\\/[^"]+)"/);
let finalUrl = "";

if (match && match[1]) {
    finalUrl = "https://puruh2o-backend.hf.space" + match[1];
    console.log("[BOT] Upload Selesai: " + finalUrl);
} else {
    throw new Error("Gagal upload ke Puruh2o. Response: " + responseHtml.substring(0, 50));
}

// 6. TAMPILKAN HASIL KE UI
await page.evaluate((url) => {
    document.body.innerHTML = \`
        <div id="result-container">
            <h1>UPLOAD BERHASIL!</h1>
            <a id="final-link" href="\${url}">\${url}</a>
        </div>
    \`;
}, finalUrl);
`;

    try {
        const payload = {
            url: "https://vheer.com/app/text-to-image",
            code: code,
            viewport: "mobile"
        };

        // Request ke layanan eksekusi remote
        const response = await axios.post('https://puruh2o-gabutcok.hf.space/execute', payload, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.171 Mobile Safari/537.36',
                'Content-Type': 'application/json',
                'Referer': 'https://puruh2o-gabutcok.hf.space/'
            },
            timeout: 180000 // Timeout 3 menit
        });

        const data = response.data;
        
        if (!data.success) {
            const logs = data.logs ? data.logs.join('\n') : 'No logs';
            throw new Error(`Remote execution failed. Logs: ${logs}`);
        }

        // Ekstrak URL dari HTML output
        const html = data.html || "";
        
        // Cari link puruh2o dalam HTML
        const match = html.match(/https:\/\/puruh2o-backend\.hf\.space\/uploads\/[^"]+/);
        
        if (match && match[0]) {
            const realUrl = match[0];
            // ENCRYPT REAL URL & RETURN PROXY URL
            const encrypted = encrypt(realUrl);
            return { image: `/api/media/${encrypted}` };
        }

        throw new Error("Gagal mengekstrak URL gambar dari hasil eksekusi.");

    } catch (error) {
        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error(error.message);
    }
}

module.exports = { generate };