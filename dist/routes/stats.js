"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/stats/bulk
router.post('/bulk', authMiddleware_1.authMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { entries } = req.body;
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
        await db_1.pool.query('INSERT INTO stats (user_id, word_id, game_type, is_correct) VALUES ?', [values]);
        return res.json({ success: true });
    }
    catch (err) {
        console.error('Stats bulk insert error:', err);
        return res.status(500).json({ message: 'Failed to save stats' });
    }
});
exports.default = router;
