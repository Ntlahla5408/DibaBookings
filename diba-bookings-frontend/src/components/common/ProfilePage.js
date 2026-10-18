import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { getMyProfile, updateMyProfile } from "../../services/profileService";

const emptyProfile = {
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    role: ""
};

function getErrorMessage(error) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) return data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.title === "string") return data.title;

    if (!error.response) {
        return "Could not connect to DIBA Bookings. Check your connection and try again.";
    }

    return "Could not save your profile. Check the details and try again.";
}

function ProfilePage() {
    const [profile, setProfile] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            setLoading(true);
            setLoadError("");

            try {
                const response = await getMyProfile();
                if (active) {
                    setProfile({
                        ...emptyProfile,
                        ...response.data
                    });
                }
            } catch (error) {
                if (active) setLoadError(getErrorMessage(error));
            } finally {
                if (active) setLoading(false);
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    const updateField = (event) => {
        const { name, value } = event.target;
        setProfile((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const firstName = profile.firstName.trim();
        const lastName = profile.lastName.trim();
        const email = profile.email.trim();

        if (!firstName || !lastName || !email) {
            toast.error("First name, surname and email are required.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Enter a valid email address.");
            return;
        }

        setSaving(true);

        try {
            await updateMyProfile({ firstName, lastName, email });

            const savedProfile = { ...profile, firstName, lastName, email };
            setProfile(savedProfile);
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("lastName", lastName);
            localStorage.setItem("email", email);

            toast.success("Profile updated.");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5" role="status">
                <Spinner animation="border" />
                <span className="ms-2">Loading profile…</span>
            </div>
        );
    }

    if (loadError) {
        return (
            <Alert variant="danger" className="mb-0">
                <div className="fw-semibold mb-2">Profile unavailable</div>
                <div>{loadError}</div>
                <Button className="mt-3" variant="outline-danger" onClick={() => window.location.reload()}>
                    Try again
                </Button>
            </Alert>
        );
    }

    return (
        <Row className="g-4">
            <Col xs={12} xl={8}>
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                        <h2 className="h5 mb-4">Personal information</h2>
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col xs={12} md={6}>
                                    <Form.Group controlId="profileFirstName">
                                        <Form.Label>First name</Form.Label>
                                        <Form.Control
                                            name="firstName"
                                            value={profile.firstName}
                                            onChange={updateField}
                                            autoComplete="given-name"
                                            maxLength={100}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group controlId="profileLastName">
                                        <Form.Label>Surname</Form.Label>
                                        <Form.Control
                                            name="lastName"
                                            value={profile.lastName}
                                            onChange={updateField}
                                            autoComplete="family-name"
                                            maxLength={100}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group controlId="profileEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={updateField}
                                            autoComplete="email"
                                            maxLength={254}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group controlId="profileRole">
                                        <Form.Label>Account role</Form.Label>
                                        <Form.Control value={profile.role || "Not assigned"} readOnly />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end mt-4">
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <><Spinner size="sm" className="me-2" />Saving…</>
                                    ) : "Save changes"}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col xs={12} xl={4}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                        <h2 className="h5 mb-3">Account</h2>
                        <div className="small text-secondary mb-1">User ID</div>
                        <div className="font-monospace small text-break">{profile.userId || "Unavailable"}</div>
                        <hr />
                        <div className="small text-secondary mb-1">Role</div>
                        <div className="fw-semibold">{profile.role || "Not assigned"}</div>
                        <p className="small text-secondary mt-3 mb-0">
                            Your role is managed by the system administrator and cannot be changed here.
                        </p>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default ProfilePage;
