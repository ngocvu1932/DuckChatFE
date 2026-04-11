import {useDispatch, useSelector} from 'react-redux';
import {User} from '../../../../api/auth/interface';
import {Dropdown} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-regular-svg-icons';
import {faGear, faRightFromBracket} from '@fortawesome/free-solid-svg-icons';
import authAPIs from '../../../../api/auth';
import {EToastNotifyType, toastNotify} from '../../../../utils/toastNotify';
import {setUser} from '../../../../redux/slices/userSlice';
import Cookies from 'js-cookie';

const HeaderComp = () => {
  const user: User = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const res = await authAPIs.logout();

      if (res.statusCode === 200) {
        toastNotify('success', EToastNotifyType.SUCCESS);
        dispatch(setUser(null));
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      }
    } catch (error) {
      toastNotify('error', EToastNotifyType.ERROR);
    }
  };

  return (
    <div className="flex w-full h-full items-center justify-between px-3">
      <div>Home</div>
      <div className="flex items-center">
        <h1 className="px-3">{user.fullname}</h1>
        <Dropdown
          menu={{
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
          <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full" />
        </Dropdown>
      </div>
    </div>
  );
};

export default HeaderComp;
