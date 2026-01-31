const axios = require('axios');

/**
 * ZZZCode AI - Code Generator Logic
 */
async function* chatStream(language, prompt) {
    const payload = {
        id: "",
        p1: language || "Javascript",
        p2: prompt,
        p3: "",
        p4: "",
        p5: "",
        option1: "2 - Generate code",
        option2: "Professional",
        option3: "English",
        hasBlocker: false,
        tag: "",
        tool: ""
    };

    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://zzzcode.ai',
        'Referer': 'https://zzzcode.ai/code-generator',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios({
            method: 'post',
            url: 'https://zzzcode.ai/api/tools/code-generator',
            data: payload,
            headers: headers,
            responseType: 'stream'
        });

        const stream = response.data;
        let buffer = '';

        for await (const chunk of stream) {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const rawJson = line.replace(/^data:\s*/, '').trim();
                        if (!rawJson) continue;

                        const parsed = JSON.parse(rawJson);
                        
                        if (parsed === 'zzz_completed_zzz') {
                            return;
                        } else if (typeof parsed === 'string' && !parsed.startsWith('zzz')) {
                            const cleanText = parsed.replace(/zzznewlinezzz/g, '\n');
                            yield cleanText;
                        }
                    } catch (e) {
                        // ignore parse errors
                    }
                }
            }
        }
    } catch (error) {
        throw new Error(error.response?.data ? error.response.status + ' ' + JSON.stringify(error.response.data) : error.message);
    }
}

module.exports = { chatStream };