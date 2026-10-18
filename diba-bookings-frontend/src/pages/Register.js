import { useState } from "react";
import { Form, Button, Card, Container, Row, Col, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../services/authService";

function getErrorMessage(error, fallback) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    if (data?.errors) return Object.values(data.errors).flat().join(" ");
    if (!error.response) return "Cannot reach DIBA Bookings. Check your connection and try again.";
    return fallback;
}

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const passwordRules = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /\d/.test(formData.password),
    };
    const passwordIsValid = Object.values(passwordRules).every(Boolean);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => ({ ...current, [name]: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = "Enter your first name.";
        if (!formData.lastName.trim()) errors.lastName = "Enter your last name.";
        if (!formData.email.trim()) errors.email = "Enter your email address.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = "Enter a valid email address.";
        if (!passwordIsValid) errors.password = "Meet all password requirements before continuing.";
        if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
        else if (confirmPassword !== formData.password) errors.confirmPassword = "Passwords do not match.";
        if (Object.keys(errors).length) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});
        setLoading(true);
        try {
            // Keep the current registration API fields; role remains server-assigned.
            await registerUser({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });
            toast.success("Account created. You can now sign in.");
            navigate("/login");
        } catch (error) {
            toast.error(getErrorMessage(error, "Registration failed. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page auth-page-register">
            <Container className="auth-container">
                <Row className="g-0 auth-layout auth-layout-centered">
                    <Col xs={12} className="auth-form-panel">
                        <Card className="auth-card auth-card-register border-0">
                            <Card.Body>
                                <div className="auth-heading">
                                    <span className="auth-step">GET STARTED</span>
                                    <h2>Create your account</h2>
                                    <p>Register as an event organiser.</p>
                                </div>
                                <Form onSubmit={handleSubmit} noValidate>
                                    <Row className="g-3">
                                        <Col sm={6}>
                                            <Form.Group className="auth-field">
                                                <Form.Label htmlFor="register-first-name">First name</Form.Label>
                                                <Form.Control id="register-first-name" type="text" name="firstName"
                                                    autoComplete="given-name" value={formData.firstName} onChange={handleChange}
                                                    placeholder="First name" isInvalid={Boolean(fieldErrors.firstName)} required />
                                                <Form.Control.Feedback type="invalid">{fieldErrors.firstName}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="auth-field">
                                                <Form.Label htmlFor="register-last-name">Last name</Form.Label>
                                                <Form.Control id="register-last-name" type="text" name="lastName"
                                                    autoComplete="family-name" value={formData.lastName} onChange={handleChange}
                                                    placeholder="Last name" isInvalid={Boolean(fieldErrors.lastName)} required />
                                                <Form.Control.Feedback type="invalid">{fieldErrors.lastName}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="auth-field">
                                        <Form.Label htmlFor="register-email">Email address</Form.Label>
                                        <Form.Control id="register-email" type="email" name="email" autoComplete="email"
                                            value={formData.email} onChange={handleChange} placeholder="you@example.com"
                                            isInvalid={Boolean(fieldErrors.email)} required />
                                        <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="auth-field">
                                        <Form.Label htmlFor="register-password">Password</Form.Label>
                                        <InputGroup hasValidation>
                                            <Form.Control id="register-password" type={showPassword ? "text" : "password"}
                                                name="password" autoComplete="new-password" value={formData.password}
                                                onChange={handleChange} placeholder="Create a strong password"
                                                isInvalid={Boolean(fieldErrors.password)} required />
                                            <Button type="button" variant="outline-secondary" className="auth-password-toggle"
                                                onClick={() => setShowPassword((visible) => !visible)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</Button>
                                            <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
                                        </InputGroup>
                                        <div className="auth-password-help" aria-live="polite">
                                            <span className={passwordRules.length ? "rule-met" : ""}>{passwordRules.length ? "✓" : "○"} 8+ characters</span>
                                            <span className={passwordRules.uppercase ? "rule-met" : ""}>{passwordRules.uppercase ? "✓" : "○"} Uppercase</span>
                                            <span className={passwordRules.lowercase ? "rule-met" : ""}>{passwordRules.lowercase ? "✓" : "○"} Lowercase</span>
                                            <span className={passwordRules.number ? "rule-met" : ""}>{passwordRules.number ? "✓" : "○"} Number</span>
                                        </div>
                                    </Form.Group>
                                    <Form.Group className="auth-field">
                                        <Form.Label htmlFor="register-confirm-password">Confirm password</Form.Label>
                                        <InputGroup hasValidation>
                                            <Form.Control id="register-confirm-password"
                                                type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
                                                value={confirmPassword}
                                                onChange={(event) => {
                                                    setConfirmPassword(event.target.value);
                                                    setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
                                                }}
                                                placeholder="Enter your password again"
                                                isInvalid={Boolean(fieldErrors.confirmPassword)} required />
                                            <Button type="button" variant="outline-secondary" className="auth-password-toggle"
                                                onClick={() => setShowConfirmPassword((visible) => !visible)}
                                                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                                                aria-pressed={showConfirmPassword}>{showConfirmPassword ? "Hide" : "Show"}</Button>
                                            <Form.Control.Feedback type="invalid">{fieldErrors.confirmPassword}</Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                    <Button type="submit" className="auth-submit w-100" disabled={loading}>
                                        {loading ? "Creating account…" : "Create account"}
                                    </Button>
                                </Form>
                                <div className="auth-switch">Already registered? <Link to="/login">Sign in</Link></div>
                                <Link to="/" className="auth-back-link">← Back to home</Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </main>
    );
}

export default Register;
