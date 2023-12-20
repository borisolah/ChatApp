import { useState, useEffect } from "react";

const useUnreadMessages = (socket) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log("Visibility changed:", document.visibilityState);
      if (document.visibilityState === "visible") {
        setUnreadCount(0);
      }
    };

    const handleNewMessage = () => {
      console.log("New message received");
      if (document.visibilityState === "hidden") {
        setUnreadCount((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    socket?.on("message", handleNewMessage);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket?.off("message", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    document.title =
      unreadCount > 0 ? `[${unreadCount}] React App` : "React App";
  }, [unreadCount]);
};

export default useUnreadMessages;
