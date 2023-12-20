const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const router = express.Router();
router.use(express.json());

router.post("/auth", (req, res) => {
  const { user, pwd } = req.body;
  const dbPath = path.join(__dirname, "database.json");

  try {
    const dbRawData = fs.readFileSync(dbPath);
    const db = JSON.parse(dbRawData);
    const userData = db.users.find(
      (u) => u.username === user && u.password === pwd
    );

    if (!userData) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = jwt.sign(
      { username: userData.username },
      "mySuperSecretKey12345!@#",
      {
        expiresIn: "1h",
      }
    );
    res.json({ accessToken: token, roles: userData.roles });
  } catch (error) {
    console.error("Error in /auth route: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
