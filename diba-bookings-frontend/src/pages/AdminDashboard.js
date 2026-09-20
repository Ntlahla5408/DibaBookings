import { Card, Col, Row } from "react-bootstrap";
import DashboardLayout from "../components/DashboardLayout";

function AdminDashboard() {
    const navigationItems = [
        { label: "Dashboard", icon: "⌂", active: true },
        { label: "Manage Users", icon: "♙" },
        { label: "Roles & Access", icon: "⌑" },
        { label: "System Reports", icon: "▤" },
    ];

    return (
        <DashboardLayout
            eyebrow="Administration"
            title="Admin Dashboard"
            navigationItems={navigationItems}
        >
            <h4 className="section-title mb-3">User Management</h4>
            <Row>
                <Col md={4} className="mb-3"><Card className="h-100"><Card.Body><h5>All Users</h5><p className="text-muted">View and search registered DibaBookings users.</p></Card.Body></Card></Col>
                <Col md={4} className="mb-3"><Card className="h-100"><Card.Body><h5>Roles & Access</h5><p className="text-muted">Assign roles and control access to the platform.</p></Card.Body></Card></Col>
                <Col md={4} className="mb-3"><Card className="h-100"><Card.Body><h5>Reports</h5><p className="text-muted">Review platform activity and user statistics.</p></Card.Body></Card></Col>
            </Row>
        </DashboardLayout>
    );
}

export default AdminDashboard;
