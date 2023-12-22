const uuidv4 = require("uuid").v4;

async function processChatMessage(
  messageData,
  insertMessage,
  formatMessage,
  io
) {
  const messageText = messageData.message.trim().toLowerCase();
  if (messageText.startsWith("/")) {
    return;
  }
  const newMessage = {
    ...messageData,
    id: uuidv4(),
    date: new Date(),
  };
  await insertMessage(newMessage);
  io.emit("message", formatMessage(newMessage));
}

module.exports = processChatMessage;
