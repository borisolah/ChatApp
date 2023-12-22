import React from "react";
import ChatMessages from "./ChatMain/ChatMain";
import ChatUsers from "./ChatUsers/ChatUsers";
import Input from "./Input/Input";
import useAuth from "../hooks/useAuth";
import useUnreadMessages from "../hooks/useUnreadMessages";
import useSocketListener from "./socketListener"; // Adjust the path as necessary

const Chat = () => {
  const { auth } = useAuth();
  const { socket, onlineUsers, messages } = useSocketListener(auth);
  useUnreadMessages(socket);

  return (
    <div className="mainBox">
      <div className="mainChat">
        {socket && <ChatMessages messages={messages} />}
      </div>
      <div className="chatUsers">
        <ChatUsers users={onlineUsers} />
      </div>
      <div>{socket && <Input socket={socket} user={auth.user} />}</div>
    </div>
  );
};

export default Chat;
