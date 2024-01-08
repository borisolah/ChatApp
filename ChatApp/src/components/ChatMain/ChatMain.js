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
          { message.type === "message" &&
            <div className="messageBox">
              ‹<span className="messageBox messageName" style={{color: message.userColor}}>{message.userName || message.username}</span>›
            </div>
          }
          <div className="messageBox messageMessage" style={{color: message.type==="message" ? message.textColor : "#977575"}}>{message.message}</div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
