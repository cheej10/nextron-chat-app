import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

function ChatList({ handleListClick, myId }) {
  const [chatUserList, setChatUserList] = useState([]);
  const db = getDatabase();

  const getMyChatList = () => {
    let myChatRoomList = [];

    onValue(ref(db, 'usersChatRoomList/'), (snapshot) => {
      const data = snapshot.val();

      if (data) {
        myChatRoomList = Object.entries(data).filter((chatRoom) =>
          chatRoom[1].includes(myId)
        );
      }
    });

    myChatRoomList.forEach((chatRoom) => {
      const chatUserId = chatRoom[1].filter((key) => key !== myId);
      const groupChatUsers = [];

      if (chatUserId.length > 1) {
        chatUserId.forEach((userId) => {
          onValue(ref(db, 'users/' + userId), (snapshot) => {
            const user = snapshot.val();

            groupChatUsers.push({ key: userId, ...user });
          });
        });
        setChatUserList((pre) => [...pre, groupChatUsers]);
        return;
      }

      chatUserId.forEach((userId) => {
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
    <ul className="divide-y divide-gray-500">
      {chatUserList.map((user) => (
        <li
          key={
            Array.isArray(user) ? user.map(({ key }) => key).join('') : user.key
          }
          className="p-3 text-gray-100 hover:cursor-pointer hover:bg-gray-500"
          onClick={() => {
            handleListClick(user);
          }}
        >
          {Array.isArray(user)
            ? user.map(({ nickname }) => nickname).join(', ')
            : user.nickname}
        </li>
      ))}
    </ul>
  );
}

export default ChatList;
