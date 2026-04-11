import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LoginPage from './login';
import {useDispatch, useSelector} from 'react-redux';
import Cookies from 'js-cookie';
import {useEffect, useState} from 'react';
import authAPIs from '../api/auth';
import {setUser} from '../redux/slices/userSlice';
import Splash from '../components/splash';
import HomePage from './home';

const App = () => {
  const user = useSelector((state: any) => state.user.user);
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken || refreshToken) {
      getProfile();
    } else {
      // Nếu đã có user và không có accessToken thì không gọi hàm lấy profile, set loading = false để vào app
      setLoading(false);
    }
  }, [accessToken]);

  const getProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPIs.getProfile();
      if (res.status === 200) {
        dispatch(setUser(res.data));
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <Router>
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/profile" element={<div>Profile Page</div>} />
            <Route path="*" element={<div>Page not found</div>} />
          </>
        ) : (
          <>
            {/* Mọi route sẽ chuyển về login nếu chưa có user */}
            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
