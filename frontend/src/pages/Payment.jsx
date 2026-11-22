import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000";

export default function Payment() {
  const navigate = useNavigate();
  const [serviceId, setServiceId] = useState("");
  const [partOrderId, setPartOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("roadfix_access_token");

  const payNow = async (e) => {
    e.preventDefault();

    if (Boolean(serviceId) === Boolean(partOrderId)) {
      setError("Enter either a service request ID or a part order ID.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout script is not loaded.");
      }

      const payload = serviceId
        ? { service_request_id: Number(serviceId) }
        : { part_order_id: Number(partOrderId) };

      const response = await axios.post(
        `${API}/api/payments/create-order`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: response.data.key_id,
        amount: response.data.amount,
        currency: response.data.currency,
        name: "RoadFix",
        description: "Roadside Assistance Payment",
        order_id: response.data.order_id,

        handler: async (result) => {
          try {
            const verified = await axios.post(
              `${API}/api/payments/verify`,
              {
                razorpay_order_id: result.razorpay_order_id,
                razorpay_payment_id: result.razorpay_payment_id,
                razorpay_signature: result.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(verified.data.message);
            setServiceId("");
            setPartOrderId("");
          } catch (err) {
            setError(
              err.response?.data?.message ||
              "Payment verification failed. Contact support."
            );
          }
        },

        modal: {
          ondismiss: () => setMessage("Payment window closed.")
        },

        theme: { color: "#dc2626" }
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (result) => {
        setError(result.error?.description || "Payment failed.");
      });

      checkout.open();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to start payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1>RoadFix Payments</h1>
        <p>Secure online payment using Razorpay.</p>

        <form onSubmit={payNow} style={s.form}>
          <input
            type="number"
            min="1"
            placeholder="Service Request ID"
            value={serviceId}
            onChange={e => {
              setServiceId(e.target.value);
              setPartOrderId("");
            }}
          />

          <p>OR</p>

          <input
            type="number"
            min="1"
            placeholder="Spare Parts Order ID"
            value={partOrderId}
            onChange={e => {
              setPartOrderId(e.target.value);
              setServiceId("");
            }}
          />

          <button disabled={loading}>
            {loading ? "Processing..." : "Pay Securely"}
          </button>
        </form>

        {message && <p style={{ color: "#4ade80" }}>{message}</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <button style={s.back} onClick={() => navigate("/customer/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#09090b",
    color: "white",
    fontFamily: "Arial"
  },
  card: {
    width: "min(420px, 90%)",
    padding: 30,
    background: "#19191e",
    borderRadius: 15,
    border: "1px solid #333"
  },
  form: { display: "grid", gap: 15 },
  back: {
    marginTop: 20,
    padding: 12,
    background: "#333",
    color: "white",
    border: 0,
    borderRadius: 8
  }
};