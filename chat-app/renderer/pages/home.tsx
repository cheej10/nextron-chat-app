import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { getDatabase, ref, onValue } from 'firebase/database';
import { auth } from '../firebase-config';
import ChatRoom from '../components/ChatRoom';
import UserList from '../components/UserList';
import ChatList from '../components/ChatList';
import Loading from '../components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faUser } from '@fortawesome/free-solid-svg-icons';

type userType = {
  key: string;
  email: string;
  nickname: string;
};

type chatRoomType = [string, string[]];

function Home() {
  const [openChatRoom, setOpenChatRoom] = useState(false);
  const [openUserList, setOpenUserList] = useState(false);
  const [openChatList, setOpenChatList] = useState(false);
  const [chatUser, setChatUser] = useState<userType>();
  const [groupChatUsers, setGroupChatUsers] = useState<[userType]>();
  const [chatRoomKey, setChatRoomKey] = useState('');
  const [myInfo, setMyInfo] = useState<userType>();
  const db = getDatabase();

  const getMyInfo = () => {
    const myId = localStorage.getItem('userId');
    const usersRef = ref(db, 'users/' + myId);

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setMyInfo({ key: myId, ...data });
      }
    });
  };

  const handleTabClick = (tabName: string) => {
    setOpenChatRoom(false);

    if (tabName === 'userTab') {
      setOpenUserList(true);
      setOpenChatList(false);
    } else {
      setOpenChatList(true);
      setOpenUserList(false);
    }
  };

  const handleListClick = (user: userType | [userType]) => {
    setOpenChatRoom(true);

    if (Array.isArray(user)) {
      setChatUser(null);
      setGroupChatUsers(user);
    } else {
      setGroupChatUsers(null);
      setChatUser(user);
    }
  };

  const handleGroupChat = (users: [userType]) => {
    setOpenChatRoom(true);
    setGroupChatUsers(users);
  };

  const getChatRoomKey = () => {
    let myChatRoomList = [];

    onValue(ref(db, 'usersChatRoomList/'), (snapshot) => {
      const data = snapshot.val();

      if (data) {
        myChatRoomList = Object.entries(data).filter((chatRoom: chatRoomType) =>
          chatRoom[1].includes(myInfo?.key)
        );
      }
    });

    if (groupChatUsers?.length > 0) {
      const groupChatRoom = myChatRoomList.filter(
        (chatRoom: chatRoomType) => chatRoom[1].length > 2
      );

      const currentChatRoom = groupChatRoom.find((chatRoom: chatRoomType) => {
        const users = chatRoom[1].filter(
          (userId: string) => userId !== myInfo.key
        );

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
      .filter((chatRoom: chatRoomType) => chatRoom[1].length === 2)
      .find((chatRoom: chatRoomType) => chatRoom[1].includes(chatUser?.key));

    setChatRoomKey(currentChatRoom?.[0]);
  };

  const createRoomKey = (key: string) => {
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
      {myInfo && Object.keys(myInfo).length > 0 ? (
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
                <FontAwesomeIcon icon={faUser} className="text-xl" />
              </button>
              <button
                type="button"
                className={
                  'w-1/2 py-4 hover:bg-gray-500' +
                  (openChatList ? ' bg-gray-500' : '')
                }
                onClick={() => handleTabClick('chatTab')}
              >
                <FontAwesomeIcon icon={faComments} className="text-xl" />
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
      ) : (
        <Loading />
      )}
    </React.Fragment>
  );
}

export default Home;
