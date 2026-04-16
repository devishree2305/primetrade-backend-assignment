export default function TaskTable({ tasks, isAdmin = false, onEdit, onDelete }) {
  if (!tasks.length) {
    return <p className="empty-state">No tasks found.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            {isAdmin && <th>User ID</th>}
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>
                <span className={`status-chip ${task.status}`}>{task.status}</span>
              </td>
              {isAdmin && <td>{task.user_id}</td>}
              {isAdmin && (
                <td className="action-cell">
                  <button type="button" onClick={() => onEdit(task)}>
                    Edit
                  </button>
                  <button type="button" className="danger-button" onClick={() => onDelete(task.id)}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
