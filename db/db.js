const { Pool } = require("pg");

const pool = new Pool({
  user: "kennydn99",
  host: "localhost",
  database: "members_only",
  password: "Duclam@1999",
  port: 5432, // Default PostgreSQL port
});

module.exports = pool;
