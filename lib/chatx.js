const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ 
    jar, 
    withCredentials: true,
    baseURL: 'https://chatx.ai',
    timeout: 60000
}));

/**
 * MENGAMBIL SESI, TOKEN, USER_ID, DAN CHATS_ID SECARA DINAMIS
 */
async function getFreshSession() {
    const response = await client.get('/', {
        headers: { 
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        }
    });

    const html = response.data;

    const csrfMatch = html.match(/<meta name="csrf-token" content="([^"]+)"/i);
    const userMatch = html.match(/id="user_id"\s+value="(\d+)"/i);
    const chatMatch = html.match(/openconversions\('(\d+)'\)/i);

    if (!csrfMatch || !userMatch || !chatMatch) {
        throw new Error('Gagal mendapatkan parameter identitas.');
    }

    return {
        csrfToken: csrfMatch[1],
        userId: userMatch[1],
        chatsId: chatMatch[1]
    };
}

/**
 * FUNGSI CHAT STREAMING
 */
async function* chatStream(promptText) {
    const session = await getFreshSession();

    const headers = {
        'x-csrf-token': session.csrfToken,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
        'referer': 'https://chatx.ai/',
    };

    const payload = new URLSearchParams({
        '_token': session.csrfToken,
        'user_id': session.userId,
        'chats_id': session.chatsId,
        'prompt': promptText,
        'current_model': 'gpt5',
        'is_web': '0',
        'is_youtube': '0'
    });

    const initRes = await client.post('/en/sendchat', payload.toString(), { headers });

    if (!initRes.data.response) {
        throw new Error(initRes.data.messages || 'Server menolak permintaan');
    }

    const { conversions_id, ass_conversions_id } = initRes.data;

    const streamUrl = `/en/chats_stream?user_id=${session.userId}&chats_id=${session.chatsId}&current_model=gpt3&conversions_id=${conversions_id}&ass_conversions_id=${ass_conversions_id}&g_recaptcha_response=&is_web=0&is_youtube=0&reasoning_effort=low&verbosity=low`;

    const streamRes = await client.get(streamUrl, {
        headers: { ...headers, 'accept': 'text/event-stream' },
        responseType: 'stream'
    });

    for await (const chunk of streamRes.data) {
        const lines = chunk.toString().split('\n');
        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
                const dataStr = trimmed.replace('data:', '').trim();
                if (dataStr === '[DONE]') return;
                try {
                    const json = JSON.parse(dataStr);
                    if (json.type === 'response.output_text.delta' && json.delta) {
                        yield json.delta;
                    }
                } catch (e) {}
            }
        }
    }
}

module.exports = { chatStream };