import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function AdminSetup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    setup_key: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        API + "/api/auth/admin/setup",
        form
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login/admin");
      }, 1800);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create admin account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        <div style={styles.logo}>
          <div style={styles.logoIcon}>R</div>
          <div>
            <h1>ROADFIX</h1>
            <span>ROADSIDE ASSISTANCE PLATFORM</span>
          </div>
        </div>

        <div style={styles.heading}>
          <span style={styles.tag}>ADMINISTRATION</span>

          <h2>Create Admin Account</h2>

          <p>
            Set up your administrator credentials to manage
            your RoadFix platform.
          </p>
        </div>

        {message && (
          <div style={styles.success}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div style={styles.field}>
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div style={styles.field}>
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label>Password</label>

            <div style={styles.passwordBox}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showButton}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div style={styles.field}>
            <label>One-Time Setup Key</label>

            <div style={styles.passwordBox}>
              <input
                type={showKey ? "text" : "password"}
                name="setup_key"
                value={form.setup_key}
                onChange={handleChange}
                placeholder="Enter your secure setup key"
                required
              />

              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={styles.showButton}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>

            <small>
              This key is required to create the first administrator.
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.submit}
          >
            {loading ? "Creating Account..." : "Create Admin Account →"}
          </button>

        </form>

        <button
          onClick={() => navigate("/login/admin")}
          style={styles.back}
        >
          ← Back to Admin Login
        </button>

        <div style={styles.footer}>
          <span>🔒 Secure Administrator Registration</span>
          <p>© 2026 ROADFIX. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #101827, #1e293b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "35px 20px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "490px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "38px",
    boxSizing: "border-box",
    boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginBottom: "35px",
  },

  logoIcon: {
    width: "48px",
    height: "48px",
    background: "#dc2626",
    color: "white",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "bold",
  },

  logoText: {
    color: "#111827",
  },

  heading: {
    marginBottom: "27px",
  },

  tag: {
    color: "#dc2626",
    fontSize: "11px",
    fontWeight: "bold",
    letterSpacing: "2px",
  },

  headingTitle: {
    color: "#111827",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginBottom: "20px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#374151",
  },

  input: {
    width: "100%",
    height: "49px",
    padding: "0 14px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    background: "#f9fafb",
    color: "#111827",
  },

  passwordBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    background: "#f9fafb",
    overflow: "hidden",
  },

  showButton: {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    padding: "12px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  submit: {
    width: "100%",
    height: "52px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },

  back: {
    width: "100%",
    padding: "15px",
    border: "none",
    background: "transparent",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "bold",
  },

  success: {
    padding: "12px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    marginBottom: "18px",
  },

  error: {
    padding: "12px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    marginBottom: "18px",
  },

  footer: {
    textAlign: "center",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
    marginTop: "15px",
    color: "#64748b",
    fontSize: "11px",
  },
};