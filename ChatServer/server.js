require("dotenv").config();
const express = require("express");
const http = require("http");
const multer = require("multer");
const socketIo = require("socket.io");
const cors = require("cors");
const loginRoutes = require("./auth/login");
const corsConfig = require("./config/corsConfig");
const uuidv4 = require("uuid").v4;
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
const disconnectTimers = {};

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
  if (disconnectTimers[username]) {
    clearTimeout(disconnectTimers[username]);
    delete disconnectTimers[username];
  }
  userStatus.addOnlineUser(onlineUsersList, username);
  io.emit("onlineUsersList", onlineUsersList);
  const messages = await fetchMessages();
  socket.emit("initialMessages", messages);
  socket.on("newMessage", async (messageData) => {
    await processChatMessage(messageData, insertMessage, formatMessage, io);
  });
  socket.on("disconnect", () => {
    disconnectTimers[username] = setTimeout(() => {
      onlineUsersList = userStatus.removeOnlineUser(onlineUsersList, username);
      io.emit("onlineUsersList", onlineUsersList);
      delete disconnectTimers[username];
    }, 120000);
  });
});

listenForMessages(io, onlineUsersList);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res, next) => {
  const token = req.headers.authorization; // or however you're sending the token

  verifyToken(token, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    req.decoded = decoded;

    // Token is valid, proceed with file upload handling
    console.log("File uploaded:", req.file);
    res.status(200).json({ message: "File uploaded successfully" });
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.CHAT_SERVER_HOST;
server.listen(PORT, HOST, () =>
  console.log(`Server running on ${HOST}:${PORT}`)
);
