
const { v4: uuidv4 } = require("uuid");
const { insertMessage, formatMessage } = require("../db/dbOperations");
const userStatus = require("./userStatus.js");
const maxNickLength = 22;

const kikkerShouldAnswers = [
  "Yes", "No", "Seriously?", "Ahem, let me look the other way...", "Kikker ... kikk ... kikkkk ... kikkkkkerrrrrrrrrr",
  "So you think today IS a good day?", "Hahahaha (sure)", "Pffffft (according to dreamer)", "Wonderful, good thing to perform!"
];

async function emitMessage(io, userName, messageContent) {
  const message = {
    userName: userName,
    message: messageContent,
    id: uuidv4(),
    date: new Date(),
  };

  await insertMessage(message);
  io.emit("message", formatMessage(message));
}

function parseTokenFromArgs(args){
  if (args.startsWith('"'))
    return args.slice(1, args.slice(1).indexOf('"')) || args.slice(1);
  return args.slice(0, args.indexOf(' ')) || args;
}

function highestRole(user) {
  i = 0;
  for (let role of ['admin', 'mod', 'senior', 'welcome', 'user', 'sprout']) {
    if (user.roles.includes(role)) 
      return i;
    i++;
  }
}

function canKick(banning, banned) {
  banning_level = highestRole(banning);
  return (banning_level < 4) && (banning_level <= highestRole(banned));
}


function handleKikkerCommands(io, command, args) {
  const randomNum = Math.random();
  const term = args.trim();
  let Url;
  switch (command) {
    case "choose":
      console.log("choose");
      let choice;
      if (randomNum < 0.1) {
        choice = "None of the above";
      } else {
        const options = args.split(/\|{1,2}/).map((s) => s.trim());
        choice = options[Math.floor(Math.random() * options.length)];
      }
      emitMessage(io, "Kikker", `The choice is: ${choice}`);
      break;
    case "should":
      emitMessage(io, "Kikker", kikkerShouldAnswers[Math.floor(Math.random() * kikkerShouldAnswers.length)]);
      break;
    case "define":
      Url = `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(
        term
      )}`;
      // TODO: this should contain only the URL, which should be made into <a> in the frontend:
      emitMessage(io, "Kikker", `Urban definition: ${Url}`); 
      break;
    case "search":
    case "duck":
      Url = `https://duckduckgo.com/?q=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, "Kikker", `DuckDuckGo results: ${Url}`);
      break;
    case "google":
      Url = `https://www.google.com/search?q=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, "Kikker", `Google results: ${Url}`);
      break;
    case "youtube":
      Url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, "Kikker", `Youtube results: ${Url}`);
      break;
    case "imdb":
      Url = `https://www.imdb.com/find/?q=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, "Kikker", `IMDB results: ${Url}`);
      break;
    case "dice":
      const argsArray = args.split(" ").map(Number);
      let numberOfDice = argsArray[0];
      const sidesOfDice = argsArray[1];
      numberOfDice = numberOfDice > 42 ? 42 : numberOfDice;
      let diceResults = "";
      for (let i = 0; i < numberOfDice; i++) {
        const roll = Math.floor(Math.random() * sidesOfDice) + 1;
        diceResults += `[${i + 1}] ${roll}   ௵ `;
      }
      emitMessage(io, "Kikker", diceResults.trim());
      break;
    default:
      // TODO: serve individual kikker symbol if there is one for this user. Otherwise:
      emitMessage(io, "Kikker", ":)");
      break;
  }
}

function handleUserCommands(io, socket, command, args, onlineUsersList) {
  const username = socket.decoded.username;
  const user = userStatus.findIfOnline(onlineUsersList, username);
  switch (command) {
    case "activity":
      userStatus.updateUserActivity(onlineUsersList, username, args);
      io.emit("onlineUsersList", onlineUsersList);
      break;
    case "substance":
      userStatus.updateUserSubstance(onlineUsersList, username, args);
      io.emit("onlineUsersList", onlineUsersList);
      break;
    case "mood":
      userStatus.updateUserMood(onlineUsersList, username, args);
      io.emit("onlineUsersList", onlineUsersList);
      break;
    case "nick":
      userStatus.updateUserNick(onlineUsersList, username, args.slice(0, maxNickLength).trim());
      io.emit("onlineUsersList", onlineUsersList);
      break;
    case "pass":
      const passto = parseTokenFromArgs(args);
      const thing = args.slice(passto.length + 1).trim();
      if (userStatus.findIfOnline(onlineUsersList, passto)) {
        // TODO: (in the frontend?) recognise if this is a special thing with an animation.
        io.emit("pass", `${username} passes ${thing} to ${passto}`) // 'pass' signal ok?
      } else {
        socket.emit("warning", `No such active user: ${passto}`) // 'warning' signal ok?
      }
      break;
    case "kick":
      if (user) {
        const tobekicked = userStatus.findIfOnline( parseTokenFromArgs(args) );
        if (tobekicked) {
          const reason =  args.slice(tobekicked.username.length + 1).trim();
          if (canKick(user, tobekicked)) {
            // TODO: actually kick that user *from this room*
            io.emit("info", `${tobekicked.username} was kicked by ${username} (REASON: ${reason||"no reason"})`); // signal "info" ok?
            break;
          }
          socket.emit("warning", `You do not have sufficient rights to kick ${tobekicked.username}`);
          break;
        } 
        socket.emit("warning", `No such active user: ${tobekicked.username}`);
        break;
      }
      socket.emit("reload_chat_page"); // socket used a username that's not in onlineUsersList, make their page reload.
      break;
    case "ban":
      if (user) {
        const tobebanned = userStatus.findIfOnline( parseTokenFromArgs(args) );
        if (tobebanned) {
          const reason =  args.slice(tobebanned.username.length + 1).trim();
          if (canKick(user, tobebanned)) {
            // TODO: actually ban that user *from this room*
            io.emit("info", `${tobebanned.username} was banned by ${username} (REASON: ${reason||"no reason"})`);
            break;
          }
          socket.emit("warning", `You do not have sufficient rights to kick ${tobebanned.username}`);
          break;
        } 
        socket.emit("warning", `No such active user: ${tobebanned.username}`);
        break;
      }
      socket.emit("reload_chat_page"); // socket used a username that's not in onlineUsersList, make their page reload.
      break;
    case "invite":
      // TODO: find args in onlineUsersList if they're not *in this room*
      // TODO: if found, check necessary privileges and if ok, add them to this room.
      io.emit("info", `${args} was invited by ${username}.`);
      break;
    case "me":
      io.emit("me", `${username} ${args}`); // signal "me" ok?
      break;
  }
}


async function listenForMessages(io, onlineUsersList) {
  io.on("connection", (socket) => {
    socket.on("newMessage", async (messageData) => {
      const msg = messageData.message.trim();
      if (messageData.message.startsWith('/')) { // only do user commands if there is no space before the /
        const cend = (msg.indexOf(' ')+1) || msg.length;
        const command = msg.slice(1, cend).trim().toLowerCase();
        const args = msg.slice(cend).trim();
        handleUserCommands(io, socket, command, args, onlineUsersList);
      }
      if (msg.slice(0,7).toLowerCase() === "kikker ") {
        const kmsg = msg.slice(7).trim();
        const command = kmsg.split(" ")[0].toLowerCase();
        const args = kmsg.slice(command.length).trim();
        handleKikkerCommands(io, command, args);
      }
    });
  });
}

module.exports = { listenForMessages };

