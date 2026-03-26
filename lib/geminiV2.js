const axios = require('axios');
const qs = require('qs');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

/**
 * Gemini AI V2 - BatchExecute Method
 * Automated Cookie Handling & Firebase Persistence
 */

const FIREBASE_URL = 'https://puru-tools-default-rtdb.firebaseio.com/cookieGeminiV2.json';

async function syncFirebase(method = 'GET', data = null) {
    try {
        if (method === 'GET') {
            const res = await axios.get(FIREBASE_URL);
            return res.data?.cookies || null;
        } else {
            await axios.put(FIREBASE_URL, {
                cookies: data,
                last_updated: new Date().toISOString()
            });
        }
    } catch (err) {
        // Silent error for database sync
    }
}

/**
 * Cari entry "q4uTj" secara rekursif di dalam array yang bisa flat maupun nested.
 * Menangani dua kemungkinan format respons Gemini:
 *   Format 1 (flat):    [["wrb.fr","q4uTj",DATA,...], ["di",...]]
 *   Format 2 (nested):  [[["wrb.fr","q4uTj",DATA,...]], ...] (chunked streaming)
 */
function findQ4uTjEntry(arr, depth = 0) {
    if (depth > 4 || !Array.isArray(arr)) return null;

    // Cek apakah arr ini sendiri adalah entry yang dicari
    if (typeof arr[1] === 'string' && arr[1] === 'q4uTj' && arr[2] != null) {
        return arr[2];
    }

    // Cari secara rekursif di semua elemen yang berupa array
    for (const item of arr) {
        if (Array.isArray(item)) {
            const found = findQ4uTjEntry(item, depth + 1);
            if (found != null) return found;
        }
    }
    return null;
}

/**
 * Ekstrak teks balasan dari raw response Gemini batchexecute.
 *
 * Menangani:
 * - Prefix anti-XSS: )]}'
 * - Format 1 – flat JSON array dalam satu blok
 * - Format 2 – chunked streaming: beberapa blok JSON dipisah angka (ukuran chunk HTTP)
 * - innerDataString yang berlapis-lapis (array-of-string-of-JSON)
 */
function extractReply(rawData) {
    if (typeof rawData !== 'string') rawData = JSON.stringify(rawData);

    // 1. Hapus prefix anti-XSS Google: )]}'
    const stripped = rawData.replace(/^\)\]\}'\s*/m, '').trim();

    // 2. Hapus baris yang hanya berisi angka hex/desimal (artefak HTTP chunked encoding)
    //    Contoh: "26491", "61", "27" yang muncul di format 2
    const cleaned = stripped
        .split('\n')
        .filter(line => !/^\s*[0-9a-fA-F]+\s*$/.test(line.trim()))
        .join('\n');

    // 3. Ekstrak semua blok JSON array tingkat atas dari teks (mungkin ada beberapa)
    const jsonBlocks = [];
    let depth = 0, start = -1;
    for (let i = 0; i < cleaned.length; i++) {
        const ch = cleaned[i];
        if (ch === '[') {
            if (depth === 0) start = i;
            depth++;
        } else if (ch === ']') {
            depth--;
            if (depth === 0 && start !== -1) {
                jsonBlocks.push(cleaned.slice(start, i + 1));
                start = -1;
            }
        }
    }

    // 4. Cari entry q4uTj secara rekursif di setiap blok JSON
    let innerDataString = null;
    for (const block of jsonBlocks) {
        let parsed;
        try { parsed = JSON.parse(block); } catch { continue; }
        const found = findQ4uTjEntry(parsed);
        if (found != null) { innerDataString = found; break; }
    }

    if (!innerDataString) {
        throw new Error('q4uTj entry tidak ditemukan — format respons tidak dikenali');
    }

    // 5. Parse objek candidates dari innerDataString (bisa berlapis)
    //    innerDataString bisa berupa: '["{\\"candidates\\":...}"]' atau '{"candidates":...}'
    try {
        let parsed = JSON.parse(innerDataString);
        if (Array.isArray(parsed)) parsed = parsed[0];        // Lepas array wrapper
        if (typeof parsed === 'string') parsed = JSON.parse(parsed); // Lepas string wrapper
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
    } catch (_) {
        // Lanjut ke fallback
    }

    // 6. Fallback: regex pada innerDataString
    const m = innerDataString.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (m) {
        return m[1]
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
    }

    throw new Error('Semua metode ekstraksi gagal');
}

async function chat(promptText) {
    const jar = new CookieJar();
    const client = wrapper(axios.create({
        jar,
        withCredentials: true,
        maxRedirects: 10
    }));

    // 1. Load existing cookies from Firebase
    const savedCookies = await syncFirebase('GET');
    if (savedCookies) {
        try {
            const parsed = JSON.parse(savedCookies);
            if (Array.isArray(parsed)) {
                parsed.forEach(cookieStr => {
                    jar.setCookieSync(cookieStr, 'https://gemini.google.com');
                });
            } else {
                jar.setCookieSync(savedCookies, 'https://gemini.google.com');
            }
        } catch (e) {
            jar.setCookieSync(savedCookies, 'https://gemini.google.com');
        }
    }

    // 2. Construct RPC Payload
    const contents = {
        contents: [
            {
                role: 'user',
                parts: [{ text: promptText }]
            }
        ]
    };

    const rpcData = [
        null,
        JSON.stringify(contents),
        1,
        'caea8d35955a'
    ];

    const fReq = [
        [
            [
                'q4uTj',
                JSON.stringify(rpcData),
                null,
                'generic'
            ]
        ]
    ];

    const payload = qs.stringify({
        'f.req': JSON.stringify(fReq),
        'at': ''
    });

    try {
        // 3. Perform Request
        const response = await client.post(
            'https://gemini.google.com/_/BardChatUi/data/batchexecute',
            payload,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'X-Same-Domain': '1',
                    'Origin': 'https://gemini.google.com',
                    'Referer': 'https://gemini.google.com/',
                    'Accept': '*/*'
                }
            }
        );

        // 4. Persistence: Capture and save new cookies
        const cookiesToSave = JSON.stringify(
            jar.getCookiesSync('https://gemini.google.com').map(c => c.toString())
        );
        await syncFirebase('PUT', cookiesToSave);

        // 5. Ekstrak balasan menggunakan parser multi-format
        const rawData = response.data;
        const rawStr = typeof rawData === 'string' ? rawData : JSON.stringify(rawData);

        try {
            const reply = extractReply(rawData);
            return reply;
        } catch (extractErr) {
            // Sertakan raw response asli agar mudah debug format baru
            throw new Error(
                `${extractErr.message}\n\n=== RAW RESPONSE ===\n${rawStr.slice(0, 3000)}`
            );
        }

    } catch (err) {
        if (err.response?.status === 400) {
            throw new Error('Gemini Error 400: Payload rejected. Session might be invalid.');
        }
        throw new Error(`Gagal menghubungi Gemini V2: ${err.message}`);
    }
}

module.exports = { chat };
