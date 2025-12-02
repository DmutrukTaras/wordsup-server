"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }
        const [existing] = await db_1.pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        const existingRows = existing;
        if (existingRows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const [result] = await db_1.pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
        const insertResult = result;
        const userId = insertResult.insertId;
        const token = jsonwebtoken_1.default.sign({ userId }, config_1.config.jwtSecret, {
            expiresIn: '7d'
        });
        res.status(201).json({
            token,
            user: { id: userId, email }
        });
    }
    catch (err) {
        console.error('Register error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        console.log('Login attempt for password:', password);
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }
        const [rows] = await db_1.pool.query('SELECT id, password_hash FROM users WHERE email = ? LIMIT 1', [email]);
        const users = rows;
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = users[0];
        const isValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.config.jwtSecret, { expiresIn: '7d' });
        res.json({
            token,
            user: { id: user.id, email }
        });
    }
    catch (err) {
        console.error('Login error', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
