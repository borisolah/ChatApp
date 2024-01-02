
const sockets = {};
let _io;

const channels = {
    1: {
        id: 1,
        name: "Welcome Area",
        users: new Set([]), // TODO: load from DB
    },
    2: {
        id: 2,
        name: "Questionnaire",
        users: new Set([]), // TODO: load from DB
    },
    3: {
        id: 3,
        name: "Fun and Offtopic",
        users: new Set([]), // TODO: load from DB
    },
    4: {
        id: 4,
        name: "Hyperspace Chat",
        users: new Set([]), // TODO: load from DB
    }
};

const userChannels = {};


function init(io) {
    _io = io;
}

function setSocket(user, socket) {
    sockets[user.id] = socket;
}

function emitChannelUserlist(channel) {
    // console.log("emitChannelUserlist:", channel.id, channel.users, channel);
    _io.to(channel.id).emit("onlineUsersList", {channel: channel.id, users: [...channel.users]});
}

function getChannel(id) {
    let c;
    id = id.toLowerCase();
    for (let x in channels) {
        if (channels[x].name.toLowerCase() === id) {
            c = x;
            id = x;
            break;
        }
    }
    if (!c) {
        // TODO: create channel, assign new channelid from DB
        console.log("Should make new channel now:", id);
        return 0;
    }
    return id;
}

function join(channelid, user) {
    // TODO: create channel if not exists
    if (typeof channelid === "string") {
        channelid = getChannel(channelid);
    }
    const channel = channels[channelid];
    if (!channel) {
        console.log("tried to join non existing channel", channelid, user);
        return;
    }
    userChannels[user.id] = userChannels[user.id] || new Set([]);
    userChannels[user.id].add(channelid);
    channel.users.add(user);
    sockets[user.id].join(channelid);
    sockets[user.id].emit("join", {id: channel.id, name: channel.name});
    emitChannelUserlist(channel);
}

function leave(channelid, user) {
    const channel = channels[channelid];
    if (!channel) {
        console.error("Channel to leave doesn't exist:", channelid, user);
        return;
    }
    channel.users.remove(user);
    sockets[user.id].leave(channelid);
    emitChannelUserlist(channel);
}

function userChanged(user) {
    // console.log("channelManager.userChanged", user.id, userChannels[user.id]);
    userChannels[user.id].forEach((channelid) => {
        console.log(channelid);
        emitChannelUserlist(channels[channelid]);
    });
}

// function setMood(user, nick) {

// }

// function setSubstance(user, nick) {

// }

// function setActivity(user, nick) {

// }

// function setColors(user, nick) {

// }

module.exports = {
    init, setSocket,
    join, leave,
    userChanged,
    // setNick, setMood, setSubstance, setActivity, setColors
};