import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "../App.css";

function Dashboard() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

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
                        {(firstName?.[0] || "U").toUpperCase()}
                        {(lastName?.[0] || "").toUpperCase()}
                    </div>
                    <div className="profile-copy">
                        <strong>{firstName} {lastName}</strong>
                        <span>{role || "User"}</span>
                    </div>
                    <Button
                        variant="link"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </header>

            <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
                <nav aria-label="Dashboard navigation">
                    <button type="button" className="sidebar-link active">
                        <span aria-hidden="true">⌂</span>
                        Dashboard
                    </button>
                    <button type="button" className="sidebar-link">
                        <span aria-hidden="true">▦</span>
                        Venues
                    </button>
                    <button type="button" className="sidebar-link">
                        <span aria-hidden="true">◫</span>
                        Events
                    </button>
                    <button type="button" className="sidebar-link">
                        <span aria-hidden="true">□</span>
                        Bookings
                    </button>
                </nav>
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
                <Container>
                    <div className="dashboard-heading mb-4">
                        <div>
                            <p className="eyebrow">Overview</p>
                            <h1>Dashboard</h1>
                            <p className="text-muted mb-0">
                                Welcome back, {firstName} {lastName}
                            </p>
                        </div>
                    </div>

                    <Card className="dashboard-card mb-4">
                        <Card.Body>

                    <h5 className="mb-3">
                        Account Information
                    </h5>

                    <Row>

                        <Col md={4}>
                            <strong>Name</strong>
                            <p>
                                {firstName} {lastName}
                            </p>
                        </Col>

                        <Col md={4}>
                            <strong>Email</strong>
                            <p>
                                {email}
                            </p>
                        </Col>

                        <Col md={4}>
                            <strong>Role</strong>
                            <p>
                                {role || "User"}
                            </p>
                        </Col>

                    </Row>

                    </Card.Body>
                    </Card>

            {/* Main dashboard cards */}
                    <h4 className="section-title mb-3">
                        DIBA Bookings
                    </h4>

                    <Row>

                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <h5>Venues</h5>

                            <p className="text-muted">
                                View available conference centre
                                venues and their features.
                            </p>

                            <Button
                                variant="primary"
                                disabled
                            >
                                Coming Soon
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <h5>Events</h5>

                            <p className="text-muted">
                                Create and manage your events.
                            </p>

                            <Button
                                variant="primary"
                                disabled
                            >
                                Coming Soon
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <h5>Bookings</h5>

                            <p className="text-muted">
                                View and manage your venue bookings.
                            </p>

                            <Button
                                variant="primary"
                                disabled
                            >
                                Coming Soon
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                    </Row>
                </Container>
            </main>
        </div>
    );
}

export default Dashboard;