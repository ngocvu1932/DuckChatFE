import {faRepeat} from '@fortawesome/free-solid-svg-icons';
import BG from '../../assets/imgs/background1.png';
import {Dropdown, Space, Tabs} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import vn_flag from '../../assets/imgs/img_flag_viet_nam.png';
import en_flag from '../../assets/imgs/img_flag_usa.png';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import LoginComp from './component/login';
import RegisterComp from './component/register';
import {useState} from 'react';
const VERSION = import.meta.env.VITE_APP_VER;

const LoginPage = () => {
  const [activeTabKey, setActiveTabKey] = useState('1');
  const {t} = useTranslation();
  const appConfig = JSON.parse(localStorage.getItem('appConfig') ?? '{}');
  const lang = JSON.parse(localStorage.getItem('appConfig') ?? '{}').defaultLanguage ?? 'vi';

  const changeLanguage = (lng: string) => {
    localStorage.setItem('appConfig', JSON.stringify({...appConfig, defaultLanguage: lng}));
    setTimeout(() => {
      i18next.changeLanguage(lng);
    }, 500);
  };

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const items = [
    {
      label: <p className="text-base">{t('sys_login')}</p>, // Đăng nhập
      key: '1',
      children: <LoginComp />,
    },
    {
      label: <p className="text-base">{t('sys_register')}</p>, //Đăng ký
      key: '2',
      children: <RegisterComp setActivedTabKey={(value: string) => setActiveTabKey(value)} />,
    },
    {
      label: <p className="text-base">{t('sys_guest')}</p>, // Khách
      key: '3',
      children: <div>Đang phát triển...</div>,
    },
  ];

  const renderButton = () => {
    return (
      <Dropdown
        menu={{
          items: [
            {
              key: '1',
              label: (
                <div className="flex items-center my-1" onClick={() => changeLanguage('vi')}>
                  <img className="w-7 h-5 rounded-sm" src={vn_flag} />
                  <p>&nbsp; Việt Nam</p>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <div className="flex items-center my-1" onClick={() => changeLanguage('en')}>
                  <img className="w-7 h-5 rounded-sm" src={en_flag} />
                  <p>&nbsp; English (US)</p>
                </div>
              ),
            },
          ],
        }}
      >
        <div onClick={(e) => e.preventDefault()}>
          <Space className="ml-8 py-1 px-3 rounded-xl border border-gray-400">
            <img
              className="h-4 w-6 rounded-sm"
              src={lang === 'vi' ? vn_flag : en_flag}
              alt={lang === 'vi' ? 'vn' : 'en'}
            />
            <FontAwesomeIcon icon={faRepeat} />
          </Space>
        </div>
      </Dropdown>
    );
  };

  return (
    <div
      className="relative w-full h-screen flex justify-center overflow-hidden items-center bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url(${BG})`,
      }}
    >
      <div className="bg-white rounded-xl px-8 pb-3">
        <Tabs activeKey={activeTabKey} onChange={handleTabChange} tabBarExtraContent={renderButton()} items={items} />
      </div>

      <div className="absolute bottom-3 text-white">
        {t('sys_version')} {VERSION}
      </div>
    </div>
  );
};

export default LoginPage;
