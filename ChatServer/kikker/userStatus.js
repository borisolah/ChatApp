function addOnlineUser(onlineUsersList, username) {
  const user = onlineUsersList.find((u) => u.username === username);
  if (!user) {
    onlineUsersList.push({
      username,
      activity: null,
      substance: null,
      mood: null,
    });
  }
}

function removeOnlineUser(onlineUsersList, username) {
  return onlineUsersList.filter((u) => u.username !== username);
}

function updateUserActivity(onlineUsersList, username, activity) {
  const user = onlineUsersList.find((u) => u.username === username);
  if (user) {
    user.activity = activity;
  }
}

function updateUserSubstance(onlineUsersList, username, substance) {
  const user = onlineUsersList.find((u) => u.username === username);
  if (user) {
    user.substance = substance;
  }
}

function updateUserMood(onlineUsersList, username, mood) {
  const user = onlineUsersList.find((u) => u.username === username);
  if (user) {
    user.mood = mood;
  }
}

module.exports = {
  addOnlineUser,
  removeOnlineUser,
  updateUserActivity,
  updateUserSubstance,
  updateUserMood,
};
