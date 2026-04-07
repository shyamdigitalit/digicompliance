import React, { useState } from 'react';
import '../styles/Login.css';
// import Dashboard from './Dashboard';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from '../../redux/slices/auth';
import { snackbarReducer } from '../../redux/slices/snackbar';
import axiosInstance from '../../config/axiosInstance';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            if (!username || !password) {
                setError("Please fill in all fields");
                return;
            }
            else {
                const response = await axiosInstance.post("/api/auth/login", { acc_uname: username, acc_pass: password });

                if (response.status === 200) {
                    navigate("/");
                    const userData = response.data;
                    localStorage.setItem("user", JSON.stringify(userData.data));
                    dispatch(setCredentials(userData));
                    dispatch(snackbarReducer({ message: "Login successful!", severity: "success" }));
                }
            }
        } catch (error) {
            console.error(error)
        }
    };

    return (
        <div className="login-cont">
            <div className="login-card">

                <div className="login-header">
                    <div className="logo-circle">✔</div>
                    <h2 className="login-title">
                        Statutory Compliance Document Management System
                    </h2>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <label>Username</label>
                    <input type="text" placeholder="User ID" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} />

                    <label>Password</label>
                    <input type={showPassword ? "text" : "password"} placeholder="Password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} />

                    <div className="login-options">
                        <label className="checkbox">
                            <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
                            Show Password
                        </label>

                        <span className="forgot">Forgot Password?</span>
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                     <button onClick={handleLogin} className='login-button'>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;