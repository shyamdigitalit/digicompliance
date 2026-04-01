import { useEffect } from 'react';
import Router from './routes/Router';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/slices/authSlice';
import Login from './pages/Login';

const App = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) return <div className="loader-css">
        <img src="./loader.svg" width={200}  alt="" />
      </div>;

  // if (!isAuthenticated) return location.assign('/login');
  if (!loading) return <Router />;
};

export default App;
