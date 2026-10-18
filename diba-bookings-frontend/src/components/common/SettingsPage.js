import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { requestPasswordReset } from "../../services/authService";
import { getMyProfile } from "../../services/profileService";

const defaultPageOptions = [
    { value: "dashboard", label: "Dashboard" },
    { value: "bookings", label: "My Bookings" },
    { value: "events", label: "My Events" }
];

function SettingsPage() {
    const [defaultPage, setDefaultPage] = useState(() => {
        const savedPage = localStorage.getItem("organizerDefaultView");
        return defaultPageOptions.some((option) => option.value === savedPage)
            ? savedPage
            : "dashboard";
    });
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [sendingReset, setSendingReset] = useState(false);
    const [resetRequested, setResetRequested] = useState(false);

    const savePreferences = (event) => {
        event.preventDefault();
        setSavingPreferences(true);

        try {
            localStorage.setItem("organizerDefaultView", defaultPage);
            toast.success("Settings saved. Your start page will apply next time you sign in.");
        } catch {
            toast.error("Settings could not be saved in this browser.");
        } finally {
            setSavingPreferences(false);
        }
    };

    const sendPasswordReset = async () => {
        setSendingReset(true);
        setResetRequested(false);

        try {
            let email = localStorage.getItem("email");

            if (!email) {
                const response = await getMyProfile();
                email = response.data?.email;
            }

            if (!email) {
                toast.error("Your account email could not be found. Check your profile and try again.");
                return;
            }

            await requestPasswordReset({ email });
            setResetRequested(true);
        } catch (error) {
            const message = typeof error.response?.data === "string"
                ? error.response.data
                : error.response?.data?.message;

            toast.error(message || (!error.response
                ? "Cannot reach DIBA Bookings. Check your connection and try again."
                : "Could not request a password reset. Please try again."));
        } finally {
            setSendingReset(false);
        }
    };

    return (
        <Row className="g-4">
            <Col xs={12} xl={8}>
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                        <h2 className="h5 mb-4">Dashboard preferences</h2>
                        <Form onSubmit={savePreferences}>
                            <Form.Group controlId="organizerDefaultPage">
                                <Form.Label>Start page</Form.Label>
                                <Form.Select
                                    value={defaultPage}
                                    onChange={(event) => setDefaultPage(event.target.value)}
                                >
                                    {defaultPageOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <div className="d-flex justify-content-end mt-4">
                                <Button type="submit" disabled={savingPreferences}>
                                    {savingPreferences ? "Saving…" : "Save settings"}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>

            <Col xs={12} xl={4}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                        <h2 className="h5 mb-3">Password & security</h2>
                        <p className="mb-3">Request a password reset link for your account email.</p>
                        <Button
                            variant="outline-primary"
                            onClick={sendPasswordReset}
                            disabled={sendingReset}
                        >
                            {sendingReset ? (
                                <><Spinner size="sm" className="me-2" />Sending…</>
                            ) : "Send password reset link"}
                        </Button>
                        {resetRequested && (
                            <Alert variant="success" className="mt-3 mb-0" role="status">
                                If your account is active, a reset link will be sent to your email. Check your inbox and spam folder.
                            </Alert>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default SettingsPage;
