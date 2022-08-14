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
  const [groupChatUsers, setGroupChatUsers] = useState([]);
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

    if (Array.isArray(user)) {
      setChatUser({});
      setGroupChatUsers(user);
    } else {
      setGroupChatUsers([]);
      setChatUser(user);
    }
  };

  const handleGroupChat = (users) => {
    setOpenChatRoom(true);
    setGroupChatUsers(users);
  };

  const getChatRoomKey = () => {
    let myChatRoomList = [];

    onValue(ref(db, 'usersChatRoomList/'), (snapshot) => {
      const data = snapshot.val();
      // 이미 있는 방인지(유저 구성 일치하는 방 있는지) 확인하는 로직?
      if (data) {
        myChatRoomList = Object.entries(data).filter((chatRoom) =>
          chatRoom[1].includes(myInfo.key)
        );
      }
    });

    if (groupChatUsers.length > 0) {
      const groupChatRoom = myChatRoomList.filter(
        (chatRoom) => chatRoom[1].length > 2
      );

      const currentChatRoom = groupChatRoom.find((chatRoom) => {
        const users = chatRoom[1].filter((userId) => userId !== myInfo.key);
        console.log();
        if (
          users.sort().join('') ===
          groupChatUsers
            .map(({ key }) => key)
            .sort()
            .join('')
        )
          return chatRoom;
      });

      setChatRoomKey(currentChatRoom?.[0]);

      return;
    }

    const currentChatRoom = myChatRoomList
      .filter((chatRoom) => chatRoom[1].length === 2)
      .find((chatRoom) => chatRoom[1].includes(chatUser.key));

    setChatRoomKey(currentChatRoom?.[0]);
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
  }, [chatUser, groupChatUsers]);

  return (
    <React.Fragment>
      <Head>
        <title>홈</title>
      </Head>
      {Object.keys(myInfo).length > 0 && (
        <div className="flex">
          <div className="flex flex-col flex-none w-56 h-screen bg-gray-700 shadow">
            <div className="bg-gray-900 text-gray-100 divide-x divide-gray-500 border-gray-500 border-b">
              <button
                type="button"
                className={
                  'w-1/2 py-4 hover:bg-gray-500' +
                  (openUserList ? ' bg-gray-500' : '')
                }
                onClick={() => handleTabClick('userTab')}
              >
                유저목록
              </button>
              <button
                type="button"
                className={
                  'w-1/2 py-4 hover:bg-gray-500' +
                  (openChatList ? ' bg-gray-500' : '')
                }
                onClick={() => handleTabClick('chatTab')}
              >
                채팅목록
              </button>
            </div>
            {openUserList && (
              <UserList
                handleListClick={handleListClick}
                handleGroupChat={handleGroupChat}
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
              groupChatUsers={groupChatUsers}
              myInfo={myInfo}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default Home;
