import React, { useState } from "react";
import "./input.css";
const userStates = require("../userStates.js");

const prev_messages = [];
let prev_msg_index = 0;

function setInputCursorToEnd(delayed=false) {
  if (!delayed) {
    return window.setTimeout(()=> setInputCursorToEnd(true), 10);
  }
  const chatInput = document.getElementById("chatinput");
  const end = chatInput.value.length;
  chatInput.setSelectionRange(end, end);
  chatInput.focus();
}

const Input = ({ socket, user }) => {
  const [message, setMessage] = useState("");
  const handleKeyDown = (e) => {
    const { chatNick, userId, userColor, textColor, activeChannel } = userStates.getState(user);
    const prev = prev_msg_index;
    switch(e.key) {
      case "Enter":
        if (message.trim()) {
          socket.emit("newMessage", { 
            userId, 
            channel:activeChannel, 
            userName: chatNick, 
            message, 
            userColor, 
            textColor 
          });
          prev_messages.push(message);
          prev_msg_index = 0;
          setMessage("");
        } 
        break;
      case "ArrowUp":
        if (prev === 0) {
          prev_messages.push(message);
          prev_msg_index++;
        }
        if (prev_msg_index < prev_messages.length) {
          prev_msg_index++;
        }
        setMessage(prev_messages[prev_messages.length - prev_msg_index] || "");
        setInputCursorToEnd();
        break;
      case "ArrowDown":
        if (prev_msg_index > 1) {
          prev_msg_index--;
          setMessage(prev_messages[prev_messages.length - prev_msg_index] || "");
        }
        if (prev === 2) {
          prev_messages.pop();
          prev_msg_index--;
          
        }
        setInputCursorToEnd();
        break;
      default:
        prev_msg_index = 0;
        const x = prev_messages.pop();
        if (x) {
          prev_messages.push(x);
        }
    }
  }

  return (
    <div className="inputBox">
      <div className="userName" style={{color: userStates.getState(user).userColor}}>{userStates.getState(user).chatNick}</div>
      <input
        id="chatinput"
        className="input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default Input;
