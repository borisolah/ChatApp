const { v4: uuidv4 } = require("uuid");
const { insertMessage, formatMessage } = require("../db/dbOperations");
const userStatus = require("./userStatus.js");

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

function handleKikkerCommands(io, command, args) {
  switch (command) {
    case "choose":
      console.log("choose");
      const randomNum = Math.random();
      let choice;
      if (randomNum < 0.1) {
        choice = "";
      } else if (randomNum < 0.2) {
        choice = "None of the above";
      } else {
        const options = args.split(/\|{1,2}/).map((s) => s.trim());
        choice = options[Math.floor(Math.random() * options.length)];
      }
      emitMessage(io, "Kikker", `The choice is: ${choice}`);
      break;
    case "define":
      const term = args.trim();
      const urbanDictionaryUrl = `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, "Kikker", `Urban definition: ${urbanDictionaryUrl}`);
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
      emitMessage(io, "Kikker", ":)");
      break;
  }
}

function handleUserCommands(io, socket, command, args, onlineUsersList) {
  const username = socket.decoded.username;
  switch (command) {
    case "activity":
      userStatus.updateUserActivity(onlineUsersList, username, args);
      break;
    case "substance":
      userStatus.updateUserSubstance(onlineUsersList, username, args);
      break;
    case "mood":
      userStatus.updateUserMood(onlineUsersList, username, args);
      break;
  }
  io.emit("onlineUsersList", onlineUsersList);
}
async function listenForMessages(io, onlineUsersList) {
  io.on("connection", (socket) => {
    socket.on("newMessage", async (messageData) => {
      const messageText = messageData.message.trim().toLowerCase();
      if (messageText.startsWith("kikker")) {
        const command = messageText.slice(7).split(" ")[0];
        const args = messageText.slice(7 + command.length).trim();
        handleKikkerCommands(io, command, args);
      }
      if (messageText.startsWith("/")) {
        const splitText = messageText.split(" ");
        const command = splitText[0].slice(1);
        const args = splitText.length > 1 ? splitText[1] : "";
        handleUserCommands(io, socket, command, args, onlineUsersList);
      }
    });
  });
}

module.exports = { listenForMessages };
