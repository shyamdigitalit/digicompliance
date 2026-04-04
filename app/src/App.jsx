import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/components/Layout";
import Dashboard from "./pages/components/Dashboard";
import Compliance from "./pages/components/Compliance";
import Login from "./pages/components/Login";

function App() {
    const isLoggedIn = localStorage.getItem("user");

    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login />} />

                {/* Protected Layout */}
                <Route
                    element={isLoggedIn ? <Layout /> : <Navigate to="/login" />}
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/compliance" element={<Compliance />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;