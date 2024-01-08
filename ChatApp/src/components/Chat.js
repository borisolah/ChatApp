import React, { useState } from "react";
import ChatMessages from "./ChatMain/ChatMain";
import ChatUsers from "./ChatUsers/ChatUsers";
import Input from "./Input/Input";
import useAuth from "../hooks/useAuth";
import useUnreadMessages from "../hooks/useUnreadMessages";
import useSocketListener from "./socketListener"; // Adjust the path as necessary
import Uploads from "./Uploads/Uploads"; // Adjust the path as necessary

const Chat = () => {
  const [activeTab, setActiveTab] = useState("users");
  const { auth } = useAuth();
  const { socket, onlineUsers, messages } = useSocketListener(auth);
  useUnreadMessages(socket);

  // QUESTION: can we create a new <ChatMessages> whenever we join rooms? Maybe use the same approach for tabbing as with users and uploads here, but from code?
  // (right now, i setMessages() every time room is switched, and it's not ideal because it leads to tons of js errors about "identical key" in the client after returning to a room)
  return (
    <div className="mainBox">
      <div className="mainChat">
        {socket && <ChatMessages messages={messages} />}
      </div>
      <div className="chatUsers">
        <button onClick={() => setActiveTab("users")}>Users</button>
        <button onClick={() => setActiveTab("upload")}>Upload</button>
        {activeTab === "users" ? (
          <ChatUsers users={onlineUsers} />
        ) : (
          <Uploads />
        )}
      </div>
      <div>{socket && <Input socket={socket} user={auth.user} />}</div>
    </div>
  );
};

export default Chat;
