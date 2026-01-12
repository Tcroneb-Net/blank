const axios = require('axios');
const pool = require('./db');

// --- CONFIGURATION ---
const CONFIG = {
    baseUrl: 'https://typli.ai',
    chatEndpoint: '/api/generators/chat',
    userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
    modelId: 'openai/gpt-4.1-mini', 
    refUrl: 'https://typli.ai/ai-text-generator'
};

// --- HELPERS ---
const generateId = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const buildUserOriginCookie = () => {
    const payload = {
        country: "ID",
        city: "Jakarta",
        region: "Unknown",
        referer: CONFIG.refUrl,
        landingPage: "/api/generators/reviews",
        timestamp: new Date().toISOString()
    };
    return `user_origin=${encodeURIComponent(JSON.stringify(payload))}`;
};

// Ensure table exists
const ensureTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS typli_sessions (
            session_id TEXT PRIMARY KEY,
            messages JSONB NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL
        );
    `;
    await pool.query(query);
};

// --- CORE CHAT FUNCTION ---
async function chat(messages) {
    const parentId = generateId();

    // Map messages to Typli format
    const formattedMessages = messages.map(msg => ({
        parts: [{ type: "text", text: msg.content }],
        id: generateId(),
        role: msg.role
    }));

    const payload = {
        slug: "ai-text-generator",
        modelId: CONFIG.modelId,
        id: parentId,
        messages: formattedMessages,
        trigger: "submit-message"
    };

    const headers = {
        'User-Agent': CONFIG.userAgent,
        'Origin': CONFIG.baseUrl,
        'Referer': CONFIG.refUrl,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'x-requested-with': 'mark.via.gp',
        'Cookie': buildUserOriginCookie()
    };

    try {
        const response = await axios.post(`${CONFIG.baseUrl}${CONFIG.chatEndpoint}`, payload, {
            headers: headers,
            responseType: 'stream',
            timeout: 30000
        });

        return new Promise((resolve, reject) => {
            let fullResponse = '';
            let usageData = null;

            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const dataStr = trimmed.substring(6);

                        if (dataStr === '[DONE]') {
                            return;
                        }

                        try {
                            const data = JSON.parse(dataStr);
                            if (data.type === 'text-delta' && data.delta) {
                                fullResponse += data.delta;
                            }
                        } catch (e) {
                            // Skip JSON parse errors
                        }
                    }
                }
            });

            response.data.on('error', (err) => reject(err));

            response.data.on('end', () => {
                if (fullResponse) {
                    resolve({
                        response: fullResponse.trim(),
                        usage: usageData || { model: CONFIG.modelId }
                    });
                } else {
                    reject(new Error('No response received from Typli API'));
                }
            });
        });

    } catch (error) {
        throw new Error(`Typli API Error: ${error.message}`);
    }
}

// --- HISTORY MANAGER ---
async function chatWithHistory({ sessionId, prompt, system, historyLength = 11 }) {
    await ensureTable();

    // Cleanup expired sessions
    await pool.query('DELETE FROM typli_sessions WHERE expires_at < NOW()');

    let messages = [];

    // Fetch history
    const res = await pool.query('SELECT messages FROM typli_sessions WHERE session_id = $1', [sessionId]);
    if (res.rows.length > 0) {
        messages = res.rows[0].messages;
    }

    // Handle System Prompt
    if (system) {
        if (messages.length > 0 && messages[0].role === 'system') {
            messages[0].content = system;
        } else {
            messages.unshift({ role: 'system', content: system });
        }
    }

    // Add User Prompt
    messages.push({ role: 'user', content: prompt });

    // Truncate History
    const limit = parseInt(historyLength);
    let contextMessages = [...messages];
    let systemMsg = null;

    if (contextMessages.length > 0 && contextMessages[0].role === 'system') {
        systemMsg = contextMessages.shift();
    }

    const keepCount = systemMsg ? limit - 1 : limit;
    if (contextMessages.length > keepCount) {
        contextMessages = contextMessages.slice(-keepCount);
    }

    let finalMessages = [];
    if (systemMsg) finalMessages.push(systemMsg);
    finalMessages = finalMessages.concat(contextMessages);

    // Call API
    const result = await chat(finalMessages);

    // Append Assistant Response
    finalMessages.push({ role: 'assistant', content: result.response });

    // Store updated history
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const upsertQuery = `
        INSERT INTO typli_sessions (session_id, messages, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (session_id)
        DO UPDATE SET messages = $2, expires_at = $3
    `;
    await pool.query(upsertQuery, [sessionId, JSON.stringify(finalMessages), expiresAt]);

    return {
        ...result,
        sessionId,
        historyLength: finalMessages.length
    };
}

module.exports = { chatWithHistory };