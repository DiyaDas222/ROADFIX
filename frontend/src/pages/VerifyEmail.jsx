import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Please wait while we verify your email."
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("This verification link is invalid.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `https://roadfix-backend-10zl.onrender.com/api/auth/verify-email?token=${encodeURIComponent(
            token
          )}`
        );

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            data.message || "Your email has been verified successfully."
          );
        } else {
          setStatus("error");
          setMessage(
            data.message || "This verification link is invalid or expired."
          );
        }
      } catch (error) {
        console.error("Email verification error:", error);

        setStatus("error");
        setMessage(
          "Unable to connect to RoadFix. Please make sure the backend is running."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="verification-page">
      <div className="verification-card">

        <div className="verification-logo">
          RoadFix
        </div>

        {status === "loading" && (
          <>
            <div className="verification-icon loading-icon">
              ...
            </div>

            <h1>Verifying your email</h1>

            <p>{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="verification-icon success-icon">
              ✓
            </div>

            <h1>Email verified!</h1>

            <p>{message}</p>

            <Link
              to="/login/customer"
              className="verification-button"
            >
              Continue to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="verification-icon error-icon">
              !
            </div>

            <h1>Verification failed</h1>

            <p>{message}</p>

            <Link
              to="/"
              className="verification-button"
            >
              Back to RoadFix
            </Link>
          </>
        )}

      </div>
    </div>
  );
}