import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import "./styles/global.scss";

import Landing from "./components/Landing/Landing";
import GetStarted from "./pages/GetStarted";
import Legal from "./pages/Legal";
import Support from "./pages/Support";
import Development from "./pages/Development";
import Dashboard from "./components/Dashboard/Dashboard";
import Authenticator from "./components/Auth/Authenticator";
import NotFound from "./components/NotFound/NotFound";
import { isAuthenticated } from "./services/session";

// Protected layout that centralizes auth check via session service
const ProtectedLayout: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth", { replace: true });
    }
    setChecked(true);
  }, [navigate]);

  if (!checked) return <div>Loading...</div>;
  return <Outlet />;
};

// Root redirect: if authenticated -> /dashboard; else -> /landed
const RootRedirect: React.FC = () => (
  <Navigate to={isAuthenticated() ? "/dashboard" : "/landed"} replace />
);

const router = createBrowserRouter([
  { path: "/landed", element: <Landing /> }, // public landing page
  { path: "/get-started", element: <GetStarted /> }, // sign up
  { path: "/legal", element: <Legal /> },
  { path: "/support", element: <Support /> },
  { path: "/development", element: <Development /> },
  { path: "/auth", element: <Authenticator /> }, // public login
  { path: "/", element: <RootRedirect /> }, // dynamic redirect based on auth
  {
    element: <ProtectedLayout />, // wrapper for protected routes
    children: [{ path: "/dashboard", element: <Dashboard /> }],
  },
  { path: "*", element: <NotFound /> }, // public catch-all
]);

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing in index.html");

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
