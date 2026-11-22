import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api";

export default function MechanicAvailability() {
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("roadfix_access_token")}`
  };

  useEffect(() => {
    axios.get(`${API}/mechanics/profile/availability`, { headers })
      .then(response => {
        setAvailable(response.data.is_available);
      })
      .catch(error => {
        console.error("Availability loading error:", error);
      });
  }, []);

  const toggleAvailability = async () => {
    try {
      setLoading(true);
      setMessage("");

      const newValue = !available;

      const response = await axios.put(
        `${API}/mechanics/availability`,
        { is_available: newValue },
        { headers }
      );

      setAvailable(response.data.is_available);
      setMessage("Availability updated successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to update availability."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div>
        <h3>Mechanic Availability</h3>
        <p style={{ color: available ? "#4ade80" : "#f87171" }}>
          ● {available ? "You are ONLINE" : "You are OFFLINE"}
        </p>
      </div>

      <button
        onClick={toggleAvailability}
        disabled={loading}
        style={{
          ...styles.button,
          background: available ? "#dc2626" : "#16a34a"
        }}
      >
        {loading ? "Updating..." : available ? "Go Offline" : "Go Online"}
      </button>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  card: {
    background: "#17171b",
    border: "1px solid #303036",
    borderRadius: 14,
    padding: 22,
    marginBottom: 20,
    color: "white"
  },
  button: {
    color: "white",
    border: 0,
    padding: "12px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold"
  },
  message: {
    color: "#86efac",
    fontSize: 13
  }
};