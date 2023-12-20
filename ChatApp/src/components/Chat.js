import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import ChatMessages from "./ChatMain/ChatMain";
import ChatUsers from "./ChatUsers/ChatUsers";
import Input from "./Input/Input";
import useAuth from "../hooks/useAuth";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { auth } = useAuth();
  console.log(auth);
  useEffect(() => {
    if (auth.accessToken) {
      const newSocket = io("http://34.132.242.170:3001", {
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
