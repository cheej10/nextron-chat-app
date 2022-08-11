import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import ChatRoom from '../components/ChatRoom';

function Home() {
  const [userList, setUserList] = useState([]);
  const [openChatRoom, setOpenChatRoom] = useState(false);
  const [chatUser, setChatUser] = useState({});
  const myId = useRef(null);

  const getUsers = () => {
    const db = getDatabase();
    const usersRef = ref(db, 'users/');

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      setUserList(
        Object.keys(data)
          .filter((key) => key !== myId.current)
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
    myId.current = localStorage.getItem('userId');
    getUsers();
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>홈</title>
      </Head>
      <div className="flex">
        <div className="flex-none w-56 h-screen bg-gray-200 shadow">
          <ul className="divide-y-2 divide-gray-100">
            {userList.map((user) => (
              <li
                key={user.key}
                className="p-3 text-gray-700 hover:cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setOpenChatRoom(true);
                  setChatUser(user);
                }}
              >
                {user.nickname}
              </li>
            ))}
          </ul>
        </div>
        {openChatRoom && <ChatRoom chatUser={chatUser} myId={myId.current} />}
      </div>
    </React.Fragment>
  );
}

export default Home;
