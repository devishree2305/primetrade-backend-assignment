export default function MessageBanner({ type = "info", message }) {
  if (!message) {
    return null;
  }

  return <div className={`message-banner ${type}`}>{message}</div>;
}
