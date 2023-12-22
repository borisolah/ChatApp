import React from "react";
import "./chatusers.css";
import { getActivityImage } from "../../public/index"; // Adjust the path as necessary
import { getSubstanceImage } from "../../public/index"; // Adjust the path as necessary
import { getMoodImage } from "../../public/index"; // Adjust the path as necessary
import sprout from "../../public/sprout.png";
import flower from "../../public/flower.png";

const ChatUsers = ({ users }) => {
  console.log(users);
  return (
    <div className="mainUsersOnline">
      <div>
        {users.map((user, index) => (
          <div key={index} className="users">
            <img
              src={getMoodImage(user.mood)}
              className="user_icons"
              alt={`Mood of ${user.name}`}
            />
            <img
              src={getSubstanceImage(user.substance)}
              className="user_icons"
              alt={`Substance preference of ${user.name}`}
            />
            <img
              src={getActivityImage(user.activity)}
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
            <div className="user_name">{user.username}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatUsers;
