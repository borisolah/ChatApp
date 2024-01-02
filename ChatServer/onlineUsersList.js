const dbops = require('./db/dbOperations.js');

const kikker = {
    id: 0,
    userName: "Kikker",
    chatNick: "Kikker",
    mood: "pleased",
    substance: "bufo",
    activity: "vision",
    userColor: "#c8abb6",
    textColor: "#91be6c"
};
const _list = [kikker];

let _io;

function emit(socket=undefined, really=false) {
    if (true) { //!really) {
        console.log("onlineUsersList.js->emit() was called");
        return;
    }
    socket = socket || _io;
    if (socket){
        console.log(_list);
        socket.emit("onlineUsersList", {channel: 0, users: _list});
    } else {
        console.log("tried to emit() without a socket");
    }
}

function add(user) {
    _list.push(user);
    emit();
    return user;
}

function remove(user) {
    const removed = _list.splice(_list.indexOf(user), 1);
    emit();
    return removed;
}

// temporary fixes;
function find(predicate) {
    return _list.find(predicate);
}
// function copyList() {
//     return [... _list];
// }
// function push(user) {
//     return add(user);
// }


 function init(io) {
    console.log("onlineUsersList.init()")
    if (!_io) {
        _io = io;
        // for (let user of await dbops.fetchOnlineUsers()) {
        //     _list.push(user);
        // }
    }
}

module.exports = {
    init,
    add, remove, emit,
    find, 
    //copyList,
    //push
}