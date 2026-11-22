import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:5000";

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [serviceRequests, setServiceRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  // FETCH CUSTOMER REQUESTS FROM BACKEND
  const fetchServiceRequests = useCallback(async () => {
    const token = localStorage.getItem("roadfix_access_token");

    if (!token) {
      setRequestsError("Your session has expired. Please login again.");
      setRequestsLoading(false);
      return;
    }

    try {
      setRequestsLoading(true);
      setRequestsError("");

      const response = await axios.get(
        `${API_URL}/api/service-requests/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const requests = response.data?.service_requests;

      setServiceRequests(
        Array.isArray(requests) ? requests : []
      );
    } catch (error) {
      console.error("CUSTOMER REQUEST FETCH ERROR:", error);

      setRequestsError(
        error.response?.data?.message ||
        "Unable to load your service requests. Please try again."
      );
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceRequests();
  }, [fetchServiceRequests]);

  // LOGOUT
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // STATUS COLORS
  const getStatusStyle = (status) => {
    const value = (status || "pending").toLowerCase();

    if (["completed", "complete"].includes(value)) {
      return {
        ...styles.statusBadge,
        background: "rgba(34,197,94,0.13)",
        color: "#4ade80",
      };
    }

    if (
      ["accepted", "in_progress", "in progress"].includes(value)
    ) {
      return {
        ...styles.statusBadge,
        background: "rgba(59,130,246,0.13)",
        color: "#60a5fa",
      };
    }

    if (
      ["rejected", "cancelled", "canceled"].includes(value)
    ) {
      return {
        ...styles.statusBadge,
        background: "rgba(239,68,68,0.13)",
        color: "#f87171",
      };
    }

    return {
      ...styles.statusBadge,
      background: "rgba(245,158,11,0.13)",
      color: "#fbbf24",
    };
  };

  // FORMAT DATE
  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString();
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>

        <div
          style={styles.logoArea}
          onClick={() => navigate("/customer/dashboard")}
        >
          <div style={styles.logoIcon}>R</div>

          <div>
            <div style={styles.logo}>ROADFIX</div>
            <div style={styles.logoSubtitle}>
              ROADSIDE ASSISTANCE
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>

          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "C"}
            </div>

            <div>
              <div style={styles.userName}>
                {user?.name || "Customer"}
              </div>

              <div style={styles.userRole}>
                Customer
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={styles.main}>

        {/* WELCOME */}
        <section style={styles.welcomeSection}>
          <div>
            <div style={styles.welcomeLabel}>
              CUSTOMER DASHBOARD
            </div>

            <h1 style={styles.heading}>
              Hello, {user?.name || "there"}.
            </h1>

            <p style={styles.description}>
              What can we help you with today?
            </p>
          </div>
        </section>

        {/* EMERGENCY CARD */}
        <section style={styles.emergencyCard}>

          <div style={styles.emergencyContent}>
            <div style={styles.emergencyIcon}>🚗</div>

            <div>
              <div style={styles.emergencyLabel}>
                NEED HELP ON THE ROAD?
              </div>

              <h2 style={styles.emergencyTitle}>
                Get roadside assistance
              </h2>

              <p style={styles.emergencyText}>
                Tell us what happened and we'll help
                connect you with a nearby roadside
                professional.
              </p>
            </div>
          </div>

          <button
            style={styles.requestButton}
            onClick={() =>
              navigate("/customer/service-request")
            }
          >
            Request Assistance →
          </button>

        </section>

        {/* QUICK ACTIONS */}
        <section style={styles.section}>

          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionLabel}>
                QUICK ACTIONS
              </div>

              <h2 style={styles.sectionTitle}>
                Manage your RoadFix services
              </h2>
            </div>
          </div>

          <div style={styles.cards}>

            {/* VEHICLES */}
            <button
              style={styles.card}
              onClick={() => navigate("/customer/vehicles")}
            >
              <div
                style={{
                  ...styles.cardIcon,
                  background: "rgba(59,130,246,0.12)",
                }}
              >
                🚘
              </div>

              <h3 style={styles.cardTitle}>
                My Vehicles
              </h3>

              <p style={styles.cardText}>
                Add and manage your vehicle information.
              </p>

              <span style={styles.cardLink}>
                Manage vehicles →
              </span>
            </button>

            {/* SERVICE REQUESTS */}
            <button
              style={styles.card}
              onClick={() =>
                navigate("/customer/service-requests")
              }
            >
              <div
                style={{
                  ...styles.cardIcon,
                  background: "rgba(245,158,11,0.12)",
                }}
              >
                🔧
              </div>

              <h3 style={styles.cardTitle}>
                Service Requests
              </h3>

              <p style={styles.cardText}>
                View your current and previous roadside
                assistance requests.
              </p>

              <span style={styles.cardLink}>
                View requests →
              </span>
            </button>

            {/* PROFILE */}
            <button
              style={styles.card}
              onClick={() => navigate("/customer/profile")}
            >
              <div
                style={{
                  ...styles.cardIcon,
                  background: "rgba(168,85,247,0.12)",
                }}
              >
                👤
              </div>

              <h3 style={styles.cardTitle}>
                My Profile
              </h3>

              <p style={styles.cardText}>
                View and update your RoadFix account
                information.
              </p>

              <span style={styles.cardLink}>
                View profile →
              </span>
            </button>

          </div>
        </section>

        {/* RECENT SERVICE REQUESTS */}
        <section style={styles.section}>

          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionLabel}>
                RECENT ACTIVITY
              </div>

              <h2 style={styles.sectionTitle}>
                Your service requests
              </h2>
            </div>

            <button
              style={styles.refreshButton}
              onClick={fetchServiceRequests}
              disabled={requestsLoading}
            >
              ↻ Refresh
            </button>
          </div>

          {/* LOADING */}
          {requestsLoading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⏳</div>

              <h3 style={styles.emptyTitle}>
                Loading your requests...
              </h3>

              <p style={styles.emptyText}>
                Please wait while we retrieve your latest
                service requests.
              </p>
            </div>
          )}

          {/* ERROR */}
          {!requestsLoading && requestsError && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⚠️</div>

              <h3 style={styles.emptyTitle}>
                Unable to load requests
              </h3>

              <p style={styles.emptyText}>
                {requestsError}
              </p>

              <button
                style={styles.secondaryButton}
                onClick={fetchServiceRequests}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!requestsLoading &&
            !requestsError &&
            serviceRequests.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>

                <h3 style={styles.emptyTitle}>
                  No service requests yet
                </h3>

                <p style={styles.emptyText}>
                  When you request roadside assistance,
                  your requests will appear here.
                </p>

                <button
                  style={styles.secondaryButton}
                  onClick={() =>
                    navigate("/customer/service-request")
                  }
                >
                  Request Assistance
                </button>
              </div>
            )}

          {/* REQUEST LIST */}
          {!requestsLoading &&
            !requestsError &&
            serviceRequests.length > 0 && (
              <div style={styles.requestList}>

                {serviceRequests
                  .slice(0, 5)
                  .map((item) => (
                    <article
                      key={item.id}
                      style={styles.requestCard}
                    >

                      <div style={styles.requestCardTop}>
                        <div>
                          <div style={styles.requestId}>
                            REQUEST #{item.id}
                          </div>

                          <h3 style={styles.requestTitle}>
                            {item.problem_type ||
                              "Roadside assistance"}
                          </h3>
                        </div>

                        <span style={getStatusStyle(item.status)}>
                          {(item.status || "pending")
                            .replace(/_/g, " ")
                            .toUpperCase()}
                        </span>
                      </div>

                      <p style={styles.requestDescription}>
                        {item.description ||
                          "No description provided."}
                      </p>

                      <div style={styles.requestMeta}>
                        <span>
                          🚘 {item.vehicle_type || "Vehicle"}
                        </span>

                        <span>
                          🔢 {item.vehicle_number ||
                            "Number not provided"}
                        </span>

                        <span>
                          🕒 {formatDate(item.created_at)}
                        </span>
                      </div>

                    </article>
                  ))}

                <div style={styles.requestListFooter}>
                  <span style={styles.requestCount}>
                    Showing {Math.min(serviceRequests.length, 5)}
                    {" "}of {serviceRequests.length} request(s)
                  </span>

                  <button
                    style={styles.secondaryButton}
                    onClick={() =>
                      navigate("/customer/service-requests")
                    }
                  >
                    View All Requests →
                  </button>
                </div>

              </div>
            )}

        </section>

      </main>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0b0d",
    color: "#ffffff",
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  header: {
    minHeight: "78px",
    boxSizing: "border-box",
    padding: "12px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #202023",
    background: "rgba(11,11,13,0.96)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    cursor: "pointer",
  },

  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
    boxShadow: "0 8px 25px rgba(220,38,38,0.2)",
  },

  logo: {
    fontSize: "19px",
    fontWeight: "800",
    letterSpacing: "0.3px",
  },

  logoSubtitle: {
    color: "#666",
    fontSize: "8px",
    letterSpacing: "1px",
    marginTop: "2px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(220,38,38,0.14)",
    border: "1px solid rgba(220,38,38,0.3)",
    color: "#f87171",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "13px",
  },

  userName: {
    fontSize: "12px",
    fontWeight: "650",
  },

  userRole: {
    marginTop: "2px",
    color: "#666",
    fontSize: "10px",
  },

  logoutButton: {
    border: "1px solid #303034",
    background: "transparent",
    color: "#aaa",
    borderRadius: "8px",
    padding: "9px 15px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },

  main: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "55px 30px 80px",
    boxSizing: "border-box",
  },

  welcomeSection: {
    marginBottom: "38px",
  },

  welcomeLabel: {
    color: "#ef4444",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  heading: {
    margin: 0,
    fontSize: "clamp(32px, 5vw, 50px)",
    lineHeight: "1.1",
    letterSpacing: "-2px",
    fontWeight: "800",
  },

  description: {
    margin: "13px 0 0",
    color: "#777",
    fontSize: "14px",
  },

  emergencyCard: {
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid rgba(220,38,38,0.28)",
    background:
      "linear-gradient(135deg, rgba(220,38,38,0.13), rgba(20,20,23,0.9))",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    marginBottom: "60px",
    flexWrap: "wrap",
  },

  emergencyContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  emergencyIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(220,38,38,0.14)",
    fontSize: "29px",
    flexShrink: 0,
  },

  emergencyLabel: {
    color: "#f87171",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.4px",
    marginBottom: "6px",
  },

  emergencyTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "750",
  },

  emergencyText: {
    margin: "8px 0 0",
    color: "#888",
    fontSize: "12px",
    lineHeight: "1.6",
    maxWidth: "550px",
  },

  requestButton: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "14px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    boxShadow: "0 10px 25px rgba(220,38,38,0.18)",
  },

  section: {
    marginBottom: "55px",
  },

  sectionHeader: {
    marginBottom: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    flexWrap: "wrap",
  },

  sectionLabel: {
    color: "#ef4444",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.4px",
    marginBottom: "7px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "750",
    letterSpacing: "-0.5px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  card: {
    border: "1px solid #242426",
    background: "#111113",
    borderRadius: "16px",
    padding: "23px",
    textAlign: "left",
    color: "#ffffff",
    cursor: "pointer",
    minHeight: "205px",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease",
  },

  cardIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    marginBottom: "19px",
  },

  cardTitle: {
    margin: "0 0 7px",
    fontSize: "16px",
    fontWeight: "700",
  },

  cardText: {
    margin: 0,
    color: "#777",
    fontSize: "11px",
    lineHeight: "1.6",
  },

  cardLink: {
    marginTop: "auto",
    paddingTop: "20px",
    color: "#f87171",
    fontSize: "10px",
    fontWeight: "700",
  },

  refreshButton: {
    border: "1px solid #39393d",
    background: "transparent",
    color: "#ddd",
    borderRadius: "9px",
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },

  requestList: {
    display: "grid",
    gap: "13px",
  },

  requestCard: {
    border: "1px solid #27272a",
    background: "#111113",
    borderRadius: "15px",
    padding: "20px",
  },

  requestCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    flexWrap: "wrap",
  },

  requestId: {
    color: "#777",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "7px",
  },

  requestTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  statusBadge: {
    display: "inline-block",
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },

  requestDescription: {
    color: "#999",
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "13px 0",
  },

  requestMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px 18px",
    color: "#777",
    fontSize: "10px",
  },

  requestListFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    paddingTop: "5px",
  },

  requestCount: {
    color: "#777",
    fontSize: "11px",
  },

  emptyState: {
    border: "1px solid #222225",
    background: "#101012",
    borderRadius: "17px",
    padding: "45px 25px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "30px",
    marginBottom: "12px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "17px",
  },

  emptyText: {
    maxWidth: "430px",
    margin: "9px auto 20px",
    color: "#777",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  secondaryButton: {
    border: "1px solid #39393d",
    background: "transparent",
    color: "#ddd",
    borderRadius: "9px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },
};

export default CustomerDashboard;