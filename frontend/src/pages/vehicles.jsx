import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

const emptyForm = {
  vehicle_type: "Car",
  brand: "",
  model: "",
  registration_number: "",
  fuel_type: "Petrol"
};

function Vehicles() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("roadfix_access_token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const loadVehicles = async () => {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/vehicles/`,
        { headers }
      );

      setVehicles(response.data.vehicles || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your vehicles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      vehicle_type: vehicle.vehicle_type,
      brand: vehicle.brand,
      model: vehicle.model,
      registration_number: vehicle.registration_number,
      fuel_type: vehicle.fuel_type
    });
    setMessage("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      if (editingId) {
        await axios.put(
          `${API_URL}/api/vehicles/${editingId}`,
          form,
          { headers }
        );

        setMessage("Vehicle updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/api/vehicles/`,
          form,
          { headers }
        );

        setMessage("Vehicle added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadVehicles();

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/api/vehicles/${id}`,
        { headers }
      );

      setMessage("Vehicle deleted successfully.");
      await loadVehicles();

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Unable to delete vehicle."
      );
    }
  };

  const getVehicleIcon = (type) => {
    const value = (type || "").toLowerCase();

    if (value.includes("bike") || value.includes("scooter")) {
      return "🏍️";
    }

    if (value.includes("truck")) {
      return "🚚";
    }

    if (value.includes("bus")) {
      return "🚌";
    }

    return "🚘";
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div
          style={styles.logoArea}
          onClick={() => navigate("/customer/dashboard")}
        >
          <div style={styles.logoIcon}>R</div>
          <div>
            <div style={styles.logo}>RoadFix</div>
            <div style={styles.logoSub}>VEHICLE MANAGEMENT</div>
          </div>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/customer/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.topLine}>
          <div>
            <div style={styles.eyebrow}>YOUR GARAGE</div>
            <h1 style={styles.heading}>My Vehicles<span>.</span></h1>
            <p style={styles.subtitle}>
              Keep your vehicles organised and ready for assistance.
            </p>
          </div>

          <button style={styles.addButton} onClick={openAddForm}>
            + Add Vehicle
          </button>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>TOTAL VEHICLES</div>
            <div style={styles.statNumber}>{vehicles.length}</div>
            <div style={styles.statHint}>Registered in your garage</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>GARAGE STATUS</div>
            <div style={styles.statStatus}>● ACTIVE</div>
            <div style={styles.statHint}>Your vehicles are saved securely</div>
          </div>
        </div>

        {message && (
          <div style={styles.message}>{message}</div>
        )}

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {loading ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>⏳</div>
            <h2>Loading your garage...</h2>
            <p>Please wait a moment.</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🚘</div>
            <h2>Your garage is waiting</h2>
            <p>
              Add your first vehicle to manage its details here.
            </p>
            <button style={styles.addButton} onClick={openAddForm}>
              + Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {vehicles.map((vehicle) => (
              <article style={styles.card} key={vehicle.id}>
                <div style={styles.cardTop}>
                  <span style={styles.vehicleTag}>
                    {vehicle.vehicle_type.toUpperCase()}
                  </span>
                  <span style={styles.vehicleIcon}>
                    {getVehicleIcon(vehicle.vehicle_type)}
                  </span>
                </div>

                <div style={styles.vehicleVisual}>
                  <div style={styles.visualGlow}></div>
                  <div style={styles.bigIcon}>
                    {getVehicleIcon(vehicle.vehicle_type)}
                  </div>
                </div>

                <div style={styles.vehicleInfo}>
                  <div style={styles.brand}>{vehicle.brand}</div>
                  <h2 style={styles.model}>{vehicle.model}</h2>

                  <div style={styles.registration}>
                    <span>REGISTRATION NUMBER</span>
                    <strong>{vehicle.registration_number}</strong>
                  </div>

                  <div style={styles.details}>
                    <span>⛽ {vehicle.fuel_type}</span>
                    <span>🚘 {vehicle.vehicle_type}</span>
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button
                    style={styles.editButton}
                    onClick={() => openEditForm(vehicle)}
                  >
                    Edit Details
                  </button>

                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.eyebrow}>
                  VEHICLE INFORMATION
                </div>
                <h2 style={styles.modalTitle}>
                  {editingId ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={styles.label}>Vehicle Type</label>
              <select
                style={styles.input}
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={handleChange}
                required
              >
                <option>Car</option>
                <option>Bike</option>
                <option>Scooter</option>
                <option>Truck</option>
                <option>Bus</option>
                <option>Other</option>
              </select>

              <label style={styles.label}>Brand</label>
              <input
                style={styles.input}
                name="brand"
                placeholder="e.g. Hyundai"
                value={form.brand}
                onChange={handleChange}
                required
              />

              <label style={styles.label}>Model</label>
              <input
                style={styles.input}
                name="model"
                placeholder="e.g. Creta"
                value={form.model}
                onChange={handleChange}
                required
              />

              <label style={styles.label}>Registration Number</label>
              <input
                style={styles.input}
                name="registration_number"
                placeholder="e.g. TR01AB1234"
                value={form.registration_number}
                onChange={handleChange}
                required
              />

              <label style={styles.label}>Fuel Type</label>
              <select
                style={styles.input}
                name="fuel_type"
                value={form.fuel_type}
                onChange={handleChange}
                required
              >
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Electric</option>
                <option>CNG</option>
                <option>Hybrid</option>
              </select>

              <button
                style={styles.submitButton}
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Please wait..."
                  : editingId
                  ? "Save Changes"
                  : "Add Vehicle"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#09090b",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif"
  },
  header: {
    minHeight: 78,
    padding: "12px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #222226",
    background: "#0d0d10"
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer"
  },
  logoIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    background: "#dc2626",
    display: "grid",
    placeItems: "center",
    fontSize: 21,
    fontWeight: 900
  },
  logo: {
    fontSize: 19,
    fontWeight: 800
  },
  logoSub: {
    color: "#777",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 3
  },
  backButton: {
    background: "#17171b",
    border: "1px solid #303036",
    color: "#ddd",
    borderRadius: 9,
    padding: "11px 16px",
    cursor: "pointer"
  },
  main: {
    maxWidth: 1180,
    margin: "auto",
    padding: "55px 28px 90px"
  },
  topLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 35
  },
  eyebrow: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 2
  },
  heading: {
    fontSize: "clamp(34px, 5vw, 52px)",
    letterSpacing: -2,
    margin: "10px 0"
  },
  subtitle: {
    color: "#888",
    fontSize: 14
  },
  addButton: {
    background: "#dc2626",
    color: "#fff",
    border: 0,
    borderRadius: 10,
    padding: "14px 20px",
    fontWeight: 800,
    cursor: "pointer"
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 35
  },
  statCard: {
    background: "#121216",
    border: "1px solid #27272d",
    borderRadius: 14,
    padding: 22
  },
  statLabel: {
    color: "#777",
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: 800
  },
  statNumber: {
    fontSize: 34,
    fontWeight: 800,
    marginTop: 12
  },
  statStatus: {
    color: "#4ade80",
    fontWeight: 800,
    marginTop: 15
  },
  statHint: {
    color: "#777",
    fontSize: 11,
    marginTop: 7
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 22
  },
  card: {
    background: "linear-gradient(145deg, #17171c, #101014)",
    border: "1px solid #2b2b32",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 18px 45px rgba(0,0,0,.22)"
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px 0"
  },
  vehicleTag: {
    color: "#f87171",
    background: "rgba(220,38,38,.12)",
    border: "1px solid rgba(220,38,38,.25)",
    borderRadius: 20,
    padding: "6px 10px",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 1
  },
  vehicleIcon: {
    fontSize: 22
  },
  vehicleVisual: {
    height: 145,
    margin: "12px 18px 0",
    borderRadius: 13,
    background: "radial-gradient(circle at center, #303038, #17171d 70%)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  visualGlow: {
    position: "absolute",
    width: 170,
    height: 90,
    borderRadius: "50%",
    background: "rgba(220,38,38,.13)",
    filter: "blur(35px)"
  },
  bigIcon: {
    position: "relative",
    fontSize: 76,
    filter: "drop-shadow(0 12px 12px rgba(0,0,0,.5))"
  },
  vehicleInfo: {
    padding: "20px 20px 15px"
  },
  brand: {
    color: "#999",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.3
  },
  model: {
    fontSize: 24,
    margin: "5px 0 18px"
  },
  registration: {
    background: "#0b0b0e",
    border: "1px solid #2b2b32",
    borderRadius: 9,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  registrationSpan: {
    color: "#777",
    fontSize: 8,
    letterSpacing: 1
  },
  registrationStrong: {
    fontSize: 14,
    letterSpacing: 1.3
  },
  details: {
    display: "flex",
    justifyContent: "space-between",
    color: "#aaa",
    fontSize: 11,
    marginTop: 15
  },
  cardActions: {
    display: "flex",
    gap: 10,
    padding: "0 20px 20px"
  },
  editButton: {
    flex: 1,
    background: "#25252b",
    color: "#fff",
    border: "1px solid #393941",
    borderRadius: 8,
    padding: 11,
    cursor: "pointer"
  },
  deleteButton: {
    background: "transparent",
    color: "#f87171",
    border: "1px solid #713333",
    borderRadius: 8,
    padding: "11px 15px",
    cursor: "pointer"
  },
  empty: {
    background: "#121216",
    border: "1px dashed #38383f",
    borderRadius: 18,
    textAlign: "center",
    padding: "65px 20px",
    color: "#fff"
  },
  emptyIcon: {
    fontSize: 48
  },
  message: {
    background: "rgba(34,197,94,.1)",
    border: "1px solid rgba(34,197,94,.3)",
    color: "#86efac",
    borderRadius: 9,
    padding: 13,
    marginBottom: 20
  },
  error: {
    background: "rgba(239,68,68,.1)",
    border: "1px solid rgba(239,68,68,.3)",
    color: "#fca5a5",
    borderRadius: 9,
    padding: 13,
    marginBottom: 20
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.78)",
    display: "grid",
    placeItems: "center",
    padding: 18,
    zIndex: 50,
    overflowY: "auto"
  },
  modal: {
    width: "100%",
    maxWidth: 480,
    background: "#151519",
    border: "1px solid #33333b",
    borderRadius: 17,
    padding: 25,
    margin: "auto"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25
  },
  modalTitle: {
    margin: "8px 0 0",
    fontSize: 24
  },
  closeButton: {
    background: "transparent",
    color: "#aaa",
    border: 0,
    fontSize: 30,
    cursor: "pointer"
  },
  label: {
    display: "block",
    color: "#bbb",
    fontSize: 12,
    margin: "15px 0 7px"
  },
  input: {
    width: "100%",
    padding: 12,
    background: "#0c0c0f",
    border: "1px solid #35353d",
    borderRadius: 8,
    color: "#fff",
    outline: "none"
  },
  submitButton: {
    width: "100%",
    marginTop: 24,
    padding: 14,
    background: "#dc2626",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    fontWeight: 800,
    cursor: "pointer"
  }
};

export default Vehicles;