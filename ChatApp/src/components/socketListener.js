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
  return message;
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

      newSocket.on("onlineUsersList", ({ channel, users}) => {
        console.log("Received userlist:", users);
        userStates.setList(users);
        users = roomManager.onUserList(users, channel);
        if (users) {
          setOnlineUsers(users);
        }
      });

      newSocket.on("initialMessages", (initialMessages) => {
        initialMessages.forEach((msg) => roomManager.onMessage(makeHTML(msg), false));
        roomManager.printRoomsSummary(); // DEBUG
        setMessages(initialMessages.filter((msg) => msg.channel === roomManager.currentRoom()));
      });

      newSocket.on("message", (newMessage) => {
        console.log("Received message:", newMessage);
        const msg = roomManager.onMessage(makeHTML(newMessage));
        if (msg) {
          // console.log(msg.length);
          setMessages((prevMessages) => [...prevMessages, msg]); //(msg); //
        }
      });

      newSocket.on("warning", (warning) => {
        console.warn(warning);
        // TODO: display the warning under the input textbox, in red, for a few seconds.
      });

      newSocket.on("join", (room) => {
        const newroom = roomManager.onJoin(room);
        if (newroom) {
          setOnlineUsers(newroom.users); // TODO: uncomment as soon as users per room work right.
          setMessages(newroom.messages);
        }
      });

      newSocket.on("leave", (room) => {
        roomManager.onLeave(room);
      });

      newSocket.on("quit", (room) => {
        roomManager.onQuit(room);
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
        newSocket.off("warning");
        newSocket.off("join");
        newSocket.off("leave");
        newSocket.off("quit");
        newSocket.off("reload");
        newSocket.off("vanish");
        newSocket.disconnect();
      };
    }
  }, [auth.accessToken]);

  return { socket, onlineUsers, messages };
};

export default useSocketListener;
