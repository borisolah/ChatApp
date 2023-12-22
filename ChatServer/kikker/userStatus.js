const kikker = {
  username: "Kikker",
  activity: "pleased",
  substance: "bufo",
  activity: "vision",
};
let onlineUsersList = [kikker];
function addOnlineUser(username) {
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

function removeOnlineUser(username) {
  onlineUsersList = onlineUsersList.filter((u) => u.username !== username);
}

function updateUserActivity(username, activity) {
  console.log(onlineUsersList);
  const user = onlineUsersList.find((u) => u.username === username);
  if (user) {
    user.activity = activity;
  }
}
function updateUserSubstance(username, substance) {
  const user = onlineUsersList.find((u) => u.username === username);
  if (user) {
    user.substance = substance;
  }
}

function updateUserMood(username, mood) {
  const user = onlineUsersList.find((u) => u.username === username);
  if (user) {
    user.mood = mood;
  }
}

module.exports = {
  onlineUsersList,
  addOnlineUser,
  removeOnlineUser,
  updateUserActivity,
  updateUserSubstance,
  updateUserMood,
};
