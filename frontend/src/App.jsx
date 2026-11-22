import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";

import AuthProvider, {
  useAuth
} from "./context/AuthContext";

import NotificationBell from "./components/NotificationBell";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import CustomerDashboard from "./pages/CustomerDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ServiceRequest from "./pages/ServiceRequest";
import CustomerRequests from "./pages/CustomerRequests";
import MechanicRequests from "./pages/MechanicRequests";

import AdminSetup from "./pages/AdminSetup";
import Vehicles from "./pages/vehicles";
import LiveTracking from "./pages/LiveTracking";
import SpareParts from "./pages/SpareParts";
import AdminParts from "./pages/AdminParts";
import Payment from "./pages/Payment";


function GoogleLoginHandler({ children }) {

  const location = useLocation();
  const navigate = useNavigate();

  const { login } = useAuth();

  useEffect(() => {

    const params = new URLSearchParams(location.search);

    const token = params.get("google_token");
    const error = params.get("error");

    if (token) {

      const role = location.pathname.split("/").pop();

      login(token, { role });

      if (["customer", "mechanic", "admin"].includes(role)) {
        navigate(`/${role}/dashboard`, {
          replace: true
        });
      }
    }

    if (error) {

      window.alert(error.replaceAll("_", " "));

      navigate(location.pathname, {
        replace: true
      });
    }

  }, [location, login, navigate]);

  return children;
}


function AppContent() {

  return (
    <>
      <NotificationBell />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/login/:role"
          element={
            <GoogleLoginHandler>
              <Login />
            </GoogleLoginHandler>
          }
        />

        <Route path="/register/:role" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/admin/setup"
          element={<AdminSetup />}
        />

        <Route
          path="/customer/dashboard"
          element={<CustomerDashboard />}
        />

        <Route
          path="/customer/service-request"
          element={<ServiceRequest />}
        />

        <Route
          path="/customer/service-requests"
          element={<CustomerRequests />}
        />

        <Route
          path="/customer/vehicles"
          element={<Vehicles />}
        />

        <Route
          path="/customer/spare-parts"
          element={<SpareParts />}
        />

        <Route
          path="/customer/payment"
          element={<Payment />}
        />

        <Route
          path="/mechanic/dashboard"
          element={<MechanicDashboard />}
        />

        <Route
          path="/mechanic/requests"
          element={<MechanicRequests />}
        />

        <Route
          path="/live-tracking"
          element={<LiveTracking />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/spare-parts"
          element={<AdminParts />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </>
  );
}


function App() {

  return (
    <BrowserRouter>

      <AuthProvider>
        <AppContent />
      </AuthProvider>

    </BrowserRouter>
  );
}


export default App;