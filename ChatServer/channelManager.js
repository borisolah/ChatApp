const { insertMessage, formatMessage } = require("./db/dbOperations");
const { v4: uuidv4 } = require("uuid");

const sockets = {};
let _io;

const kikker = {
    id: 0,
    userName: "Kikker",
    chatNick: "Kikker",
    mood: "pleased",
    substance: "bufo",
    activity: "vision",
    userColor: "rgb(200,171,182)",
    textColor: "rgb(145,190,108)"
}

const userChannels = {};
const channels = {};
let channelCount = 0;

function _createChannel(name, users=[]) {
    const id = ++channelCount; // TODO: dbops.createChannel(name, users);
    if (channels[id]) {
        console.error("Tried re-creating channel", id, name, users);
        return;
    }
    channels[id] = {
        id,
        name,
        users: new Set([kikker, ...users])
    };
    
    return id;
}

function init(io) {
    if (_io) {
        console.error("Tried to re-init channelManager");
        return;
    }
    _io = io;

    _createChannel("Welcome Area");     // 1
    _createChannel("Questionnaire");    // 2
    _createChannel("Fun and Offtopic"); // 3
    _createChannel("Hyperspace Chat");  // 4
    // TODO: also create all Channels that already exist in the DB
}


function setSocket(user, socket) {
    console.log("channelManager.setSocket(): user", user, "socket", socket.id);
    sockets[user.id] = socket;
}
function getSocket(user) {
    return sockets[user.id];
}

function emitChannelUserlist(channel, socket=undefined) {
    if (socket) {
        socket.emit("onlineUsersList", {channel: channel.id, users: [...channel.users]});
    } else {
        _io.to(channel.id).emit("onlineUsersList", {channel: channel.id, users: [...channel.users]});
    }
}
async function emitChannelInfo(channel, user, verb, msg='') {
    console.log("emitChannelInfo:", channel, user, verb, msg);
    const message = {
        channel,
        type: "info", 
        userId:0, 
        message:`${user.chatNick} ${verb} the room` + (msg ? ` (${msg})` : ''),
        id: uuidv4(),
        date: new Date()
    }
    _io.to(channel).emit("message", formatMessage(message));
    await insertMessage(message);
}

function getChannel(id) {
    let c;
    if (typeof id === "number") {
        return channels[id] ? id : 0;
    }
    const _id = id.toLowerCase();
    for (let x in channels) {
        if (channels[x].name.toLowerCase() === _id) {
            return x;
        }
    }
    return _createChannel(id); // undefined; // TODO: 
}

async function join(channelid, user) {
    if (typeof channelid === "string") {
        channelid = getChannel(channelid);
    }
    const channel = channels[channelid];
    if (!channel) {
        console.log("tried to join non existing channel", channelid, user);
        return;
    }
    userChannels[user.id] = userChannels[user.id] || new Set([]);
    sockets[user.id].join(channelid);
    sockets[user.id].emit("join", {id: channel.id, name: channel.name});
    if (userChannels[user.id].has(channelid)) {
        emitChannelUserlist(channel, sockets[user.id]);
    } else {
        userChannels[user.id].add(channelid);
        channel.users.add(user);
        await emitChannelInfo(channelid, user, "joined");
        emitChannelUserlist(channel);
    }
}

async function leave(channelid, user, message) {
    const channel = channels[channelid];
    if (!channel) {
        console.error("Channel to leave doesn't exist:", channelid, user);
        return;
    }
    userChannels[user.id].delete(channelid);
    channel.users.delete(user);
    await sockets[user.id].emit("leave", {id: channel.id, name: channel.name});
    sockets[user.id].leave(channelid);  // TODO: for some reason, rejoin after this seems to not work. find out why.
    await emitChannelInfo(channelid, user, "left", message);
    await emitChannelUserlist(channel);
}

async function quit(user, message) {
    // console.log("channelManager:quit", user, message);
    // console.log(userChannels[user.id]);
    for (let channelid of userChannels[user.id]) {
        // console.log(channelid);
        await leave(channelid, user, message);
    }
    try {
        sockets[user.id].disconnect(true);
    } catch {
        console.error("channelManager.quit(): user", user.id, "- no socket to disconnect");
    }
    sockets[user.id].emit("vanish"); // QUESTION: should we not?
    delete sockets[user.id];
    delete userChannels[user.id];
}

function userChanged(user) {
    // console.log("channelManager.userChanged", user.id, userChannels[user.id]);
    userChannels[user.id].forEach((channelid) => {
        console.log(channelid);
        emitChannelUserlist(channels[channelid]);
    });
}

function isInRoom(user, channelid) {
    return userChannels[user.id].has(channelid);
}

module.exports = {
    init, setSocket, getSocket,
    join, leave, quit,
    isInRoom,
    userChanged,
};