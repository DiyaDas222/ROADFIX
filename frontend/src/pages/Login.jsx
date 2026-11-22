import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:5000";

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleName =
    role === "mechanic"
      ? "Mechanic"
      : role === "admin"
      ? "Admin"
      : "Customer";

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        API_URL + "/api/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
          role,
        }
      );

      const accessToken = response.data.access_token;
      const loggedInUser = response.data.user;

      if (!accessToken || !loggedInUser) {
        throw new Error("Invalid login response.");
      }

      if (loggedInUser.role !== role) {
        setError("You are not authorized for this account.");
        return;
      }

      login(accessToken, loggedInUser);

      if (role === "customer") {
        navigate("/customer/dashboard");
      } else if (role === "mechanic") {
        navigate("/mechanic/dashboard");
      } else {
        navigate("/admin/dashboard");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to sign in. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      API_URL + "/api/auth/google/login?role=" + role;
  };

  return (
    <div style={styles.page}>

      <div style={styles.leftSide}>
        <div style={styles.leftContent}>

          <button
            onClick={() => navigate("/")}
            style={styles.backButton}
          >
            ← Back
          </button>

          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>R</div>

            <div>
              <div style={styles.logoText}>ROADFIX</div>
              <div style={styles.logoSubtext}>
                ROADSIDE ASSISTANCE
              </div>
            </div>
          </div>

          <div style={styles.hero}>
            <div style={styles.heroLabel}>
              {roleName.toUpperCase()} ACCESS
            </div>

            <h1 style={styles.heroTitle}>
              Get back on the road.
              <br />
              Without the wait.
            </h1>

            <p style={styles.heroDescription}>
              Connect with roadside professionals
              whenever your vehicle needs help.
            </p>
          </div>

        </div>
      </div>

      <div style={styles.rightSide}>
        <div style={styles.loginCard}>

          <div style={styles.cardHeader}>
            <div style={styles.smallLabel}>
              WELCOME BACK
            </div>

            <h2 style={styles.title}>
              Welcome back.
            </h2>

            <p style={styles.subtitle}>
              Sign in to continue to your RoadFix account.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            style={styles.googleButton}
          >
            <span style={styles.googleIcon}>G</span>
            Continue with Google
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>OR</span>
            <span style={styles.dividerLine}></span>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Email Address
              </label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉</span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.passwordLabelRow}>
                <label style={styles.label}>
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  style={styles.forgotLink}
                >
                  Forgot password?
                </Link>
              </div>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={styles.input}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? "◉" : "◌"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.loginButton}
            >
              {loading ? "Signing in..." : "Sign in as " + roleName}
            </button>

          </form>

          {/* MANUAL ACCOUNT CREATION */}

          <div style={styles.registerText}>
            Don't have an account?{" "}

            {role === "admin" ? (
              <Link
                to="/admin/setup"
                style={styles.registerLink}
              >
                Create Admin Account
              </Link>
            ) : (
              <Link
                to={"/register/" + role}
                style={styles.registerLink}
              >
                Create one
              </Link>
            )}
          </div>

          <button
            onClick={() => navigate("/")}
            style={styles.roleButton}
          >
            ← Choose a different account type
          </button>

        </div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#0b0b0d",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },

  leftSide: {
    width: "50%",
    display: "flex",
    alignItems: "center",
    background: "#0b0b0d",
  },

  leftContent: {
    width: "100%",
    padding: "45px 60px",
    boxSizing: "border-box",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#999",
    cursor: "pointer",
    marginBottom: "55px",
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  logoIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    background: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 22,
  },

  logoText: {
    fontSize: 22,
    fontWeight: "bold",
  },

  logoSubtext: {
    fontSize: 9,
    color: "#777",
    marginTop: 3,
  },

  hero: {
    marginTop: 130,
  },

  heroLabel: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 43,
    lineHeight: 1.15,
  },

  heroDescription: {
    color: "#888",
    lineHeight: 1.7,
    maxWidth: 450,
  },

  rightSide: {
    width: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111113",
    padding: 30,
    boxSizing: "border-box",
  },

  loginCard: {
    width: "100%",
    maxWidth: 430,
  },

  cardHeader: {
    marginBottom: 30,
  },

  smallLabel: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "bold",
  },

  title: {
    fontSize: 34,
    marginBottom: 10,
  },

  subtitle: {
    color: "#888",
    fontSize: 14,
  },

  googleButton: {
    width: "100%",
    height: 48,
    border: "1px solid #444",
    borderRadius: 10,
    background: "#19191c",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  googleIcon: {
    display: "inline-flex",
    marginRight: 12,
    background: "#fff",
    color: "#4285F4",
    borderRadius: "50%",
    width: 21,
    height: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "25px 0",
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: "#333",
  },

  dividerText: {
    color: "#777",
  },

  errorBox: {
    padding: 12,
    background: "#451919",
    color: "#ff7777",
    borderRadius: 8,
    marginBottom: 15,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    display: "block",
    marginBottom: 8,
    color: "#ddd",
    fontSize: 13,
  },

  passwordLabelRow: {
    display: "flex",
    justifyContent: "space-between",
  },

  forgotLink: {
    color: "#f87171",
    textDecoration: "none",
    fontSize: 12,
  },

  inputWrapper: {
    height: 48,
    display: "flex",
    alignItems: "center",
    border: "1px solid #333",
    borderRadius: 10,
    background: "#0d0d0f",
  },

  inputIcon: {
    padding: 12,
    color: "#888",
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#fff",
  },

  eyeButton: {
    border: "none",
    background: "transparent",
    color: "#aaa",
    cursor: "pointer",
    padding: 12,
  },

  loginButton: {
    width: "100%",
    height: 49,
    border: "none",
    borderRadius: 10,
    background: "#dc2626",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  registerText: {
    marginTop: 25,
    textAlign: "center",
    color: "#999",
    fontSize: 13,
  },

  registerLink: {
    color: "#f87171",
    fontWeight: "bold",
    textDecoration: "none",
  },

  roleButton: {
    display: "block",
    margin: "22px auto",
    border: "none",
    background: "transparent",
    color: "#777",
    cursor: "pointer",
  },
};

export default Login;