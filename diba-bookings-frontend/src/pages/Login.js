import { useState } from "react";
import { Form, Button, Card, Container, Row, Col, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/authService";

function getErrorMessage(error, fallback) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    if (data?.errors) return Object.values(data.errors).flat().join(" ");
    if (!error.response) return "Cannot reach DIBA Bookings. Check your connection and try again.";
    return fallback;
}

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => ({ ...current, [name]: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errors = {};
        if (!formData.email.trim()) errors.email = "Enter your email address.";
        if (!formData.password) errors.password = "Enter your password.";
        if (Object.keys(errors).length) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});
        setLoading(true);
        try {
            // Preserve the existing login request and response contract.
            const data = await loginUser({ email: formData.email.trim(), password: formData.password });
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("firstName", data.firstName);
            localStorage.setItem("lastName", data.lastName);
            localStorage.setItem("email", data.email);
            localStorage.setItem("role", data.role);
            toast.success("Login successful.");
            navigate("/dashboard");
        } catch (error) {
            toast.error(getErrorMessage(error, "Invalid email or password."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <Container className="auth-container">
                <Row className="g-0 auth-layout">
                    <Col lg={5} className="auth-intro">
                        <Link to="/" className="auth-brand" aria-label="DIBA Bookings home">
                            <span className="auth-brand-mark">D</span>
                            <span>DIBA <strong>BOOKINGS</strong></span>
                        </Link>
                        <div className="auth-intro-copy">
                            <span className="auth-eyebrow">NELSON MANDELA UNIVERSITY</span>
                            <h1>Make room for what matters.</h1>
                            <p>Manage your conference venue bookings in one place.</p>
                        </div>
                        <div className="auth-intro-footer">Conference Centre · Venue Bookings</div>
                    </Col>
                    <Col lg={7} className="auth-form-panel">
                        <Card className="auth-card border-0">
                            <Card.Body>
                                <div className="auth-heading">
                                    <span className="auth-step">WELCOME BACK</span>
                                    <h2>Sign in</h2>
                                    <p>Enter your account details to continue.</p>
                                </div>
                                <Form onSubmit={handleSubmit} noValidate>
                                    <Form.Group className="auth-field">
                                        <Form.Label htmlFor="login-email">Email address</Form.Label>
                                        <Form.Control id="login-email" type="email" name="email" autoComplete="email"
                                            value={formData.email} onChange={handleChange} placeholder="you@example.com"
                                            isInvalid={Boolean(fieldErrors.email)} required />
                                        <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="auth-field">
                                        <Form.Label htmlFor="login-password">Password</Form.Label>
                                        <InputGroup hasValidation>
                                            <Form.Control id="login-password" type={showPassword ? "text" : "password"}
                                                name="password" autoComplete="current-password" value={formData.password}
                                                onChange={handleChange} placeholder="Enter your password"
                                                isInvalid={Boolean(fieldErrors.password)} required />
                                            <Button type="button" variant="outline-secondary" className="auth-password-toggle"
                                                onClick={() => setShowPassword((visible) => !visible)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</Button>
                                            <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                    <div className="auth-forgot-row"><Link to="/forgot-password">Forgot password?</Link></div>
                                    <Button type="submit" className="auth-submit w-100" disabled={loading}>
                                        {loading ? "Signing in…" : "Sign in"}
                                    </Button>
                                </Form>
                                <div className="auth-switch">New to DIBA Bookings? <Link to="/register">Create an account</Link></div>
                                <Link to="/" className="auth-back-link">← Back to home</Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </main>
    );
}

export default Login;
