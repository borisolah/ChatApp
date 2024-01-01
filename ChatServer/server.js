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

const onlineUsersList = require('./onlineUsersList.js')
onlineUsersList.init(io);

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
  userStatus.addOnlineUser(username);
  const user = onlineUsersList.find((u) => u.userName === username);
  if (!user || !user.id) {
    socket.emit("reload");
    return;
  }
  onlineUsersList.emit(socket);
  socket.to(username).emit("vanish");
  socket.join(username);
  socket.join("Welcome Area");
  socket.emit("join", "Welcome Area");
  if (user.roles.includes('user')) {
    socket.join("Questionnaire");
    socket.emit("join", "Questionnaire");
    socket.join("Fun and Offtopic");
    socket.emit("join", "Fun and Offtopic");
    socket.join("Hyperspace Chat");
    socket.emit("join", "Hyperspace Chat");
  }
  for (let channel of userStatus.getChannelSubscriptions(user)) {
    socket.join(channel);
    socket.emit("join", channel);
  }
  const messages = await fetchMessages(); // fetchUserChannelsMessages(userid)
  socket.emit("initialMessages", messages);
  socket.on("newMessage", async (messageData) => {
    // console.log(messageData);
    await processChatMessage(messageData, insertMessage, formatMessage, io, socket, user);
  });
  socket.on("disconnect", () => {
    disconnectTimers[username] = setTimeout(() => {
      userStatus.removeOnlineUser(user);
      delete disconnectTimers[username];
    }, 120000);
  });
});

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
app.delete("/deleteFile/:fileName", (req, res) => {
  const token = req.headers.authorization;
  verifyToken(token, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.decoded = decoded;

    const fileName = req.params.fileName;
    const filePath = path.join(uploadsDir, fileName);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        // Check if the error is because the file was not found
        if (err.code === "ENOENT") {
          return res.status(404).json({ message: "File not found" });
        } else {
          return res.status(500).json({ message: "Error deleting file" });
        }
      }
      res.json({ message: "File deleted successfully" });
    });
  });
});

app.get("/uploads", (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Error reading files:", err);
      return res.status(500).json({ message: "Error reading files" });
    }
    const fileInfos = files
      .filter((file) => file !== ".gitignore")
      .sort((a,b) => fs.statSync(path.join(uploadsDir, a)).birthtimeMs - fs.statSync(path.join(uploadsDir, b)).birthtimeMs)
      .map((file) => {
        const url = `${req.protocol}://${req.headers.host}/uploads/${file}`;
        const filePath = path.join(uploadsDir, file);
        return {
          name: file,
          url: url,
          type: mime.lookup(filePath) || "unknown",
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
