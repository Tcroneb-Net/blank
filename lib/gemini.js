const axios = require('axios');
const cheerio = require('cheerio');

function parseGeminiResponse(html) {
    const $ = cheerio.load(html);
    const latestResponse = $('model-response').last();

    if (latestResponse.length === 0) return "Gagal menemukan respon terbaru.";

    let result = "";
    const markdownPanel = latestResponse.find('.markdown.markdown-main-panel');

    if (markdownPanel.length > 0) {
        markdownPanel.children().each((i, el) => {
            const tagName = el.tagName.toLowerCase();
            const text = $(el).text().trim();

            if (!text) return;

            if (tagName === 'p') {
                let pHtml = $(el).html()
                    .replace(/<strong>(.*?)<\/strong>/g, '*$1*')
                    .replace(/<b>(.*?)<\/b>/g, '*$1*')
                    .replace(/<code>(.*?)<\/code>/g, '_$1_');
                result += cheerio.load(pHtml).text() + "\n\n";
            } 
            else if (/^h[1-6]$/.test(tagName)) {
                result += `*${text.toUpperCase()}*\n`;
            } 
            else if (tagName === 'ul' || tagName === 'ol') {
                $(el).find('li').each((j, li) => {
                    result += "- " + $(li).text().trim() + "\n";
                });
                result += "\n";
            } 
            else if (tagName === 'pre') {
                result += "