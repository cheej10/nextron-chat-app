import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightFromBracket,
  faUsers,
  faCircleUser,
} from '@fortawesome/free-solid-svg-icons';

function UserList({ handleListClick, handleGroupChat, myId }) {
  const [userList, setUserList] = useState([]);
  const [userSelectMode, setUserSelectMode] = useState(false);
  const [checkedUsers, setCheckedUsers] = useState([]);
  const db = getDatabase();
  const router = useRouter();

  const getUsers = () => {
    const usersRef = ref(db, 'users/');

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
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
      }
    });
  };

  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedUsers([...checkedUsers, e.target.value]);
    } else {
      setCheckedUsers(
        checkedUsers.filter((userId) => userId !== e.target.value)
      );
    }
  };

  const handleCompleteBtn = () => {
    if (checkedUsers.length < 2) {
      console.log('두 명 이상 선택해주세요.');
      return;
    }

    const usersRef = ref(db, 'users/');
    let users = [];

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        users = Object.keys(data)
          .filter((key) => checkedUsers.includes(key))
          .map((key) => {
            return {
              key,
              email: data[key].email,
              nickname: data[key].nickname,
            };
          });
      }
    });

    setUserSelectMode(false);
    handleGroupChat(users);
    setCheckedUsers([]);
  };

  const logout = async () => {
    try {
      await signOut(auth);

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
    <>
      {userList.length > 0 && (
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
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faCircleUser}
                    className="mr-2 text-3xl"
                  />
                  {user.nickname}
                </div>
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
                disabled={checkedUsers.length < 2 ? true : false}
                className="py-4 w-full border-t border-gray-500 hover:bg-gray-500 text-sm"
                onClick={handleCompleteBtn}
              >
                {checkedUsers.length < 2 ? '2명 이상 선택해주세요.' : '완료'}
              </button>
            ) : (
              <button
                type="button"
                className="py-4 w-full border-t border-gray-500 hover:bg-gray-500 text-sm"
                onClick={() => setUserSelectMode(true)}
              >
                <FontAwesomeIcon icon={faUsers} className="text-lg mr-2" />
                그룹채팅 시작하기
              </button>
            )}
          </ul>
          <button
            type="button"
            className="py-4 w-full border-t border-gray-500 hover:bg-gray-500"
            onClick={logout}
          >
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              className="text-xl mr-2"
            />
            로그아웃
          </button>
        </div>
      )}
    </>
  );
}

export default UserList;
