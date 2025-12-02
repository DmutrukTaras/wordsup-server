import mysql from 'mysql2/promise';
import { config } from './config';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testDbConnection() {
  const conn = await pool.getConnection();
  const [rows] = await conn.query('SELECT 1 AS ping');
  conn.release();
  console.log('DB ping result:', rows);
}
