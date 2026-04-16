import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import MessageBanner from "../components/MessageBanner";
import TaskTable from "../components/TaskTable";
import api, { getApiError } from "../services/api";

export default function Dashboard({ auth, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requestingAdmin, setRequestingAdmin] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/tasks");
        setTasks(data);
      } catch (requestError) {
        setError(getApiError(requestError, "Unable to load tasks."));
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (auth.user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const handleAdminRequest = async () => {
    setRequestingAdmin(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.post("/admin/requests");
      setSuccess(data.message || "Admin request submitted.");
    } catch (requestError) {
      setError(getApiError(requestError, "Could not submit admin request."));
    } finally {
      setRequestingAdmin(false);
    }
  };

  return (
    <Layout title="Dashboard" auth={auth} onLogout={onLogout}>
      <section className="section-header">
        <div>
          <h2>Your Tasks</h2>
          <p className="muted">View tasks assigned to your account.</p>
        </div>
        <button type="button" onClick={handleAdminRequest} disabled={requestingAdmin}>
          {requestingAdmin ? "Submitting..." : "Request Admin Role"}
        </button>
      </section>

      <MessageBanner type="error" message={error} />
      <MessageBanner type="success" message={success} />

      {loading ? <p>Loading tasks...</p> : <TaskTable tasks={tasks} />}
    </Layout>
  );
}
