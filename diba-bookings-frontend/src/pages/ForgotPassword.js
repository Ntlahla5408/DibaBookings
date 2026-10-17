import { useState } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { requestPasswordReset } from "../services/authService";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [emailError, setEmailError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())) {
            setEmailError("Enter a valid email address.");
            return;
        }
        setEmailError("");
        setLoading(true);
        try {
            const response = await requestPasswordReset({ email: email.trim() });
            setSubmitted(true);
            toast.success(response.message || "If an active account exists, a reset link will be sent.");
        } catch (error) {
            setErrorMessage(error.response?.data?.message ||
                (typeof error.response?.data === "string" ? error.response.data : "") ||
                (!error.response ? "Cannot reach DIBA Bookings. Check your connection and try again." : "Unable to process your request right now."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <Container className="auth-container">
                <Row className="g-0 auth-layout auth-layout-compact">
                    <Col lg={5} className="auth-intro">
                        <Link to="/" className="auth-brand" aria-label="DIBA Bookings home">
                            <span className="auth-brand-mark">D</span>
                            <span>DIBA <strong>BOOKINGS</strong></span>
                        </Link>
                        <div className="auth-intro-copy">
                            <span className="auth-eyebrow">ACCOUNT SUPPORT</span>
                            <h1>Let’s get you back in.</h1>
                            <p>Request a secure password reset link for your DIBA Bookings account.</p>
                        </div>
                        <div className="auth-intro-footer">Your account, protected.</div>
                    </Col>
                    <Col lg={7} className="auth-form-panel">
                        <Card className="auth-card border-0">
                            <Card.Body>
                                <div className="auth-heading">
                                    <span className="auth-step">PASSWORD RECOVERY</span>
                                    <h2>{submitted ? "Check your email" : "Forgot your password?"}</h2>
                                    <p>{submitted
                                        ? "If an active account matches that email, a reset link will arrive shortly. Check your spam folder too."
                                        : "Enter the email address associated with your account."}</p>
                                </div>
                                {!submitted ? (
                                    <Form onSubmit={handleSubmit} noValidate>
                                        <Form.Group className="auth-field">
                                            <Form.Label htmlFor="forgot-email">Email address</Form.Label>
                                            <Form.Control id="forgot-email" type="email" autoComplete="email"
                                                value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(""); }}
                                                placeholder="you@example.com" isInvalid={Boolean(emailError)} required />
                                            <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
                                        </Form.Group>
                                        {errorMessage && <div className="auth-form-error" role="alert">{errorMessage}</div>}
                                        <Button type="submit" className="auth-submit w-100" disabled={loading || !email.trim()}>
                                            {loading ? "Sending request…" : "Send reset link"}
                                        </Button>
                                    </Form>
                                ) : (
                                    <div className="auth-success-note" role="status">
                                        For security, this page does not reveal whether an email address is registered.
                                    </div>
                                )}
                                <Link to="/login" className="auth-back-link">← Back to sign in</Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </main>
    );
}

export default ForgotPassword;
