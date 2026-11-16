import mysql, { type Pool } from "mysql2/promise";

const globalForDb = globalThis as typeof globalThis & { mysqlPool?: Pool };

const isCloudDb =
  process.env.DB_HOST &&
  process.env.DB_HOST !== "localhost" &&
  process.env.DB_HOST !== "127.0.0.1";

export const db =
  globalForDb.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
    queueLimit: 0,
    charset: "utf8mb4",
    ...(isCloudDb
      ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }
      : {}),
  });

if (process.env.NODE_ENV !== "production") globalForDb.mysqlPool = db;