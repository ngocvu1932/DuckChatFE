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
      label: <span className="text-sm font-semibold">{t('sys_login')}</span>,
      key: '1',
      children: <LoginComp />,
    },
    {
      label: <span className="text-sm font-semibold">{t('sys_register')}</span>,
      key: '2',
      children: <RegisterComp setActivedTabKey={(value: string) => setActiveTabKey(value)} />,
    },
    {
      label: <span className="text-sm font-semibold">{t('sys_guest')}</span>,
      key: '3',
      children: (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm font-medium text-slate-500">
          Đang phát triển...
        </div>
      ),
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
                <div className="my-1 flex items-center gap-2 rounded-lg px-1 py-1" onClick={() => changeLanguage('vi')}>
                  <img className="h-5 w-7 rounded-sm object-cover" src={vn_flag} alt="Viet Nam" />
                  <p className="text-sm font-medium text-slate-700">Việt Nam</p>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <div className="my-1 flex items-center gap-2 rounded-lg px-1 py-1" onClick={() => changeLanguage('en')}>
                  <img className="h-5 w-7 rounded-sm object-cover" src={en_flag} alt="English" />
                  <p className="text-sm font-medium text-slate-700">English (US)</p>
                </div>
              ),
            },
          ],
        }}
      >
        <div onClick={(e) => e.preventDefault()}>
          <Space className="ml-4 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm transition-all duration-200 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 hover:shadow-md">
            <img
              className="h-4 w-6 rounded-sm object-cover"
              src={lang === 'vi' ? vn_flag : en_flag}
              alt={lang === 'vi' ? 'vn' : 'en'}
            />
            <FontAwesomeIcon icon={faRepeat} className="text-xs" />
          </Space>
        </div>
      </Dropdown>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <img src={BG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.36),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.78),rgba(15,23,42,0.38)_48%,rgba(8,47,73,0.72))]" />

      <div className="absolute left-6 top-6 hidden items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white shadow-lg shadow-slate-950/20 backdrop-blur-md sm:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-400 text-sm font-black text-slate-950 shadow-lg shadow-sky-900/20">
          D
        </span>
        <span className="text-sm font-semibold tracking-wide">DuckChat</span>
      </div>

      <div className="relative grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden text-white lg:block">
          <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-50 shadow-lg shadow-slate-950/20 backdrop-blur-md">
            Trò chuyện hiện đại
          </div>
          <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight">
            Kết nối nhanh hơn, trò chuyện mượt mà hơn
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-200">
            Đăng nhập để tiếp tục cuộc trò chuyện, quản lý nhóm và luôn nắm bắt được mọi thông tin
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {['Secure', 'Realtime', 'Simple'].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/30 bg-white/95 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl transition-all duration-300 hover:shadow-sky-950/20 sm:p-7">
            <div className="mb-6 lg:hidden">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-base font-black text-white shadow-lg shadow-sky-200">
                  D
                </span>
                <span className="text-lg font-bold text-slate-900">DuckChat</span>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                Chào mừng bạn quay lại. Hãy tiếp tục đến không gian tuyệt vời của bạn.
              </p>
            </div>
            <Tabs
              activeKey={activeTabKey}
              onChange={handleTabChange}
              tabBarExtraContent={renderButton()}
              items={items}
              className="[&_.ant-tabs-content-holder]:pt-1 [&_.ant-tabs-ink-bar]:h-1 [&_.ant-tabs-ink-bar]:rounded-full [&_.ant-tabs-ink-bar]:bg-sky-500 [&_.ant-tabs-nav]:mb-4 [&_.ant-tabs-nav]:before:border-slate-100 [&_.ant-tabs-tab]:px-1 [&_.ant-tabs-tab]:text-slate-500 [&_.ant-tabs-tab-btn]:transition-colors [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-sky-600"
            />
          </div>
        </section>
      </div>

      <div className="absolute bottom-4 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur-md">
        {t('sys_version')} {VERSION}
      </div>
    </div>
  );
};

export default LoginPage;
