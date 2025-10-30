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

    const res = await axios.get(`${API_URL}/getuserinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("user: ", res.data.user);
    // console.log("getUserInfo ",res.data)
    return res.data.user;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default getUserInfo;