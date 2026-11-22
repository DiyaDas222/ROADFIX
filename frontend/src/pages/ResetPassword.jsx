import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing reset link.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset password."
        );
      }

      setStatus("success");
      setMessage(
        "Password reset successfully. You can now log in."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">

        <div className="reset-password-brand">
          ROADFIX
        </div>

        <h1>Reset your password</h1>

        <p>
          Create a new password for your RoadFix account.
        </p>

        {status && (
          <div className={`reset-message ${status}`}>
            {message}
          </div>
        )}

        {status !== "success" && (
          <form onSubmit={handleSubmit}>

            <label htmlFor="password">
              New password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={8}
            />

            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              minLength={8}
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>
        )}

        {status === "success" && (
          <Link
            to="/"
            className="reset-login-link"
          >
            Continue to Login
          </Link>
        )}

      </section>
    </main>
  );
}