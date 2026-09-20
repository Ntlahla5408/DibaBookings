import { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../App.css";

function DashboardLayout({ children, title, eyebrow, navigationItems }) {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const firstName = localStorage.getItem("firstName") || "User";
    const lastName = localStorage.getItem("lastName") || "";
    const role = localStorage.getItem("role") || "User";

    const handleLogout = () => {
        ["token", "userId", "firstName", "lastName", "email", "role"]
            .forEach((key) => localStorage.removeItem(key));

        toast.success("Logged out successfully.");
        navigate("/login");
    };

    return (
        <div className="dashboard-shell">
            <header className="dashboard-topbar">
                <div className="dashboard-brand-group">
                    <button
                        type="button"
                        className="menu-toggle"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isSidebarOpen}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                    <span className="dashboard-brand">DibaBookings</span>
                </div>

                <div className="dashboard-profile">
                    <div className="profile-avatar" aria-hidden="true">
                        {(firstName[0] || "U").toUpperCase()}
                        {(lastName[0] || "").toUpperCase()}
                    </div>
                    <div className="profile-copy">
                        <strong>{firstName} {lastName}</strong>
                        <span>{role}</span>
                    </div>
                </div>
            </header>

            <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
                <nav aria-label="Dashboard navigation">
                    {navigationItems.map((item) => (
                        <button
                            type="button"
                            className={`sidebar-link ${item.active ? "active" : ""}`}
                            key={item.label}
                            onClick={item.onClick}
                        >
                            <span aria-hidden="true">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <Button
                    variant="link"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <span aria-hidden="true">↪</span>
                    Logout
                </Button>
            </aside>

            {isSidebarOpen && (
                <button
                    type="button"
                    className="sidebar-backdrop"
                    aria-label="Close navigation menu"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="dashboard-content">
                <div className="container">
                    <div className="dashboard-heading mb-4">
                        <p className="eyebrow">{eyebrow}</p>
                        <h1>{title}</h1>
                        <p className="text-muted mb-0">
                            Welcome back, {firstName} {lastName}
                        </p>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;
