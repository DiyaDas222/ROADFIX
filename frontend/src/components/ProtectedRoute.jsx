import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  // Wait until authentication check finishes
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f6f1",
          color: "#172019",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>ROADFIX</h2>
          <p>Checking your account...</p>
        </div>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User role does not match the requested dashboard
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  // Authentication successful
  return children;
}

export default ProtectedRoute;