const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "nexus_chat",
  password: process.env.DB_PASSWORD || "admin",
  port: 5432,
});

module.exports = pool;
