import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/dashboards/Dashboard";
import LandingPage from "./pages/LandingPage";
import DibaAssistantWidget from "./components/common/DibaAssistantWidget";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
            <DibaAssistantWidget />
            <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
    );
}

export default App;
