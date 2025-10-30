import { Outlet } from "react-router-dom";
import SessionManager from "../SessionManager/SessionManager";

export default function AppRoot() {
  return (
    <>
      <SessionManager />
      <Outlet />
    </>
  );
}
