import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getApiError } from "../services/api";
import MessageBanner from "../components/MessageBanner";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", formData);
      onLogin(data);

      const destination =
        data.user?.role === "admin"
          ? "/admin"
          : location.state?.from?.pathname || "/dashboard";

      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, "Login failed. Check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <h1>Login</h1>
          <p className="muted">Sign in to manage your tasks.</p>
        </div>

        <MessageBanner type="error" message={error} />

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
