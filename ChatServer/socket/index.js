const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const pool = require("../db");

function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Token authentication logic here
    // ...
  });

  io.on("connection", (socket) => {
    // Socket event handlers here
    // ...
  });

  return io;
}

module.exports = setupSocket;
