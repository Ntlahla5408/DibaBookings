import { Card, Col, Row } from "react-bootstrap";
import DashboardLayout from "../components/DashboardLayout";

function UserDashboard() {
    const navigationItems = [
        { label: "Dashboard", icon: "⌂", active: true },
        { label: "Venues", icon: "▦" },
        { label: "Events", icon: "◫" },
        { label: "My Bookings", icon: "□" },
    ];

    return (
        <DashboardLayout
            eyebrow="Personal workspace"
            title="User Dashboard"
            navigationItems={navigationItems}
        >
            <Card className="dashboard-card mb-4">
                <Card.Body>
                    <h5 className="mb-3">Account Information</h5>
                    <Row>
                        <Col md={4}><strong>Name</strong><p>{localStorage.getItem("firstName")} {localStorage.getItem("lastName")}</p></Col>
                        <Col md={4}><strong>Email</strong><p>{localStorage.getItem("email")}</p></Col>
                        <Col md={4}><strong>Role</strong><p>{localStorage.getItem("role") || "User"}</p></Col>
                    </Row>
                </Card.Body>
            </Card>

            <h4 className="section-title mb-3">My DIBA Bookings</h4>
            <Row>
                <Col md={4} className="mb-3">
                    <Card className="h-100"><Card.Body><h5>Find a Venue</h5><p className="text-muted">Browse available conference centre venues.</p></Card.Body></Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="h-100"><Card.Body><h5>Plan an Event</h5><p className="text-muted">Create and manage your upcoming events.</p></Card.Body></Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="h-100"><Card.Body><h5>My Bookings</h5><p className="text-muted">Review and manage your venue bookings.</p></Card.Body></Card>
                </Col>
            </Row>
        </DashboardLayout>
    );
}

export default UserDashboard;
