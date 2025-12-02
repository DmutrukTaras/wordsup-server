import { Router } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Get all groups for current user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const [rows] = await pool.query(
      'SELECT id, name, description, color, created_at, updated_at FROM groups WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get groups error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new group
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { name, description, color } = req.body as {
      name?: string;
      description?: string;
      color?: string;
    };

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO groups (user_id, name, description, color) VALUES (?,?,?,?)',
      [userId, name, description || null, color || null]
    );
    const insertResult = result as { insertId: number };
    const groupId = insertResult.insertId;

    const [rows] = await pool.query(
      'SELECT id, name, description, color, created_at, updated_at FROM groups WHERE id = ?',
      [groupId]
    );

    res.status(201).json((rows as any[])[0]);
  } catch (err) {
    console.error('Create group error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update group
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const groupId = Number(req.params.id);
    const { name, description, color } = req.body as {
      name?: string;
      description?: string;
      color?: string;
    };

    const [rows] = await pool.query(
      'SELECT id FROM groups WHERE id = ? AND user_id = ? LIMIT 1',
      [groupId, userId]
    );
    const groups = rows as Array<{ id: number }>;
    if (groups.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await pool.query(
      'UPDATE groups SET name = ?, description = ?, color = ? WHERE id = ?',
      [name, description || null, color || null, groupId]
    );

    const [updated] = await pool.query(
      'SELECT id, name, description, color, created_at, updated_at FROM groups WHERE id = ?',
      [groupId]
    );

    res.json((updated as any[])[0]);
  } catch (err) {
    console.error('Update group error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete group
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const groupId = Number(req.params.id);

    const [rows] = await pool.query(
      'SELECT id FROM groups WHERE id = ? AND user_id = ? LIMIT 1',
      [groupId, userId]
    );
    const groups = rows as Array<{ id: number }>;
    if (groups.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await pool.query('DELETE FROM groups WHERE id = ?', [groupId]);

    res.json({ success: true });
  } catch (err) {
    console.error('Delete group error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
