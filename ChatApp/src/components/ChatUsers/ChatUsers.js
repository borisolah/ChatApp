import React from "react";
import "./chatusers.css";
import {
  avatar,
  flower,
  moon,
  noneAvatar,
  none,
  occupy,
  pleased,
  senior,
  shield,
  sprout,
} from "../../public";

const ChatUsers = ({ users }) => {
  return (
    <div className="mainUsersOnline">
      <div>
        {users.map((user, index) => (
          <div key={index} className="users">
            <img
              src={pleased}
              className="user_icons"
              alt={`Mood of ${user.name}`}
            />
            <img
              src={moon}
              className="user_icons"
              alt={`Substance preference of ${user.name}`}
            />
            <img
              src={occupy}
              className="user_icons"
              alt={`Activity of ${user.name}`}
            />
            <img
              src={sprout}
              className="user_rank"
              alt={`Rank of ${user.name}`}
            />
            <img
              src={flower}
              className="user_avatar"
              alt={`Avatar of ${user.username}`}
            />
            <div className="user_name">{user}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatUsers;
