import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, set, push, ref, onValue, get } from 'firebase/database';

function ChatRoom({ chatUser, myId }) {
  const [myInfo, setMyInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatRoomKey = useRef('');
  const db = getDatabase();

  // 채팅 상대 바꿀때마다 setMyInfo하고 리렌더링
  useEffect(() => {
    getMyInfo();
  }, [chatUser]);

  // myInfo set되면 메시지 정보 가져오기
  useEffect(() => {
    getChatRoomData();
  }, [myInfo]);

  const getMyInfo = () => {
    const usersRef = ref(db, 'users/' + myId);

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      setMyInfo(data);
    });
  };

  const getChatRoomData = () => {
    setMessages([]);
    onValue(ref(db, 'usersChatRoomList/'), (snapshot) => {
      const data = snapshot.val();
      const myChatRoomList = Object.entries(data).filter((chatRoom) =>
        chatRoom[1].includes(myId)
      );
      const currentChatRoom = myChatRoomList.find((chatRoom) =>
        chatRoom[1].includes(chatUser.key)
      );

      if (!currentChatRoom) return;

      chatRoomKey.current = currentChatRoom[0];
      const chatRoomRef = ref(db, 'chatRooms/' + chatRoomKey.current);

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
    });
  };

  const createChatRoom = () => {
    const key = push(ref(db, 'chatRooms/')).key;

    set(ref(db, 'usersChatRoomList/' + key), [myId, chatUser.key]);
    chatRoomKey.current = key;
  };

  const sendMessage = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // 첫 메시지면 채팅방 생성
      if (!messages.length) {
        console.log('방 생성');
        createChatRoom();
      } else {
        console.log('방 있어');
      }

      saveMessageData();
      setInputMessage('');
    }
  };

  const saveMessageData = () => {
    const chatRoomRef = ref(db, 'chatRooms/' + chatRoomKey.current);
    push(chatRoomRef, {
      user: myId,
      message: inputMessage,
      userNickname: myInfo.nickname,
    });

    getChatRoomData();
  };

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
