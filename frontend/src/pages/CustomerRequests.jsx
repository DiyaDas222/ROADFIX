import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function CustomerRequests() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("roadfix_access_token");

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/api/workflow/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setItems(response.data.requests || []);
      setError("");

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

  const statusLabel = (status) =>
    (status || "pending").replaceAll("_", " ").toUpperCase();

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <h2>RoadFix<span>.</span></h2>

        <button
          style={styles.button}
          onClick={() => navigate("/customer/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <main style={styles.main}>
        <p style={styles.eyebrow}>CUSTOMER PORTAL</p>

        <h1>My Service Requests</h1>

        <p style={styles.subtitle}>
          Track your roadside assistance requests and assigned mechanic.
        </p>

        <div style={styles.actions}>
          <button
            style={styles.primary}
            onClick={() => navigate("/customer/service-request")}
          >
            + New Request
          </button>

          <button
            style={styles.button}
            onClick={loadRequests}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && <p>Loading requests...</p>}

        {error && <p style={styles.error}>{error}</p>}

        {!loading && items.length === 0 && (
          <div style={styles.empty}>
            <h2>No Service Requests</h2>
            <p>Create a request when you need roadside assistance.</p>
          </div>
        )}

        <div style={styles.grid}>
          {items.map((item) => (
            <article key={item.id} style={styles.card}>

              <div style={styles.cardTop}>
                <span style={styles.requestId}>
                  REQUEST #{item.id}
                </span>

                <span style={styles.status}>
                  {statusLabel(item.status)}
                </span>
              </div>

              <h2>{item.problem_type}</h2>

              <p style={styles.description}>
                {item.description}
              </p>

              <div style={styles.details}>
                <p>🚘 Vehicle: {item.vehicle_type}</p>
                <p>🔢 Registration: {item.vehicle_number}</p>
                <p>👨‍🔧 Mechanic: {item.mechanic_name || "Waiting for mechanic"}</p>
                <p>📞 Contact: {item.mechanic_phone || "Not assigned yet"}</p>
              </div>

              <div style={styles.progress}>
                <div style={{
                  ...styles.progressBar,
                  width:
                    item.status === "completed" ? "100%" :
                    item.status === "in_progress" ? "75%" :
                    item.status === "arrived" ? "60%" :
                    item.status === "on_the_way" ? "45%" :
                    item.status === "accepted" ? "25%" : "8%"
                }} />
              </div>

              <p style={styles.statusText}>
                Current status: {statusLabel(item.status)}
              </p>

              {item.mechanic_id && (
                <button
                  style={styles.track}
                  onClick={() =>
                    navigate(`/live-tracking?requestId=${item.id}`)
                  }
                >
                  📍 Track Mechanic
                </button>
              )}

              {item.latitude != null && item.longitude != null && (
                <a
                  style={styles.location}
                  href={`https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=16/${item.latitude}/${item.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Service Location →
                </a>
              )}

            </article>
          ))}
        </div>
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
    padding: "18px 6%",
    background: "#111114",
    borderBottom: "1px solid #292929",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  main: {
    maxWidth: 1050,
    margin: "auto",
    padding: "40px 22px"
  },
  eyebrow: {
    color: "#ef4444",
    fontSize: 11,
    letterSpacing: 2
  },
  subtitle: {
    color: "#888"
  },
  actions: {
    display: "flex",
    gap: 12,
    margin: "25px 0"
  },
  button: {
    background: "#25252b",
    color: "#fff",
    border: "1px solid #444",
    padding: 12,
    borderRadius: 8,
    cursor: "pointer"
  },
  primary: {
    background: "#dc2626",
    color: "#fff",
    border: 0,
    padding: 12,
    borderRadius: 8,
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20
  },
  card: {
    background: "#17171b",
    border: "1px solid #303036",
    borderRadius: 15,
    padding: 22
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10
  },
  requestId: {
    color: "#888",
    fontSize: 11
  },
  status: {
    color: "#4ade80",
    fontSize: 10,
    fontWeight: "bold"
  },
  description: {
    color: "#aaa",
    fontSize: 13,
    lineHeight: 1.6
  },
  details: {
    color: "#bbb",
    fontSize: 12,
    lineHeight: 1.8
  },
  progress: {
    height: 6,
    background: "#303036",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 20
  },
  progressBar: {
    height: "100%",
    background: "#dc2626",
    borderRadius: 10,
    transition: "width .3s"
  },
  statusText: {
    color: "#aaa",
    fontSize: 11
  },
  track: {
    width: "100%",
    background: "#dc2626",
    color: "#fff",
    border: 0,
    padding: 12,
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 12
  },
  location: {
    display: "inline-block",
    color: "#f87171",
    marginTop: 15,
    fontSize: 12
  },
  empty: {
    background: "#17171b",
    padding: 35,
    textAlign: "center",
    borderRadius: 14
  },
  error: {
    color: "#f87171"
  }
};