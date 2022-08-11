import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, set, push, ref, onValue, get } from 'firebase/database';

function ChatRoom({ chatRoomKey, createRoomKey, chatUser, myInfo }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const db = getDatabase();

  const getChatRoomData = () => {
    setMessages([]);

    const chatRoomRef = ref(db, 'chatRooms/' + chatRoomKey);

    onValue(chatRoomRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setMessages(
          Object.keys(data).map((key) => {
            return {
              key,
              message: Object.values(data[key])[0],
              userID: Object.values(data[key])[1],
              userNickname: Object.values(data[key])[2],
            };
          })
        );
      } else {
        setMessages([]);
      }
    });
  };

  const createChatRoom = () => {
    const key = push(ref(db, 'chatRooms/')).key;

    set(ref(db, 'usersChatRoomList/' + key), [myInfo.key, chatUser.key]);

    createRoomKey(key);
    return key;
  };

  const sendMessage = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      setInputMessage('');

      // 첫 메시지면 채팅방 생성
      if (!messages.length) {
        const key = createChatRoom();
        saveMessageData(key);
        return;
      }

      saveMessageData(chatRoomKey);
    }
  };

  const saveMessageData = (key) => {
    const chatRoomRef = ref(db, 'chatRooms/' + key);

    push(chatRoomRef, {
      user: myInfo.key,
      message: inputMessage,
      userNickname: myInfo.nickname,
    });

    getChatRoomData();
  };

  useEffect(() => {
    getChatRoomData();
  }, [chatRoomKey]);

  return (
    <div className="grow w-full max-h-screen flex flex-col">
      <div className="grow overflow-y-auto">
        {messages.map(({ key, message, userNickname }) => (
          <div key={key}>
            <p>{userNickname}</p>
            <p>{message}</p>
          </div>
        ))}
      </div>
      <textarea
        id="message"
        rows="5"
        className="shrink-0 p-2.5 w-full text-sm text-gray-900 bg-white focus:outline-0 resize-none"
        placeholder="메시지를 입력해주세요."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={sendMessage}
      ></textarea>
    </div>
  );
}

export default ChatRoom;