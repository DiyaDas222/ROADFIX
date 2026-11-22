import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ServiceRequest.css";

const API_URL = "http://127.0.0.1:5000";

function ServiceRequest() {
  const navigate = useNavigate();

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [problemType, setProblemType] = useState("");
  const [description, setDescription] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [problemImage, setProblemImage] = useState(null);

  const [locationStatus, setLocationStatus] = useState(
    "Location not detected"
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // SUCCESS SCREEN DATA
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);

  // DETECT LOCATION
  const detectLocation = () => {
    setLocationStatus("Detecting your location...");
    setError("");

    if (!navigator.geolocation) {
      setLocationStatus(
        "Location is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());

        setLocationStatus("Location detected successfully.");
      },
      (locationError) => {
        console.error(locationError);

        setLocationStatus(
          "Unable to detect location. Please allow location access."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // DETECT LOCATION WHEN PAGE OPENS
  useEffect(() => {
    detectLocation();
  }, []);

  // SUBMIT SERVICE REQUEST
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem(
      "roadfix_access_token"
    );

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );

      setTimeout(() => {
        navigate("/login/customer");
      }, 1500);

      return;
    }

    // VALIDATION
    if (!vehicleType) {
      setError("Please select your vehicle type.");
      return;
    }

    if (!vehicleNumber.trim()) {
      setError("Please enter your vehicle number.");
      return;
    }

    if (!problemType) {
      setError("Please select the problem type.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the problem.");
      return;
    }

    if (!latitude || !longitude) {
      setError(
        "Your location is required. Please detect your location first."
      );
      return;
    }

    // CREATE FORM DATA
    const formData = new FormData();

    formData.append("vehicle_type", vehicleType);
    formData.append("vehicle_number", vehicleNumber.trim());
    formData.append("problem_type", problemType);
    formData.append("description", description.trim());
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    if (problemImage) {
      formData.append("problem_image", problemImage);
    }

    // SEND REQUEST TO BACKEND
    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/service-requests/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ONLY SHOW SUCCESS AFTER SERVER CONFIRMS CREATION
      setRequestId(
        response.data?.service_request?.id || null
      );

      setRequestSubmitted(true);

    } catch (requestError) {
      console.error(
        "SERVICE REQUEST ERROR:",
        requestError
      );

      if (requestError.response?.data) {
        setError(
          requestError.response.data.message ||
          "Unable to create service request."
        );
      } else {
        setError(
          "Unable to connect to RoadFix server. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ================= SUCCESS SCREEN =================

  if (requestSubmitted) {
    return (
      <div className="service-request-page">

        <header className="service-request-header">
          <div
            className="roadfix-brand"
            onClick={() => navigate("/customer/dashboard")}
          >
            <div className="roadfix-logo">R</div>

            <div>
              <div className="roadfix-name">ROADFIX</div>

              <div className="roadfix-tagline">
                ROADSIDE ASSISTANCE
              </div>
            </div>
          </div>
        </header>

        <main className="service-request-content">

          <div style={successStyles.container}>

            <div style={successStyles.checkCircle}>
              ✓
            </div>

            <div style={successStyles.label}>
              REQUEST SUCCESSFULLY REGISTERED
            </div>

            <h1 style={successStyles.heading}>
              Thank You for Choosing RoadFix!
            </h1>

            <p style={successStyles.description}>
              Your service request has been successfully
              registered with RoadFix.
            </p>

            {requestId && (
              <div style={successStyles.requestId}>
                <span style={successStyles.requestIdLabel}>
                  YOUR REQUEST ID
                </span>

                <strong>
                  #{requestId}
                </strong>
              </div>
            )}

            <div style={successStyles.messageCard}>

              <div style={successStyles.messageIcon}>
                🚗
              </div>

              <div>
                <h3 style={successStyles.messageHeading}>
                  Help is on the way!
                </h3>

                <p style={successStyles.messageText}>
                  Our team is checking for available
                  mechanics near your location. A nearby
                  roadside professional will assist you
                  shortly.
                </p>
              </div>

            </div>

            <div style={successStyles.info}>
              <div style={successStyles.infoIcon}>
                ℹ
              </div>

              <p>
                You can check your service request status
                anytime from your Customer Dashboard.
                Please keep your phone accessible for
                further communication.
              </p>
            </div>

            <button
              style={successStyles.dashboardButton}
              onClick={() =>
                navigate("/customer/dashboard")
              }
            >
              Go to Customer Dashboard →
            </button>

            <p style={successStyles.footer}>
              ROADFIX — Reliable Assistance, Wherever
              the Road Takes You.
            </p>

          </div>

        </main>
      </div>
    );
  }

  // ================= REQUEST FORM =================

  return (
    <div className="service-request-page">

      {/* HEADER */}
      <header className="service-request-header">

        <div
          className="roadfix-brand"
          onClick={() =>
            navigate("/customer/dashboard")
          }
        >
          <div className="roadfix-logo">R</div>

          <div>
            <div className="roadfix-name">
              ROADFIX
            </div>

            <div className="roadfix-tagline">
              ROADSIDE ASSISTANCE
            </div>
          </div>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/customer/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </header>

      {/* MAIN CONTENT */}
      <main className="service-request-content">

        <div className="service-request-heading">

          <div className="heading-label">
            NEED HELP ON THE ROAD?
          </div>

          <h1>
            Request roadside assistance.
          </h1>

          <p>
            Tell us what happened and we'll connect
            you with a nearby roadside professional.
          </p>

        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="error-message">
            <span>!</span>

            <div>{error}</div>
          </div>
        )}

        {/* REQUEST FORM */}
        <form
          className="service-request-form"
          onSubmit={handleSubmit}
        >

          {/* VEHICLE INFORMATION */}
          <section className="form-section">

            <div className="section-number">
              01
            </div>

            <div className="section-content">

              <div className="section-heading">
                <h2>Your vehicle</h2>

                <p>
                  Tell us which vehicle needs assistance.
                </p>
              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="vehicle-type">
                    Vehicle type
                  </label>

                  <select
                    id="vehicle-type"
                    value={vehicleType}
                    onChange={(event) =>
                      setVehicleType(event.target.value)
                    }
                  >
                    <option value="">
                      Select vehicle type
                    </option>

                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Auto">Auto</option>
                    <option value="Truck">Truck</option>
                    <option value="Bus">Bus</option>
                    <option value="Other">Other</option>
                  </select>

                </div>

                <div className="form-group">

                  <label htmlFor="vehicle-number">
                    Vehicle number
                  </label>

                  <input
                    id="vehicle-number"
                    type="text"
                    placeholder="e.g. TR01AB1234"
                    value={vehicleNumber}
                    onChange={(event) =>
                      setVehicleNumber(
                        event.target.value.toUpperCase()
                      )
                    }
                  />

                </div>

              </div>
            </div>
          </section>

          {/* PROBLEM INFORMATION */}
          <section className="form-section">

            <div className="section-number">
              02
            </div>

            <div className="section-content">

              <div className="section-heading">
                <h2>What happened?</h2>

                <p>
                  Give us a few details so we can
                  send the right professional.
                </p>
              </div>

              <div className="form-group">

                <label htmlFor="problem-type">
                  Problem type
                </label>

                <select
                  id="problem-type"
                  value={problemType}
                  onChange={(event) =>
                    setProblemType(event.target.value)
                  }
                >
                  <option value="">
                    Select the problem
                  </option>

                  <option value="Flat Tyre">
                    Flat tyre
                  </option>

                  <option value="Battery Dead">
                    Battery dead
                  </option>

                  <option value="Engine Problem">
                    Engine problem
                  </option>

                  <option value="Fuel Problem">
                    Fuel problem
                  </option>

                  <option value="Accident">
                    Accident
                  </option>

                  <option value="Vehicle Breakdown">
                    Vehicle breakdown
                  </option>

                  <option value="Electrical Problem">
                    Electrical problem
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label htmlFor="description">
                  Describe the problem
                </label>

                <textarea
                  id="description"
                  rows="5"
                  placeholder="Tell us what happened..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />

              </div>

              {/* IMAGE UPLOAD */}
              <div className="form-group">

                <label htmlFor="problem-image">
                  Add a photo
                  <span className="optional">
                    Optional
                  </span>
                </label>

                <div className="image-upload">

                  <input
                    id="problem-image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        const maxSize = 5 * 1024 * 1024;

                        if (file.size > maxSize) {
                          setError(
                            "Image must be smaller than 5 MB."
                          );

                          event.target.value = "";
                          setProblemImage(null);
                          return;
                        }

                        setError("");
                        setProblemImage(file);
                      }
                    }}
                  />

                  <div className="upload-icon">
                    ↑
                  </div>

                  <div className="upload-text">

                    <strong>
                      {problemImage
                        ? problemImage.name
                        : "Upload a photo of the problem"}
                    </strong>

                    <span>
                      PNG, JPG or WEBP · Max 5 MB
                    </span>

                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* LOCATION */}
          <section className="form-section">

            <div className="section-number">
              03
            </div>

            <div className="section-content">

              <div className="section-heading">
                <h2>Your location</h2>

                <p>
                  We'll use your current location
                  to find nearby mechanics.
                </p>
              </div>

              <div className="location-card">

                <div className="location-icon">
                  ⌖
                </div>

                <div className="location-details">

                  <strong>
                    Current location
                  </strong>

                  <span>
                    {locationStatus}
                  </span>

                  {latitude && longitude && (
                    <small>
                      {Number(latitude).toFixed(6)}
                      {" , "}
                      {Number(longitude).toFixed(6)}
                    </small>
                  )}

                </div>

                <button
                  type="button"
                  className="detect-location-button"
                  onClick={detectLocation}
                >
                  Detect again
                </button>

              </div>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="submit-area">

            <div className="submit-note">
              <span>🔒</span>

              <p>
                Your information is securely shared
                only with RoadFix professionals.
              </p>
            </div>

            <button
              type="submit"
              className="submit-request-button"
              disabled={submitting}
            >
              {submitting
                ? "Submitting request..."
                : "Request Assistance →"}
            </button>

          </div>

        </form>
      </main>
    </div>
  );
}

// SUCCESS SCREEN STYLES
const successStyles = {
  container: {
    maxWidth: "680px",
    margin: "45px auto",
    padding: "45px 35px",
    background: "#111113",
    border: "1px solid #29292d",
    borderRadius: "22px",
    textAlign: "center",
    boxSizing: "border-box",
  },

  checkCircle: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    background: "rgba(34,197,94,0.13)",
    border: "1px solid rgba(34,197,94,0.35)",
    color: "#4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "38px",
    fontWeight: "700",
    margin: "0 auto 25px",
  },

  label: {
    color: "#4ade80",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "14px",
  },

  heading: {
    color: "#ffffff",
    fontSize: "clamp(26px, 5vw, 36px)",
    fontWeight: "800",
    lineHeight: "1.2",
    margin: "0 0 15px",
  },

  description: {
    color: "#999",
    fontSize: "14px",
    lineHeight: "1.7",
    margin: "0 auto 25px",
  },

  requestId: {
    display: "inline-flex",
    flexDirection: "column",
    gap: "7px",
    background: "#1b1b1f",
    border: "1px solid #303036",
    borderRadius: "12px",
    padding: "15px 30px",
    marginBottom: "25px",
    color: "#ffffff",
    fontSize: "20px",
  },

  requestIdLabel: {
    color: "#888",
    fontSize: "9px",
    letterSpacing: "1.5px",
    fontWeight: "700",
  },

  messageCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    textAlign: "left",
    padding: "22px",
    background: "rgba(220,38,38,0.07)",
    border: "1px solid rgba(220,38,38,0.2)",
    borderRadius: "14px",
    marginBottom: "18px",
  },

  messageIcon: {
    fontSize: "27px",
    flexShrink: 0,
  },

  messageHeading: {
    color: "#ffffff",
    fontSize: "16px",
    margin: "0 0 8px",
  },

  messageText: {
    color: "#aaa",
    fontSize: "12px",
    lineHeight: "1.8",
    margin: 0,
  },

  info: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    textAlign: "left",
    margin: "20px 0 28px",
    color: "#888",
    fontSize: "11px",
    lineHeight: "1.7",
  },

  infoIcon: {
    color: "#60a5fa",
    fontSize: "17px",
    fontWeight: "800",
  },

  dashboardButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "750",
    cursor: "pointer",
  },

  footer: {
    color: "#555",
    fontSize: "9px",
    letterSpacing: "0.5px",
    marginTop: "27px",
  },
};

export default ServiceRequest;