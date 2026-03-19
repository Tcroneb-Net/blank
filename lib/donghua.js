const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://donghuafilm.com';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
};

const makeProxyLink = (originalPath, type, apiBaseUrl) => {
    if (!apiBaseUrl || !originalPath) return originalPath;
    const cleanPath = originalPath.replace(BASE_URL, '');
    const endpoint = type === 'detail' ? 'detail' : 'stream';
    return `${apiBaseUrl}/api/anime/donghua/${endpoint}?url=${encodeURIComponent(cleanPath)}`;
};

/**
 * Helper: Standarisasi card item (donghua box)
 */
function parseArticle($, el, apiBaseUrl) {
    const link = $(el).find('a').attr('href');
    const path = link ? link.replace(BASE_URL, '') : '';
    return {
        title: $(el).find('.tt h2').text().trim() || $(el).find('.tt').text().trim(),
        original_url: link,
        url: makeProxyLink(path, 'detail', apiBaseUrl),
        thumb: $(el).find('img').attr('data-src') || $(el).find('img').attr('src'),
        episode: $(el).find('.epx').text().trim(),
        type: $(el).find('.typez').text().trim(),
        sub: $(el).find('.sb').text().trim() || "Sub"
    };
}

/**
 * 1. HOME & PAGINATION
 */
async function getHome(page = 1, apiBaseUrl) {
    try {
        const url = page > 1 ? `${BASE_URL}/page/${page}/` : BASE_URL;
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);

        const result = {
            page,
            slider: [],
            popularToday: [],
            latestRelease: [],
            pagination: {
                hasNextPage: $('.hpage a.r').length > 0,
                nextPageUrl: $('.hpage a.r').attr('href') || null
            }
        };

        if (page === 1) {
            $('#slidertwo .swiper-slide').each((i, el) => {
                const thumbStyle = $(el).find('.backdrop').attr('style') || "";
                const href = $(el).find('h2 a').attr('href') || "";
                result.slider.push({
                    title: $(el).find('h2 a').text().trim(),
                    path: href.replace(BASE_URL, ''),
                    url: makeProxyLink(href, 'detail', apiBaseUrl),
                    thumb: thumbStyle.match(/url\('(.*?)'\)/)?.[1] || "",
                    synopsis: $(el).find('.info p').text().trim()
                });
            });
        }

        $('.hothome').next('.listupd').find('article.bs').each((i, el) => {
            result.popularToday.push(parseArticle($, el, apiBaseUrl));
        });

        $('.latesthome').next('.listupd').find('article.bs').each((i, el) => {
            result.latestRelease.push(parseArticle($, el, apiBaseUrl));
        });

        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * 2. SEARCH
 */
async function search(query, page = 1, apiBaseUrl) {
    try {
        const q = encodeURIComponent(query);
        const url = page > 1 ? `${BASE_URL}/page/${page}/?s=${q}` : `${BASE_URL}/?s=${q}`;
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);

        const result = {
            query, page, results: [],
            pagination: {
                hasNextPage: $('.pagination a.next').length > 0 || $('.hpage a.r').length > 0
            }
        };

        $('article.bs').each((i, el) => {
            result.results.push(parseArticle($, el, apiBaseUrl));
        });

        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * 3. DETAIL (Halaman Informasi Seri)
 */
async function getDetail(path, apiBaseUrl) {
    try {
        const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);

        const infoX = $('.infox');
        const rating = $('meta[itemprop="ratingValue"]').attr('content') || $('.rating strong').text().replace(/[^\d.]/g, '');

        const result = {
            title: infoX.find('h1.entry-title').text().trim(),
            thumb: $('.thumb img').attr('data-src') || $('.thumb img').attr('src'),
            rating: rating,
            synopsis: $('.entry-content[itemprop="description"]').text().trim().replace(/\s+/g, ' '),
            metadata: {},
            genres: [],
            episodes: []
        };

        infoX.find('.spe span').each((i, el) => {
            const b = $(el).find('b');
            const key = b.text().replace(':', '').trim().toLowerCase().replace(/\s+/g, '_');
            b.remove(); 
            let value = $(el).find('a').length > 0 
                ? $(el).find('a').map((i, a) => $(a).text().trim()).get().join(', ')
                : $(el).text().trim();
            if (key) result.metadata[key] = value;
        });

        $('.genxed a').each((i, el) => result.genres.push($(el).text().trim()));

        $('.eplister ul li').each((i, el) => {
            const href = $(el).find('a').attr('href') || "";
            result.episodes.push({
                episode: $(el).find('.epl-num').text().trim(),
                title: $(el).find('.epl-title').text().trim(),
                date: $(el).find('.epl-date').text().trim(),
                path: href.replace(BASE_URL, ''),
                url: makeProxyLink(href, 'stream', apiBaseUrl)
            });
        });

        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * 4. STREAM (Halaman Pemutar Video)
 */
async function getStream(path, apiBaseUrl) {
    try {
        const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);

        const result = {
            title: $('.title-section h1').text().trim(),
            default_stream: $('#pembed iframe').attr('src'),
            mirrors: [],
            downloads: [],
            navigation: {
                prev: null,
                next: null
            }
        };

        const prevHref = $('.naveps .nvs a[rel="prev"]').attr('href');
        const nextHref = $('.naveps .nvs a[rel="next"]').attr('href');
        
        if (prevHref) result.navigation.prev = makeProxyLink(prevHref, 'stream', apiBaseUrl);
        if (nextHref) result.navigation.next = makeProxyLink(nextHref, 'stream', apiBaseUrl);

        $('.mirror option').each((i, el) => {
            const value = $(el).attr('value');
            if (value && value !== "") {
                const decoded = Buffer.from(value, 'base64').toString('utf8');
                const streamUrl = cheerio.load(decoded)('iframe').attr('src');
                if(streamUrl) result.mirrors.push({ server: $(el).text().trim(), url: streamUrl });
            }
        });

        $('.soraurlx').each((i, el) => {
            const quality = $(el).find('strong').text().trim();
            const links = $(el).find('a').map((j, a) => ({
                name: $(a).text().trim(),
                url: $(a).attr('href')
            })).get();
            result.downloads.push({ quality, links });
        });

        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { getHome, search, getDetail, getStream };