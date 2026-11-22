import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function MechanicRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(null);

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
        `${API}/api/workflow/requests`,
        { headers }
      );

      setRequests(response.data.requests || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const acceptRequest = async (id) => {
    try {
      setProcessing(id);
      setError("");
      setMessage("");

      const response = await axios.post(
        `${API}/api/workflow/requests/${id}/accept`,
        {},
        { headers }
      );

      setMessage(response.data.message || "Request accepted!");
      await loadRequests();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to accept request."
      );
    } finally {
      setProcessing(null);
    }
  };

  const rejectRequest = async (id) => {
    try {
      setProcessing(id);
      setError("");
      setMessage("");

      const response = await axios.post(
        `${API}/api/workflow/requests/${id}/reject`,
        {},
        { headers }
      );

      setMessage(response.data.message || "Request skipped.");
      await loadRequests();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to skip request."
      );
    } finally {
      setProcessing(null);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setProcessing(id);
      setError("");
      setMessage("");

      const response = await axios.patch(
        `${API}/api/workflow/requests/${id}/status`,
        { status },
        { headers }
      );

      setMessage(response.data.message || "Status updated!");
      await loadRequests();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update status."
      );
    } finally {
      setProcessing(null);
    }
  };

  const openTracking = (id) => {
    navigate(`/live-tracking?requestId=${id}`);
  };

  const statusLabel = (status) =>
    (status || "pending").replaceAll("_", " ").toUpperCase();

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <h2>RoadFix<span>.</span></h2>

        <button
          style={styles.back}
          onClick={() => navigate("/mechanic/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <main style={styles.main}>

        <p style={styles.eyebrow}>MECHANIC PORTAL</p>
        <h1>Service Requests</h1>

        <p style={styles.subtitle}>
          Accept customer requests and manage your active services.
        </p>

        <button style={styles.refresh} onClick={loadRequests}>
          ↻ Refresh Requests
        </button>

        {message && (
          <div style={styles.success}>{message}</div>
        )}

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {loading && <p>Loading requests...</p>}

        {!loading && requests.length === 0 && (
          <div style={styles.empty}>
            <h2>No Requests Available</h2>
            <p>New customer requests will appear here.</p>
          </div>
        )}

        <div style={styles.grid}>
          {requests.map((item) => {

            const isMine =
              String(item.mechanic_id) === String(user.id);

            const isPending =
              item.status === "pending" &&
              !item.mechanic_id;

            return (
              <article key={item.id} style={styles.card}>

                <div style={styles.cardTop}>
                  <span style={styles.requestId}>
                    REQUEST #{item.id}
                  </span>

                  <span style={styles.badge}>
                    {statusLabel(item.status)}
                  </span>
                </div>

                <h2>{item.problem_type}</h2>

                <div style={styles.info}>
                  <p>👤 Customer: {item.customer_name || "Customer"}</p>
                  <p>📞 Phone: {item.customer_phone || "Unavailable"}</p>
                  <p>🚘 Vehicle: {item.vehicle_type}</p>
                  <p>🔢 Registration: {item.vehicle_number}</p>
                  <p>📝 Problem: {item.description}</p>
                </div>

                {item.latitude != null && item.longitude != null && (
                  <a
                    style={styles.mapLink}
                    href={`https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=16/${item.latitude}/${item.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Customer Location →
                  </a>
                )}

                {isPending && (
                  <div style={styles.actions}>
                    <button
                      style={styles.accept}
                      disabled={processing === item.id}
                      onClick={() => acceptRequest(item.id)}
                    >
                      Accept Request
                    </button>

                    <button
                      style={styles.reject}
                      disabled={processing === item.id}
                      onClick={() => rejectRequest(item.id)}
                    >
                      Skip
                    </button>
                  </div>
                )}

                {isMine && item.status !== "completed" &&
                  item.status !== "cancelled" && (
                    <div style={styles.statusSection}>
                      <h4>Update Service Status</h4>

                      {item.status === "accepted" && (
                        <button
                          style={styles.statusButton}
                          disabled={processing === item.id}
                          onClick={() => updateStatus(item.id, "on_the_way")}
                        >
                          On The Way
                        </button>
                      )}

                      {item.status === "on_the_way" && (
                        <button
                          style={styles.statusButton}
                          disabled={processing === item.id}
                          onClick={() => updateStatus(item.id, "arrived")}
                        >
                          Arrived
                        </button>
                      )}

                      {item.status === "arrived" && (
                        <button
                          style={styles.statusButton}
                          disabled={processing === item.id}
                          onClick={() => updateStatus(item.id, "in_progress")}
                        >
                          Start Work
                        </button>
                      )}

                      {item.status === "in_progress" && (
                        <button
                          style={styles.complete}
                          disabled={processing === item.id}
                          onClick={() => updateStatus(item.id, "completed")}
                        >
                          Complete Service
                        </button>
                      )}

                      <button
                        style={styles.track}
                        onClick={() => openTracking(item.id)}
                      >
                        📍 Open Live Tracking
                      </button>
                    </div>
                  )}

                {isMine && item.status === "completed" && (
                  <p style={styles.completed}>
                    ✓ Service Completed
                  </p>
                )}

              </article>
            );
          })}
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
  back: {
    background: "#24242a",
    color: "#fff",
    border: "1px solid #444",
    padding: 11,
    borderRadius: 8,
    cursor: "pointer"
  },
  main: {
    maxWidth: 1100,
    margin: "auto",
    padding: "40px 22px"
  },
  eyebrow: {
    color: "#ef4444",
    letterSpacing: 2,
    fontSize: 11
  },
  subtitle: {
    color: "#888"
  },
  refresh: {
    padding: 12,
    background: "#24242a",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 8,
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20,
    marginTop: 25
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
  badge: {
    color: "#f87171",
    fontSize: 10,
    fontWeight: "bold"
  },
  info: {
    color: "#bbb",
    fontSize: 13,
    lineHeight: 1.8
  },
  mapLink: {
    color: "#f87171",
    display: "inline-block",
    marginTop: 10
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 20
  },
  accept: {
    flex: 1,
    background: "#16a34a",
    color: "#fff",
    border: 0,
    padding: 12,
    borderRadius: 8,
    cursor: "pointer"
  },
  reject: {
    background: "#29292f",
    color: "#fff",
    border: 0,
    padding: 12,
    borderRadius: 8,
    cursor: "pointer"
  },
  statusSection: {
    borderTop: "1px solid #333",
    marginTop: 20,
    paddingTop: 15
  },
  statusButton: {
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: 7,
    padding: 11,
    margin: "5px",
    cursor: "pointer"
  },
  complete: {
    background: "#16a34a",
    color: "#fff",
    border: 0,
    borderRadius: 7,
    padding: 11,
    cursor: "pointer"
  },
  track: {
    display: "block",
    width: "100%",
    marginTop: 12,
    padding: 12,
    background: "#dc2626",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    cursor: "pointer"
  },
  completed: {
    color: "#4ade80",
    fontWeight: "bold"
  },
  empty: {
    padding: 40,
    marginTop: 25,
    textAlign: "center",
    background: "#17171b",
    borderRadius: 14
  },
  success: {
    padding: 12,
    marginTop: 15,
    background: "#14532d",
    color: "#bbf7d0",
    borderRadius: 8
  },
  error: {
    padding: 12,
    marginTop: 15,
    background: "#450a0a",
    color: "#fecaca",
    borderRadius: 8
  }
};