const uuidv4 = require("uuid").v4;
const { handleCommands } = require("./kikker");

async function processChatMessage(
  messageData,
  insertMessage,
  formatMessage,
  io, socket, user
) {
  if (!messageData.channel) {
    console.log("Received message without channel:", messageData);
    // TODO: log this with IP etc. it might be hacking activity.
    return;
  }
  // TODO: check if channel valid here (no eavesdropping or disturbing private chats!)
  if (!messageData.message.startsWith("/")) {
    const newMessage = {
      ...messageData,
      userid: user.id,
      type: "message",
      id: uuidv4(),
      date: new Date(),
    };
    io.to(messageData.channel).emit("message", formatMessage(newMessage)); 
    await insertMessage(newMessage);
  }
  handleCommands(io, socket, messageData)  // kikker and /chat
}

module.exports = processChatMessage;
