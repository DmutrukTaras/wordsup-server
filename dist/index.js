"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config/config");
const db_1 = require("./config/db");
const auth_1 = __importDefault(require("./routes/auth"));
const groups_1 = __importDefault(require("./routes/groups"));
const words_1 = __importDefault(require("./routes/words"));
const external_1 = __importDefault(require("./routes/external"));
const stats_1 = __importDefault(require("./routes/stats"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const app = (0, express_1.default)();
const corsOptions = {
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        const allowed = [
            'http://localhost:5173',
            /\.loca\.lt$/.test(origin),
            config_1.config.clientUrl
        ];
        if (allowed.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/auth', auth_1.default);
app.use('/api/groups', authMiddleware_1.authMiddleware, groups_1.default);
app.use('/api/words', authMiddleware_1.authMiddleware, words_1.default);
app.use('/api/stats', stats_1.default);
// external helper APIs (no auth needed for now)
app.use('/api/external', external_1.default);
const port = config_1.config.port;
app.listen(port, async () => {
    console.log(`Server listening on port-${port}`);
    try {
        await (0, db_1.testDbConnection)();
        console.log('DB connection OK');
    }
    catch (err) {
        console.error('DB connection FAILED', err);
    }
});
