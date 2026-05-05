import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import TextInput from '../../../../components/text-input';
import LoadingSpinner from '../../../../components/loading-spinner';
import authAPIs from '../../../../api/auth';
import {EToastNotifyType, toastNotify} from '../../../../utils/toastNotify';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEnvelope, faKey, faLock, faUser} from '@fortawesome/free-solid-svg-icons';

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
      if (res.success == true) {
        setShowModal(true);
      } else {
        toastNotify(res.message, EToastNotifyType.ERROR);
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

      if (res.success == true) {
        setShowModal(false);
        setActivedTabKey && setActivedTabKey('1');
        setUserRegister({username: '', email: '', password: '', repassword: ''});
        toastNotify(t('sys_notify_verify_success'), EToastNotifyType.SUCCESS);
      } else {
        toastNotify(res.message, EToastNotifyType.ERROR);
      }
    } catch (error) {
      toastNotify(t('sys_notify_verify_error'), EToastNotifyType.ERROR);
    } finally {
      setIsLoading((prev) => ({...prev, verify: false}));
    }
  };

  return (
    <div className="mt-5">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          handleRegister(e);
        }}
      >
        <div className="flex flex-col">
          <TextInput
            rounded="xl"
            value={userRegister.username}
            placeholder={t('sys_login_username')}
            prefix={<FontAwesomeIcon icon={faUser} />}
            className="h-12"
            changeText={(text) => {
              (setUserRegister({...userRegister, username: text}),
                setIsError((prev) => ({...prev, username: {error: false, textError: ''}})));
            }}
          />
          <span className="mt-1 min-h-5 max-w-[330px] text-xs font-medium text-rose-500">
            {isError.username.error && `(*) ${isError.username.textError}`}
          </span>
        </div>

        <div className="flex flex-col">
          <TextInput
            rounded="xl"
            value={userRegister.email}
            placeholder={t('sys_login_email')}
            prefix={<FontAwesomeIcon icon={faEnvelope} />}
            className="h-12"
            changeText={(text) => {
              (setUserRegister({...userRegister, email: text}),
                setIsError((prev) => ({...prev, email: {error: false, textError: ''}})));
            }}
          />
          <span className="mt-1 min-h-5 text-xs font-medium text-rose-500">
            {isError.email.error && `(*) ${isError.email.textError}`}
          </span>
        </div>

        <div className="flex flex-col">
          <TextInput
            rounded="xl"
            value={userRegister.password}
            placeholder={t('sys_login_password')}
            type="password"
            prefix={<FontAwesomeIcon icon={faLock} />}
            className="h-12"
            changeText={(text) => {
              (setUserRegister({...userRegister, password: text}),
                setIsError((prev) => ({...prev, password: {error: false, textError: ''}})));
            }}
          />
          <span className="mt-1 min-h-5 text-xs font-medium text-rose-500">
            {isError.password.error && `(*) ${isError.password.textError}`}
          </span>
        </div>

        <div className="flex flex-col">
          <TextInput
            rounded="xl"
            value={userRegister.repassword}
            placeholder={t('sys_login_repassword')}
            type="password"
            prefix={<FontAwesomeIcon icon={faKey} />}
            className="h-12"
            changeText={(text) => {
              (setUserRegister({...userRegister, repassword: text}),
                setIsError((prev) => ({...prev, repassword: {error: false, textError: ''}})));
            }}
          />
          <span className="mt-1 min-h-5 text-xs font-medium text-rose-500">
            {isError.repassword.error && `(*) ${isError.repassword.textError}`}
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading.register}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-sky-600 hover:to-cyan-600 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0 disabled:cursor-wait disabled:opacity-75"
        >
          {isLoading.register ? <LoadingSpinner color="white" /> : t('sys_register')}
        </button>
      </form>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/40 bg-white p-6 text-center shadow-2xl shadow-slate-950/25 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <p className="mb-3 text-xl font-bold text-slate-900">{t('sys_enter_verify_code')}</p>
            <p className="text-sm leading-6 text-slate-500">
              {t('sys_enter_verify_code_notify')}{' '}
              <span className="font-semibold italic text-slate-800">{userRegister.email}</span>
            </p>

            <input
              onChange={(e) => setVerifyCode(e.target.value)}
              type="text"
              className="mt-5 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold tracking-[0.32em] text-slate-900 outline-none transition-all duration-200 hover:border-sky-300 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
            <button
              disabled={verifyCode === '' || isLoading.verify}
              onClick={() => {
                handleSubmitVerify();
              }}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-sky-600 hover:to-cyan-600 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0 disabled:cursor-not-allowed disabled:from-sky-300 disabled:to-cyan-300 disabled:shadow-none"
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
