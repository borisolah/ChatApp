require("dotenv").config();
const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const socketIo = require("socket.io");
const cors = require("cors");
const loginRoutes = require("./auth/login");
const corsConfig = require("./config/corsConfig");
const validateTokenRoute = require("./routes/validateTokenRoute");
const {
  fetchMessages,
  insertMessage,
  formatMessage,
} = require("./db/dbOperations");
const verifyToken = require("./auth/verifyToken");
const { listenForMessages } = require("./kikker/kikker");
const userStatus = require("./kikker/userStatus");
const processChatMessage = require("./kikker/processChatMessage"); // Adjust the path as necessary

const app = express();
app.use(cors(corsConfig));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsConfig,
});
app.use(loginRoutes);
app.use(express.json());
app.use(validateTokenRoute);
const kikker = {
  username: "Kikker",
  mood: "pleased",
  substance: "bufo",
  activity: "vision",
};
let onlineUsersList = [kikker];
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  verifyToken(token, (err, decoded) => {
    if (err) {
      return next(err);
    }
    socket.decoded = decoded;
    next();
  });
});

const disconnectTimers = {};

io.on("connection", async (socket) => {
  const username = socket.decoded.username;
  console.log(`${username} connected`);

  // Clear disconnect timer if it exists
  if (disconnectTimers[username]) {
    clearTimeout(disconnectTimers[username]);
    delete disconnectTimers[username];
  }

  userStatus.addOnlineUser(onlineUsersList, username);
  console.log(`Current users after ${username} added:`, onlineUsersList);

  io.emit("onlineUsersList", onlineUsersList);
  const messages = await fetchMessages();
  socket.emit("initialMessages", messages);

  socket.on("newMessage", async (messageData) => {
    await processChatMessage(messageData, insertMessage, formatMessage, io);
  });

  socket.on("disconnect", () => {
    console.log(`${username} disconnected, starting timer`);
    disconnectTimers[username] = setTimeout(() => {
      onlineUsersList = userStatus.removeOnlineUser(onlineUsersList, username);
      console.log(`${username} removed after timeout`);
      console.log(`Current users after ${username} removed:`, onlineUsersList);
      io.emit("onlineUsersList", onlineUsersList);
      delete disconnectTimers[username];
    }, 120000); // 5 seconds for testing
  });
});

listenForMessages(io);

const PORT = process.env.PORT || 3001;
const HOST = process.env.CHAT_SERVER_HOST;
server.listen(PORT, HOST, () =>
  console.log(`Server running on ${HOST}:${PORT}`)
);
