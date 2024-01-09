
const { v4: uuidv4 } = require("uuid");
const { insertMessage, formatMessage } = require("../db/dbOperations");
const userStatus = require("./userStatus.js");
const maxNickLength = 22;
const kikker = userStatus.findIfOnline('Kikker');
const svgColors = require("./svgColors.js");
const channelManager = require("../channelManager.js");

const kikkerShouldAnswers = [
  "Yes", "No", "Seriously?", "Ahem, let me look the other way...", "Kikker ... kikk ... kikkkk ... kikkkkkerrrrrrrrrr",
  "So you think today IS a good day?", "Hahahaha (sure)", "Pffffft (according to dreamer)", "Wonderful, good thing to perform!"
];

async function emitMessage(io, user, type, channel, messageContent) {
  console.log(channel, typeof channel)
  const message = {
    userId: user.userId || user.id,
    userName: user.chatNick || user.userName,
    userColor: user.userColor,
    textColor: user.textColor,
    type,
    channel,
    message: messageContent,
    id: uuidv4(),
    date: new Date(),
  };

  io.to(channel).emit("message", formatMessage(message));
  await insertMessage(message);
}

function parseTokenFromArgs(args){
  args = args.trim();
  let token;
  if (args.startsWith('"')) {
    token = args.slice(1, args.slice(1).indexOf('"')+1);
    if (token)
      return [token.trim(), args.slice(token.length+2).trim()];
    return [args.slice(1), ""];
  }
  const space = args.indexOf(' ');
  if (space >= 0) {
    token = args.slice(0, args.indexOf(' '));
  } else {
    token = args;
  }
  if (token)
    return [token, args.slice(token.length+1).trim()];
  return [args, ""];
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


function handleKikkerCommands(io, channel, command, args) {
  const randomNum = Math.random();
  const term = (args && args.trim()) || '';
  let Url;
  switch (command) {
    case "choose":
      console.log("choose");
      let choice;
      if (randomNum < 0.1) {
        choice = "None of the above";
      } else {
        const options = args.split(/\|{1,2}/).map((s) => s.trim());
        choice = options[Math.floor(randomNum * options.length)];
      }
      emitMessage(io, kikker, "message", channel, `The choice is: ${choice}`);
      break;
    case "should":
    case "shoudl":
    case "shouldnt":
    case "shouldn't":
    case "shoudlnt":
    case "shoudln't":
      emitMessage(io, kikker, "message", channel, kikkerShouldAnswers[Math.floor(randomNum * kikkerShouldAnswers.length)]);
      break;
    case "define":
      Url = `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(
        term
      )}`;
      // TODO: this should contain only the URL, which should be made into <a> in the frontend:
      emitMessage(io, kikker, "message", channel, `urban definition: ${Url}`); 
      break;
    case "search":
    case "duck":
      Url = `https://duckduckgo.com/?q=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, kikker, "message", channel, `DuckDuckGo results: ${Url}`);
      break;
    case "image":
      Url = `https://duckduckgo.com/?q=${encodeURIComponent(
        term + "&iax=images&ia=images"
      )}`;
      emitMessage(io, kikker, "message", channel, `images: ${Url}`);
      break;
    case "wiki":
      Url = `https://duckduckgo.com/?q=${encodeURIComponent(
        term + " site:wiki.dmt-nexus.me"
      )}`;
      emitMessage(io, kikker, "message", channel, `wiki results: ${Url}`);
      break;
    case "forum":
      Url = `https://duckduckgo.com/?q=${encodeURIComponent(
        term + " site:dmt-nexus.me/forum"
      )}`;
      emitMessage(io, kikker, "message", channel, `forum results: ${Url}`);
      break;
    case "google":
      Url = `https://www.google.com/search?q=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, kikker, "message", channel, `google results: ${Url}`);
      break;
    case "youtube":
      Url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, kikker, "message", channel, `youtube results: ${Url}`);
      break;
    case "imdb":
      Url = `https://www.imdb.com/find/?q=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, kikker, "message", channel, `imdb results: ${Url}`);
      break;
    case "paper":
      Url = `https://scholar.google.com/scholar?q=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, kikker, "message", channel, `google scholar results: ${Url}`);
      break;
    case "translate":
      Url = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(
        term
      )}&op=translate`;
      emitMessage(io, kikker, "message", channel, `google translate: ${Url}`);
      break;
    case "soundcloud":
      Url = `https://soundcloud.com/search?q=${encodeURIComponent(
        term
      )}`;
      emitMessage(io, kikker, "message", channel, `soundcloud results: ${Url}`);
      break;
    case "dice":
      const argsArray = args.split(" ").map(Number);
      let numberOfDice = argsArray[0];
      const sidesOfDice = argsArray[1];
      numberOfDice = numberOfDice > 42 ? 42 : numberOfDice;
      let diceResults = "";
      for (let i = 0; i < numberOfDice; i++) {
        if (i) {
          diceResults += "   ௵ ";
        }
        const roll = Math.floor(Math.random() * sidesOfDice) + 1;
        diceResults += `[${i + 1}] ${roll}`;
      }
      emitMessage(io, kikker, "message", channel, diceResults.trim());
      break;
    case "math":
      // TODO!
      break;
    default:
      // TODO: serve individual kikker symbol if there is one for this user. Otherwise:
      emitMessage(io, kikker, "message", channel, ":)");
      break;
  }
}

const regexRgb = /rgb\((\d+),(\d+),(\d+)\)/;
function makeHex(intstr, digits=0) {
  intstr = parseInt(intstr).toString(16);
  while (digits && intstr.length < digits) {
    intstr = '0' + intstr;
  }
  if (digits && intstr.length > digits)
    return 'f'.repeat(digits);
  return intstr;
}
function makeColor(colorname) {
  colorname = colorname.replaceAll(/\s/g, '').toLowerCase();
  if (colorname.startsWith('#')) {
    while (colorname.length < 7 && colorname.length != 4) {
      colorname = colorname + '0';
    }
  } 
  else if (colorname.startsWith('rgb(')) {
    const match = regexRgb.exec(colorname);
    if (match) {
      colorname = `#${makeHex(match[1],2)}${makeHex(match[2],2)}${makeHex(match[3],2)}`;
    } else {
      colorname = '';
    }
  } 
  else { 
    colorname = svgColors[colorname] || '';
  }
  colorname = colorname.substring(0,7);
  // TODO: coerce colors into the accepted range (not too dark, not too bright)
  return colorname;
}

async function handleUserCommands(io, socket, channel, user, command, args) {
  // const username = socket.decoded.username.trim();
  // const user = userStatus.findIfOnline(username);
  if (!user || !user.id) {
    socket.emit("reload");
    return;
  }
  const username = user.chatNick || user.userName;
  console.log("handleUserCommands:", user.userName, username, command, args)
  switch (command) {
    case "help":
      // TODO: open chat help in new tab in the client
      socket.emit("help");
      break;
    case "join":
      channelManager.join(args, user);
      break;
    case "leave":
      channelManager.leave(channel, user, args)
      break;
    case "quit":
      channelManager.quit(user, args);
      break;
    case "me":
      emitMessage(io, user, "me", channel, `${username} ${args}`);
      // io.emit("me", `${username} ${args}`); // signal "me" ok? TODO: channel awareness
      break;
    case "activity":
      userStatus.updateUserActivity(user, args);
      break;
    case "substance":
      userStatus.updateUserSubstance(user, args);
      break;
    case "mood":
      userStatus.updateUserMood(user, args);
      break;
    case "nick":
      await userStatus.updateUserNick(user, args.slice(0, maxNickLength).trim());
      emitMessage(io, user, "nick", channel, `${username} changed nickname to ${user.chatNick || user.userName}`);
      break;
    case "usercolor":
      userStatus.updateUserColors(user, makeColor(parseTokenFromArgs(args)[0]), user.textColor);
      break;
    case "textcolor":
      userStatus.updateUserColors(user, user.userColor, makeColor(parseTokenFromArgs(args)[0]));
      break;
    case "colors":
      const [ usercolor, rest ] = parseTokenFromArgs(args);
      const [textcolor, nouse] = parseTokenFromArgs(rest);
      userStatus.updateUserColors(user, makeColor(usercolor), makeColor(textcolor)); // usercolor, textcolor); //
      break;
    case "invite":
      // TODO: find args in onlineUsersList if they're not *in this room*
      // TODO: if found, check necessary privileges and if ok, add them to this room.
      emitMessage(io, kikker, "info", channel, `${args} was invited by ${username}.`);
      break;
    case "pass":
      const [passto, thing] = parseTokenFromArgs(args);
      //const thing = args.slice(passto.length + 1).trim(); // this will start with " if the name was in quotes.
      if (userStatus.findIfOnline(onlineUsersList, passto)) {
        // TODO: (in the frontend?) recognise if this is a special thing with an animation.
        emitMessage(io, user, "pass", channel, `${username} passes ${thing} to ${passto}`) // 'pass' signal ok?
      } else {
        socket.emit("warning", `No such active user: ${passto}`) // 'warning' signal ok?
      }
      break;
    case "kick":
      if (user) {
        const [kickname, reason] = parseTokenFromArgs(args)
        const tobekicked = userStatus.findIfOnline( kickname );
        if (tobekicked) {
          if (canKick(user, tobekicked)) {
            // TODO: actually kick that user *from this room*
            emitMessage(io, kikker, "info", channel `${tobekicked.username} was kicked by ${username} (REASON: ${reason||"no reason"})`); // signal "info" ok?
            break;
          }
          socket.emit("warning", `You do not have sufficient rights to kick ${tobekicked.username}`);
          break;
        } 
        socket.emit("warning", `No such active user: ${tobekicked.username}`);
        break;
      }
      socket.emit("reload"); // socket used a username that's not in onlineUsersList, make their page reload.
      break;
    case "ban":
      if (user) {
        const [banname, reason] = parseTokenFromArgs(args)
        const tobebanned = userStatus.findIfOnline( banname );
        if (tobebanned) {
          if (canKick(user, tobebanned)) {
            // TODO: actually ban that user *from this room*
            emitMessage(io, kikker, "info", channel, `${tobebanned.username} was banned by ${username} (REASON: ${reason.trim() ||"no reason"})`);
            handleUserCommands(io, socket, channel, "kick", args.replace(reason, reason || "BAN"));
            break;
          }
          socket.emit("warning", `You do not have sufficient rights to kick ${tobebanned.username}`);
          break;
        } 
        socket.emit("warning", `No such active user: ${tobebanned.username}`);
        break;
      }
      socket.emit("reload"); // socket used a username that's not in onlineUsersList, make their page reload.
      break;
  }
}


function handleCommands(io, socket, user, messageData) {
  const msg = messageData.message.trim();
  if (messageData.message.startsWith('/')) { // only do user commands if there is no space before the /
    const cend = (msg.indexOf(' ')+1) || msg.length;
    const command = msg.slice(1, cend).trim().toLowerCase();
    const args = msg.slice(cend).trim();
    handleUserCommands(io, socket, messageData.channel, user, command, args);
  }
  if (msg.slice(0,6).toLowerCase() === "kikker") {
    const kmsg = msg.slice(6).trim();
    const command = kmsg ? kmsg.split(" ")[0].toLowerCase() : '';
    const args = kmsg.slice(command.length).trim();
    handleKikkerCommands(io, messageData.channel, command, args);
  }
}

module.exports = { handleCommands };

