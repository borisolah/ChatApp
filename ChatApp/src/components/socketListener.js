import { useEffect, useState } from "react";
import io from "socket.io-client";

const useSocketListener = (auth) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (auth.accessToken) {
      const newSocket = io(process.env.REACT_APP_CHAT_SERVER_URL, {
        query: { token: auth.accessToken },
      });

      newSocket.on("onlineUsersList", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("initialMessages", (initialMessages) => {
        setMessages(initialMessages);
      });

      newSocket.on("message", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.off("onlineUsersList");
        newSocket.off("initialMessages");
        newSocket.off("message");
        newSocket.disconnect();
      };
    }
  }, [auth.accessToken]);

  return { socket, onlineUsers, messages };
};

export default useSocketListener;
