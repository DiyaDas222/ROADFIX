import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API = "http://127.0.0.1:5000/api";

const currentIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#dc2626;width:20px;height:20px;border:4px solid white;border-radius:50%;box-shadow:0 2px 12px #000"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const partnerIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#2563eb;width:20px;height:20px;border:4px solid white;border-radius:50%;box-shadow:0 2px 12px #000"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(
        [position.latitude, position.longitude],
        16,
        { duration: 1 }
      );
    }
  }, [position, map]);

  return null;
}

export default function LiveTracking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const requestId = params.get("requestId");
  const token = localStorage.getItem("roadfix_access_token");

  const [location, setLocation] = useState(null);
  const [partner, setPartner] = useState(null);
  const [address, setAddress] = useState("Finding your address...");
  const [partnerAddress, setPartnerAddress] = useState("Location unavailable");
  const [sharing, setSharing] = useState(true);
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    if (!token || !requestId) {
      setError("Login and a valid service request are required.");
      return;
    }

    if (!navigator.geolocation) {
      setError("Your browser does not support GPS location.");
      return;
    }

    let watchId;

    const getAddress = async (lat, lon, setter) => {
      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: {
              format: "jsonv2",
              lat,
              lon
            }
          }
        );

        setter(
          response.data.display_name || "Address unavailable"
        );
      } catch {
        setter("Address could not be retrieved.");
      }
    };

    const sendLocation = async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const current = { latitude, longitude };

      setLocation(current);
      setError("");

      getAddress(latitude, longitude, setAddress);

      try {
        await axios.post(
          `${API}/location/update`,
          current,
          { headers }
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to share your location."
        );
      }
    };

    watchId = navigator.geolocation.watchPosition(
      sendLocation,
      (err) => {
        setError(
          err.code === 1
            ? "Please allow location permission."
            : "Unable to detect your location."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000
      }
    );

    const fetchPartner = async () => {
      try {
        const response = await axios.get(
          `${API}/location/request/${requestId}`,
          { headers }
        );

        const user = JSON.parse(
          localStorage.getItem("roadfix_user") || "{}"
        );

        const locations = response.data.locations;

        const other =
          user.role === "customer"
            ? locations.mechanic
            : locations.customer;

        setPartner(other);

        if (other) {
          getAddress(
            other.latitude,
            other.longitude,
            setPartnerAddress
          );
        }
      } catch (err) {
        console.log("Partner location not available yet.");
      }
    };

    fetchPartner();

    const interval = setInterval(fetchPartner, 10000);

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }

      clearInterval(interval);
    };
  }, [requestId]);

  const toggleSharing = async () => {
    try {
      const newValue = !sharing;

      await axios.put(
        `${API}/location/sharing`,
        { is_sharing: newValue },
        { headers }
      );

      setSharing(newValue);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to change sharing settings."
      );
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2>🔴 RoadFix Tracking</h2>
        <button
          style={styles.back}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.eyebrow}>LIVE LOCATION</div>
        <h1>Your Location<span>.</span></h1>

        {error && <div style={styles.error}>{error}</div>}

        <section style={styles.locationCard}>
          <h3>📍 Your Current Address</h3>
          <p style={styles.address}>{address}</p>

          {location && (
            <div style={styles.coordinates}>
              Latitude: {location.latitude.toFixed(6)}
              <br />
              Longitude: {location.longitude.toFixed(6)}
            </div>
          )}
        </section>

        {location && (
          <div style={styles.map}>
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapUpdater position={location} />

              <Marker
                position={[location.latitude, location.longitude]}
                icon={currentIcon}
              >
                <Popup>Your Current Location</Popup>
              </Marker>

              {partner && (
                <Marker
                  position={[partner.latitude, partner.longitude]}
                  icon={partnerIcon}
                >
                  <Popup>Other Person's Location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        )}

        <section style={styles.locationCard}>
          <h3>🚗 Mechanic / Customer Location</h3>
          <p style={styles.address}>{partnerAddress}</p>
          {!partner && <p>Waiting for the other person's location...</p>}
        </section>

        <section style={styles.locationCard}>
          <h3>Location Sharing</h3>
          <p>
            Status: {sharing ? "Active" : "Disabled"}
          </p>

          <button
            style={styles.button}
            onClick={toggleSharing}
          >
            {sharing ? "Turn Sharing OFF" : "Turn Sharing ON"}
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
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  header: {
    padding: "20px 6%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #292929"
  },
  main: {
    maxWidth: 1000,
    margin: "auto",
    padding: "40px 22px"
  },
  eyebrow: {
    color: "#ef4444",
    letterSpacing: 2,
    fontSize: 12
  },
  address: {
    color: "#ddd",
    lineHeight: 1.7,
    fontSize: 14
  },
  coordinates: {
    color: "#888",
    fontSize: 12,
    lineHeight: 1.8
  },
  locationCard: {
    background: "#17171b",
    border: "1px solid #303036",
    borderRadius: 14,
    padding: 22,
    marginTop: 20
  },
  map: {
    height: 420,
    marginTop: 20,
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #333"
  },
  button: {
    background: "#dc2626",
    color: "white",
    border: 0,
    borderRadius: 8,
    padding: "12px 20px",
    cursor: "pointer"
  },
  back: {
    background: "#25252b",
    color: "white",
    border: "1px solid #444",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer"
  },
  error: {
    background: "#451a1a",
    color: "#fca5a5",
    padding: 15,
    borderRadius: 8
  }
};