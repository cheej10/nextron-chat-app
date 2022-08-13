import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, set, push, ref, onValue, get } from 'firebase/database';

function UserList({ handleListClick, handleGroupChat, myId }) {
  const [userList, setUserList] = useState([]);
  const [userSelectMode, setUserSelectMode] = useState(false);
  const checkedUsers = useRef([]);
  const db = getDatabase();

  const getUsers = () => {
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

  const handleCheckboxClick = (e) => {
    if (e.target.checked) {
      checkedUsers.current = [...checkedUsers.current, e.target.value];
    } else {
      // checkedUsers 정렬해서 대입하기 (이미 있는 방인지 비교 위해)
      checkedUsers.current = checkedUsers.current.filter(
        (userId) => userId !== e.target.value
      );
    }
  };

  const handleCompleteBtn = () => {
    const usersRef = ref(db, 'users/');
    let users = [];

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      users = Object.keys(data)
        .filter((key) => checkedUsers.current.includes(key))
        .map((key) => {
          return {
            key,
            email: data[key].email,
            nickname: data[key].nickname,
          };
        });
    });

    setUserSelectMode(false);
    handleGroupChat(users);
    checkedUsers.current = [];
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="grow flex flex-col">
      <ul className="grow divide-y divide-gray-500">
        {userList.map((user) => (
          <li
            key={user.key}
            className="p-3 flex items-center justify-between text-gray-100 hover:cursor-pointer hover:bg-gray-500"
            onClick={() => {
              userSelectMode || handleListClick(user);
            }}
          >
            {user.nickname}
            {userSelectMode && (
              <input
                type="checkbox"
                className="w-5 h-5"
                value={user.key}
                onChange={handleCheckboxClick}
              ></input>
            )}
          </li>
        ))}
      </ul>
      {userSelectMode ? (
        <button
          type="button"
          className="py-4 w-full border-t border-gray-500 hover:bg-gray-500"
          onClick={handleCompleteBtn}
        >
          완료
        </button>
      ) : (
        <button
          type="button"
          className="py-4 w-full border-t border-gray-500 hover:bg-gray-500"
          onClick={() => setUserSelectMode(true)}
        >
          그룹채팅 시작하기
        </button>
      )}
    </div>
  );
}

export default UserList;
