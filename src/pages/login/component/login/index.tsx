import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import TextInput from '../../../../components/text-input';
import LoadingSpinner from '../../../../components/loading-spinner';
import authAPIs from '../../../../api/auth';
import {useDispatch} from 'react-redux';
import {setUser} from '../../../../redux/slices/userSlice';
import Cookies from 'js-cookie';
import {toast} from 'react-toastify';

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
      if (res.status === 200) {
        dispatch(setUser(res.data));
        Cookies.set('accessToken', res.data.accessToken ?? '');
        Cookies.set('refreshToken', res.data.refreshToken ?? '');
      } else if (res.status === 207) {
        toast.warning(t('sys_notify_account_dont_verify'), {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      } else {
        toast.error(t('sys_notify_login_fail'), {
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
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(t('sys_notify_login_fail'), {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
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
    <div className="mt-4">
      <form className="" onSubmit={(e) => handleLogin(e)}>
        <div className="flex flex-col mb-4">
          <TextInput
            value={userLogin.username}
            placeholder={t('sys_login_username')}
            className=""
            changeText={(text) => setUserLogin({...userLogin, username: text})}
          />
          <span className="text-red-500 italic">{isError.username.error && `(*) ${isError.username.textError}`}</span>
        </div>

        <div className="flex flex-col mb-4">
          <TextInput
            value={userLogin.password}
            placeholder={t('sys_login_password')}
            type="password"
            className=""
            changeText={(text) => setUserLogin({...userLogin, password: text})}
          />
          <span className="text-red-500 italic">{isError.password.error && `(*) ${isError.password.textError}`}</span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <label className="text-sm flex items-center">
            <input type="checkbox" checked={rememberMe} onChange={changeRememberMe} className="w-4 h-4" />
            <p className="px-2">{t('sys_login_remember')}</p> {/* Ghi nhớ tôi*/}
          </label>
          <a href="#" className="text-sm">
            {t('sys_login_forgot_password')} {/* Quên mật khẩu? */}
          </a>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white rounded-xl py-2">
          {isLoading ? <LoadingSpinner color="white" /> : t('sys_login')}
        </button>
      </form>
    </div>
  );
};

export default LoginComp;
