import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

const AUTH_STORAGE_KEY = "primetrade_auth";

function readStoredAuth() {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return { token: "", user: null };
  }

  try {
    return JSON.parse(storedAuth);
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return { token: "", user: null };
  }
}

export default function App() {
  const [auth, setAuth] = useState({ token: "", user: null });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuth(readStoredAuth());
    setAuthReady(true);
  }, []);

  const handleAuthSuccess = ({ access_token: accessToken, user }) => {
    const nextAuth = { token: accessToken, user };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth({ token: "", user: null });
  };

  if (!authReady) {
    return <div className="page-shell">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          auth.token ? (
            <Navigate to={auth.user?.role === "admin" ? "/admin" : "/dashboard"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          auth.token ? (
            <Navigate to={auth.user?.role === "admin" ? "/admin" : "/dashboard"} replace />
          ) : (
            <Login onLogin={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/register"
        element={auth.token ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute token={auth.token}>
            <Dashboard auth={auth} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute token={auth.token} user={auth.user} adminOnly>
            <AdminPanel auth={auth} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
