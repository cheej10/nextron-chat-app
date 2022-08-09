import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';

function Home() {
  const [userList, setUserList] = useState([]);

  const getUsers = () => {
    const db = getDatabase();
    const usersRef = ref(db, 'users/');

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      setUserList(
        Object.keys(data).map((key) => {
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
    onAuthStateChanged(auth, (currentUser) => {
      console.log(currentUser);
    });

    getUsers();
  }, []);

  console.log(userList);

  return (
    <React.Fragment>
      <Head>
        <title>홈</title>
      </Head>
      <div className="w-1/3 bg-white rounded-lg shadow">
        <ul className="divide-y-2 divide-gray-100">
          {userList.map(({ key, nickname }) => (
            <li key={key} className="p-3 text-gray-700">
              {nickname}
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
}

export default Home;
