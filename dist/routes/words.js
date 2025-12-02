"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
// Get words for user (optionally by group)
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        const groupId = req.query.groupId ? Number(req.query.groupId) : null;
        let query = 'SELECT id, group_id, word_en, transcription, translation_uk, image_url, image_source, status, notes, created_at, updated_at FROM words WHERE user_id = ?';
        const params = [userId];
        if (groupId) {
            query += ' AND group_id = ?';
            params.push(groupId);
        }
        query += ' ORDER BY created_at DESC';
        const [rows] = await db_1.pool.query(query, params);
        res.json(rows);
    }
    catch (err) {
        console.error('Get words error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Create word
router.post('/', async (req, res) => {
    try {
        const userId = req.userId;
        const { groupId, wordEn, transcription, translationUk, imageUrl, imageSource, status, notes } = req.body;
        if (!groupId || !wordEn) {
            return res
                .status(400)
                .json({ message: 'groupId and wordEn are required' });
        }
        const [groupRows] = await db_1.pool.query('SELECT id FROM groups WHERE id = ? AND user_id = ? LIMIT 1', [groupId, userId]);
        const groups = groupRows;
        if (groups.length === 0) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }
        const [result] = await db_1.pool.query(`INSERT INTO words
      (user_id, group_id, word_en, transcription, translation_uk, image_url, image_source, status, notes)
      VALUES (?,?,?,?,?,?,?,?,?)`, [
            userId,
            groupId,
            wordEn,
            transcription || null,
            translationUk || null,
            imageUrl || null,
            imageSource || 'api',
            status || 'unknown',
            notes || null
        ]);
        const insertResult = result;
        const wordId = insertResult.insertId;
        const [rows] = await db_1.pool.query('SELECT id, group_id, word_en, transcription, translation_uk, image_url, image_source, status, notes, created_at, updated_at FROM words WHERE id = ?', [wordId]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        console.error('Create word error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update word
router.put('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const wordId = Number(req.params.id);
        const { groupId, wordEn, transcription, translationUk, imageUrl, imageSource, status, notes } = req.body;
        const [rows] = await db_1.pool.query('SELECT id FROM words WHERE id = ? AND user_id = ? LIMIT 1', [wordId, userId]);
        const words = rows;
        if (words.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }
        await db_1.pool.query(`UPDATE words
       SET group_id = ?, word_en = ?, transcription = ?, translation_uk = ?,
           image_url = ?, image_source = ?, status = ?, notes = ?
       WHERE id = ?`, [
            groupId || null,
            wordEn || null,
            transcription || null,
            translationUk || null,
            imageUrl || null,
            imageSource || 'api',
            status || 'unknown',
            notes || null,
            wordId
        ]);
        const [updated] = await db_1.pool.query('SELECT id, group_id, word_en, transcription, translation_uk, image_url, image_source, status, notes, created_at, updated_at FROM words WHERE id = ?', [wordId]);
        res.json(updated[0]);
    }
    catch (err) {
        console.error('Update word error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update only status (know/don't know)
router.patch('/:id/status', async (req, res) => {
    try {
        const userId = req.userId;
        const wordId = Number(req.params.id);
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        const [rows] = await db_1.pool.query('SELECT id FROM words WHERE id = ? AND user_id = ? LIMIT 1', [wordId, userId]);
        const words = rows;
        if (words.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }
        await db_1.pool.query('UPDATE words SET status = ? WHERE id = ?', [
            status,
            wordId
        ]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Update word status error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Delete word
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const wordId = Number(req.params.id);
        const [rows] = await db_1.pool.query('SELECT id FROM words WHERE id = ? AND user_id = ? LIMIT 1', [wordId, userId]);
        const words = rows;
        if (words.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }
        await db_1.pool.query('DELETE FROM words WHERE id = ?', [wordId]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete word error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
