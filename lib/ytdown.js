const axios = require('axios');
const cheerio = require('cheerio');

async function download(url) {
    if (!url) throw new Error("URL wajib diisi.");

    // Automation script for remote browser
    const code = `
        const targetUrl = "${url}";
        
        console.log("[BOT] Navigasi ke YTDown...");

        // 1. Tunggu Input & Ketik URL
        await page.waitForSelector('input#postUrl', { visible: true });
        // Klik dulu untuk memastikan fokus (beberapa situs perlu ini)
        await page.click('input#postUrl');
        
        // Clear input (ctrl+a + backspace method or value property)
        await page.evaluate(() => document.getElementById('postUrl').value = '');
        
        await page.type('input#postUrl', targetUrl, { delay: 50 });
        console.log("[BOT] URL diketik.");
        
        // 2. Klik Tombol Download
        const btnSelector = 'form#ytdown-downloader-form > div > button:nth-of-type(3)';
        await page.waitForSelector(btnSelector, { visible: true });
        await page.click(btnSelector);
        console.log("[BOT] Tombol download diklik.");
        
        // 3. Tunggu Hasil (Select Option muncul)
        // Timeout agak panjang karena proses convert kadang lama
        await page.waitForSelector('.download-option', { visible: true, timeout: 30000 });
        console.log("[BOT] Hasil ditemukan.");
        
        // Tunggu sebentar agar render sempurna
        await new Promise(r => setTimeout(r, 1000));
    `;

    const payload = {
        url: "https://ytdown.to/id2/",
        code: code,
        viewport: "mobile"
    };

    try {
        const response = await axios.post('https://puruh2o-gabutcok.hf.space/execute', payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.171 Mobile Safari/537.36'
            },
            timeout: 60000 // Timeout total request 60 detik
        });

        const data = response.data;
        
        if (!data.success) {
            const logs = data.logs ? data.logs.join('\n') : 'Unknown Error';
            throw new Error(`Remote execution failed: ${logs}`);
        }

        const html = data.html;
        const $ = cheerio.load(html);

        // Parsing Result
        const title = $('.infor.title span').text().trim();
        const duration = $('.infor.duration span').text().trim();
        
        // Thumbnail biasanya ada di tag video poster atau img
        let thumbnail = $('video').attr('poster');
        if (!thumbnail) thumbnail = $('.thumbnail img').attr('src');
        
        const downloads = [];
        $('select.download-option option').each((i, el) => {
            const downloadUrl = $(el).attr('value');
            const size = $(el).attr('data-filesize');
            const text = $(el).text().trim(); // e.g., "MP4 - (1920x1080 FHD)"

            if (downloadUrl) {
                let type = 'video';
                if (text.includes('M4A') || text.includes('MP3') || text.includes('Audio')) {
                    type = 'audio';
                }

                // Ekstrak resolusi/kualitas dari teks dalam kurung
                // Contoh: "MP4 - (1920x1080 FHD)" -> "1920x1080 FHD"
                let quality = text;
                const match = text.match(/\((.*?)\)/);
                if (match) quality = match[1];

                downloads.push({
                    url: downloadUrl,
                    size: size || 'Unknown',
                    type: type,
                    quality: quality,
                    label: text
                });
            }
        });

        if (!title && downloads.length === 0) {
            throw new Error("Gagal mengambil data video. Konten mungkin privat atau URL salah.");
        }

        return {
            title,
            duration,
            thumbnail,
            downloads
        };

    } catch (error) {
        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
        }
        throw error;
    }
}

module.exports = { download };