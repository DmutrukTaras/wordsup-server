"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: Number(process.env.PORT) || 4000,
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'english_dictionary'
    },
    externalApis: {
        pexelsApiKey: process.env.PEXELS_API_KEY || '',
        libreTranslateUrl: process.env.LIBRETRANSLATE_URL || 'https://libretranslate.de'
    },
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
