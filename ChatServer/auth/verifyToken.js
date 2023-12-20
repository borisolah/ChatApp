const jwt = require("jsonwebtoken");

const verifyToken = (token, callback) => {
  jwt.verify(token, "mySuperSecretKey12345!@#", (err, decoded) => {
    if (err) {
      return callback(new Error("Authentication error: Invalid token"));
    }
    callback(null, decoded);
  });
};

module.exports = verifyToken;
