import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/support";

export default function AdminSupport() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [prices, setPrices] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("roadfix_access_token");
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const [c, p] = await Promise.all([
        axios.get(`${API}/complaints`, { headers }),
        axios.get(`${API}/prices`)
      ]);
      setComplaints(c.data.complaints || []);
      setPrices(p.data.prices || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin support.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const savePrice = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/prices`, {
        service_name: name,
        base_price: Number(amount),
        description
      }, { headers });

      setMessage("Service price saved.");
      setName("");
      setAmount("");
      setDescription("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save price.");
    }
  };

  const reply = async (id) => {
    const admin_reply = window.prompt("Enter your reply:");
    if (!admin_reply?.trim()) return;

    try {
      await axios.patch(`${API}/complaints/${id}/reply`, {
        admin_reply,
        status: "resolved"
      }, { headers });

      setMessage("Complaint resolved.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reply.");
    }
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h2>RoadFix Admin</h2>
        <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
      </header>

      <main style={s.main}>
        <h1>Customer Support Management</h1>
        {message && <p style={{ color: "#4ade80" }}>{message}</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <section style={s.card}>
          <h2>Add / Update Service Pricing</h2>
          <form onSubmit={savePrice} style={s.form}>
            <input required placeholder="Service name"
              value={name} onChange={e => setName(e.target.value)} />
            <input required type="number" min="0" placeholder="Base price"
              value={amount} onChange={e => setAmount(e.target.value)} />
            <input placeholder="Description"
              value={description} onChange={e => setDescription(e.target.value)} />
            <button style={s.primary}>Save Price</button>
          </form>
          {prices.map(p => (
            <div style={s.row} key={p.id}>
              <strong>{p.service_name}</strong> — ₹{p.base_price}
              <p>{p.description}</p>
            </div>
          ))}
        </section>

        <section style={s.card}>
          <h2>Customer Complaints</h2>
          {complaints.length === 0 && <p>No complaints received.</p>}
          {complaints.map(c => (
            <div style={s.row} key={c.id}>
              <h3>{c.subject}</h3>
              <p>Customer ID: {c.customer_id}</p>
              <p>Service Request: {c.service_request_id || "Not specified"}</p>
              <p>{c.description}</p>
              <p>Status: {c.status}</p>
              {c.admin_reply && <p>Previous reply: {c.admin_reply}</p>}
              {c.status !== "resolved" && (
                <button style={s.primary} onClick={() => reply(c.id)}>
                  Reply & Resolve
                </button>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#09090b", color: "white", fontFamily: "Arial" },
  header: { padding: 20, background: "#17171b", display: "flex", justifyContent: "space-between" },
  main: { maxWidth: 1000, margin: "auto", padding: 25 },
  card: { background: "#19191e", padding: 22, borderRadius: 12, marginTop: 22 },
  form: { display: "grid", gap: 12 },
  row: { background: "#292930", padding: 16, marginTop: 12, borderRadius: 8 },
  primary: { background: "#dc2626", color: "white", padding: 11, border: 0, borderRadius: 8, cursor: "pointer" }
};