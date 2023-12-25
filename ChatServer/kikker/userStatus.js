function addOnlineUser(onlineUsersList, username) {
  const user = onlineUsersList.find((u) => u.username === username);
  if (!user) {
    // TODO: here needs to be a lookup - the user must be in the DB, and their roles must be loaded from there.
    // maybe: we could also store and load the last used nick, activity, substance, mood
    onlineUsersList.push({
      username,
      nick: username,
      roles: ['user'], // TODO: load this from DB
      activity: null,
      substance: null,
      mood: null,
    });
  }
}

function removeOnlineUser(onlineUsersList, username) {
  return onlineUsersList.filter((u) => u.username !== username);
}

function findIfOnline(onlineUsersList, username) {
  return onlineUsersList.find((u) => u.username === username);
}

function updateUserActivity(onlineUsersList, username, activity) {
  const user = findIfOnline(onlineUsersList, username);
  if (user) {
    user.activity = activity;
  }
}

function updateUserSubstance(onlineUsersList, username, substance) {
  const user = findIfOnline(onlineUsersList, username);
  if (user) {
    user.substance = substance;
  }
}

function updateUserMood(onlineUsersList, username, mood) {
  const user = findIfOnline(onlineUsersList, username);
  if (user) {
    user.mood = mood;
  }
}

function updateUserNick(onlineUsersList, username, nick) {
  const user = findIfOnline(onlineUsersList, username);
  if (user) {
    user.nick = nick;
  }
}

module.exports = {
  findIfOnline,
  addOnlineUser,
  removeOnlineUser,
  updateUserActivity,
  updateUserSubstance,
  updateUserMood,
  updateUserNick
};
