import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/components/Layout";
import Dashboard from "./pages/components/Dashboard";
import Compliance from "./pages/components/Compliance";
import Login from "./pages/components/Login";
import Document from "./pages/components/Document";
import User from "./pages/components/User";
import Setting from "./pages/components/Setting";
import MasterList from "./pages/components/MasterList";
import MasterForm from "./pages/components/MasterForm";

export default function App() {
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
                    <Route path="/document" element={<Document />} />
                    <Route path="/user" element={<User />} />
                    <Route path="/setting" element={<Setting />} />
                    <Route path="masters/:type" element={<MasterList />} />
                    <Route path="masters/:type/add" element={<MasterForm />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    );
}