import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/spare-parts";

export default function SpareParts() {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("roadfix_access_token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadData = async () => {
    try {
      const [p, o] = await Promise.all([
        axios.get(`${API}/`, { headers }),
        axios.get(`${API}/my-orders`, { headers })
      ]);

      setParts(p.data.parts || []);
      setOrders(o.data.orders || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load parts.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const orderPart = async (part) => {
    try {
      const quantity = Number(
        window.prompt(`Enter quantity for ${part.name}:`, "1")
      );

      if (!Number.isInteger(quantity) || quantity < 1) return;

      await axios.post(
        `${API}/order`,
        { part_id: part.id, quantity },
        { headers }
      );

      setMessage("Your spare parts order has been placed!");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Order failed.");
    }
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h2>RoadFix<span style={{ color: "red" }}>.</span></h2>
        <button style={s.button} onClick={() => navigate("/customer/dashboard")}>
          Dashboard
        </button>
      </header>

      <main style={s.main}>
        <h1>Spare Parts Store</h1>
        <p style={s.muted}>Find essential vehicle replacement parts.</p>

        {message && <p style={s.success}>{message}</p>}
        {error && <p style={s.error}>{error}</p>}

        <h2>Available Parts</h2>

        <div style={s.grid}>
          {parts.map(part => (
            <div style={s.card} key={part.id}>
              <h3>{part.name}</h3>
              <p style={s.muted}>{part.description}</p>
              <h2>₹{part.price}</h2>
              <p>Available stock: {part.stock}</p>

              <button
                style={s.primary}
                disabled={part.stock < 1}
                onClick={() => orderPart(part)}
              >
                {part.stock > 0 ? "Order Now" : "Out of Stock"}
              </button>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 45 }}>My Orders</h2>

        {orders.map(order => (
          <div style={s.order} key={order.id}>
            <strong>{order.part_name}</strong>
            <p>Quantity: {order.quantity}</p>
            <p>Total: ₹{order.total_price}</p>
            <p>Status: {order.status.toUpperCase()}</p>
          </div>
        ))}

        {orders.length === 0 && <p style={s.muted}>No orders yet.</p>}
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#09090b", color: "white", fontFamily: "Arial" },
  header: { padding: "18px 6%", background: "#17171b", display: "flex", justifyContent: "space-between" },
  main: { maxWidth: 1100, margin: "auto", padding: 25 },
  muted: { color: "#999" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 20, marginTop: 25 },
  card: { background: "#19191e", padding: 22, borderRadius: 12, border: "1px solid #333" },
  button: { background: "#333", color: "white", border: 0, padding: 12, borderRadius: 8 },
  primary: { background: "#dc2626", color: "white", border: 0, padding: 12, borderRadius: 8, cursor: "pointer" },
  order: { background: "#19191e", padding: 18, marginTop: 12, borderRadius: 10 },
  success: { color: "#4ade80" },
  error: { color: "#f87171" }
};