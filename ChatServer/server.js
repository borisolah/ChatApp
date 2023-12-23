require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const socketIo = require("socket.io");
const cors = require("cors");
const loginRoutes = require("./auth/login");
const mime = require("mime-types");
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
const processChatMessage = require("./kikker/processChatMessage");
const processFile = require("./fileProcessor");

const app = express();
app.use(cors(corsConfig));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsConfig,
});
app.use(loginRoutes);
app.use(express.json());
app.use(validateTokenRoute);

const uploadsDir = path.join(__dirname, "uploads");

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
  const token = req.headers.authorization;
  verifyToken(token, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.decoded = decoded;
    try {
      await processFile(req.file.path);
      res
        .status(200)
        .json({ message: "File uploaded and processed successfully" });
    } catch (processError) {
      console.error("Error processing file:", processError);
      res.status(500).json({ message: "Error processing file" });
    }
  });
});

app.get("/uploads", (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Error reading files:", err);
      return res.status(500).json({ message: "Error reading files" });
    }
    const fileInfos = files.map((file) => {
      const url = `${req.protocol}://${req.get("host")}/uploads/${file}`;
      return {
        name: file,
        url: url,
        type: mime.lookup(file) || "unknown",
      };
    });
    res.json({ files: fileInfos });
  });
});

app.use("/uploads", express.static(uploadsDir));

const PORT = process.env.PORT || 3001;
const HOST = process.env.CHAT_SERVER_HOST;
server.listen(PORT, HOST, () =>
  console.log(`Server running on ${HOST}:${PORT}`)
);
