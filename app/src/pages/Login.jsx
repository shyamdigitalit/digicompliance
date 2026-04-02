import React, { useState } from 'react';
import './styles/Login.css';
import Dashboard from './Dashboard';
import { useNavigate } from "react-router-dom";

const Login = () => {

    const navigate = useNavigate();

    const handleLogin = () => {
        const user = {
            name: "Raima"
        };

        localStorage.setItem("user", JSON.stringify(user));

        navigate("/dashboard"); 
    };

    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

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
                    <input type="text" placeholder="User ID" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)}
                    />

                    <label>Password</label>
                    <input type={showPassword ? "text" : "password"} placeholder="Password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)}
                    />

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