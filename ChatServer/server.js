require("dotenv").config();
const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const socketIo = require("socket.io");
const cors = require("cors");
const loginRoutes = require("./auth/login");
const jwt = require("jsonwebtoken");
const corsConfig = require("./config/corsConfig");
const validateTokenRoute = require("./routes/validateTokenRoute");
const {
  fetchMessages,
  insertMessage,
  formatMessage,
} = require("./db/dbOperations");
const verifyToken = require("./auth/verifyToken");

const app = express();
app.use(cors(corsConfig));
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsConfig,
});
app.use(loginRoutes);
app.use(express.json());
app.use(validateTokenRoute);
let onlineUsers = [];

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
  onlineUsers.push(username);
  io.emit("onlineUsersList", onlineUsers);
  try {
    const messages = await fetchMessages();
    socket.emit("initialMessages", messages);
  } catch (err) {
    console.error("Error reading messages from database", err);
  }
  socket.on("newMessage", async (messageData) => {
    const newMessage = {
      ...messageData,
      id: uuidv4(),
      date: new Date(),
    };
    try {
      await insertMessage(newMessage);
      io.emit("message", formatMessage(newMessage));
    } catch (err) {
      console.error("Error writing message to database", err);
    }
  });
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user !== username);
    io.emit("onlineUsersList", onlineUsers);
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.CHAT_SERVER_HOST;
server.listen(PORT, HOST, () =>
  console.log(`Server running on ${HOST}:${PORT}`)
);
