import mysql from 'mysql2/promise';

/**
 * MySQL Database Connection Pool
 *
 * Supports standard application environment variables & aaPanel/phpMyAdmin defaults:
 * - DB_CONNECTION: 'mysql'
 * - DB_HOST / MYSQL_HOST: Database Host (default: 'localhost')
 * - DB_PORT / MYSQL_PORT: Database Port (default: 3306)
 * - DB_DATABASE / DB_NAME / MYSQL_DATABASE: Database Name (default: 'hmqin')
 * - DB_USERNAME / DB_USER / MYSQL_USER: Database User (default: 'hmqin')
 * - DB_PASSWORD / MYSQL_PASSWORD: Set in server environment only
 */

export const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQL_PORT) || 3306,
  user: process.env.DB_USERNAME || process.env.DB_USER || process.env.MYSQL_USER || 'hmqin',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.MYSQL_DATABASE || 'hmqin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);

// Utility helper function to test database connectivity
export async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Successfully connected to MySQL Database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error);
    return false;
  }
}
