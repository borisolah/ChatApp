const pool = require("./index");

async function fetchMessages() {
  const res = await pool.query(
    `SELECT 
    id, channel, userid as "userId", username as "userName", 
    type, message, user_color as "userColor", text_color as "textColor", date 
    FROM messages
    WHERE date > NOW() - interval '3 days'
    ORDER BY date ASC;`
  );
  return res.rows.map(formatMessage);
}
async function fetchChannelMessages(channelid) {
  const res = await pool.query(
    `SELECT * FROM (
      SELECT
      id, channel, userid as "userId", username as "userName", 
      type, message, user_color as "userColor", text_color as "textColor", date 
      FROM messages
      WHERE channel=$1 AND date > NOW() - interval '3 days'
      ORDER BY date DESCENDING
      LIMIT 2000
    ) s
    ORDER BY s.date ASC;`, 
    [channelid]
  );
  return res.rows.map(formatMessage);
}
async function fetchUserChannelsMessages(userid) {
  const res = await pool.query(
    // TODO: SQL SELECT that will give the messages for each channel the user is in, 
    // no older than 3 days, no more than 2000 per channel, in chronological order.
    `SELECT`, 
    [channelid]
  );
  return res.rows.map(formatMessage);
}
async function insertMessage(message) {
  await pool.query(
    `INSERT INTO messages 
    (id, channel, userid, username, type, message, user_color, text_color, date) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
    [message.id, message.channel, message.userId, message.userName, message.type, 
     message.message, message.userColor, message.textColor, message.date]
  );
  await pool.query(`UPDATE users SET chat_active=NOW() WHERE id=$1;`, 
  [message.userId]);
}
function formatMessage(message) {
  return {
    ...message,
    date: new Date(message.date).toLocaleTimeString("en-US", { hour12: false }),
  };
}

async function isNickInUse(nick) {
  console.log("isNickInUse:", nick);
  return await (await pool.query(
    `SELECT COUNT(*) 
    FROM users 
    WHERE username=$1 OR chat_nick=$1`,
    [nick]
  )).rows[0].count;
}

async function getUserByName(name) {
  const res = await pool.query(
    `SELECT 
    id, username as "userName", user_color as "userColor", text_color as "textColor", 
    default_search as "defaultSearch", chat_nick as "chatNick", mood, substance, activity
    FROM users 
    WHERE username=$1;`, 
  [name]);
  // const userobj = { ...await res.rows[0] };
  // return userobj;
  return { ...await res.rows[0] };
}
async function getUserByNick(nick) {
  const res =  await pool.query(
    `SELECT 
    id, username as "userName", user_color as "userColor", text_color as "textColor", 
    default_search as "defaultSearch", chat_nick as "chatNick" 
    FROM users 
    WHERE chat_nick=$1`, 
  [nick])
  return { ...await res.rows[0] };
}
async function getUserSalt(userid) {
  const res = await pool.query('SELECT pw_salt from users WHERE id=$1', 
  [userid])
  return { ...await res.rows[0] };
}
async function checkUserPassword(userid, pwhash) {
  // TODO: move these comments to Auth where they belong 
  // WARNING!!! as of now, this compares clear text passwords. this is a terrible idea.
  // TODO: getUserSalt(userid), calculate a salted hash, actually use hash in this.
  const res =  await pool.query('SELECT pw_hash=$1 FROM users WHERE id=$2', 
  [pwhash, userid])
  return { ...await res.rows[0] };
}
async function updateUserPassword(userid, salt, hash) {
  await pool.query('UPDATE users SET pw_salt=$1, pw_hash=$2 WHERE id=$3;',
  [salt, hash, userid]);
}
async function updateUserColors(userid, userColor, textColor) {
  await pool.query(`UPDATE users SET user_color=$1, text_color=$2, chat_active=NOW() WHERE id=$3;`,
  [userColor, textColor, userid]);
}
async function updateUserNick(userid, nick) {
  await pool.query('UPDATE users SET chat_nick=$1, chat_active=NOW() WHERE id=$2;',
  [nick, userid]);
}
async function updateUserActive(userid) {
  await pool.query('UPDATE users SET chat_active=NOW() WHERE id=$1;',
  [userid]);
}
async function updateUserMood(userid, mood) {
  await pool.query('UPDATE users SET mood=$1, chat_active=NOW() WHERE id=$2',
  [mood, userid]);
}
async function updateUserSubstance(userid, substance) {
  await pool.query(
    'UPDATE users SET substance=$1, chat_active=NOW() WHERE id=$2;',
    [substance, userid]);
}
async function updateUserActivity(userid, activity) {
  await pool.query(
    'UPDATE users SET activity=$1, chat_active=NOW() WHERE id=$2;',
    [activity, userid]);
}

async function clearUserState(userid) {
  await pool.query(
    `UPDATE users SET 
    nick=NULL,mood=NULL,substance=NULL,activity=NULL 
    WHERE id=$1;`,
    [userid]);
}

async function clearInactiveNicksAndIcons() {
  console.log("dbOperations.js: Clearing inactive Nicks and Icons");
  // TODO: also SET chat_active=NOW() for all users that are currently online.
  res = await pool.query(
    `UPDATE users SET 
    chat_nick=NULL, mood=NULL, substance=NULL, activity=NULL 
    WHERE id <> 0 AND (chat_active IS NULL OR chat_active < NOW() - interval '3 hours')`);
}

async function clearAncientHistory() {
  console.log("dbOperations.js: Clearing ancient messages");
  await pool.query(
    `DELETE FROM messages 
    WHERE date < NOW() - interval '1 week';`);
}

async function addUser(username, password) {
  console.log("dbOperations.js/addUser:", username);
  return await pool.query(`
    INSERT INTO users (username, pw_hash) VALUES
    ($1, $2)
    RETURNING *;
  `, [username, password]);
}

module.exports = { 
  fetchMessages, insertMessage, formatMessage, isNickInUse,
  getUserByName, getUserByNick, getUserSalt, checkUserPassword, 
  updateUserColors, updateUserNick, updateUserActive, updateUserPassword,
  updateUserMood, updateUserSubstance, updateUserActivity,
  clearUserState, 
  
  clearInactiveNicksAndIcons, clearAncientHistory,
  addUser
};
