import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api/notifications";

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("roadfix_access_token");

  const fetchNotifications = async () => {

    if (!token) return;

    try {

      const response = await axios.get(`${API}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(response.data.notifications || []);
      setUnread(response.data.unread_count || 0);

    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  useEffect(() => {

    if (!token) return;

    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      15000
    );

    return () => clearInterval(interval);

  }, [token]);

  const markRead = async (id) => {

    try {

      await axios.patch(
        `${API}/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchNotifications();

    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {

    try {

      await axios.patch(
        `${API}/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchNotifications();

    } catch (error) {
      console.error(error);
    }
  };

  const deleteNotification = async (id) => {

    try {

      await axios.delete(
        `${API}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchNotifications();

    } catch (error) {
      console.error(error);
    }
  };

  if (!token) return null;

  return (
    <div style={styles.wrapper}>

      <button
        onClick={() => setOpen(!open)}
        style={styles.bell}
        aria-label="Notifications"
      >
        🔔

        {unread > 0 && (
          <span style={styles.badge}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (

        <div style={styles.panel}>

          <div style={styles.header}>
            <strong>Notifications</strong>

            <button
              onClick={markAllRead}
              style={styles.markButton}
            >
              Read all
            </button>
          </div>

          <div style={styles.list}>

            {notifications.length === 0 ? (

              <p style={styles.empty}>
                No notifications yet.
              </p>

            ) : (

              notifications.map((item) => (

                <div
                  key={item.id}
                  style={{
                    ...styles.item,
                    background: item.is_read
                      ? "#ffffff"
                      : "#eff6ff"
                  }}
                >

                  <div
                    onClick={() => markRead(item.id)}
                    style={styles.content}
                  >

                    <strong>{item.title}</strong>

                    <p>{item.message}</p>

                    <small>
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </small>

                  </div>

                  <button
                    onClick={() => deleteNotification(item.id)}
                    style={styles.delete}
                    aria-label="Delete notification"
                  >
                    ×
                  </button>

                </div>

              ))

            )}

          </div>

        </div>

      )}

    </div>
  );
}


const styles = {

  wrapper: {
    position: "fixed",
    top: "18px",
    right: "24px",
    zIndex: 9999
  },

  bell: {
    position: "relative",
    border: "none",
    borderRadius: "50%",
    width: "46px",
    height: "46px",
    background: "#ffffff",
    boxShadow: "0 3px 15px rgba(0,0,0,0.15)",
    fontSize: "21px",
    cursor: "pointer"
  },

  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#ef4444",
    color: "white",
    borderRadius: "20px",
    minWidth: "19px",
    padding: "2px 5px",
    fontSize: "11px"
  },

  panel: {
    position: "absolute",
    top: "55px",
    right: "0",
    width: "340px",
    maxHeight: "430px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
    overflow: "hidden"
  },

  header: {
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #eee"
  },

  markButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer"
  },

  list: {
    maxHeight: "360px",
    overflowY: "auto"
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    borderBottom: "1px solid #eee"
  },

  content: {
    flex: 1,
    cursor: "pointer"
  },

  empty: {
    padding: "20px",
    textAlign: "center",
    color: "#777"
  },

  delete: {
    border: "none",
    background: "transparent",
    fontSize: "22px",
    cursor: "pointer",
    color: "#ef4444"
  }
};