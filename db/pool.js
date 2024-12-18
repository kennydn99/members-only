require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://kennydn99:Duclam@1999@localhost:5432/members_only`,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
