import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api";

export default function NearbyMechanics({ requestId }) {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestId) return;

    const token = localStorage.getItem("roadfix_access_token");

    const fetchMechanics = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API}/mechanics/nearby/${requestId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setMechanics(response.data.nearby_mechanics || []);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to find nearby mechanics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMechanics();
  }, [requestId]);

  if (!requestId) return null;

  return (
    <div style={styles.container}>
      <h2>Nearby Mechanics</h2>

      {loading && <p>Finding nearby mechanics...</p>}

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      {!loading && mechanics.length === 0 && !error && (
        <p>No available mechanics found nearby.</p>
      )}

      {mechanics.map(mechanic => (
        <div key={mechanic.mechanic_id} style={styles.card}>
          <div>
            <h3>{mechanic.name}</h3>
            <p>{mechanic.distance_km} km away</p>
            <p style={{ color: "#4ade80" }}>● Available</p>
          </div>

          <a
            href={`https://www.openstreetmap.org/?mlat=${mechanic.latitude}&mlon=${mechanic.longitude}#map=15/${mechanic.latitude}/${mechanic.longitude}`}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            View Location
          </a>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    background: "#111115",
    color: "white",
    borderRadius: 14,
    padding: 22,
    marginTop: 20
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
    background: "#202027",
    borderRadius: 10,
    padding: 16,
    marginTop: 12
  },
  link: {
    color: "#f87171",
    textDecoration: "none"
  }
};