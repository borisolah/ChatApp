import React, { useState } from "react";
import "./input.css";

const Input = ({ socket, user }) => {
  const [message, setMessage] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && message.trim()) {
      socket.emit("newMessage", { userName: user, message });
      setMessage("");
    }
  };

  return (
    <div className="inputBox">
      <div className="userName">{user}</div>
      <input
        className="input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default Input;
