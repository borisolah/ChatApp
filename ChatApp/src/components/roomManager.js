const roomStates = {};
let maxHistory = 2000;

const uiState = {
    currentRoom: "1",
    // totalUnread: 0
    allOnlineUsers: [],
}

function switchRoom(roomid) {
    const room = roomStates[roomid];
    if (!room) {
        console.error("Tried to switch to a room we're not in:", roomid);
        return false;
    }
    uiState.currentRoom = roomid;
    // TODO: visually represent which room we're in.
    return {
        users: room.users, 
        messages: room.messages
    };
}

function getRoom(roomid) {
    roomStates[roomid] = roomStates[roomid] || {
        id: roomid,
        name: roomid.toString(),
        users: [],
        messages: [],
        uploads: [],
        unread: 0
    }
    return roomStates[roomid];
}

function onJoin(room) {
    // TODO: make a new tab, bind it to roomStates[room]
    if (!room) {
        return;
    }
    if (typeof room === "number") {
        room = getRoom(room);
    } else {
        const roomname = room.name;
        room = getRoom(room.id);
        room.name = roomname; // this allows renaming a room after the fact. necessary because onUserList() may create the room before the name is known.
    }
    return switchRoom(room.id);
}

function onLeave(room) {
    if (typeof room === "number") {
        room = getRoom(room);
    }
    // TODO: remove the tab for this room
    delete roomStates[room.id];
    return switchRoom(Object.keys(roomStates)[0]); // TODO: use the room right next to where we were before.
}

function onQuit() {
    for (let roomid in roomStates) {
        onLeave(roomid);
    }
}

function currentRoom() {
    return uiState.currentRoom;
}

function onMessage(msg, countUnread=true) {
    const room = roomStates[msg.channel];
    if (room) {
        room.messages.push(msg);
        if (room.id === uiState.currentRoom) {
            // if (!uiState.visible()) {
                   room.unread++;
            //     uiState.totalUnread++;
            // }
            room.messages.splice(0, room.messages.length - maxHistory);
            // TODO: need to do something for them to show up in unread counter, if the browser/tab isn't in foreground?
            // can we enforce maxHistory there too?
            return msg; // room.messages; //msg;
        }
        room.unread++;
        // uiState.totalUnread++;
    } else {
        console.error("Received message for a room we're not in:", msg);
    }
}

function onUserList(users, roomid) {
    if (!roomid) {
        console.log("global userlist");
        uiState.allOnlineUsers = users;
        // TODO: remove once users per room work right.
        return users;
    }
    const room = getRoom(roomid);
    // TODO: reorder the list such that the logged in user is on top, then kikker, then everybody else.
    room.users = users;
    if (roomid === uiState.currentRoom) {
        console.log("current room userlist")
        return users;
    }
}

function printRoomsSummary() {
    for (let roomid in roomStates) {
        const room = roomStates[roomid];
        console.log(room.name, "- Users:", room.users.length, "- Uploads:", room.uploads.length, "- Messages:", room.messages.length, room.unread);
    }
}

module.exports = {
    switchRoom, currentRoom,
    onJoin, onLeave, onQuit,
    onMessage, onUserList,

    printRoomsSummary
};