import { Link, useLocation } from "react-router-dom";

export default function Layout({ title, auth, onLogout, children }) {
  const location = useLocation();
  const isAdmin = auth?.user?.role === "admin";

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <h1>{title}</h1>
          {auth?.user ? (
            <p className="muted">
              Signed in as {auth.user.name} ({auth.user.role})
            </p>
          ) : null}
        </div>
        <div className="topbar-actions">
          <nav className="nav-links">
            {!isAdmin && (
              <Link className={location.pathname === "/dashboard" ? "active" : ""} to="/dashboard">
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link className={location.pathname === "/admin" ? "active" : ""} to="/admin">
                Admin Panel
              </Link>
            )}
          </nav>
          <button type="button" className="secondary-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="content-card">{children}</main>
    </div>
  );
}
