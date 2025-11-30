import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const { status, isSessionValid } = useSession();

  console.log("ProtectedRoute session:", isSessionValid, status);

  // 1. While checking token -> do NOT redirect
  if (status === "loading") {
    return <div className="loading-container">Verifying session...</div>;
  }

  // 2. After check → enforce protection
  if (!isSessionValid) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
