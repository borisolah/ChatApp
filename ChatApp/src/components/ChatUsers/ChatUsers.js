import React from "react";
import "./chatusers.css";
import { getActivityImage } from "../../public/index";
import { getSubstanceImage } from "../../public/index";
import { getMoodImage } from "../../public/index";
import sprout from "../../public/sprout.png";
import flower from "../../public/flower.png";

const ChatUsers = ({ users }) => {
  //console.log(users);
  return (
    <div className="mainUsersOnline">
      <div>
        {users.map((user, index) => (
          <div key={index} className="users">
            <img
              src={getMoodImage(user.mood)}
              className="user_icons"
              alt={user.mood}
              title={user.mood}
            />
            <img
              src={getSubstanceImage(user.substance)}
              className="user_icons"
              alt={user.substance}
              title={user.substance}
            />
            <img
              src={getActivityImage(user.activity)}
              className="user_icons"
              alt={user.activity}
              title={user.activity}
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
            <div className="user_name" style={{color: user.userColor}}>{user.chatNick || user.userName || user.username}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatUsers;
