import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/support";

export default function CustomerSupport() {
  const navigate = useNavigate();

  const [prices, setPrices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [requestId, setRequestId] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRequest, setReviewRequest] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("roadfix_access_token");
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const [p, c, r] = await Promise.all([
        axios.get(`${API}/prices`),
        axios.get(`${API}/complaints`, { headers }),
        axios.get(`${API}/reviews`, { headers })
      ]);

      setPrices(p.data.prices || []);
      setComplaints(c.data.complaints || []);
      setReviews(r.data.reviews || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load support data.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/complaints`, {
        subject,
        description,
        service_request_id: requestId ? Number(requestId) : null
      }, { headers });

      setMessage("Complaint submitted successfully.");
      setSubject("");
      setDescription("");
      setRequestId("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Complaint submission failed.");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/reviews`, {
        service_request_id: Number(reviewRequest),
        rating: Number(rating),
        comment: reviewComment
      }, { headers });

      setMessage("Review submitted successfully.");
      setReviewRequest("");
      setReviewComment("");
      setRating(5);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Review submission failed.");
    }
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h2>RoadFix.</h2>
        <button onClick={() => navigate("/customer/dashboard")}>Dashboard</button>
      </header>

      <main style={s.main}>
        <h1>Customer Support & Services</h1>

        {message && <p style={{ color: "#4ade80" }}>{message}</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <section style={s.card}>
          <h2>Service Price List</h2>
          {prices.length === 0 && <p>No service prices published yet.</p>}
          {prices.map(p => (
            <div key={p.id} style={s.row}>
              <strong>{p.service_name}</strong>
              <strong>₹{p.base_price}</strong>
              <p>{p.description}</p>
            </div>
          ))}
          <p style={s.note}>These are base estimates. Final charges may vary depending on vehicle condition, parts and additional work.</p>
        </section>

        <section style={s.card}>
          <h2>Submit a Complaint</h2>
          <form onSubmit={submitComplaint} style={s.form}>
            <input
              placeholder="Subject"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
            <input
              type="number"
              min="1"
              placeholder="Service Request ID (optional)"
              value={requestId}
              onChange={e => setRequestId(e.target.value)}
            />
            <textarea
              placeholder="Describe your complaint"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <button style={s.primary}>Submit Complaint</button>
          </form>
        </section>

        <section style={s.card}>
          <h2>My Complaints</h2>
          {complaints.map(c => (
            <div key={c.id} style={s.row}>
              <strong>{c.subject}</strong>
              <p>{c.description}</p>
              <p>Status: {c.status}</p>
              {c.admin_reply && <p>Admin reply: {c.admin_reply}</p>}
            </div>
          ))}
          {complaints.length === 0 && <p>No complaints submitted.</p>}
        </section>

        <section style={s.card}>
          <h2>Rate Your Mechanic</h2>
          <p style={s.note}>Only completed service requests with an assigned mechanic can be reviewed.</p>
          <form onSubmit={submitReview} style={s.form}>
            <input
              type="number"
              min="1"
              placeholder="Completed Service Request ID"
              required
              value={reviewRequest}
              onChange={e => setReviewRequest(e.target.value)}
            />
            <select value={rating} onChange={e => setRating(e.target.value)}>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
            <textarea
              placeholder="Write your feedback"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
            />
            <button style={s.primary}>Submit Review</button>
          </form>
        </section>

        <section style={s.card}>
          <h2>My Reviews</h2>
          {reviews.map(r => (
            <div key={r.id} style={s.row}>
              <strong>Rating: {"⭐".repeat(r.rating)}</strong>
              <p>{r.comment}</p>
              <p>Service Request #{r.service_request_id}</p>
            </div>
          ))}
          {reviews.length === 0 && <p>No reviews yet.</p>}
        </section>
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#09090b", color: "white", fontFamily: "Arial" },
  header: { padding: 20, background: "#17171b", display: "flex", justifyContent: "space-between" },
  main: { maxWidth: 950, margin: "auto", padding: 25 },
  card: { background: "#19191e", padding: 22, borderRadius: 12, marginTop: 22 },
  row: { background: "#292930", padding: 15, borderRadius: 8, marginTop: 12 },
  form: { display: "grid", gap: 12 },
  primary: { background: "#dc2626", color: "white", padding: 13, border: 0, borderRadius: 8, cursor: "pointer" },
  note: { color: "#aaa", fontSize: 13 },
};