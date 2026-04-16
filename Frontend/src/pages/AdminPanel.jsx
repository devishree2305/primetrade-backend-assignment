import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import MessageBanner from "../components/MessageBanner";
import TaskTable from "../components/TaskTable";
import TaskForm from "../components/TaskForm";
import AdminRequests from "../components/AdminRequests";
import api, { getApiError } from "../services/api";

function cleanTaskPayload(payload, includeUserId) {
  const nextPayload = {
    title: payload.title,
    description: payload.description,
    status: payload.status,
  };

  if (includeUserId && payload.user_id) {
    nextPayload.user_id = payload.user_id;
  }

  return nextPayload;
}

export default function AdminPanel({ auth, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load tasks."));
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const { data } = await api.get("/admin/requests");
      setRequests(data);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load admin requests."));
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    setError("");
    loadTasks();
    loadRequests();
  }, []);

  const handleTaskSubmit = async (payload) => {
    setSubmittingTask(true);
    setError("");
    setSuccess("");

    try {
      if (selectedTask) {
        await api.put(`/tasks/${selectedTask.id}`, cleanTaskPayload(payload, true));
        setSuccess("Task updated successfully.");
      } else {
        await api.post("/tasks", cleanTaskPayload(payload, true));
        setSuccess("Task created successfully.");
      }

      setSelectedTask(null);
      await loadTasks();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to save task."));
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/tasks/${taskId}`);
      setSuccess("Task deleted successfully.");
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
      await loadTasks();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to delete task."));
    }
  };

  const handleReviewRequest = async (requestId, action) => {
    setReviewingRequest(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/admin/approve/${requestId}`, { action });
      setSuccess(`Request ${action}.`);
      await loadRequests();
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to review admin request."));
    } finally {
      setReviewingRequest(false);
    }
  };

  return (
    <Layout title="Admin Panel" auth={auth} onLogout={onLogout}>
      <MessageBanner type="error" message={error} />
      <MessageBanner type="success" message={success} />

      <div className="admin-grid">
        <section className="content-section">
          <div className="section-header">
            <div>
              <h2>{selectedTask ? "Edit Task" : "Create Task"}</h2>
              <p className="muted">Manage tasks and assign them to users.</p>
            </div>
          </div>

          <TaskForm
            selectedTask={selectedTask}
            onSubmit={handleTaskSubmit}
            onCancel={() => setSelectedTask(null)}
            loading={submittingTask}
          />
        </section>

        <section className="content-section">
          <div className="section-header">
            <div>
              <h2>Admin Requests</h2>
              <p className="muted">Approve or reject role upgrade requests.</p>
            </div>
          </div>

          {loadingRequests ? (
            <p>Loading admin requests...</p>
          ) : (
            <AdminRequests requests={requests} onReview={handleReviewRequest} loading={reviewingRequest} />
          )}
        </section>
      </div>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>All Tasks</h2>
            <p className="muted">Admins can review, edit, and delete any task.</p>
          </div>
        </div>

        {loadingTasks ? (
          <p>Loading tasks...</p>
        ) : (
          <TaskTable
            tasks={tasks}
            isAdmin
            onEdit={setSelectedTask}
            onDelete={handleDeleteTask}
          />
        )}
      </section>
    </Layout>
  );
}
