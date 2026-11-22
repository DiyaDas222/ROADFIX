import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        {
          email: email.trim().toLowerCase(),
        }
      );

      setMessage(
        response.data.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        {/* Logo */}
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoIcon}>R</div>

          <div>
            <div style={styles.logoText}>
              RoadFix
            </div>

            <div style={styles.logoSubtext}>
              Roadside Assistance
            </div>
          </div>
        </Link>


        {/* Heading */}
        <div style={styles.headingSection}>

          <div style={styles.lockIcon}>
            🔐
          </div>

          <h1 style={styles.heading}>
            Forgot your password?
          </h1>

          <p style={styles.description}>
            Enter the email address associated with
            your RoadFix account and we'll send you
            a link to reset your password.
          </p>

        </div>


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          <label style={styles.label}>
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            autoComplete="email"
            disabled={loading}
            style={styles.input}
          />


          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}


          {message && (
            <div style={styles.success}>
              {message}
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

        </form>


        {/* Back to login */}
        <div style={styles.backSection}>

          <Link
            to="/login/customer"
            style={styles.backLink}
          >
            ← Back to Customer Login
          </Link>

        </div>

      </div>

    </div>
  );
}


const styles = {

  page: {
    minHeight: "100vh",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    padding: "30px 20px",

    background:
      "radial-gradient(circle at 20% 20%, rgba(220,38,38,0.12), transparent 30%), #0b0b0d",

    color: "#ffffff",

    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },


  card: {
    width: "100%",

    maxWidth: "450px",

    padding: "42px",

    background: "#141416",

    border: "1px solid #252527",

    borderRadius: "22px",

    boxShadow:
      "0 25px 70px rgba(0,0,0,0.45)",
  },


  logoLink: {
    display: "flex",

    alignItems: "center",

    gap: "12px",

    textDecoration: "none",

    color: "#ffffff",

    marginBottom: "45px",
  },


  logoIcon: {
    width: "42px",

    height: "42px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background: "#dc2626",

    borderRadius: "12px",

    fontSize: "21px",

    fontWeight: "800",
  },


  logoText: {
    fontSize: "22px",

    fontWeight: "800",
  },


  logoSubtext: {
    fontSize: "10px",

    color: "#777",

    marginTop: "2px",
  },


  headingSection: {
    textAlign: "center",

    marginBottom: "32px",
  },


  lockIcon: {
    width: "58px",

    height: "58px",

    margin: "0 auto 20px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    borderRadius: "17px",

    background:
      "rgba(220,38,38,0.12)",

    fontSize: "25px",
  },


  heading: {
    margin: "0 0 12px",

    fontSize: "28px",

    fontWeight: "750",

    letterSpacing: "-0.7px",
  },


  description: {
    margin: 0,

    color: "#929292",

    fontSize: "14px",

    lineHeight: "1.7",
  },


  form: {
    display: "flex",

    flexDirection: "column",
  },


  label: {
    marginBottom: "8px",

    fontSize: "13px",

    fontWeight: "600",

    color: "#dddddd",
  },


  input: {
    width: "100%",

    boxSizing: "border-box",

    padding: "14px 15px",

    borderRadius: "11px",

    border: "1px solid #303034",

    background: "#0d0d0f",

    color: "#ffffff",

    fontSize: "14px",

    outline: "none",

    marginBottom: "14px",
  },


  error: {
    padding: "11px 13px",

    marginBottom: "14px",

    borderRadius: "9px",

    background:
      "rgba(220,38,38,0.1)",

    border:
      "1px solid rgba(220,38,38,0.25)",

    color: "#f87171",

    fontSize: "12px",

    lineHeight: "1.5",
  },


  success: {
    padding: "11px 13px",

    marginBottom: "14px",

    borderRadius: "9px",

    background:
      "rgba(34,197,94,0.1)",

    border:
      "1px solid rgba(34,197,94,0.25)",

    color: "#86efac",

    fontSize: "12px",

    lineHeight: "1.5",
  },


  button: {
    width: "100%",

    padding: "14px",

    border: "none",

    borderRadius: "11px",

    background: "#dc2626",

    color: "#ffffff",

    fontSize: "14px",

    fontWeight: "700",

    transition: "all 0.2s ease",
  },


  backSection: {
    marginTop: "28px",

    textAlign: "center",
  },


  backLink: {
    color: "#f87171",

    textDecoration: "none",

    fontSize: "13px",

    fontWeight: "600",
  },

};


export default ForgotPassword;