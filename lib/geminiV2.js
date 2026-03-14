const axios = require('axios');
const qs = require('qs');

/**
 * Gemini AI V2 - BatchExecute Method
 * @param {string} promptText 
 */
async function chat(promptText) {
  const data = qs.stringify({
    'f.req': `[[["q4uTj","[null,\\"{\\\\\\"contents\\\\\\":[{\\\\\\"role\\\\\\":\\\\\\"user\\\\\\",\\\\\\"parts\\\\\\":[{\\\\\\"text\\\\\\":\\\\\\"${promptText}\\\\\\"}]}]}\\",1,\\"caea8d35955a\\"]",null,"generic"]]]`
  });

  const config = {
    method: 'POST',
    url: 'https://gemini.google.com/_/BardChatUi/data/batchexecute',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-Same-Domain': '1',
      'Origin': 'https://gemini.google.com',
      'Referer': 'https://gemini.google.com/'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    let rawData = response.data;
    
    // Clean potential prefixes
    const cleanData = rawData.replace(/^\)\]\}'\s*/, '');
    const outerArray = JSON.parse(cleanData);
    const innerDataString = outerArray[0][2];
    const innerDataArray = JSON.parse(innerDataString);
    
    let reply = "";
    const resultObj = JSON.parse(innerDataArray[0]);
    
    if (resultObj && resultObj.candidates) {
      reply = resultObj.candidates[0].content.parts[0].text;
    }

    // Fallback extraction
    if (!reply) {
      const fallbackMatch = innerDataString.match(/"text":"(.*?)"/);
      if (fallbackMatch) {
          reply = fallbackMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    }

    return reply || "Gagal ekstraksi teks.";
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = { chat };