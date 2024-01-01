import { useEffect, useState } from "react";
import io from "socket.io-client";
import parse from 'html-react-parser';
const userStates = require("./userStates.js");
const roomManager = require('./roomManager.js');

function abbreviateUrl(url) {
  if (url.length > 44)
    return `${url.slice(0,22)}...${url.slice(url.length-22)}`
  return url;
}

const UrlRegex = /((http|https|ftp|sftp|ipfs):\/\/[^\\/?#@() ]+\.[a-zA-Z]+(\/[^/? ]+)*\/?(\?[^=& ]+=[^=& ]+(&[^=& ]+=[^=& ]+)*)?)/;

function HTMLescape(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
function makeHTML(message) {
  // TODO: temperature conversion, maybe BBcode parsing
  let msg = HTMLescape(message.message);
  const match = UrlRegex.exec(msg);
  if (match) {
    const url = match[1];
    message.message = parse(msg.replace(url, `<a href="${url}" target="_blank" rel="noreferrer">${abbreviateUrl(url)}</a>`)); 
  }
}

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
        console.log("Received userlist:", users);
        setOnlineUsers(users);
        userStates.setList(users);
      });

      newSocket.on("initialMessages", (initialMessages) => {
        initialMessages.forEach((msg) => makeHTML(msg))
        setMessages(initialMessages);
      });

      newSocket.on("message", (newMessage) => {
        console.log("Received message:", newMessage);
        makeHTML(newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      newSocket.on("warning", (warning) => {
        console.warn(warning);
        // TODO: display the warning under the input textbox, in red, for a few seconds.
      });

      newSocket.on("join", (room) => {
        roomManager.join(room);
      });

      newSocket.on("leave", (room) => {
        roomManager.leave(room);
      });

      newSocket.on("quit", (room) => {
        roomManager.quit(room);
      });

      newSocket.on("reload", () => {
        window.location.reload();
      });

      newSocket.on("vanish", () => {
        window.location.replace("https://www.google.com");
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
