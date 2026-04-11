import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import TextInput from '../../../../components/text-input';
import LoadingSpinner from '../../../../components/loading-spinner';
import authAPIs from '../../../../api/auth';
import {EToastNotifyType, toastNotify} from '../../../../utils/toastNotify';

interface IRegisterCompProps {
  setActivedTabKey: (key: string) => void;
}

const RegisterComp: React.FC<IRegisterCompProps> = ({setActivedTabKey}) => {
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState({register: false, verify: false});
  const [userRegister, setUserRegister] = useState({username: '', email: '', password: '', repassword: ''});
  const [isError, setIsError] = useState({
    username: {error: false, textError: ''},
    email: {error: false, textError: ''},
    password: {error: false, textError: ''},
    repassword: {error: false, textError: ''},
  });
  const [showModal, setShowModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');

  useEffect(() => {
    if (userRegister.password !== userRegister.repassword) {
      setIsError((prev) => ({...prev, repassword: {error: true, textError: 'Mật khẩu không khớp'}}));
    } else {
      setIsError((prev) => ({...prev, repassword: {error: false, textError: ''}}));
    }
  }, [userRegister.repassword, userRegister.password]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading((prev) => ({...prev, register: true}));
    try {
      if (!checkValidate()) return;
      const body = {
        username: userRegister.username,
        email: userRegister.email,
        password: userRegister.password,
      };
      const res = await authAPIs.register(body);
      if (res.statusCode === 200 || res.statusCode === 201) {
        setShowModal(true);
      } else if (res.statusCode === 401) {
        toastNotify(t('sys_notify_register_exist'), EToastNotifyType.ERROR);
      } else {
        toastNotify(t('sys_notify_register_username_gmail_exist'), EToastNotifyType.ERROR);
      }
    } catch (error) {
    } finally {
      setIsLoading((prev) => ({...prev, register: false}));
    }
  };

  const checkValidate = (): boolean => {
    let suscess = true;

    const regexUsername = /^[a-zA-Z0-9]+$/;
    if (!regexUsername.test(userRegister.username)) {
      setIsError((prev) => ({
        ...prev,
        username: {error: true, textError: t('sys_notify_error_username_regex')},
      }));
      suscess = false;
    }

    if (userRegister.username.length > 11) {
      setIsError((prev) => ({
        ...prev,
        username: {error: true, textError: t('sys_notify_error_username_length')},
      }));
      suscess = false;
    }

    if (userRegister.username === '') {
      setIsError((prev) => ({...prev, username: {error: true, textError: t('sys_notify_error_username_null')}}));
      suscess = false;
    }

    const regexEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!regexEmail.test(userRegister.email)) {
      setIsError((prev) => ({...prev, email: {error: true, textError: t('sys_notify_error_email_regex')}}));
      suscess = false;
    }

    if (userRegister.email === '') {
      setIsError((prev) => ({...prev, email: {error: true, textError: t('sys_notify_error_email_null')}}));
      suscess = false;
    }

    if (userRegister.password === '') {
      setIsError((prev) => ({...prev, password: {error: true, textError: t('sys_notify_error_password_null')}}));
      suscess = false;
    }

    if (userRegister.repassword === '') {
      setIsError((prev) => ({...prev, repassword: {error: true, textError: t('sys_notify_error_repassword_null')}}));
      suscess = false;
    }

    return suscess;
  };

  const handleSubmitVerify = async () => {
    setIsLoading((prev) => ({...prev, verify: true}));
    try {
      const body = {
        username: userRegister.username,
        email: userRegister.email,
        verifyCode: verifyCode,
      };
      const res = await authAPIs.verifyEmail(body);

      if (res.statusCode === 201) {
        setShowModal(false);
        setActivedTabKey && setActivedTabKey('1');
        setUserRegister({username: '', email: '', password: '', repassword: ''});
        toastNotify(t('sys_notify_verify_success'), EToastNotifyType.SUCCESS);
      } else if (res.statusCode === 402) {
        toastNotify(t('sys_notify_verify_code_invalid'), EToastNotifyType.ERROR);
      } else {
        toastNotify(t('sys_notify_verify_error'), EToastNotifyType.ERROR);
      }
    } catch (error) {
      toastNotify(t('sys_notify_verify_error'), EToastNotifyType.ERROR);
    } finally {
      setIsLoading((prev) => ({...prev, verify: false}));
    }
  };

  return (
    <div className="mt-4">
      <form
        className=""
        onSubmit={(e) => {
          handleRegister(e);
        }}
      >
        <div className="flex flex-col mb-4 ">
          <TextInput
            value={userRegister.username}
            placeholder={t('sys_login_username')}
            className=""
            changeText={(text) => {
              setUserRegister({...userRegister, username: text}),
                setIsError((prev) => ({...prev, username: {error: false, textError: ''}}));
            }}
          />
          <span className="text-red-500 italic max-w-[330px]">
            {isError.username.error && `(*) ${isError.username.textError}`}
          </span>
        </div>

        <div className="flex flex-col mb-4">
          <TextInput
            value={userRegister.email}
            placeholder={t('sys_login_email')}
            className=""
            changeText={(text) => {
              setUserRegister({...userRegister, email: text}),
                setIsError((prev) => ({...prev, email: {error: false, textError: ''}}));
            }}
          />
          <span className="text-red-500 italic">{isError.email.error && `(*) ${isError.email.textError}`}</span>
        </div>

        <div className="flex flex-col mb-4">
          <TextInput
            value={userRegister.password}
            placeholder={t('sys_login_password')}
            type="password"
            className=""
            changeText={(text) => {
              setUserRegister({...userRegister, password: text}),
                setIsError((prev) => ({...prev, password: {error: false, textError: ''}}));
            }}
          />
          <span className="text-red-500 italic">{isError.password.error && `(*) ${isError.password.textError}`}</span>
        </div>

        <div className="flex flex-col mb-4">
          <TextInput
            value={userRegister.repassword}
            placeholder={t('sys_login_repassword')}
            type="password"
            className=""
            changeText={(text) => {
              setUserRegister({...userRegister, repassword: text}),
                setIsError((prev) => ({...prev, repassword: {error: false, textError: ''}}));
            }}
          />
          <span className="text-red-500 italic">
            {isError.repassword.error && `(*) ${isError.repassword.textError}`}
          </span>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white rounded-xl py-2">
          {isLoading.register ? <LoadingSpinner color="white" /> : t('sys_register')}
        </button>
      </form>

      {showModal && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-4 max-w-[250px] rounded-xl flex items-center flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xl flex items-center mb-4 font-semibold">{t('sys_enter_verify_code')}</p>
            <p className="text-center">
              {t('sys_enter_verify_code_notify')} <span className="font-semibold italic">{userRegister.email}</span>
            </p>

            <input
              onChange={(e) => setVerifyCode(e.target.value)}
              type="text"
              className="outline-none text-center font-semibold  text-lg border-b-2 border-blue-500 h-10"
            />
            <button
              disabled={verifyCode === ''}
              onClick={() => {
                handleSubmitVerify();
              }}
              className={`${verifyCode === '' ? 'bg-blue-300' : 'bg-blue-500'} text-white rounded-xl py-2 mt-4 w-full`}
            >
              {isLoading.verify ? <LoadingSpinner color="white" /> : t('sys_submit_verify')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterComp;
