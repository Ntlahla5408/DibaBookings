import { useState } from "react";
import { Form, Button, Card, Container, Row, Col, InputGroup } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../services/authService";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const passwordRules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
    };
    const passwordIsValid = Object.values(passwordRules).every(Boolean);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        if (!token) {
            setErrorMessage("This password reset link is missing or invalid. Request a new one.");
            return;
        }
        if (!passwordIsValid) {
            setErrorMessage("Use at least 8 characters, including an uppercase letter, a lowercase letter and a number.");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Your passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await resetPassword({ token, newPassword: password });
            toast.success(response.message || "Password reset. You can now sign in.");
            navigate("/login");
        } catch (error) {
            const data = error.response?.data;
            setErrorMessage(typeof data === "string" ? data : data?.message ||
                (!error.response ? "Cannot reach DIBA Bookings. Check your connection and try again." :
                    "This password reset link is invalid or has expired. Request a new one."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <Container className="auth-container">
                <Row className="g-0 auth-layout auth-layout-centered">
                    <Col xs={12} className="auth-form-panel">
                        <Card className="auth-card border-0">
                            <Card.Body>
                                <div className="auth-heading">
                                    <span className="auth-step">SET NEW PASSWORD</span>
                                    <h2>Reset password</h2>
                                    <p>Choose a password you have not used here before.</p>
                                </div>
                                {!token ? (
                                    <div className="auth-form-error" role="alert">
                                        This link is missing a reset token. <Link to="/forgot-password">Request a new link</Link>.
                                    </div>
                                ) : (
                                    <Form onSubmit={handleSubmit} noValidate>
                                        <Form.Group className="auth-field">
                                            <Form.Label htmlFor="reset-password">New password</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control id="reset-password"
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="new-password" value={password}
                                                    onChange={(event) => setPassword(event.target.value)}
                                                    placeholder="Create a strong password" required />
                                                <Button type="button" variant="outline-secondary" className="auth-password-toggle"
                                                    onClick={() => setShowPassword((visible) => !visible)}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</Button>
                                            </InputGroup>
                                            <div className="auth-password-help" aria-live="polite">
                                                <span className={passwordRules.length ? "rule-met" : ""}>{passwordRules.length ? "✓" : "○"} 8+ characters</span>
                                                <span className={passwordRules.uppercase ? "rule-met" : ""}>{passwordRules.uppercase ? "✓" : "○"} Uppercase</span>
                                                <span className={passwordRules.lowercase ? "rule-met" : ""}>{passwordRules.lowercase ? "✓" : "○"} Lowercase</span>
                                                <span className={passwordRules.number ? "rule-met" : ""}>{passwordRules.number ? "✓" : "○"} Number</span>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="auth-field">
                                            <Form.Label htmlFor="reset-confirm-password">Confirm new password</Form.Label>
                                            <InputGroup hasValidation>
                                                <Form.Control id="reset-confirm-password"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    autoComplete="new-password" value={confirmPassword}
                                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                                    placeholder="Enter the new password again" required />
                                                <Button type="button" variant="outline-secondary" className="auth-password-toggle"
                                                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                                                    aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                                                    aria-pressed={showConfirmPassword}>{showConfirmPassword ? "Hide" : "Show"}</Button>
                                            </InputGroup>
                                        </Form.Group>
                                        {errorMessage && <div className="auth-form-error" role="alert">{errorMessage}</div>}
                                        <Button type="submit" className="auth-submit w-100" disabled={loading}>
                                            {loading ? "Updating password…" : "Reset password"}
                                        </Button>
                                    </Form>
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

export default ResetPassword;
