const axios = require('axios');

const FIREBASE_URL = 'https://puru-tools-default-rtdb.firebaseio.com/blackbox';
const STALE_TIME = 3 * 24 * 60 * 60 * 1000; 

function generateId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function getHistory(userId) {
    try {
        const res = await axios.get(`${FIREBASE_URL}/${userId}.json`);
        const data = res.data;
        if (!data) return [];
        const now = Date.now();
        if (now - data.updatedAt > STALE_TIME) return []; 
        return data.messages || [];
    } catch (e) {
        return [];
    }
}

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

async function chat(userId, userMessage, systemInstruction = "Be a helpful assistant.") {
    let history = await getHistory(userId);
    
    let reinforcedMessage = userMessage;
    if (history.length === 0) {
        reinforcedMessage = `[SYSTEM INSTRUCTION: ${systemInstruction}]\n\nUser: ${userMessage}`;
    } else if (history.length % 5 === 0) {
        reinforcedMessage = `(Ingat instruksi: ${systemInstruction})\n\n${userMessage}`;
    }

    const userMsgObj = {
        role: "user",
        content: reinforcedMessage,
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
        "userSystemPrompt": systemInstruction, // Sudah bersih dari tag sitasi
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
        "userSelectedAgent": null, 
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
            "name": "", "occupation": "", "traits": [], "additionalInfo": "", "enableNewChats": false
        },
        "webSearchModeOption": {
            "autoMode": true, "webMode": false, "offlineMode": false
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
        
        const cleanHistory = [...history];
        cleanHistory[cleanHistory.length - 1].content = userMessage; 

        cleanHistory.push({
            role: "assistant",
            content: aiText,
            id: generateId()
        });

        const limitedHistory = cleanHistory.slice(-20);
        await saveHistory(userId, limitedHistory);

        return aiText;
    } catch (error) {
        throw new Error(error.response ? JSON.stringify(error.response.data) : error.message);
    }
}

module.exports = { chat };
