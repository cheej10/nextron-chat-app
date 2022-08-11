import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, set, push, ref, onValue, get } from 'firebase/database';

function ChatList({ handleListClick, myId }) {
  const [chatUserList, setChatUserList] = useState([]);
  const db = getDatabase();

  const getMyChatList = () => {
    onValue(ref(db, 'usersChatRoomList/'), (snapshot) => {
      const data = snapshot.val();
      const myChatRoomList = Object.entries(data).filter((chatRoom) =>
        chatRoom[1].includes(myId)
      );

      myChatRoomList.forEach((chatRoom) => {
        const chatUserId = chatRoom[1].find((key) => key !== myId);

        onValue(ref(db, 'users/' + chatUserId), (snapshot) => {
          const user = snapshot.val();

          setChatUserList((pre) => [
            ...pre,
            {
              key: chatUserId,
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
    <ul className="divide-y-2 divide-gray-100">
      {chatUserList.map((user) => (
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

export default ChatList;
