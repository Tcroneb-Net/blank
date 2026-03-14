const axios = require('axios');
const qs = require('qs');

/**
 * Gemini AI V2 - BatchExecute Method (Fixed encoding for complex payloads)
 * @param {string} promptText 
 */
async function chat(promptText) {
  try {
    // 1. Konstruksi struktur data terdalam (contents)
    const contents = {
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ]
    };

    // 2. Bungkus ke dalam array RPC (middle layer)
    // Google mengharapkan JSON string di elemen ke-2
    const rpcData = [
      null, 
      JSON.stringify(contents), 
      1, 
      "caea8d35955a"
    ];

    // 3. Struktur final f.req (outer layer)
    // Array bersarang: [[[ "id_fungsi", "rpc_data_stringified", null, "tipe" ]]]
    const fReq = [
      [
        [
          "q4uTj",
          JSON.stringify(rpcData),
          null,
          "generic"
        ]
      ]
    ];

    // 4. Encode sebagai x-www-form-urlencoded
    const payload = qs.stringify({
      'f.req': JSON.stringify(fReq),
      'at': '' // Token anti-CSRF biasanya opsional untuk request anonim dasar
    });

    const config = {
      method: 'POST',
      url: 'https://gemini.google.com/_/BardChatUi/data/batchexecute',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'X-Same-Domain': '1',
        'Origin': 'https://gemini.google.com',
        'Referer': 'https://gemini.google.com/'
      },
      data: payload
    };

    const response = await axios.request(config);
    let rawData = response.data;
    
    // Hilangkan prefix anti-XSS Google
    const cleanData = rawData.replace(/^\)\]\}'\s*/, '');
    
    // Parsing manual sesuai struktur response Google RPC
    const outerArray = JSON.parse(cleanData);
    
    // Response biasanya di elemen pertama [0], index data di [2]
    const innerDataString = outerArray[0][2];
    const innerDataArray = JSON.parse(innerDataString);
    
    let reply = "";
    
    // Objek hasil chat biasanya di elemen pertama hasil parse innerDataArray
    if (innerDataArray && innerDataArray[0]) {
      const resultObj = JSON.parse(innerDataArray[0]);
      
      // Ambil teks dari kandidat pertama
      if (resultObj && resultObj.candidates && resultObj.candidates[0]) {
        reply = resultObj.candidates[0].content.parts[0].text;
      }
    }

    // Fallback regex jika struktur JSON berubah sedikit
    if (!reply) {
      const fallbackMatch = innerDataString.match(/"text":"(.*?)"/);
      if (fallbackMatch) {
          reply = fallbackMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    }

    return reply || "Gagal mengekstrak respons dari AI.";

  } catch (err) {
    if (err.response && err.response.status === 400) {
      throw new Error(`Gemini Error 400: Payload ditolak. Periksa struktur pesan. (Detail: ${err.message})`);
    }
    throw new Error(`Gagal menghubungi Gemini: ${err.message}`);
  }
}

module.exports = { chat };