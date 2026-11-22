import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("roadfix_access_token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [overview, pending] = await Promise.all([
        axios.get(`${API}/api/workflow/admin/overview`, { headers }),
        axios.get(`${API}/api/workflow/admin/mechanics/pending`, { headers })
      ]);

      setData(overview.data);
      setMechanics(pending.data.mechanics || []);
      setError("");

    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApproval = async (id, action) => {
    try {
      setMessage("");
      setError("");

      await axios.patch(
        `${API}/api/workflow/admin/mechanics/${id}/${action}`,
        {},
        { headers }
      );

      setMessage(
        action === "approve"
          ? "Mechanic approved successfully!"
          : "Mechanic rejected."
      );

      await loadDashboard();

    } catch (err) {
      setError(
        err.response?.data?.message || "Action failed."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("roadfix_access_token");
    localStorage.removeItem("roadfix_user");
    navigate("/");
  };

  if (loading) {
    return <div style={styles.page}>Loading RoadFix Admin...</div>;
  }

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <h2>RoadFix<span style={{ color: "#ef4444" }}>.</span></h2>
        <div>
          <button style={styles.button} onClick={loadDashboard}>
            Refresh
          </button>
          <button style={styles.logout} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>

        <p style={styles.eyebrow}>ADMIN CONTROL CENTER</p>
        <h1>Dashboard Overview</h1>
        <p style={styles.muted}>
          Manage mechanics, customers and roadside service requests.
        </p>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.grid}>
          {[
            ["Customers", data?.customers],
            ["Mechanics", data?.mechanics],
            ["Approved Mechanics", data?.approved_mechanics],
            ["Pending Approval", data?.pending_mechanics],
            ["Total Requests", data?.requests],
            ["Pending Requests", data?.pending],
            ["Completed Requests", data?.completed]
          ].map(([title, value]) => (
            <div style={styles.stat} key={title}>
              <p>{title}</p>
              <h1>{value ?? 0}</h1>
            </div>
          ))}
        </div>

        <section style={styles.section}>
          <h2>Mechanic Verification</h2>
          <p style={styles.muted}>
            Approve or reject newly registered mechanics.
          </p>

          {mechanics.length === 0 ? (
            <p style={styles.empty}>No mechanics waiting for approval.</p>
          ) : (
            mechanics.map((m) => (
              <div key={m.id} style={styles.mechanic}>
                <div>
                  <h3>{m.name}</h3>
                  <p>{m.email}</p>
                  <p>{m.phone || "No phone number"}</p>
                  <small>Mechanic ID: {m.id}</small>
                </div>

                <div style={styles.actions}>
                  <button
                    style={styles.approve}
                    onClick={() => handleApproval(m.id, "approve")}
                  >
                    Approve
                  </button>

                  <button
                    style={styles.reject}
                    onClick={() => handleApproval(m.id, "reject")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section style={styles.section}>
          <h2>Recent Service Requests</h2>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Problem</th>
                  <th>Mechanic</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {(data?.recent_requests || []).map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.customer_name}</td>
                    <td>{r.problem_type}</td>
                    <td>{r.mechanic_name || "Not assigned"}</td>
                    <td>{r.status?.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.section}>
          <h2>Registered Users</h2>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Approved</th>
                </tr>
              </thead>

              <tbody>
                {(data?.users || []).map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.is_active ? "Yes" : "No"}</td>
                    <td>{u.is_approved ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#09090b",
    color: "white",
    fontFamily: "Arial"
  },
  header: {
    padding: "18px 5%",
    background: "#151519",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #333"
  },
  main: {
    maxWidth: 1200,
    margin: "auto",
    padding: 25
  },
  eyebrow: {
    color: "#ef4444",
    letterSpacing: 2,
    fontSize: 11
  },
  muted: {
    color: "#999"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: 15,
    marginTop: 25
  },
  stat: {
    background: "#19191e",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #333"
  },
  section: {
    marginTop: 40,
    background: "#151519",
    padding: 22,
    borderRadius: 12,
    border: "1px solid #333"
  },
  mechanic: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
    padding: 18,
    marginTop: 12,
    background: "#222228",
    borderRadius: 10
  },
  actions: {
    display: "flex",
    gap: 10
  },
  button: {
    padding: 10,
    marginRight: 10,
    background: "#333",
    color: "white",
    border: 0,
    borderRadius: 7,
    cursor: "pointer"
  },
  logout: {
    padding: 10,
    background: "#dc2626",
    color: "white",
    border: 0,
    borderRadius: 7,
    cursor: "pointer"
  },
  approve: {
    padding: 10,
    background: "#16a34a",
    color: "white",
    border: 0,
    borderRadius: 7,
    cursor: "pointer"
  },
  reject: {
    padding: 10,
    background: "#dc2626",
    color: "white",
    border: 0,
    borderRadius: 7,
    cursor: "pointer"
  },
  tableWrap: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 15
  },
  empty: {
    color: "#aaa",
    padding: 20
  },
  success: {
    background: "#14532d",
    padding: 12,
    borderRadius: 8
  },
  error: {
    background: "#450a0a",
    padding: 12,
    borderRadius: 8
  }
};