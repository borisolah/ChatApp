const express = require("express");
const verifyToken = require("../auth/verifyToken");
const router = express.Router();

router.post("/validateToken", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  verifyToken(token, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.json({ valid: true, decoded });
  });
});

module.exports = router;
