import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkSession, clearSession } from "../../services/session";
import "./SessionManager.scss";

export default function SessionManager() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    // On init check
    const result = checkSession();
    if (!result.isValid) {
      clearSession();
      setReason(result.reason ?? "INVALID");
      // show non-jarring banner
      setVisible(true);
    }

    // Install axios interceptor to catch 401s from API calls
    const id = axios.interceptors.response.use(
      (resp) => resp,
      (error) => {
        try {
          const status = error?.response?.status;
          if (status === 401) {
            // Clear stale session and show prompt
            clearSession();
            setReason("INVALID");
            setVisible(true);
          }
        } catch (e) {
          // ignore
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(id);
    };
  }, []);

  if (!visible) return null;

  const title = reason === "EXPIRED" ? "Session expired" : "Please sign in";
  const message =
    reason === "EXPIRED"
      ? "Your session has expired. Please sign in again to continue."
      : "Your session is not valid. Please sign in to continue.";

  return (
    <div className="session-banner" role="status">
      <div className="session-banner__content">
        <div>
          <strong>{title}</strong>
          <div className="session-banner__msg">{message}</div>
        </div>
        <div className="session-banner__actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setVisible(false);
              navigate("/auth");
            }}
          >
            Sign in
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setVisible(false)}
            aria-label="Dismiss session prompt"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
