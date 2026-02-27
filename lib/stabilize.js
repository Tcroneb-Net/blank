const io = require('socket.io-client');
const axios = require('axios');

const CONFIG = {
    targetUrl: 'https://online-video-cutter.com/id/stabilize-video',
    workerUrl: 'https://s65.123apps.io'
};

const HEADERS = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'accept': '*/*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'origin': 'https://online-video-cutter.com',
    'referer': 'https://online-video-cutter.com/',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin'
};

async function stabilize(videoFile) {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Ambil Halaman Utama & Cookies
            const page = await axios.get(CONFIG.targetUrl, { 
                headers: HEADERS,
                withCredentials: true 
            });
            
            const html = page.data;
            const setCookie = page.headers['set-cookie'] || [];
            
            const cookieMap = {};
            setCookie.forEach(c => {
                const [kv] = c.split(';');
                const [k, v] = kv.split('=');
                cookieMap[k.trim()] = v.trim();
            });

            const uid = cookieMap['uid'];
            const i = html.match(/"i"\s*:\s*"([^"]+)"/)?.[1];
            const g = html.match(/"g"\s*:\s*"([^"]+)"/)?.[1];
            const f = html.match(/"f"\s*:\s*"([^"]+)"/)?.[1] || "44ec01b4c5d979004ecf7d57eed8ba65";

            if (!uid || !i || !g) {
                return reject(new Error("Gagal ekstraksi token/UID."));
            }

            const cookieStr = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');

            // 3. SSO Attach
            const attachResponse = await axios.get('https://online-video-cutter.com/sso/attach/', {
                params: { 
                    callback: 'jQuery' + Math.floor(Math.random() * 10000000000000000), 
                    _: Date.now() 
                },
                headers: { 
                    ...HEADERS, 
                    'cookie': cookieStr,
                    'x-requested-with': 'XMLHttpRequest'
                }
            });

            const verify = attachResponse.data.match(/"verify"\s*:\s*"([^"]+)"/)?.[1];
            
            if (!verify) {
                return reject(new Error("Gagal SSO Handshake."));
            }

            // 4. SSO Verify
            await axios.post('https://online-video-cutter.com/sso/verify/', 
                new URLSearchParams({ verify: verify }).toString(), 
                {
                    headers: { 
                        ...HEADERS, 
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'cookie': cookieStr + `; sso_verify_onlinevideocuttercom=${verify}`
                    }
                }
            );

            // 5. WebSocket Connection
            const socket = io(CONFIG.workerUrl, {
                path: '/socket.io/',
                transports: ['websocket'],
                extraHeaders: { 
                    'Origin': 'https://online-video-cutter.com',
                    'User-Agent': HEADERS['user-agent']
                }
            });

            socket.on('connect', () => {
                const opId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                socket.emit('open_remote', {
                    site_id: "vcutter",
                    uid: uid,
                    codebase_id: "vcutter",
                    operation_id: opId,
                    action_type: "open_remote",
                    remote_url: videoFile,
                    params: { secondary: false, original_filename: "video.mp4", ff: 1 },
                    i, f, g,
                    app_id: "stabilize",
                    country: "ID"
                });
            });

            socket.on('open_remote', (data) => {
                if (data.message_type === 'final_result' && data.tmp_filename) {
                    socket.emit('encode', {
                        site_id: "vcutter",
                        uid: uid,
                        operation_id: `${Date.now()}_enc`,
                        action_type: "encode",
                        tmp_filename: data.tmp_filename,
                        v2: true,
                        commands: [`ffmpeg -i ${data.tmp_filename} -vf "deshake" -c:a copy %output.mp4%`],
                        i, f, g,
                        app_id: "stabilize"
                    });
                } else if (data.error) {
                    socket.disconnect();
                    reject(new Error(data.error));
                }
            });

            socket.on('encode', (data) => {
                if (data.message_type === 'final_result' && data.success) {
                    socket.disconnect();
                    resolve(data.download_url);
                }
                if (data.error) {
                    socket.disconnect();
                    reject(new Error(data.error));
                }
            });

            socket.on('connect_error', (err) => {
                reject(new Error("Socket Error: " + err.message));
            });

        } catch (e) {
            reject(e);
        }
    });
}

module.exports = { stabilize };