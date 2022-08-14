import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

function UserList({ handleListClick, handleGroupChat, myId }) {
  const [userList, setUserList] = useState([]);
  const [userSelectMode, setUserSelectMode] = useState(false);
  const checkedUsers = useRef([]);
  const db = getDatabase();
  const router = useRouter();

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
    if (checkedUsers.current.length < 2) {
      alert('두 명 이상 선택해주세요.');
      return;
    }

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

  const logout = async () => {
    try {
      const user = await signOut(auth);

      localStorage.removeItem('userId');
      router.push('/login');
    } catch (error) {
      console.log(error);
    }
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
            그룹채팅
          </button>
        )}
      </ul>
      <button
        type="button"
        className="py-4 w-full border-t border-gray-500 hover:bg-gray-500"
        onClick={logout}
      >
        로그아웃
      </button>
    </div>
  );
}

export default UserList;
