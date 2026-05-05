import {useDispatch, useSelector} from 'react-redux';
import {Dropdown} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-regular-svg-icons';
import {faComments, faGear, faNewspaper, faRightFromBracket} from '@fortawesome/free-solid-svg-icons';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import authAPIs from '../../../../api/auth';
import {EToastNotifyType, toastNotify} from '../../../../utils/toastNotify';
import {clearUser} from '../../../../redux/slices/userSlice';
import Cookies from 'js-cookie';
import Avatar from '../../../../components/avatar';
import {RootState} from '../../../../redux/store';
import socket from '../../../../socket/socket';

const HeaderComp = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {label: 'Chat', path: '/', icon: faComments},
    {label: 'Bai dang', path: '/posts', icon: faNewspaper},
    {label: 'Profile', path: '/profile', icon: faUser},
  ];

  const handleLogout = async () => {
    try {
      const res = await authAPIs.logout();

      if (res.success == true) {
        // disconnect socket
        socket.disconnect();
        toastNotify('success', EToastNotifyType.SUCCESS);
        dispatch(clearUser());
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      }
    } catch (error) {
      toastNotify('error', EToastNotifyType.ERROR);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-between gap-3 px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-3.5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-200/70 transition-transform duration-200 hover:-translate-y-0.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-200" />
          DuckChat
        </div>
        <div className="flex items-center overflow-x-auto rounded-2xl bg-slate-100/80 p-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-sky-100 sm:px-4 ${
                  isActive
                    ? 'bg-white text-sky-600 shadow-sm shadow-slate-200'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-800 active:scale-95'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-xs" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden min-w-0 flex-col items-end sm:flex">
          <h1 className="max-w-40 truncate text-sm font-semibold text-slate-800">{user?.fullname}</h1>
          <span className="text-xs font-medium text-emerald-600">Online</span>
        </div>
        <Dropdown
          menu={{
            onClick: ({key}) => {
              if (key === '1') {
                navigate('/profile');
              }
            },
            items: [
              {
                key: '1',
                label: (
                  <div className="flex items-center my-1">
                    <FontAwesomeIcon icon={faUser} />
                    <p>&nbsp; Tài khoản</p>
                  </div>
                ),
              },
              {
                key: '2',
                label: (
                  <div className="flex items-center my-1">
                    <FontAwesomeIcon icon={faGear} />
                    <p>&nbsp; Cài đặt</p>
                  </div>
                ),
              },
              {
                key: '3',
                label: (
                  <div className="flex text-red-500 items-center my-1" onClick={() => handleLogout()}>
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    <p>&nbsp; Đăng xuất</p>
                  </div>
                ),
              },
            ],
          }}
        >
          <button className="rounded-full outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sky-100 active:scale-95">
            <Avatar src={user?.avatar ?? ''} />
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default HeaderComp;
