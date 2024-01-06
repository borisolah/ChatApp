const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const router = express.Router();
router.use(express.json());
const dbops = require("../db/dbOperations.js");
//const { addOnlineUser } = require(""); // TODO

const doAuth = async (req, res) => {
  let { user, pwd } = req.body;
  user = user.trim();
  pwd = pwd.trim();
  console.log("/auth login:", user);
  const userobj = await dbops.getUserByName(user) || [];
  // const dbPath = path.join(__dirname, "../database.json");

  console.log("received from db:", userobj);
  try {
    // const dbRawData = fs.readFileSync(dbPath);
    // const db = JSON.parse(dbRawData);
    // const userData = db.users.find(
    //   (u) => u.username === user && u.password === pwd
    // );

    // if (!userData) {
    if (!(userobj['userName'] || userobj['username'])) {
      await (await dbops.addUser(user, pwd)).rows;
      return await doAuth(req, res);
      // return res.status(401).json({ message: "Unauthorized" });
    }
    // TODO: password verification
    // TODO: addOnlineUser(userobj);
    const token = jwt.sign(
      { username: userobj.userName || userobj.username },
      // { username: userData.username },
      "mySuperSecretKey12345!@#",
      {
        expiresIn: "30d",
      }
    );
    res.json({ accessToken: token, roles: userobj.roles || ['user'] }); //userData.roles });
  } catch (error) {
    console.error("Error in /auth route: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

router.post("/auth", doAuth);

module.exports = router;
