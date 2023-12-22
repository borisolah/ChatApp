const kikker = {
  username: "Kikker",
  activity: "vision",
  substance: "bufo",
  mood: "pleased",
};
let onlineUsersList = [kikker];
const userTimeouts = {};

const TIMEOUT_DURATION = 120000;

function addOnlineUser(username) {
  const user = onlineUsersList.find((u) => u.username === username);
  if (!user) {
    onlineUsersList.push({
      username,
      activity: null,
      substance: null,
      mood: null,
    });
  } else {
    clearTimeout(userTimeouts[username]);
    delete userTimeouts[username];
  }
}

function removeOnlineUser(username) {
  userTimeouts[username] = setTimeout(() => {
    onlineUsersList = onlineUsersList.filter((u) => u.username !== username);
    delete userTimeouts[username];
  }, TIMEOUT_DURATION);
}

function updateUserActivity(username, activity) {
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
