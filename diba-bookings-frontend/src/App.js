import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/dashboards/Dashboard";
import LandingPage from "./pages/LandingPage";
import PoliciesPage from "./pages/PoliciesPage";
import DibaAssistantWidget from "./components/common/DibaAssistantWidget";
import PaymentReturnPage from "./pages/PaymentReturnPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/payment/success" element={<PaymentReturnPage />} />
                <Route path="/payment/cancel" element={<PaymentReturnPage />} />
            </Routes>
            <DibaAssistantWidget />
            <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
    );
}

export default App;
