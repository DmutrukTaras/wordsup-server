"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const router = (0, express_1.Router)();
// GET /api/external/dictionary?word=hello
router.get('/dictionary', async (req, res) => {
    const word = req.query.word;
    if (!word) {
        return res.status(400).json({ message: 'word is required' });
    }
    try {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
        console.log('[DICT] Request:', url);
        const response = await axios_1.default.get(url);
        console.log('[DICT] Status:', response.status);
        // Просто прокидуємо респонс далі на фронт
        return res.json(response.data);
    }
    catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error('[DICT] Error status:', status);
        console.error('[DICT] Error data:', data || err.message);
        // Якщо словник не знайшов слово – повернемо 404 з коротким меседжем
        if (status === 404) {
            return res.status(404).json({ message: 'Word not found in dictionary' });
        }
        return res.status(500).json({ message: 'Dictionary lookup failed' });
    }
});
// POST /api/external/translate
// body: { text, source, target }
router.post('/translate', async (req, res) => {
    const { text, source, target } = req.body;
    if (!text || !source || !target) {
        return res
            .status(400)
            .json({ message: 'text, source and target are required' });
    }
    try {
        // MyMemory: https://api.mymemory.translated.net/get?q=Hello&langpair=en|uk
        const response = await axios_1.default.get('https://api.mymemory.translated.net/get', {
            params: {
                q: text,
                langpair: `${source}|${target}`
            }
        });
        const translatedText = response.data?.responseData?.translatedText;
        if (!translatedText) {
            console.error('[TRANSLATE] Unexpected MyMemory response:', response.data);
            return res
                .status(500)
                .json({ message: 'Unexpected translate response' });
        }
        // 👈 фронт очікує саме { translatedText }
        return res.json({ translatedText });
    }
    catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error('[TRANSLATE] Error status:', status);
        console.error('[TRANSLATE] Error data:', data || err.message);
        return res.status(500).json({ message: 'Translate failed' });
    }
});
// GET /api/external/images?query=cat
router.get('/images', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ message: 'query is required' });
    }
    if (!config_1.config.externalApis.pexelsApiKey) {
        return res.status(500).json({ message: 'PEXELS_API_KEY not configured' });
    }
    try {
        console.log('[PEXELS] Search:', query);
        const response = await axios_1.default.get('https://api.pexels.com/v1/search', {
            headers: {
                Authorization: config_1.config.externalApis.pexelsApiKey
            },
            params: {
                query,
                per_page: 4
            }
        });
        const photos = (response.data.photos || []).map((p) => ({
            id: p.id,
            url: p.src?.medium || p.src?.original,
            alt: p.alt
        }));
        return res.json({ photos });
    }
    catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error('[PEXELS] Error status:', status);
        console.error('[PEXELS] Error data:', data || err.message);
        return res.status(500).json({ message: 'Image search failed' });
    }
});
exports.default = router;
