import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import TextInput from '../../../../components/text-input';
import LoadingSpinner from '../../../../components/loading-spinner';
import authAPIs from '../../../../api/auth';
import {useDispatch} from 'react-redux';
import {setUser} from '../../../../redux/slices/userSlice';
import Cookies from 'js-cookie';
import {toast} from 'react-toastify';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faLock, faUser} from '@fortawesome/free-solid-svg-icons';

const LoginComp = () => {
  const {t} = useTranslation();
  const appConfig = JSON.parse(localStorage.getItem('appConfig') ?? '{}');
  const [rememberMe, setRememberMe] = useState(appConfig.rememberMe || false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLogin, setUserLogin] = useState({username: '', password: ''});
  const [isError, setIsError] = useState({
    username: {error: false, textError: ''},
    password: {error: false, textError: ''},
  });

  const dispatch = useDispatch();

  const changeRememberMe = () => {
    const newRememberMe = !rememberMe;
    setRememberMe(newRememberMe);
    localStorage.setItem('appConfig', JSON.stringify({...appConfig, rememberMe: newRememberMe}));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!checkValidate()) {
        return;
      }
      const res = await authAPIs.login(userLogin);

      if (res.success) {
        dispatch(setUser(res.data));
        Cookies.set('accessToken', res.data.accessToken ?? '');
        Cookies.set('refreshToken', res.data.refreshToken ?? '');
      } else {
        toast.warning(t(res.message), {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkValidate = (): boolean => {
    let success = true;

    const regexUsername = /^[a-zA-Z0-9]+$/;
    if (!regexUsername.test(userLogin.username)) {
      setIsError((prev) => ({
        ...prev,
        username: {error: true, textError: t('sys_notify_error_username_regex')},
      }));
      success = false;
    }

    if (userLogin.username.length > 11) {
      setIsError((prev) => ({
        ...prev,
        username: {error: true, textError: t('sys_notify_error_username_length')},
      }));
      success = false;
    }

    if (userLogin.username === '') {
      setIsError((prev) => ({...prev, username: {error: true, textError: t('sys_notify_error_username_null')}}));
      success = false;
    }

    if (userLogin.password === '') {
      setIsError((prev) => ({...prev, password: {error: true, textError: t('sys_notify_error_password_null')}}));
      success = false;
    }

    return success;
  };

  return (
    <div className="mt-5">
      <form className="space-y-4" onSubmit={(e) => handleLogin(e)}>
        <div className="flex flex-col">
          <TextInput
            rounded="xl"
            value={userLogin.username}
            placeholder={t('sys_login_username')}
            prefix={<FontAwesomeIcon icon={faUser} />}
            className="h-12"
            changeText={(text) => setUserLogin({...userLogin, username: text})}
          />
          <span className="mt-1 min-h-5 text-xs font-medium text-rose-500">
            {isError.username.error && `(*) ${isError.username.textError}`}
          </span>
        </div>

        <div className="flex flex-col">
          <TextInput
            rounded="xl"
            value={userLogin.password}
            placeholder={t('sys_login_password')}
            type="password"
            prefix={<FontAwesomeIcon icon={faLock} />}
            className="h-12"
            changeText={(text) => setUserLogin({...userLogin, password: text})}
          />
          <span className="mt-1 min-h-5 text-xs font-medium text-rose-500">
            {isError.password.error && `(*) ${isError.password.textError}`}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={changeRememberMe}
              className="h-4 w-4 rounded border-slate-300 text-sky-500 transition duration-200 focus:ring-4 focus:ring-sky-100"
            />
            <p className="px-2">{t('sys_login_remember')}</p>
          </label>
          <a
            href="#"
            className="text-sm font-semibold text-sky-600 transition-colors duration-200 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100"
          >
            {t('sys_login_forgot_password')}
          </a>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-sky-600 hover:to-cyan-600 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-100 active:translate-y-0 disabled:cursor-wait disabled:opacity-75"
        >
          {isLoading ? <LoadingSpinner color="white" /> : t('sys_login')}
        </button>
      </form>
    </div>
  );
};

export default LoginComp;
