import axios from "axios";
import { API_URL } from "./env";

async function getUserInfo() {
  try {
    // try to read token from stored auth object or common localStorage keys
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem("authUser") || "null");
      } catch {
        return null;
      }
    })();
    let token =
      stored?.token ||
      stored?.accessToken ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      null;

    if (!token) {
      console.warn("No auth token found for getUserInfo");
      return;
    }

    // Debug: log token presence (do not leak to production logs)
    console.debug("getUserInfo using token:", token?.slice ? `${token.slice(0, 8)}...` : token);

    const res = await axios.get(`${API_URL}/getuserinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("user: ", res.data.user);
    // console.log("getUserInfo ",res.data)
    return res.data.user;
  } catch (err: any) {
    // Provide more helpful debug information when available
    if (err?.response) {
      console.error("getUserInfo failed: ", err.response.status, err.response.data);
    } else {
      console.error(err);
    }
    throw err;
  }
}

export default getUserInfo;