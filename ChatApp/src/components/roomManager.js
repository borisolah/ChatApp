const roomStates = {};

function join(room) {
    // TODO: make a new tab, bind it to roomMessages[room]
    roomStates[room] = []; // useState([]); // uh oh, can't do this here
}

function leave(room) {
    // TODO: remove the tab for this room
    delete roomStates[room];
}

function quit() {
    // TODO: leave all rooms
}

module.exports = { join, leave, quit };