"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testDbConnection = testDbConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("./config");
exports.pool = promise_1.default.createPool({
    host: config_1.config.db.host,
    port: config_1.config.db.port,
    user: config_1.config.db.user,
    password: config_1.config.db.password,
    database: config_1.config.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
async function testDbConnection() {
    const conn = await exports.pool.getConnection();
    const [rows] = await conn.query('SELECT 1 AS ping');
    conn.release();
    console.log('DB ping result:', rows);
}
