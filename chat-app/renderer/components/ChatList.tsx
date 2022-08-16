import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUser } from '@fortawesome/free-solid-svg-icons';

type propsType = {
  handleListClick: Function;
  myId: string;
};

type chatRoomType = [string, string[]];

function ChatList({ handleListClick, myId }: propsType) {
  const [chatUserList, setChatUserList] = useState([]);
  const db = getDatabase();

  const getMyChatList = () => {
    let myChatRoomList = [];

    onValue(ref(db, 'usersChatRoomList/'), (snapshot) => {
      const data = snapshot.val();

      if (data) {
        myChatRoomList = Object.entries(data).filter((chatRoom: chatRoomType) =>
          chatRoom[1].includes(myId)
        );
      }
    });

    myChatRoomList.forEach((chatRoom: chatRoomType) => {
      const chatUserId = chatRoom[1].filter((key: string) => key !== myId);
      const groupChatUsers = [];

      if (chatUserId.length > 1) {
        chatUserId.forEach((userId: string) => {
          onValue(ref(db, 'users/' + userId), (snapshot) => {
            const user = snapshot.val();

            groupChatUsers.push({ key: userId, ...user });
          });
        });

        setChatUserList((pre) => [...pre, groupChatUsers]);
        return;
      }

      chatUserId.forEach((userId: string) => {
        onValue(ref(db, 'users/' + userId), (snapshot) => {
          const user = snapshot.val();
          setChatUserList((pre) => [
            ...pre,
            {
              key: userId,
              nickname: user.nickname,
            },
          ]);
        });
      });
    });
  };

  useEffect(() => {
    getMyChatList();
  }, []);

  return (
    <>
      {chatUserList.length > 0 && (
        <ul className="divide-y divide-gray-500">
          {chatUserList.map((user) => (
            <li
              key={
                Array.isArray(user)
                  ? user.map(({ key }) => key).join('')
                  : user.key
              }
              className="p-3 text-gray-100 hover:cursor-pointer hover:bg-gray-500"
              onClick={() => {
                handleListClick(user);
              }}
            >
              {Array.isArray(user) ? (
                <div>
                  <FontAwesomeIcon icon={faUsers} className="mr-2 text-md" />
                  {user.map(({ nickname }) => nickname).join(', ')}
                </div>
              ) : (
                <div>
                  <FontAwesomeIcon icon={faUser} className="mr-3 text-xl" />
                  {user.nickname}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default ChatList;
