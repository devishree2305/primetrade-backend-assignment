export default function AdminRequests({ requests, onReview, loading }) {
  if (!requests.length) {
    return <p className="empty-state">No admin requests available.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Status</th>
            <th>Requested</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.user_id}</td>
              <td>
                <span className={`status-chip ${request.status}`}>{request.status}</span>
              </td>
              <td>{new Date(request.requested_at).toLocaleString()}</td>
              <td className="action-cell">
                <button
                  type="button"
                  disabled={loading || request.status !== "pending"}
                  onClick={() => onReview(request.id, "approved")}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="danger-button"
                  disabled={loading || request.status !== "pending"}
                  onClick={() => onReview(request.id, "rejected")}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
