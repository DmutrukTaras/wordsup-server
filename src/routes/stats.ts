import { Router, Response } from 'express';
import { pool } from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/stats/bulk
router.post(
  '/bulk',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { entries } = req.body as {
      entries?: { wordId: number; gameType: string; correct: boolean }[];
    };

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'entries are required' });
    }

    try {
      const values = entries.map((e) => [
        userId,
        e.wordId,
        e.gameType,
        e.correct ? 1 : 0 // <-- is_correct (TINYINT)
      ]);

      // user_id, word_id, game_type, is_correct — як у твоїй таблиці
      await pool.query(
        'INSERT INTO stats (user_id, word_id, game_type, is_correct) VALUES ?',
        [values]
      );

      return res.json({ success: true });
    } catch (err) {
      console.error('Stats bulk insert error:', err);
      return res.status(500).json({ message: 'Failed to save stats' });
    }
  }
);

export default router;
