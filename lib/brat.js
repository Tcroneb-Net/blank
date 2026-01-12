const axios = require('axios');
const { encrypt } = require('./crypto');

async function generateBrat(text) {
    if (!text) throw new Error("Text parameter is required.");
    
    // Sanitize text
    const cleanText = text
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');

    const code = `
// --- START CUSTOM CODE (CROP 1:1 CENTER) ---
console.log("[BOT] Memulai skrip (Mode Crop 1:1)...");
try {
    // 1. KLIK TOMBOL WHITE
    await page.waitForSelector('#toggleButtonWhite', { visible: true, timeout: 5000 });
    await page.click('#toggleButtonWhite');
    
    await new Promise(r => setTimeout(r, 1000));

    // 2. MASUKAN INPUT TEXT
    const textInputSelector = '#textInput';
    const textToWrite = "${cleanText}"; 

    await page.waitForSelector(textInputSelector);
    
    await page.evaluate((selector, text) => {
        const el = document.querySelector(selector);
        if (el) {
            el.value = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, textInputSelector, textToWrite);
    
    await page.focus(textInputSelector);
    await page.keyboard.press('Enter');

    await new Promise(r => setTimeout(r, 2000));

    // 3. SCROLL & HITUNG CROP
    const targetSelector = '#memeContainer';
    await page.waitForSelector(targetSelector, { visible: true });
    
    const element = await page.$(targetSelector);

    if (element) {
        await page.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), element);
        await new Promise(r => setTimeout(r, 1000));

        const box = await element.boundingBox();

        if (box) {
            const sideLength = box.width;
            const heightExcess = box.height - sideLength;
            let clipOptions = {};

            if (heightExcess >= 0) {
                const cropTop = heightExcess / 2;
                clipOptions = {
                    x: box.x, 
                    y: box.y + cropTop, 
                    width: sideLength, 
                    height: sideLength 
                };
            } else {
                clipOptions = {
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height
                };
            }

            const imgBuffer = await page.screenshot({ 
                type: 'jpeg',
                quality: 95,
                clip: clipOptions
            });

            await uploadScreenshot(imgBuffer);
        }
    }
} catch (err) {
    console.log("[BOT] Terjadi Kesalahan: " + err.message);
}
// --- END CUSTOM CODE ---
`;

    const requestData = {
        "url": "https://www.bratgenerator.com/",
        "code": code,
        "viewport": "mobile"
    };

    try {
        const response = await axios.post(
            'https://puruh2o-gabutcok.hf.space/execute',
            requestData,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.171 Mobile Safari/537.36',
                    'Content-Type': 'application/json'
                },
                timeout: 30000 
            }
        );

        if (response.data && response.data.screenshotUrl) {
            const realUrl = response.data.screenshotUrl;
            // Encrypt Real URL
            const encrypted = encrypt(realUrl);
            return `/api/media/${encrypted}`;
        }
        
        throw new Error("Gagal mendapatkan URL gambar dari respons server.");

    } catch (error) {
         if (error.response) {
            throw new Error(`Remote API Error: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error(error.message);
    }
}

module.exports = { generateBrat };