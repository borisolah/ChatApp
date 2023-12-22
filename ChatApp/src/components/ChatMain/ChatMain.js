import React, { useEffect, useRef } from "react";
import "./chatmessages.css";

const ChatMessages = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="chatMessages">
      {messages.map((message) => (
        <div className="chatMessageBox" key={message.id}>
          <div className="messageBox messageDate">{message.date}</div>{" "}
          <div className="messageBox">
            ‹<span className="messageBox messageName">{message.userName}</span>›
          </div>
          <div className="messageBox messageMessage">{message.message}</div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
