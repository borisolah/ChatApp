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
io.on("connection", async (socket) => {
  const username = socket.decoded.username;
  userStatus.addOnlineUser(username);
  io.emit("onlineUsersList", userStatus.onlineUsersList);
  const messages = await fetchMessages();
  socket.emit("initialMessages", messages);
  socket.on("newMessage", async (messageData) => {
    await processChatMessage(messageData, insertMessage, formatMessage, io);
  });

  socket.on("disconnect", () => {
    userStatus.removeOnlineUser(username);
    io.emit("onlineUsersList", userStatus.getOnlineUsers);
  });
});
listenForMessages(io);

const PORT = process.env.PORT || 3001;
const HOST = process.env.CHAT_SERVER_HOST;
server.listen(PORT, HOST, () =>
  console.log(`Server running on ${HOST}:${PORT}`)
);
