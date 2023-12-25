import { useEffect, useState } from "react";
import io from "socket.io-client";

function abbreviateUrl(url) {
  if (url.length > 44)
    return `${url.slice(0, 22)}...${url.slice(url.length - 22)}`;
  return url;
}

const UrlRegex =
  /((http|https|ftp|ftps|ipfs):\/\/[^\\/?#@() ]+\.[a-zA-Z]+(\/[^/? ]+)*\/?(\?[^=& ]+=[^=& ]+(&[^=& ]+=[^=& ]+)*)?)/;

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
        // TODO: HTML escaping, temperature conversion, maybe BBcode parsing
        const match = UrlRegex.exec(newMessage.message);
        if (match) {
          const url = match[1];
          newMessage.message.replace(
            url,
            `<a href="${url}" target="_blank" rel="noreferrer">${abbreviateUrl(
              url
            )}</a>`
          );
        }
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
