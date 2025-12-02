"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
// Get all groups for current user
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        const [rows] = await db_1.pool.query('SELECT id, name, description, color, created_at, updated_at FROM groups WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error('Get groups error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Create new group
router.post('/', async (req, res) => {
    try {
        const userId = req.userId;
        const { name, description, color } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const [result] = await db_1.pool.query('INSERT INTO groups (user_id, name, description, color) VALUES (?,?,?,?)', [userId, name, description || null, color || null]);
        const insertResult = result;
        const groupId = insertResult.insertId;
        const [rows] = await db_1.pool.query('SELECT id, name, description, color, created_at, updated_at FROM groups WHERE id = ?', [groupId]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        console.error('Create group error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update group
router.put('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const groupId = Number(req.params.id);
        const { name, description, color } = req.body;
        const [rows] = await db_1.pool.query('SELECT id FROM groups WHERE id = ? AND user_id = ? LIMIT 1', [groupId, userId]);
        const groups = rows;
        if (groups.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }
        await db_1.pool.query('UPDATE groups SET name = ?, description = ?, color = ? WHERE id = ?', [name, description || null, color || null, groupId]);
        const [updated] = await db_1.pool.query('SELECT id, name, description, color, created_at, updated_at FROM groups WHERE id = ?', [groupId]);
        res.json(updated[0]);
    }
    catch (err) {
        console.error('Update group error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Delete group
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const groupId = Number(req.params.id);
        const [rows] = await db_1.pool.query('SELECT id FROM groups WHERE id = ? AND user_id = ? LIMIT 1', [groupId, userId]);
        const groups = rows;
        if (groups.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }
        await db_1.pool.query('DELETE FROM groups WHERE id = ?', [groupId]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete group error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
