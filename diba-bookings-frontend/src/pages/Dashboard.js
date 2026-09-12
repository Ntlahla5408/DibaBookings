import { useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";

function Dashboard() {
    const navigate = useNavigate();

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
        <Container className="mt-5">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1>Dashboard</h1>

                    <p className="text-muted mb-0">
                        Welcome back, {firstName} {lastName}
                    </p>
                </div>

                <Button
                    variant="outline-danger"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>

            {/* User information */}
            <Card className="shadow-sm mb-4">
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
            <h4 className="mb-3">
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
    );
}

export default Dashboard;