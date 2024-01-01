const uuidv4 = require("uuid").v4;
const { handleCommands } = require("./kikker");

async function processChatMessage(
  messageData,
  insertMessage,
  formatMessage,
  io, socket, user
) {
  if (!messageData.message.startsWith("/")) {
    const newMessage = {
      ...messageData,
      userid: user.id,
      type: "message",
      channel: 1, // TODO: insert the correct channel here. probably set it in the frontend but check if valid here (no eavesdropping or disturbing private chats!)
      id: uuidv4(),
      date: new Date(),
    };
    io.emit("message", formatMessage(newMessage)); 
    await insertMessage(newMessage);
  }
  handleCommands(io, socket, messageData)  // kikker and /chat
}

module.exports = processChatMessage;
