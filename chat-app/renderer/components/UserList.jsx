import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, set, push, ref, onValue, get } from 'firebase/database';

function UserList({ handleListClick, myId }) {
  const [userList, setUserList] = useState([]);

  const getUsers = () => {
    const db = getDatabase();
    const usersRef = ref(db, 'users/');

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      setUserList(
        Object.keys(data)
          .filter((key) => key !== myId)
          .map((key) => {
            return {
              key,
              email: data[key].email,
              nickname: data[key].nickname,
            };
          })
      );
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <ul className="divide-y-2 divide-gray-100">
      {userList.map((user) => (
        <li
          key={user.key}
          className="p-3 text-gray-700 hover:cursor-pointer hover:bg-gray-50"
          onClick={() => {
            handleListClick(user);
          }}
        >
          {user.nickname}
        </li>
      ))}
    </ul>
  );
}

export default UserList;
