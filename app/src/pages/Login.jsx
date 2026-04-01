import React from 'react'
import "../styles/Login.css";
import { useNavigate } from 'react-router'
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import IconButton from '@mui/material/IconButton';
import { Box, FilledInput, FormControl, InputAdornment, InputLabel, FormLabel, FormHelperText } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { showSnackbar } from '../redux/slices/snackbar';
import Dashboard from './Dashboard';

const Login = () => {

    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);
    // console.log(isAuthenticated);
    const [showPassword, setShowPassword] = React.useState(false);
    const [val, setVal] = React.useState({ acc_uname: '', acc_pass: '' });
    const navig = useNavigate();
    let name, value

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    // const handleMouseDownPassword = (event) => {
    //     event.preventDefault();
    // };
    // const handleMouseUpPassword = (event) => {
    //     event.preventDefault();
    // };

    const handleChange = (e) => {
        e.preventDefault();
        name = e.target.name;
        value = e.target.value;
        setVal({ ...val, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { acc_uname, acc_pass } = val;

        if (!acc_uname) {
            dispatch(showSnackbar({ message: "** UserId Required", severity: "notif" }));
            return;
        }

        if (!acc_pass) {
            dispatch(showSnackbar({ message: "** Password Required", severity: "notif" }));
            return;
        }

        const res = await dispatch(login({ acc_uname, acc_pass }));

        if (res.meta.requestStatus === "fulfilled") {
            dispatch(
                showSnackbar({
                    message: "Login successful",
                    severity: "success",
                })
            );
            navig('/dashboard');

        } else {
            dispatch(
                showSnackbar({
                    message: res.payload || "Invalid credentials",
                    severity: "error",
                })
            );
        }
    };

    if (isAuthenticated) {
        location.assign('/dashboard')
        // navig('/dashboard');
    }
    else {
        return (
            <div className="login-page">
                <div className='login-boxx'>
                    <div className="login-logo">
                        <img
                            src="logo1.png"
                            alt="Ecompliance Logo"
                            style={{ width: "160px" }}
                        />
                    </div>

                    <h2 className="login-title">Statutory Compliance Document Management System</h2>

                    <form onSubmit={handleSubmit} className="login-form">
                        <label>Username</label>
                        <input
                            type="text"
                            name="acc_uname"
                            placeholder="User ID"
                            value={val.acc_uname}
                            onChange={handleChange}
                        />
                        <label>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="acc_pass"
                            placeholder="Password"
                            value={val.acc_pass}
                            onChange={handleChange}
                        />

                        <div className="login-options">
                            <label className="show-password">
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={handleClickShowPassword}
                                />
                                <span>Show Password</span>
                            </label>

                            <a
                                href="#"
                                className="forgot-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert("Forgot password flow will be added later");
                                }}
                            >
                                Forgot Password?
                            </a>
                        </div>


                        <button type="submit" className="login-btn">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}

export default Login