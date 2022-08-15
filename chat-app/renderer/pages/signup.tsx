import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, set, ref } from 'firebase/database';

function Signup() {
  const [signupEmail, setSignupEmail] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const signup = async () => {
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );

      saveUserData(signupEmail, signupNickname, user.user.uid);
    } catch (error) {
      console.log(error);
    }
  };

  const saveUserData = (
    signupEmail: string,
    signupNickname: string,
    userId: string
  ) => {
    const db = getDatabase();

    set(ref(db, 'users/' + userId), {
      email: signupEmail,
      nickname: signupNickname,
    });
  };

  return (
    <React.Fragment>
      <Head>
        <title>회원가입</title>
      </Head>
      <div className="w-screen h-screen flex items-center justify-center">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              이메일
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              onChange={(e) => setSignupEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              닉네임
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="nickname"
              type="text"
              onChange={(e) => setSignupNickname(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              비밀번호
            </label>
            <input
              className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              onChange={(e) => setSignupPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={signup}
            >
              회원가입
            </button>
            <p className="my-2 cursor-pointer text-gray-700 underline text-sm">
              <Link href="/login">로그인</Link>
            </p>
          </div>
        </form>
      </div>
    </React.Fragment>
  );
}

export default Signup;
