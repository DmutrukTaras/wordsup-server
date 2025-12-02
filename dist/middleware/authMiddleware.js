"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ message: 'No authorization header' });
    }
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Invalid auth header' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.userId = payload.userId;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
