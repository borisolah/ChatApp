import React, { useEffect, useState, useRef } from "react";
import "./chatmessages.css";

const ChatMessages = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("initialMessages", (initialMessages) => {
      setMessages(initialMessages);
    });
    socket.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
    return () => {
      socket.off("initialMessages");
      socket.off("message");
    };
  }, [socket]);

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
