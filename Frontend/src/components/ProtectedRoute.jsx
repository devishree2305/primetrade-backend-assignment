import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ token, user, adminOnly = false, children }) {
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
