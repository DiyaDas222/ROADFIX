import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/spare-parts";

export default function AdminParts() {
  const navigate = useNavigate();

  const [parts, setParts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: ""
  });

  const token = localStorage.getItem("roadfix_access_token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadData = async () => {
    try {
      const [p, o] = await Promise.all([
        axios.get(`${API}/`, { headers }),
        axios.get(`${API}/orders`, { headers })
      ]);

      setParts(p.data.parts || []);
      setOrders(o.data.orders || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load inventory.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addPart = async (e) => {
    e.preventDefault();

    try {
      await axios.post(API + "/", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock)
      }, { headers });

      setMessage("Spare part added successfully!");
      setForm({ name: "", description: "", price: "", stock: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add part.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API}/orders/${id}/status`,
        { status },
        { headers }
      );

      setMessage("Order status updated!");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h2>RoadFix Admin</h2>
        <button style={s.button} onClick={() => navigate("/admin/dashboard")}>
          Dashboard
        </button>
      </header>

      <main style={s.main}>
        <h1>Spare Parts Management</h1>

        {message && <p style={{ color: "#4ade80" }}>{message}</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <section style={s.card}>
          <h2>Add New Spare Part</h2>

          <form onSubmit={addPart} style={s.form}>
            <input required placeholder="Part name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />

            <input placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />

            <input required type="number" min="0" placeholder="Price"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })} />

            <input required type="number" min="0" placeholder="Stock"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })} />

            <button style={s.primary}>Add Part</button>
          </form>
        </section>

        <section style={s.card}>
          <h2>Inventory</h2>

          {parts.map(p => (
            <div key={p.id} style={s.row}>
              <div>
                <strong>{p.name}</strong>
                <p>₹{p.price} | Stock: {p.stock}</p>
              </div>
            </div>
          ))}
        </section>

        <section style={s.card}>
          <h2>Customer Orders</h2>

          {orders.map(o => (
            <div key={o.id} style={s.row}>
              <div>
                <strong>{o.part_name}</strong>
                <p>Order #{o.id} | Customer #{o.customer_id}</p>
                <p>Quantity: {o.quantity} | Total: ₹{o.total_price}</p>
                <p>Status: {o.status}</p>
              </div>

              <div style={s.actions}>
                <button onClick={() => updateStatus(o.id, "confirmed")}>Confirm</button>
                <button onClick={() => updateStatus(o.id, "dispatched")}>Dispatch</button>
                <button onClick={() => updateStatus(o.id, "delivered")}>Delivered</button>
                <button onClick={() => updateStatus(o.id, "cancelled")}>Cancel</button>
              </div>
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
  main: { maxWidth: 1100, margin: "auto", padding: 25 },
  card: { background: "#19191e", padding: 22, marginTop: 25, borderRadius: 12 },
  form: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 },
  row: { padding: 15, marginTop: 12, background: "#27272d", borderRadius: 8 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
  button: { padding: 11, background: "#333", color: "white", border: 0, borderRadius: 7 },
  primary: { padding: 12, background: "#dc2626", color: "white", border: 0, borderRadius: 7 },
};