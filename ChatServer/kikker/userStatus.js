const dbops = require("../db/dbOperations.js");
const onlineUsersList = require("../onlineUsersList.js");

dbops.clearInactiveNicksAndIcons();
dbops.clearAncientHistory();
// every 5 min, remove inactive nicks and icons 
setInterval(dbops.clearInactiveNicksAndIcons, 300000);
// every 3h, remove messages older than a week
setInterval(dbops.clearAncientHistory, 10800000)


function findIfOnline(user) {
  if (typeof user === "string"){
    return onlineUsersList.find((u) => u.userName === user);
  }
  return user;
}

async function addOnlineUser(username) {
  const user = findIfOnline(username);
  if (!user) {
    const userobj = await dbops.getUserByName(username);
    if (!userobj.userName) {
      console.error("userStatus.addOnlineUser():", username, "from db has no userName:", userobj);
      return;
    }
    userobj.roles = ['user'];
    //userobj.roles = getUserRoles(userobj.id); // TODO: write this. also, it should not require an additional query, but already be there after getUserByN(ame|ick)
    if (!userobj.chatNick) {
      userobj.chatNick = userobj.userName;
    }
    
    //console.log(userobj);
    onlineUsersList.add(userobj);
  }
}

function getChannelSubscriptions(username) {
  const user = findIfOnline(username);
  // TODO: return dbops.getChannelSubscriptions(user);
  console.log("getChannelSubscriptions:", username);
  return [];
}

function removeOnlineUser(username) {
  console.log("removeOnlineUser:", username);
  // await dbops.removeOnlineUser(username);
  onlineUsersList.remove(findIfOnline(username));
}

async function updateUserActivity(username, activity) {
  const user = findIfOnline(username);
  if (user) {
    user.activity = activity;
    onlineUsersList.emit();
    await dbops.updateUserActivity(user.id, activity);
  }
}

async function updateUserSubstance(username, substance) {
  const user = findIfOnline(username);
  if (user) {
    user.substance = substance;
    onlineUsersList.emit();
    await dbops.updateUserSubstance(user.id, substance);
  }
}

async function updateUserMood(username, mood) {
  const user = findIfOnline(username);
  if (user) {
    user.mood = mood;
    onlineUsersList.emit();
    await dbops.updateUserMood(user.id, mood);
  }
}

async function updateUserNick(username, nick) {
  console.log("updateUserNick:", username);
  const user = findIfOnline(username);
  if (user) {
    const inuse = await dbops.isNickInUse(nick);
    console.log("userStatus.updateUserNick:", user.id, username, nick, inuse);
    if (inuse == 0) {
      user.chatNick = nick.trim() || user.userName;
      onlineUsersList.emit();
      await dbops.updateUserNick(user.id, user.chatNick);
      console.log("updateUserNick done");
    }
  }
}

async function updateUserColors(username, usercolor, textcolor) {
  const user = findIfOnline(username);
  if (user) {
    user.userColor = usercolor;
    user.textColor = textcolor;
    onlineUsersList.emit();
    await dbops.updateUserColors(user.id, usercolor, textcolor);
  }
}

module.exports = {
  findIfOnline,
  addOnlineUser,
  removeOnlineUser,
  updateUserActivity,
  updateUserSubstance,
  updateUserMood,
  updateUserNick,
  updateUserColors,
  getChannelSubscriptions
};
