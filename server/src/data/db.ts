import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = await mysql.createPool({
  host: process.env.MYSQL_DB_HOST!,
  port: 3306,
  user: process.env.MYSQL_DB_USER!,
  password: process.env.MYSQL_DB_PASSWORD!,
  database: process.env.MYSQL_DB!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0 
});

try {
  await pool.query("SELECT 1");
  console.log("✅ Connected to MySQL database!");
} catch (err) {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
}

export default pool;
