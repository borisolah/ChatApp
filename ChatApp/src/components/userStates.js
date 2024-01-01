let onlineUsers;

function setList(list) {
    onlineUsers = list;
}

function getState(name) {
    //console.log(onlineUsers);
    const dummy = { userName:name , chatNick:name, userColor:'#ababab'};
    if (!onlineUsers) { 
        return dummy;
    }
    return onlineUsers.find((u) => (u.userName === name) || (u.chatNick === name)) || dummy;
}

export { setList, getState };