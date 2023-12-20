const pool = require("./index");

async function fetchMessages() {
  const res = await pool.query(
    'SELECT id, message, date, username as "userName" FROM messages'
  );
  return res.rows.map(formatMessage);
}

async function insertMessage(message) {
  await pool.query(
    "INSERT INTO messages (id, username, message, date) VALUES ($1, $2, $3, $4)",
    [message.id, message.userName, message.message, message.date]
  );
}

function formatMessage(message) {
  return {
    ...message,
    date: new Date(message.date).toLocaleTimeString("en-US", { hour12: false }),
  };
}

module.exports = { fetchMessages, insertMessage, formatMessage };
