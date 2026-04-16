import { useEffect, useState } from "react";

const initialState = {
  title: "",
  description: "",
  status: "pending",
  user_id: "",
};

export default function TaskForm({ selectedTask, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title ?? "",
        description: selectedTask.description ?? "",
        status: selectedTask.status ?? "pending",
        user_id: selectedTask.user_id ? String(selectedTask.user_id) : "",
      });
      return;
    }

    setFormData(initialState);
  }, [selectedTask]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      user_id: formData.user_id ? Number(formData.user_id) : undefined,
    });
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={formData.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="user_id">Assigned User ID</label>
        <input
          id="user_id"
          name="user_id"
          type="number"
          min="1"
          value={formData.user_id}
          onChange={handleChange}
          required={!selectedTask}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : selectedTask ? "Update Task" : "Create Task"}
        </button>
        {selectedTask && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
