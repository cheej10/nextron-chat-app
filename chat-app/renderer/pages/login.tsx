import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth } from '../firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Loading from '../components/Loading';

function Login() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const login = async () => {
    try {
      setIsLoading(true);

      if (!loginEmail.trim() || !loginPassword.trim()) {
        setIsError(true);
        setErrorMessage('정보를 모두 입력해주세요.');
        setIsLoading(false);
        return;
      }
      const user = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );

      localStorage.setItem('userId', user.user.uid);
      router.push('/home');
    } catch (error) {
      setIsLoading(false);
      setIsError(true);

      if (error.code === 'auth/user-not-found') {
        setErrorMessage('가입되지 않은 이메일입니다.');
      } else {
        setErrorMessage('이메일이나 비밀번호가 잘못되었습니다.');
      }
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>로그인</title>
      </Head>
      {isLoading ? (
        <Loading />
      ) : (
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
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                비밀번호
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            {isError && <p className="text-red-500 text-xs">{errorMessage}</p>}
            <div className="flex flex-col items-center justify-center mt-6">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={login}
              >
                로그인
              </button>
              <p className="my-2 cursor-pointer text-gray-700 underline text-sm">
                <Link href="/signup">회원가입</Link>
              </p>
            </div>
          </form>
        </div>
      )}
    </React.Fragment>
  );
}

export default Login;
