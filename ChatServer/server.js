const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const socketIo = require("socket.io");
const cors = require("cors");
const loginRoutes = require("./login");
const jwt = require("jsonwebtoken");
const corsConfig = require("./corsConfig");
const {
  fetchMessages,
  insertMessage,
  formatMessage,
} = require("./db/dbOperations");

const app = express();
app.use(cors(corsConfig));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsConfig,
});
app.use(loginRoutes);
app.use(express.json());

let onlineUsers = [];

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }
  jwt.verify(token, "mySuperSecretKey12345!@#", (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
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
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
