require("dotenv/config");

const sqlCredentials = {
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  timezone: "Asia/Manila",
};

module.exports = { sqlCredentials };
