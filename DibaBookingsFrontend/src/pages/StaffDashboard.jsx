import { Card, Col, Row } from "react-bootstrap";
import DashboardLayout from "../components/DashboardLayout";

function StaffDashboard() {
    const navigationItems = [
        { label: "Dashboard", icon: "⌂", active: true },
        { label: "Manage Venues", icon: "▦" },
        { label: "Venue Availability", icon: "◫" },
        { label: "Bookings", icon: "□" },
    ];

    return (
        <DashboardLayout
            eyebrow="Operations"
            title="Staff Dashboard"
            navigationItems={navigationItems}
        >
            <h4 className="section-title mb-3">Venue Management</h4>
            <Row>
                <Col md={4} className="mb-3"><Card className="h-100"><Card.Body><h5>Manage Venues</h5><p className="text-muted">Add, update, and maintain venue information.</p></Card.Body></Card></Col>
                <Col md={4} className="mb-3"><Card className="h-100"><Card.Body><h5>Availability</h5><p className="text-muted">Keep venue availability and features up to date.</p></Card.Body></Card></Col>
                <Col md={4} className="mb-3"><Card className="h-100"><Card.Body><h5>Bookings</h5><p className="text-muted">Process and coordinate customer venue bookings.</p></Card.Body></Card></Col>
            </Row>
        </DashboardLayout>
    );
}

export default StaffDashboard;
