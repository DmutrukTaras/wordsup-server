import { Router } from 'express';
import axios from 'axios';
import { config } from '../config/config';

const router = Router();

// GET /api/external/dictionary?word=hello
router.get('/dictionary', async (req, res) => {
  const word = req.query.word as string | undefined;
  if (!word) {
    return res.status(400).json({ message: 'word is required' });
  }

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
      word
    )}`;

    console.log('[DICT] Request:', url);

    const response = await axios.get(url);
    console.log('[DICT] Status:', response.status);

    // Просто прокидуємо респонс далі на фронт
    return res.json(response.data);
  } catch (err: any) {
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
  const { text, source, target } = req.body as {
    text?: string;
    source?: string;
    target?: string;
  };

  if (!text || !source || !target) {
    return res
      .status(400)
      .json({ message: 'text, source and target are required' });
  }

  try {
    // MyMemory: https://api.mymemory.translated.net/get?q=Hello&langpair=en|uk
    const response = await axios.get(
      'https://api.mymemory.translated.net/get',
      {
        params: {
          q: text,
          langpair: `${source}|${target}`
        }
      }
    );

    const translatedText =
      response.data?.responseData?.translatedText as string | undefined;

    if (!translatedText) {
      console.error('[TRANSLATE] Unexpected MyMemory response:', response.data);
      return res
        .status(500)
        .json({ message: 'Unexpected translate response' });
    }

    // 👈 фронт очікує саме { translatedText }
    return res.json({ translatedText });
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.error('[TRANSLATE] Error status:', status);
    console.error('[TRANSLATE] Error data:', data || err.message);
    return res.status(500).json({ message: 'Translate failed' });
  }
});

// GET /api/external/images?query=cat
router.get('/images', async (req, res) => {
  const query = req.query.query as string | undefined;
  if (!query) {
    return res.status(400).json({ message: 'query is required' });
  }

  if (!config.externalApis.pexelsApiKey) {
    return res.status(500).json({ message: 'PEXELS_API_KEY not configured' });
  }

  try {
    console.log('[PEXELS] Search:', query);

    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: config.externalApis.pexelsApiKey
      },
      params: {
        query,
        per_page: 4
      }
    });

    const photos = (response.data.photos || []).map((p: any) => ({
      id: p.id,
      url: p.src?.medium || p.src?.original,
      alt: p.alt
    }));

    return res.json({ photos });
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.error('[PEXELS] Error status:', status);
    console.error('[PEXELS] Error data:', data || err.message);

    return res.status(500).json({ message: 'Image search failed' });
  }
});

export default router;
