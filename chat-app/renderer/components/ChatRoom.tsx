import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, set, push, ref, onValue } from 'firebase/database';

function ChatRoom({
  chatRoomKey,
  createRoomKey,
  chatUser,
  groupChatUsers,
  myInfo,
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const db = getDatabase();
  const bottomOfMessage = useRef(null);

  const getChatRoomData = () => {
    setMessages([]);

    if (!chatRoomKey) return;

    const chatRoomRef = ref(db, 'chatRooms/' + chatRoomKey);

    onValue(chatRoomRef, (snapshot) => {
      const data = snapshot.val();

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
    });
  };

  const createChatRoom = () => {
    let key = '';

    if (groupChatUsers?.length > 0) {
      key = push(ref(db, 'groupChatRooms/')).key;

      set(ref(db, 'usersChatRoomList/' + key), [
        myInfo.key,
        ...groupChatUsers.map(({ key }) => key),
      ]);
    } else {
      key = push(ref(db, 'chatRooms/')).key;

      set(ref(db, 'usersChatRoomList/' + key), [myInfo.key, chatUser.key]);
    }

    createRoomKey(key);
    return key;
  };

  const sendMessage = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      setInputMessage('');

      if (!messages.length) {
        const key = createChatRoom();
        saveMessageData(key);
        return;
      }

      saveMessageData(chatRoomKey);
    }
  };

  const saveMessageData = (key: string) => {
    const chatRoomRef = ref(db, 'chatRooms/' + key);

    push(chatRoomRef, {
      user: myInfo.key,
      message: inputMessage,
      userNickname: myInfo.nickname,
    });

    getChatRoomData();
  };

  useEffect(() => {
    bottomOfMessage.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    getChatRoomData();
  }, [chatRoomKey]);

  return (
    <div className="grow w-full max-h-screen flex flex-col bg-gray-400">
      <div className="bg-gray-400 text-gray-900 h-14 shadow p-4 font-bold">
        {groupChatUsers?.length
          ? groupChatUsers.map(({ nickname }) => nickname).join(', ')
          : chatUser.nickname}
      </div>
      <div className="grow overflow-y-auto text-gray-900 px-2">
        {messages.map(({ key, message, userNickname }) => (
          <div
            key={key}
            className={
              'my-2 flex flex-col' +
              (userNickname === myInfo.nickname ? ' items-end' : ' items-start')
            }
          >
            <p>{userNickname === myInfo.nickname ? '' : userNickname}</p>
            <p className="bg-white w-fit p-1.5 rounded-md">{message}</p>
          </div>
        ))}
        <div ref={bottomOfMessage}></div>
      </div>
      <textarea
        id="message"
        rows={5}
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
