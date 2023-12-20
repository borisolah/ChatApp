import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import ChatMessages from "./ChatMain/ChatMain";
import ChatUsers from "./ChatUsers/ChatUsers";
import Input from "./Input/Input";
import useAuth from "../hooks/useAuth";
import useUnreadMessages from "../hooks/useUnreadMessages";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { auth } = useAuth();
  useEffect(() => {
    if (auth.accessToken) {
      const newSocket = io(process.env.REACT_APP_CHAT_SERVER_URL, {
        query: { token: auth.accessToken },
      });

      newSocket.on("onlineUsersList", (users) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.off("onlineUsersList");
          newSocket.disconnect();
        }
      };
    }
  }, [auth.accessToken]);
  useUnreadMessages(socket);

  return (
    <div className="mainBox">
      <div className="mainChat">
        {socket && <ChatMessages socket={socket} />}
      </div>
      <div className="chatUsers">
        <ChatUsers users={onlineUsers} />
      </div>
      <div>{socket && <Input socket={socket} user={auth.user} />}</div>
    </div>
  );
};

export default Chat;
