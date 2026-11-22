import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MechanicAvailability from "../components/MechanicAvailability";

const API = "http://127.0.0.1:5000/api";

function MechanicDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("roadfix_access_token");
  const user = JSON.parse(
    localStorage.getItem("roadfix_user") || "{}"
  );

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/service-requests/`,
        { headers }
      );

      const data = response.data.service_requests || [];
      setRequests(data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load service requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("roadfix_access_token");
    localStorage.removeItem("roadfix_user");
    navigate("/");
  };

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <div>
          <h2 style={styles.logo}>RoadFix<span>.</span></h2>
          <p style={styles.headerSub}>MECHANIC PORTAL</p>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.name}>
            Welcome, {user.name || "Mechanic"}
          </span>

          <button
            style={styles.logout}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>

        <div style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>MECHANIC DASHBOARD</p>
            <h1>Manage Your Services<span>.</span></h1>
            <p style={styles.subtitle}>
              Manage your availability and roadside assistance requests.
            </p>
          </div>

          <button
            style={styles.refresh}
            onClick={loadRequests}
          >
            ↻ Refresh
          </button>
        </div>

        <MechanicAvailability />

        <section style={styles.stats}>
          <div style={styles.statCard}>
            <p>TOTAL REQUESTS</p>
            <h2>{requests.length}</h2>
          </div>

          <div style={styles.statCard}>
            <p>PENDING REQUESTS</p>
            <h2>
              {requests.filter(
                item => item.status === "pending"
              ).length}
            </h2>
          </div>

          <div style={styles.statCard}>
            <p>COMPLETED REQUESTS</p>
            <h2>
              {requests.filter(
                item => item.status === "completed"
              ).length}
            </h2>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>Service Requests</h2>

            <button
              style={styles.viewButton}
              onClick={() => navigate("/mechanic/requests")}
            >
              View All →
            </button>
          </div>

          {loading && <p>Loading requests...</p>}

          {error && (
            <p style={{ color: "#f87171" }}>{error}</p>
          )}

          {!loading && requests.length === 0 && (
            <div style={styles.empty}>
              <div style={{ fontSize: 42 }}>🔧</div>
              <h3>No Requests Available</h3>
              <p>
                New service requests will appear here.
              </p>
            </div>
          )}

          <div style={styles.grid}>
            {requests.slice(0, 6).map(request => (
              <article
                key={request.id}
                style={styles.requestCard}
              >
                <div style={styles.requestTop}>
                  <span style={styles.requestId}>
                    REQUEST #{request.id}
                  </span>

                  <span style={styles.status}>
                    {request.status}
                  </span>
                </div>

                <h3>
                  {request.problem_type || request.service_type}
                </h3>

                <p style={styles.description}>
                  {request.description}
                </p>

                <div style={styles.details}>
                  <p>
                    🚘 {request.vehicle_type}
                  </p>

                  <p>
                    🔢 {request.vehicle_number}
                  </p>
                </div>

                <button
                  style={styles.detailsButton}
                  onClick={() =>
                    navigate("/mechanic/requests")
                  }
                >
                  Open Request →
                </button>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.trackingCard}>
          <div>
            <h2>Live Location Tracking</h2>
            <p>
              Share your location during an active service request.
            </p>
          </div>

          <button
            style={styles.trackButton}
            onClick={() =>
              navigate("/live-tracking")
            }
          >
            Open Tracking →
          </button>
        </section>

      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#09090b",
    color: "#fff",
    fontFamily: "Arial, sans-serif"
  },

  header: {
    padding: "20px 6%",
    background: "#111114",
    borderBottom: "1px solid #292929",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 15
  },

  logo: {
    margin: 0,
    fontSize: 25,
    fontWeight: 900
  },

  headerSub: {
    color: "#888",
    fontSize: 9,
    letterSpacing: 2,
    margin: "5px 0 0"
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 15
  },

  name: {
    color: "#ccc",
    fontSize: 13
  },

  logout: {
    background: "#dc2626",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer"
  },

  main: {
    maxWidth: 1150,
    margin: "auto",
    padding: "45px 25px"
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 30
  },

  eyebrow: {
    color: "#ef4444",
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: 800
  },

  subtitle: {
    color: "#888",
    fontSize: 14
  },

  refresh: {
    background: "#24242a",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 8,
    padding: "12px 18px",
    cursor: "pointer"
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 18,
    margin: "30px 0"
  },

  statCard: {
    background: "#17171b",
    border: "1px solid #303036",
    padding: 22,
    borderRadius: 13
  },

  section: {
    marginTop: 40
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  viewButton: {
    background: "transparent",
    color: "#f87171",
    border: 0,
    cursor: "pointer"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: 18,
    marginTop: 20
  },

  requestCard: {
    background: "#17171b",
    border: "1px solid #303036",
    borderRadius: 13,
    padding: 20
  },

  requestTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10
  },

  requestId: {
    color: "#999",
    fontSize: 10
  },

  status: {
    color: "#4ade80",
    fontSize: 11,
    textTransform: "uppercase"
  },

  description: {
    color: "#aaa",
    fontSize: 13,
    lineHeight: 1.6
  },

  details: {
    color: "#bbb",
    fontSize: 12
  },

  detailsButton: {
    width: "100%",
    padding: 12,
    marginTop: 12,
    background: "#dc2626",
    border: 0,
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer"
  },

  empty: {
    textAlign: "center",
    background: "#17171b",
    borderRadius: 13,
    padding: 45,
    marginTop: 20,
    color: "#aaa"
  },

  trackingCard: {
    marginTop: 35,
    padding: 25,
    background: "#17171b",
    border: "1px solid #303036",
    borderRadius: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 15
  },

  trackButton: {
    background: "#dc2626",
    color: "#fff",
    border: 0,
    padding: "13px 20px",
    borderRadius: 8,
    cursor: "pointer"
  }
};

export default MechanicDashboard;