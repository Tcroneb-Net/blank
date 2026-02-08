const axios = require('axios');

const FIREBASE_URL = 'https://puru-tools-default-rtdb.firebaseio.com/blackbox';
const STALE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 hari dalam milidetik

/**
 * Generator ID acak 7 karakter alfanumerik.
 */
function generateId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Mengambil histori percakapan dari Firebase.
 */
async function getHistory(userId) {
    try {
        const res = await axios.get(`${FIREBASE_URL}/${userId}.json`);
        const data = res.data;
        if (!data) return [];
        
        const now = Date.now();
        // Cek jika histori sudah usang (lebih dari 3 hari)
        if (now - data.updatedAt > STALE_TIME) {
            return []; 
        }
        return data.messages || [];
    } catch (e) {
        return [];
    }
}

/**
 * Menyimpan histori percakapan ke Firebase.
 */
async function saveHistory(userId, messages) {
    try {
        await axios.put(`${FIREBASE_URL}/${userId}.json`, {
            messages,
            updatedAt: Date.now()
        });
    } catch (e) {
        console.error("Firebase Save Error:", e.message);
    }
}

/**
 * Fungsi utama untuk berinteraksi dengan Blackbox AI.
 */
async function chat(userId, userMessage, systemInstruction = "Be a helpful assistant.") {
    const history = await getHistory(userId);
    
    // Tambah pesan user
    const userMsgObj = {
        role: "user",
        content: userMessage,
        id: generateId()
    };
    history.push(userMsgObj);

    const payload = {
        "messages": history,
        "id": generateId(),
        "previewToken": null,
        "userId": null,
        "codeModelMode": true,
        "trendingAgentMode": {},
        "isMicMode": false,
        "userSystemPrompt": systemInstruction,
        "maxTokens": 1024,
        "playgroundTopP": null,
        "playgroundTemperature": null,
        "isChromeExt": false,
        "githubToken": "",
        "clickedAnswer2": false,
        "clickedAnswer3": false,
        "clickedForceWebSearch": false,
        "visitFromDelta": false,
        "isMemoryEnabled": false,
        "mobileClient": false,
        "userSelectedModel": null,
        "userSelectedAgent": "VscodeAgent",
        "validated": "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
        "imageGenerationMode": false,
        "imageGenMode": "autoMode",
        "webSearchModePrompt": false,
        "deepSearchMode": false,
        "promptSelection": "",
        "domains": null,
        "vscodeClient": false,
        "codeInterpreterMode": false,
        "customProfile": {
            "name": "",
            "occupation": "",
            "traits": [],
            "additionalInfo": "",
            "enableNewChats": false
        },
        "webSearchModeOption": {
            "autoMode": true,
            "webMode": false,
            "offlineMode": false
        },
        "session": null,
        "isPremium": false,
        "teamAccount": "",
        "subscriptionCache": null,
        "beastMode": false,
        "reasoningMode": false,
        "designerMode": false,
        "workspaceId": "",
        "asyncMode": false,
        "integrations": {},
        "isTaskPersistent": false,
        "selectedElement": null
    };

    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.7559.109 Mobile Safari/537.36',
        'Origin': 'https://app.blackbox.ai',
        'Referer': 'https://app.blackbox.ai/',
        'Accept': '*/*'
    };

    try {
        const response = await axios.post('https://app.blackbox.ai/api/chat', payload, { headers });
        const aiText = response.data;
        
        // Tambah respon AI
        history.push({
            role: "assistant",
            content: aiText,
            id: generateId()
        });

        // Batasi histori 20 pesan terakhir agar tetap ringan
        const limitedHistory = history.slice(-20);
        await saveHistory(userId, limitedHistory);

        return aiText;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
}

module.exports = { chat };