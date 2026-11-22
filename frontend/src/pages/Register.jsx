import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Phone,
  UserRound,
  Wrench,
  CarFront,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

const roleConfig = {
  customer: {
    title: "Start your journey.",
    subtitle:
      "Create your RoadFix account and get help whenever your vehicle needs it.",
    label: "Customer",
    description:
      "Find verified mechanics, request roadside assistance and track your service.",
    icon: CarFront,
  },

  mechanic: {
    title: "Grow your roadside business.",
    subtitle:
      "Join RoadFix and connect with customers who need reliable assistance.",
    label: "Mechanic",
    description:
      "Receive service requests, manage jobs and build your verified profile.",
    icon: Wrench,
  },
};

function Register() {
  const { role } = useParams();
  const navigate = useNavigate();

  const config = roleConfig[role] || roleConfig.customer;
  const RoleIcon = config.icon;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/auth/register`,
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role,
        }
      );

      // Registration succeeded
      setSuccess(true);

    } catch (err) {

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Unable to connect to RoadFix. Please make sure the backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SUCCESS SCREEN
  ====================================================== */

  if (success) {
    return (
      <div className="auth-page">

        <section className="auth-visual">

          <div className="auth-visual-top">

            <button
              className="back-button"
              type="button"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="auth-brand">

              <div className="auth-brand-mark">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span>ROADFIX</span>

            </div>

          </div>


          <div className="auth-visual-content">

            <p className="auth-eyebrow">
              ACCOUNT READY
            </p>

            <h1>
              You're
              <br />
              on the road.
            </h1>

            <p className="auth-visual-description">
              Your RoadFix account has been created.
              You can now access your account and
              start using RoadFix.
            </p>

            <div className="auth-role-display">

              <div className="auth-role-icon">
                <CheckCircle2
                  size={24}
                  strokeWidth={2}
                />
              </div>

              <div>

                <span>
                  ACCOUNT TYPE
                </span>

                <strong>
                  {config.label}
                </strong>

              </div>

            </div>

          </div>


          <div className="auth-visual-footer">

            <span>02</span>

            <div className="auth-progress">
              <div></div>
            </div>

            <span>ROADFIX</span>

          </div>

        </section>


        <section className="auth-panel">

          <div className="auth-form-container">

            <div className="mobile-brand">

              <div className="auth-brand-mark">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span>ROADFIX</span>

            </div>


            <div className="success-screen">

              <div className="success-icon">
                <CheckCircle2 size={34} />
              </div>

              <p className="auth-form-label">
                REGISTRATION COMPLETE
              </p>

              <h2>
                Account created
              </h2>

              <p className="success-description">
                Your RoadFix {config.label.toLowerCase()}{" "}
                account has been created successfully.
                Your credentials are ready to use.
              </p>


              <button
                className="auth-submit"
                type="button"
                onClick={() => navigate(`/login/${role}`)}
              >
                Continue to sign in
                <ArrowRight size={19} />
              </button>


              <button
                className="switch-role"
                type="button"
                onClick={() => navigate("/")}
              >
                <UserRound size={16} />
                Choose another account type
              </button>

            </div>

          </div>

        </section>

      </div>
    );
  }


  /* =====================================================
     REGISTRATION FORM
  ====================================================== */

  return (
    <div className="auth-page">

      <section className="auth-visual">

        <div className="auth-visual-top">

          <button
            className="back-button"
            type="button"
            onClick={() => navigate(`/login/${role}`)}
          >
            <ArrowLeft size={18} />
            Back to login
          </button>

          <div className="auth-brand">

            <div className="auth-brand-mark">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <span>ROADFIX</span>

          </div>

        </div>


        <div className="auth-visual-content">

          <p className="auth-eyebrow">
            {config.label.toUpperCase()} REGISTRATION
          </p>

          <h1>
            {config.title}
          </h1>

          <p className="auth-visual-description">
            {config.subtitle}
          </p>


          <div className="auth-role-display">

            <div className="auth-role-icon">
              <RoleIcon
                size={24}
                strokeWidth={2}
              />
            </div>

            <div>

              <span>
                CREATING ACCOUNT AS
              </span>

              <strong>
                {config.label}
              </strong>

            </div>

          </div>

        </div>


        <div className="auth-visual-footer">

          <span>01</span>

          <div className="auth-progress">
            <div></div>
          </div>

          <span>ROADFIX</span>

        </div>

      </section>


      <section className="auth-panel">

        <div className="auth-form-container">

          <div className="mobile-brand">

            <div className="auth-brand-mark">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <span>ROADFIX</span>

          </div>


          <div className="auth-form-header">

            <div className="auth-small-icon">
              <RoleIcon size={21} />
            </div>

            <p className="auth-form-label">
              {config.label} account
            </p>

            <h2>
              Create account
            </h2>

            <p>
              {config.description}
            </p>

          </div>


          {error && (

            <div className="auth-error">

              <AlertCircle size={18} />

              <span>
                {error}
              </span>

            </div>

          )}


          <form
            className="auth-form register-form"
            onSubmit={handleRegister}
          >

            <div className="form-field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="input-wrapper">

                <UserRound size={18} />

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  autoComplete="name"
                />

              </div>

            </div>


            <div className="form-field">

              <label htmlFor="register-email">
                Email address
              </label>

              <div className="input-wrapper">

                <Mail size={18} />

                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                />

              </div>

            </div>


            <div className="form-field">

              <label htmlFor="phone">
                Phone number
              </label>

              <div className="input-wrapper">

                <Phone size={18} />

                <span className="phone-prefix">
                  +91
                </span>

                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength="10"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(event) => {

                    const value =
                      event.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setPhone(value);
                  }}
                  autoComplete="tel"
                />

              </div>

            </div>


            <div className="form-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            <div className="form-field">

              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <div className="input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >

              {loading ? (

                <>
                  <Loader2
                    size={19}
                    className="spin"
                  />

                  Creating account...
                </>

              ) : (

                <>
                  Create account
                  <ArrowRight size={19} />
                </>

              )}

            </button>

          </form>


          <div className="auth-register">

            <span>
              Already have a RoadFix account?
            </span>

            <Link
              to={`/login/${role}`}
            >
              Sign in
            </Link>

          </div>


          <div className="auth-security">

            <LockKeyhole size={15} />

            <span>
              Your password is securely hashed before
              it is stored.
            </span>

          </div>


          <button
            className="switch-role"
            type="button"
            onClick={() => navigate("/")}
          >
            <UserRound size={16} />

            Choose another account type

          </button>

        </div>

      </section>

    </div>
  );
}

export default Register;