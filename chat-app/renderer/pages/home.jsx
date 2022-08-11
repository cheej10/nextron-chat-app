import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { auth } from '../firebase-config';
import { getDatabase, ref, onValue } from 'firebase/database';
import ChatRoom from '../components/ChatRoom';
import UserList from '../components/UserList';
import ChatList from '../components/ChatList';

function Home() {
  const [openChatRoom, setOpenChatRoom] = useState(false);
  const [openUserList, setOpenUserList] = useState(false);
  const [openChatList, setOpenChatList] = useState(false);
  const [chatUser, setChatUser] = useState({});
  const [chatRoomKey, setChatRoomKey] = useState('');
  const [myInfo, setMyInfo] = useState({});
  const db = getDatabase();

  const getMyInfo = () => {
    const myId = localStorage.getItem('userId');
    const usersRef = ref(db, 'users/' + myId);

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      setMyInfo({ key: myId, ...data });
    });
  };

  const handleTabClick = (tabName) => {
    setOpenChatRoom(false);

    if (tabName === 'userTab') {
      setOpenUserList(true);
      setOpenChatList(false);
    } else {
      setOpenChatList(true);
      setOpenUserList(false);
    }
  };

  const handleListClick = (user) => {
    setOpenChatRoom(true);
    setChatUser(user);
  };

  const getChatRoomKey = () => {
    onValue(ref(db, 'usersChatRoomList/'), (snapshot) => {
      const data = snapshot.val();
      const myChatRoomList = Object.entries(data).filter((chatRoom) =>
        chatRoom[1].includes(myInfo.key)
      );
      const currentChatRoom = myChatRoomList.find((chatRoom) =>
        chatRoom[1].includes(chatUser.key)
      );

      setChatRoomKey(currentChatRoom?.[0]);
    });
  };

  const createRoomKey = (key) => {
    setChatRoomKey(key);
  };

  useEffect(() => {
    getMyInfo();
    setOpenUserList(true);
  }, []);

  useEffect(() => {
    getChatRoomKey();
  }, [chatUser]);

  return (
    <React.Fragment>
      <Head>
        <title>홈</title>
      </Head>
      {Object.keys(myInfo).length > 0 && (
        <div className="flex">
          <div className="flex-none w-56 h-screen bg-gray-200 shadow">
            <div className="text-gray-700 divide-x-2 divide-gray-100 border-gray-100 border-b-2">
              <button
                type="button"
                className="w-1/2 py-4"
                onClick={() => handleTabClick('userTab')}
              >
                유저목록
              </button>
              <button
                type="button"
                className="w-1/2 py-4"
                onClick={() => handleTabClick('chatTab')}
              >
                채팅목록
              </button>
            </div>
            {openUserList && (
              <UserList
                handleListClick={handleListClick}
                myId={myInfo.key}
              ></UserList>
            )}
            {openChatList && (
              <ChatList
                handleListClick={handleListClick}
                myId={myInfo.key}
              ></ChatList>
            )}
          </div>
          {openChatRoom && (
            <ChatRoom
              chatRoomKey={chatRoomKey}
              createRoomKey={createRoomKey}
              chatUser={chatUser}
              myInfo={myInfo}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default Home;
